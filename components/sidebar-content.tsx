"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GameificationPanel } from "@/components/gamification-panel"
import { Trophy, Users } from "phosphor-react"
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
            <GameificationPanel userPoints={userPoints} userLevel={userLevel} nextLevelPoints={nextLevelPoints} />

            {/* Quick Stats */}
            <Card className="shadow-sm border-0 bg-card/60 dark:bg-card/60 backdrop-blur">
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
                        <span className="font-semibold text-green-600 dark:text-green-400">156</span>
                    </div>
                </CardContent>
            </Card>

            {/* Followed Tags */}
            {followedTags.size > 0 && (
                <Card className="shadow-sm border-0 bg-card/60 dark:bg-card/60 backdrop-blur">
                    <CardHeader>
                        <h3 className="font-semibold text-card-foreground">Following</h3>
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
            <Card className="shadow-sm border-0 bg-orange-100 dark:bg-orange-900/30">
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
                        className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white"
                    >
                        <Link href="/challenges">Join Challenge</Link>
                    </Button>
                </CardContent>
            </Card>

            {/* Support Resources */}
            <Card className="shadow-sm border-0 bg-card/60 dark:bg-card/60 backdrop-blur">
                <CardHeader>
                    <h3 className="font-semibold text-card-foreground">Need Support?</h3>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                        Remember, you're not alone. Help is always available.
                    </p>
                    <div className="flex items-center mb-2">
                        <Button variant="outline" className="w-full" onClick={() => setShowHotlineModal(true)}>
                            Crisis Helplines
                        </Button>
                    </div>
                    <div className="flex items-center">
                        <Button variant="outline" className="w-full" onClick={() => setShowSupportModal(true)}>
                            Support Groups
                        </Button>
                    </div>
                    {/* Nigerian Crisis Hotline Modal */}
                    <Dialog open={showHotlineModal} onOpenChange={setShowHotlineModal}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                                    Nigerian Crisis Helplines
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <p className="text-gray-700 dark:text-gray-200">
                                    If you or someone you know is in crisis, please reach out immediately to these Nigerian helplines:
                                </p>
                                <ul className="text-sm text-gray-800 dark:text-gray-100 space-y-1">
                                    <li><strong>Suicide Prevention Initiative in Nigeria (SUPRIN):</strong> <a href="tel:09080217555" className="text-purple-700 underline">0908 021 7555</a></li>
                                    <li><strong>Mentally Aware Nigeria Initiative (MANI):</strong> <a href="tel:08091116264" className="text-purple-700 underline">0809 111 6264</a></li>
                                    <li><strong>She Writes Woman (Mental Health Helpline):</strong> <a href="tel:08008002000" className="text-purple-700 underline">0800 800 2000</a></li>
                                    <li><strong>Lagos State Helpline:</strong> <a href="tel:08058820777" className="text-purple-700 underline">0805 882 0777</a></li>
                                    <li><strong>National Emergency Hotline:</strong> <a href="tel:112" className="text-purple-700 underline">112</a></li>
                                </ul>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Your feelings matter. Help is available 24/7. All calls are confidential.
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                    {/* Nigerian Support Groups Modal */}
                    <Dialog open={showSupportModal} onOpenChange={setShowSupportModal}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                                    <Users className="w-5 h-5 text-purple-700" /> Nigerian Support Groups
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <p className="text-gray-700 dark:text-gray-200">
                                    Connect with mental health support groups and communities in Nigeria:
                                </p>
                                <ul className="text-sm text-gray-800 dark:text-gray-100 space-y-1">
                                    <li><a href="https://mentallyaware.org/join-a-support-group/" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline">Mentally Aware Nigeria Initiative (MANI) Support Groups</a></li>
                                    <li><a href="https://shewriteswoman.org/helpline/" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline">She Writes Woman Peer Support</a></li>
                                    <li><a href="https://www.surpinng.org/" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline">SUPRIN Community</a></li>
                                    <li><a href="https://www.facebook.com/groups/mentalhealthnigeria/" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline">Mental Health Nigeria (Facebook Group)</a></li>
                                </ul>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    These groups offer peer support, resources, and a safe space to share your journey.
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    )
}
