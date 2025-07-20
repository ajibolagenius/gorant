import { describe, it, expect } from 'vitest'
import { AnalyticsValidator } from '../analytics-validation'

describe('Analytics Validation', () => {
    describe('Event Type Validation', () => {
        it('should validate valid event types', () => {
            const validTypes = [
                'pageview',
                'user_action',
                'button_click',
                'form_submit',
                'rant-posted',
                'like-clicked',
                'bookmark_added'
            ]

            validTypes.forEach(type => {
                const result = AnalyticsValidator.validateEventType(type)
                expect(result.isValid).toBe(true)
            })
        })

        it('should reject invalid event types', () => {
            const invalidTypes = [
                '',
                ' ',
                null,
                undefined,
                'invalid event!',
                'has spaces',
                'has.dots',
                'has@special',
                'has/slash',
                'has\\backslash'
            ]

            invalidTypes.forEach(type => {
                const result = AnalyticsValidator.validateEventType(type as any)
                expect(result.isValid).toBe(false)
                expect(result.error).toBeTruthy()
            })
        })
    })

    describe('Privacy Compliance Validation', () => {
        it('should detect PII in keys', () => {
            const data = {
                email: 'test@example.com',
                user_id: '12345',
                phoneNumber: '123-456-7890',
                creditCard: '4111-1111-1111-1111',
                safe_key: 'safe value'
            }

            const result = AnalyticsValidator.validatePrivacyCompliance(data)

            expect(result.isValid).toBe(false)
            expect(result.containsPII).toBe(true)
            expect(result.violations.length).toBeGreaterThan(0)
            expect(result.sanitizedData).not.toHaveProperty('email')
            expect(result.sanitizedData).not.toHaveProperty('user_id')
            expect(result.sanitizedData).not.toHaveProperty('phoneNumber')
            expect(result.sanitizedData).not.toHaveProperty('creditCard')
            expect(result.sanitizedData).toHaveProperty('safe_key')
        })

        it('should detect PII in values', () => {
            const data = {
                message: 'Contact me at user@example.com or call 555-123-4567',
                description: 'My credit card is 4111-1111-1111-1111',
                address: '123 Main St, Anytown, USA 12345',
                safe_field: 'This is a safe value'
            }

            const result = AnalyticsValidator.validatePrivacyCompliance(data)

            expect(result.isValid).toBe(false)
            expect(result.containsPII).toBe(true)
            expect(result.violations.length).toBeGreaterThan(0)

            // Check that PII is replaced with placeholders
            expect(result.sanitizedData.message).toContain('[EMAIL]')
            expect(result.sanitizedData.message).toContain('[PHONE]')
            expect(result.sanitizedData.description).toContain('[CARD]')
            expect(result.sanitizedData.address).toContain('[ZIP]')
            expect(result.sanitizedData.safe_field).toBe('This is a safe value')
        })

        it('should limit string length', () => {
            const longString = 'a'.repeat(2000)
            const data = {
                longField: longString
            }

            const result = AnalyticsValidator.validatePrivacyCompliance(data)

            expect(result.isValid).toBe(false)
            expect(result.violations).toContain('Value too long for key longField')
            expect(result.sanitizedData.longField.length).toBeLessThan(longString.length)
            expect(result.sanitizedData.longField).toContain('...')
        })

        it('should pass validation for clean data', () => {
            const data = {
                page: '/home',
                action: 'click',
                timestamp: Date.now(),
                component: 'button',
                value: 'submit'
            }

            const result = AnalyticsValidator.validatePrivacyCompliance(data)

            expect(result.isValid).toBe(true)
            expect(result.containsPII).toBe(false)
            expect(result.violations).toHaveLength(0)
            expect(result.sanitizedData).toEqual(data)
        })
    })

    describe('Details Sanitization', () => {
        it('should remove functions and undefined values', () => {
            const details = {
                validKey: 'valid value',
                functionKey: () => 'function value',
                undefinedKey: undefined,
                nullKey: null,
                numberKey: 123,
                booleanKey: true
            }

            const sanitized = AnalyticsValidator.sanitizeDetails(details)

            expect(sanitized).toHaveProperty('validKey')
            expect(sanitized).toHaveProperty('nullKey')
            expect(sanitized).toHaveProperty('numberKey')
            expect(sanitized).toHaveProperty('booleanKey')
            expect(sanitized).not.toHaveProperty('functionKey')
            expect(sanitized).not.toHaveProperty('undefinedKey')
        })

        it('should limit object depth', () => {
            const deepObject = {
                level1: {
                    level2: {
                        level3: {
                            level4: {
                                level5: {
                                    level6: 'too deep'
                                }
                            }
                        }
                    }
                }
            }

            const sanitized = AnalyticsValidator.sanitizeDetails(deepObject)

            // The exact depth limit may vary, but deep levels should be replaced
            expect(JSON.stringify(sanitized)).toContain('[Object too deep]')
        })
    })

    describe('Data Retention Validation', () => {
        it('should validate data within retention period', () => {
            const recentTimestamp = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days ago
            const isValid = AnalyticsValidator.validateDataRetention(recentTimestamp, 365)
            expect(isValid).toBe(true)
        })

        it('should reject data beyond retention period', () => {
            const oldTimestamp = Date.now() - (400 * 24 * 60 * 60 * 1000) // 400 days ago
            const isValid = AnalyticsValidator.validateDataRetention(oldTimestamp, 365)
            expect(isValid).toBe(false)
        })

        it('should respect custom retention periods', () => {
            const timestamp = Date.now() - (60 * 24 * 60 * 60 * 1000) // 60 days ago

            // 90 day retention - should be valid
            expect(AnalyticsValidator.validateDataRetention(timestamp, 90)).toBe(true)

            // 30 day retention - should be invalid
            expect(AnalyticsValidator.validateDataRetention(timestamp, 30)).toBe(false)
        })
    })
})
