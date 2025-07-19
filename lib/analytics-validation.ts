/**
 * Analytics validation utilities
 */

export interface ValidationResult {
    isValid: boolean
    error?: string
}

export class AnalyticsValidator {
    private static readonly VALID_EVENT_TYPE_REGEX = /^[a-zA-Z0-9_-]+$/
    private static readonly MAX_DEPTH = 3
    private static readonly PII_KEYS = [
        'email', 'phone', 'address', 'name', 'ip',
        'userId', 'user_id', 'password', 'token'
    ]

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
}
