import { useCallback, useEffect, useState, useMemo } from 'react'
import { useSettings } from './use-settings'
import { analyticsService } from '@/lib/self-analytics'
import { AnalyticsValidator } from '@/lib/analytics-validation'

export interface AnalyticsHook {
    trackEvent: (type: string, details?: Record<string, unknown>) => Promise<void>
    trackPageView: (page: string) => Promise<void>
    trackUserAction: (action: string, context?: Record<string, unknown>) => Promise<void>
    isEnabled: () => boolean
    setEnabled: (enabled: boolean) => void
    sessionId: string
    userId: string
    queueSize: number
}

export function useAnalytics(): AnalyticsHook {
    const { privacy } = useSettings()
    const [sessionId, setSessionId] = useState('')
    const [userId, setUserId] = useState('')
    const [queueSize, setQueueSize] = useState(0)

    // Update session ID and user ID when analytics service initializes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSessionId(analyticsService.getSessionId())
            setUserId(analyticsService.getUserId())
        }
    }, [])

    // Monitor queue size for debugging
    useEffect(() => {
        const interval = setInterval(() => {
            setQueueSize(analyticsService.getQueueSize())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const validateEventType = useCallback((type: string): boolean => {
        const result = AnalyticsValidator.validateEventType(type)
        if (!result.isValid && process.env.NODE_ENV === 'development') {
            console.warn(`Analytics: ${result.error}`)
        }
        return result.isValid
    }, [])

    const sanitizeDetails = useCallback((details: Record<string, unknown> = {}): Record<string, unknown> => {
        return AnalyticsValidator.sanitizeDetails(details)
    }, [])

    const trackEvent = useCallback(async (type: string, details: Record<string, unknown> = {}): Promise<void> => {
        // Respect user privacy settings
        if (!privacy.shareAnalytics) {
            return
        }

        // Validate inputs
        if (!validateEventType(type)) {
            return
        }

        try {
            const sanitizedDetails = sanitizeDetails(details)
            await analyticsService.trackEvent(type, sanitizedDetails)
        } catch (error) {
            // Silent failure for analytics
            if (process.env.NODE_ENV === 'development') {
                console.warn('Analytics tracking failed:', error)
            }
        }
    }, [privacy.shareAnalytics, validateEventType, sanitizeDetails])

    const trackPageView = useCallback(async (page: string): Promise<void> => {
        if (!privacy.shareAnalytics || !page) {
            return
        }

        try {
            await analyticsService.trackEvent('pageview', {
                page: page.startsWith('/') ? page : `/${page}`,
                timestamp: Date.now(),
            })
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Page view tracking failed:', error)
            }
        }
    }, [privacy.shareAnalytics])

    const trackUserAction = useCallback(async (action: string, context: Record<string, unknown> = {}): Promise<void> => {
        if (!privacy.shareAnalytics) {
            return
        }

        // Skip detailed tracking if user hasn't opted in
        if (!privacy.detailedAnalytics) {
            // Only track basic actions even if detailed analytics is disabled
            const basicActions = ['post', 'like', 'bookmark', 'comment', 'view']
            if (!basicActions.some(basic => action.includes(basic))) {
                return
            }
        }

        // Validate action name
        if (!validateEventType(action)) {
            return
        }

        try {
            const sanitizedContext = sanitizeDetails(context)
            await analyticsService.trackEvent('user_action', {
                action,
                ...sanitizedContext,
                timestamp: Date.now(),
            })
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('User action tracking failed:', error)
            }
        }
    }, [privacy.shareAnalytics, privacy.detailedAnalytics, validateEventType, sanitizeDetails])

    const isEnabled = useCallback((): boolean => {
        return privacy.shareAnalytics && analyticsService.isEnabled()
    }, [privacy.shareAnalytics])

    const setEnabled = useCallback((enabled: boolean): void => {
        analyticsService.setEnabled(enabled)
    }, [])

    return {
        trackEvent,
        trackPageView,
        trackUserAction,
        isEnabled,
        setEnabled,
        sessionId,
        userId,
        queueSize,
    }
}

// Convenience hooks for specific tracking scenarios
export function usePageViewTracking() {
    const { trackPageView } = useAnalytics()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            trackPageView(window.location.pathname)
        }
    }, [trackPageView])
}

export function useUserActionTracking() {
    const { trackUserAction } = useAnalytics()

    return useCallback((action: string, context?: Record<string, unknown>) => {
        trackUserAction(action, context)
    }, [trackUserAction])
}

// Hook for tracking component lifecycle events
export function useComponentAnalytics(componentName: string) {
    const { trackEvent } = useAnalytics()

    useEffect(() => {
        trackEvent('component_mount', { component: componentName })

        return () => {
            trackEvent('component_unmount', { component: componentName })
        }
    }, [trackEvent, componentName])

    return { trackEvent }
}
