import { AnalyticsValidator } from '../analytics-validation'
import { AnalyticsPrivacyService } from '../analytics-privacy'
import { AnalyticsDB } from '../analytics-db'

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

// Mock navigator
Object.defineProperty(window, 'navigator', {
    value: {
        doNotTrack: null
    },
    writable: true
})

describe('Analytics Privacy Compliance', () => {
    let analyticsPrivacy: AnalyticsPrivacyService

    beforeEach(() => {
        analyticsPrivacy = new AnalyticsPrivacyService()
        localStorageMock.getItem.mockClear()
        localStorageMock.setItem.mockClear()
        localStorageMock.removeItem.mockClear()
    })

    describe('PII Detection and Validation', () => {
        test('should detect PII in keys', () => {
            const data = {
                userEmail: 'test@example.com',
                phoneNumber: '1234567890',
                normalField: 'value'
            }

            const result = AnalyticsValidator.validatePrivacyCompliance(data)

            expect(result.isValid).toBe(false)
            expect(result.containsPII).toBe(true)
            expect(result.violations).toContain('PII detected in key: userEmail')
            expect(result.violations).toContain('PII detected in key: phoneNumber')
            expect(result.sanitizedData).not.toHaveProperty('userEmail')
            expect(result.sanitizedData).not.toHaveProperty('phoneNumber')
            expect(result.sanitizedData).toHaveProperty('normalField')
        })

        test('should detect PII patterns in values', () => {
            const data = {
                description: 'Contact me at john.doe@example.com or call 555-123-4567',
                address: '123 Main St, Anytown, USA 12345',
                normalText: 'This is normal text without PII'
            }

            const result = AnalyticsValidator.validatePrivacyCompliance(data)

            expect(result.isValid).toBe(false)
            expect(result.containsPII).toBe(true)
            expect(result.violations).toContain('PII detected in value for key description: email, phone')
            expect(result.violations).toContain('PII detected in value for key address: postalCode')
            expect(result.sanitizedData.description).toBe('Contact me at [EMAIL] or call [PHONE]')
            expect(result.sanitizedData.address).toBe('123 Main St, Anytown, USA [ZIP]')
            expect(result.sanitizedData.normalText).toBe('This is normal text without PII')
        })

        test('should handle long strings', () => {
            const longString = 'a'.repeat(1500)
            const data = { longField: longString }

            const result = AnalyticsValidator.validatePrivacyCompliance(data)

            expect(result.isValid).toBe(false)
            expect(result.violations).toContain('Value too long for key longField')
            expect(result.sanitizedData.longField).toBe('a'.repeat(1000) + '...')
        })

        test('should pass validation for clean data', () => {
            const data = {
                page: '/home',
                action: 'click',
                timestamp: Date.now(),
                normalField: 'normal value'
            }

            const result = AnalyticsValidator.validatePrivacyCompliance(data)

            expect(result.isValid).toBe(true)
            expect(result.containsPII).toBe(false)
            expect(result.violations).toHaveLength(0)
        })
    })

    describe('Data Retention Validation', () => {
        test('should validate data retention for recent data', () => {
            const recentTimestamp = Date.now()
            const isValid = AnalyticsValidator.validateDataRetention(recentTimestamp, 365)
            expect(isValid).toBe(true)
        })

        test('should reject old data based on retention policy', () => {
            const oldTimestamp = Date.now() - (400 * 24 * 60 * 60 * 1000) // 400 days ago
            const isValid = AnalyticsValidator.validateDataRetention(oldTimestamp, 365)
            expect(isValid).toBe(false)
        })

        test('should handle custom retention periods', () => {
            const timestamp = Date.now() - (50 * 24 * 60 * 60 * 1000) // 50 days ago
            const isValid = AnalyticsValidator.validateDataRetention(timestamp, 30) // 30 day retention
            expect(isValid).toBe(false)
        })
    })

    describe('Consent Management', () => {
        test('should require consent when configured', () => {
            analyticsPrivacy.updateConfig({ requireConsent: true })
            localStorageMock.getItem.mockReturnValue(null)

            const hasConsent = analyticsPrivacy.hasValidConsent()
            expect(hasConsent).toBe(false)
        })

        test('should accept consent when given', () => {
            analyticsPrivacy.updateConfig({ requireConsent: true })
            const consentData = {
                analyticsConsent: true,
                consentTimestamp: Date.now(),
                consentVersion: '1.0'
            }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(consentData))

            const hasConsent = analyticsPrivacy.hasValidConsent()
            expect(hasConsent).toBe(true)
        })

        test('should reject expired consent', () => {
            analyticsPrivacy.updateConfig({ requireConsent: true })
            const oldConsentData = {
                analyticsConsent: true,
                consentTimestamp: Date.now() - (400 * 24 * 60 * 60 * 1000), // 400 days ago
                consentVersion: '1.0'
            }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(oldConsentData))

            const hasConsent = analyticsPrivacy.hasValidConsent()
            expect(hasConsent).toBe(false)
        })

        test('should reject outdated consent version', () => {
            analyticsPrivacy.updateConfig({ requireConsent: true })
            const consentData = {
                analyticsConsent: true,
                consentTimestamp: Date.now(),
                consentVersion: '0.9' // Old version
            }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(consentData))

            const hasConsent = analyticsPrivacy.hasValidConsent()
            expect(hasConsent).toBe(false)
        })
    })

    describe('Do Not Track Detection', () => {
        test('should detect DNT when enabled', () => {
            Object.defineProperty(window.navigator, 'doNotTrack', {
                value: '1',
                writable: true
            })

            const isDntEnabled = analyticsPrivacy.isDNTEnabled()
            expect(isDntEnabled).toBe(true)
        })

        test('should detect DNT with "yes" value', () => {
            Object.defineProperty(window.navigator, 'doNotTrack', {
                value: 'yes',
                writable: true
            })

            const isDntEnabled = analyticsPrivacy.isDNTEnabled()
            expect(isDntEnabled).toBe(true)
        })

        test('should not detect DNT when disabled', () => {
            Object.defineProperty(window.navigator, 'doNotTrack', {
                value: null,
                writable: true
            })

            const isDntEnabled = analyticsPrivacy.isDNTEnabled()
            expect(isDntEnabled).toBe(false)
        })

        test('should disable analytics when DNT is enabled', () => {
            analyticsPrivacy.updateConfig({ respectDNT: true })
            Object.defineProperty(window.navigator, 'doNotTrack', {
                value: '1',
                writable: true
            })

            const shouldDisable = analyticsPrivacy.shouldDisableAnalytics()
            expect(shouldDisable).toBe(true)
        })
    })

    describe('Data Anonymization', () => {
        test('should anonymize sensitive data', () => {
            const data = {
                email: 'test@example.com',
                phone: '555-123-4567',
                ip: '192.168.1.1',
                normalField: 'normal value'
            }

            const anonymized = analyticsPrivacy.anonymizeEventData(data)

            expect(anonymized).not.toHaveProperty('email')
            expect(anonymized).not.toHaveProperty('phone')
            expect(anonymized).not.toHaveProperty('ip')
            expect(anonymized).toHaveProperty('normalField')
            expect(anonymized.normalField).toBe('normal value')
        })

        test('should truncate long strings', () => {
            const longString = 'a'.repeat(1000)
            const data = { longField: longString }

            const anonymized = analyticsPrivacy.anonymizeEventData(data)

            expect(anonymized.longField).toBe('a'.repeat(500) + '...')
        })

        test('should remove script tags', () => {
            const data = {
                content: '<script>alert("xss")</script>Hello world',
                normalField: 'normal value'
            }

            const anonymized = analyticsPrivacy.anonymizeEventData(data)

            expect(anonymized.content).toBe('[script removed]Hello world')
            expect(anonymized.normalField).toBe('normal value')
        })
    })

    describe('Audit Logging', () => {
        test('should log audit events', () => {
            analyticsPrivacy.logAuditEvent('test_action', { test: true }, 'user123', 'session456')

            const auditLog = analyticsPrivacy.getAuditLog()
            expect(auditLog).toHaveLength(1)
            expect(auditLog[0].action).toBe('test_action')
            expect(auditLog[0].details).toEqual({ test: true })
            expect(auditLog[0].userId).toBe('user123')
            expect(auditLog[0].sessionId).toBe('session456')
        })

        test('should limit audit log size', () => {
            // Add more than 100 events
            for (let i = 0; i < 150; i++) {
                analyticsPrivacy.logAuditEvent(`action_${i}`, { index: i })
            }

            const auditLog = analyticsPrivacy.getAuditLog()
            expect(auditLog).toHaveLength(100) // Should be limited to 100
            expect(auditLog[0].action).toBe('action_50') // Should show most recent
        })
    })

    describe('Data Export and Deletion', () => {
        test('should export user data', () => {
            const userData = analyticsPrivacy.exportUserData('user123')

            expect(userData).toHaveProperty('userId')
            expect(userData).toHaveProperty('exportTimestamp')
            expect(userData.userId).toBe('user123')
        })

        test('should handle data deletion', () => {
            const result = analyticsPrivacy.deleteUserData('user123')
            expect(result).toBe(true)
        })
    })

    describe('Configuration Management', () => {
        test('should update privacy configuration', () => {
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

        test('should preserve existing config when partially updating', () => {
            const originalConfig = analyticsPrivacy.getConfig()
            analyticsPrivacy.updateConfig({ dataRetentionDays: 180 })
            const updatedConfig = analyticsPrivacy.getConfig()

            expect(updatedConfig.respectDNT).toBe(originalConfig.respectDNT)
            expect(updatedConfig.requireConsent).toBe(originalConfig.requireConsent)
            expect(updatedConfig.dataRetentionDays).toBe(180)
        })
    })
})
