/**
 * Privacy compliance module for analytics system
 * Implements privacy-by-design principles and compliance features
 */

export interface PrivacyConfig {
    respectDNT: boolean
    requireConsent: boolean
    anonymizeData: boolean
    dataRetentionDays: number
    auditAccess: boolean
}

export interface ConsentData {
    analyticsConsent: boolean
    consentTimestamp: number
    consentVersion: string
    ipAddress?: string // Only for audit purposes, not stored with analytics
}

export interface AuditLogEntry {
    timestamp: number
    action: string
    userId?: string
    sessionId?: string
    details: Record<string, unknown>
    ipAddress?: string
}

class AnalyticsPrivacyService {
    private config: PrivacyConfig = {
        respectDNT: true,
        requireConsent: true,
        anonymizeData: true,
        dataRetentionDays: 365,
        auditAccess: true
    }

    private auditLog: AuditLogEntry[] = []
    private consentVersion = '1.0'

    /**
     * Check if user has given valid consent for analytics
     */
    public hasValidConsent(): boolean {
        if (!this.config.requireConsent) {
            return true
        }

        try {
            const consentData = this.getStoredConsent()
            if (!consentData) {
                return false
            }

            // Check if consent is still valid (not expired)
            const consentAge = Date.now() - consentData.consentTimestamp
            const maxAge = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds

            if (consentAge > maxAge) {
                this.clearStoredConsent()
                return false
            }

            // Check if consent version is current
            if (consentData.consentVersion !== this.consentVersion) {
                return false
            }

            return consentData.analyticsConsent
        } catch (error) {
            console.warn('Error checking analytics consent:', error)
            return false
        }
    }

    /**
     * Record user consent for analytics
     */
    public recordConsent(consent: boolean): void {
        const consentData: ConsentData = {
            analyticsConsent: consent,
            consentTimestamp: Date.now(),
            consentVersion: this.consentVersion
        }

        try {
            localStorage.setItem('analytics_consent', JSON.stringify(consentData))

            this.logAuditEvent('consent_recorded', {
                consent,
                version: this.consentVersion
            })
        } catch (error) {
            console.warn('Error storing analytics consent:', error)
        }
    }

    /**
     * Get stored consent data
     */
    private getStoredConsent(): ConsentData | null {
        try {
            const stored = localStorage.getItem('analytics_consent')
            return stored ? JSON.parse(stored) : null
        } catch (error) {
            console.warn('Error reading analytics consent:', err
       return null
        }
    }

    /**
     * Clear stored consent data
     */
    public clearStoredConsent(): void {
        try {
            localStorage.removeItem('analytics_consent')
            this.logAuditEvent('consent_cleared', {})
        } catch (error) {
            console.warn('Error clearing analytics consent:', error)
        }
    }

    /**
     * Check if Do Not Track is enabled
     */
    public isDNTEnabled(): boolean {
        if (typeof navigator === 'undefined') {
            return false
        }

        return navigator.doNotTrack === '1' ||
            navigator.doNotTrack === 'yes' ||
            (window as any).doNotTrack === '1'
    }

    /**
     * Check if analytics should be disabled based on privacy settings
     */
    public shouldDisableAnalytics(): boolean {
        // Check DNT header
        if (this.config.respectDNT && this.isDNTEnabled()) {
            return true
        }

        // Check user consent
        if (this.config.requireConsent && !this.hasValidConsent()) {
            return true
        }

        return false
    }

    /**
     * Anonymize sensitive data from analytics events
     */
    public anonymizeEventData(data: Record<string, unknown>): Record<string, unknown> {
        if (!this.config.anonymizeData) {
            return data
        }

        const anonymized = { ...data }

        // Remove or hash potentially sensitive fields
        const sensitiveFields = [
            'email', 'phone', 'address', 'name', 'ip', 'ipAddress',
            'password', 'token', 'auth', 'session', 'cookie'
        ]

        Object.keys(anonymized).forEach(key => {
            const lowerKey = key.toLowerCase()

            // Remove sensitive fields
            if (sensitiveFields.some(field => lowerKey.includes(field))) {
                delete anonymized[key]
                return
            }

            // Truncate long strings that might contain sensitive data
            if (typeof anonymized[key] === 'string' && anonymized[key].length > 500) {
                anonymized[key] = (anonymized[key] as string).substring(0, 500) + '...'
            }

            // Remove script tags and suspicious content
            if (typeof anonymized[key] === 'string') {
                anonymized[key] = (anonymized[key] as string)
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[script removed]')
                    .replace(/javascript:/gi, '[js removed]')
            }
        })

        return anonymized
    }

    /**
     * Generate anonymous session identifier
     */
    public generateAnonymousSessionId(): string {
        // Use crypto.randomUUID if available, fallback to timestamp + random
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return `anon_${crypto.randomUUID()}`
        }

        return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    }

