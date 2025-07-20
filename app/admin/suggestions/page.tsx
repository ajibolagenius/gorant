"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminNavigation } from "@/components/analytics/admin-navigation"
import { LightbulbFilament } from "@phosphor-icons/react"
import { useRouter } from 'next/navigation'
import { useAdminProtection } from '@/lib/admin-auth'

export default function SuggestionsAdmin() {
    const router = useRouter()
    const isAuthorized = useAdminProtection(router)

    if (!isAuthorized) {
        return null // Will redirect via useAdminProtection
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminNavigation />

            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Suggestions Management</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage user suggestions and feature requests. This page will be implemented in a future task.
                    </p>
                </div>

                <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <LightbulbFilament weight="duotone" className="w-5 h-5 text-amber-600" />
                            <CardTitle>Coming Soon</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            This feature will be implemented in task 15: "Move admin suggestion status management to a standalone admin page"
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
