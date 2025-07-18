"use client"

import React, { memo } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowClockwise } from "@phosphor-icons/react"
import { DateRangePicker } from "./date-range-picker"
import { cn } from "@/lib/utils"

interface DateRange {
    from: Date
    to: Date
}

interface DashboardHeaderProps {
    dateRange: DateRange
    onDateRangeChange: (range: DateRange) => void
    onRefresh: () => void
    refreshing?: boolean
    className?: string
}

export const DashboardHeader = memo(function DashboardHeader({
    dateRange,
    onDateRangeChange,
    onRefresh,
    refreshing = false,
    className
}: DashboardHeaderProps) {
    return (
        <div className={cn("border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur", className)}>
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Analytics Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            Track platform usage and user engagement metrics
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <DateRangePicker
                            dateRange={dateRange}
                            onDateRangeChange={onDateRangeChange}
                        />

                        {/* Refresh button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={refreshing}
                            className="px-3"
                        >
                            <ArrowClockwise
                                weight="duotone"
                                className={cn("h-4 w-4", refreshing && "animate-spin")}
                            />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
})
