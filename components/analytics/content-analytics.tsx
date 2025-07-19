"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    TrendUp,
    TrendDown,
    Heart,
    Tag,
    ChatCircle,
    Fire,
    Star,
    Lightning,
    Eye,
    BookmarkSimple,
    Warning
} from "@phosphor-icons/react/dist/ssr"
import { cn } from "@/lib/utils"

interface ContentAnalyticsData {
    trendingTopics: Array<{
        topic: string
        mentions: number
        growth: number
        sentiment: 'positive' | 'negative' | 'neutral'
    }>
    popularMoods: Array<{
        mood: string
        count: number
        percentage: number
        trend: 'up' | 'down' | 'stable'
        color: string
    }>
    contentPerformance: Array<{
        contentType: string
        actionType: string
        actionCount: number
        uniqueSessions: number
        engagementRate: number
    }>
    moderationStats: Array<{
        action: string
        count: number
        contentType: string
        reason: string
    }>
}

interface ContentAnalyticsProps {
    data: ContentAnalyticsData | null
    loading?: boolean
    className?: string
}

const MOOD_ICONS = {
    angry: '😠',
    frustrated: '😤',
    sad: '😢',
    happy: '😊',
    excited: '🤩',
    confused: '😕',
    neutral: '😐'
}

export function ContentAnalytics({ data, loading = false, className }: ContentAnalyticsProps) {
    const mockData: ContentAnalyticsData = useMemo(() => ({
        trendingTopics: [
            { topic: 'work-stress', mentions: 234, growth: 45, sentiment: 'negative' },
            { topic: 'coding-bugs', mentions: 189, growth: 23, sentiment: 'negative' },
            { topic: 'team-collaboration', mentions: 156, growth: -12, sentiment: 'neutral' },
            { topic: 'project-deadlines', mentions: 134, growth: 67, sentiment: 'negative' },
            { topic: 'remote-work', mentions: 98, growth: 15, sentiment: 'positive' }
        ],
        popularMoods: [
            { mood: 'frustrated', count: 456, percentage: 32, trend: 'up', color: 'orange' },
            { mood: 'angry', count: 342, percentage: 24, trend: 'up', color: 'red' },
            { mood: 'sad', count: 289, percentage: 20, trend: 'stable', color: 'blue' },
            { mood: 'neutral', count: 178, percentage: 12, trend: 'down', color: 'gray' },
            { mood: 'happy', count: 123, percentage: 8, trend: 'up', color: 'green' }
        ],
        contentPerformance: [
            { contentType: 'rant', actionType: 'like', actionCount: 1247, uniqueSessions: 342, engagementRate: 78 },
            { contentType: 'rant', actionType: 'comment', actionCount: 456, uniqueSessions: 234, engagementRate: 45 },
            { contentType: 'rant', actionType: 'bookmark', actionCount: 234, uniqueSessions: 156, engagementRate: 34 }
        ],
        moderationStats: [
            { action: 'content_removed', count: 23, contentType: 'rant', reason: 'inappropriate_language' },
            { action: 'content_flagged', count: 45, contentType: 'comment', reason: 'spam' },
            { action: 'user_warned', count: 12, contentType: 'rant', reason: 'harassment' }
        ]
    }), [])

    const analyticsData = data || mockData

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendUp weight="duotone" className="h-4 w-4 text-green-600" />
            case 'down':
                return <TrendDown weight="duotone" className="h-4 w-4 text-red-600" />
            default:
                return <div className="h-4 w-4" />
        }
    }

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return 'text-green-600 dark:text-green-400'
            case 'negative':
                return 'text-red-600 dark:text-red-400'
            default:
                return 'text-gray-600 dark:text-gray-400'
        }
    }

    if (loading) {
        return (
            <Card className={cn("bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0", className)}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Fire weight="duotone" className="h-5 w-5" />
                        Content Analytics
                    </CardTitle>
                    <CardDescription>Trending topics, popular moods, and content performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn("bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0", className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Fire weight="duotone" className="h-5 w-5" />
                    Content Analytics
                </CardTitle>
                <CardDescription>
                    Trending topics, popular moods, and content performance insights
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="trending" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="trending" className="text-xs">
                            <Fire weight="duotone" className="h-4 w-4 mr-1" />
                            Trending
                        </TabsTrigger>
                        <TabsTrigger value="moods" className="text-xs">
                            <Heart weight="duotone" className="h-4 w-4 mr-1" />
                            Moods
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="text-xs">
                            <Lightning weight="duotone" className="h-4 w-4 mr-1" />
                            Performance
                        </TabsTrigger>
                        <TabsTrigger value="moderation" className="text-xs">
                            <Warning weight="duotone" className="h-4 w-4 mr-1" />
                            Moderation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="trending" className="space-y-4">
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Trending Topics</h4>
                            <div className="space-y-2">
                                {analyticsData.trendingTopics.map((topic, index) => (
                                    <div
                                        key={topic.topic}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-xs">
                                                #{index + 1}
                                            </Badge>
                                            <div>
                                                <p className="font-medium text-sm">{topic.topic}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {topic.mentions} mentions
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-xs font-medium", getSentimentColor(topic.sentiment))}>
                                                {topic.sentiment}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {topic.growth > 0 ? (
                                                    <TrendUp weight="duotone" className="h-4 w-4 text-green-600" />
                                                ) : topic.growth < 0 ? (
                                                    <TrendDown weight="duotone" className="h-4 w-4 text-red-600" />
                                                ) : null}
                                                <span className={cn(
                                                    "text-xs font-medium",
                                                    topic.growth > 0 ? "text-green-600" : topic.growth < 0 ? "text-red-600" : "text-gray-600"
                                                )}>
                                                    {topic.growth > 0 ? '+' : ''}{topic.growth}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="moods" className="space-y-4">
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Popular Moods</h4>
                            <div className="space-y-3">
                                {analyticsData.popularMoods.map((mood) => (
                                    <div key={mood.mood} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">
                                                    {MOOD_ICONS[mood.mood as keyof typeof MOOD_ICONS] || '😐'}
                                                </span>
                                                <span className="font-medium text-sm capitalize">{mood.mood}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {mood.count}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getTrendIcon(mood.trend)}
                                                <span className="text-sm font-medium">{mood.percentage}%</span>
                                            </div>
                                        </div>
                                        <Progress
                                            value={mood.percentage}
                                            className="h-2"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Content Performance</h4>
                            <div className="space-y-2">
                                {analyticsData.contentPerformance.map((item, index) => (
                                    <div
                                        key={`${item.contentType}-${item.actionType}`}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                {item.actionType === 'like' && <Heart weight="duotone" className="h-4 w-4 text-red-500" />}
                                                {item.actionType === 'comment' && <ChatCircle weight="duotone" className="h-4 w-4 text-blue-500" />}
                                                {item.actionType === 'bookmark' && <BookmarkSimple weight="duotone" className="h-4 w-4 text-yellow-500" />}
                                                <span className="font-medium text-sm capitalize">
                                                    {item.contentType} {item.actionType}s
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{item.actionCount}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {item.uniqueSessions} sessions
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                                    {item.engagementRate}%
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    engagement
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="moderation" className="space-y-4">
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Moderation Statistics</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analyticsData.moderationStats.map((stat, index) => (
                                    <div
                                        key={`${stat.action}-${index}`}
                                        className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Warning weight="duotone" className="h-4 w-4 text-orange-500" />
                                                <span className="font-medium text-sm capitalize">
                                                    {stat.action.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {stat.count}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Content: <span className="capitalize">{stat.contentType}</span>
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                Reason: <span className="capitalize">{stat.reason.replace('_', ' ')}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
