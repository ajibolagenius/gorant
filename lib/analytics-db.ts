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
    userId?: string
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
            // First ensure the user exists if userId is provided
            if (event.userId) {
                await this.upsertUser(event.userId)
            }

            // Ensure the session exists
            await this.upsertSession(event.sessionId, event.userAgent || undefined, event.referrer || undefined)

            // Insert the event
            const { error } = await supabase
                .from('analytics_events')
                .insert({
                    type: event.type,
                    page: event.page,
                    timestamp: event.timestamp,
                    session_id: event.sessionId,
                    user_id: event.userId,
                    details: event.details || {},
                    user_agent: event.userAgent,
                    referrer: event.referrer,
                    dnt: event.dnt || false
                })

            if (error) {
                console.error('Analytics DB: Error storing event:', error)
                return false
            }

            // Increment session events count and update activity
            await this.incrementSessionEvents(event.sessionId)

            // Update session activity if userId is provided
            if (event.userId) {
                await this.updateSessionActivity(event.sessionId, event.userId, true)
            }

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
                    user_id: event?.userId || null,
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
                session_id: event.sessionId,
                user_id: event.userId,
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
                        events_count: count, // Will be handled by database trigger or manual increment
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
                    // events_count will be incremented by database trigger
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
                .select('type, user_id, anonymous_id, created_at')

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
            const uniqueSessions = new Set(data.map(event => event.anonymous_id || event.user_id)).size

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
     * Get trending topics based on event details
     */
    static async getTrendingTopics(startDate?: Date, endDate?: Date): Promise<Array<{
        topic: string
        mentions: number
        growth: number
        sentiment: 'positive' | 'negative' | 'neutral'
    }>> {
        if (!supabase) {
            // Return mock data when database is not available
            return [
                { topic: 'work-stress', mentions: 234, growth: 45, sentiment: 'negative' },
                { topic: 'coding-bugs', mentions: 189, growth: 23, sentiment: 'negative' },
                { topic: 'team-collaboration', mentions: 156, growth: -12, sentiment: 'neutral' },
                { topic: 'project-deadlines', mentions: 134, growth: 67, sentiment: 'negative' },
                { topic: 'remote-work', mentions: 98, growth: 15, sentiment: 'positive' }
            ]
        }

        try {
            let query = supabase
                .from('analytics_events')
                .select('details, created_at')
                .not('details', 'is', null)

            if (startDate) {
                query = query.gte('created_at', startDate.toISOString())
            }
            if (endDate) {
                query = query.lte('created_at', endDate.toISOString())
            }

            const { data, error } = await query

            if (error) {
                console.error('Analytics DB: Error getting trending topics:', error)
                return []
            }

            if (!data || data.length === 0) {
                return []
            }

            // Extract topics from event details and calculate trends
            const topicCounts = new Map<string, number>()

            data.forEach(event => {
                const details = event.details as any
                if (details?.tags) {
                    const tags = Array.isArray(details.tags) ? details.tags : [details.tags]
                    tags.forEach((tag: string) => {
                        const count = topicCounts.get(tag) || 0
                        topicCounts.set(tag, count + 1)
                    })
                }
                if (details?.mood) {
                    const count = topicCounts.get(details.mood) || 0
                    topicCounts.set(details.mood, count + 1)
                }
            })

            // Convert to array and sort by mentions
            const result = Array.from(topicCounts.entries())
                .map(([topic, mentions]) => ({
                    topic,
                    mentions,
                    growth: Math.floor(Math.random() * 100) - 20, // Mock growth calculation
                    sentiment: mentions > 100 ? 'negative' : mentions > 50 ? 'neutral' : 'positive' as const
                }))
                .sort((a, b) => b.mentions - a.mentions)
                .slice(0, 10)

            return result
        } catch (error) {
            console.error('Analytics DB: Exception getting trending topics:', error)
            return []
        }
    }

    /**
     * Get popular moods from analytics data
     */
    static async getPopularMoods(startDate?: Date, endDate?: Date): Promise<Array<{
        mood: string
        count: number
        percentage: number
        trend: 'up' | 'down' | 'stable'
        color: string
    }>> {
        if (!supabase) {
            // Return mock data when database is not available
            return [
                { mood: 'frustrated', count: 456, percentage: 32, trend: 'up', color: 'orange' },
                { mood: 'angry', count: 342, percentage: 24, trend: 'up', color: 'red' },
                { mood: 'sad', count: 289, percentage: 20, trend: 'stable', color: 'blue' },
                { mood: 'neutral', count: 178, percentage: 12, trend: 'down', color: 'gray' },
                { mood: 'happy', count: 123, percentage: 8, trend: 'up', color: 'green' }
            ]
        }

        try {
            let query = supabase
                .from('analytics_events')
                .select('details')
                .not('details', 'is', null)

            if (startDate) {
                query = query.gte('created_at', startDate.toISOString())
            }
            if (endDate) {
                query = query.lte('created_at', endDate.toISOString())
            }

            const { data, error } = await query

            if (error) {
                console.error('Analytics DB: Error getting popular moods:', error)
                return []
            }

            if (!data || data.length === 0) {
                return []
            }

            // Extract moods from event details
            const moodCounts = new Map<string, number>()
            let totalMoods = 0

            data.forEach(event => {
                const details = event.details as any
                if (details?.mood) {
                    const count = moodCounts.get(details.mood) || 0
                    moodCounts.set(details.mood, count + 1)
                    totalMoods++
                }
            })

            // Convert to array with percentages
            const result = Array.from(moodCounts.entries())
                .map(([mood, count]) => ({
                    mood,
                    count,
                    percentage: Math.round((count / totalMoods) * 100),
                    trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable' as const,
                    color: mood === 'angry' ? 'red' : mood === 'sad' ? 'blue' : mood === 'happy' ? 'green' : 'gray'
                }))
                .sort((a, b) => b.count - a.count)

            return result
        } catch (error) {
            console.error('Analytics DB: Exception getting popular moods:', error)
            return []
        }
    }

    /**
     * Get user behavior flow data
     */
    static async getUserBehaviorData(startDate?: Date, endDate?: Date): Promise<{
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
    }> {
        if (!supabase) {
            // Return mock data when database is not available
            return {
                userFlow: [
                    { from: 'Home', to: 'Bookmarks', users: 234, percentage: 45, dropOffRate: 12 },
                    { from: 'Home', to: 'Trending', users: 189, percentage: 36, dropOffRate: 8 },
                    { from: 'Bookmarks', to: 'Rant Detail', users: 123, percentage: 53, dropOffRate: 20 }
                ],
                peakUsageTimes: [
                    { hour: 9, day: 'Mon', users: 234, events: 1247, label: '9 AM Monday' },
                    { hour: 14, day: 'Wed', users: 189, events: 987, label: '2 PM Wednesday' },
                    { hour: 20, day: 'Fri', users: 267, events: 1456, label: '8 PM Friday' }
                ],
                sessionPatterns: [
                    { pattern: 'Quick Browse', count: 456, avgDuration: '2m 34s', bounceRate: 65, description: 'Users who view 1-3 pages and leave quickly' },
                    { pattern: 'Deep Engagement', count: 234, avgDuration: '12m 45s', bounceRate: 15, description: 'Users who interact extensively with content' }
                ],
                conversionFunnels: [
                    { step: 'Landing', users: 1000, conversionRate: 100, dropOff: 0 },
                    { step: 'Browse Content', users: 750, conversionRate: 75, dropOff: 250 },
                    { step: 'Engage', users: 450, conversionRate: 45, dropOff: 300 }
                ]
            }
        }

        try {
            // This would require more complex queries in a real implementation
            // For now, return mock data with some real data integration
            const metrics = await this.getMetrics(startDate, endDate)

            return {
                userFlow: [
                    { from: 'Home', to: 'Bookmarks', users: Math.floor((metrics?.uniqueSessions || 100) * 0.4), percentage: 40, dropOffRate: 12 },
                    { from: 'Home', to: 'Trending', users: Math.floor((metrics?.uniqueSessions || 100) * 0.3), percentage: 30, dropOffRate: 8 },
                    { from: 'Bookmarks', to: 'Rant Detail', users: Math.floor((metrics?.uniqueSessions || 100) * 0.2), percentage: 50, dropOffRate: 20 }
                ],
                peakUsageTimes: [
                    { hour: 9, day: 'Mon', users: Math.floor((metrics?.uniqueSessions || 100) * 0.3), events: Math.floor((metrics?.totalEvents || 100) * 0.2), label: '9 AM Monday' },
                    { hour: 14, day: 'Wed', users: Math.floor((metrics?.uniqueSessions || 100) * 0.25), events: Math.floor((metrics?.totalEvents || 100) * 0.15), label: '2 PM Wednesday' },
                    { hour: 20, day: 'Fri', users: Math.floor((metrics?.uniqueSessions || 100) * 0.35), events: Math.floor((metrics?.totalEvents || 100) * 0.25), label: '8 PM Friday' }
                ],
                sessionPatterns: [
                    { pattern: 'Quick Browse', count: Math.floor((metrics?.uniqueSessions || 100) * 0.6), avgDuration: '2m 34s', bounceRate: 65, description: 'Users who view 1-3 pages and leave quickly' },
                    { pattern: 'Deep Engagement', count: Math.floor((metrics?.uniqueSessions || 100) * 0.4), avgDuration: '12m 45s', bounceRate: 15, description: 'Users who interact extensively with content' }
                ],
                conversionFunnels: [
                    { step: 'Landing', users: metrics?.uniqueSessions || 100, conversionRate: 100, dropOff: 0 },
                    { step: 'Browse Content', users: Math.floor((metrics?.uniqueSessions || 100) * 0.75), conversionRate: 75, dropOff: Math.floor((metrics?.uniqueSessions || 100) * 0.25) },
                    { step: 'Engage', users: Math.floor((metrics?.uniqueSessions || 100) * 0.45), conversionRate: 45, dropOff: Math.floor((metrics?.uniqueSessions || 100) * 0.3) }
                ]
            }
        } catch (error) {
            console.error('Analytics DB: Exception getting user behavior data:', error)
            return {
                userFlow: [],
                peakUsageTimes: [],
                sessionPatterns: [],
                conversionFunnels: []
            }
        }
    }

    /**
     * Get moderation statistics
     */
    static async getModerationStats(startDate?: Date, endDate?: Date): Promise<Array<{
        action: string
        count: number
        contentType: string
        reason: string
    }>> {
        if (!supabase) {
            // Return mock data when database is not available
            return [
                { action: 'content_removed', count: 23, contentType: 'rant', reason: 'inappropriate_language' },
                { action: 'content_flagged', count: 45, contentType: 'comment', reason: 'spam' },
                { action: 'user_warned', count: 12, contentType: 'rant', reason: 'harassment' },
                { action: 'content_approved', count: 156, contentType: 'rant', reason: 'false_positive' }
            ]
        }

        try {
            let query = supabase
                .from('analytics_events')
                .select('type, details')
                .eq('type', 'moderation_action')

            if (startDate) {
                query = query.gte('created_at', startDate.toISOString())
            }
            if (endDate) {
                query = query.lte('created_at', endDate.toISOString())
            }

            const { data, error } = await query

            if (error) {
                console.error('Analytics DB: Error getting moderation stats:', error)
                return []
            }

            if (!data || data.length === 0) {
                // Return mock data if no moderation events found
                return [
                    { action: 'content_approved', count: 156, contentType: 'rant', reason: 'false_positive' },
                    { action: 'content_flagged', count: 12, contentType: 'comment', reason: 'spam' }
                ]
            }

            // Process moderation events
            const moderationStats = new Map<string, { count: number, contentType: string, reason: string }>()

            data.forEach(event => {
                const details = event.details as any
                const action = details?.action || 'unknown'
                const contentType = details?.contentType || 'unknown'
                const reason = details?.reason || 'unknown'
                const key = `${action}:${contentType}:${reason}`

                if (!moderationStats.has(key)) {
                    moderationStats.set(key, { count: 0, contentType, reason })
                }
                moderationStats.get(key)!.count++
            })

            // Convert to array
            const result = Array.from(moderationStats.entries())
                .map(([key, stats]) => {
                    const [action] = key.split(':')
                    return {
                        action,
                        count: stats.count,
                        contentType: stats.contentType,
                        reason: stats.reason
                    }
                })
                .sort((a, b) => b.count - a.count)

            return result
        } catch (error) {
            console.error('Analytics DB: Exception getting moderation stats:', error)
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
     * Get user metrics (total users and online users)
     */
    static async getUserMetrics(): Promise<{
        totalUsers: number
        onlineUsers: number
        newUsersToday: number
        activeUsersLast7Days: number
    } | null> {
        if (!supabase) {
            // Return mock data when database is not available
            return {
                totalUsers: 1247,
                onlineUsers: 89,
                newUsersToday: 23,
                activeUsersLast7Days: 456
            }
        }

        try {
            // Use the database function for better performance
            const { data, error } = await supabase.rpc('get_user_metrics')

            if (error) {
                console.error('Analytics DB: Error getting user metrics:', error)
                return null
            }

            if (!data || data.length === 0) {
                return {
                    totalUsers: 0,
                    onlineUsers: 0,
                    newUsersToday: 0,
                    activeUsersLast7Days: 0
                }
            }

            const metrics = data[0]
            return {
                totalUsers: parseInt(metrics.total_users) || 0,
                onlineUsers: parseInt(metrics.online_users) || 0,
                newUsersToday: parseInt(metrics.new_users_today) || 0,
                activeUsersLast7Days: parseInt(metrics.active_users_last_7_days) || 0
            }
        } catch (error) {
            console.error('Analytics DB: Exception getting user metrics:', error)
            return null
        }
    }

    /**
     * Upsert user record (create or update user activity)
     */
    static async upsertUser(userId: string): Promise<boolean> {
        if (!supabase || !userId) {
            return false
        }

        try {
            const { error } = await supabase
                .from('analytics_users')
                .upsert({
                    id: userId,
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                })

            if (error) {
                console.error('Analytics DB: Error upserting user:', error)
                return false
            }

            return true
        } catch (error) {
            console.error('Analytics DB: Exception upserting user:', error)
            return false
        }
    }

    /**
     * Update session with user ID and activity status
     */
    static async updateSessionActivity(sessionId: string, userId: string, isActive: boolean = true): Promise<boolean> {
        if (!supabase || !sessionId || !userId) {
            return false
        }

        try {
            const { error } = await supabase
                .from('analytics_sessions')
                .update({
                    user_id: userId,
                    is_active: isActive,
                    last_seen: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', sessionId)

            if (error) {
                console.error('Analytics DB: Error updating session activity:', error)
                return false
            }

            // Also update user record
            await this.upsertUser(userId)

            return true
        } catch (error) {
            console.error('Analytics DB: Exception updating session activity:', error)
            return false
        }
    }

    /**
     * Get user growth data for charts
     */
    static async getUserGrowthData(days: number = 30): Promise<Array<{
        date: string
        newUsers: number
        totalUsers: number
    }>> {
        if (!supabase) {
            // Return mock data when database is not available
            const mockData = []
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                mockData.push({
                    date: date.toISOString().split('T')[0],
                    newUsers: Math.floor(Math.random() * 20) + 5,
                    totalUsers: 1000 + (days - i) * 15
                })
            }
            return mockData
        }

        try {
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - days)

            const { data, error } = await supabase
                .from('analytics_users')
                .select('first_seen')
                .gte('first_seen', startDate.toISOString())
                .order('first_seen', { ascending: true })

            if (error) {
                console.error('Analytics DB: Error getting user growth data:', error)
                return []
            }

            if (!data || data.length === 0) {
                return []
            }

            // Group by date and calculate cumulative totals
            const dailyNewUsers = new Map<string, number>()

            data.forEach(user => {
                const date = new Date(user.first_seen).toISOString().split('T')[0]
                const count = dailyNewUsers.get(date) || 0
                dailyNewUsers.set(date, count + 1)
            })

            // Create array with cumulative totals
            const result = []
            let cumulativeTotal = 0

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const dateStr = date.toISOString().split('T')[0]

                const newUsers = dailyNewUsers.get(dateStr) || 0
                cumulativeTotal += newUsers

                result.push({
                    date: dateStr,
                    newUsers,
                    totalUsers: cumulativeTotal
                })
            }

            return result
        } catch (error) {
            console.error('Analytics DB: Exception getting user growth data:', error)
            return []
        }
    }

    /**
     * Check if database connection is available
     */
    static isAvailable(): boolean {
        return supabase !== null
    }

    /**
     * Enforce data retention policies and clean up old data
     * This should be called periodically (e.g., daily via cron job)
     */
    static async enforceDataRetention(retentionDays = 365): Promise<{
        eventsDeleted: number
        sessionsDeleted: number
        usersDeleted: number
        totalDeleted: number
    }> {
        if (!this.isAvailable()) {
            console.warn('AnalyticsDB not available for data retention enforcement')
            return { eventsDeleted: 0, sessionsDeleted: 0, usersDeleted: 0, totalDeleted: 0 }
        }

        try {
            const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000))
            const cutoffTimestamp = cutoffDate.getTime()

            // Delete old analytics events
            const { count: eventsDeleted } = await supabase
                .from('analytics_events')
                .delete()
                .lt('timestamp', cutoffTimestamp)

            // Delete old sessions
            const { count: sessionsDeleted } = await supabase
                .from('analytics_sessions')
                .delete()
                .lt('last_seen', cutoffDate.toISOString())

            // Delete old user activity records
            const { count: usersDeleted } = await supabase
                .from('analytics_users')
                .delete()
                .lt('last_seen', cutoffDate.toISOString())

            const totalDeleted = (eventsDeleted || 0) + (sessionsDeleted || 0) + (usersDeleted || 0)

            console.log(`Data retention cleanup completed: ${totalDeleted} records deleted`)

            return {
                eventsDeleted: eventsDeleted || 0,
                sessionsDeleted: sessionsDeleted || 0,
                usersDeleted: usersDeleted || 0,
                totalDeleted
            }
        } catch (error) {
            DatabaseUtils.handleError('enforce data retention', error)
            return { eventsDeleted: 0, sessionsDeleted: 0, usersDeleted: 0, totalDeleted: 0 }
        }
    }

    /**
     * Get data retention statistics
     */
    static async getDataRetentionStats(retentionDays = 365): Promise<{
        totalEvents: number
        eventsToDelete: number
        totalSessions: number
        sessionsToDelete: number
        totalUsers: number
        usersToDelete: number
        oldestRecord: Date | null
        retentionDate: Date
    }> {
        if (!this.isAvailable()) {
            return {
                totalEvents: 0,
                eventsToDelete: 0,
                totalSessions: 0,
                sessionsToDelete: 0,
                totalUsers: 0,
                usersToDelete: 0,
                oldestRecord: null,
                retentionDate: new Date()
            }
        }

        try {
            const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000))

            // Get event statistics
            const { count: totalEvents } = await supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })

            const { count: eventsToDelete } = await supabase
                .from('analytics_events')
                .select('*', { count: 'exact', head: true })
                .lt('timestamp', cutoffDate.getTime())

            // Get session statistics
            const { count: totalSessions } = await supabase
                .from('analytics_sessions')
                .select('*', { count: 'exact', head: true })

            const { count: sessionsToDelete } = await supabase
                .from('analytics_sessions')
                .select('*', { count: 'exact', head: true })
                .lt('last_seen', cutoffDate.toISOString())

            // Get user statistics
            const { count: totalUsers } = await supabase
                .from('analytics_users')
                .select('*', { count: 'exact', head: true })

            const { count: usersToDelete } = await supabase
                .from('analytics_users')
                .select('*', { count: 'exact', head: true })
                .lt('last_seen', cutoffDate.toISOString())

            // Get oldest record
            const { data: oldestEvent } = await supabase
                .from('analytics_events')
                .select('timestamp')
                .order('timestamp', { ascending: true })
                .limit(1)

            const oldestRecord = oldestEvent?.[0]?.timestamp
                ? new Date(oldestEvent[0].timestamp)
                : null

            return {
                totalEvents: totalEvents || 0,
                eventsToDelete: eventsToDelete || 0,
                totalSessions: totalSessions || 0,
                sessionsToDelete: sessionsToDelete || 0,
                totalUsers: totalUsers || 0,
                usersToDelete: usersToDelete || 0,
                oldestRecord,
                retentionDate: cutoffDate
            }
        } catch (error) {
            DatabaseUtils.handleError('get data retention stats', error)
            return {
                totalEvents: 0,
                eventsToDelete: 0,
                totalSessions: 0,
                sessionsToDelete: 0,
                totalUsers: 0,
                usersToDelete: 0,
                oldestRecord: null,
                retentionDate: cutoffDate
            }
        }
    }
}
