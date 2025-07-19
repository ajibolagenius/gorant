"use client"

import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, TrendUp } from "@phosphor-icons/react/dist/ssr"

interface TopPageData {
    page: string
    pageViews: number
    uniqueSessions: number
}

interface TopPagesVisualizationProps {
    data: TopPageData[]
    loading?: boolean
    title?: string
    description?: string
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

// Format page path for display
const formatPagePath = (path: string): string => {
    if (path === '/') return 'Home'
    return path
        .split('/')
        .filter(Boolean)
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' / ')
}

// Get page category for badge color
const getPageCategory = (path: string): { category: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (path === '/') return { category: 'Home', variant: 'default' }
    if (path.includes('/admin')) return { category: 'Admin', variant: 'destructive' }
    if (path.includes('/bookmarks')) return { category: 'Bookmarks', variant: 'secondary' }
    if (path.includes('/chaes')) return { category: 'Challenges', variant: 'outline' }
    if (path.includes('/leaderboard')) return { category: 'Leaderboard', variant: 'outline' }
    return { category: 'Other', variant: 'secondary' }
}

export function TopPagesVisualization({
    data,
    loading = false,
    title = "Top Pages",
    description = "Most visited pages and their performance metrics"
}: TopPagesVisualizationProps) {
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
                        <TrendUp weight="duotone" className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center text-center">
                        <div className="text-gray-500 daray-400">
                            <Eye weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No page data available</p>
                            <p className="text-sm">Page view statistics will appear once users start browsing</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Prepare data for chart (limit to top 10 for readability)
    const chartData = data.slice(0, 10).map(item => ({
        ...item,
        displayName: formatPagePath(item.page)
    }))

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
                <Tabs defaultValue="chart" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="chart">Chart View</TabsTrigger>
                        <TabsTrigger value="table">Table View</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chart" className="mt-4">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
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
                                        width={120}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="pageViews"
                                        fill="hsl(var(--primary))"
                                        name="Page Views"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="table" className="mt-4">
                        <div className="h-80 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">#</TableHead>
                                        <TableHead>Page</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Page Views</TableHead>
                                        <TableHead className="text-right">Unique Sessions</TableHead>
                                        <TableHead className="text-right">Views/Session</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((page, index) => {
                                        const category = getPageCategory(page.page)
                                        const viewsPerSession = page.uniqueSessions > 0
                                            ? (page.pageViews / page.uniqueSessions).toFixed(1)
                                            : '0'

                                        return (
                                            <TableRow key={page.page}>
                                                <TableCell className="font-medium text-gray-500">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {page.page}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={category.variant} className="text-xs">
                                                        {category.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {page.pageViews.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {page.uniqueSessions.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right text-gray-600 dark:text-gray-400">
                                                    {viewsPerSession}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
