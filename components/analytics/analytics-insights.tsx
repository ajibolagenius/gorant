"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    TrendUp,
    TrendDown,
    Clock,
    Users,
    Eye,
    Lightning,
    Heart,
    ChatCircle,
    Star,
    Warning
} from "@phosphor-icons/react/dist/ssr"
import { format, differenceInDays } from 'date-fns'
import type { DashboardData } from '@/lib/analytics-api'

interface DateRange {
    from: Date
    to: Date
}

interface AnalyticsInsightsProps {
    data: DashboardData | null
    loading?: boolean
    dateRange: DateRange
}

interface Insight {
    id: string
    title: string
    description: string
    value: string | number
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    icon: React.ReactNode
    color: 'green' | 'red' | 'blue' | 'yellow' | 'purple'
    priority: 'high' | 'medium' | 'low'
}

export function AnalyticsInsights({ data, loading = false, dateRange }: AnalyticsInsightsProps) {
    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Lightning weight="duotone" className="h-5 w-5" />
                        Analytics Insights
                    </CardTitle>
                    <CardDescription>Key insights and recommendations based on your data</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data) {
        return null
    }

    // Generate insights based on the data
    const insights: Insight[] = []
    const daysDiff = differenceInDays(dateRange.to, dateRange.from) + 1

    // Page views per day insight
    const avgPageViewsPerDay = Math.round((data.metrics?.totalPageViews || 0) / daysDiff)
    insights.push({
        id: 'pageviews-daily',
        title: 'Daily Page Views',
        description: `Average ${avgPageViewsPerDay} views per day`,
        value: avgPageViewsPerDay,
        icon: <Eye weight="duotone" className="h-4 w-4" />,
        color: avgPageViewsPerDay > 100 ? 'green' : avgPageViewsPerDay > 50 ? 'blue' : 'yellow',
        priority: 'high',
        trend: avgPageViewsPerDay > 100 ? 'up' : avgPageViewsPerDay < 20 ? 'down' : 'neutral'
    })

    // Session engagement insight
    const avgEventsPerSession = data.metrics?.uniqueSessions
        ? Math.round((data.metrics?.totalEvents || 0) / data.metrics.uniqueSessions)
        : 0
    insights.push({
        id: 'session-engagement',
        title: 'Session Engagement',
        description: `${avgEventsPerSession} events per session`,
        value: `${avgEventsPerSession}x`,
        icon: <Users weight="duotone" className="h-4 w-4" />,
        color: avgEventsPerSession > 5 ? 'green' : avgEventsPerSession > 2 ? 'blue' : 'red',
        priority: 'high',
        trend: avgEventsPerSession > 3 ? 'up' : 'down'
    })

    // Top performing content type
    const topContentType = data.contentPerformance?.reduce((prev, current) =>
        (prev.actionCount > current.actionCount) ? prev : current
    )
    if (topContentType) {
        insights.push({
            id: 'top-content',
            title: 'Top Content Type',
            description: `${topContentType.contentType} mood performs best`,
            value: topContentType.actionCount,
            icon: <Heart weight="duotone" className="h-4 w-4" />,
            color: 'purple',
            priority: 'medium'
        })
    }

    // Most popular page
    const topPage = data.topPages?.[0]
    if (topPage) {
        const pageDisplayName = topPage.page === '/' ? 'Home' : topPage.page
        insights.push({
            id: 'top-page',
            title: 'Most Popular Page',
            description: `${pageDisplayName} leads with ${topPage.pageViews} views`,
            value: topPage.pageViews,
            icon: <Star weight="duotone" className="h-4 w-4" />,
            color: 'blue',
            priority: 'medium'
        })
    }

    // User activity pattern
    const totalEvents = data.metrics?.totalEvents || 0
    const activityLevel = totalEvents > 1000 ? 'High' : totalEvents > 500 ? 'Medium' : 'Low'
    insights.push({
        id: 'activity-level',
        title: 'Activity Level',
        description: `${activityLevel} user engagement detected`,
        value: activityLevel,
        icon: <Lightning weight="duotone" className="h-4 w-4" />,
        color: activityLevel === 'High' ? 'green' : activityLevel === 'Medium' ? 'blue' : 'yellow',
        priority: 'medium'
    })

    // Time period summary
    insights.push({
        id: 'time-period',
        title: 'Analysis Period',
        description: `${daysDiff} days of data analyzed`,
        value: `${daysDiff}d`,
        icon: <Clock weight="duotone" className="h-4 w-4" />,
        color: 'blue',
        priority: 'low'
    })

    // Sort insights by priority
    const sortedInsights = insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'green':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            case 'red':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            case 'blue':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
            case 'yellow':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
            case 'purple':
                return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200'
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'
        }
    }

    const getTrendIcon = (trend?: string) => {
        switch (trend) {
            case 'up':
                return <TrendUp weight="duotone" className="h-3 w-3 text-green-600" />
            case 'down':
                return <TrendDown weight="duotone" className="h-3 w-3 text-red-600" />
            default:
                return null
        }
    }

    return (
        <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Lightning weight="duotone" className="h-5 w-5" />
                    Analytics Insights
                </CardTitle>
                <CardDescription>
                    Key insights and recommendations for {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedInsights.map((insight) => (
                        <div
                            key={insight.id}
                            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getColorClasses(insight.color)}`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {insight.icon}
                                    <h4 className="font-medium text-sm">{insight.title}</h4>
                                </div>
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(insight.trend)}
                                    {insight.priority === 'high' && (
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                            High
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold">{insight.value}</p>
                                <p className="text-xs opacity-80">{insight.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Stats Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {data.metrics?.totalPageViews || 0}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Total Views</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {data.metrics?.uniqueSessions || 0}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Sessions</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {data.metrics?.totalEvents || 0}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Events</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {daysDiff}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Days</p>
                        </div>
                    </div>
                </div>
                {/* End Quick Stats Summary */}
                {/* Break line */}
                <div className="my-6 border-t border-gray-200 dark:border-gray-700" />
            </CardContent>
        </Card>
    )
}
