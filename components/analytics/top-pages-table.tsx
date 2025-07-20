"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartBar, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAnalyticsPagination } from "@/hooks/use-analytics-pagination"

interface TopPagesTableProps {
    data: Array<{
        page: string
        pageViews: number
        uniqueSessions: number
    }>
    loading?: boolean
    className?: string
}

export function TopPagesTable({ data: initialData, loading: initialLoading, className }: TopPagesTableProps) {
    // Use pagination hook for efficient data handling
    const {
        data,
        loading,
        page,
        pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        goToPage,
        nextPage,
        previousPage
    } = useAnalyticsPagination({
        initialData,
        pageSize: 5,
        fetchData: async (page, pageSize) => {
            // In a real implementation, this would fetch from the API with pagination params
            // For now, we'll just slice the initial data
            return initialData.slice((page - 1) * pageSize, page * pageSize)
        },
        totalItems: initialData.length
    })

    if (initialLoading || loading) {
        return (
            <Card className={cn("bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0", className)}>
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
        <Card className={cn("bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0", className)}>
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
                    <>
                        <div className="space-y-3">
                            {data.map((pageItem, index) => (
                                <div key={pageItem.page} className="flex items-center justify-between p-3 rounded bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center space-x-3">
                                        <Badge variant="outline" className="text-xs px-2 py-0.5 font-medium">
                                            #{((page - 1) * pageSize) + index + 1}
                                        </Badge>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {pageItem.page === '/' ? 'Home' : pageItem.page}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {pageItem.uniqueSessions} unique sessions
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {pageItem.pageViews.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">views</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={previousPage}
                                        disabled={!hasPreviousPage}
                                    >
                                        <CaretLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={nextPage}
                                        disabled={!hasNextPage}
                                    >
                                        <CaretRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
