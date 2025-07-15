// Self Analytics Utility
// Privacy-first: No cookies, no personal data, no persistent identifiers.
// Usage: import { trackEvent } from './self-analytics'
// Example: trackEvent('rant_posted', { mood: 'happy' })

export async function trackEvent(type: string, details: Record<string, any> = {}) {
    try {
        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type,
                page: typeof window !== 'undefined' ? window.location.pathname : '',
                timestamp: Date.now(),
                details,
                dnt: navigator.doNotTrack === '1',
            }),
        })
    } catch (err) {
        // Fail silently for analytics
    }
}
