"use client"

import React, { useState, useMemo } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Area,
    AreaChart,
    ReferenceLine
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendUp, ChartLine, ChartBar, Eye, Users, Lightning } from "@phosphor-icons/react/dist/ssr"
import { format, parseISO } from 'date-fns'

interface TimeSeriesData {
    timeBucket: string
    pageViews: number
    uniqueSessions: number
    totalEvents: number
}

interface EnhancedTimeSeriesChartProps {
    data: TimeSeriesData[]
    loading?: boolean
    title?: string
    description?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payad && payload.length) {
        const date = parseISO(label)
        return (
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 min-w-[200px]">
                <p className="font-medium text-foreground mb-3 text-center border-b pb-2">
                    {format(date, 'MMM dd, yyyy')}
                </p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm">{entry.name}</span>
                            </div>
                            <span className="font-semibold" style={{ color: entry.color }}>
                                {entry.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Calculate and show percentage changes */}
                <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
                    <p>Click point for detailed analysis</p>
                </div>
            </div>
        )
    }
    return null
}

const MetricSummary = ({ data }: { data: TimeSeriesData[] }) => {
    const summary = useMemo(() => {
        if (!data || data.length === 0) return null

        const totalPageViews = ta.reduce((sum, item) => sum + item.pageViews, 0)
        const totalSessions = data.reduce((sum, item) => sum + item.uniqueSessions, 0)
        const totalEvents = data.reduce((sum, item) => sum + item.totalEvents, 0)
        const avgPageViews = Math.round(totalPageViews / data.length)
        const avgSessions = Math.round(totalSessions / data.length)

        // Calculate trends (comparing first half vs second half)
        const midPoint = Math.floor(data.length / 2)
        const firstHalf = data.slice(0, midPoint)
        const secondHalf = data.slice(midPoint)

        const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.pageViews, 0) / firstHalf.length
        const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.pageViews, 0) / secondHalf.length
        const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(1)

        return {
            totalPageViews,
            totalSessions,
            totalEvents,
            avgPageViews,
            avgSessions,
            trendPercentage: parseFloat(trendPercentage),
            isPositiveTrend: parseFloat(trendPercentage) > 0
        }
    }, [data])

    if (!summary) return null

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <Eye weight="duotone" className="h-4 w-4 text-blue-600" />
                    <p className="text-xs font-medium text-muted-foreground">Avg Daily Views</p>
                </div>
                <p className="text-lg font-bold text-blue-600">{summary.avgPageViews}</p>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <Users weight="duotone" className="h-4 w-4 text-green-600" />
                    <p className="text-xs font-medium text-muted-foreground">Avg Sessions</p>
                </div>
                <p className="text-lg font-bold text-green-600">{summary.avgSessions}</p>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <Lightning weight="duotone" className="h-4 w-4 text-purple-600" />
                    <p className="text-xs font-medium text-muted-foreground">Total Events</p>
                </div>
                <p className="text-lg font-bold text-purple-600">{summary.totalEvents.toLocaleString()}</p>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendUp weight="duotone" className={`h-4 w-4 ${summary.isPositiveTrend ? 'text-green-600' : 'text-red-600'}`} />
                    <p className="text-xs font-medium text-muted-foreground">Trend</p>
                </div>
                <div className="flex items-center justify-center gap-1">
                    <p className={`text-lg font-bold ${summary.isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
                        {summary.isPositiveTrend ? '+' : ''}{summary.trendPercentage}%
                    </p>
                </div>
            </div>
            <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-1">Engagement Rate</p>
                <p className="text-lg font-bold text-orange-600">
                    {summary.totalSessions > 0 ? (summary.totalEvents / summary.totalSessions).toFixed(1) : '0'}x
                </p>
            </div>
        </div>
    )
}

export function EnhancedTimeSeriesChart({
    data,
    loading = false,
    title = "Activity Over Time",
    description = "Page views and user sessions trends"
}: EnhancedTimeSeriesChartProps) {
    const [chartType, setChartType] = useState<'line' | 'area'>('line')
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendUp weight="duotone" className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
                <CardHeader>
                    <CardTitle className="text-lg font-sem-gray-900 dark:text-white flex items-center gap-2">
                        <TrendUp weight="duotone" className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                            <TrendUp weight="duotone" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="font-medium text-lg">No data available</p>
                            <p className="text-sm">Data will appear once users start interacting with the platform</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 20, right: 30, left: 20, bottom: 5 }
        }

        if (chartType === 'area') {
            return (
                <AreaChart {...commonProps}>
                    <defs>
                        <linearGradient id="pageViewsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis
                        dataKey="timeBucket"
                        tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                        className="text-gray-600 dark:text-gray-400"
                        fontSize={12}
                    />
                    <YAxis className="text-gray-600 dark:text-gray-400" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="pageViews"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#pageViewsGradient)"
                        name="Page Views"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="uniqueSessions"
                        stroke="hsl(var(--secondary))"
                        fillOpacity={1}
                        fill="url(#sessionsGradient)"
                        name="Unique Sessions"
                        strokeWidth={2}
                    />
                </AreaChart>
            )
        }

        return (
            <LineChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                    dataKey="timeBucket"
                    tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                    className="text-gray-600 dark:text-gray-400"
                    fontSize={12}
                />
                <YAxis className="text-gray-600 dark:text-gray-400" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="pageViews"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    name="Page Views"
                />
                <Line
                    type="monotone"
                    dataKey="uniqueSessions"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--secondary))", strokeWidth: 2 }}
                    name="Unique Sessions"
                />
                <Line
                    type="monotone"
                    dataKey="totalEvents"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: "hsl(var(--accent))", strokeWidth: 2 }}
                    name="Total Events"
                    strokeDasharray="5 5"
                />
            </LineChart>
        )
    }

    return (
        <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendUp weight="duotone" className="h-5 w-5" />
                            {title}
                        </CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={chartType === 'line' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setChartType('line')}
                            className="h-8"
                        >
                            <ChartLine weight="duotone" className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={chartType === 'area' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setChartType('area')}
                            className="h-8"
                        >
                            <ChartBar weight="duotone" className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <MetricSummary data={data} />
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
