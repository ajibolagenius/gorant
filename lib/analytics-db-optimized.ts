/**
 * Optimized Analytics Database Utilities
 * Provides optimized functions for interacting with analytics data in the database
 */

import { supabase } from './supabaseClient'
import { analyticsCache, cacheKeys } from './analytics-cache'
import { AnalyticsMetrics, PageMetric, EventTypeMetric, TimeSeriesData, ContentPerformanceMetric } from './analytics-db'

/**
 * Optimized database utility functions for analytics operations
 */
export class AnalyticsDBOptimized {
    /**
     * Get analytics metrics using pre-aggregated data
     */
    static async getMetrics(startDate?: Date, endDate?: Date): Promise<AnalyticsMetrics | null> {
        const cacheKey = cacheKeys.getMetricsCacheKey(startDate, endDate)

        return analyticsCache.getOrSet<AnalyticsMetrics>(
            cacheKey,
            async () => {
                if (!supabase) {
                    return {
                        totalPageViews: 1247,
                        uniqueSessions: 342,
                        totalEvents: 2891,
                        avgSessionDuration: "4m 32s"
                    }
                }

                try {
                    // Try to get data from pre-aggregated analytics_aggregations table
                    let timePeriod = 'daily'
                    if (startDate && endDate) {
                        const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                        if (diffDays > 30) {
                            timePeriod = 'monthly'
                        } else if (diffDays > 7) {
                            timePeriod = 'weekly'
                        }
                    }

                    const { data: aggData, error: aggError } = await supabase
                        .from('analytics_aggregations')
                        .select('data')
                        .eq('aggregation_type', 'dashboard')
                        .eq('time_period', timePeriod)
                        .order('created_at', { ascending: false })
                        .limit(1)

                    if (!aggError && aggData && aggData.length > 0) {
                        const metrics = aggData[0].data
                        return {
                            totalPageViews: metrics.pageViews || 0,
                            uniqueSessitrics.uniqueSessions || 0,
                            totalEvents: metrics.totalEvents || 0,
                            avgSessionDuration: "4m 32s" // Simplified for now
                        }
                    }

                    // Fall back to direct query with date filters
                    let query = supabase
                        .from('analytics_events')
                        .select('type, anonymous_id, created_at')

                    if (startDate) {
                        query = query.gte('created_at', startDate.toISOString())
                    }
                    if (endDate) {
                        query = query.lte('created_at', endDate.toISOString())
                    }

                    const { data, error } = await query

                    if (error) {
                        console.error('Analytics DB Optimized: Error getting metrics:', error)
                        return null
                    }

                    if (!data || data.length === 0) {
                        return {
                            totalPageViews: 0,
                            uniqueSessions: 0,
                            totalEvents: 0
                        }
                    }

                    // Calculate metrics from the data
                    const totalEvents = data.length
                    const pageViews = data.filter(event => event.type === 'pageview').length
                    const uniqueSessions = new Set(data.map(event => event.anonymous_id)).size

                    return {
                        totalPageViews: pageViews,
                        uniqueSessions: uniqueSessions,
                        totalEvents: totalEvents,
                        avgSessionDuration: "0m" // Simplified for now
                    }
                } catch (error) {
                    console.error('Analytics DB Optimized: Exception getting metrics:', error)
                    return null
                }
            },
            { ttl: 5 * 60 * 1000 } // 5 minute cache
        )
    }

    /**
     * Get top pages using aggregation function
     */
    static async getTopPages(limit = 10, startDate?: Date, endDate?: Date): Promise<PageMetric[]> {
        const cacheKey = cacheKeys.getTopPagesCacheKey(limit, startDate, endDate)

        return analyticsCache.getOrSet<PageMetric[]>(
            cacheKey,
            async () => {
                if (!supabase) {
                    // Return mock data when database is not available
                    return [
                        { page: "/", pageViews: 456, uniqueSessions: 123 },
                        { page: "/bookmarks", pageViews: 234, uniqueSessions: 89 },
                        { page: "/challenges", pageViews: 189, uniqueSessions: 67 },
                        { page: "/leaderboard", pageViews: 156, uniqueSessions: 45 },
                        { page: "/admin", pageViews: 78, uniqueSessions: 23 }
                    ]
                }

                try {
                    // Use the aggregate_top_pages function if dates are provided
                    if (startDate && endDate) {
                        const { data, error } = await supabase.rpc('aggregate_top_pages', {
                            start_date: startDate.toISOString(),
                            end_date: endDate.toISOString()
                        })

                        if (!error && data) {
                            return data.slice(0, limit)
                        }
                    }

                    // Fall back to efficient paginated query
                    const { data, error } = await supabase.rpc('get_paginated_analytics_events', {
                        p_limit: 1000, // Get enough events to calculate top pages
                        p_event_type: 'pageview',
                        p_cursor_timestamp: null,
                        p_page: null
                    })

                    if (error) {
                        console.error('Analytics DB Optimized: Error getting top pages:', error)
                        return []
                    }

                    if (!data || data.length === 0) {
                        return []
                    }

                    // Filter by date if needed
                    let filteredData = data
                    if (startDate || endDate) {
                        filteredData = data.filter(event => {
                            const eventDate = new Date(event.created_at)
                            if (startDate && eventDate < startDate) return false
                            if (endDate && eventDate > endDate) return false
                            return true
                        })
                    }

                    // Group by page and calculate metrics
                    const pageStats = new Map<string, { pageViews: number, sessions: Set<string> }>()

                    filteredData.forEach(event => {
                        const page = event.page || '/'
                        if (!pageStats.has(page)) {
                            pageStats.set(page, { pageViews: 0, sessions: new Set() })
                        }
                        const stats = pageStats.get(page)!
                        stats.pageViews++
                        stats.sessions.add(event.anonymous_id)
                    })

                    // Convert to array and sort by page views
                    const result = Array.from(pageStats.entries())
                        .map(([page, stats]) => ({
                            page,
                            pageViews: stats.pageViews,
                            uniqueSessions: stats.sessions.size
                        }))
                        .sort((a, b) => b.pageViews - a.pageViews)
                        .slice(0, limit)

                    return result
                } catch (error) {
                    console.error('Analytics DB Optimized: Exception getting top pages:', error)
                    return []
                }
            },
            { ttl: 15 * 60 * 1000 } // 15 minute cache
        )
    }

