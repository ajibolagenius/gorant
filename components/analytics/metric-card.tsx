"use client"

import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendUp } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
    title: string
    value: string | number
    description?: string
    icon: React.ReactNode
    trend?: {
        value: number
        isPositive: boolean
    }
    loading?: boolean
    className?: string
}

export const MetricCard = memo(function MetricCard({
    title,
    value,
    description,
    icon,
    trend,
    loading,
    className
}: MetricCardProps) {
    if (loading) {
        return (
            <Card className={cn("bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0", className)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        <Skeleton className="h-4 w-24" />
                    </CardTitle>
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-32" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn(
            "bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0 hover:shadow-xl transition-all duration-300",
            className
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {title}
                </CardTitle>
                <div className="text-purple-600 dark:text-purple-400">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                )}
                {trend && (
                    <div className={cn(
                        "flex items-center text-xs mt-1",
                        trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                        <TrendUp
                            weight="duotone"
                            className={cn(
                                "w-3 h-3 mr-1",
                                !trend.isPositive && "rotate-180"
                            )}
                        />
                        {Math.abs(trend.value)}% from last period
                    </div>
                )}
            </CardContent>
        </Card>
    )
})
