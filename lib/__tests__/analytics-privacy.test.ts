import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { analyticsPrivacy, hasAnalyticsConsent, recordAnalyticsConsent, shouldDisableAnalytics, anonymizeData, validatePrivacyCompliance } from '../analytics-privacy'

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}

// Mock navigator
const navigatorMock = {
    doNotTrack: '0'
}

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

Object.defineProperty(window, 'navigator', {
    value: navigatorMock,
    writable: true
})

describe('AnalyticsPrivacyService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.getItem.mockReturnValue(null)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Consent Management', () => {
        it('should return false for consent when no consent is stored', () => {
            expect(hasAnalyticsConsent()).toBe(false)
        })

        it('should record and retrieve valid consent', () => {
            const mockConsentData = {
                analyticsConsent: true,
                consentTimestamp: Date.now(),
                consentVersion: '1.0'
            }

            localStorageMock.getItem.mockReturnValue(JSON.stringify(mockConsentData))

            recordAnalyticsConsent(true)

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'analytics_consent',
                expect.stringContaining('"analyticsConsent":true')
            )
            expect(hasAnalyticsConsent()).toBe(true)
        })

        it('should reject expired consent', () => {
            const expiredConsentData = {
                analyticsConsent: true,
                consentTimestamp: Date.now() - (366 * 24 * 60 * 60 * 1000), // Over 1 year ago
                consentVersion: '1.0'
            }

            localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredConsentData))

            expect(hasAnalyticsConsent()).toBe(false)
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('analytics_consent')
        })

        it('should reject consent with old version', () => {
            const oldVersionConsentData = {
                analyticsConsent: true,
                consentTimestamp: Date.now(),
                consentVersion: '0.9' // Old version
            }

            localStorageMock.getItem.mockReturnValue(JSON.stringify(oldVersionConsentData))

            expect(hasAnalyticsConsent()).toBe(false)
        })
    })

    describe('Do Not Track Detection', () => {
        it('should detect DNT when set to "1"', () => {
            navigatorMock.doNotTrack = '1'
            expect(shouldDisableAnalytics()).toBe(true)
        })

        it('should detect DNT when set to "yes"', () => {
            navigatorMock.doNotTrack = 'yes'
            expect(shouldDisableAnalytics()).toBe(true)
        })

        it('should not disable analytics when DNT is "0"', () => {
            navigatorMock.doNotTrack = '0'

            // Mock valid consent
            const validConsentData = {
                analyticsConsent: true,
                consentTimestamp: Date.now(),
                consentVersion: '1.0'
            }
            localStorageMock.getItem.mockReturnValue(JSON.stringify(validConsentData))

            expect(shouldDisableAnalytics()).toBe(false)
        })
    })

    describe('Data Anonymization', () => {
        it('should remove sensitive fields from data', () => {
            const sensitiveData = {
                email: 'user@example.com',
                phone: '123-456-7890',
                name: 'John Doe',
                validField: 'keep this',
                password: 'secret123'
            }

            const anonymized = anonymizeData(sensitiveData)

            expect(anonymized).not.toHaveProperty('email')
            expect(anonymized).not.toHaveProperty('phone')
            expect(anonymized).not.toHaveProperty('name')
            expect(anonymized).not.toHaveProperty('password')
            expect(anonymized).toHaveProperty('validField', 'keep this')
        })

        it('should truncate long strings', () => {
            const longString = 'a'.repeat(600)
            const data = { longField: longString }

            const anonymized = anonymizeData(data)

            expect(anonymized.longField).toHaveLength(503) // 500 + '...'
            expect((anonymized.longField as string).endsWith('...')).toBe(true)
        })

        it('should remove script tags', () => {
            const maliciousData = {
                content: '<script>alert("xss")</script>Normal content'
            }

            const anonymized = anonymizeData(maliciousData)

            expect(anonymized.content).toBe('[script removed]Normal content')
        })

        it('should remove javascript: URLs', () => {
            const maliciousData = {
                url: 'javascript:alert("xss")'
            }

            const anonymized = anonymizeData(maliciousData)

            expect(anonymized.url).toBe('[js removed]:alert("xss")')
        })
    })

    describe('Privacy Compliance Validation', () => {
        it('should detect email addresses in data', () => {
            const dataWithEmail = {
                message: 'Contact me at user@example.com for more info'
            }

            const result = validatePrivacyCompliance(dataWithEmail)

            expect(result.isValid).toBe(false)
            expect(result.violations).toContain("Potential email detected in field 'message'")
            expect(result.sanitizedData).not.toHaveProperty('message')
        })

        it('should detect phone numbers in data', () => {
            const dataWithPhone = {
                contact: 'Call me at 123-456-7890'
            }

            const result = validatePrivacyCompliance(dataWithPhone)

            expect(result.isValid).toBe(false)
            expect(result.violations).toContain("Potential phone detected in field 'contact'")
        })

        it('should detect IP addresses in data', () => {
            const dataWithIP = {
                server: 'Connect to 192.168.1.1'
            }

            const result = validatePrivacyCompliance(dataWithIP)

            expect(result.isValid).toBe(false)
            expect(result.violations).toContain("Potential ip_address detected in field 'server'")
        })

        it('should pass validation for clean data', () => {
            const cleanData = {
                action: 'button_click',
                page: '/dashboard',
                timestamp: Date.now()
            }

            const result = validatePrivacyCompliance(cleanData)

            expect(result.isValid).toBe(true)
            expect(result.violations).toHaveLength(0)
            expect(result.sanitizedData).toEqual(cleanData)
        })
    })

    describe('Audit Logging', () => {
        it('should log audit events', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

            analyticsPrivacy.logAuditEvent('test_action', { test: true }, 'user123', 'session456')

            const auditLog = analyticsPrivacy.getAuditLog(1)
            expect(auditLog).toHaveLength(1)
            expect(auditLog[0]).toMatchObject({
                action: 'test_action',
                userId: 'user123',
                sessionId: 'session456',
                details: { test: true }
            })

            consoleSpy.mockRestore()
        })

        it('should limit audit log size', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

            // Add more than 1000 entries
            for (let i = 0; i < 1100; i++) {
                analyticsPrivacy.logAuditEvent(`action_${i}`, { index: i })
            }

            const auditLog = analyticsPrivacy.getAuditLog(2000)
            expect(auditLog.length).toBeLessThanOrEqual(1000)

            consoleSpy.mockRestore()
        })
    })

    describe('Data Retention', () => {
        it('should identify data that should be deleted', () => {
            const oldTimestamp = Date.now() - (400 * 24 * 60 * 60 * 1000) // 400 days ago
            const recentTimestamp = Date.now() - (100 * 24 * 60 * 60 * 1000) // 100 days ago

            expect(analyticsPrivacy.shouldDeleteData(oldTimestamp)).toBe(true)
            expect(analyticsPrivacy.shouldDeleteData(recentTimestamp)).toBe(false)
        })
    })

    describe('GDPR Compliance', () => {
        it('should export user data', () => {
            const userData = analyticsPrivacy.exportUserData('user123')

            expect(userData).toHaveProperty('message')
            expect(userData).toHaveProperty('dataRetentionDays')
            expect(userData).toHaveProperty('consentStatus')
        })

        it('should delete user data', () => {
            const result = analyticsPrivacy.deleteUserData('user123')
            expect(result).toBe(true)
        })
    })
})