    /**
     * Get event counts by type using aggregation function
     */
    static async getEventCountsByType(startDate?: Date, endDate?: Date): Promise<EventTypeMetric[]> {
        const cacheKey = cacheKeys.getEventCountsCacheKey(startDate, endDate)

        return analyticsCache.getOrSet<EventTypeMetric[]>(
            cacheKey,
            async () => {
                if (!supabase) {
                    // Return mock data when database is not available
                    return [
                        { eventType: "pageview", eventCount: 1247, uniqueSessions: 342 },
                        { eventType: "user_action", eventCount: 891, uniqueSessions: 234 },
                        { eventType: "rant_posted", eventCount: 456, uniqueSessions: 156 },
                        { eventType: "like_clicked", eventCount: 297, uniqueSessions: 123 }
                    ]
                }

                try {
                    // Use the aggregate_event_counts function if dates are provided
                    if (startDate && endDate) {
                        const { data, error } = await supabase.rpc('aggregate_event_counts', {
                            start_date: startDate.toISOString(),
                            end_date: endDate.toISOString()
                        })

                        if (!error && data) {
                            return data
                        }
                    }

                    // Fall back to direct query with efficient filtering
                    let query = supabase
                        .from('analytics_events')
                        .select('type, anonymous_id')

                    if (startDate) {
                        query = query.gte('created_at', startDate.toISOString())
                    }
                    if (endDate) {
                        query = query.lte('created_at', endDate.toISOString())
                    }

                    const { data, error } = await query

                    if (error) {
                        console.error('Analytics DB Optimized: Error getting event counts:', error)
                        return []
                    }

                    if (!data || data.length === 0) {
                        return []
                    }

                    // Group by event type and calculate metrics
                    const eventStats = new Map<string, { eventCount: number, sessions: Set<string> }>()

                    data.forEach(event => {
                        if (!eventStats.has(event.type)) {
                            eventStats.set(event.type, { eventCount: 0, sessions: new Set() })
                        }
                        const stats = eventStats.get(event.type)!
                        stats.eventCount++
                        stats.sessions.add(event.anonymous_id)
                    })

                    // Convert to array and sort by event count
                    const result = Array.from(eventStats.entries())
                        .map(([eventType, stats]) => ({
                            eventType,
                            eventCount: stats.eventCount,
                            uniqueSessions: stats.sessions.size
                        }))
                        .sort((a, b) => b.eventCount - a.eventCount)

                    return result
                } catch (error) {
                    console.error('Analytics DB Optimized: Exception getting event counts:', error)
                    return []
                }
            },
            { ttl: 10 * 60 * 1000 } // 10 minute cache
        )
    }

