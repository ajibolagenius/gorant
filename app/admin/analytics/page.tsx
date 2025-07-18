"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartBar, Eye, Users, Lightning, TrendUp } from "@phosphor-icons/react/dist/ssr"
import { subDays } from "date-fns"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { DashboardHeader } from "@/components/analytics/dashboard-header"
import { MetricCard } from "@/components/analytics/metric-card"
import { TopPagesTable } from "@/components/analytics/top-pages-table"

interface DateRange {
    from: Date
    to: Date
}

export default function AnalyticsDashboard() {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: subDays(new Date(), 7),
        to: new Date()
    })
    const { data: dashboardData, loading, refreshing, error, refetch } = useDashboardData(dateRange)

    const handleDateRangeChange = useCallback((range: DateRange) => {
        setDateRange(range)
    }, [])

    const metrics = useMemo(() => ({
        totalPageViews: dashboardData?.metrics?.totalPageViews ?? 0,
        uniqueSessions: dashboardData?.metrics?.uniqueSessions ?? 0,
        totalEvents: dashboardData?.metrics?.totalEvents ?? 0,
        avgSessionDuration: dashboardData?.metrics?.avgSessionDuration ?? "0m"
    }), [dashboardData?.metrics])

    return (
        <div className="min-h-screen bg-background" role="main" aria-label="Analytics Dashboard">
            <DashboardHeader
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onRefresh={refetch}
                refreshing={refreshing}
            />

            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-800 dark:text-red-200 font-medium">Error loading analytics data</p>
                                <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refetch}
                                disabled={refreshing}
                                className="text-red-700 dark:text-red-300 border-red-300 dark:border-red-700"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" aria-label="Key Metrics">
                    <MetricCard
                        title="Total Page Views"
                        value={metrics.totalPageViews}
                        description="Pages viewed in selected period"
                        icon={<Eye weight="duotone" className="h-4 w-4" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Unique Sessions"
                        value={metrics.uniqueSessions}
                        description="Individual user sessions"
                        icon={<Users weight="duotone" className="h-4 w-4" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Events"
                        value={metrics.totalEvents}
                        description="User interactions tracked"
                        icon={<Lightning weight="duotone" className="h-4 w-4" />}
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

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Detailed Analytics">
                    <TopPagesTable
                        data={dashboardData?.topPages || []}
                        loading={loading}
                    />

                    <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                                User Activity Chart
                            </CardTitle>
                            <CardDescription>
                                Activity trends over time (Coming Soon)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <ChartBar weight="duotone" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">Charts Coming Soon</p>
                                <p className="text-sm">Advanced visualizations will be available in the next update</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    )
}
