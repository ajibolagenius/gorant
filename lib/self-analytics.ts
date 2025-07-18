import { AnalyticsDB, type AnalyticsEvent } from './analytics-db'
import { AnalyticsAPI } from './analytics-api'

export type { AnalyticsEvent }

interface AnalyticsConfig {
    enabled: boolean
    batchSize: number
    flushInterval: number
    maxRetries: number
    retryDelay: number
}

class AnalyticsService {
    private config: AnalyticsConfig = {
        enabled: true,
        batchSize: 10,
        flushInterval: 5000, // 5 seconds
        maxRetries: 3,
        retryDelay: 1000, // 1 second
    }

    private eventQueue: AnalyticsEvent[] = []
    private sessionId: string = ''
    private flushTimer: NodeJS.Timeout | null = null
    private isOnline: boolean = true

    constructor() {
        if (typeof window !== 'undefined') {
            this.sessionId = this.generateSessionId()
            this.setupEventListeners()
            this.startFlushTimer()
        }
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    private setupEventListeners(): void {
        // Online/offline detection
        window.addEventListener('online', () => {
            this.isOnline = true
            this.flushQueue()
        })

        window.addEventListener('offline', () => {
            this.isOnline = false
        })

        // Flush queue before page unload
        window.addEventListener('beforeunload', () => {
            this.flushQueue(true)
        })
    }

    private startFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer)
        }

        this.flushTimer = setInterval(() => {
            this.flushQueue()
        }, this.config.flushInterval)
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

    private sanitizeDetails(details: Record<string, any>): Record<string, any> {
        const sanitized = { ...details }

        // Remove any potential PII
        const piiKeys = ['email', 'phone', 'address', 'name', 'ip', 'userId', 'user_id']
        piiKeys.forEach(key => {
            delete sanitized[key]
            delete sanitized[key.toLowerCase()]
            delete sanitized[key.toUpperCase()]
        })

        // Limit string lengths to prevent abuse
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'string' && sanitized[key].length > 500) {
                sanitized[key] = sanitized[key].substring(0, 500) + '...'
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

    public async trackEvent(type: string, details: Record<string, any> = {}): Promise<void> {
        if (!this.respectsPrivacy() || typeof window === 'undefined') {
            return
        }

        const event: AnalyticsEvent = {
            type,
            page: window.location.pathname,
            timestamp: Date.now(),
            sessionId: this.sessionId,
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
        }))

        this.eventQueue.push(...sanitizedEvents)
        await this.flushQueue()
    }

    public getSessionId(): string {
        return this.sessionId
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
export async function trackEvent(type: string, details: Record<string, any> = {}): Promise<void> {
    return analyticsService.trackEvent(type, details)
}

export function getSessionId(): string {
    return analyticsService.getSessionId()
}

export function isAnalyticsEnabled(): boolean {
    return analyticsService.isEnabled()
}

export function setAnalyticsEnabled(enabled: boolean): void {
    analyticsService.setEnabled(enabled)
}

// Export the service instance for advanced usage
export { analyticsService }
