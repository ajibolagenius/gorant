/**
 * Open Graph image caching utilities
 *
 * This module provides caching mechanisms for Open Graph images to improve performance
 * and reduce the load on the image generation service.
 */

// Cache TTL in seconds
const DEFAULT_CACHE_TTL = 60 * 60 * 24; // 24 hours
const SHORT_CACHE_TTL = 60 * 60; // 1 hour for dynamic content
const ERROR_CACHE_TTL = 60 * 5; // 5 minutes for errors

// Cache invalidation strategy constants
const CACHE_VERSION = 'v1'; // Increment this to invalidate all caches
const CACHE_PREFIX = 'og-image';

// Performance monitoring
interface CacheMetrics {
    hits: number;
    misses: number;
    errors: number;
    totalGenerationTime: number;
    averageGenerationTime: number;
}

// In-memory cache metrics (in production, use Redis or similar)
const cacheMetrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    totalGenerationTime: 0,
    averageGenerationTime: 0,
};

// Cache invalidation patterns
const INVALIDATION_PATTERNS = {
    // Content-specific invalidation patterns
    rant: (id: string) => [`${CACHE_PREFIX}:${CACHE_VERSION}:type=rant&id=${id}`],
    user: (id: string) => [`${CACHE_PREFIX}:${CACHE_VERSION}:type=profile&id=${id}`],
    trending: () => [`${CACHE_PREFIX}:${CACHE_VERSION}:type=trending`],
    leaderboard: () => [`${CACHE_PREFIX}:${CACHE_VERSION}:type=leaderboard`],
    global: () => [`${CACHE_PREFIX}:${CACHE_VERSION}`], // Invalidate all
};

/**
 * Generate a cache key for an Open Graph image
 *
 * @param params - The URL search parameters used to generate the image
 * @returns A unique cache key
 */
export const generateCacheKey = (params: URLSearchParams): string => {
    // Sort parameters to ensure consistent cache keys
    const sortedParams = Array.from(params.entries())
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    return `${CACHE_PREFIX}:${CACHE_VERSION}:${sortedParams}`;
};

/**
 * Get cache control headers for Open Graph images
 *
 * @param ttl - Optional TTL in seconds (defaults to 24 hours)
 * @param isError - Whether this is an error response
 * @returns Cache control header value
 */
export const getCacheControlHeaders = (ttl = DEFAULT_CACHE_TTL, isError = false): string => {
    if (isError) {
        return `public, max-age=${ERROR_CACHE_TTL}, stale-while-revalidate=${ERROR_CACHE_TTL}`;
    }
    return `public, max-age=${ttl}, stale-while-revalidate=${ttl * 2}, s-maxage=${ttl}`;
};

/**
 * Determine appropriate cache TTL based on content type
 *
 * @param type - The type of Open Graph image
 * @param hasId - Whether the request includes a specific content ID
 * @returns Appropriate TTL in seconds
 */
export const getCacheTTL = (type: string, hasId = false): number => {
    switch (type) {
        case 'trending':
        case 'leaderboard':
            return SHORT_CACHE_TTL; // Dynamic content changes frequently
        case 'rant':
        case 'profile':
            return hasId ? DEFAULT_CACHE_TTL : SHORT_CACHE_TTL;
        case 'home':
        case 'about':
        case 'roadmap':
            return DEFAULT_CACHE_TTL * 7; // Static content can be cached longer
        default:
            return DEFAULT_CACHE_TTL;
    }
};

/**
 * Add cache headers to an API response
 *
 * @param response - The response object to add headers to
 * @param ttl - Optional TTL in seconds (defaults to 24 hours)
 * @param isError - Whether this is an error response
 * @returns The response with cache headers added
 */
export const addCacheHeaders = (response: Response, ttl = DEFAULT_CACHE_TTL, isError = false): Response => {
    const cacheControl = getCacheControlHeaders(ttl, isError);

    response.headers.set('Cache-Control', cacheControl);
    response.headers.set('CDN-Cache-Control', cacheControl);
    response.headers.set('Vercel-CDN-Cache-Control', cacheControl);

    // Add ETag for better caching
    const etag = `"${generateCacheKey(new URLSearchParams(response.url || ''))}"`;
    response.headers.set('ETag', etag);

    // Add Last-Modified header
    response.headers.set('Last-Modified', new Date().toUTCString());

    return response;
};

/**
 * Performance monitoring for image generation
 *
 * @param label - Label for the performance measurement
 * @returns A function to stop the timer and log the result
 */
