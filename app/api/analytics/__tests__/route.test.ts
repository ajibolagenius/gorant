import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, GET, OPTIONS } from '../route'
import { AnalyticsDB } from '@/lib/analytics-db'
import { analyticsPerformance } from '@/lib/analytics-performance'
import { analyticsCache } from '@/lib/analytics-cache'
import { analyticsPrivacy } from '@/lib/analytics-privacy'

// Mock dependencies
vi.mock('@/lib/analytics-db', () => ({
    AnalyticsDB: {
        isAvailable: vi.fn(() => true),
        storeEvent: vi.fn(() => Promise.resolve(true)),
        storeBatchEvents: vi.fn(() => Promise.resolve(true)),
        getMetrics: vi.fn(() => Promise.resolve({
            totalPageViews: 100,
            uniqueSessions: 50,
            totalEvents: 200
        })),
        getTopPages: vi.fn(() => Promise.resolve([
            { page: '/', pageViews: 50, uniqueSessions: 25 }
        ])),
        getEventCountsByType: vi.fn(() => Promise.resolve([
            { eventType: 'pageview', eventCount: 100, uniqueSessions: 50 }
        ])),
        getTimeSeriesData: vi.fn(() => Promise.resolve([
            { timeBucket: '2025-01-01', pageViews: 10, uniqueSessions: 5, totalEvents: 20 }
        ])),
        getContentPerformance: vi.fn(() => Promise.resolve([
            { contentType: 'rant', actionType: 'like', actionCount: 25, uniqueSessions: 15 }
        ])),
        getTrendingTopics: vi.fn(() => Promise.resolve([
            { topic: 'work-stress', mentions: 234, growth: 45, sentiment: 'negative' }
        ])),
        getPopularMoods: vi.fn(() => Promise.resolve([
            { mood: 'frustrated', count: 456, percentage: 32, trend: 'up', color: 'orange' }
        ])),
        getUserBehaviorData: vi.fn(() => Promise.resolve({
            userFlow: [{ from: 'Home', to: 'Bookmarks', users: 234, percentage: 45, dropOffRate: 12 }],
            peakUsageTimes: [{ hour: 9, day: 'Mon', users: 234, events: 1247, label: '9 AM Monday' }],
            sessionPatterns: [{ pattern: 'Quick Browse', count: 456, avgDuration: '2m 34s', bounceRate: 65 }],
            conversionFunnels: [{ step: 'View Rant', users: 1000, conversionRate: 100, dropOff: 0 }]
        })),
        getModerationStats: vi.fn(() => Promise.resolve([
            { action: 'removed', count: 25, reason: 'inappropriate' }
        ])),
        getUserMetrics: vi.fn(() => Promise.resolve({
            totalUsers: 1000,
            onlineUsers: 50,
            newUsersToday: 25,
            activeUsersLast7Days: 500
        })),
        getUserGrowthData: vi.fn(() => Promise.resolve([
            { date: '2025-01-01', newUsers: 25, totalUsers: 1000 }
        ]))
    }
}))

vi.mock('@/lib/analytics-performance', () => ({
    analyticsPerformance: {
        getMetrics: vi.fn(() => Promise.resolve({
            totalPageViews: 100,
            uniqueSessions: 50,
            totalEvents: 200
        })),
        getTopPages: vi.fn(() => Promise.resolve([
            { page: '/', pageViews: 50, uniqueSessions: 25 }
        ])),
        getEventCountsByType: vi.fn(() => Promise.resolve([
            { eventType: 'pageview', eventCount: 100, uniqueSessions: 50 }
        ])),
        getTimeSeriesData: vi.fn(() => Promise.resolve([
            { timeBucket: '2025-01-01', pageViews: 10, uniqueSessions: 5, totalEvents: 20 }
        ])),
        getContentPerformance: vi.fn(() => Promise.resolve([
            { contentType: 'rant', actionType: 'like', actionCount: 25, uniqueSessions: 15 }
        ])),
        getCacheStats: vi.fn(() => ({ size: 10, keys: ['metrics:all:now'] })),
        clearAllCaches: vi.fn(),
        clearCacheByType: vi.fn()
    }
}))

