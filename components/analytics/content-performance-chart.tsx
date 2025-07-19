"use client"

import React, { useMemo } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartBar, Heart } from "@phosphor-icons/react/dist/ssr"

interface ContentPerformanceData {
    contentType: string
    actionType: string
    actionCount: number
    uniqueSessions: number
}

interface ContentPerformanceChartProps {
    data: ContentPerformanceData[]
    loading?: boolean
    title?: string
    description?: string
}

// Mood colors matching the platform's theme
const MOOD_COLORS = {
    angry: '#ef4444',
    sad: '#3b82f6',
    happy: '#22c55e',
    excited: '#f59e0b',
    frustrated: '#dc2626',
    grateful: '#10b981',
    anxious: '#8b5cf6',
    content: '#06b6d4',
    default: '#6b7280'
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
                <p className="font-medium text-foreground mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export function ContentPerformanceChart({
    data,
    loading = false,
    title = "Content Performance",
    description = "Rant engagement metrics by mood and action type"
}: ContentPerformanceChartProps) {
    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <ChartBar weight="duotone" className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
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
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <ChartBar weight="duotone" className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                            <Heart weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No engagement data available</p>
                            <p className="text-sm">Content performance metrics will appear once users start interacting</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Process data for different visualizations
    const moodEngagementData = data.reduce((acc, item) => {
        const mood = item.contentType || 'unknown'
        if (!acc[mood]) {
            acc[mood] = { mood, likes: 0, comments: 0, bookmarks: 0, posts: 0 }
        }

        switch (item.actionType) {
            case 'like':
                acc[mood].likes += item.actionCount
                break
            case 'comment':
                acc[mood].comments += item.actionCount
                break
            case 'bookmark':
                acc[mood].bookmarks += item.actionCount
                break
            case 'post':
                acc[mood].posts += item.actionCount
                break
        }

        return acc
    }, {} as Record<string, any>)

    const moodEngagementArray = Object.values(moodEngagementData)

    // Pie chart data for action distribution
    const actionDistribution = data.reduce((acc, item) => {
        const action = item.actionType
        const existing = acc.find(a => a.name === action)
        if (existing) {
            existing.value += item.actionCount
        } else {
            acc.push({ name: action, value: item.actionCount })
        }
        return acc
    }, [] as Array<{ name: string; value: number }>)

    // Calculate mood insights
    const moodInsights = useMemo(() => {
        if (!moodEngagementArray.length) return null

        const totalEngagement = moodEngagementArrassNeduce((sum, mood) =>
            sum + mood.likes + mood.comments + mood.bookmarks + mood.posts, 0
        )

        const topMood = moodEngagementArray.reduce((prev, current) => {
            const prevTotal = prev.likes + prev.comments + prev.bookmarks + prev.posts
            const currentTotal = current.likes + current.comments + current.bookmarks + current.posts
            return currentTotal > prevTotal ? current : prev
        })

        const topMoodTotal = topMood.likes + topMood.comments + topMood.bookmarks + topMood.posts
        const topMoodPercentage = totalEngagement > 0 ? ((topMoodTotal / totalEngagement) * 100).toFixed(1) : '0'

        return {
            topMood: topMood.mood,
            topMoodPercentage,
            totalEngagement,
            mostEngagedAction: Object.entries(topMood)
                .filter(([key]) => key !== 'mood')
                .reduce((a, b) => a[1] > b[1] ? a : b)[0]
        }
    }, [moodEngagementArray])

    return (
        <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ChartBar weight="duotone" className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Mood Insights Summary */}
                {moodInsights && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                    Top Performing Mood: {moodInsights.topMood.charAt(0).toUpperCase() + moodInsights.topMood.slice(1)}
                                </h4>
                                <p className="text-sm text-purple-700 dark:text-purple-300">
                                    {moodInsights.topMoodPercentage}% of total engagement • Most popular action: {moodInsights.mostEngagedAction}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {moodInsights.totalEngagement.toLocaleString()}
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-400">Total Interactions</p>
                            </div>
                        </div>
                    </div>
                )}

                <Tabs defaultValue="mood-engagement" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mood-engagement">By Mood</TabsTrigger>
                        <TabsTrigger value="action-distribution">Actions</TabsTrigger>
                        <TabsTrigger value="mood-breakdown">Breakdown</TabsTrigger>
                    </TabsList>

                    <TabsContent value="mood-engagement" className="mt-4">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={moodEngagementArray} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-gray-200 dark:stroke-gray-700"
                                    />
                                    <XAxis
                                        dataKey="mood"
                                        className="text-gray-600 dark:text-gray-400"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        className="text-gray-600 dark:text-gray-400"
                                        fontSize={12}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey="likes"
                                        fill="#ef4444"
                                        name="Likes"
                                        radius={[2, 2, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="comments"
                                        fill="#3b82f6"
                                        name="Comments"
                                        radius={[2, 2, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="bookmarks"
                                        fill="#22c55e"
                                        name="Bookmarks"
                                        radius={[2, 2, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="posts"
                                        fill="#f59e0b"
                                        name="Posts"
                                        radius={[2, 2, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="action-distribution" className="mt-4">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={actionDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {actionDistribution.map((entry, index) => {
                                            const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6']
                                            return (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={colors[index % colors.length]}
                                                />
                                            )
                                        })}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="mood-breakdown" className="mt-4">
                        <div className="space-y-4">
                            {moodEngagementArray.map((mood, index) => {
                                const total = mood.likes + mood.comments + mood.bookmarks + mood.posts
                                const moodColor = MOOD_COLORS[mood.mood as keyof typeof MOOD_COLORS] || MOOD_COLORS.default

                                return (
                                    <div key={mood.mood} className="p-4 border rounded-lg bg-muted/30">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: moodColor }}
                                                />
                                                <h4 className="font-semibold capitalize">{mood.mood}</h4>
                                            </div>
                                            <Badge variant="outline" className="font-mono">
                                                {total.toLocaleString()} total
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 text-sm">
                                            <div className="text-center">
                                                <p className="font-semibold text-red-600">{mood.likes}</p>
                                                <p className="text-xs text-muted-foreground">Likes</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-blue-600">{mood.comments}</p>
                                                <p className="text-xs text-muted-foreground">Comments</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-green-600">{mood.bookmarks}</p>
                                                <p className="text-xs text-muted-foreground">Bookmarks</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-yellow-600">{mood.posts}</p>
                                                <p className="text-xs text-muted-foreground">Posts</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
