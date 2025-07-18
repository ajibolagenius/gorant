import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    // Only apply middleware to analytics API routes
    if (request.nextUrl.pathname.startsWith('/api/analytics')) {
        // Add security headers
        const response = NextResponse.next()

        // Prevent caching of analytics data
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')

        // Add security headers
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('X-Frame-Options', 'DENY')
        response.headers.set('X-XSS-Protection', '1; mode=block')

        // Log analytics requests in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`Analytics API: ${request.method} ${request.nextUrl.pathname}`)
        }

        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/api/analytics/:path*'
}
