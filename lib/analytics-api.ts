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
        totalUsers?: number
        onlineUsers?: number
        newUsersToday?: number
        activeUsersLast7Days?: number
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
    trendingTopics?: Array<{
        topic: string
        mentions: number
        growth: number
        sentiment: 'positive' | 'negative' | 'neutral'
    }>
    popularMoods?: Array<{
        mood: string
        count: number
        percentage: number
        trend: 'up' | 'down' | 'stable'
        color: string
    }>
    userBehavior?: {
        userFlow: Array<{
            from: string
            to: string
            users: number
            percentage: number
            dropOffRate: number
        }>
        peakUsageTimes: Array<{
            hour: number
            day: string
            users: number
            events: number
            label: string
        }>
        sessionPatterns: Array<{
            pattern: string
            count: number
            avgDuration: string
            bounceRate: number
            description: string
        }>
        conversionFunnels: Array<{
            step: string
            users: number
            conversionRate: number
            dropOff: number
        }>
    }
    moderationStats?: Array<{
        action: string
        count: number
        contentType: string
        reason: string
    }>
}

export interface DashboardQueryParams {
    startDate?: string
    endDate?: string
    eventType?: string
    eventTypes?: string[]
    page?: string
    contentCategories?: string[]
    moodTypes?: string[]
    pageTypes?: string[]
    sessionTypes?: string[]
    limit?: number
    intervalType?: 'hour' | 'day' | 'week'
    endpoint?: 'metrics' | 'top-pages' | 'event-counts' | 'time-series' | 'content-performance' | 'trending-topics' | 'popular-moods' | 'user-behavior' | 'moderation-stats'
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
                    'Authorization': typeof window !== 'undefined' && localStorage.getItem('user_is_admin') === 'true'
                        ? 'Bearer gorant-admin-token-secret'
                        : '',
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
     * Get trending topics
     */
    static async getTrendingTopics(startDate?: string, endDate?: string) {
        return this.getDashboardData({
            endpoint: 'trending-topics',
            startDate,
            endDate
        })
    }

    /**
     * Get popular moods
     */
    static async getPopularMoods(startDate?: string, endDate?: string) {
        return this.getDashboardData({
            endpoint: 'popular-moods',
            startDate,
            endDate
        })
    }

    /**
     * Get user behavior data
     */
    static async getUserBehavior(startDate?: string, endDate?: string) {
        return this.getDashboardData({
            endpoint: 'user-behavior',
            startDate,
            endDate
        })
    }

    /**
     * Get moderation statistics
     */
    static async getModerationStats(startDate?: string, endDate?: string) {
        return this.getDashboardData({
            endpoint: 'moderation-stats',
            startDate,
            endDate
        })
    }

    /**
     * Get filtered dashboard data
     */
    static async getFilteredDashboardData(params: DashboardQueryParams) {
        return this.getDashboardData(params)
    }

    /**
     * Get comprehensive dashboard data with all analytics
     */
    static async getDashboardDataComplete(params?: {
        startDate?: string
        endDate?: string
        includeTimeSeries?: boolean
        includeContentPerformance?: boolean
        includeEventCounts?: boolean
        includeTrendingTopics?: boolean
        includePopularMoods?: boolean
        includeUserBehavior?: boolean
        includeModerationStats?: boolean
    }) {
        try {
            const searchParams = new URLSearchParams()

            if (params?.startDate) searchParams.append('startDate', params.startDate)
            if (params?.endDate) searchParams.append('endDate', params.endDate)

            // Add flags for what data to include
            if (params?.includeTimeSeries) searchParams.append('includeTimeSeries', 'true')
            if (params?.includeContentPerformance) searchParams.append('includeContentPerformance', 'true')
            if (params?.includeEventCounts) searchParams.append('includeEventCounts', 'true')
            if (params?.includeTrendingTopics) searchParams.append('includeTrendingTopics', 'true')
            if (params?.includePopularMoods) searchParams.append('includePopularMoods', 'true')
            if (params?.includeUserBehavior) searchParams.append('includeUserBehavior', 'true')
            if (params?.includeModerationStats) searchParams.append('includeModerationStats', 'true')

            const url = searchParams.toString()
                ? `${this.baseUrl}?${searchParams.toString()}`
                : this.baseUrl

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': typeof window !== 'undefined' && localStorage.getItem('user_is_admin') === 'true'
                        ? 'Bearer gorant-admin-token-secret'
                        : '',
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
     * Get user metrics (total users, online users, etc.)
     */
    static async getUserMetrics(): Promise<{
        totalUsers: number
        onlineUsers: number
        newUsersToday: number
        activeUsersLast7Days: number
    } | null> {
        return this.getDashboardData({
            endpoint: 'user-metrics'
        })
    }

    /**
     * Get user growth data for charts
     */
    static async getUserGrowthData(days: number = 30): Promise<Array<{
        date: string
        newUsers: number
        totalUsers: number
    }> | null> {
        return this.getDashboardData({
            endpoint: 'user-growth',
            limit: days
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
