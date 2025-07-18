"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarBlank as CalendarIcon } from "@phosphor-icons/react"
import { format, subDays } from "date-fns"
import { cn } from "@/lib/utils"
import type { DateRange as CalendarDateRange } from "react-day-picker"

interface DateRange {
    from: Date
    to: Date
}

interface DateRangePickerProps {
    dateRange: DateRange
    onDateRangeChange: (range: DateRange) => void
    className?: string
}

export function DateRangePicker({ dateRange, onDateRangeChange, className }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleDateRangeSelect = (range: CalendarDateRange | undefined) => {
        if (range?.from && range?.to) {
            onDateRangeChange({ from: range.from, to: range.to })
            setIsOpen(false)
        }
    }

    const setQuickRange = useCallback((days: number) => {
        onDateRangeChange({
            from: subDays(new Date(), days),
            to: new Date()
        })
    }, [onDateRangeChange])

    return (
        <div className={cn("flex items-center gap-3", className)}>
            {/* Quick date range buttons */}
            <div className="hidden sm:flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickRange(1)}
                    className={cn(
                        "text-xs",
                        mounted && dateRange.from.getTime() === subDays(new Date(), 1).getTime() &&
                        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    )}
                >
                    Today
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickRange(7)}
                    className={cn(
                        "text-xs",
                        mounted && dateRange.from.getTime() === subDays(new Date(), 7).getTime() &&
                        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    )}
                >
                    7 days
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickRange(30)}
                    className={cn(
                        "text-xs",
                        mounted && dateRange.from.getTime() === subDays(new Date(), 30).getTime() &&
                        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    )}
                >
                    30 days
                </Button>
            </div>

            {/* Date range picker */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
                    >
                        <CalendarIcon weight="duotone" className="mr-2 h-4 w-4" />
                        {dateRange.from && dateRange.to ? (
                            <>
                                {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                            </>
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={handleDateRangeSelect}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