    /**
     * Log audit event for compliance tracking
     */
    public logAuditEvent(action: string, details: Record<string, unknown>, userId?: string, sessionId?: string): void {
        if (!this.config.auditAccess) {
            return
        }

        const auditEntry: AuditLogEntry = {
            timestamp: Date.now(),
            action,
            userId,
            sessionId,
            details: this.anonymizeEventData(details)
        }

        this.auditLog.push(auditEntry)

        // Keep audit log size manageable (last 1000 entries)
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(-1000)
        }

        // In production, this should be sent to a secure audit logging service
        if (process.env.NODE_ENV === 'development') {
            console.log('Analytics Audit:', auditEntry)
        }
    }

    /**
     * Get audit log entries (for admin dashboard)
     */
    public getAuditLog(limit = 100): AuditLogEntry[] {
        return this.auditLog.slice(-limit)
    }

    /**
     * Validate that data collection complies with privacy requirements
     */
    public validateDataCollection(eventData: Record<string, unknown>): {
        isValid: boolean
        violations: string[]
        sanitizedData: Record<string, unknown>
    } {
        const violations: string[] = []
        let sanitizedData = { ...eventData }

        // Check for PII in the data
        const piiPatterns = [
            { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, type: 'email' },
            { pattern: /\b\d{3}-\d{3}-\d{4}\b/, type: 'phone' },
            { pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, type: 'ip_address' },
            { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, type: 'credit_card' }
        ]

        Object.entries(sanitizedData).forEach(([key, value]) => {
            if (typeof value === 'string') {
                piiPatterns.forEach(({ pattern, type }) => {
                    if (pattern.test(value)) {
                        violations.push(`Potential ${type} detected in field '${key}'`)
                        // Remove the entire field if PII is detected
                        delete sanitizedData[key]
                    }
                })
            }
        })

        // Apply additional anonymization
        sanitizedData = this.anonymizeEventData(sanitizedData)

        return {
            isValid: violations.length === 0,
            violations,
            sanitizedData
        }
    }

    /**
     * Check if data retention period has been exceeded
     */
    public shouldDeleteData(timestamp: number): boolean {
        const age = Date.now() - timestamp
        const maxAge = this.config.dataRetentionDays * 24 * 60 * 60 * 1000
        return age > maxAge
    }

    /**
     * Update privacy configuration
     */
    public updateConfig(newConfig: Partial<PrivacyConfig>): void {
        this.config = { ...this.config, ...newConfig }

        this.logAuditEvent('privacy_config_updated', {
            oldConfig: this.config,
            newConfig
        })
    }

    /**
     * Get current privacy configuration
     */
    public getConfig(): PrivacyConfig {
        return { ...this.config }
    }

    /**
     * Export user data for GDPR compliance (if user can be identified)
     */
    public exportUserData(userId: string): Record<string, unknown> {
        // This would typically query the database for user's analytics data
        // For now, return empty object since we don't store identifiable data
        this.logAuditEvent('data_export_requested', { userId })

        return {
            message: 'No personally identifiable analytics data stored',
            dataRetentionDays: this.config.dataRetentionDays,
            consentStatus: this.hasValidConsent()
        }
    }

    /**
     * Delete user data for GDPR compliance
     */
    public deleteUserData(userId: string): boolean {
        // This would typically delete user's analytics data from database
        // For now, just log the request since we don't store identifiable data
        this.logAuditEvent('data_deletion_requested', { userId })

        return true
    }
}

// Create singleton instance
export const analyticsPrivacy = new AnalyticsPrivacyService()

// Export convenience functions
export function hasAnalyticsConsent(): boolean {
    return analyticsPrivacy.hasValidConsent()
}

export function recordAnalyticsConsent(consent: boolean): void {
    analyticsPrivacy.recordConsent(consent)
}

export function shouldDisableAnalytics(): boolean {
    return analyticsPrivacy.shouldDisableAnalytics()
}

export function anonymizeData(data: Record<string, unknown>): Record<string, unknown> {
    return analyticsPrivacy.anonymizeEventData(data)
}

export function validatePrivacyCompliance(data: Record<string, unknown>) {
    return analyticsPrivacy.validateDataCollection(data)
}
