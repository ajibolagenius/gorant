"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChartBar, Gear, House, ListBullets, LightbulbFilament } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'

export function AdminNavigation() {
    const pathname = usePathname()

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-4 mb-6">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2">
                            <Gear weight="duotone" className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                Admin Dashboard
                                <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                                    Staff Only
                                </Badge>
                            </h1>
                        </div>
                    </div>

                    <nav className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
                                <House weight="duotone" className="w-4 h-4 mr-1" />
                                <span>Main Site</span>
                            </Button>
                        </Link>

                        <Link href="/admin">
                            <Button
                                variant={pathname === '/admin' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="text-gray-600 dark:text-gray-300"
                            >
                                <Gear weight="duotone" className="w-4 h-4 mr-1" />
                                <span>Overview</span>
                            </Button>
                        </Link>

                        <Link href="/admin/analytics">
                            <Button
                                variant={pathname === '/admin/analytics' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="text-gray-600 dark:text-gray-300"
                            >
                                <ChartBar weight="duotone" className="w-4 h-4 mr-1" />
                                <span>Analytics</span>
                            </Button>
                        </Link>

                        <Link href="/admin/suggestions">
                            <Button
                                variant={pathname === '/admin/suggestions' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="text-gray-600 dark:text-gray-300"
                            >
                                <LightbulbFilament weight="duotone" className="w-4 h-4 mr-1" />
                                <span>Suggestions</span>
                            </Button>
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    )
}
