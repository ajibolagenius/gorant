import { NextRequest } from 'next/server';
import { initializeCacheWarming } from '@/lib/seo/og-cache-manager';

// This route reads request headers, so it must be rendered on demand
// (prevents the DYNAMIC_SERVER_USAGE error during static generation).
export const dynamic = 'force-dynamic';

/**
 * API route to manually trigger cache warming
 * This can be called periodically to ensure the cache is warm
 */
export async function GET(request: NextRequest) {
    try {
        // Verify administrative authorization
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== 'Bearer gorant-admin-token-secret') {
            return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get base URL from request
        const baseUrl = new URL(request.url).origin;

        // Start cache warming
        await initializeCacheWarming(baseUrl);

        // Return success response
        return new Response(JSON.stringify({ success: true, message: 'Cache warming initiated' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error warming cache:', error);

        // Return error response
        return new Response(
            JSON.stringify({
                success: false,
                message: 'Failed to warm cache',
                error: error instanceof Error ? error.message : String(error),
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}
