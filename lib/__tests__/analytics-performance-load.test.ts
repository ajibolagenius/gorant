import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { analyticsService } from '../self-analytics'
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
        })
    }
})()

describe('Analytics Performance Load Tests', () => {
    // Save original objects
    const originalLocalStorage = global.localStorage
    const originalConsoleWarn = console.warn
    const originalConsoleError = console.error

    beforeEach(() => {
        // Setup mocks
        Object.defineProperty(global, 'localStorage', { value: localStorageMock })
        console.warn = vi.fn()
        console.error = vi.fn()

        // Reset localStorage mock
        localStorageMock.clear()

        // Reset other mocks
        vi.clearAllMocks()

        // Set privacy settings to allow tracking
        localStorageMock.setItem('settings_privacy', JSON.stringify({ shareAnalytics: true }))
    })

    afterEach(() => {
        // Restore original objects
        Object.defineProperty(global, 'localStorage', { value: originalLocalStorage })
        console.warn = originalConsoleWarn
        console.error = originalConsoleError
    })

    it('should handle high volume of events efficiently', async () => {
        // Configure service for testing
        const originalBatchSize = (analyticsService as any).config.batchSize
            ; (analyticsService as any).config.batchSize = 50 // Smaller batch size for testing

        // Generate a large number of events
        const eventCount = 500
        const events = []

        for (let i = 0; i < eventCount; i++) {
            events.push({
                type: 'test_event',
                details: { index: i, value: `test-${i}` }
            })
        }

        // Measure performance
        const startTime = performance.now()

        // Track all events
        const promises = events.map(event =>
            analyticsService.trackEvent(event.type, event.details)
        )

        await Promise.all(promises)

        const endTime = performance.now()
        const duration = endTime - startTime

        // Verify all events were processed
        expect((analyticsService as any).eventQueue.length).toBe(0)

        // Check that batch processing was used
        const batchCount = Math.ceil(eventCount / (analyticsService as any).config.batchSize)
        expect(AnalyticsDB.storeBatchEvents).toHaveBeenCalledTimes(batchCount)

        // Performance assertions - these thresholds may need adjustment based on environment
        console.log(`Processed ${eventCount} events in ${duration}ms (${duration / eventCount}ms per event)`)
        expect(duration / eventCount).toBeLessThan(5) // Less than 5ms per event on average

            // Restore original batch size
            ; (analyticsService as any).config.batchSize = originalBatchSize
    })

    it('should handle concurrent event tracking efficiently', async () => {
        // Configure service for testing
        const originalBatchSize = (analyticsService as any).config.batchSize
            ; (analyticsService as any).config.batchSize = 20 // Smaller batch size for testing

        // Generate concurrent event batches
        const batchCount = 5
        const eventsPerBatch = 100
        const batches = []

        for (let b = 0; b < batchCount; b++) {
            const batch = []
            for (let i = 0; i < eventsPerBatch; i++) {
                batch.push({
                    type: `test_event_batch_${b}`,
                    details: { batch: b, index: i }
                })
            }
            batches.push(batch)
        }

        // Measure performance
        const startTime = performance.now()

        // Track all batches concurrently
        const batchPromises = batches.map(batch => {
            const eventPromises = batch.map(event =>
                analyticsService.trackEvent(event.type, event.details)
            )
            return Promise.all(eventPromises)
        })

        await Promise.all(batchPromises)

        const endTime = performance.now()
        const duration = endTime - startTime
        const totalEvents = batchCount * eventsPerBatch

        // Verify all events were processed
        expect((analyticsService as any).eventQueue.length).toBe(0)

        // Performance assertions
        console.log(`Processed ${totalEvents} concurrent events in ${duration}ms (${duration / totalEvents}ms per event)`)
        expect(duration / totalEvents).toBeLessThan(5) // Less than 5ms per event on average

            // Restore original batch size
            ; (analyticsService as any).config.batchSize = originalBatchSize
    })

    it('should handle event queue flushing under load', async () => {
        // Configure service for testing
        const originalBatchSize = (analyticsService as any).config.batchSize
        const originalFlushInterval = (analyticsService as any).config.flushInterval
            ; (analyticsService as any).config.batchSize = 100
            ; (analyticsService as any).config.flushInterval = 100 // 100ms flush interval for testing

        // Generate events
        const eventCount = 250

        // Track events without awaiting them
        for (let i = 0; i < eventCount; i++) {
            analyticsService.trackEvent('test_event', { index: i })
        }

        // Wait for flush interval to trigger
        await new Promise(resolve => setTimeout(resolve, 200))

        // Verify events were flushed
        expect((analyticsService as any).eventQueue.length).toBe(0)
        expect(AnalyticsDB.storeBatchEvents).toHaveBeenCalled()

            // Restore original config
            ; (analyticsService as any).config.batchSize = originalBatchSize
            ; (analyticsService as any).config.flushInterval = originalFlushInterval
    })

    it('should handle offline/online transitions with large event queues', async () => {
        // Configure service for testing
        const originalBatchSize = (analyticsService as any).config.batchSize
            ; (analyticsService as any).config.batchSize = 50

        // Simulate going offline
        const offlineHandler = (analyticsService as any).handleOffline
        offlineHandler()
        expect((analyticsService as any).isOnline).toBe(false)

        // Generate a large number of events while offline
        const eventCount = 200
        const events = []

        for (let i = 0; i < eventCount; i++) {
            events.push({
                type: 'offline_event',
                details: { index: i }
            })
        }

        // Track all events
        const promises = events.map(event =>
            analyticsService.trackEvent(event.type, event.details)
        )

        await Promise.all(promises)

        // Verify events were queued but not sent
        expect((analyticsService as any).eventQueue.length).toBe(eventCount)
        expect(AnalyticsDB.storeBatchEvents).not.toHaveBeenCalled()

        // Simulate going online
        const onlineHandler = (analyticsService as any).handleOnline

        // Measure performance of online transition
        const startTime = performance.now()
        onlineHandler()
        await new Promise(resolve => setTimeout(resolve, 100)) // Wait for async processing
        const endTime = performance.now()
        const duration = endTime - startTime

        // Verify queue was flushed
        expect((analyticsService as any).isOnline).toBe(true)
        expect((analyticsService as any).eventQueue.length).toBe(0)
        expect(AnalyticsDB.storeBatchEvents).toHaveBeenCalled()

        // Performance assertions
        console.log(`Flushed ${eventCount} queued events in ${duration}ms`)

            // Restore original batch size
            ; (analyticsService as any).config.batchSize = originalBatchSize
    })
})
