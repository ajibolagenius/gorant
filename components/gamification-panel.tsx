"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Star, Lightning, Trophy } from "@phosphor-icons/react"

interface GamificationPanelProps {
    userPoints: number
    userLevel: number
    nextLevelPoints: number
}

export function GamificationPanel({ userPoints, userLevel, nextLevelPoints }: GamificationPanelProps) {
    const currentLevelPoints = (userLevel - 1) * 100
    const progressToNext = ((userPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100

    return (
        <Card className="shadow-sm border-0 bg-green-100 dark:bg-green-900/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Star weight="duotone" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold text-gray-800 dark:text-white">Your Progress</h3>
                    </div>
                    <Badge className="bg-purple-600 text-white">Level {userLevel}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Lightning weight="duotone" className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Points</span>
                    </div>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{userPoints}</span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Level Progress</span>
                        <span className="text-gray-600 dark:text-gray-300">
                            {userPoints - currentLevelPoints}/{nextLevelPoints - currentLevelPoints}
                        </span>
                    </div>
                    <Progress value={progressToNext} className="h-2" aria-label="Level progress" />
                </div>

                <div className="pt-2 border-t border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Trophy weight="duotone" className="w-4 h-4" />
                        <span>Keep posting to level up!</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
