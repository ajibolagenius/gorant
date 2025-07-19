import { AnalyticsDB, type AnalyticsEvent } from './analytics-db'
import { AnalyticsAPI } from './analytics-api'
import { getAnalyticsConfig, type AnalyticsConfig } from './analytics-config'
import { analyticsPrivacy, validatePrivacyCompliance } from './analytics-privacy'
import { analyticsPerformance } from './analytics-performance'

export type { AnalyticsEvent }

class AnalyticsService {
    private config: AnalyticsConfig = getAnalyticsConfig()
    private maxStringLength: number = 500

    private eventQueue: AnalyticsEvent[] = []
    private sessionId: string = ''
    private userId: string = ''
    private flushTimer: NodeJS.Timeout | null = null
    private isOnline: boolean = true
    private lastActivityTime: number = Date.now()

    constructor() {
        if (typeof window !== 'undefined') {
            this.sessionId = this.generateSessionId()
            this.userId = this.getOrCreateUserId()
            this.maxStringLength = this.config.maxStringLength
            this.setupEventListeners()
            this.startFlushTimer()
            this.startActivityTracking()
        }
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    }

    private getOrCreateUserId(): string {
        if (typeof window === 'undefined') return ''

        // Use existing anonymous ID function from utils
        let id = localStorage.getItem("anon_id")
        if (!id) {
            id = Math.random().toString(36).substring(2, 15)
            localStorage.setItem("anon_id", id)
        }
        return id
    }

    private startActivityTracking(): void {
        if (typeof window === 'undefined') return

        // Track user activity for online status
        const updateActivity = () => {
            this.lastActivityTime = Date.now()
            this.trackUserActivity()
        }

        // Listen for user interactions
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
        events.forEach(event => {
            window.addEventListener(event, updateActivity, { passive: true })
        })

        // Send periodic heartbeat to maintain online status
        setInterval(() => {
            if (Date.now() - this.lastActivityTime < 5 * 60 * 1000) { // 5 minutes
                this.trackUserActivity()
            }
        }, 30000) // Every 30 seconds
    }

    private async trackUserActivity(): Promise<void> {
        if (!this.respectsPrivacy()) return

        try {
            // Send user activity event to maintain online status
            await this.trackEvent('user_activity', {
                userId: this.userId,
                sessionId: this.sessionId,
                timestamp: Date.now(),
                isActive: true
            })
        } catch (error) {
            // Silent failure
            if (process.env.NODE_ENV === 'development') {
                console.warn('User activity tracking failed:', error)
            }
        }
    }

    private handleOnline = () => {
        this.isOnline = true
        this.flushQueue()
    }

    private handleOffline = () => {
        this.isOnline = false
    }

    private handleBeforeUnload = () => {
        this.flushQueue(true)
    }

    private setupEventListeners(): void {
        // Online/offline detection
        window.addEventListener('online', this.handleOnline)
        window.addEventListener('offline', this.handleOffline)

        // Flush queue before page unload
        window.addEventListener('beforeunload', this.handleBeforeUnload)
    }

    private startFlushTimer(): void {
        this.stopFlushTimer()

        this.flushTimer = setInterval(() => {
            this.flushQueue()
        }, this.config.flushInterval)
    }

