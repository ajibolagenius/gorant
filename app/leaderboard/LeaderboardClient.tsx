"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightning, Trophy, Medal, Crown, TrendUp, Users, Heart, House, MagnifyingGlass, Funnel, SortAscending } from "phosphor-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

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
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("rank");
    const [showFilters, setShowFilters] = useState(false);
    const [badgeFilter, setBadgeFilter] = useState("all");

    const getCurrentData = () => {
        let data = leaderboardData[selectedCategory as keyof LeaderboardData] || leaderboardData.points;
        // Badge filter
        if (badgeFilter !== "all") {
            data = data.filter((user) => user.badge === badgeFilter);
        }
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            data = data.filter((user) =>
                user.userId.toLowerCase().includes(query) ||
                (user.badge && user.badge.toLowerCase().includes(query))
            );
        }
        // Sort
        switch (sortBy) {
            case "rank":
                data = [...data].sort((a, b) => a.rank - b.rank);
                break;
            case "points":
                data = [...data].sort((a, b) => (b.points || b.value || 0) - (a.points || a.value || 0));
                break;
            case "name":
                data = [...data].sort((a, b) => a.userId.localeCompare(b.userId));
                break;
        }
        return data;
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
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            case 2:
                return "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            case 3:
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
        }
    }

    // Add a helper to get podium bar color by rank
    const getPodiumBarColor = (rank: number) => {
        switch (rank) {
            case 1:
                return "bg-yellow-400 dark:bg-yellow-500";
            case 2:
                return "bg-gray-300 dark:bg-gray-500";
            case 3:
                return "bg-amber-500 dark:bg-amber-600";
            default:
                return "bg-gray-200 dark:bg-gray-700";
        }
    };

    // Get unique badges for filter options
    const uniqueBadges = Array.from(new Set((leaderboardData[selectedCategory as keyof LeaderboardData] || []).map(u => u.badge))).filter(Boolean);

    const currentData = getCurrentData();

    return (
        <main role="main" className="min-h-screen bg-background dark:bg-background">
            {/* Enhanced Header */}
            <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto mt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-0 sm:mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-none bg-green-100 dark:bg-green-900/30 p-3">
                            <Lightning weight="duotone" className="w-7 h-7 text-green-600 dark:text-green-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-heading text-gray-800 dark:text-white flex items-center gap-2">
                                Leaderboard
                                <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 text-xs font-semibold px-2 py-0.5 rounded-none ml-2">
                                    {currentData.length}
                                </span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">See who's leading the community.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl mb-safe-bottom wrap-screen overflow-x-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-wrap">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Search and Filters */}
                        <Card className="shadow-sm border-0 rounded-none bg-white/80 dark:bg-gray-800/80 backdrop-blur mb-6">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                        <Input
                                            placeholder="Search users by name or badge..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {/* Filter Controls */}
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="flex items-center gap-2 rounded-none"
                                        >
                                            <Funnel className="w-4 h-4" />
                                            Filters
                                            {badgeFilter !== "all" && (
                                                <span className="ml-1 rounded-none bg-green-200 text-green-800 px-2 py-0.5 text-xs font-semibold">1</span>
                                            )}
                                        </Button>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="w-48 rounded-none">
                                                <SortAscending className="w-4 h-4 mr-2" />
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="rank">By Rank</SelectItem>
                                                <SelectItem value="points">By Points</SelectItem>
                                                <SelectItem value="name">By Name</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {showFilters && (
                                            <div className="flex items-center gap-4 ml-4">
                                                <Select value={badgeFilter} onValueChange={setBadgeFilter}>
                                                    <SelectTrigger className="w-32 rounded-none">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Badges</SelectItem>
                                                        {uniqueBadges.map((badge) => (
                                                            <SelectItem key={badge} value={badge}>{badge}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Category Selector */}
                        <Card className="shadow-sm border-0 rounded-none bg-card/60 dark:bg-card/60 backdrop-blur">
                            <CardContent className="pt-2 sm:pt-6">
                                <div className="flex flex-wrap w-full gap-2 mb-4">
                                    {leaderboardCategories.map((category) => {
                                        const Icon = iconMap[category.icon as keyof typeof iconMap]
                                        return (
                                            <Button
                                                key={category.value}
                                                variant={selectedCategory === category.value ? "default" : "outline"}
                                                onClick={() => setSelectedCategory(category.value)}
                                                className={`${selectedCategory === category.value
                                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                                    : "hover:bg-green-50 dark:hover:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                                                    } flex-1 min-w-[120px]`}
                                            >
                                                {Icon && <Icon weight="duotone" className="w-4 h-4 mr-2" />}
                                                {category.label}
                                            </Button>
                                        )
                                    })}
                                </div>

                                <div className="flex gap-2 w-full flex-wrap mb-4">
                                    <Button
                                        variant={timeframe === "all_time" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTimeframe("all_time")}
                                        className={timeframe === "all_time" ? "bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[120px]" : "hover:bg-green-50 dark:hover:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 flex-1 min-w-[120px]"}
                                    >
                                        All Time
                                    </Button>
                                    <Button
                                        variant={timeframe === "monthly" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTimeframe("monthly")}
                                        className={timeframe === "monthly" ? "bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[120px]" : "hover:bg-green-50 dark:hover:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 flex-1 min-w-[120px]"}
                                    >
                                        This Month
                                    </Button>
                                    <Button
                                        variant={timeframe === "weekly" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTimeframe("weekly")}
                                        className={timeframe === "weekly" ? "bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[120px]" : "hover:bg-green-50 dark:hover:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 flex-1 min-w-[120px]"}
                                    >
                                        This Week
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Top 3 Podium */}
                        <Card className="shadow-lg border-0 rounded-none bg-green-100 dark:bg-green-900/30">
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
                                                        className={`${height} w-20 ${getPodiumBarColor(actualRank)} rounded-t-lg flex flex-col justify-end items-center p-2`}
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
                        <Card className="shadow-sm border-0 rounded-none bg-card/80 dark:bg-card/80 backdrop-blur">
                            <CardHeader>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Full Rankings</h2>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {getCurrentData().map((user) => (
                                        <div
                                            key={user.userId}
                                            className={`flex items-center justify-between p-4 rounded-lg transition-colors ${user.rank <= 3
                                                ? "bg-accent/40 text-accent-foreground border border-accent"
                                                : "bg-card text-card-foreground hover:bg-accent/10 border border-border"
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
                        <Card className="shadow-sm border-0 rounded-none bg-card/60 dark:bg-card/60 backdrop-blur">
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
                        <Card className="shadow-sm border-0 rounded-none bg-card/60 dark:bg-card/60 backdrop-blur">
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
                        <Card className="shadow-sm border-0 rounded-none bg-green-100 dark:bg-green-900/30">
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
        </main>
    )
}
