"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GamificationPanel } from "@/components/gamification-panel"
import { Trophy, Users } from "@phosphor-icons/react"
import React, { useState } from "react"
import { ComingSoonPill } from "@/components/ui/coming-soon-pill"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SidebarContentProps {
    userPoints: number
    userLevel: number
    nextLevelPoints: number
    followedTags: Set<string>
    followTag: (tag: string) => void
}

export function SidebarContent({ userPoints, userLevel, nextLevelPoints, followedTags, followTag }: SidebarContentProps) {
    const [showHotlineModal, setShowHotlineModal] = useState(false)
    const [showSupportModal, setShowSupportModal] = useState(false)
    return (
        <div className="space-y-6">
            {/* Gamification Panel */}
            <GamificationPanel userPoints={userPoints} userLevel={userLevel} nextLevelPoints={nextLevelPoints} />

            {/* Quick Stats */}
            <Card className="shadow-sm border-0 bg-card/60 dark:bg-card/60 backdrop-blur rounded-none">
                <CardHeader>
                    <h3 className="font-semibold text-card-foreground">Community Stats</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Rants</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">1,234</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Users</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">567</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Today's Rants</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">89</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Comments Today</span>
                        <span className="font-semibold text-green-800 dark:text-green-400">156</span>
                    </div>
                </CardContent>
            </Card>

            {/* Followed Tags */}
            {followedTags.size > 0 && (
                <Card className="shadow-sm border-0 bg-card/60 dark:bg-card/60 backdrop-blur rounded-none">
                    <CardHeader>
                        <h3 className="font-semibold text-card-foreground">Following</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(followedTags).map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-none"
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
            <Card className="shadow-sm border-0 bg-orange-100 dark:bg-orange-900/30 rounded-none">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Trophy weight="duotone" className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <h3 className="font-semibold text-gray-800 dark:text-white">Weekly Challenge</h3>
                        <ComingSoonPill className="ml-2" />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        Share a rant about something that made you grateful this week! 🙏
                    </p>
                    <Button
                        asChild
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white rounded-none"
                    >
                        <Link href="/challenges">Join Challenge</Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Support Resources */}
            {/* (REMOVED: now in mobile nav drawer) */}
        </div>
    )
}
