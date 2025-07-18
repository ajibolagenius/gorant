import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST, GET } from '../route'

// Mock the analytics database
jest.mock('@/lib/analytics-db', () => ({
    AnalyticsDB: {
        isAvailable: jest.fn(() => true),
        storeEvent: jest.fn(() => Promise.resolve(true)),
        storeBatchEvents: jest.fn(() => Promise.resolve(true)),
        getMetrics: jest.fn(() => Promise.resolve({
            totalPageViews: 100,
            uniqueSessions: 50,
            totalEvents: 200
        })),
        getTopPages: jest.fn(() => Promise.resolve([
            { page: '/', pageViews: 50, uniqueSessions: 25 }
        ])),
        getEventCountsByType: jest.fn(() => Promise.resolve([
            { eventType: 'pageview', eventCount: 100, uniqueSessions: 50 }
        ])),
        getTimeSeriesData: jest.fn(() => Promise.resolve([
            { timeBucket: '2024-01-01', pageViews: 10, uniqueSessions: 5, totalEvents: 20 }
        ])),
        getContentPerformance: jest.fn(() => Promise.resolve([
            { contentType: 'rant', actionType: 'like', actionCount: 25, uniqueSessions: 15 }
        ]))
    }
}))

describe('/api/analytics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('POST', () => {
        it('should store a single analytics event', async () => {
            const event = {
                type: 'pageview',
                page: '/',
                timestamp: Date.now(),
                sessionId: 'test-session-123',
                details: { test: true }
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
        })

        it('should store batch analytics events', async () => {
            const events = [
                {
                    type: 'pageview',
                    page: '/',
                    timestamp: Date.now(),
                    sessionId: 'test-session-123'
                },
                {
                    type: 'user_action',
                    page: '/rants',
                    timestamp: Date.now(),
                    sessionId: 'test-session-123',
                    details: { action: 'like' }
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
        })

        it('should validate event data and return 400 for invalid events', async () => {
            const invalidEvent = {
                type: '', // Invalid: empty string
                timestamp: 'invalid', // Invalid: should be number
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
        })

        it('should handle database unavailability gracefully', async () => {
            const { AnalyticsDB } = require('@/lib/analytics-db')
            AnalyticsDB.isAvailable.mockReturnValue(false)

            const event = {
                type: 'pageview',
                page: '/',
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
        })
    })

    describe('GET', () => {
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
        })

        it('should return specific metrics when endpoint=metrics', async () => {
            const request = new NextRequest('http://localhost:3000/api/analytics?endpoint=metrics')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.data.totalPageViews).toBe(100)
            expect(data.data.uniqueSessions).toBe(50)
            expect(data.data.totalEvents).toBe(200)
        })

        it('should return top pages when endpoint=top-pages', async () => {
            const request = new NextRequest('http://localhost:3000/api/analytics?endpoint=top-pages&limit=5')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(Array.isArray(data.data)).toBe(true)
            expect(data.data[0]).toHaveProperty('page')
            expect(data.data[0]).toHaveProperty('pageViews')
            expect(data.data[0]).toHaveProperty('uniqueSessions')
        })

        it('should handle date range filtering', async () => {
            const startDate = '2024-01-01T00:00:00.000Z'
            const endDate = '2024-01-31T23:59:59.999Z'
            const request = new NextRequest(
                `http://localhost:3000/api/analytics?endpoint=metrics&startDate=${startDate}&endDate=${endDate}`
            )

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.data).toBeDefined()
        })

        it('should return 400 for invalid query parameters', async () => {
            const request = new NextRequest('http://localhost:3000/api/analytics?startDate=invalid-date')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid query parameters')
        })

        it('should return 503 when database is unavailable', async () => {
            const { AnalyticsDB } = require('@/lib/analytics-db')
            AnalyticsDB.isAvailable.mockReturnValue(false)

            const request = new NextRequest('http://localhost:3000/api/analytics')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(503)
            expect(data.error).toBe('Analytics database not available')
        })
    })
})
