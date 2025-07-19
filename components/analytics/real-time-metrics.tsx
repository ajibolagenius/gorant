"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Lightning,
    Eye,
    Users,
    Clock,
    Pulse,
    Play,
    Pause,
    ArrowClockwise
} from "@phosphor-icons/react/dist/ssr"
import { AnalyticsAPI } from '@/lib/analytics-api'

interface RealTimeMetric {
    label: string
    value: number
    change: number
    icon: React.ReactNode
    color: string
}

interface RealTimeMetricsProps {
    className?: string
}

export function RealTimeMetrics({ className }: RealTimeMetricsProps) {
    const [metrics, setMetrics] = useState<RealTimeMetric[]>([])
    const [isLive, setIsLive] = useState(false)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchRealTimeData = async () => {
        try {
            setLoading(true)
            const now = new Date()
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

            const data = await AnalyticsAPI.getDashboardData({
                startDate: fiveMinutesAgo.toISOString(),
                endDate: now.toISOString()
            })

            if (data?.metrics) {
                const newMetrics: RealTimeMetric[] = [
                    {
                        label: 'Active Sessions',
                        value: data.metrics.uniqueSessions || 0,
                        change: Math.floor(Math.random() * 10) - 5, // Mock change for demo
                        icon: <Users weight="duotone" className="h-4 w-4" />,
                        color: 'text-blue-600'
                    },
                    {
                        label: 'Page Views (5m)',
                        value: data.metrics.totalPageViews || 0,
                        change: Math.floor(Math.random() * 20) - 10,
                        icon: <Eye weight="duotone" className="h-4 w-4" />,
                        color: 'text-green-600'
                    },
                    {
                        label: 'Events (5m)',
                        value: data.metrics.totalEvents || 0,
                        change: Math.floor(Math.random() * 15) - 7,
                        icon: <Lightning weight="duotone" className="h-4 w-4" />,
                        color: 'text-purple-600'
                    }
                ]

                setMetrics(newMetrics)
                setLastUpdate(new Date())
            }
        } catch (error) {
            console.error('Failed to fetch real-time data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isLive) {
            // Initial fetch
            fetchRealTimeData()

            // Set up interval for live updates
            interval = setInterval(fetchRealTimeData, 30000) // Update every 30 seconds
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [isLive])

    const toggleLive = () => {
        setIsLive(!isLive)
    }

    const formatLastUpdate = () => {
        if (!lastUpdate) return 'Never'
        const now = new Date()
        const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)

        if (diff < 60) return `${diff}s ago`
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        return lastUpdate.toLocaleTimeString()
    }

    return (
        <Card className={`bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0 ${className}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Pulse weight="duotone" className={`h-5 w-5 ${isLive ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
                            Real-time Metrics
                        </CardTitle>
                        <CardDescription>
                            Live activity monitoring • Last update: {formatLastUpdate()}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchRealTimeData}
                            disabled={loading}
                            className="h-8"
                        >
                            <ArrowClockwise
                                weight="duotone"
                                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                            />
                        </Button>
                        <Button
                            variant={isLive ? 'default' : 'outline'}
                            size="sm"
                            onClick={toggleLive}
                            className="h-8"
                        >
                            {isLive ? (
                                <>
                                    <Pause weight="duotone" className="h-4 w-4 mr-1" />
                                    Live
                                </>
                            ) : (
                                <>
                                    <Play weight="duotone" className="h-4 w-4 mr-1" />
                                    Start
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {metrics.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Clock weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No real-time data</p>
                        <p className="text-sm">Click "Start" to begin monitoring live metrics</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {metrics.map((metric, index) => (
                            <div
                                key={metric.label}
                                className="p-4 rounded-lg bg-muted/30 border transition-all duration-200 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`${metric.color}`}>
                                        {metric.icon}
                                    </div>
                                    {metric.change !== 0 && (
                                        <Badge
                                            variant={metric.change > 0 ? 'default' : 'destructive'}
                                            className="text-xs"
                                        >
                                            {metric.change > 0 ? '+' : ''}{metric.change}
                                        </Badge>
                                    )}
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${metric.color}`}>
                                        {metric.value.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {metric.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Live Status Indicator */}
                {isLive && (
                    <div className="mt-4 pt-4 border-t border-muted">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Live monitoring active • Updates every 30 seconds</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
