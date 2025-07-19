"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Pulse } from "@phosphor-icons/react/dist/ssr"

interface UserGrowthData {
    date: string
    newUsers: number
    totalUsers: number
}

interface UserMetricsChartProps {
    data: UserGrowthData[] | null
    loading?: boolean
}

export function UserMetricsChart({ data, loading }: UserMetricsChartProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users weight="duotone" className="h-5 w-5" />
                        User Growth
                    </CardTitle>
                    <CardDescription>User acquisition and growth trends</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users weight="duotone" className="h-5 w-5" />
                        User Growth
                    </CardTitle>
                    <CardDescription>User acquisition and growth trends</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No user growth data available
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate summary stats
    const totalNewUsers = data.reduce((sum, day) => sum + day.newUsers, 0)
    const avgNewUsersPerDay = Math.round(totalNewUsers / data.length)
    const latestTotal = data[data.length - 1]?.totalUsers || 0

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users weight="duotone" className="h-5 w-5" />
                    User Growth
                </CardTitle>
                <CardDescription>User acquisition and growth trends over the last {data.length} days</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" weight="duotone" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Users</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{latestTotal.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <UserPlus className="h-8 w-8 text-green-600 dark:text-green-400" weight="duotone" />
                            <div>
                                <p className="text-sm text-muted-foreground">New Users</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalNewUsers.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Pulse className="h-8 w-8 text-purple-600 dark:text-purple-400" weight="duotone" />
                            <div>
                                <p className="text-sm text-muted-foreground">Avg/Day</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{avgNewUsersPerDay}</p>
                            </div>
                        </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Daily New Users</h4>
                        <div className="space-y-1">
                            {data.slice(-7).map((day, index) => {
                                const maxNewUsers = Math.max(...data.map(d => d.newUsers))
                                const percentage = maxNewUsers > 0 ? (day.newUsers / maxNewUsers) * 100 : 0

                                return (
                                    <div key={day.date} className="flex items-center gap-2">
                                        <div className="w-16 text-xs text-muted-foreground">
                                            {new Date(day.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="w-8 text-xs text-right text-muted-foreground">
                                            {day.newUsers}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
