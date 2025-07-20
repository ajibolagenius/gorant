/**
 * Analytics Caching Layer
 * Provides caching for frequently accessed analytics data
 */

import { AnalyticsMetrics, PageMetric, EventTypeMetric, TimeSeriesData, ContentPerformanceMetric } from './analytics-db'

interface CacheEntry<T> {
    data: T
    timestamp: number
    expiresAt: number
}

interface CacheOptions {
    ttl: number // Time to live in milliseconds
    staleWhileRevalidate?: boolean // Whether to return stale data while fetching fresh data
}

/**
 * In-memory cache for analytics data
 */
class AnalyticsCache {
    private cache: Map<string, CacheEntry<any>> = new Map()
    private defaultTTL: number = 5 * 60 * 1000 // 5 minutes default TTL
    private revalidationCallbacks: Map<string, () => Promise<any>> = new Map()
    private pendingRevalidations: Set<string> = new Set()

    /**
     * Get a value from the cache
     * @param key Cache key
     * @returns Cached value or null if not found or expired
     */
    public get<T>(key: string): T | null {
        const entry = this.cache.get(key)

        if (!entry) {
            return null
        }

        const now = Date.now()

        // If entry is expired
        if (now > entry.expiresAt) {
            // Trigger revalidation if callback exists
            this.revalidateAsync(key)

            // Return null if completely expired
            if (now > entry.expiresAt + 60000) { // 1 minute grace period
                return null
            }

            // Return stale data during grace period
            return entry.data
        }

        return entry.data
    }

    /**
     * Set a value in the cache
     * @param key Cache key
     * @param value Value to cache
     * @param options Cache options
     */
    public set<T>(key: string, value: T, options?: Partial<CacheOptions>): void {
        const ttl = options?.ttl || this.defaultTTL

        this.cache.set(key, {
            data: value,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl
        })
    }

    /**
     * Register a revalidation callback for a cache key
     * @param key Cache key
     * @param callback Function to call when revalidation is needed
     */
    public registerRevalidation(key: string, callback: () => Promise<any>): void {
        this.revalidationCallbacks.set(key, callback)
    }

    /**
     * Trigger revalidation for a cache key asynchronously
     * @param key Cache key
     */
    private async revalidateAsync(key: string): Promise<void> {
        // Skip if already revalidating
        if (this.pendingRevalidations.has(key)) {
            return
        }

        const callback = this.revalidationCallbacks.get(key)
        if (!callback) {
            return
        }

        this.pendingRevalidations.add(key)

        try {
            // Execute callback in the background
            callback().then(newData => {
                if (newData) {
                    this.set(key, newData)
                }
            }).catch(err => {
                console.error(`Error revalidating cache for key ${key}:`, err)
            }).finally(() => {
                this.pendingRevalidations.delete(key)
            })
        } catch (err) {
            this.pendingRevalidations.delete(key)
            console.error(`Error initiating revalidation for key ${key}:`, err)
        }
    }

    /**
     * Get or set a value in the cache with automatic revalidation
     * @param key Cache key
     * @param fetcher Function to fetch the data if not in cache
     * @param options Cache options
     * @returns Cached or freshly fetched value
     */
    public async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        options?: Partial<CacheOptions>
    ): Promise<T> {
        // Check cache first
        const cachedValue = this.get<T>(key)

        if (cachedValue !== null) {
            return cachedValue
        }

        // Register revalidation callback
        this.registerRevalidation(key, fetcher)

        // Fetch fresh data
        try {
            const freshData = await fetcher()
            this.set(key, freshData, options)
            return freshData
        } catch (err) {
            console.error(`Error fetching data for cache key ${key}:`, err)
            throw err
        }
    }

    /**
     * Clear a specific key from the cache
     * @param key Cache key
     */
    public invalidate(key: string): void {
        this.cache.delete(key)
    }

    /**
     * Clear all cache entries
     */
    public clear(): void {
        this.cache.clear()
    }

    /**
     * Clear all cache entries matching a prefix
     * @param prefix Key prefix to match
     */
    public clearByPrefix(prefix: string): void {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key)
            }
        }
    }

    /**
     * Get cache statistics
     */
    public getStats(): { size: number, keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        }
    }
}

// Create singleton instance
export const analyticsCache = new AnalyticsCache()

// Helper functions for common analytics data caching

/**
 * Generate a cache key for analytics metrics
 */
function getMetricsCacheKey(startDate?: Date, endDate?: Date): string {
    const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
    const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
    return `metrics:${start}:${end}`
}

/**
 * Generate a cache key for top pages
 */
function getTopPagesCacheKey(limit: number, startDate?: Date, endDate?: Date): string {
    const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
    const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
    return `top-pages:${limit}:${start}:${end}`
}

/**
 * Generate a cache key for event counts
 */
function getEventCountsCacheKey(startDate?: Date, endDate?: Date): string {
    const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
    const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
    return `event-counts:${start}:${end}`
}

/**
 * Generate a cache key for time series data
 */
function getTimeSeriesCacheKey(intervalType: string, startDate?: Date, endDate?: Date): string {
    const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
    const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
    return `time-series:${intervalType}:${start}:${end}`
}

/**
 * Generate a cache key for content performance
 */
function getContentPerformanceCacheKey(startDate?: Date, endDate?: Date): string {
    const start = startDate ? startDate.toISOString().split('T')[0] : 'all'
    const end = endDate ? endDate.toISOString().split('T')[0] : 'now'
    return `content-performance:${start}:${end}`
}

// Export cache key generators for use in analytics-db.ts
export const cacheKeys = {
    getMetricsCacheKey,
    getTopPagesCacheKey,
    getEventCountsCacheKey,
    getTimeSeriesCacheKey,
    getContentPerformanceCacheKey
}
