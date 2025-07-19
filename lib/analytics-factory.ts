/**
 * Analytics service factory for dependency injection and testing
 */

import { AnalyticsDB, type AnalyticsEvent } from './analytics-db'
import { AnalyticsAPI } from './analytics-api'
import { getAnalyticsConfig, type AnalyticsConfig } from './analytics-config'

export interface IAnalyticsStorage {
    isAvailable(): boolean
    storeBatchEvents(events: AnalyticsEvent[]): Promise<boolean>
}

export interface IAnalyticsAPI {
    trackEvents(events: AnalyticsEvent[]): Promise<{ success: boolean; stored?: boolean }>
}

export interface IAnalyticsService {
    trackEvent(type: string, details?: Record<string, unknown>): Promise<void>
    batchEvents(events: AnalyticsEvent[]): Promise<void>
    getSessionId(): string
    isEnabled(): boolean
    setEnabled(enabled: boolean): void
    getQueueSize(): number
    destroy(): void
}

export class AnalyticsServiceFactory {
    static create(
        storage: IAnalyticsStorage = AnalyticsDB,
        api: IAnalyticsAPI = AnalyticsAPI,
        config: AnalyticsConfig = getAnalyticsConfig()
    ): IAnalyticsService {
        return new AnalyticsServiceImpl(storage, api, config)
    }

    static createMock(): IAnalyticsService {
        return new MockAnalyticsService()
    }
}

class AnalyticsServiceImpl implements IAnalyticsService {
    private eventQueue: AnalyticsEvent[] = []
    private sessionId: string = ''
    private flushTimer: NodeJS.Timeout | null = null
    private isOnline: boolean = true

    constructor(
        private storage: IAnalyticsStorage,
        private api: IAnalyticsAPI,
        private config: AnalyticsConfig
    ) {
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
        window.addEventListener('online', () => { this.isOnline = true; this.flushQueue() })
        window.addEventListener('offline', () => { this.isOnline = false })
        window.addEventListener('beforeunload', () => this.flushQueue(true))
    }

    private startFlushTimer(): void {
        this.stopFlushTimer()
        this.flushTimer = setInterval(() => this.flushQueue(), this.config.flushInterval)
    }

    private stopFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer)
            this.flushTimer = null
        }
    }

    private respectsPrivacy(): boolean {
        if (typeof window === 'undefined') return false
        if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') return false

        try {
            const settings = localStorage.getItem('settings_privacy')
            if (settings) {
                const privacySettings = JSON.parse(settings)
                if (privacySettings.shareAnalytics === false) return false
            }
        } catch {
            return false
        }

        return this.config.enabled
    }

    private async sendEvents(events: AnalyticsEvent[], retryCount = 0): Promise<boolean> {
        if (events.length === 0) return false

        try {
            if (this.storage.isAvailable()) {
                const success = await this.storage.storeBatchEvents(events)
                if (success) return true
            }

            if (!this.isOnline) return false

            const result = await this.api.trackEvents(events)
            return result.success && result.stored !== false
        } catch (err) {
            if (retryCount < this.config.maxRetries) {
                const delay = this.config.retryDelay * Math.pow(2, retryCount)
                await new Promise(resolve => setTimeout(resolve, delay))
                return this.sendEvents(events, retryCount + 1)
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
            this.eventQueue = this.eventQueue.slice(eventsToSend.length)
        } else if (!success && !immediate) {
            this.eventQueue.unshift(...eventsToSend)
        }
    }

    async trackEvent(type: string, details: Record<string, unknown> = {}): Promise<void> {
        if (!this.respectsPrivacy() || typeof window === 'undefined') return

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

        if (this.eventQueue.length >= this.config.batchSize) {
            await this.flushQueue()
        }
    }

    async batchEvents(events: AnalyticsEvent[]): Promise<void> {
        if (!this.respectsPrivacy()) return

        const sanitizedEvents = events.map(event => ({
            ...event,
            details: this.sanitizeDetails(event.details || {}),
            sessionId: this.sessionId,
        }))

        this.eventQueue.push(...sanitizedEvents)
        await this.flushQueue()
    }

    private sanitizeDetails(details: Record<string, unknown>): Record<string, string | number | boolean> {
        // Implementation similar to existing sanitization logic
        const sanitized: Record<string, string | number | boolean> = {}
        const piiKeys = ['email', 'phone', 'address', 'name', 'ip', 'userId', 'user_id', 'password', 'token']

        Object.keys(details).forEach(key => {
            if (piiKeys.some(piiKey => key.toLowerCase().includes(piiKey.toLowerCase()))) return

            const value = details[key]
            if (typeof value === 'string') {
                const sanitizedString = value.length > this.config.maxStringLength
                    ? value.substring(0, this.config.maxStringLength) + '...'
                    : value
                sanitized[key] = sanitizedString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[script removed]')
            } else if (typeof value === 'number' || typeof value === 'boolean') {
                sanitized[key] = value
            }
        })

        return sanitized
    }

    getSessionId(): string {
        return this.sessionId
    }

    isEnabled(): boolean {
        return this.respectsPrivacy()
    }

    setEnabled(enabled: boolean): void {
        this.config.enabled = enabled
        if (!enabled) this.eventQueue = []
    }

    getQueueSize(): number {
        return this.eventQueue.length
    }

    destroy(): void {
        this.stopFlushTimer()
        this.eventQueue = []
    }
}

class MockAnalyticsService implements IAnalyticsService {
    private sessionId = 'mock-session'
    private enabled = true
    private queueSize = 0

    async trackEvent(): Promise<void> {
        this.queueSize++
    }

    async batchEvents(events: AnalyticsEvent[]): Promise<void> {
        this.queueSize += events.length
    }

    getSessionId(): string {
        return this.sessionId
    }

    isEnabled(): boolean {
        return this.enabled
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled
    }

    getQueueSize(): number {
        return this.queueSize
    }

    destroy(): void {
        this.queueSize = 0
    }
}