export const startPerformanceTimer = (label: string): () => void => {
    const start = performance.now();

    return () => {
        const duration = performance.now() - start;
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    };
};

/**
 * Track image generation metrics
 *
 * @param type - The type of image generated
 * @param duration - The time taken to generate the image in ms
 * @param success - Whether the generation was successful
 * @param cacheHit - Whether this was a cache hit
 */
export const trackImageGeneration = (
    type: string,
    duration: number,
    success: boolean,
    cacheHit = false
): void => {
    // Update metrics
    if (cacheHit) {
        cacheMetrics.hits++;
    } else {
        cacheMetrics.misses++;
        cacheMetrics.totalGenerationTime += duration;
        cacheMetrics.averageGenerationTime = cacheMetrics.totalGenerationTime / cacheMetrics.misses;
    }

    if (!success) {
        cacheMetrics.errors++;
    }

    // Log performance data
    console.log(`[OG Image] ${cacheHit ? 'Cache hit' : 'Generated'} ${type} image in ${duration.toFixed(2)}ms (${success ? 'success' : 'failed'})`);

    // Log metrics periodically (every 100 requests)
    const totalRequests = cacheMetrics.hits + cacheMetrics.misses;
    if (totalRequests % 100 === 0) {
        console.log('[OG Image Metrics]', {
            totalRequests,
            cacheHitRate: ((cacheMetrics.hits / totalRequests) * 100).toFixed(2) + '%',
            averageGenerationTime: cacheMetrics.averageGenerationTime.toFixed(2) + 'ms',
            errorRate: ((cacheMetrics.errors / totalRequests) * 100).toFixed(2) + '%',
        });
    }
};

/**
 * Get cache metrics for monitoring
 *
 * @returns Current cache performance metrics
 */
export const getCacheMetrics = (): CacheMetrics => {
    return { ...cacheMetrics };
};

/**
 * Reset cache metrics (useful for testing)
 */
export const resetCacheMetrics = (): void => {
    cacheMetrics.hits = 0;
    cacheMetrics.misses = 0;
    cacheMetrics.errors = 0;
    cacheMetrics.totalGenerationTime = 0;
    cacheMetrics.averageGenerationTime = 0;
};

/**
 * Generate cache invalidation keys for specific content
 *
 * @param contentType - Type of content to invalidate
 * @param contentId - Optional content ID
 * @returns Array of cache keys to invalidate
 */
export const generateInvalidationKeys = (
    contentType: keyof typeof INVALIDATION_PATTERNS,
    contentId?: string
): string[] => {
    const pattern = INVALIDATION_PATTERNS[contentType];
    if (!pattern) return [];

    if (contentId && (contentType === 'rant' || contentType === 'user')) {
        return pattern(contentId);
    }

    return pattern();
};

/**
 * Determine if a cached image should be invalidated
 *
 * @param cacheKey - The cache key to check
 * @param maxAge - Maximum age in seconds before invalidation
 * @returns True if the cache should be invalidated
 */
export const shouldInvalidateCache = (
    cacheKey: string,
    maxAge = DEFAULT_CACHE_TTL
): boolean => {
    // Check if cache key matches any invalidation patterns
    const now = Date.now();

    // Extract parameters from cache key
    const keyParts = cacheKey.split(':');
    if (keyParts.length < 3) return false;

    const params = new URLSearchParams(keyParts[2]);
    const type = params.get('type');
    const id = params.get('id');

    // Check content-specific invalidation rules
    if (type === 'trending' || type === 'leaderboard') {
        // These should be invalidated more frequently
        return true;
    }

    // For content with IDs, check if the content has been updated
    if (id && (type === 'rant' || type === 'profile')) {
        // In a real implementation, this would check the database
        // for the last modified time of the content
        return false;
    }

    return false;
};

/**
 * Create a cache warming function for popular content
 *
 * @param popularContent - Array of popular content items to pre-generate
 */
export const warmCache = async (popularContent: Array<{ type: string; id?: string; data: any }>) => {
    console.log(`[OG Cache] Warming cache for ${popularContent.length} items`);

    for (const item of popularContent) {
        try {
            // This would typically make requests to the OG image API
            // to pre-generate and cache popular images
            const params = new URLSearchParams({
                type: item.type,
                ...(item.id && { id: item.id }),
                ...item.data,
            });

            console.log(`[OG Cache] Warmed cache for ${item.type}${item.id ? ` (${item.id})` : ''}`);
        } catch (error) {
            console.error(`[OG Cache] Failed to warm cache for ${item.type}:`, error);
        }
    }
};
