import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useAnalytics, usePageViewTracking, useUserActionTracking, useComponentAnalytics } from '../use-analytics'

// Mock the settings hook
vi.mock('../use-settings', () => ({
    useSettings: vi.fn(() => ({
        privacy: {
            shareAnalytics: true
        }
    }))
}))

// Mock the analytics service
const mockAnalyticsService = {
    trackEvent: vi.fn().mockResolvedValue(undefined),
    getSessionId: vi.fn().mockReturnValue('test-session-123'),
    getUserId: vi.fn().mockReturnValue('test-user-456'),
    getQueueSize: vi.fn().mockReturnValue(0),
    isEnabled: vi.fn().mockReturnValue(true),
    setEnabled: vi.fn()
}

vi.mock('@/lib/self-analytics', () => ({
    analyticsService: mockAnalyticsService
}))

// Mock the analytics validator
const mockValidator = {
    validateEventType: vi.fn().mockReturnValue({ isValid: true }),
    sanitizeDetails: vi.fn().mockImplementation((details) => details)
}

vi.mock('@/lib/analytics-validation', () => ({
    AnalyticsValidator: mockValidator
}))

describe('useAnalytics', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.useRealTimers()
    })

    it('should initialize with correct session and user IDs', () => {
        const { result } = renderHook(() => useAnalytics())

        expect(result.current.sessionId).toBe('test-session-123')
        expect(result.current.userId).toBe('test-user-456')
        expect(result.current.queueSize).toBe(0)
    })

    it('should track events when analytics is enabled', async () => {
        const { result } = renderHook(() => useAnalytics())

        await act(async () => {
            await result.current.trackEvent('test_event', { key: 'value' })
        })

        expect(mockValidator.validateEventType).toHaveBeenCalledWith('test_event')
        expect(mockValidator.sanitizeDetails).toHaveBeenCalledWith({ key: 'value' })
        expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('test_event', { key: 'value' })
    })

    it('should not track events when analytics is disabled in privacy settings', async () => {
        const { useSettings } = require('../use-settings')
        useSettings.mockReturnValue({
            privacy: {
                shareAnalytics: false
            }
        })

        const { result } = renderHook(() => useAnalytics())

        await act(async () => {
            await result.current.trackEvent('test_event', { key: 'value' })
        })

        expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled()
    })

    it('should not track events with invalid event types', async () => {
        mockValidator.validateEventType.mockReturnValue({ isValid: false, error: 'Invalid event type' })
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        const { result } = renderHook(() => useAnalytics())

        await act(async () => {
            await result.current.trackEvent('', { key: 'value' })
        })

        expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled()
        expect(consoleSpy).toHaveBeenCalledWith('Analytics: Invalid event type')

        consoleSpy.mockRestore()
    })

    it('should handle tracking errors gracefully', async () => {
        mockAnalyticsService.trackEvent.mockRejectedValue(new Error('Network error'))
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

        const { result } = renderHook(() => useAnalytics())

        await act(async () => {
            await result.current.trackEvent('test_event', { key: 'value' })
        })

        expect(consoleSpy).toHaveBeenCalledWith('Analytics tracking failed:', expect.any(Error))

        consoleSpy.mockRestore()
    })

    it('should track page views correctly', async () => {
        const { result } = renderHook(() => useAnalytics())

        await act(async () => {
            await result.current.trackPageView('/dashboard')
        })

        expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('pageview', {
            page: '/dashboard',
            timestamp: expect.any(Number)
        })
    })

    it('should normalize page paths', async () => {
        const { result } = renderHook(() => useAnalytics())

        await act(async () => {
            await result.current.trackPageView('dashboard') // Without leading slash
        })

        expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('pageview', {
            page: '/dashboard',
            timestamp: expect.any(Number)
        })
    })

    it('should track user actions correctly', async () => {
        const { result } = renderHook(() => useAnalytics())

        await act(async () => {
            await result.current.trackUserAction('button_click', { buttonId: 'submit' })
        })

        expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('user_action', {
            action: 'button_click',
            buttonId: 'submit',
            timestamp: expect.any(Number)
        })
    })

    it('should return correct enabled status', () => {
        const { result } = renderHook(() => useAnalytics())

        expect(result.current.isEnabled()).toBe(true)
    })

    it('should allow enabling/disabling analytics', () => {
        const { result } = renderHook(() => useAnalytics())

        act(() => {
            result.current.setEnabled(false)
        })

        expect(mockAnalyticsService.setEnabled).toHaveBeenCalledWith(false)
    })
})

describe('usePageViewTracking', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: { pathname: '/test-page' },
            writable: true
        })
    })

    it('should track page view on mount', () => {
        renderHook(() => usePageViewTracking())

        expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('pageview', {
            page: '/test-page',
            timestamp: expect.any(Number)
        })
    })

    it('should not track page view when analytics is disabled', () => {
        const { useSettings } = require('../use-settings')
        useSettings.mockReturnValue({
            privacy: {
                shareAnalytics: false
            }
        })

        renderHook(() => usePageViewTracking())

        expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled()
    })
})

describe('useUserActionTracking', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return a function that tracks user actions', async () => {
        const { result } = renderHook(() => useUserActionTracking())

        await act(async () => {
            result.current('like_rant', { rantId: '123' })
        })

        expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('user_action', {
            action: 'like_rant',
            rantId: '123',
            timestamp: expect.any(Number)
        })
    })

    it('should not track actions when analytics is disabled', async () => {
        const { useSettings } = require('../use-settings')
        useSettings.mockReturnValue({
            privacy: {
                shareAnalytics: false
            }
        })

        const { result } = renderHook(() => useUserActionTracking())

        await act(async () => {
            result.current('like_rant', { rantId: '123' })
        })

        expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled()
    })
})

describe('useComponentAnalytics', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should track component mount and unmount', () => {
        const { unmount } = renderHook(() => useComponentAnalytics('TestComponent'))

        expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('component_mount', {
            component: 'TestComponent'
        })

        unmount()

        expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('component_unmount', {
            component: 'TestComponent'
        })
    })

    it('should return trackEvent function', () => {
        const { result } = renderHook(() => useComponentAnalytics('TestComponent'))

        expect(result.current.trackEvent).toBe(mockAnalyticsService.trackEvent)
    })

    it('should not track component lifecycle when analytics is disabled', () => {
        const { useSettings } = require('../use-settings')
        useSettings.mockReturnValue({
            privacy: {
                shareAnalytics: false
            }
        })

        const { unmount } = renderHook(() => useComponentAnalytics('TestComponent'))

        expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled()

        unmount()

        expect(mockAnalyticsService.trackEvent).not.toHaveBeenCalled()
    })
})