    private stopFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer)
            this.flushTimer = null
        }
    }

    public destroy(): void {
        this.stopFlushTimer()
        this.eventQueue = []

        if (typeof window !== 'undefined') {
            window.removeEventListener('online', this.handleOnline)
            window.removeEventListener('offline', this.handleOffline)
            window.removeEventListener('beforeunload', this.handleBeforeUnload)
        }
    }

    private respectsPrivacy(): boolean {
        if (typeof window === 'undefined') return false

        // Check Do Not Track header
        if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') {
            return false
        }

        // Check user preferences from localStorage
        try {
            const settings = localStorage.getItem('settings_privacy')
            if (settings) {
                const privacySettings = JSON.parse(settings)
                if (privacySettings.shareAnalytics === false) {
                    return false
                }
            }
        } catch (err) {
            // If we can't read settings, err on the side of privacy
            return false
        }

        return this.config.enabled
    }

    private sanitizeDetails(details: Record<string, unknown>): Record<string, string | number | boolean> {
        const sanitized: Record<string, string | number | boolean> = {}

        // Remove any potential PII
        const piiKeys = ['email', 'phone', 'address', 'name', 'ip', 'userId', 'user_id', 'password', 'token']

        Object.keys(details).forEach(key => {
            // Skip PII keys
            if (piiKeys.some(piiKey => key.toLowerCase().includes(piiKey.toLowerCase()))) {
                return
            }

            const value = details[key]

            // Only include primitive types
            if (typeof value === 'string') {
                // Limit string lengths to prevent abuse
                let sanitizedString = value.length > this.maxStringLength
                    ? value.substring(0, this.maxStringLength) + '...'
                    : value
                // Remove potential script tags or suspicious content
                sanitizedString = sanitizedString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[script removed]')
                sanitized[key] = sanitizedString
            } else if (typeof value === 'number' || typeof value === 'boolean') {
                sanitized[key] = value
            }
        })

        return sanitized
    }

    private async sendEvents(events: AnalyticsEvent[], retryCount = 0): Promise<boolean> {
        if (events.length === 0) {
            return false
        }

        try {
            // Try direct database storage first if available
            if (AnalyticsDB.isAvailable()) {
                const success = await AnalyticsDB.storeBatchEvents(events)
                if (success) {
                    return true
                }
            }

            // Fallback to API endpoint if database is not available or fails
            if (!this.isOnline) {
                return false
            }

            const result = await AnalyticsAPI.trackEvents(events)
            return result.success && result.stored !== false
        } catch (err) {
            if (retryCount < this.config.maxRetries) {
                // Exponential backoff
                const delay = this.config.retryDelay * Math.pow(2, retryCount)
                await new Promise(resolve => setTimeout(resolve, delay))
                return this.sendEvents(events, retryCount + 1)
            }

            // Silent failure - don't throw errors for analytics
            if (process.env.NODE_ENV === 'development') {
                console.warn('Analytics failed to send events:', err)
            }
            return false
        }
    }

    private async flushQueue(immediate = false): Promise<void> {
        if (this.eventQueue.length === 0) return

        const eventsToSend = immediate
            ? [...this.eventQueue]
            : this.eventQueue.splice(0, this.config.batchSize)

        if (eventsToSend.length === 0) return

        const success = await this.sendEvents(eventsToSend)

        if (success && !immediate) {
            // Remove sent events from queue
            this.eventQueue = this.eventQueue.slice(eventsToSend.length)
        } else if (!success) {
            // Put events back in queue if sending failed (unless immediate flush)
            if (!immediate) {
                this.eventQueue.unshift(...eventsToSend)
            }
        }
    }

    public async trackEvent(type: string, details: Record<string, unknown> = {}): Promise<void> {
        if (!this.respectsPrivacy() || typeof window === 'undefined') {
            return
        }

        const event: AnalyticsEvent = {
            type,
            page: window.location.pathname,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId,
            details: this.sanitizeDetails(details),
            userAgent: navigator.userAgent,
            referrer: document.referrer || '',
            dnt: navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes',
        }

        this.eventQueue.push(event)

        // Flush immediately if queue is full
        if (this.eventQueue.length >= this.config.batchSize) {
            await this.flushQueue()
        }
    }

    public async batchEvents(events: AnalyticsEvent[]): Promise<void> {
        if (!this.respectsPrivacy()) return

        const sanitizedEvents = events.map(event => ({
            ...event,
            details: this.sanitizeDetails(event.details || {}),
            sessionId: this.sessionId,
            userId: this.userId,
        }))

        this.eventQueue.push(...sanitizedEvents)
        await this.flushQueue()
    }

    public getSessionId(): string {
        return this.sessionId
    }

    public getUserId(): string {
        return this.userId
    }

    public isEnabled(): boolean {
        return this.respectsPrivacy()
    }

    public setEnabled(enabled: boolean): void {
        this.config.enabled = enabled
        if (!enabled) {
            // Clear queue if disabled
            this.eventQueue = []
        }
    }

    public getQueueSize(): number {
        return this.eventQueue.length
    }
}

// Create singleton instance
const analyticsService = new AnalyticsService()

// Export the main functions for backward compatibility
export async function trackEvent(type: string, details: Record<string, unknown> = {}): Promise<void> {
    return analyticsService.trackEvent(type, details)
}

export function getSessionId(): string {
    return analyticsService.getSessionId()
}

export function getUserId(): string {
    return analyticsService.getUserId()
}

export function isAnalyticsEnabled(): boolean {
    return analyticsService.isEnabled()
}

export function setAnalyticsEnabled(enabled: boolean): void {
    analyticsService.setEnabled(enabled)
}

// Export the service instance for advanced usage
export { analyticsService }
