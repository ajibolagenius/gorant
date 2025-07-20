import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { analyticsService, trackEvent, getSessionId, getUserId, isAnalyticsEnabled, setAnalyticsEnabled } from '../self-analytics'
import { AnalyticsDB } from '../analytics-db'
import { AnalyticsAPI } from '../analytics-api'

// Mock dependencies
vi.mock('../analytics-db', () => ({
    AnalyticsDB: {
        isAvailable: vi.fn(() => true),
        storeEvent: vi.fn(() => Promise.resolve(true)),
        storeBatchEvents: vi.fn(() => Promise.resolve(true))
    }
}))

vi.mock('../analytics-api', () => ({
    AnalyticsAPI: {
        trackEvents: vi.fn(() => Promise.resolve({ success: true, stored: true }))
    }
}))

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString()
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key]
        }),
        clear: vi.fn(() => {
            store = {}
        }),
        _getStore: () => store
    }
})()

// Mock navigator
const navigatorMock = {
    doNotTrack: null,
    userAgent: 'test-user-agent'
}

describe('Analytics Service', () => {
    // Save original objects
    const originalLocalStorage = global.localStorage
    const originalNavigator = global.navigator
    const originalConsoleWarn = console.warn
    const originalConsoleError = console.error

    beforeEach(() => {
        // Setup mocks
        Object.defineProperty(global, 'localStorage', { value: localStorageMock })
        Object.defineProperty(global, 'navigator', { value: navigatorMock })
        console.warn = vi.fn()
        console.error = vi.fn()

        // Reset localStorage mock
        localStorageMock.clear()

        // Reset navigator mock
        navigatorMock.doNotTrack = null

        // Reset other mocks
        vi.clearAllMocks()
    })

    afterEach(() => {
        // Restore original objects
        Object.defineProperty(global, 'localStorage', { value: originalLocalStorage })
        Object.defineProperty(global, 'navigator', { value: originalNavigator })
        console.warn = originalConsoleWarn
        console.error = originalConsoleError
    })

    describe('Privacy Compliance', () => {
        it('should respect Do Not Track header', async () => {
            // Set DNT to enabled
            navigatorMock.doNotTrack = '1'

            await trackEvent('test_event', { key: 'value' })

            expect(AnalyticsDB.storeEvent).not.toHaveBeenCalled()
            expect(AnalyticsAPI.trackEvents).not.toHaveBeenCalled()
        })

        it('should respect user privacy preferences', async () => {
            // Set privacy preference to opt out
            localStorageMock.setItem('settings_privacy', JSON.stringify({ shareAnalytics: false }))

            await trackEvent('test_event', { key: 'value' })

            expect(AnalyticsDB.storeEvent).not.toHaveBeenCalled()
            expect(AnalyticsAPI.trackEvents).not.toHaveBeenCalled()
        })

        it('should sanitize event details to remove PII', async () => {
            const details = {
                email: 'test@example.com',
                phone: '123-456-7890',
                name: 'Test User',
                validKey: 'valid value',
                longString: 'a'.repeat(1000)
            }

            await trackEvent('test_event', details)

            // Check that the event was sent without PII
            const calls = (AnalyticsDB.storeEvent as Mock).mock.calls
            expect(calls.length).toBe(1)

            const sentEvent = calls[0][0]
            expect(sentEvent.details).not.toHaveProperty('email')
            expect(sentEvent.details).not.toHaveProperty('phone')
            expect(sentEvent.details).not.toHaveProperty('name')
            expect(sentEvent.details).toHaveProperty('validKey')

            // Check that long strings are truncated
            expect(sentEvent.details.longString.length).toBeLessThan(1000)
        })

        it('should remove script tags from event details', async () => {
            const details = {
                content: '<script>alert("xss")</script>Hello world'
            }

            await trackEvent('test_event', details)

            const calls = (AnalyticsDB.storeEvent as Mock).mock.calls
            expect(calls.length).toBe(1)

            const sentEvent = calls[0][0]
            expect(sentEvent.details.content).toBe('[script removed]Hello world')
        })
    })

    describe('Event Tracking', () => {
        it('should track events with correct data', async () => {
            const mockDate = new Date('2025-01-01T12:00:00Z')
            vi.setSystemTime(mockDate)

            // Mock location and document
            Object.defineProperty(global, 'location', { value: { pathname: '/test-page' } })
            Object.defineProperty(global, 'document', { value: { referrer: 'https://example.com' } })

            await trackEvent('test_event', { key: 'value' })

            const calls = (AnalyticsDB.storeEvent as Mock).mock.calls
            expect(calls.length).toBe(1)

            const sentEvent = calls[0][0]
            expect(sentEvent.type).toBe('test_event')
            expect(sentEvent.page).toBe('/test-page')
            expect(sentEvent.timestamp).toBe(mockDate.getTime())
            expect(sentEvent.sessionId).toBeTruthy()
            expect(sentEvent.details).toEqual({ key: 'value' })
            expect(sentEvent.userAgent).toBe('test-user-agent')
            expect(sentEvent.referrer).toBe('https://example.com')

            vi.useRealTimers()
        })

        it('should batch events when queue is full', async () => {
            // Set a small batch size for testing
            const originalBatchSize = (analyticsService as any).config.batchSize
                ; (analyticsService as any).config.batchSize = 2

            // Track multiple events
            await trackEvent('event1')
            await trackEvent('event2')
            await trackEvent('event3')

            // Should have called storeBatchEvents at least once
            expect(AnalyticsDB.storeBatchEvents).toHaveBeenCalled()

                // Restore batch size
                ; (analyticsService as any).config.batchSize = originalBatchSize
        })

        it('should handle offline/online transitions', async () => {
            // Mock online/offline events
            const onlineHandler = (analyticsService as any).handleOnline
            const offlineHandler = (analyticsService as any).handleOffline

            // Simulate going offline
            offlineHandler()
            expect((analyticsService as any).isOnline).toBe(false)

            // Track event while offline
            await trackEvent('offline_event')

            // Event should be queued but not sent
            expect(AnalyticsDB.storeEvent).not.toHaveBeenCalled()
            expect((analyticsService as any).eventQueue.length).toBeGreaterThan(0)

                // Simulate going online
                ; (AnalyticsDB.storeBatchEvents as Mock).mockClear()
            onlineHandler()

            // Queue should be flushed
            expect((analyticsService as any).isOnline).toBe(true)
            expect(AnalyticsDB.storeBatchEvents).toHaveBeenCalled()
        })

        it('should retry failed events with exponential backoff', async () => {
            // Mock a failed event storage
            ; (AnalyticsDB.storeEvent as Mock).mockRejectedValueOnce(new Error('Storage failed'))
                ; (AnalyticsDB.storeEvent as Mock).mockResolvedValueOnce(true)

            const originalRetryDelay = (analyticsService as any).config.retryDelay
                ; (analyticsService as any).config.retryDelay = 10 // Small delay for testing

            // Track event
            await trackEvent('retry_event')

            // Should have retried
            expect(AnalyticsDB.storeEvent).toHaveBeenCalledTimes(2)

                // Restore retry delay
                ; (analyticsService as any).config.retryDelay = originalRetryDelay
        })
    })

    describe('Session Management', () => {
        it('should generate and maintain consistent session IDs', () => {
            const sessionId1 = getSessionId()
            const sessionId2 = getSessionId()

            expect(sessionId1).toBeTruthy()
            expect(sessionId1).toBe(sessionId2) // Should be the same within a session
        })

        it('should generate and store user IDs', () => {
            const userId1 = getUserId()

            // Check localStorage was used
            expect(localStorageMock.getItem).toHaveBeenCalledWith('anon_id')
            expect(localStorageMock.setItem).toHaveBeenCalled()

            // Should return the same ID on subsequent calls
            localStorageMock.getItem.mockClear()
            const userId2 = getUserId()
            expect(userId1).toBe(userId2)
            expect(localStorageMock.getItem).toHaveBeenCalledWith('anon_id')
        })
    })

    describe('Configuration Management', () => {
        it('should allow enabling/disabling analytics', () => {
            // Initially enabled
            expect(isAnalyticsEnabled()).toBe(true)

            // Disable analytics
            setAnalyticsEnabled(false)
            expect(isAnalyticsEnabled()).toBe(false)

            // Track event while disabled
            trackEvent('disabled_event')
            expect(AnalyticsDB.storeEvent).not.toHaveBeenCalled()

            // Re-enable analytics
            setAnalyticsEnabled(true)
            expect(isAnalyticsEnabled()).toBe(true)
        })
    })

    describe('Error Handling', () => {
        it('should fail silently when analytics API throws errors', async () => {
            // Mock API to throw error
            ; (AnalyticsAPI.trackEvents as Mock).mockRejectedValueOnce(new Error('API error'))

                // Mock DB to be unavailable
                ; (AnalyticsDB.isAvailable as Mock).mockReturnValueOnce(false)

            // This should not throw
            await expect(trackEvent('error_event')).resolves.not.toThrow()

            // Should have logged warning
            expect(console.warn).toHaveBeenCalled()
        })
    })
})
