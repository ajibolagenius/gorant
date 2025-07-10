"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GameificationPanel } from "@/components/gamification-panel"
import { Trophy } from "phosphor-react"
import React from "react"

interface SidebarContentProps {
    userPoints: number
    userLevel: number
    nextLevelPoints: number
    followedTags: Set<string>
    followTag: (tag: string) => void
}

export function SidebarContent({ userPoints, userLevel, nextLevelPoints, followedTags, followTag }: SidebarContentProps) {
    return (
        <div className="space-y-6">
            {/* Gamification Panel */}
            <GameificationPanel userPoints={userPoints} userLevel={userLevel} nextLevelPoints={nextLevelPoints} />

            {/* Quick Stats */}
            <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                <CardHeader>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Community Stats</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Total Rants</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">1,234</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Active Users</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">567</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Today's Rants</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">89</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Comments Today</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">156</span>
                    </div>
                </CardContent>
            </Card>

            {/* Followed Tags */}
            {followedTags.size > 0 && (
                <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                    <CardHeader>
                        <h3 className="font-semibold text-gray-800 dark:text-white">Following</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(followedTags).map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50"
                                    onClick={() => followTag(tag)}
                                >
                                    #{tag} ✓
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Weekly Challenge */}
            <Card className="shadow-sm border-0 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Trophy weight="duotone" className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <h3 className="font-semibold text-gray-800 dark:text-white">Weekly Challenge</h3>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        Share a rant about something that made you grateful this week! 🙏
                    </p>
                    <Button
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white"
                    >
                        Join Challenge
                    </Button>
                </CardContent>
            </Card>

            {/* Support Resources */}
            <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                <CardHeader>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Need Support?</h3>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Remember, you're not alone. Help is always available.
                    </p>
                    <Button variant="outline" className="w-full mb-2">
                        Crisis Hotline
                    </Button>
                    <Button variant="outline" className="w-full">
                        Support Groups
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
