/**
 * Analytics validation utilities
 */

export interface ValidationResult {
    isValid: boolean
    error?: string
}

export interface PrivacyValidationResult {
    isValid: boolean
    violations: string[]
    sanitizedData: Record<string, unknown>
    containsPII: boolean
}

export class AnalyticsValidator {
    private static readonly VALID_EVENT_TYPE_REGEX = /^[a-zA-Z0-9_-]+$/
    private static readonly MAX_DEPTH = 3
    private static readonly MAX_STRING_LENGTH = 1000

    // Comprehensive PII detection patterns
    private static readonly PII_KEYS = [
        'email', 'phone', 'address', 'name', 'ip', 'ipAddress', 'ip_address',
        'userId', 'user_id', 'userid', 'password', 'token', 'auth', 'session',
        'cookie', 'ssn', 'social', 'credit', 'card', 'bank', 'account',
        'license', 'passport', 'national', 'id', 'identifier', 'personal',
        'private', 'secret', 'key', 'hash', 'signature', 'fingerprint',
        'biometric', 'location', 'gps', 'coordinate', 'latitude', 'longitude',
        'zip', 'postal', 'city', 'state', 'country', 'birth', 'dob', 'age',
        'gender', 'race', 'ethnicity', 'religion', 'political', 'medical',
        'health', 'diagnosis', 'treatment', 'prescription', 'insurance'
    ]

    // PII value patterns
    private static readonly PII_PATTERNS = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\+]?[1-9][\d]{0,15}$/,
        ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
        ssn: /^\d{3}-?\d{2}-?\d{4}$/,
        creditCard: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
        postalCode: /^\d{5}(-\d{4})?$/,
        dateOfBirth: /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
    }

    static validateEventType(type: string): ValidationResult {
        if (!type || typeof type !== 'string') {
            return { isValid: false, error: 'Event type must be a non-empty string' }
        }

        if (!this.VALID_EVENT_TYPE_REGEX.test(type)) {
            return {
                isValid: false,
                error: 'Event type must contain only alphanumeric characters, underscores, and hyphens'
            }
        }

        return { isValid: true }
    }

    static validatePrivacyCompliance(data: Record<string, unknown>): PrivacyValidationResult {
        const violations: string[] = []
        const sanitizedData = { ...data }
        let containsPII = false

        // Check for PII in keys and values
        Object.keys(sanitizedData).forEach(key => {
            const lowerKey = key.toLowerCase()

            // Check if key contains PII
            if (this.isPIIKey(lowerKey)) {
                violations.push(`PII detected in key: ${key}`)
                containsPII = true
                delete sanitizedData[key]
                return
            }

            // Check if value contains PII patterns
            const value = sanitizedData[key]
            if (typeof value === 'string') {
                const piiFound = this.detectPIIInValue(value)
                if (piiFound.length > 0) {
                    violations.push(`PII detected in value for key ${key}: ${piiFound.join(', ')}`)
                    containsPII = true
                    sanitizedData[key] = this.sanitizePIIValue(value)
                }

                // Check string length
                if (value.length > this.MAX_STRING_LENGTH) {
                    violations.push(`Value too long for key ${key}`)
                    sanitizedData[key] = value.substring(0, this.MAX_STRING_LENGTH) + '...'
                }
            }
        })

        return {
            isValid: violations.length === 0,
            violations,
            sanitizedData,
            containsPII
        }
    }

    static sanitizeDetails(details: Record<string, unknown> = {}): Record<string, unknown> {
        const sanitized = { ...details }

        // Remove functions and undefined values
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'function' || sanitized[key] === undefined) {
                delete sanitized[key]
            }
        })

        return this.limitDepth(sanitized) as Record<string, unknown>
    }

    private static limitDepth(obj: unknown, depth = 0): unknown {
        if (depth > this.MAX_DEPTH) return '[Object too deep]'
        if (obj === null || typeof obj !== 'object') return obj

        const limited: Record<string, unknown> = Array.isArray(obj) ? {} : {}
        for (const key in obj as Record<string, unknown>) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                // Skip PII keys
                if (this.isPIIKey(key)) continue

                limited[key] = this.limitDepth(
                    (obj as Record<string, unknown>)[key],
                    depth + 1
                )
            }
        }
        return limited
    }

    private static isPIIKey(key: string): boolean {
        return this.PII_KEYS.some(piiKey =>
            key.toLowerCase().includes(piiKey.toLowerCase())
        )
    }

    private static detectPIIInValue(value: string): string[] {
        const detected: string[] = []

        Object.entries(this.PII_PATTERNS).forEach(([type, pattern]) => {
            if (pattern.test(value)) {
                detected.push(type)
            }
        })

        return detected
    }

    private static sanitizePIIValue(value: string): string {
        // Replace detected PII with placeholders
        let sanitized = value

        // Replace email addresses
        sanitized = sanitized.replace(this.PII_PATTERNS.email, '[EMAIL]')

        // Replace phone numbers
        sanitized = sanitized.replace(this.PII_PATTERNS.phone, '[PHONE]')

        // Replace IP addresses
        sanitized = sanitized.replace(this.PII_PATTERNS.ipv4, '[IP]')
        sanitized = sanitized.replace(this.PII_PATTERNS.ipv6, '[IP]')

        // Replace SSN
        sanitized = sanitized.replace(this.PII_PATTERNS.ssn, '[SSN]')

        // Replace credit card numbers
        sanitized = sanitized.replace(this.PII_PATTERNS.creditCard, '[CARD]')

        // Replace postal codes
        sanitized = sanitized.replace(this.PII_PATTERNS.postalCode, '[ZIP]')

        // Replace dates of birth
        sanitized = sanitized.replace(this.PII_PATTERNS.dateOfBirth, '[DOB]')

        return sanitized
    }

    static validateDataRetention(timestamp: number, retentionDays: number = 365): boolean {
        const cutoffDate = Date.now() - (retentionDays * 24 * 60 * 60 * 1000)
        return timestamp >= cutoffDate
    }
}
