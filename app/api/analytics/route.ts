import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsDB, AnalyticsEvent } from '@/lib/analytics-db'
import { AnalyticsValidator } from '@/lib/analytics-validation'
import { analyticsPrivacy } from '@/lib/analytics-privacy'
import { analyticsPerformance } from '@/lib/analytics-performance'
import { analyticsCache } from '@/lib/analytics-cache'
import { z } from 'zod'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Validation schemas
const AnalyticsEventSchema = z.object({
    type: z.string().min(1).max(50),
    page: z.string().max(255).optional().nullable(),
    timestamp: z.number().int().positive(),
    sessionId: z.string().min(1).max(36),
    userId: z.string().min(1).max(36).optional().nullable(),
    details: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().nullable(),
    userAgent: z.string().optional().nullable(),
    referrer: z.string().optional().nullable(),
    dnt: z.boolean().optional().nullable()
})

const BatchEventsSchema = z.object({
    events: z.array(AnalyticsEventSchema).min(1).max(100)
})

const DashboardQuerySchema = z.object({
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
    eventType: z.string().optional().nullable(),
    eventTypes: z.array(z.string()).optional().nullable(),
    page: z.string().optional().nullable(),
    contentCategories: z.array(z.string()).optional().nullable(),
    moodTypes: z.array(z.string()).optional().nullable(),
    pageTypes: z.array(z.string()).optional().nullable(),
    sessionTypes: z.array(z.string()).optional().nullable(),
    limit: z.number().int().min(1).max(1000).optional().nullable(),
    intervalType: z.enum(['hour', 'day', 'week']).optional().nullable(),
    includeTimeSeries: z.boolean().optional().nullable(),
    includeContentPerformance: z.boolean().optional().nullable(),
    includeEventCounts: z.boolean().optional().nullable(),
    includeTrendingTopics: z.boolean().optional().nullable(),
    includePopularMoods: z.boolean().optional().nullable(),
    includeUserBehavior: z.boolean().optional().nullable(),
    includeModerationStats: z.boolean().optional().nullable()
})

/**
 * Rate limiting function
 */
function checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now()
    const windowStart = now - windowMs

    const current = rateLimitStore.get(identifier)

    if (!current || current.resetTime < windowStart) {
        rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
        return true
    }

    if (current.count >= maxRequests) {
        return false
    }

    current.count++
    return true
}

/**
 * API Response helper class
 */
class ApiResponse {
    static success(data?: Record<string, unknown>, stored = true) {
        return NextResponse.json({ success: true, stored, ...data })
    }

    static error(message: string, status: number, details?: Record<string, unknown>) {
        return NextResponse.json({ error: message, details }, { status })
    }

    static rateLimited() {
        return this.error('Rate limit exceeded', 429)
    }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    return `${ip}-${userAgent.slice(0, 50)}`
}

