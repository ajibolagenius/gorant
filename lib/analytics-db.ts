/**
 * Analytics Database Utilities
 * Provides functions for interacting with analytics data in the database
 */

import { supabase } from './supabaseClient'

// Types for analytics data
export interface AnalyticsEvent {
    id?: string
    type: string
    page?: string
    timestamp: number
    sessionId: string
    details?: Record<string, any>
    userAgent?: string
    referrer?: string
    dnt?: boolean
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
                    session_id: event.sessionId,
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
            // Ensure all sessions exist
            const uniqueSessions = [...new Set(events.map(e => e.sessionId))]
            for (const sessionId of uniqueSessions) {
                const event = events.find(e => e.sessionId === sessionId)
                await this.upsertSession(sessionId, event?.userAgent, event?.referrer)
            }

            // Insert all events
            const eventData = events.map(event => ({
                type: event.type,
                page: event.page,
                timestamp: event.timestamp,
                session_id: event.sessionId,
                details: event.details || {},
                user_agent: event.userAgent,
                referrer: event.referrer,
                dnt: event.dnt || false
            }))

            const { error } = await supabase
                .from('analytics_events')
                .insert(eventData)

            if (error) {
                console.error('Analytics DB: Error storing batch events:', error)
                return false
            }

            // Increment events count for each session
            for (const sessionId of uniqueSessions) {
                const sessionEventCount = events.filter(e => e.sessionId === sessionId).length
                for (let i = 0; i < sessionEventCount; i++) {
                    await this.incrementSessionEvents(sessionId)
                }
            }

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
            const { error } = await supabase.rpc('upsert_analytics_session', {
                p_session_id: sessionId,
                p_user_agent: userAgent,
                p_referrer: referrer
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
            const { error } = await supabase.rpc('increment_session_events', {
                p_session_id: sessionId
            })

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
            const { data, error } = await supabase.rpc('get_analytics_metrics', {
                p_start_date: startDate?.toISOString(),
                p_end_date: endDate?.toISOString()
            })

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

            const result = data[0]
            return {
                totalPageViews: parseInt(result.total_page_views) || 0,
                uniqueSessions: parseInt(result.unique_sessions) || 0,
                totalEvents: parseInt(result.total_events) || 0,
                avgSessionDuration: result.avg_session_duration
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
            const { data, error } = await supabase.rpc('get_top_pages', {
                p_limit: limit,
                p_start_date: startDate?.toISOString(),
                p_end_date: endDate?.toISOString()
            })

            if (error) {
                console.error('Analytics DB: Error getting top pages:', error)
                return []
            }

            return data?.map((row: any) => ({
                page: row.page,
                pageViews: parseInt(row.page_views) || 0,
                uniqueSessions: parseInt(row.unique_sessions) || 0
            })) || []
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
            const { data, error } = await supabase.rpc('get_event_counts_by_type', {
                p_start_date: startDate?.toISOString(),
                p_end_date: endDate?.toISOString()
            })

            if (error) {
                console.error('Analytics DB: Error getting event counts:', error)
                return []
            }

            return data?.map((row: any) => ({
                eventType: row.event_type,
                eventCount: parseInt(row.event_count) || 0,
                uniqueSessions: parseInt(row.unique_sessions) || 0
            })) || []
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
            const { data, error } = await supabase.rpc('get_analytics_time_series', {
                p_interval_type: intervalType,
                p_start_date: startDate?.toISOString(),
                p_end_date: endDate?.toISOString()
            })

            if (error) {
                console.error('Analytics DB: Error getting time series data:', error)
                return []
            }

            return data?.map((row: any) => ({
                timeBucket: row.time_bucket,
                pageViews: parseInt(row.page_views) || 0,
                uniqueSessions: parseInt(row.unique_sessions) || 0,
                totalEvents: parseInt(row.total_events) || 0
            })) || []
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
            const { data, error } = await supabase.rpc('get_content_performance', {
                p_start_date: startDate?.toISOString(),
                p_end_date: endDate?.toISOString()
            })

            if (error) {
                console.error('Analytics DB: Error getting content performance:', error)
                return []
            }

            return data?.map((row: any) => ({
                contentType: row.content_type,
                actionType: row.action_type,
                actionCount: parseInt(row.action_count) || 0,
                uniqueSessions: parseInt(row.unique_sessions) || 0
            })) || []
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
