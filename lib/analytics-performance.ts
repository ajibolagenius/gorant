/**
 * Performance optimization module for analytics system
 * Implements caching, query optimization, and background processing
 */

export interface CacheConfig {
    enabled: boolean
    ttl: number // Time to live in milliseconds
    maxSize: number // Maximum number of cached items
}

export interface PerformanceMetrics {
    cacheHitRate: number
    averageQueryTime: number
    queueSize: number
    backgroundTasksActive: number
}

interface CacheEntry<T> {
    data: T
    timestamp: number
    hits: number
}

class AnalyticsPerformanceService {
    private cache = new Map<string, CacheEntry<any>>()
    private config: CacheConfig = {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 1000
    }

    private metrics = {
        cacheHits: 0,
        cacheMisses: 0,
        totalQueries: 0,
        totalQueryTime: 0,
        backgroundTasks: 0
    }

    private backgroundProcessingQueue: Array<() => Promise<void>> = []
    private isProcessingBackground = false

    /**
     * Get cached data or execute function and cache result
     */
    public async getCached<T>(
        key: string,
        fetchFunction: () => Promise<T>,
        customTTL?: number
    ): Promise<T> {
        if (!this.config.enabled) {
            return fetchFunction()
        }

        const startTime = Date.now()

        // Check cache first
        const cached = this.cache.get(key)
        if (cached && this.isCacheValid(cached, customTTL)) {
            cached.hits++
            this.metrics.cacheHits++
            return cached.data
        }

        // Cache miss - fetch data
        this.metrics.cacheMisses++
        const data = await fetchFunction()

        // Store in cache
        this.setCacheEntry(key, data, customTTL)

        // Update metrics
        const queryTime = Date.now() - startTime
        this.metrics.totalQueries++
        this.metrics.totalQueryTime += queryTime

        return data
    }