/**
 * POST /api/analytics - Store analytics events
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(request)
        if (!checkRateLimit(clientId)) {
            return ApiResponse.rateLimited()
        }

        // Check if analytics DB is available
        if (!AnalyticsDB.isAvailable()) {
            console.warn('Analytics DB not available, skipping event storage')
            return ApiResponse.success(undefined, false)
        }

        const body = await request.json()

        // Handle single event or batch events
        let events: AnalyticsEvent[]

        if (body.events && Array.isArray(body.events)) {
            // Batch events
            const validation = BatchEventsSchema.safeParse(body)
            if (!validation.success) {
                return NextResponse.json(
                    { error: 'Invalid batch events format', details: validation.error.issues },
                    { status: 400 }
                )
            }
            events = validation.data.events.map(event => ({
                ...event,
                page: event.page || undefined,
                userId: event.userId || undefined,
                // Sanitize details to remove PII before storage
                details: event.details ? AnalyticsValidator.sanitizeDetails(event.details) : undefined,
                userAgent: event.userAgent || undefined,
                referrer: event.referrer || undefined,
                dnt: event.dnt || undefined
            }))
        } else {
            // Single event
            const validation = AnalyticsEventSchema.safeParse(body)
            if (!validation.success) {
                return NextResponse.json(
                    { error: 'Invalid event format', details: validation.error.issues },
                    { status: 400 }
                )
            }
            const validatedEvent = validation.data
            events = [{
                ...validatedEvent,
                page: validatedEvent.page || undefined,
                userId: validatedEvent.userId || undefined,
                // Sanitize details to remove PII before storage
                details: validatedEvent.details ? AnalyticsValidator.sanitizeDetails(validatedEvent.details) : undefined,
                userAgent: validatedEvent.userAgent || undefined,
                referrer: validatedEvent.referrer || undefined,
                dnt: validatedEvent.dnt || undefined
            }]
        }

        // Store events in database
        let success: boolean
        if (events.length === 1) {
            success = await AnalyticsDB.storeEvent(events[0])
        } else {
            success = await AnalyticsDB.storeBatchEvents(events)
        }

        if (!success) {
            console.error('Failed to store analytics events')
            // Return success to avoid impacting user experience
            return ApiResponse.success(undefined, false)
        }

        return ApiResponse.success({ eventCount: events.length })

    } catch (error) {
        console.error('Analytics API error:', error)
        // Always return success to avoid impacting user experience
        return NextResponse.json({ success: true, stored: false })
    }
}

/**
 * GET /api/analytics - Retrieve analytics data for dashboard
 */
