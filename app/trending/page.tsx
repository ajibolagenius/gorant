"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock, Calendar, Award } from "lucide-react"
import Link from "next/link"
import { RantCard } from "@/components/rant-card"

const TRENDING_PERIODS = [
    { label: "Today", value: "today", icon: Clock },
    { label: "This Week", value: "week", icon: Calendar },
    { label: "This Month", value: "month", icon: Award },
]

const mockTrendingRants = [
    {
        id: "trending_1",
        content:
            "Just realized I've been pronouncing 'epitome' wrong my entire life. I'm 28. How did nobody correct me?! 😅",
        mood: "confused",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        likes_count: 156,
        comments_count: 43,
        anonymous_id: "anon_trending_001",
        tags: ["embarrassing", "learning"],
        is_trending: true,
    },
    {
        id: "trending_2",
        content:
            "My neighbor's dog has been barking for 3 hours straight. I'm about to lose my mind! Why do people get dogs if they can't train them properly?",
        mood: "angry",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        likes_count: 89,
        comments_count: 67,
        anonymous_id: "anon_trending_002",
        tags: ["neighbors", "noise"],
        is_trending: true,
    },
    {
        id: "trending_3",
        content:
            "Finally told my crush how I feel and they said yes to a date! I'm literally floating on cloud nine right now! ☁️✨",
        mood: "excited",
        created_at: new Date(Date.now() - 10800000).toISOString(),
        likes_count: 234,
        comments_count: 89,
        anonymous_id: "anon_trending_003",
        tags: ["love", "success", "dating"],
        is_trending: true,
    },
]

const MOODS = [
    { emoji: "😢", label: "Sad", value: "sad", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    { emoji: "😃", label: "Happy", value: "happy", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
    { emoji: "😡", label: "Angry", value: "angry", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
    { emoji: "❤️", label: "Love", value: "love", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
    { emoji: "😰", label: "Anxious", value: "anxious", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
    { emoji: "🤔", label: "Confused", value: "confused", color: "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300" },
    { emoji: "😴", label: "Tired", value: "tired", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
    { emoji: "🎉", label: "Excited", value: "excited", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
]

export default function TrendingPage() {
    const [selectedPeriod, setSelectedPeriod] = useState("today")
    const [trendingRants, setTrendingRants] = useState(mockTrendingRants)
    const [likedRants, setLikedRants] = useState<Set<string>>(new Set())
    const [bookmarkedRants, setBookmarkedRants] = useState<Set<string>>(new Set())

    const getMoodEmoji = (mood: string) => {
        return MOODS.find((m) => m.value === mood)?.emoji || "😐"
    }

    const getMoodColor = (mood: string) => {
        return MOODS.find((m) => m.value === mood)?.color || "bg-gray-100 text-gray-800"
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

        if (diffInMinutes < 1) return "Just now"
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
        return `${Math.floor(diffInMinutes / 1440)}d ago`
    }

    const handleLike = (rantId: string) => {
        if (likedRants.has(rantId)) return

        setLikedRants((prev) => new Set([...prev, rantId]))
        setTrendingRants((prev) =>
            prev.map((rant) => (rant.id === rantId ? { ...rant, likes_count: rant.likes_count + 1 } : rant)),
        )
    }

    const handleBookmark = (rantId: string) => {
        setBookmarkedRants((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(rantId)) {
                newSet.delete(rantId)
            } else {
                newSet.add(rantId)
            }
            return newSet
        })
    }

    const handleReport = (rantId: string) => {
        console.log("Reported rant:", rantId)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-6 max-w-6xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                                <TrendingUp className="w-8 h-8 mr-3 text-orange-500" />
                                Trending Rants
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Discover what's resonating with the community</p>
                        </div>
                        <Link href="/">
                            <Button variant="outline">Back to Feed</Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Period Selector */}
                        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardContent className="pt-6">
                                <div className="flex flex-wrap gap-2">
                                    {TRENDING_PERIODS.map((period) => (
                                        <Button
                                            key={period.value}
                                            variant={selectedPeriod === period.value ? "default" : "outline"}
                                            onClick={() => setSelectedPeriod(period.value)}
                                            className={`${selectedPeriod === period.value
                                                    ? "bg-orange-600 hover:bg-orange-700"
                                                    : "hover:bg-orange-50 dark:hover:bg-orange-900"
                                                }`}
                                        >
                                            <period.icon className="w-4 h-4 mr-2" />
                                            {period.label}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trending Rants */}
                        <div className="space-y-4">
                            {trendingRants.map((rant, index) => (
                                <div key={rant.id} className="relative">
                                    <div className="absolute -left-4 top-4 z-10">
                                        <Badge className="bg-orange-500 text-white font-bold">#{index + 1}</Badge>
                                    </div>
                                    <RantCard
                                        rant={rant}
                                        onLike={handleLike}
                                        onBookmark={handleBookmark}
                                        onReport={handleReport}
                                        isLiked={likedRants.has(rant.id)}
                                        isBookmarked={bookmarkedRants.has(rant.id)}
                                        getMoodEmoji={getMoodEmoji}
                                        getMoodColor={getMoodColor}
                                        formatTimeAgo={formatTimeAgo}
                                        moods={MOODS}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trending Stats */}
                        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Trending Stats</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Top Rant Likes</span>
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">234</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Most Comments</span>
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">89</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Trending Tags</span>
                                    <span className="font-semibold text-orange-600 dark:text-orange-400">#love</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Popular Moods */}
                        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Popular Moods Today</h3>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span>🎉</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Excited</span>
                                    </div>
                                    <Badge variant="secondary">45%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span>😡</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Angry</span>
                                    </div>
                                    <Badge variant="secondary">23%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span>🤔</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Confused</span>
                                    </div>
                                    <Badge variant="secondary">18%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span>😢</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">Sad</span>
                                    </div>
                                    <Badge variant="secondary">14%</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trending Tags */}
                        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Trending Tags</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                        #work
                                    </Badge>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                        #love
                                    </Badge>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                        #stress
                                    </Badge>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                        #success
                                    </Badge>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                        #anxiety
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
