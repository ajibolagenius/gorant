/**
 * Analytics Database Utilities
 * Provides functions for interacting with analytics data in the database
 */

import { supabase } from './supabaseClient'

/**
 * Utility functions for common database operations
 */
class DatabaseUtils {
    static handleError(operation: string, error: any): void {
        console.error(`Analytics DB: Error ${operation}:`, error)
    }

    static handleException(operation: string, error: any): void {
        console.error(`Analytics DB: Exception ${operation}:`, error)
    }

    static async executeWithErrorHandling<T>(
        operation: string,
        fn: () => Promise<T>,
        fallback?: T
    ): Promise<T | null> {
        try {
            return await fn()
        } catch (error) {
            this.handleException(operation, error)
            return fallback ?? null
        }
    }
}

// Types for analytics data
export interface AnalyticsEvent {
    id?: string
    type: string
    page?: string | null
    timestamp: number
    sessionId: string
    details?: Record<string, string | number | boolean> | null
    userAgent?: string | null
    referrer?: string | null
    dnt?: boolean | null
}

export interface AnalyticsSession {
    id?: string
    sessionId: string
    firstSeen?: Date
    lastSeen?: Date
    pageViews?: number
    eventsCount?: number
    userAgent?: string
    referrer?: string
}

export interface AnalyticsMetrics {
    totalPageViews: number
    uniqueSessions: number
    totalEvents: number
    avgSessionDuration?: string
}

export interface PageMetric {
    page: string
    pageViews: number
    uniqueSessions: number
}

export interface EventTypeMetric {
    eventType: string
    eventCount: number
    uniqueSessions: number
}

export interface TimeSeriesData {
    timeBucket: string
    pageViews: number
    uniqueSessions: number
    totalEvents: number
}

export interface ContentPerformanceMetric {
    contentType: string
    actionType: string
    actionCount: number
    uniqueSessions: number
}

/**
 * Database utility functions for analytics operations
 */
export class AnalyticsDB {
    /**
     * Store an analytics event in the database
     */
    static async storeEvent(event: AnalyticsEvent): Promise<boolean> {
        if (!supabase) {
            console.warn('Analytics DB: Supabase not configured')
            return false
        }

        try {
            // First ensure the session exists
            await this.upsertSession(event.sessionId, event.userAgent, event.referrer)

            // Insert the event
            const { error } = await supabase
                .from('analytics_events')
                .insert({
                    type: event.type,
                    page: event.page,
                    timestamp: event.timestamp,
                    anonymous_id: event.sessionId,
                    details: event.details || {},
                    user_agent: event.userAgent,
                    referrer: event.referrer,
                    dnt: event.dnt || false
                })

            if (error) {
                console.error('Analytics DB: Error storing event:', error)
                return false
            }

            // Increment session events count
            await this.incrementSessionEvents(event.sessionId)

            return true
        } catch (error) {
            console.error('Analytics DB: Exception storing event:', error)
            return false
        }
    }