export async function GET(request: NextRequest) {
    try {
        // Verify administrative authorization
        const authHeader = request.headers.get('Authorization')
        if (authHeader !== 'Bearer gorant-admin-token-secret') {
            return ApiResponse.error('Unauthorized', 401)
        }

        // Rate limiting for dashboard queries
        const clientId = getClientIdentifier(request)
        if (!checkRateLimit(clientId, 50, 60000)) {
            return ApiResponse.rateLimited()
        }

        // Check if analytics DB is available - if not, we'll still return mock data
        const dbAvailable = AnalyticsDB.isAvailable()
        if (!dbAvailable) {
            console.warn('Analytics DB not available, returning mock data')
        }

        const { searchParams } = new URL(request.url)
        const queryParams = {
            startDate: searchParams.get('startDate') || null,
            endDate: searchParams.get('endDate') || null,
            eventType: searchParams.get('eventType') || null,
            eventTypes: searchParams.get('eventTypes') ? searchParams.get('eventTypes')!.split(',') : null,
            page: searchParams.get('page') || null,
            contentCategories: searchParams.get('contentCategories') ? searchParams.get('contentCategories')!.split(',') : null,
            moodTypes: searchParams.get('moodTypes') ? searchParams.get('moodTypes')!.split(',') : null,
            pageTypes: searchParams.get('pageTypes') ? searchParams.get('pageTypes')!.split(',') : null,
            sessionTypes: searchParams.get('sessionTypes') ? searchParams.get('sessionTypes')!.split(',') : null,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null,
            intervalType: searchParams.get('intervalType') as 'hour' | 'day' | 'week' | null,
            includeTimeSeries: searchParams.get('includeTimeSeries') === 'true',
            includeContentPerformance: searchParams.get('includeContentPerformance') === 'true',
            includeEventCounts: searchParams.get('includeEventCounts') === 'true',
            includeTrendingTopics: searchParams.get('includeTrendingTopics') === 'true',
            includePopularMoods: searchParams.get('includePopularMoods') === 'true',
            includeUserBehavior: searchParams.get('includeUserBehavior') === 'true',
            includeModerationStats: searchParams.get('includeModerationStats') === 'true'
        }

        // Validate query parameters
        const validation = DashboardQuerySchema.safeParse(queryParams)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: validation.error.issues },
                { status: 400 }
            )
        }

        const validatedParams = validation.data

        // Audit log dashboard access for compliance
        // Note: In production, this should be sent to a secure audit logging service or DB
        try {
            if (analyticsPrivacy.logAuditEvent) {
                analyticsPrivacy.logAuditEvent(
                    'dashboard_access',
                    { queryParams: validatedParams },
                    undefined, // userId (if available)
                    clientId // sessionId or client identifier
                )
            }
        } catch (auditError) {
            console.warn('Failed to log audit event:', auditError)
            // Don't fail the entire request if audit logging fails
        }

        // Parse dates
        const startDateObj = validatedParams.startDate ? new Date(validatedParams.startDate) : undefined
        const endDateObj = validatedParams.endDate ? new Date(validatedParams.endDate) : undefined

        // Get analytics data based on query type
        const endpoint = searchParams.get('endpoint')

        return await handleAnalyticsEndpoint(endpoint, {
            ...validatedParams,
            startDate: startDateObj,
            endDate: endDateObj,
            limit: validatedParams.limit || 10,
            intervalType: validatedParams.intervalType || 'day'
        })

    } catch (error) {
        console.error('Analytics dashboard API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * Handle different analytics endpoints with performance optimizations
 */
async function handleAnalyticsEndpoint(
    endpoint: string | null,
    params: {
        startDate?: Date
        endDate?: Date
        limit: number
        intervalType: 'hour' | 'day' | 'week'
        eventTypes?: string[] | null
        contentCategories?: string[] | null
        moodTypes?: string[] | null
        pageTypes?: string[] | null
        sessionTypes?: string[] | null
        includeTimeSeries?: boolean | null
        includeContentPerformance?: boolean | null
        includeEventCounts?: boolean | null
        includeTrendingTopics?: boolean | null
        includePopularMoods?: boolean | null
        includeUserBehavior?: boolean | null
        includeModerationStats?: boolean | null
    }
) {
    const { startDate, endDate, limit, intervalType } = params

    // Generate cache key for the entire response
    const generateCacheKey = () => {
        const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
        const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
        const includes = [
            params.includeTimeSeries ? 'time' : '',
            params.includeContentPerformance ? 'content' : '',
            params.includeEventCounts ? 'events' : '',
            params.includeTrendingTopics ? 'trending' : '',
            params.includePopularMoods ? 'moods' : '',
            params.includeUserBehavior ? 'behavior' : '',
            params.includeModerationStats ? 'moderation' : ''
        ].filter(Boolean).join('-')

        return `api:${endpoint || 'dashboard'}:${start}:${end}:${limit}:${intervalType}:${includes}`
    }

    // Try to get from cache first for GET requests
    const cacheKey = generateCacheKey()
    const cachedResponse = analyticsCache.get(cacheKey)
    if (cachedResponse) {
        return NextResponse.json(cachedResponse)
    }

    // If not in cache, fetch the data
    let responseData: any

    switch (endpoint) {
        case 'metrics':
            // Use optimized metrics function
            const metrics = await analyticsPerformance.getMetrics(startDate, endDate)
            responseData = { data: metrics }
            break

        case 'top-pages':
            // Use optimized top pages function
            const topPages = await analyticsPerformance.getTopPages(limit, startDate, endDate)
            responseData = { data: topPages }
            break

        case 'event-counts':
            // Use optimized event counts function
            const eventCounts = await analyticsPerformance.getEventCountsByType(startDate, endDate)
            responseData = { data: eventCounts }
            break

        case 'time-series':
            // Use optimized time series function
            const timeSeries = await analyticsPerformance.getTimeSeriesData(intervalType, startDate, endDate)
            responseData = { data: timeSeries }
            break

        case 'content-performance':
            // Use optimized content performance function
            const contentPerformance = await analyticsPerformance.getContentPerformance(startDate, endDate)
            responseData = { data: contentPerformance }
            break

        case 'trending-topics':
            const trendingTopics = await AnalyticsDB.getTrendingTopics(startDate, endDate)
            responseData = { data: trendingTopics }
            break

        case 'popular-moods':
            const popularMoods = await AnalyticsDB.getPopularMoods(startDate, endDate)
            responseData = { data: popularMoods }
            break

        case 'user-behavior':
            const userBehavior = await AnalyticsDB.getUserBehaviorData(startDate, endDate)
            responseData = { data: userBehavior }
            break

        case 'moderation-stats':
            const moderationStats = await AnalyticsDB.getModerationStats(startDate, endDate)
            responseData = { data: moderationStats }
            break

        case 'user-metrics':
            const userMetrics = await AnalyticsDB.getUserMetrics()
            responseData = { data: userMetrics }
            break

        case 'user-growth':
            const userGrowthData = await AnalyticsDB.getUserGrowthData(limit)
            responseData = { data: userGrowthData }
            break

        case 'cache-stats':
            // Special endpoint to get cache statistics (for debugging)
            const cacheStats = analyticsPerformance.getCacheStats()
            responseData = { data: cacheStats }
            break

        case 'clear-cache':
            // Special endpoint to clear cache (for debugging)
            analyticsPerformance.clearAllCaches()
            responseData = { success: true, message: 'Cache cleared' }
            break

        default:
            // Return comprehensive dashboard data based on include flags
            // Use Promise.all for parallel execution of queries
            const promises: Promise<any>[] = []
            const dataKeys: string[] = []

            // Always include basic metrics
            promises.push(analyticsPerformance.getMetrics(startDate, endDate))
            dataKeys.push('metrics')

            promises.push(analyticsPerformance.getTopPages(10, startDate, endDate))
            dataKeys.push('topPages')

            if (params.includeEventCounts) {
                promises.push(analyticsPerformance.getEventCountsByType(startDate, endDate))
                dataKeys.push('eventCounts')
            }

            if (params.includeTimeSeries) {
                promises.push(analyticsPerformance.getTimeSeriesData(intervalType, startDate, endDate))
                dataKeys.push('timeSeries')
            }

            if (params.includeContentPerformance) {
                promises.push(analyticsPerformance.getContentPerformance(startDate, endDate))
                dataKeys.push('contentPerformance')
            }

            if (params.includeTrendingTopics) {
                promises.push(AnalyticsDB.getTrendingTopics(startDate, endDate))
                dataKeys.push('trendingTopics')
            }

            if (params.includePopularMoods) {
                promises.push(AnalyticsDB.getPopularMoods(startDate, endDate))
                dataKeys.push('popularMoods')
            }

            if (params.includeUserBehavior) {
                promises.push(AnalyticsDB.getUserBehaviorData(startDate, endDate))
                dataKeys.push('userBehavior')
            }

            if (params.includeModerationStats) {
                promises.push(AnalyticsDB.getModerationStats(startDate, endDate))
                dataKeys.push('moderationStats')
            }

            // If no specific includes are set, include basic dashboard data
            if (!params.includeTimeSeries && !params.includeContentPerformance && !params.includeEventCounts) {
                promises.push(analyticsPerformance.getEventCountsByType(startDate, endDate))
                dataKeys.push('eventCounts')

                promises.push(analyticsPerformance.getTimeSeriesData(intervalType, startDate, endDate))
                dataKeys.push('timeSeries')

                promises.push(analyticsPerformance.getContentPerformance(startDate, endDate))
                dataKeys.push('contentPerformance')
            }

            const results = await Promise.all(promises)

            const data: any = {}
            results.forEach((result, index) => {
                data[dataKeys[index]] = result
            })

            responseData = { data }
    }

    // Cache the response for future requests
    analyticsCache.set(cacheKey, responseData, { ttl: 5 * 60 * 1000 }) // 5 minute cache

    return NextResponse.json(responseData)
}

/**
 * OPTIONS - Handle CORS preflight requests
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
