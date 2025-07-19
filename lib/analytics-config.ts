/**
 * Analytics Configuration
 * Centralized configuration for analytics system
 */

export interface AnalyticsConfig {
    enabled: boolean
    batchSize: number
    flushInterval: number
    maxRetries: number
    retryDelay: number
    maxQueueSize: number
    maxStringLength: number
    retentionDays: number
    rateLimits: {
        maxRequests: number
        windowMs: number
        dashboardMaxRequests: number
    }
}

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
    enabled: true,
    batchSize: 10,
    flushInterval: 5000, // 5 seconds
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    maxQueueSize: 1000,
    maxStringLength: 500,
    retentionDays: 365,
    rateLimits: {
        maxRequests: 100,
        windowMs: 60000, // 1 minute
        dashboardMaxRequests: 50
    }
}

export function getAnalyticsConfig(): AnalyticsConfig {
    // Allow environment variable overrides
    return {
        ...DEFAULT_ANALYTICS_CONFIG,
        enabled: process.env.ANALYTICS_ENABLED !== 'false',
        batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE || '10'),
        flushInterval: parseInt(process.env.ANALYTICS_FLUSH_INTERVAL || '5000'),
        maxRetries: parseInt(process.env.ANALYTICS_MAX_RETRIES || '3'),
        retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '365')
    }
}
