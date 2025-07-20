import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest'
import { analyticsService, trackEvent, getSessionId, getUserId, isAnalyticsEnabled, setAnalyticsEnabled } from '../self-analytics'
import { AnalyticsDB, type AnalyticsEvent } from '../analytics-db'
import { AnalyticsAPI } from '../analytics-api'
import { getAnalyticsConfig, type AnalyticsConfig } from '../analytics-config'

// Test constants
const TEST_CONSTANTS = {
    BATCH_SIZE: 2,
    RETRY_DELAY: 10,
    MAX_STRING_LENGTH: 1000,
    MOCK_DATE: new Date('2025-01-01T12:00:00Z'),
    SAMPLE_EVENT: {
        type: 'test_event',
        details: { key: 'value' }
    }
} as const

const PII_TEST_DATA = {
    email: 'test@example.com',
    phone: '123-456-7890',
    name: 'Test User',
    validKey: 'valid value',
    longString: 'a'.repeat(TEST_CONSTANTS.MAX_STRING_LENGTH)
}

// Interface for testing internal service properties
interface TestableAnalyticsService {
    config: AnalyticsConfig & {
        batchSize: number;
        retryDelay: number;
        maxStringLength: number;
    };
    eventQueue: AnalyticsEvent[];
    isOnline: boolean;
    handleOnline(): void;
    handleOffline(): void;
}

// Mock factory
class MockFactory {
    static createAnalyticsDBMock() {
        return {
            isAvailable: vi.fn(() => true),
            storeEvent: vi.fn(() => Promise.resolve(true)),
            storeBatchEvents: vi.fn(() => Promise.resolve(true)),
            upsertUser: vi.fn(() => Promise.resolve(true)),
            upsertSession: vi.fn(() => Promise.resolve(true)),
            incrementSessionEvents: vi.fn(() => Promise.resolve(true))
        }
    }

    static createAnalyticsAPIMock() {
        return {
            trackEvents: vi.fn(() => Promise.resolve({ success: true, stored: true }))
        }
    }

    static resetAllMocks() {
        vi.clearAllMocks()
    }
}

// Mock dependencies
vi.mock('../analytics-db', () => ({
    AnalyticsDB: MockFactory.createAnalyticsDBMock()
}))