    /**
     * Set cache entry with automatic cleanup
     */
    private setCacheEntry<T>(key: string, data: T, customTTL?: number): void {
        // Clean up expired entries if cache is getting full
        if (this.cache.size >= this.config.maxSize) {
            this.cleanupExpiredEntries()
        }

        // If still at max size, remove least recently used entries
        if (this.cache.size >= this.config.maxSize) {
            this.removeLRUEntries(Math.floor(this.config.maxSize * 0.1))
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            hits: 0
        })
    }

    /**
     * Check if cache entry is still valid
     */
    private isCacheValid<T>(entry: CacheEntry<T>, customTTL?: number): boolean {
        const ttl = customTTL || this.config.ttl
        return (Date.now() - entry.timestamp) < ttl
    }

    /**
     * Clean up expired cache entries
     */
    private cleanupExpiredEntries(): void {
        const now = Date.now()
        const expiredKeys: string[] = []

        this.cache.forEach((entry, key) => {
            if (!this.isCacheValid(entry)) {
                expiredKeys.push(key)
            }
        })

        expiredKeys.forEach(key => this.cache.delete(key))
    }

    /**
     * Remove least recently used entries
     */
    private removeLRUEntries(count: number): void {
        const entries = Array.from(this.cache.entries())

        // Sort by hits (ascending) and timestamp (ascending) for LRU
        entries.sort((a, b) => {
            if (a[1].hits !== b[1].hits) {
                return a[1].hits - b[1].hits
            }
            return a[1].timestamp - b[1].timestamp
        })

        // Remove the least used entries
        for (let i = 0; i < Math.min(count, entries.length); i++) {
            this.cache.delete(entries[i][0])
        }
    }

    /**
     * Generate optimized cache key for analytics queries
     */
    public generateCacheKey(
        endpoint: string,
        params: Record<string, unknown>
    ): string {
        // Sort params for consistent key generation
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
                result[key] = params[key]
                return result
            }, {} as Record<string, unknown>)

        return `analytics:${endpoint}:${JSON.stringify(sortedParams)}`
    }

    /**
     * Invalidate cache entries matching pattern
     */
    public invalidateCache(pattern?: string): void {
        if (!pattern) {
            this.cache.clear()
            return
        }

        const keysToDelete: string[] = []
        this.cache.forEach((_, key) => {
            if (key.includes(pattern)) {
                keysToDelete.push(key)
            }
        })

        keysToDelete.forEach(key => this.cache.delete(key))
    }

    /**
     * Add task to background processing queue
     */
    public addBackgroundTask(task: () => Promise<void>): void {
        this.backgroundProcessingQueue.push(task)
        this.processBackgroundQueue()
    }

    /**
     * Process background tasks queue
     */
    private async processBackgroundQueue(): Promise<void> {
        if (this.isProcessingBackground || this.backgroundProcessingQueue.length === 0) {
            return
        }

        this.isProcessingBackground = true
        this.metrics.backgroundTasks++

        try {
            while (this.backgroundProcessingQueue.length > 0) {
                const task = this.backgroundProcessingQueue.shift()
                if (task) {
                    try {
                        await task()
                    } catch (error) {
                        console.warn('Background task failed:', error)
                    }
                }
            }
        } finally {
            this.isProcessingBackground = false
            this.metrics.backgroundTasks--
        }
    }

    /**
     * Optimize database query parameters
     */
    public optimizeQueryParams(params: {
        startDate?: Date
        endDate?: Date
        limit?: number
        offset?: number
        [key: string]: unknown
    }): {
        startDate?: Date
        endDate?: Date
        limit: number
        offset: number
        [key: string]: unknown
    } {
        const optimized = { ...params }

        // Set reasonable defaults
        optimized.limit = Math.min(params.limit || 100, 1000)
        optimized.offset = Math.max(params.offset || 0, 0)

        // Ensure date range is reasonable
        if (params.startDate && params.endDate) {
            const daysDiff = (params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24)

            // Limit to 1 year of data for performance
            if (daysDiff > 365) {
                optimized.startDate = new Date(params.endDate.getTime() - (365 * 24 * 60 * 60 * 1000))
            }
        }

        return optimized as typeof optimized & { limit: number; offset: number }
    }

    /**
     * Create database indexes for common queries
     */
    public getRecommendedIndexes(): string[] {
        return [
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events (timestamp DESC)',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_type_timestamp ON analytics_events (type, timestamp DESC)',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_page_timestamp ON analytics_events (page, timestamp DESC)',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_session_timestamp ON analytics_events (session_id, timestamp DESC)',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_user_timestamp ON analytics_events (user_id, timestamp DESC)',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_sessions_active_last_seen ON analytics_sessions (is_active, last_seen DESC)',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_users_last_seen ON analytics_users (last_seen DESC)',
            'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_events_details_gin ON analytics_events USING GIN (details)',
        ]
    }

    /**
     * Batch multiple analytics operations for efficiency
     */
    public async batchOperations<T>(
        operations: Array<() => Promise<T>>,
        batchSize = 10
    ): Promise<T[]> {
        const results: T[] = []

        for (let i = 0; i < operations.length; i += batchSize) {
            const batch = operations.slice(i, i + batchSize)
            const batchResults = await Promise.all(batch.map(op => op()))
            results.push(...batchResults)
        }

        return results
    }

    /**
     * Debounce function for frequent operations
     */
    public debounce<T extends (...args: any[]) => any>(
        func: T,
        delay: number
    ): (...args: Parameters<T>) => void {
        let timeoutId: NodeJS.Timeout

        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => func(...args), delay)
        }
    }

    /**
     * Throttle function for rate limiting
     */
    public throttle<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean

        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func(...args)
                inThrottle = true
                setTimeout(() => inThrottle = false, limit)
            }
        }
    }

    /**
     * Get performance metrics
     */
    public getMetrics(): PerformanceMetrics {
        const cacheHitRate = this.metrics.cacheHits + this.metrics.cacheMisses > 0
            ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
            : 0

        const averageQueryTime = this.metrics.totalQueries > 0
            ? this.metrics.totalQueryTime / this.metrics.totalQueries
            : 0

        return {
            cacheHitRate,
            averageQueryTime,
            queueSize: this.backgroundProcessingQueue.length,
            backgroundTasksActive: this.metrics.backgroundTasks
        }
    }

    /**
     * Reset performance metrics
     */
    public resetMetrics(): void {
        this.metrics = {
            cacheHits: 0,
            cacheMisses: 0,
            totalQueries: 0,
            totalQueryTime: 0,
            backgroundTasks: 0
        }
    }

    /**
     * Update cache configuration
     */
    public updateConfig(newConfig: Partial<CacheConfig>): void {
        this.config = { ...this.config, ...newConfig }

        // Clear cache if disabled
        if (!this.config.enabled) {
            this.cache.clear()
        }
    }

    /**
     * Get cache statistics
     */
    public getCacheStats(): {
        size: number
        maxSize: number
        hitRate: number
        oldestEntry: number
        newestEntry: number
    } {
        let oldestTimestamp = Date.now()
        let newestTimestamp = 0

        this.cache.forEach(entry => {
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp
            }
            if (entry.timestamp > newestTimestamp) {
                newestTimestamp = entry.timestamp
            }
        })

        return {
            size: this.cache.size,
            maxSize: this.config.maxSize,
            hitRate: this.getMetrics().cacheHitRate,
            oldestEntry: oldestTimestamp,
            newestEntry: newestTimestamp
        }
    }
}

// Create singleton instance
export const analyticsPerformance = new AnalyticsPerformanceService()

// Export convenience functions
export function getCachedData<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
): Promise<T> {
    return analyticsPerformance.getCached(key, fetchFunction, ttl)
}

export function invalidateAnalyticsCache(pattern?: string): void {
    analyticsPerformance.invalidateCache(pattern)
}

export function addBackgroundTask(task: () => Promise<void>): void {
    analyticsPerformance.addBackgroundTask(task)
}

export function optimizeQuery(params: Record<string, unknown>) {
    return analyticsPerformance.optimizeQueryParams(params)
}

export function getPerformanceMetrics(): PerformanceMetrics {
    return analyticsPerformance.getMetrics()
}
