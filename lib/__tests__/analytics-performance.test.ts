import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analyticsPerformance } from '../analytics-performance'
import { analyticsCache } from '../analytics-cache'

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
    supabase: {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        rpc: vi.fn().mockReturnThis(),
    }
}))

// Mock the analytics cache
vi.mock('../analytics-cache', () => ({
    analyticsCache: {
        get: vi.fn(),
        set: vi.fn(),
        getOrSet: vi.fn(),
        clear: vi.fn(),
        clearByPrefix: vi.fn(),
        getStats: vi.fn(),
    },
    cacheKeys: {
        getMetricsCacheKey: (startDate?: Date, endDate?: Date) => {
            const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
            const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
            return `metrics:${start}:${end}`
        },
        getTopPagesCacheKey: (limit: number, startDate?: Date, endDate?: Date) => {
            const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
            const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
            return `top-pages:${limit}:${start}:${end}`
        },
        getEventCountsCacheKey: (startDate?: Date, endDate?: Date) => {
            const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
            const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
            return `event-counts:${start}:${end}`
        },
        getTimeSeriesCacheKey: (intervalType: string, startDate?: Date, endDate?: Date) => {
            const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
            const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
            return `time-series:${intervalType}:${start}:${end}`
        },
        getContentPerformanceCacheKey: (startDate?: Date, endDate?: Date) => {
            const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
            const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
            return `content-performance:${start}:${end}`
        }
    }
}))

describe('Analytics Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe('getMetrics', () => {
        it('should use cache when available', async () => {
            const mockMetrics = {
                totalPageViews: 100,
                uniqueSessions: 50,
                totalEvents: 200,
                avgSessionDuration: '5m'
            }

            // Mock cache hit
            vi.mocked(analyticsCache.getOrSet).mockResolvedValueOnce(mockMetrics)

            const result = await analyticsPerformance.getMetrics()

            expect(analyticsCache.getOrSet).toHaveBeenCalledTimes(1)
            expect(result).toEqual(mockMetrics)
        })

        it('should handle date ranges correctly', async () => {
            const startDate = new Date('2025-01-01')
            const endDate = new Date('2025-01-31')

            await analyticsPerformance.getMetrics(startDate, endDate)

            expect(analyticsCache.getOrSet).toHaveBeenCalledWith(
                expect.stringContaining('metrics:2025-01-01:2025-01-31'),
                expect.any(Function),
                expect.objectContaining({ ttl: expect.any(Number) })
            )
        })
    })

    describe('getTopPages', () => {
        it('should use cache when available', async () => {
            const mockTopPages = [
                { page: '/', pageViews: 100, uniqueSessions: 50 },
                { page: '/about', pageViews: 50, uniqueSessions: 25 }
            ]

            // Mock cache hit
            vi.mocked(analyticsCache.getOrSet).mockResolvedValueOnce(mockTopPages)

            const result = await analyticsPerformance.getTopPages(10)

            expect(analyticsCache.getOrSet).toHaveBeenCalledTimes(1)
            expect(result).toEqual(mockTopPages)
        })

        it('should respect limit parameter', async () => {
            const limit = 5

            await analyticsPerformance.getTopPages(limit)

            expect(analyticsCache.getOrSet).toHaveBeenCalledWith(
                expect.stringContaining(`top-pages:${limit}`),
                expect.any(Function),
                expect.objectContaining({ ttl: expect.any(Number) })
            )
        })
    })

    describe('getTimeSeriesData', () => {
        it('should handle different interval types', async () => {
            await analyticsPerformance.getTimeSeriesData('hour')

            expect(analyticsCache.getOrSet).toHaveBeenCalledWith(
                expect.stringContaining('time-series:hour'),
                expect.any(Function),
                expect.objectContaining({ ttl: expect.any(Number) })
            )

            vi.clearAllMocks()

            await analyticsPerformance.getTimeSeriesData('day')

            expect(analyticsCache.getOrSet).toHaveBeenCalledWith(
                expect.stringContaining('time-series:day'),
                expect.any(Function),
                expect.objectContaining({ ttl: expect.any(Number) })
            )

            vi.clearAllMocks()

            await analyticsPerformance.getTimeSeriesData('week')

            expect(analyticsCache.getOrSet).toHaveBeenCalledWith(
                expect.stringContaining('time-series:week'),
                expect.any(Function),
                expect.objectContaining({ ttl: expect.any(Number) })
            )
        })
    })

    describe('Cache management', () => {
        it('should clear all caches', () => {
            analyticsPerformance.clearAllCaches()

            expect(analyticsCache.clear).toHaveBeenCalledTimes(1)
        })

        it('should clear specific cache types', () => {
            analyticsPerformance.clearCacheByType('metrics')

            expect(analyticsCache.clearByPrefix).toHaveBeenCalledWith('metrics:')

            vi.clearAllMocks()

            analyticsPerformance.clearCacheByType('top-pages')

            expect(analyticsCache.clearByPrefix).toHaveBeenCalledWith('top-pages:')
        })

        it('should get cache statistics', () => {
            const mockStats = { size: 10, keys: ['metrics:all:now', 'top-pages:10:all:now'] }
            vi.mocked(analyticsCache.getStats).mockReturnValueOnce(mockStats)

            const stats = analyticsPerformance.getCacheStats()

            expect(analyticsCache.getStats).toHaveBeenCalledTimes(1)
            expect(stats).toEqual(mockStats)
        })
    })
})
