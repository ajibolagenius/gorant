import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { analyticsPrivacy, hasAnalyticsConsent, recordAnalyticsConsent, shouldDisableAnalytics, anonymizeData } from '../analytics-privacy'
import { AnalyticsValidator } from '../analytics-validation'

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString()
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key]
        }),
        clear: vi.fn(() => {
            store = {}
        }),
        _getStore: () => store
    }
})()

// Mock navigator
const navigatorMock = {
    doNotTrack: null
}

describe('Analytics Privacy Compliance', () => {
    // Save original objects
    const originalLocalStorage = global.localStorage
    const originalNavigator = global.navigator
    const originalConsoleWarn = console.warn

    beforeEach(() => {
        // Setup mocks
        Object.defineProperty(global, 'localStorage', { value: localStorageMock })
        Object.defineProperty(global, 'navigator', { value: navigatorMock })
        console.warn = vi.fn()

        // Reset localStorage mock
        localStorageMock.clear()

        // Reset navigator mock
        navigatorMock.doNotTrack = null

        // Reset other mocks
        vi.clearAllMocks()
    })

    afterEach(() => {
        // Restore original objects
        Object.defineProperty(global, 'localStorage', { value: originalLocalStorage })
        Object.defineProperty(global, 'navigator', { value: originalNavigator })
        console.warn = originalConsoleWarn
    })

    describe('Do Not Track Detection', () => {
        it('should detect DNT when enabled with value "1"', () => {
            navigatorMock.doNotTrack = '1'

            const isDntEnabled = analyticsPrivacy.isDNTEnabled()
            expect(isDntEnabled).toBe(true)
        })

        it('should detect DNT when enabled with value "yes"', () => {
            navigatorMock.doNotTrack = 'yes'

            const isDntEnabled = analyticsPrivacy.isDNTEnabled()
            expect(isDntEnabled).toBe(true)
        })

        it('should not detect DNT when disabled or not set', () => {
            // Test with null
            navigatorMock.doNotTrack = null
            expect(analyticsPrivacy.isDNTEnabled()).toBe(false)

            // Test with "0"
            navigatorMock.doNotTrack = '0'
            expect(analyticsPrivacy.isDNTEnabled()).toBe(false)

            // Test with "no"
            navigatorMock.doNotTrack = 'no'
            expect(analyticsPrivacy.isDNTEnabled()).toBe(false)

            // Test with "unspecified"
            navigatorMock.doNotTrack = 'unspecified'
            expect(analyticsPrivacy.isDNTEnabled()).toBe(false)
        })

        it('should disable analytics when DNT is enabled and respected', () => {
            // Configure to respect DNT
            analyticsPrivacy.updateConfig({ respectDNT: true })

            // Enable DNT
            navigatorMock.doNotTrack = '1'

            const shouldDisable = analyticsPrivacy.shouldDisableAnalytics()
            expect(shouldDisable).toBe(true)
        })

        it('should not disable analytics when DNT is enabled but not respected', () => {
            // Configure to not respect DNT
            analyticsPrivacy.updateConfig({ respectDNT: false })

            // Enable DNT
            navigatorMock.doNotTrack = '1'

            const shouldDisable = analyticsPrivacy.shouldDisableAnalytics()
            expect(shouldDisable).toBe(false)
        })
    })

    describe('Consent Management', () => {
        it('should require consent when configured', () => {
            analyticsPrivacy.updateConfig({ requireConsent: true })

            const hasConsent = analyticsPrivacy.hasValidConsent()
            expect(hasConsent).toBe(false)
        })

        it('should accept consent when given', () => {
            analyticsPrivacy.updateConfig({ requireConsent: true })

            // Record consent
            recordAnalyticsConsent(true)

            const hasConsent = hasAnalyticsConsent()
            expect(hasConsent).toBe(true)

            // Verify localStorage was updated
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'analytics_consent',
                expect.stringContaining('"analyticsConsent":true')
            )
        })

        it('should reject expired consent', () => {
            analyticsPrivacy.updateConfig({ requireConsent: true })

            // Set expired consent (over 1 year old)
            const oldConsentData = {
                analyticsConsent: true,
                consentTimestamp: Date.now() - (400 * 24 * 60 * 60 * 1000), // 400 days ago
                consentVersion: '1.0'
            }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(oldConsentData))

            const hasConsent = analyticsPrivacy.hasValidConsent()
            expect(hasConsent).toBe(false)
        })

        it('should reject outdated consent version', () => {
            analyticsPrivacy.updateConfig({ requireConsent: true })

            // Set consent with old version
            const consentData = {
                analyticsConsent: true,
                consentTimestamp: Date.now(),
                consentVersion: '0.5' // Old version
            }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(consentData))

            const hasConsent = analyticsPrivacy.hasValidConsent()
            expect(hasConsent).toBe(false)
        })

        it('should clear stored consent', () => {
            // Set consent first
            recordAnalyticsConsent(true)

            // Clear consent
            analyticsPrivacy.clearStoredConsent()

            // Verify localStorage was cleared
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('analytics_consent')
        })
    })

    describe('Data Anonymization', () => {
        it('should anonymize sensitive data', () => {
            const data = {
                email: 'test@example.com',
                phone: '555-123-4567',
                ip: '192.168.1.1',
                normalField: 'normal value'
            }

            const anonymized = anonymizeData(data)

            expect(anonymized).not.toHaveProperty('email')
            expect(anonymized).not.toHaveProperty('phone')
            expect(anonymized).not.toHaveProperty('ip')
            expect(anonymized).toHaveProperty('normalField')
            expect(anonymized.normalField).toBe('normal value')
        })

        it('should truncate long strings', () => {
            const longString = 'a'.repeat(1000)
            const data = { longField: longString }

            const anonymized = anonymizeData(data)

            expect(anonymized.longField.length).toBeLessThan(longString.length)
            expect(anonymized.longField).toContain('...')
        })

        it('should remove script tags', () => {
            const data = {
                content: '<script>alert("xss")</script>Hello world',
                normalField: 'normal value'
            }

            const anonymized = anonymizeData(data)

            expect(anonymized.content).toBe('[script removed]Hello world')
            expect(anonymized.normalField).toBe('normal value')
        })

        it('should remove javascript: protocol', () => {
            const data = {
                url: 'javascript:alert("xss")',
                normalField: 'normal value'
            }

            const anonymized = anonymizeData(data)

            expect(anonymized.url).toBe('[js removed]alert("xss")')
            expect(anonymized.normalField).toBe('normal value')
        })
    })

    describe('Audit Logging', () => {
        it('should log audit events', () => {
            analyticsPrivacy.logAuditEvent('test_action', { test: true }, 'user123', 'session456')

            const auditLog = analyticsPrivacy.getAuditLog()
            expect(auditLog).toHaveLength(1)
            expect(auditLog[0].action).toBe('test_action')
            expect(auditLog[0].details).toEqual({ test: true })
            expect(auditLog[0].userId).toBe('user123')
            expect(auditLog[0].sessionId).toBe('session456')
        })

        it('should limit audit log size', () => {
            // Add more than the limit
            for (let i = 0; i < 1500; i++) {
                analyticsPrivacy.logAuditEvent(`action_${i}`, { index: i })
            }

            const auditLog = analyticsPrivacy.getAuditLog()
            expect(auditLog.length).toBeLessThanOrEqual(1000) // Should be limited

            // Should contain most recent events
            expect(auditLog[0].action).not.toBe('action_0')
            expect(auditLog[0].action).toBe('action_1499')
        })

        it('should respect audit access configuration', () => {
            // Disable audit logging
            analyticsPrivacy.updateConfig({ auditAccess: false })

            analyticsPrivacy.logAuditEvent('test_action', { test: true })

            const auditLog = analyticsPrivacy.getAuditLog()
            expect(auditLog).toHaveLength(0)

            // Re-enable audit logging
            analyticsPrivacy.updateConfig({ auditAccess: true })
        })
    })

    describe('Data Collection Validation', () => {
        it('should validate clean data', () => {
            const data = {
                page: '/home',
                action: 'click',
                timestamp: Date.now(),
                component: 'button'
            }

            const result = analyticsPrivacy.validateDataCollection(data)

            expect(result.isValid).toBe(true)
            expect(result.violations).toHaveLength(0)
            expect(result.sanitizedData).toEqual(data)
        })

        it('should detect and remove PII', () => {
            const data = {
                page: '/profile',
                email: 'user@example.com',
                message: 'My phone number is 555-123-4567'
            }

            const result = analyticsPrivacy.validateDataCollection(data)

            expect(result.isValid).toBe(false)
            expect(result.violations.length).toBeGreaterThan(0)
            expect(result.sanitizedData).not.toHaveProperty('email')
            expect(result.sanitizedData.message).not.toContain('555-123-4567')
        })
    })

    describe('Data Retention', () => {
        it('should identify data that should be deleted', () => {
            // Configure retention period
            analyticsPrivacy.updateConfig({ dataRetentionDays: 90 })

            // Recent timestamp (within retention period)
            const recentTimestamp = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
            expect(analyticsPrivacy.shouldDeleteData(recentTimestamp)).toBe(false)

            // Old timestamp (beyond retention period)
            const oldTimestamp = Date.now() - (120 * 24 * 60 * 60 * 1000) // 120 days ago
            expect(analyticsPrivacy.shouldDeleteData(oldTimestamp)).toBe(true)
        })
    })

    describe('Configuration Management', () => {
        it('should update privacy configuration', () => {
            const newConfig = {
                respectDNT: false,
                requireConsent: false,
                dataRetentionDays: 180
            }

            analyticsPrivacy.updateConfig(newConfig)
            const config = analyticsPrivacy.getConfig()

            expect(config.respectDNT).toBe(false)
            expect(config.requireConsent).toBe(false)
            expect(config.dataRetentionDays).toBe(180)
        })

        it('should preserve existing config when partially updating', () => {
            const originalConfig = analyticsPrivacy.getConfig()
            analyticsPrivacy.updateConfig({ dataRetentionDays: 180 })
            const updatedConfig = analyticsPrivacy.getConfig()

            expect(updatedConfig.respectDNT).toBe(originalConfig.respectDNT)
            expect(updatedConfig.requireConsent).toBe(originalConfig.requireConsent)
            expect(updatedConfig.dataRetentionDays).toBe(180)
        })
    })

    describe('User Data Management', () => {
        it('should export user data', () => {
            const userData = analyticsPrivacy.exportUserData('user123')

            expect(userData).toHaveProperty('message')
            expect(userData).toHaveProperty('dataRetentionDays')
            expect(userData).toHaveProperty('consentStatus')
        })

        it('should handle data deletion', () => {
            const result = analyticsPrivacy.deleteUserData('user123')
            expect(result).toBe(true)
        })
    })
})