vi.mock('@/lib/analytics-cache', () => ({
    analyticsCache: {
        get: vi.fn(),
        set: vi.fn(),
        getOrSet: vi.fn(),
        clear: vi.fn(),
        clearByPrefix: vi.fn()
    }
}))

vi.mock('@/lib/analytics-privacy', () => ({
    analyticsPrivacy: {
        logAuditEvent: vi.fn()
    }
}))

describe('Analytics API Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/analytics', () => {
        it('should store a single analytics event', async () => {
            const event = {
                type: 'pageview',
                page: '/test',
                timestamp: Date.now(),
                sessionId: 'test-session-123',
                details: { key: 'value' }
            }

            const request = new NextRequest('http://localhost:3000/api/analytics', {
                method: 'POST',
                body: JSON.stringify(event),
                headers: { 'Content-Type': 'application/json' }
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.stored).toBe(true)
            expect(data.eventCount).toBe(1)
            expect(AnalyticsDB.storeEvent).toHaveBeenCalledWith(expect.objectContaining({
                type: 'pageview',
                page: '/test',
                sessionId: 'test-session-123'
            }))
        })

        it('should store batch analytics events', async () => {
            const events = [
                {
                    type: 'pageview',
                    page: '/test1',
                    timestamp: Date.now(),
                    sessionId: 'test-session-123'
                },
                {
                    type: 'user_action',
                    page: '/test2',
                    timestamp: Date.now(),
                    sessionId: 'test-session-123',
                    details: { action: 'click' }
                }
            ]

            const request = new NextRequest('http://localhost:3000/api/analytics', {
                method: 'POST',
                body: JSON.stringify({ events }),
                headers: { 'Content-Type': 'application/json' }
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.stored).toBe(true)
            expect(data.eventCount).toBe(2)
            expect(AnalyticsDB.storeBatchEvents).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ type: 'pageview', page: '/test1' }),
                    expect.objectContaining({ type: 'user_action', page: '/test2' })
                ])
            )
        })

        it('should validate event data and return 400 for invalid events', async () => {
            const invalidEvent = {
                // Missing required 'type' field
                page: '/test',
                timestamp: Date.now(),
                sessionId: 'test-session-123'
            }

            const request = new NextRequest('http://localhost:3000/api/analytics', {
                method: 'POST',
                body: JSON.stringify(invalidEvent),
                headers: { 'Content-Type': 'application/json' }
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid event format')
            expect(data.details).toBeDefined()
            expect(AnalyticsDB.storeEvent).not.toHaveBeenCalled()
        })

        it('should validate batch events and return 400 for invalid batch', async () => {
            const invalidBatch = {
                events: [
                    {
                        type: 'pageview',
                        page: '/test',
                        timestamp: Date.now(),
                        sessionId: 'test-session-123'
                    },
                    {
                        // Missing required 'type' field
                        page: '/test2',
                        timestamp: Date.now(),
                        sessionId: 'test-session-123'
                    }
                ]
            }

            const request = new NextRequest('http://localhost:3000/api/analytics', {
                method: 'POST',
                body: JSON.stringify(invalidBatch),
                headers: { 'Content-Type': 'application/json' }
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid batch events format')
            expect(data.details).toBeDefined()
            expect(AnalyticsDB.storeBatchEvents).not.toHaveBeenCalled()
        })

        it('should handle database unavailability gracefully', async () => {
            (AnalyticsDB.isAvailable as Mock).mockReturnValueOnce(false)

            const event = {
                type: 'pageview',
                page: '/test',
                timestamp: Date.now(),
                sessionId: 'test-session-123'
            }

            const request = new NextRequest('http://localhost:3000/api/analytics', {
                method: 'POST',
                body: JSON.stringify(event),
                headers: { 'Content-Type': 'application/json' }
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.stored).toBe(false)
            expect(AnalyticsDB.storeEvent).not.toHaveBeenCalled()
        })

        it('should handle database errors gracefully', async () => {
            (AnalyticsDB.storeEvent as Mock).mockRejectedValueOnce(new Error('Database error'))

            const event = {
                type: 'pageview',
                page: '/test',
                timestamp: Date.now(),
                sessionId: 'test-session-123'
            }

            const request = new NextRequest('http://localhost:3000/api/analytics', {
                method: 'POST',
                body: JSON.stringify(event),
                headers: { 'Content-Type': 'application/json' }
            })

            const response = await POST(request)
            const data = await response.json()

            // Should still return success to avoid impacting user experience
            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
        })
    })

    describe('GET /api/analytics', () => {
        it('should return comprehensive dashboard data by default', async () => {
            const request = new NextRequest('http://localhost:3000/api/analytics')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.data).toBeDefined()
            expect(data.data.metrics).toBeDefined()
            expect(data.data.topPages).toBeDefined()
            expect(data.data.eventCounts).toBeDefined()
            expect(data.data.timeSeries).toBeDefined()
            expect(data.data.contentPerformance).toBeDefined()

            // Should log audit event
            expect(analyticsPrivacy.logAuditEvent).toHaveBeenCalledWith(
                'dashboard_access',
                expect.any(Object),
                undefined,
                expect.any(String)
            )
        })

        it('should return specific metrics when endpoint=metrics', async () => {
            const request = new NextRequest('http://localhost:3000/api/analytics?endpoint=metrics')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.data).toEqual({
                totalPageViews: 100,
                uniqueSessions: 50,
                totalEvents: 200
            })
            expect(analyticsPerformance.getMetrics).toHaveBeenCalled()
        })

        it('should return top pages when endpoint=top-pages', async () => {
            const request = new NextRequest('http://localhost:3000/api/analytics?endpoint=top-pages&limit=5')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(Array.isArray(data.data)).toBe(true)
            expect(data.data[0]).toHaveProperty('page')
            expect(data.data[0]).toHaveProperty('pageViews')
            expect(analyticsPerformance.getTopPages).toHaveBeenCalledWith(5, undefined, undefined)
        })

        it('should handle date range filtering', async () => {
            const startDate = '2025-01-01T00:00:00.000Z'
            const endDate = '2025-01-31T23:59:59.999Z'
            const request = new NextRequest(
                `http://localhost:3000/api/analytics?endpoint=metrics&startDate=${startDate}&endDate=${endDate}`
            )

            await GET(request)

            expect(analyticsPerformance.getMetrics).toHaveBeenCalledWith(
                expect.any(Date),
                expect.any(Date)
            )
        })

        it('should return 400 for invalid query parameters', async () => {
            const request = new NextRequest('http://localhost:3000/api/analytics?startDate=invalid-date')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid query parameters')
        })

        it('should return 503 when database is unavailable', async () => {
            (AnalyticsDB.isAvailable as Mock).mockReturnValueOnce(false)

            const request = new NextRequest('http://localhost:3000/api/analytics')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(503)
            expect(data.error).toBe('Analytics database not available')
        })

        it('should handle cache for repeated requests', async () => {
            // Mock cache hit
            const cachedData = { data: { metrics: { totalPageViews: 100 } } }
                ; (analyticsCache.get as Mock).mockReturnValueOnce(cachedData)

            const request = new NextRequest('http://localhost:3000/api/analytics?endpoint=metrics')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toEqual(cachedData)
            expect(analyticsPerformance.getMetrics).not.toHaveBeenCalled() // Should not call DB
        })

        it('should handle special endpoints like cache-stats', async () => {
            const request = new NextRequest('http://localhost:3000/api/analytics?endpoint=cache-stats')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.data).toEqual({ size: 10, keys: ['metrics:all:now'] })
            expect(analyticsPerformance.getCacheStats).toHaveBeenCalled()
        })

        it('should handle special endpoints like clear-cache', async () => {
            const request = new NextRequest('http://localhost:3000/api/analytics?endpoint=clear-cache')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.message).toBe('Cache cleared')
            expect(analyticsPerformance.clearAllCaches).toHaveBeenCalled()
        })
    })

    describe('OPTIONS /api/analytics', () => {
        it('should handle CORS preflight requests', async () => {
            const request = new NextRequest('http://localhost:3000/api/analytics', {
                method: 'OPTIONS'
            })

            const response = await OPTIONS(request)

            expect(response.status).toBe(200)
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS')
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization')
        })
    })
})
