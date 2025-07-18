/**
 * Analytics API Usage Examples
 * Demonstrates how to use the analytics API endpoints
 */

import { AnalyticsAPI } from './analytics-api'
import { trackEvent } from './self-analytics'

/**
 * Example: Track a page view
 */
export async function trackPageView(page: string) {
    await trackEvent('pageview', { page })
}

/**
 * Example: Track user actions
 */
export async function trackUserAction(action: string, context: Record<string, any> = {}) {
    await trackEvent('user_action', { action, ...context })
}

/**
 * Example: Track rant interactions
 */
export async function trackRantInteraction(rantId: string, action: 'like' | 'comment' | 'bookmark' | 'share', mood?: string) {
    await trackEvent('rant_action', {
        rantId,
        action,
        mood,
        contentType: 'rant'
    })
}

/**
 * Example: Track content performance
 */
export async function trackContentPerformance(contentType: string, action: string, details: Record<string, any> = {}) {
    await trackEvent('content_interaction', {
        contentType,
        action,
        ...details
    })
}

/**
 * Example: Get dashboard data for admin
 */
export async function getDashboardMetrics(dateRange?: { start: string; end: string }) {
    try {
        const data = await AnalyticsAPI.getDashboardData({
            startDate: dateRange?.start,
            endDate: dateRange?.end
        })

        return data
    } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error)
        return null
    }
}

/**
 * Example: Get top pages for the last 7 days
 */
export async function getTopPagesLastWeek() {
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    return await AnalyticsAPI.getTopPages(10, startDate, endDate)
}

/**
 * Example: Get time series data for charts
 */
export async function getAnalyticsTimeSeries(days = 30, interval: 'hour' | 'day' | 'week' = 'day') {
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    return await AnalyticsAPI.getTimeSeries(interval, startDate, endDate)
}

/**
 * Example: Get content performance metrics
 */
export async function getContentAnalytics(days = 30) {
    const endDate = new Date().toISOString()
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    return await AnalyticsAPI.getContentPerformance(startDate, endDate)
}

/**
 * Example: Check if analytics is working
 */
export async function checkAnalyticsHealth() {
    const isApiAvailable = await AnalyticsAPI.isAvailable()
    const isDbAvailable = AnalyticsDB.isAvailable()

    return {
        api: isApiAvailable,
        database: isDbAvailable,
        overall: isApiAvailable || isDbAvailable
    }
}
