"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartBar } from "@phosphor-icons/react"

interface TopPagesTableProps {
    data: Array<{
        page: string
        pageViews: number
        uniqueSessions: number
    }>
    loading?: boolean
    className?: string
}

export function TopPagesTable({ data, loading, className }: TopPagesTableProps) {
    if (loading) {
        return (
            <Card className={`bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0 ${className || ''}`}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Top Pages
                    </CardTitle>
                    <CardDescription>
                        Most visited pages in the selected period
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={`bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0 ${className || ''}`}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Top Pages
                </CardTitle>
                <CardDescription>
                    Most visited pages in the selected period
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <ChartBar weight="duotone" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No page data available</p>
                        <p className="text-sm">Data will appear once users start visiting pages</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.map((page, index) => (
                            <div key={page.page} className="flex items-center justify-between p-3 rounded bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center space-x-3">
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 font-medium">
                                        #{index + 1}
                                    </Badge>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {page.page === '/' ? 'Home' : page.page}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {page.uniqueSessions} unique sessions
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {page.pageViews.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">views</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
