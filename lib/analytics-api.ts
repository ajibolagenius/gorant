/**
 * Analytics API Client
 * Provides functions for interacting with the analytics API endpoints
 */

import { AnalyticsEvent } from './analytics-db'

export interface AnalyticsAPIResponse {
    success: boolean
    stored?: boolean
    eventCount?: number
    error?: string
    details?: any
}

export interface DashboardData {
    metrics?: {
        totalPageViews: number
        uniqueSessions: number
        totalEvents: number
        avgSessionDuration?: string
    }
    topPages?: Array<{
        page: string
        pageViews: number
        uniqueSessions: number
    }>
    eventCounts?: Array<{
        eventType: string
        eventCount: number
        uniqueSessions: number
    }>
    timeSeries?: Array<{
        timeBucket: string
        pageViews: number
        uniqueSessions: number
        totalEvents: number
    }>
    contentPerformance?: Array<{
        contentType: string
        actionType: string
        actionCount: number
        uniqueSessions: number
    }>
}

export interface DashboardQueryParams {
    startDate?: string
    endDate?: string
    eventType?: string
    page?: string
    limit?: number
    intervalType?: 'hour' | 'day' | 'week'
    endpoint?: 'metrics' | 'top-pages' | 'event-counts' | 'time-series' | 'content-performance'
}

/**
 * Analytics API Client Class
 */
export class AnalyticsAPI {
    private static baseUrl = '/api/analytics'

    /**
     * Send a single analytics event
     */
    static async trackEvent(event: AnalyticsEvent): Promise<AnalyticsAPIResponse> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            })

            if (!response.ok) {
                console.warn(`Analytics API error: ${response.status}`)
                return { success: true, stored: false } // Fail silently
            }

            return await response.json()
        } catch (error) {
            console.warn('Analytics API request failed:', error)
            return { success: true, stored: false } // Fail silently
        }
    }

    /**
     * Send multiple analytics events in a batch
     */
    static async trackEvents(events: AnalyticsEvent[]): Promise<AnalyticsAPIResponse> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ events }),
            })

            if (!response.ok) {
                console.warn(`Analytics API error: ${response.status}`)
                return { success: true, stored: false } // Fail silently
            }

            return await response.json()
        } catch (error) {
            console.warn('Analytics API batch request failed:', error)
            return { success: true, stored: false } // Fail silently
        }
    }

    /**
     * Get dashboard data
     */
    static async getDashboardData(params?: DashboardQueryParams): Promise<DashboardData | null> {
        try {
            const searchParams = new URLSearchParams()

            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        searchParams.append(key, value.toString())
                    }
                })
            }

            const url = searchParams.toString()
                ? `${this.baseUrl}?${searchParams.toString()}`
                : this.baseUrl

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                console.error(`Dashboard API error: ${response.status}`)
                return null
            }

            const result = await response.json()
            return result.data
        } catch (error) {
            console.error('Dashboard API request failed:', error)
            return null
        }
    }

    /**
     * Get basic metrics
     */
    static async getMetrics(startDate?: string, endDate?: string) {
        return this.getDashboardData({
            endpoint: 'metrics',
            startDate,
            endDate
        })
    }

    /**
     * Get top pages
     */
    static async getTopPages(limit = 10, startDate?: string, endDate?: string) {
        return this.getDashboardData({
            endpoint: 'top-pages',
            limit,
            startDate,
            endDate
        })
    }

    /**
     * Get event counts by type
     */
    static async getEventCounts(startDate?: string, endDate?: string) {
        return this.getDashboardData({
            endpoint: 'event-counts',
            startDate,
            endDate
        })
    }

    /**
     * Get time series data
     */
    static async getTimeSeries(
        intervalType: 'hour' | 'day' | 'week' = 'day',
        startDate?: string,
        endDate?: string
    ) {
        return this.getDashboardData({
            endpoint: 'time-series',
            intervalType,
            startDate,
            endDate
        })
    }

    /**
     * Get content performance data
     */
    static async getContentPerformance(startDate?: string, endDate?: string) {
        return this.getDashboardData({
            endpoint: 'content-performance',
            startDate,
            endDate
        })
    }

    /**
     * Check if the analytics API is available
     */
    static async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'OPTIONS',
            })
            return response.ok
        } catch {
            return false
        }
    }
}