    /**
     * Get time series data using aggregation function
     */
    static async getTimeSeriesData(
        intervalType: 'hour' | 'day' | 'week' = 'day',
        startDate?: Date,
        endDate?: Date
    ): Promise<TimeSeriesData[]> {
        const cacheKey = cacheKeys.getTimeSeriesCacheKey(intervalType, startDate, endDate)

        return analyticsCache.getOrSet<TimeSeriesData[]>(
            cacheKey,
            async () => {
                if (!supabase) {
                    // Return mock data when database is not available
                    const mockData: TimeSeriesData[] = []
                    const days = 7
                    for (let i = days - 1; i >= 0; i--) {
                        const date = new Date()
                        date.setDate(date.getDate() - i)
                        mockData.push({
                            timeBucket: date.toISOString().split('T')[0],
                            pageViews: Math.floor(Math.random() * 200) + 50,
                            uniqueSessions: Math.floor(Math.random() * 50) + 20,
                            totalEvents: Math.floor(Math.random() * 400) + 100
                        })
                    }
                    return mockData
                }

                try {
                    // Use the aggregate_time_series function if dates are provided
                    if (startDate && endDate) {
                        const { data, error } = await supabase.rpc('aggregate_time_series', {
                            interval_type: intervalType,
                            start_date: startDate.toISOString(),
                            end_date: endDate.toISOString()
                        })

                        if (!error && data) {
                            return data
                        }
                    }

                    // Fall back to direct query with efficient date handling
                    let query = supabase
                        .from('analytics_events')
                        .select('type, anonymous_id, created_at')

                    if (startDate) {
                        query = query.gte('created_at', startDate.toISOString())
                    }
                    if (endDate) {
                        query = query.lte('created_at', endDate.toISOString())
                    }

                    const { data, error } = await query.order('created_at', { ascending: false })

                    if (error) {
                        console.error('Analytics DB Optimized: Error getting time series data:', error)
                        return []
                    }

                    if (!data || data.length === 0) {
                        return []
                    }

                    // Group by time bucket
                    const timeStats = new Map<string, { pageViews: number, sessions: Set<string>, totalEvents: number }>()

                    data.forEach(event => {
                        const date = new Date(event.created_at)
                        let timeBucket: string

                        switch (intervalType) {
                            case 'hour':
                                timeBucket = date.toISOString().substring(0, 13) + ':00:00.000Z'
                                break
                            case 'week':
                                const weekStart = new Date(date)
                                weekStart.setDate(date.getDate() - date.getDay())
                                timeBucket = weekStart.toISOString().split('T')[0]
                                break
                            default: // day
                                timeBucket = date.toISOString().split('T')[0]
                                break
                        }

                        if (!timeStats.has(timeBucket)) {
                            timeStats.set(timeBucket, { pageViews: 0, sessions: new Set(), totalEvents: 0 })
                        }
                        const stats = timeStats.get(timeBucket)!
                        stats.totalEvents++
                        if (event.type === 'pageview') {
                            stats.pageViews++
                        }
                        stats.sessions.add(event.anonymous_id)
                    })

                    // Convert to array and sort by time bucket
                    const result = Array.from(timeStats.entries())
                        .map(([timeBucket, stats]) => ({
                            timeBucket,
                            pageViews: stats.pageViews,
                            uniqueSessions: stats.sessions.size,
                            totalEvents: stats.totalEvents
                        }))
                        .sort((a, b) => b.timeBucket.localeCompare(a.timeBucket))

                    return result
                } catch (error) {
                    console.error('Analytics DB Optimized: Exception getting time series data:', error)
                    return []
                }
            },
            { ttl: 30 * 60 * 1000 } // 30 minute cache
        )
    }

    /**
     * Run the data retention cleanup function
     */
    static async runDataRetention(retentionDays: number = 365): Promise<boolean> {
        if (!supabase) {
            return false
        }

        try {
            const { error } = await supabase.rpc('cleanup_old_analytics_data', {
                retention_days: retentionDays
            })

            if (error) {
                console.error('Analytics DB Optimized: Error running data retention:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Analytics DB Optimized: Exception running data retention:', error)
            return false
        }
    }

    /**
     * Run the analytics aggregation process
     */
    static async runAggregation(): Promise<boolean> {
        if (!supabase) {
            return false
        }

        try {
            const { error } = await supabase.rpc('process_analytics_aggregations')

            if (error) {
                console.error('Analytics DB Optimized: Error running aggregation:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Analytics DB Optimized: Exception running aggregation:', error)
            return false
        }
    }

    /**
     * Get paginated analytics events
     */
    static async getPaginatedEvents(
        limit: number = 100,
        cursorTimestamp?: number,
        eventType?: string,
        page?: string
    ): Promise<{
        events: any[],
        nextCursor: number | null
    }> {
        if (!supabase) {
            return { events: [], nextCursor: null }
        }

        try {
            const { data, error } = await supabase.rpc('get_paginated_analytics_events', {
                p_limit: limit,
                p_cursor_timestamp: cursorTimestamp || null,
                p_event_type: eventType || null,
                p_page: page || null
            })

            if (error) {
                console.error('Analytics DB Optimized: Error getting paginated events:', error)
                return { events: [], nextCursor: null }
            }

            if (!data || data.length === 0) {
                return { events: [], nextCursor: null }
            }

            // Extract the next cursor from the last item
            const lastItem = data[data.length - 1]
            const nextCursor = lastItem.next_cursor

            return {
                events: data,
                nextCursor
            }
        } catch (error) {
            console.error('Analytics DB Optimized: Exception getting paginated events:', error)
            return { events: [], nextCursor: null }
        }
    }
}

export default AnalyticsDBOptimized
