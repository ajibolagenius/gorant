/**
 * Analytics constants and configuration
 */

export const ANALYTICS_EVENTS = {
    // Page events
    PAGE_VIEW: 'pageview',

    // User actions
    USER_ACTION: 'user_action',
    LIKE_RANT: 'like_rant',
    BOOKMARK_RANT: 'bookmark_rant',
    SHARE_RANT: 'share_rant',
    REPORT_RANT: 'report_rant',
    BLOCK_USER: 'block_user',
    FOLLOW_TAG: 'follow_tag',
    UNFOLLOW_TAG: 'unfollow_tag',
    SEARCH: 'search',
    FILTER_BY_MOOD: 'filter_by_mood',
    CHANGE_SORT: 'change_sort',

    // Content events
    CONTENT_PERFORMANCE: 'content_performance',

    // Component lifecycle
    COMPONENT_MOUNT: 'component_mount',
    COMPONENT_UNMOUNT: 'component_unmount'
} as const

export const ANALYTICS_CONFIG = {
    MAX_STRING_LENGTH: 500,
    BATCH_SIZE: 10,
    FLUSH_INTERVAL: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    MAX_QUEUE_SIZE: 100
} as const

export const MOOD_COLORS = {
    angry: '#ef4444',
    sad: '#3b82f6',
    happy: '#22c55e',
    excited: '#f59e0b',
    frustrated: '#dc2626',
    grateful: '#10b981',
    anxious: '#8b5cf6',
    content: '#06b6d4',
    neutral: '#6b7280',
    crying: '#0ea5e9',
    heartbroken: '#ec4899',
    love: '#f43f5e',
    confused: '#f97316',
    tired: '#6366f1',
    confident: '#84cc16',
    default: '#6b7280'
} as const

export type MoodType = keyof typeof MOOD_COLORS
export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]
