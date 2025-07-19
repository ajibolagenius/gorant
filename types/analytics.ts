/**
 * Analytics event types and interfaces
 */

export interface BaseAnalyticsEvent {
    timestamp: number
    sessionId: string
    page: string
}

export interface PageViewEvent extends BaseAnalyticsEvent {
    type: 'pageview'
    details: {
        page: string
        referrer?: string
        userAgent?: string
    }
}

export interface UserActionEvent extends BaseAnalyticsEvent {
    type: 'user_action'
    details: {
        action: string
        rantId?: string
        rantMood?: string
        rantTags?: string[]
        context?: Record<string, unknown>
    }
}

export interface ContentPerformanceEvent extends BaseAnalyticsEvent {
    type: 'content_performance'
    details: {
        totalRants: number
        averageLikes: number
        averageComments: number
        moodDistribution: Record<string, number>
        topTags: Array<{ tag: string; count: number }>
    }
}

export type AnalyticsEvent = PageViewEvent | UserActionEvent | ContentPerformanceEvent

// Event type guards
export function isPageViewEvent(event: AnalyticsEvent): event is PageViewEvent {
    return event.type === 'pageview'
}

export function isUserActionEvent(event: AnalyticsEvent): event is UserActionEvent {
    return event.type === 'user_action'
}

export function isContentPerformanceEvent(event: AnalyticsEvent): event is ContentPerformanceEvent {
    return event.type === 'content_performance'
}
