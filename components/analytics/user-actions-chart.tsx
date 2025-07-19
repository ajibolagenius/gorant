"use client"

import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightning } from "@phosphor-icons/react/dist/ssr"

interface EventCountData {
    eventType: string
    eventCount: number
    uniqueSessions: number
}

interface UserActionsChartProps {
    data: EventCountData[]
    loading?: boolean
    title?: string
    description?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
                <p className="font-medium text-foreground mb-2 capitalize">{label.replace('_', ' ')}</p>
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

// Format event type names for display
const formatEventType = (eventType: string): string => {
    return eventType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function UserActionsChart({
    data,
    loading = false,
    title = "User Actions",
    description = "Breakdown of user interactions and events"
}: UserActionsChartProps) {
    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Lightning weight="duotone" className="h-5 w-5" />
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
                        <Lightning weight="duotone" className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                            <Lightning weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No user actions recorded</p>
                            <p className="text-sm">User interaction data will appear once activity begins</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Format data for display
    const formattedData = data.map(item => ({
        ...item,
        displayName: formatEventType(item.eventType)
    }))

    // Sort by event count for better visualization
    const sortedData = formattedData.sort((a, b) => b.eventCount - a.eventCount)

    return (
        <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Lightning weight="duotone" className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={sortedData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            layout="horizontal"
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-gray-200 dark:stroke-gray-700"
                            />
                            <XAxis
                                type="number"
                                className="text-gray-600 dark:text-gray-400"
                                fontSize={12}
                            />
                            <YAxis
                                type="category"
                                dataKey="displayName"
                                className="text-gray-600 dark:text-gray-400"
                                fontSize={12}
                                width={100}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                dataKey="eventCount"
                                fill="hsl(var(--primary))"
                                name="Total Events"
                                radius={[0, 4, 4, 0]}
                            />
                            <Bar
                                dataKey="uniqueSessions"
                                fill="hsl(var(--secondary))"
                                name="Unique Sessions"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
