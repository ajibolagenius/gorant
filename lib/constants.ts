/**
 * Application constants and configuration
 */

export const APP_CONFIG = {
    // Pagination
    VIRTUALIZATION_THRESHOLD: 30,
    DEFAULT_PAGE_SIZE: 20,

    // Search
    SEARCH_DEBOUNCE_MS: 300,
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_SUGGESTIONS: 5,

    // Content limits
    MAX_RANT_LENGTH: 500,
    MAX_COMMENT_LENGTH: 200,
    MAX_TAGS_PER_RANT: 5,

    // Analytics
    ANALYTICS_BATCH_SIZE: 10,
    ANALYTICS_FLUSH_INTERVAL: 30000, // 30 seconds

    // Gamification
    POINTS: {
        LIKE: 1,
        COMMENT: 2,
        POST_RANT: 5,
        SHARE: 2,
        BOOKMARK: 1
    },

    // UI
    TOAST_DURATION: 3000,
    ANIMATION_DURATION: 200,

    // Local Storage Keys
    STORAGE_KEYS: {
        LIKED_RANTS: 'likedRants',
        BOOKMARKED_RANTS: 'bookmarkedRants',
        USER_SETTINGS: 'userSettings',
        ANALYTICS_QUEUE: 'analyticsQueue'
    }
} as const

export const MOOD_VALUES = [
    'sad', 'crying', 'happy', 'neutral', 'angry',
    'heartbroken', 'love', 'anxious', 'confused',
    'tired', 'excited', 'confident'
] as const

export const SORT_OPTIONS = [
    'latest', 'popular', 'most_liked', 'recommended'
] as const

export type MoodValue = typeof MOOD_VALUES[number]
export type SortOption = typeof SORT_OPTIONS[number]
