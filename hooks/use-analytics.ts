import { useCallback, useEffect, useState } from 'react'
import { useSettings } from './use-settings'
import { analyticsService, AnalyticsEvent } from '@/lib/self-analytics'

export interface AnalyticsHook {
    trackEvent: (type: string, details?: Record<string, any>) => Promise<void>
    trackPageView: (page: string) => Promise<void>
    trackUserAction: (action: string, context?: Record<string, any>) => Promise<void>
    isEnabled: () => boolean
    setEnabled: (enabled: boolean) => void
    sessionId: string
    queueSize: number
}

export function useAnalytics(): AnalyticsHook {
    const { privacy } = useSettings()
    const [sessionId, setSessionId] = useState('')
    const [queueSize, setQueueSize] = useState(0)

    // Update session ID when analytics service initializes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSessionId(analyticsService.getSessionId())
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
        // Validate event type format
        if (!type || typeof type !== 'string') {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Analytics: Invalid event type provided')
            }
            return false
        }

        // Check for valid event type format (alphanumeric, underscore, hyphen)
        const validFormat = /^[a-zA-Z0-9_-]+$/.test(type)
        if (!validFormat) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Analytics: Event type must contain only alphanumeric characters, underscores, and hyphens')
            }
            return false
        }

        return true
    }, [])

    const sanitizeDetails = useCallback((details: Record<string, any> = {}): Record<string, any> => {
        const sanitized = { ...details }

        // Remove functions and undefined values
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'function' || sanitized[key] === undefined) {
                delete sanitized[key]
            }
        })

        // Limit object depth to prevent circular references
        const limitDepth = (obj: any, depth = 0): any => {
            if (depth > 3) return '[Object too deep]'
            if (obj === null || typeof obj !== 'object') return obj

            const limited: any = Array.isArray(obj) ? [] : {}
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    limited[key] = limitDepth(obj[key], depth + 1)
                }
            }
            return limited
        }

        return limitDepth(sanitized)
    }, [])

    const trackEvent = useCallback(async (type: string, details: Record<string, any> = {}): Promise<void> => {
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

    const trackUserAction = useCallback(async (action: string, context: Record<string, any> = {}): Promise<void> => {
        if (!privacy.shareAnalytics) {
            return
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
    }, [privacy.shareAnalytics, validateEventType, sanitizeDetails])

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

    return useCallback((action: string, context?: Record<string, any>) => {
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
