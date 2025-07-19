import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { analyticsPerformance, getCachedData, invalidateAnalyticsCache, addBackgroundTask, optimizeQuery, getPerformanceMetrics } from '../analytics-performance'

describe('AnalyticsPerformanceService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        analyticsPerformance.resetMetrics()
        analyticsPerformance.invalidateCache()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Caching', () => {
        it('should cache and retrieve data', async () => {
            const mockFetchFunction = jest.fn().mockResolvedValue({ data: 'test' })

            // First call should fetch data
            const result1 = await getCachedData('test-key', mockFetchFunction)
            expect(result1).toEqual({ data: 'test' })
            expect(mockFetchFunction).toHaveBeenCalledTimes(1)

            // Second call should use cache
            const result2 = await getCachedData('test-key', mockFetchFunction)
            expect(result2).toEqual({ data: 'test' })
            expect(mockFetchFunction).toHaveBeenCalledTimes(1) // Still only called once
        })

        it('should respect custom TTL', async () => {
            const mockFetchFunction = jest.fn()
                .mockResolvedValueOnce({ data: 'first' })
                .mockResolvedValueOnce({ data: 'second' })

            // Cache with very short TTL
            const result1 = await getCachedData('test-key', mockFetchFunction, 10)
            expect(result1).toEqual({ data: 'first' })

            // Wait for cache to expire
            await new Promise(resolve => setTimeout(resolve, 15))

            // Should fetch new data
            const result2 = await getCachedData('test-key', mockFetchFunction, 10)
            expect(result2).toEqual({ data: 'second' })
            expect(mockFetchFunction).toHaveBeenCalledTimes(2)
        })

        it('should generate consistent cache keys', () => {
            const key1 = analyticsPerformance.generateCacheKey('metrics', {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            })
            const key2 = analyticsPerformance.generateCacheKey('metrics', {
                endDate: '2024-01-31',
                startDate: '2024-01-01'  // Different order
            })

            expect(key1).toBe(key2)
        })

        it('should invalidate cache by pattern', async () => {
            const mockFetchFunction = jest.fn()
                .mockResolvedValueOnce({ data: 'metrics1' })
                .mockResolvedValueOnce({ data: 'metrics2' })
                .mockResolvedValueOnce({ data: 'other' })

            // Cache some data
            await getCachedData('analytics:metrics:1', mockFetchFunction)
            await getCachedData('analytics:metrics:2', mockFetchFunction)
            await getCachedData('analytics:other:1', mockFetchFunction)

            // Invalidate metrics cache
            invalidateAnalyticsCache('metrics')

            // Metrics should be refetched, other should use cache
            mockFetchFunction.mockResolvedValueOnce({ data: 'metrics1-new' })
            const result1 = await getCachedData('analytics:metrics:1', mockFetchFunction)
            const result2 = await getCachedData('analytics:other:1', mockFetchFunction)

            expect(result1).toEqual({ data: 'metrics1-new' })
            expect(result2).toEqual({ data: 'other' }) // From cache
            expect(mockFetchFunction).toHaveBeenCalledTimes(4) // 3 initial + 1 refetch
        })

        it('should handle cache size limits', async () => {
            // Update config to small cache size for testing
            analyticsPerformance.updateConfig({ maxSize: 3 })

            const mockFetchFunction = jest.fn()
                .mockResolvedValue({ data: 'test' })

            // Fill cache beyond limit
            await getCachedData('key1', mockFetchFunction)
            await getCachedData('key2', mockFetchFunction)
            await getCachedData('key3', mockFetchFunction)
            await getCachedData('key4', mockFetchFunction) // Should trigger cleanup

            const stats = analyticsPerformance.getCacheStats()
            expect(stats.size).toBeLessThanOrEqual(3)
        })
    })

    describe('Background Processing', () => {
        it('should process background tasks', async () => {
            const task1 = jest.fn().mockResolvedValue(undefined)
            const task2 = jest.fn().mockResolvedValue(undefined)

            addBackgroundTask(task1)
            addBackgroundTask(task2)

            // Wait for tasks to process
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(task1).toHaveBeenCalled()
            expect(task2).toHaveBeenCalled()
        })

        it('should handle background task errors gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
            const failingTask = jest.fn().mockRejectedValue(new Error('Task failed'))
            const successTask = jest.fn().mockResolvedValue(undefined)

            addBackgroundTask(failingTask)
            addBackgroundTask(successTask)

            // Wait for tasks to process
            await new Promise(resolve => setTimeout(resolve, 10))

            expect(failingTask).toHaveBeenCalled()
            expect(successTask).toHaveBeenCalled()
            expect(consoleSpy).toHaveBeenCalledWith('Background task failed:', expect.any(Error))

            consoleSpy.mockRestore()
        })
    })

    describe('Query Optimization', () => {
        it('should optimize query parameters', () => {
            const params = {
                limit: 5000, // Too high
                offset: -10, // Invalid
                startDate: new Date('2020-01-01'),
                endDate: new Date('2024-01-01'), // 4 years - too long
                customParam: 'test'
            }

            const optimized = optimizeQuery(params)

            expect(optimized.limit).toBe(1000) // Capped at max
            expect(optimized.offset).toBe(0) // Fixed negative
            expect(optimized.startDate).toBeInstanceOf(Date)
            expect(optimized.endDate).toBeInstanceOf(Date)
            expect(optimized.customParam).toBe('test')

            // Date range should be limited to 1 year
            const daysDiff = (optimized.endDate!.getTime() - optimized.startDate!.getTime()) / (1000 * 60 * 60 * 24)
            expect(daysDiff).toBeLessThanOrEqual(365)
        })

        it('should provide recommended database indexes', () => {
            const indexes = analyticsPerformance.getRecommendedIndexes()

            expect(indexes).toBeInstanceOf(Array)
            expect(indexes.length).toBeGreaterThan(0)
            expect(indexes.every(index => index.includes('CREATE INDEX'))).toBe(true)
        })
    })

    describe('Batch Operations', () => {
        it('should batch operations efficiently', async () => {
            const operations = Array.from({ length: 25 }, (_, i) =>
                jest.fn().mockResolvedValue(`result-${i}`)
            )

            const results = await analyticsPerformance.batchOperations(operations, 10)

            expect(results).toHaveLength(25)
            expect(results[0]).toBe('result-0')
            expect(results[24]).toBe('result-24')

            // All operations should have been called
            operations.forEach(op => {
                expect(op).toHaveBeenCalled()
            })
        })
    })

    describe('Utility Functions', () => {
        it('should debounce function calls', (done) => {
            const mockFn = jest.fn()
            const debouncedFn = analyticsPerformance.debounce(mockFn, 50)

            // Call multiple times quickly
            debouncedFn('arg1')
            debouncedFn('arg2')
            debouncedFn('arg3')

            // Should not be called immediately
            expect(mockFn).not.toHaveBeenCalled()

            // Should be called once after delay with last arguments
            setTimeout(() => {
                expect(mockFn).toHaveBeenCalledTimes(1)
                expect(mockFn).toHaveBeenCalledWith('arg3')
                done()
            }, 60)
        })

        it('should throttle function calls', (done) => {
            const mockFn = jest.fn()
            const throttledFn = analyticsPerformance.throttle(mockFn, 50)

            // Call multiple times quickly
            throttledFn('arg1')
            throttledFn('arg2')
            throttledFn('arg3')

            // Should be called immediately with first arguments
            expect(mockFn).toHaveBeenCalledTimes(1)
            expect(mockFn).toHaveBeenCalledWith('arg1')

            // Should not be called again until throttle period ends
            setTimeout(() => {
                throttledFn('arg4')
                expect(mockFn).toHaveBeenCalledTimes(2)
                expect(mockFn).toHaveBeenLastCalledWith('arg4')
                done()
            }, 60)
        })
    })

    describe('Performance Metrics', () => {
        it('should track cache hit rate', async () => {
            const mockFetchFunction = jest.fn().mockResolvedValue({ data: 'test' })

            // Generate cache miss
            await getCachedData('test-key', mockFetchFunction)

            // Generate cache hit
            await getCachedData('test-key', mockFetchFunction)

            const metrics = getPerformanceMetrics()
            expect(metrics.cacheHitRate).toBe(0.5) // 1 hit out of 2 total
        })

        it('should track average query time', async () => {
            const slowFetchFunction = jest.fn().mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({ data: 'test' }), 10))
            )

            await getCachedData('test-key-1', slowFetchFunction)
            await getCachedData('test-key-2', slowFetchFunction)

            const metrics = getPerformanceMetrics()
            expect(metrics.averageQueryTime).toBeGreaterThan(0)
        })

        it('should provide cache statistics', async () => {
            const mockFetchFunction = jest.fn().mockResolvedValue({ data: 'test' })

            await getCachedData('test-key-1', mockFetchFunction)
            await getCachedData('test-key-2', mockFetchFunction)

            const stats = analyticsPerformance.getCacheStats()
            expect(stats.size).toBe(2)
            expect(stats.hitRate).toBeGreaterThanOrEqual(0)
            expect(stats.oldestEntry).toBeGreaterThan(0)
            expect(stats.newestEntry).toBeGreaterThan(0)
        })
    })

    describe('Configuration', () => {
        it('should update cache configuration', async () => {
            analyticsPerformance.updateConfig({ enabled: false })

            const mockFetchFunction = jest.fn()
                .mockResolvedValueOnce({ data: 'first' })
                .mockResolvedValueOnce({ data: 'second' })

            // With caching disabled, should always fetch
            const result1 = await getCachedData('test-key', mockFetchFunction)
            const result2 = await getCachedData('test-key', mockFetchFunction)

            expect(result1).toEqual({ data: 'first' })
            expect(result2).toEqual({ data: 'second' })
            expect(mockFetchFunction).toHaveBeenCalledTimes(2)
        })
    })
})
