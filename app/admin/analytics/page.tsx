"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartBar, Eye, Users, Activity, TrendUp } from "@phosphor-icons/react"
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

    const handleDateRangeChange = (range: DateRange) => {
        setDateRange(range)
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onRefresh={refetch}
                refreshing={refreshing}
            />

            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-800 dark:text-red-200 font-medium">Error loading analytics data</p>
                        <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Page Views"
                        value={dashboardData?.metrics?.totalPageViews ?? 0}
                        description="Pages viewed in selected period"
                        icon={<Eye weight="duotone" className="h-4 w-4" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Unique Sessions"
                        value={dashboardData?.metrics?.uniqueSessions ?? 0}
                        description="Individual user sessions"
                        icon={<Users weight="duotone" className="h-4 w-4" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Total Events"
                        value={dashboardData?.metrics?.totalEvents ?? 0}
                        description="User interactions tracked"
                        icon={<Activity weight="duotone" className="h-4 w-4" />}
                        loading={loading}
                    />
                    <MetricCard
                        title="Avg Session Duration"
                        value={dashboardData?.metrics?.avgSessionDuration ?? "0m"}
                        description="Average time per session"
                        icon={<TrendUp weight="duotone" className="h-4 w-4" />}
                        loading={loading}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                </div>
            </div>
        </div>
    )
}