vi.mock('../analytics-api', () => ({
    AnalyticsAPI: MockFactory.createAnalyticsAPIMock()
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

// Helper functions for environment setup
const createMockEnvironment = () => ({
    localStorage: localStorageMock,
    navigator: navigatorMock,
    location: { pathname: '/test-page' },
    document: { narrer: 'https://example.com' }
})

const setupMockEnvironment = (overrides = {}) => {
    const env = { ...createMockEnvironment(), ...overrides }
    Object.entries(env).forEach(([key, value]) => {
        Object.defineProperty(global, key, { value, configurable: true })
    })
}

const waitForAsyncOperations = () => new Promise(resolve => setTimeout(resolve, 0))

describe('Analytics Service', () => {
    // Save original objects
    const originalLocalStorage = global.localStorage
    const originalNavigator = global.navigator
    const originalConsoleWarn = console.warn
    const originalConsoleError = console.error

    beforeEach(() => {
        // Reset mocks
        MockFactory.resetAllMocks()

        // Setup environment
        setupMockEnvironment()

        // Mock console methods
        console.warn = vi.fn()
        console.error = vi.fn()

        // Reset localStorage mock
        localStorageMock.clear()

        // Reset navigator mock
        navigatorMock.doNotTrack = null
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
            await trackEvent('test_event', PII_TEST_DATA)

            // Check that the event was sent without PII
            const calls = (AnalyticsDB.storeEvent as Mock).mock.calls
            expect(calls.length).toBe(1)

            const sentEvent = calls[0][0]
            expect(sentEvent.details).not.toHaveProperty('email')
            expect(sentEvent.details).not.toHaveProperty('phone')
            expect(sentEvent.details).not.toHaveProperty('name')
            expect(sentEvent.details).toHaveProperty('validKey')

            // Check that long strings are truncated
            expect(sentEvent.details.longString.length).toBeLessThan(TEST_CONSTANTS.MAX_STRING_LENGTH)
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

        it('should handle malformed localStorage data gracefully', async () => {
            localStorageMock.setItem('settings_privacy', 'invalid-json')

            // Should not throw and should default to privacy-safe behavior
            await expect(trackEvent('test_event')).resolves.not.toThrow()
            expect(AnalyticsDB.storeEvent).not.toHaveBeenCalled()
        })
    })

    describe('Event Tracking', () => {
        it('should track events with correct data', async () => {
            vi.setSystemTime(TEST_CONSTANTS.MOCK_DATE)

            await trackEvent(TEST_CONSTANTS.SAMPLE_EVENT.type, TEST_CONSTANTS.SAMPLE_EVENT.details)

            const calls = (AnalyticsDB.storeEvent as Mock).mock.calls
            expect(calls.length).toBe(1)

            const sentEvent = calls[0][0]
            expect(sentEvent.type).toBe(TEST_CONSTANTS.SAMPLE_EVENT.type)
            expect(sentEvent.page).toBe('/test-page')
            expect(sentEvent.timestamp).toBe(TEST_CONSTANTS.MOCK_DATE.getTime())
            expect(sentEvent.sessionId).toBeTruthy()
            expect(sentEvent.details).toEqual(TEST_CONSTANTS.SAMPLE_EVENT.details)
            expect(sentEvent.userAgent).toBe('test-user-agent')
            expect(sentEvent.referrer).toBe('https://example.com')

            vi.useRealTimers()
        })

        it('should batch events when queue is full', async () => {
            const testableService = analyticsService as unknown as TestableAnalyticsService
            const originalBatchSize = testableService.config.batchSize
            testableService.config.batchSize = TEST_CONSTANTS.BATCH_SIZE

            // Track multiple events
            await trackEvent('event1')
            await trackEvent('event2')
            await trackEvent('event3')
            await waitForAsyncOperations()

            // Should have called storeBatchEvents at least once
            expect(AnalyticsDB.storeBatchEvents).toHaveBeenCalled()

            // Restore batch size
            testableService.config.batchSize = originalBatchSize
        })

        it('should handle offline/online transitions', async () => {
            const testableService = analyticsService as unknown as TestableAnalyticsService

            // Simulate going offline
            testableService.handleOffline()
            expect(testableService.isOnline).toBe(false)

            // Track event while offline
            await trackEvent('offline_event')
            await waitForAsyncOperations()

            // Event should be queued but not sent
            expect(AnalyticsDB.storeEvent).not.toHaveBeenCalled()
            expect(testableService.eventQueue.length).toBeGreaterThan(0)

            // Simulate going online
            vi.clearAllMocks()
            testableService.handleOnline()
            await waitForAsyncOperations()

            // Queue should be flushed
            expect(testableService.isOnline).toBe(true)
            expect(AnalyticsDB.storeBatchEvents).toHaveBeenCalled()
        })

        it('should retry failed events with exponential backoff', async () => {
            const testableService = analyticsService as unknown as TestableAnalyticsService

            // Mock a failed event storage
            (AnalyticsDB.storeEvent as Mock).mockRejectedValueOnce(new Error('Storage failed'))
                ; (AnalyticsDB.storeEvent as Mock).mockResolvedValueOnce(true)

            const originalRetryDelay = testableService.config.retryDelay
            testableService.config.retryDelay = TEST_CONSTANTS.RETRY_DELAY

            // Track event
            await trackEvent('retry_event')
            await waitForAsyncOperations()

            // Should have retried
            expect(AnalyticsDB.storeEvent).toHaveBeenCalledTimes(2)

            // Restore retry delay
            testableService.config.retryDelay = originalRetryDelay
        })

        it('should handle concurrent event tracking', async () => {
            const promises = Array.from({ length: 5 }, (_, i) =>
                trackEvent(`concurrent_event_${i}`)
            )

            await expect(Promise.all(promises)).resolves.not.toThrow()
            expect(AnalyticsDB.storeEvent).toHaveBeenCalledTimes(5)
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
            (AnalyticsAPI.trackEvents as Mock).mockRejectedValueOnce(new Error('API error'))

                // Mock DB to be unavailable
                (AnalyticsDB.isAvailable as Mock).mockReturnValueOnce(false)

            // This should not throw
            await expect(trackEvent('error_event')).resolves.not.toThrow()

            // Should have logged warning
            expect(console.warn).toHaveBeenCalled()
        })

        it('should handle network timeouts gracefully', async () => {
            const timeoutError = new Error('Network timeout')
            timeoutError.name = 'TimeoutError'

            vi.mocked(AnalyticsAPI.trackEvents).mockRejectedValueOnce(timeoutError)
            vi.mocked(AnalyticsDB.isAvailable).mockReturnValueOnce(false)

            await expect(trackEvent('timeout_test')).resolves.not.toThrow()
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Analytics failed to send events'),
                timeoutError
            )
        })

        it('should handle storage quota exceeded', async () => {
            const quotaError = new Error('QuotaExceededError')
            quotaError.name = 'QuotaExceededError'

            vi.mocked(AnalyticsDB.storeEvent).mockRejectedValueOnce(quotaError)

            await expect(trackEvent('quota_test')).resolves.not.toThrow()
        })

        it('should handle missing global objects', async () => {
            // Setup environment without navigator and document
            setupMockEnvironment({
                navigator: undefined,
                document: undefined
            })

            await expect(trackEvent('test_event')).resolves.not.toThrow()
        })
    })

    describe('Performance', () => {
        it('should handle high-volume event tracking efficiently', async () => {
            const eventCount = 20 // Reduced for test speed
            const startTime = performance.now()
            const eventPromises = Array.from({ length: eventCount }, (_, i) =>
                trackEvent('load_test_event', { index: i })
            )

            await Promise.all(eventPromises)
            const endTime = performance.now()

            expect(endTime - startTime).toBeLessThan(1000) // Should complete within 1 second
            expect(AnalyticsDB.storeEvent).toHaveBeenCalledTimes(eventCount)
        })

        it('should batch events efficiently', async () => {
            const testableService = analyticsService as unknown as TestableAnalyticsService
            const originalBatchSize = testableService.config.batchSize
            testableService.config.batchSize = 5

            // Track more events than batch size
            for (let i = 0; i < 12; i++) {
                await trackEvent(`batch_test_${i}`)
            }
            await waitForAsyncOperations()

            // Should have called batch storage multiple times
            expect(AnalyticsDB.storeBatchEvents).toHaveBeenCalledTimes(2)

            testableService.config.batchSize = originalBatchSize
        })
    })
})
