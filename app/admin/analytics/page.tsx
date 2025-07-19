"use client"

import React, { useState, useCallback, useMemo, memo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartBar, Eye, Users, Lightning, TrendUp } from "@phosphor-icons/react/dist/ssr"
import { subDays } from "date-fns"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useAnalyticsMetrics } from "@/hooks/use-analytics-metrics"
import { DashboardHeader } from "@/components/analytics/dashboard-header"
import { MetricCard } from "@/components/analytics/metric-card"
import { TopPagesTable } from "@/components/analytics/top-pages-table"
import { EnhancedTimeSeriesChart } from "@/components/analytics/enhanced-time-series-chart"
import { ContentPerformanceChart } from "@/components/analytics/content-performance-chart"
import { UserActionsChart } from "@/components/analytics/user-actions-chart"
import { TopPagesVisualization } from "@/components/analytics/top-pages-visualization"
import { AnalyticsInsights } from "@/components/analytics/analytics-insights"
import { RealTimeMetrics } from "@/components/analytics/real-time-metrics"

interface DateRange {
    from: Date
    to: Date
}

// Memoized animated section component for better performance
const AnimatedSection = memo(function AnimatedSection({
    children,
    delay = 0
}: {
    children: React.ReactNode
    delay?: number
}) {
    return (
        <div
            className="animate-in fade-in-50 duration-500"
            style={{ animationDelay: `${delay}ms` }}
        >
            {children}
        </div>
    )
})

// Enhanced error boundary component
const ErrorBoundary = memo(function ErrorBoundary({
    error,
    onRetry,
    refreshing
}: {
    error: string | null
    onRetry: () => void
    refreshing: boolean
}) {
    if (!error) return null

    const getErrorMessage = (error: string) => {
        if (error.includes('network')) return 'Network connection issue. Please check your internet connection.'
        if (error.includes('timeout')) return 'Request timed out. The server may be experiencing high load.'
        if (error.includes('unauthorized')) return 'Authentication required. Please refresh the page and try again.'
        return error
    }

    const getErrorSuggestion = (error: string) => {
        if (error.includes('network')) return 'Try refreshing the page or check your network connection.'
        if (error.includes('timeout')) return 'Wait a moment and try again, or try a smaller date range.'
        if (error.includes('unauthorized')) return 'You may need to log in again.'
        return 'If the problem persists, please contact support.'
    }

    return (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-red-800 dark:text-red-200 font-medium">Error loading analytics data</p>
                    <p className="text-red-600 dark:text-red-300 text-sm mt-1">{getErrorMessage(error)}</p>
                    <p className="text-red-500 dark:text-red-400 text-xs mt-2">{getErrorSuggestion(error)}</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    disabled={refreshing}
                    className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 ml-4"
                >
                    {refreshing ? 'Retrying...' : 'Try Again'}
                </Button>
            </div>
        </div>
    )
})

export default function AnalyticsDashboard() {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: subDays(new Date(), 7),
        to: new Date()
    })
    const { data: dashboardData, loading, refreshing, error, refetch } = useDashboardData(dateRange)
    const metrics = useAnalyticsMetrics(dashboardData)

    const handleDateRangeChange = useCallback((range: DateRange) => {
        setDateRange(range)
    }, [])

    // Memoize chart data to prevent unnecessary re-renders
    const chartData = useMemo(() => ({
        timeSeries: dashboardData?.timeSeries || [],
        eventCounts: dashboardData?.eventCounts || [],
        contentPerformance: dashboardData?.contentPerformance || [],
        topPages: dashboardData?.topPages || []
    }), [dashboardData])

    return (
        <div className="min-h-screen bg-background" role="main" aria-label="Analytics Dashboard">
            <DashboardHeader
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onRefresh={refetch}
                refreshing={refreshing}
            />

            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <ErrorBoundary error={error} onRetry={refetch} refreshing={refreshing} />

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" aria-label="Key Metrics">
                    <MetricCard
                        title="Total Page Views"
                        value={metrics.totalPageViews}
                        description="Pages viewed in selected period"
                        icon={<Eye weight="duotone" className="h-4 w-4" />}
                        trend={metrics.trends ? {
                            value: metrics.trends.pageViewsTrend,
                            isPositive: metrics.trends.pageViewsTrend >= 0
                        } : undefined}
                        loading={loading}
                    />
                    <MetricCard
                        title="Unique Sessions"
                        value={metrics.uniqueSessions}
                        description="Individual user sessions"
                        icon={<Users weight="duotone" className="h-4 w-4" />}
                        trend={metrics.trends ? {
                            value: metrics.trends.sessionsTrend,
                            isPositive: metrics.trends.sessionsTrend >= 0
                        } : undefined}
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Events"
                        value={metrics.totalEvents}
                        description="User interactions tracked"
                        icon={<Lightning weight="duotone" className="h-4 w-4" />}
                        trend={metrics.trends ? {
                            value: metrics.trends.eventsTrend,
                            isPositive: metrics.trends.eventsTrend >= 0
                        } : undefined}
                        loading={loading}
                    />
                    <MetricCard
                        title="Avg Session Duration"
                        value={metrics.avgSessionDuration}
                        description="Average time per session"
                        icon={<TrendUp weight="duotone" className="h-4 w-4" />}
                        loading={loading}
                    />
                </section>

                <section className="space-y-8" aria-label="Detailed Analytics">
                    {/* Real-time Metrics */}
                    <AnimatedSection delay={0}>
                        <RealTimeMetrics />
                    </AnimatedSection>

                    {/* Time Series Chart - Full Width */}
                    <AnimatedSection delay={200}>
                        <EnhancedTimeSeriesChart
                            data={chartData.timeSeries}
                            loading={loading}
                        />
                    </AnimatedSection>

                    {/* Two column layout for charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <AnimatedSection delay={400}>
                            <UserActionsChart
                                data={chartData.eventCounts}
                                loading={loading}
                            />
                        </AnimatedSection>

                        <AnimatedSection delay={600}>
                            <ContentPerformanceChart
                                data={chartData.contentPerformance}
                                loading={loading}
                            />
                        </AnimatedSection>
                    </div>

                    {/* Top Pages Visualization - Full Width */}
                    <AnimatedSection delay={800}>
                        <TopPagesVisualization
                            data={chartData.topPages}
                            loading={loading}
                        />
                    </AnimatedSection>

                    {/* Analytics Insights Section */}
                    <AnimatedSection delay={1000}>
                        <AnalyticsInsights
                            data={dashboardData}
                            loading={loading}
                            dateRange={dateRange}
                        />
                    </AnimatedSection>
                </section>
            </div>
        </div>
    )
}
