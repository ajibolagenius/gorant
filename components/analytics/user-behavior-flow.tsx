"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ArrowRight,
    Clock,
    Users,
    TrendUp,
    Eye,
    Lightning,
    Path,
    ChartLine,
    Calendar
} from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"

interface UserBehaviorData {
    userFlow: Array<{
        from: string
        to: string
        users: number
        percentage: number
        dropOffRate: number
    }>
    peakUsageTimes: Array<{
        hour: number
        day: string
        users: number
        events: number
        label: string
    }>
    sessionPatterns: Array<{
        pattern: string
        count: number
        avgDuration: string
        bounceRate: number
        description: string
    }>
    conversionFunnels: Array<{
        step: string
        users: number
        conversionRate: number
        dropOff: number
    }>
}

interface UserBehaviorFlowProps {
    data: UserBehaviorData | null
    loading?: boolean
    className?: string
}

const HOUR_LABELS = [
    '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM',
    '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
    '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
    '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function UserBehaviorFlow({ data, loading = false, className }: UserBehaviorFlowProps) {
    const mockData: UserBehaviorData = useMemo(() => ({
        userFlow: [
            { from: 'Home', to: 'Bookmarks', users: 234, percentage: 45, dropOffRate: 12 },
            { from: 'Home', to: 'Trending', users: 189, percentage: 36, dropOffRate: 8 },
            { from: 'Home', to: 'Challenges', users: 156, percentage: 30, dropOffRate: 15 },
            { from: 'Bookmarks', to: 'Rant Detail', users: 123, percentage: 53, dropOffRate: 20 },
            { from: 'Trending', to: 'Rant Detail', users: 98, percentage: 52, dropOffRate: 18 },
            { from: 'Rant Detail', to: 'Comments', users: 87, percentage: 39, dropOffRate: 25 },
            { from: 'Comments', to: 'Post Comment', users: 45, percentage: 52, dropOffRate: 30 },
            { from: 'Challenges', to: 'Challenge Detail', users: 67, percentage: 43, dropOffRate: 22 }
        ],
        peakUsageTimes: [
            { hour: 9, day: 'Mon', users: 234, events: 1247, label: '9 AM Monday' },
            { hour: 14, day: 'Wed', users: 189, events: 987, label: '2 PM Wednesday' },
            { hour: 20, day: 'Fri', users: 267, events: 1456, label: '8 PM Friday' },
            { hour: 11, day: 'Sat', users: 156, events: 834, label: '11 AM Saturday' },
            { hour: 16, day: 'Sun', users: 198, events: 1123, label: '4 PM Sunday' },
            { hour: 13, day: 'Tue', users: 145, events: 756, label: '1 PM Tuesday' },
            { hour: 18, day: 'Thu', users: 223, events: 1289, label: '6 PM Thursday' }
        ],
        sessionPatterns: [
            {
                pattern: 'Quick Browse',
                count: 456,
                avgDuration: '2m 34s',
                bounceRate: 65,
                description: 'Users who view 1-3 pages and leave quickly'
            },
            {
                pattern: 'Deep Engagement',
                count: 234,
                avgDuration: '12m 45s',
                bounceRate: 15,
                description: 'Users who interact extensively with content'
            },
            {
                pattern: 'Content Creator',
                count: 123,
                avgDuration: '8m 23s',
                bounceRate: 25,
                description: 'Users who post rants and engage with others'
            },
            {
                pattern: 'Passive Consumer',
                count: 189,
                avgDuration: '5m 12s',
                bounceRate: 45,
                description: 'Users who read content but rarely interact'
            }
        ],
        conversionFunnels: [
            { step: 'Landing', users: 1000, conversionRate: 100, dropOff: 0 },
            { step: 'Browse Content', users: 750, conversionRate: 75, dropOff: 250 },
            { step: 'Engage (Like/Comment)', users: 450, conversionRate: 45, dropOff: 300 },
            { step: 'Create Content', users: 180, conversionRate: 18, dropOff: 270 },
            { step: 'Return Visit', users: 120, conversionRate: 12, dropOff: 60 }
        ]
    }), [])

    const behaviorData = data || mockData

    if (loading) {
        return (
            <Card className={cn("bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0", className)}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Path weight="duotone" className="h-5 w-5" />
                        User Behavior Flow
                    </CardTitle>
                    <CardDescription>User journey patterns and peak usage insights</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const getFlowStrength = (percentage: number) => {
        if (percentage >= 40) return 'strong'
        if (percentage >= 20) return 'medium'
        return 'weak'
    }

    const getFlowColor = (strength: string) => {
        switch (strength) {
            case 'strong':
                return 'bg-green-500'
            case 'medium':
                return 'bg-yellow-500'
            default:
                return 'bg-red-500'
        }
    }

    const getUsageIntensity = (users: number) => {
        const maxUsers = Math.max(...behaviorData.peakUsageTimes.map(t => t.users))
        return (users / maxUsers) * 100
    }

    return (
        <Card className={cn("bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0", className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Path weight="duotone" className="h-5 w-5" />
                    User Behavior Flow
                </CardTitle>
                <CardDescription>
                    User journey patterns, peak usage times, and behavior insights
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="flow" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="flow" className="text-xs">
                            <Path weight="duotone" className="h-4 w-4 mr-1" />
                            User Flow
                        </TabsTrigger>
                        <TabsTrigger value="peak-times" className="text-xs">
                            <Clock weight="duotone" className="h-4 w-4 mr-1" />
                            Peak Times
                        </TabsTrigger>
                        <TabsTrigger value="patterns" className="text-xs">
                            <ChartLine weight="duotone" className="h-4 w-4 mr-1" />
                            Patterns
                        </TabsTrigger>
                        <TabsTrigger value="funnels" className="text-xs">
                            <TrendUp weight="duotone" className="h-4 w-4 mr-1" />
                            Funnels
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="flow" className="space-y-4">
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">User Navigation Flow</h4>
                            <div className="space-y-2">
                                {behaviorData.userFlow.map((flow, index) => {
                                    const strength = getFlowStrength(flow.percentage)
                                    return (
                                        <div
                                            key={`${flow.from}-${flow.to}-${index}`}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <span className="font-medium text-sm truncate">{flow.from}</span>
                                                    <ArrowRight weight="duotone" className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <span className="font-medium text-sm truncate">{flow.to}</span>
                                                </div>
                                                <div className={cn("h-2 w-16 rounded-full", getFlowColor(strength))}>
                                                    <div
                                                        className="h-full bg-current rounded-full opacity-60"
                                                        style={{ width: `${flow.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 ml-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{flow.users}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">users</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{flow.percentage}%</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">conversion</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                                        {flow.dropOffRate}%
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">drop-off</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="peak-times" className="space-y-4">
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Peak Usage Times</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {behaviorData.peakUsageTimes
                                    .sort((a, b) => b.users - a.users)
                                    .map((time, index) => (
                                        <div
                                            key={`${time.day}-${time.hour}`}
                                            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Clock weight="duotone" className="h-4 w-4 text-blue-500" />
                                                    <span className="font-medium text-sm">{time.label}</span>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    #{index + 1}
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Users</span>
                                                    <span className="text-sm font-medium">{time.users}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">Events</span>
                                                    <span className="text-sm font-medium">{time.events}</span>
                                                </div>
                                                <Progress
                                                    value={getUsageIntensity(time.users)}
                                                    className="h-2 mt-2"
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="patterns" className="space-y-4">
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Session Patterns</h4>
                            <div className="space-y-3">
                                {behaviorData.sessionPatterns.map((pattern) => (
                                    <div
                                        key={pattern.pattern}
                                        className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h5 className="font-medium text-sm">{pattern.pattern}</h5>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    {pattern.description}
                                                </p>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {pattern.count} sessions
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {pattern.avgDuration}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Avg Duration</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                                    {pattern.bounceRate}%
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Bounce Rate</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="funnels" className="space-y-4">
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Conversion Funnels</h4>
                            <div className="space-y-2">
                                {behaviorData.conversionFunnels.map((step, index) => (
                                    <div
                                        key={step.step}
                                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <Badge variant="outline" className="text-xs min-w-fit">
                                                {index + 1}
                                            </Badge>
                                            <span className="font-medium text-sm">{step.step}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{step.users}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">users</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                                    {step.conversionRate}%
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">conversion</p>
                                            </div>
                                            {step.dropOff > 0 && (
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                                        -{step.dropOff}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">drop-off</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-24">
                                            <Progress
                                                value={step.conversionRate}
                                                className="h-2"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