    /**
     * Store multiple analytics events in a batch
     */
    static async storeBatchEvents(events: AnalyticsEvent[]): Promise<boolean> {
        if (!supabase || events.length === 0) {
            return false
        }

        try {
            // Prepare session data for batch upsert
            const uniqueSessions = [...new Set(events.map(e => e.sessionId))]
            const sessionData = uniqueSessions.map(sessionId => {
                const event = events.find(e => e.sessionId === sessionId)
                return {
                    anonymous_id: sessionId,
                    user_agent: event?.userAgent || null,
                    referrer: event?.referrer || null,
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            })

            // Batch upsert sessions
            const { error: sessionError } = await supabase
                .from('analytics_sessions')
                .upsert(sessionData, { onConflict: 'anonymous_id' })

            if (sessionError) {
                console.error('Analytics DB: Error upserting sessions:', sessionError)
                return false
            }

            // Insert all events
            const eventData = events.map(event => ({
                type: event.type,
                page: event.page,
                timestamp: event.timestamp,
                anonymous_id: event.sessionId,
                details: event.details || {},
                user_agent: event.userAgent,
                referrer: event.referrer,
                dnt: event.dnt || false
            }))

            const { error: eventError } = await supabase
                .from('analytics_events')
                .insert(eventData)

            if (eventError) {
                console.error('Analytics DB: Error storing batch events:', eventError)
                return false
            }

            // Batch update session event counts
            const sessionEventCounts = new Map<string, number>()
            events.forEach(event => {
                const count = sessionEventCounts.get(event.sessionId) || 0
                sessionEventCounts.set(event.sessionId, count + 1)
            })

            // Update session counts in parallel
            const updatePromises = Array.from(sessionEventCounts.entries()).map(([sessionId, count]) =>
                supabase
                    .from('analytics_sessions')
                    .update({
                        events_count: supabase.raw(`events_count + ${count}`),
                        last_seen: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('anonymous_id', sessionId)
            )

            await Promise.all(updatePromises)

            return true
        } catch (error) {
            console.error('Analytics DB: Exception storing batch events:', error)
            return false
        }
    }

    /**
     * Upsert an analytics session (create or update)
     */
    static async upsertSession(sessionId: string, userAgent?: string, referrer?: string): Promise<boolean> {
        if (!supabase) {
            return false
        }

        try {
            // Use direct SQL instead of stored procedure for now
            const { error } = await supabase
                .from('analytics_sessions')
                .upsert({
                    anonymous_id: sessionId,
                    user_agent: userAgent,
                    referrer: referrer,
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'anonymous_id'
                })

            if (error) {
                console.error('Analytics DB: Error upserting session:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Analytics DB: Exception upserting session:', error)
            return false
        }
    }

    /**
     * Increment events count for a session
     */
    static async incrementSessionEvents(sessionId: string): Promise<boolean> {
        if (!supabase) {
            return false
        }

        try {
            // Use direct SQL update instead of stored procedure for now
            const { error } = await supabase
                .from('analytics_sessions')
                .update({
                    events_count: supabase.raw('events_count + 1'),
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('anonymous_id', sessionId)

            if (error) {
                console.error('Analytics DB: Error incrementing session events:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Analytics DB: Exception incrementing session events:', error)
            return false
        }
    }

    /**
     * Get analytics metrics for dashboard
     */
    static async getMetrics(startDate?: Date, endDate?: Date): Promise<AnalyticsMetrics | null> {
        if (!supabase) {
            // Return mock data when database is not available
            return {
                totalPageViews: 1247,
                uniqueSessions: 342,
                totalEvents: 2891,
                avgSessionDuration: "4m 32s"
            }
        }

        try {
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
                console.error('Analytics DB: Error getting metrics:', error)
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
            console.error('Analytics DB: Exception getting metrics:', error)
            return null
        }
    }

    /**
     * Get top pages by views
     */
    static async getTopPages(limit = 10, startDate?: Date, endDate?: Date): Promise<PageMetric[]> {
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
            let query = supabase
                .from('analytics_events')
                .select('page, anonymous_id')
                .eq('type', 'pageview')

            if (startDate) {
                query = query.gte('created_at', startDate.toISOString())
            }
            if (endDate) {
                query = query.lte('created_at', endDate.toISOString())
            }

            const { data, error } = await query

            if (error) {
                console.error('Analytics DB: Error getting top pages:', error)
                return []
            }

            if (!data || data.length === 0) {
                return []
            }

            // Group by page and calculate metrics
            const pageStats = new Map<string, { pageViews: number, sessions: Set<string> }>()

            data.forEach(event => {
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
            console.error('Analytics DB: Exception getting top pages:', error)
            return []
        }
    }

    /**
     * Get event counts by type
     */
    static async getEventCountsByType(startDate?: Date, endDate?: Date): Promise<EventTypeMetric[]> {
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
                console.error('Analytics DB: Error getting event counts:', error)
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
            console.error('Analytics DB: Exception getting event counts:', error)
            return []
        }
    }

    /**
     * Get time series data for charts
     */
    static async getTimeSeriesData(
        intervalType: 'hour' | 'day' | 'week' = 'day',
        startDate?: Date,
        endDate?: Date
    ): Promise<TimeSeriesData[]> {
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
                console.error('Analytics DB: Error getting time series data:', error)
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
            console.error('Analytics DB: Exception getting time series data:', error)
            return []
        }
    }

    /**
     * Get content performance analytics
     */
    static async getContentPerformance(startDate?: Date, endDate?: Date): Promise<ContentPerformanceMetric[]> {
        if (!supabase) {
            // Return mock data when database is not available
            return [
                { contentType: "rant", actionType: "view", actionCount: 1247, uniqueSessions: 342 },
                { contentType: "rant", actionType: "like", actionCount: 297, uniqueSessions: 123 },
                { contentType: "rant", actionType: "comment", actionCount: 89, uniqueSessions: 67 },
                { contentType: "challenge", actionType: "view", actionCount: 189, uniqueSessions: 89 }
            ]
        }

        try {
            let query = supabase
                .from('analytics_events')
                .select('type, details, anonymous_id')
                .neq('type', 'pageview') // Exclude pageviews from content performance

            if (startDate) {
                query = query.gte('created_at', startDate.toISOString())
            }
            if (endDate) {
                query = query.lte('created_at', endDate.toISOString())
            }

            const { data, error } = await query

            if (error) {
                console.error('Analytics DB: Error getting content performance:', error)
                return []
            }

            if (!data || data.length === 0) {
                return []
            }

            // Group by content type and action type
            const contentStats = new Map<string, { actionCount: number, sessions: Set<string> }>()

            data.forEach(event => {
                const contentType = (event.details as any)?.contentType || 'unknown'
                const actionType = event.type
                const key = `${contentType}:${actionType}`

                if (!contentStats.has(key)) {
                    contentStats.set(key, { actionCount: 0, sessions: new Set() })
                }
                const stats = contentStats.get(key)!
                stats.actionCount++
                stats.sessions.add(event.anonymous_id)
            })

            // Convert to array and sort by action count
            const result = Array.from(contentStats.entries())
                .map(([key, stats]) => {
                    const [contentType, actionType] = key.split(':')
                    return {
                        contentType,
                        actionType,
                        actionCount: stats.actionCount,
                        uniqueSessions: stats.sessions.size
                    }
                })
                .sort((a, b) => b.actionCount - a.actionCount)

            return result
        } catch (error) {
            console.error('Analytics DB: Exception getting content performance:', error)
            return []
        }
    }

    /**
     * Clean up old analytics data (data retention)
     */
    static async cleanupOldData(retentionDays = 365): Promise<number> {
        if (!supabase) {
            return 0
        }

        try {
            const { data, error } = await supabase.rpc('cleanup_old_analytics_data', {
                p_retention_days: retentionDays
            })

            if (error) {
                console.error('Analytics DB: Error cleaning up old data:', error)
                return 0
            }

            return data || 0
        } catch (error) {
            console.error('Analytics DB: Exception cleaning up old data:', error)
            return 0
        }
    }

    /**
     * Check if database connection is available
     */
    static isAvailable(): boolean {
        return supabase !== null
    }
}
