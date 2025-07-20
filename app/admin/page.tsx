"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminNavigation } from "@/components/analytics/admin-navigation"
import { ChartBar, LightbulbFilament, ShieldCheck, Users } from "@phosphor-icons/react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminProtection, setAdminStatus } from '@/lib/admin-auth'

export default function AdminDashboard() {
    const router = useRouter()
    const isAuthorized = useAdminProtection(router)
    const [showAdminToggle, setShowAdminToggle] = useState(false)

    // This is just for development/testing and will be removed in task 14
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            setShowAdminToggle(true)
        }
    }, [])

    if (!isAuthorized) {
        return null // Will redirect via useAdminProtection
    }
    return (
        <div className="min-h-screen bg-background">
            <AdminNavigation />

            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Admin Dashboard</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Welcome to the admin dashboard. Access platform management tools and analytics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <div className="flex items-center space-x-2">
                                <ChartBar weight="duotone" className="w-5 h-5 text-blue-600" />
                                <CardTitle className="text-lg">Analytics</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                View detailed platform analytics, user metrics, and content performance data.
                            </CardDescription>
                            <Button asChild className="w-full">
                                <Link href="/admin/analytics">View Analytics</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <div className="flex items-center space-x-2">
                                <LightbulbFilament weight="duotone" className="w-5 h-5 text-amber-600" />
                                <CardTitle className="text-lg">Suggestions</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                Manage user suggestions and feature requests. Update status and provide feedback.
                            </CardDescription>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/admin/suggestions">Manage Suggestions</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <div className="flex items-center space-x-2">
                                <ShieldCheck weight="duotone" className="w-5 h-5 text-green-600" />
                                <CardTitle className="text-lg">Moderation</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4">
                                Review reported content, manage moderation queue, and enforce community guidelines.
                            </CardDescription>
                            <Button disabled variant="outline" className="w-full">
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                    <div className="flex items-start">
                        <div className="mr-3 mt-0.5">
                            <Users weight="duotone" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-blue-800 dark:text-blue-300">Admin Access Control</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                This area is restricted to admin users only. All actions are logged for security purposes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Development-only admin toggle - will be removed in task 14 */}
            {showAdminToggle && (
                <div className="container mx-auto px-4 py-6 max-w-7xl mt-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Development Tools</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                These controls are for development only and will be removed in production.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAdminStatus(true)}
                            >
                                Set Admin
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAdminStatus(false)}
                            >
                                Set Non-Admin
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
