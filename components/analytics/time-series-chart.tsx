"use client"

import React, { useMemo } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendUp } from "@phosphor-icons/react/dist/ssr"
import { format, parseISO } from 'date-fns'

interface TimeSeriesData {
    timeBucket: string
    pageViews: number
    uniqueSessions: number
    totalEvents: number
}

interface TimeSeriesChartProps {
    data: TimeSeriesData[]
    loading?: boolean
    title?: string
    description?: string
}

interface TooltipPayload {
    name: string
    value: number
    color: string
}

interface CustomTooltipProps {
    active?: boolean
    payload?: TooltipPayload[]
    label?: string
}

const CHART_CONFIG = {
    HEIGHT: 320,
    STROKE_WIDTH: 2,
    DOT_RADIUS: 4,
    ACTIVE_DOT_RADIUS: 6,
    FONT_SIZE: 12,
    MARGIN: { top: 5, right: 30, left: 20, bottom: 5 }
} as const

const safeDateFormat = (dateString: string, formatStr: string): string => {
    try {
        return format(parseISO(dateString), formatStr)
    } catch (error) {
        console.warn('Date parsing failed:', dateString, error)
        return dateString
    }
}

const ChartCard = ({ children }: { children: React.ReactNode }) => (
    <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0">
        {children}
    </Card>
)

const ChartHeader = ({ title, description }: { title: string; description: string }) => (
    <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendUp weight="duotone" className="h-5 w-5" />
            {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
    </CardHeader>
)

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length && label) {
        return (
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
                <p className="font-medium text-foreground mb-2">
                    {safeDateFormat(label, 'MMM dd, yyyy HH:mm')}
                </p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

const LoadingState = ({ title, description }: Pick<TimeSeriesChartProps, 'title' | 'description'>) => (
    <ChartCard>
        <ChartHeader title={title!} description={description!} />
        <CardContent>
            <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-4 bg-muted rounded w-24" />
                </div>
            </div>
        </CardContent>
    </ChartCard>
)

const EmptyState = ({ title, description }: Pick<TimeSeriesChartProps, 'title' | 'description'>) => (
    <ChartCard>
        <ChartHeader title={title!} description={description!} />
        <CardContent>
            <div className="h-80 flex items-center justify-center text-center">
                <div className="text-muted-foreground">
                    <TrendUp weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No data available</p>
                    <p className="text-sm">Data will appear once users start interacting with the platform</p>
                </div>
            </div>
        </CardContent>
    </ChartCard>
)

export const TimeSeriesChart = React.memo(({
    data,
    loading = false,
    title = "Activity Over Time",
    description = "Page views and user sessions trends"
}: TimeSeriesChartProps) => {
    const chartConfig = useMemo(() => ({
        lines: [
            {
                dataKey: "pageViews",
                stroke: "hsl(var(--primary))",
                name: "Page Views"
            },
            {
                dataKey: "uniqueSessions",
                stroke: "hsl(var(--secondary))",
                name: "Unique Sessions"
            },
            {
                dataKey: "totalEvents",
                stroke: "hsl(var(--accent))",
                name: "Total Events"
            }
        ]
    }), [])

    const formatXAxisTick = useMemo(() =>
        (value: string) => safeDateFormat(value, 'MMM dd'),
        []
    )

    if (loading) {
        return <LoadingState title={title} description={description} />
    }

    if (!data || data.length === 0) {
        return <EmptyState title={title} description={description} />
    }

    return (
        <ChartCard>
            <ChartHeader title={title} description={description} />
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={CHART_CONFIG.MARGIN}
                            role="img"
                            aria-label={`${title} - Time series chart showing ${description}`}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                            />
                            <XAxis
                                dataKey="timeBucket"
                                tickFormatter={formatXAxisTick}
                                className="text-muted-foreground"
                                fontSize={CHART_CONFIG.FONT_SIZE}
                            />
                            <YAxis
                                className="text-muted-foreground"
                                fontSize={CHART_CONFIG.FONT_SIZE}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {chartConfig.lines.map((line) => (
                                <Line
                                    key={line.dataKey}
                                    type="monotone"
                                    dataKey={line.dataKey}
                                    stroke={line.stroke}
                                    strokeWidth={CHART_CONFIG.STROKE_WIDTH}
                                    dot={{
                                        fill: line.stroke,
                                        strokeWidth: CHART_CONFIG.STROKE_WIDTH,
                                        r: CHART_CONFIG.DOT_RADIUS
                                    }}
                                    activeDot={{
                                        r: CHART_CONFIG.ACTIVE_DOT_RADIUS,
                                        stroke: line.stroke,
                                        strokeWidth: CHART_CONFIG.STROKE_WIDTH
                                    }}
                                    name={line.name}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </ChartCard>
    )
})
