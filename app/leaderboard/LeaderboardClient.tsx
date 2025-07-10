"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightning, Trophy, Medal, Crown, TrendUp, Users, Heart } from "phosphor-react"
import Link from "next/link"

interface LeaderboardCategory {
    label: string;
    value: string;
    icon: string;
}

interface LeaderboardUser {
    rank: number;
    userId: string;
    points?: number;
    value?: number;
    level?: number;
    badge: string;
}

interface LeaderboardData {
    points: LeaderboardUser[];
    posts: LeaderboardUser[];
    likes_given: LeaderboardUser[];
    achievements: LeaderboardUser[];
}

interface LeaderboardClientProps {
    leaderboardCategories: LeaderboardCategory[];
    leaderboardData: LeaderboardData;
}

const iconMap = {
    Lightning,
    TrendUp,
    Heart,
    Trophy,
}

export default function LeaderboardClient({ leaderboardCategories, leaderboardData }: LeaderboardClientProps) {
    const [selectedCategory, setSelectedCategory] = useState("points")
    const [timeframe, setTimeframe] = useState("all_time")

    const getCurrentData = () => {
        return leaderboardData[selectedCategory as keyof LeaderboardData] || leaderboardData.points
    }

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown weight="duotone" className="w-6 h-6 text-yellow-500" />
            case 2:
                return <Medal weight="duotone" className="w-6 h-6 text-gray-400" />
            case 3:
                return <Medal weight="duotone" className="w-6 h-6 text-amber-600" />
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
        }
    }

    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
            case 2:
                return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
            case 3:
                return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-6 max-w-6xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                                <Lightning weight="duotone" className="w-8 h-8 mr-3 text-yellow-500" />
                                Leaderboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">See who's leading the community</p>
                        </div>
                        <Link href="/">
                            <Button variant="outline">Back to Feed</Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl mb-safe-bottom wrap-screen">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Category Selector */}
                        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardContent className="pt-6">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {leaderboardCategories.map((category) => {
                                        const Icon = iconMap[category.icon as keyof typeof iconMap]
                                        return (
                                            <Button
                                                key={category.value}
                                                variant={selectedCategory === category.value ? "default" : "outline"}
                                                onClick={() => setSelectedCategory(category.value)}
                                                className={`${selectedCategory === category.value
                                                    ? "bg-purple-600 hover:bg-purple-700"
                                                    : "hover:bg-purple-50 dark:hover:bg-purple-900"
                                                    }`}
                                            >
                                                {Icon && <Icon weight="duotone" className="w-4 h-4 mr-2" />}
                                                {category.label}
                                            </Button>
                                        )
                                    })}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant={timeframe === "all_time" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTimeframe("all_time")}
                                        className={timeframe === "all_time" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                                    >
                                        All Time
                                    </Button>
                                    <Button
                                        variant={timeframe === "monthly" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTimeframe("monthly")}
                                        className={timeframe === "monthly" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                                    >
                                        This Month
                                    </Button>
                                    <Button
                                        variant={timeframe === "weekly" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTimeframe("weekly")}
                                        className={timeframe === "weekly" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                                    >
                                        This Week
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top 3 Podium */}
                        <Card className="shadow-lg border-0 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900">
                            <CardContent className="pt-6">
                                <h2 className="text-xl font-semibold text-center mb-6 text-gray-800 dark:text-white">
                                    🏆 Top Contributors 🏆
                                </h2>
                                <div className="flex justify-center items-end space-x-4">
                                    {getCurrentData()
                                        .slice(0, 3)
                                        .map((user, index) => {
                                            const actualRank = user.rank
                                            const podiumOrder = [1, 0, 2] // Second, First, Third for visual arrangement
                                            const displayIndex = podiumOrder.indexOf(index)
                                            const height = displayIndex === 1 ? "h-32" : displayIndex === 0 ? "h-24" : "h-20"

                                            return (
                                                <div
                                                    key={user.userId}
                                                    className={`flex flex-col items-center ${displayIndex === 1 ? "order-2" : displayIndex === 0 ? "order-1" : "order-3"}`}
                                                >
                                                    <div className="text-4xl mb-2">{user.badge}</div>
                                                    <div
                                                        className={`${height} w-20 bg-gradient-to-t ${getRankBadgeColor(actualRank)} rounded-t-lg flex flex-col justify-end items-center p-2`}
                                                    >
                                                        <div className="text-white font-bold text-lg">#{actualRank}</div>
                                                    </div>
                                                    <div className="mt-2 text-center">
                                                        <div className="font-semibold text-gray-800 dark:text-white text-sm">{user.userId}</div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-300">
                                                            {selectedCategory === "points"
                                                                ? `${user.points || user.value} pts`
                                                                : `${user.value} ${selectedCategory.replace("_", " ")}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Full Leaderboard */}
                        <Card className="shadow-sm border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Full Rankings</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {getCurrentData().map((user) => (
                                        <div
                                            key={user.userId}
                                            className={`flex items-center justify-between p-4 rounded-lg transition-colors ${user.rank <= 3
                                                ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800"
                                                : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                }`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    {getRankIcon(user.rank)}
                                                    <span className="text-2xl">{user.badge}</span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-800 dark:text-white">{user.userId}</div>
                                                    {selectedCategory === "points" && "level" in user && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-300">Level {user.level}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg text-purple-600 dark:text-purple-400">
                                                    {selectedCategory === "points" ? user.points || user.value : user.value}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {selectedCategory === "points" ? "points" : selectedCategory.replace("_", " ")}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Your Rank */}
                        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Your Rank</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-3xl mb-2">🎯</div>
                                    <div className="font-bold text-2xl text-purple-600 dark:text-purple-400">#47</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">out of 1,234 users</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Your Points</span>
                                        <span className="font-semibold text-purple-600 dark:text-purple-400">285</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Next Rank</span>
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">#46 (15 pts)</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Achievements */}
                        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Recent Achievements</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="text-2xl">🎯</div>
                                    <div>
                                        <div className="font-semibold text-sm text-gray-800 dark:text-white">First Steps</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-300">Posted your first rant</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl">💬</div>
                                    <div>
                                        <div className="font-semibold text-sm text-gray-800 dark:text-white">Conversation Starter</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-300">Posted 5 comments</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Competition Info */}
                        <Card className="shadow-sm border-0 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900">
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Users weight="duotone" className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Monthly Competition</h3>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                    Top 10 users this month win special badges and recognition!
                                </p>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">12 days left</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-300">in this month's competition</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
