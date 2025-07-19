import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsDB, AnalyticsEvent } from '@/lib/analytics-db'
import { z } from 'zod'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Validation schemas
const AnalyticsEventSchema = z.object({
    type: z.string().min(1).max(50),
    page: z.string().max(255).optional().nullable(),
    timestamp: z.number().int().positive(),
    sessionId: z.string().min(1).max(36),
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
    page: z.string().optional().nullable(),
    limit: z.number().int().min(1).max(1000).optional().nullable(),
    intervalType: z.enum(['hour', 'day', 'week']).optional().nullable()
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
                page: event.page || null,
                details: event.details || null,
                userAgent: event.userAgent || null,
                referrer: event.referrer || null,
                dnt: event.dnt || null
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
                page: validatedEvent.page || null,
                details: validatedEvent.details || null,
                userAgent: validatedEvent.userAgent || null,
                referrer: validatedEvent.referrer || null,
                dnt: validatedEvent.dnt || null
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
            page: searchParams.get('page') || null,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null,
            intervalType: searchParams.get('intervalType') as 'hour' | 'day' | 'week' | null
        }

        // Validate query parameters
        const validation = DashboardQuerySchema.safeParse(queryParams)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: validation.error.issues },
                { status: 400 }
            )
        }

        const { startDate, endDate, limit, intervalType } = validation.data

        // Parse dates
        const startDateObj = startDate ? new Date(startDate) : undefined
        const endDateObj = endDate ? new Date(endDate) : undefined

        // Get analytics data based on query type
        const endpoint = searchParams.get('endpoint')

        return await handleAnalyticsEndpoint(endpoint, {
            startDate: startDateObj,
            endDate: endDateObj,
            limit: limit || 10,
            intervalType: intervalType || 'day'
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
 * Handle different analytics endpoints
 */
async function handleAnalyticsEndpoint(
    endpoint: string | null,
    params: {
        startDate?: Date
        endDate?: Date
        limit: number
        intervalType: 'hour' | 'day' | 'week'
    }
) {
    const { startDate, endDate, limit, intervalType } = params

    switch (endpoint) {
        case 'metrics':
            const metrics = await AnalyticsDB.getMetrics(startDate, endDate)
            return NextResponse.json({ data: metrics })

        case 'top-pages':
            const topPages = await AnalyticsDB.getTopPages(limit, startDate, endDate)
            return NextResponse.json({ data: topPages })

        case 'event-counts':
            const eventCounts = await AnalyticsDB.getEventCountsByType(startDate, endDate)
            return NextResponse.json({ data: eventCounts })

        case 'time-series':
            const timeSeries = await AnalyticsDB.getTimeSeriesData(intervalType, startDate, endDate)
            return NextResponse.json({ data: timeSeries })

        case 'content-performance':
            const contentPerformance = await AnalyticsDB.getContentPerformance(startDate, endDate)
            return NextResponse.json({ data: contentPerformance })

        default:
            // Return comprehensive dashboard data
            const [
                dashboardMetrics,
                dashboardTopPages,
                dashboardEventCounts,
                dashboardTimeSeries,
                dashboardContentPerformance
            ] = await Promise.all([
                AnalyticsDB.getMetrics(startDate, endDate),
                AnalyticsDB.getTopPages(10, startDate, endDate),
                AnalyticsDB.getEventCountsByType(startDate, endDate),
                AnalyticsDB.getTimeSeriesData(intervalType, startDate, endDate),
                AnalyticsDB.getContentPerformance(startDate, endDate)
            ])

            return NextResponse.json({
                data: {
                    metrics: dashboardMetrics,
                    topPages: dashboardTopPages,
                    eventCounts: dashboardEventCounts,
                    timeSeries: dashboardTimeSeries,
                    contentPerformance: dashboardContentPerformance
                }
            })
    }
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
