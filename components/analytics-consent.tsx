"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Shield, Info, CheckCircle, XCircle } from '@phosphor-icons/react'
import { analyticsPrivacy, hasAnalyticsConsent, recordAnalyticsConsent, shouldDisableAnalytics } from '@/lib/analytics-privacy'
import { useSettings } from '@/hooks/use-settings'

interface AnalyticsConsentProps {
    showBanner?: boolean
    showDetails?: boolean
    onConsentChange?: (consent: boolean) => void
}

export function AnalyticsConsent({
    showBanner = false,
    showDetails = false,
    onConsentChange
}: AnalyticsConsentProps) {
    const { privacy, updatePrivacy } = useSettings()
    const [consentStatus, setConsentStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')
    const [dntEnabled, setDntEnabled] = useState(false)
    const [showConsentBanner, setShowConsentBanner] = useState(false)

    useEffect(() => {
        // Check current consent status
        const hasConsent = hasAnalyticsConsent()
        const isDntEnabled = shouldDisableAnalytics()

        setConsentStatus(hasConsent ? 'granted' : 'denied')
        setDntEnabled(isDntEnabled)

        // Show banner if consent is needed and not already given
        if (showBanner && !hasConsent && !isDntEnabled) {
            setShowConsentBanner(true)
        }
    }, [showBanner])

    const handleConsentChange = (consent: boolean) => {
        recordAnalyticsConsent(consent)
        updatePrivacy('shareAnalytics', consent)
        setConsentStatus(consent ? 'gd' : 'denied')
        setShowConsentBanner(false)

        if (onConsentChange) {
            onConsentChange(consent)
        }
    }

    const dismissBanner = () => {
        setShowConsentBanner(false)
        // If user dismisses without choosing, assume they don't want analytics
        if (consentStatus === 'unknown') {
            handleConsentChange(false)
        }
    }

    if (showConsentBanner) {
        return (
            <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
                <Card className="shadow-lg border-2 border-primary/20 bg-card/95 backdrop-blur">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Shield weight="duotone" className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">Analytics & Privacy</CardTitle>
                        </div>
                        <CardDescription>
                            Help us improve Rant by sharing anonymous usage data. We never collect personal information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleConsentChange(true)}
                                    className="flex-1"
                                    size="sm"
                                >
                                    <CheckCircle weight="duotone" className="w-4 h-4 mr-2" />
                                    Allow
                                </Button>
                                <Button
                                    onClick={() => handleConsentChange(false)}
                                    variant="outline"
                                    className="flex-1"
                                    size="sm"
                                >
                                    <XCircle weight="duotone" className="w-4 h-4 mr-2" />
                                    Decline
                                </Button>
                            </div>
                            <Button
                                onClick={dismissBanner}
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                            >
                                Dismiss
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!showDetails) {
        return null
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield weight="duotone" className="w-5 h-5 text-primary" />
                        <CardTitle>Analytics & Privacy</CardTitle>
                    </div>
                    <Badge
                        variant={consentStatus === 'granted' ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                    >
                        {consentStatus === 'granted' ? (
                            <CheckCircle weight="duotone" className="w-3 h-3" />
                        ) : (
                            <XCircle weight="duotone" className="w-3 h-3" />
                        )}
                        {consentStatus === 'granted' ? 'Enabled' : 'Disabled'}
                    </Badge>
                </div>
                <CardDescription>
                    Control how your usage data is collected and used to improve the platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {dntEnabled && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Info weight="duotone" className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-medium text-amber-800 dark:text-amber-200">Do Not Track Detected</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                Your browser has Do Not Track enabled. Analytics are automatically disabled to respect your privacy preference.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h4 className="font-medium text-card-foreground">Share Anonymous Analytics</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            Help improve Rant by sharing anonymous usage data. This includes page views, feature usage, and performance metrics.
                        </p>
                    </div>
                    <Switch
                        checked={privacy.shareAnalytics && !dntEnabled}
                        onCheckedChange={handleConsentChange}
                        disabled={dntEnabled}
                    />
                </div>

                <div className="space-y-3 pt-2 border-t">
                    <h4 className="font-medium text-card-foreground text-sm">What we collect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Page views and navigation patterns</li>
                        <li>• Feature usage and interaction data</li>
                        <li>• Performance metrics and error reports</li>
                        <li>• Anonymous session information</li>
                    </ul>

                    <h4 className="font-medium text-card-foreground text-sm pt-2">What we never collect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Personal information or identifiers</li>
                        <li>• IP addresses or location data</li>
                        <li>• Content of your rants or comments</li>
                        <li>• Cookies or persistent tracking</li>
                    </ul>
                </div>

                <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                    <Info weight="duotone" className="w-4 h-4" />
                    <span>Data is automatically deleted after 365 days. You can change this setting anytime.</span>
                </div>
            </CardContent>
        </Card>
    )
}

export function AnalyticsConsentBanner() {
    return <AnalyticsConsent showBanner={true} />
}

export function AnalyticsConsentSettings() {
    return <AnalyticsConsent showDetails={true} />
}
