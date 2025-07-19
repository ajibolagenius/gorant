"use client"

import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Funnel,
    X,
    CalendarBlank,
    Lightning,
    Tag,
    Users,
    Eye,
    Heart,
    ChatCircle,
    BookmarkSimple,
    Warning
} from "@phosphor-icons/react/dist/ssr"
import { DateRangePicker } from "./date-range-picker"
import { cn } from "@/lib/utils"

interface DateRange {
    from: Date
    to: Date
}

export interface AnalyticsFilters {
    dateRange: DateRange
    eventTypes: string[]
    contentCategories: string[]
    moodTypes: string[]
    pageTypes: string[]
    sessionTypes: string[]
}

interface AdvancedFiltersProps {
    filters: AnalyticsFilters
    onFiltersChange: (filters: AnalyticsFilters) => void
    className?: string
}

const EVENT_TYPES = [
    { value: 'pageview', label: 'Page Views', icon: <Eye weight="duotone" className="h-4 w-4" /> },
    { value: 'user_action', label: 'User Actions', icon: <Lightning weight="duotone" className="h-4 w-4" /> },
    { value: 'rant_posted', label: 'Rants Posted', icon: <ChatCircle weight="duotone" className="h-4 w-4" /> },
    { value: 'like_clicked', label: 'Likes', icon: <Heart weight="duotone" className="h-4 w-4" /> },
    { value: 'bookmark_added', label: 'Bookmarks', icon: <BookmarkSimple weight="duotone" className="h-4 w-4" /> },
    { value: 'comment_posted', label: 'Comments', icon: <ChatCircle weight="duotone" className="h-4 w-4" /> },
    { value: 'moderation_action', label: 'Moderation', icon: <Warning weight="duotone" className="h-4 w-4" /> }
]

const CONTENT_CATEGORIES = [
    { value: 'rant', label: 'Rants', color: 'blue' },
    { value: 'comment', label: 'Comments', color: 'green' },
    { value: 'challenge', label: 'Cnges', color: 'purple' },
    { value: 'bookmark', label: 'Bookmarks', color: 'orange' },
    { value: 'notification', label: 'Notifications', color: 'yellow' }
]

const MOOD_TYPES = [
    { value: 'angry', label: 'Angry', color: 'red' },
    { value: 'frustrated', label: 'Frustrated', color: 'orange' },
    { value: 'sad', label: 'Sad', color: 'blue' },
    { value: 'happy', label: 'Happy', color: 'green' },
    { value: 'excited', label: 'Excited', color: 'yellow' },
    { value: 'confused', label: 'Confused', color: 'purple' },
    { value: 'neutral', label: 'Neutral', color: 'gray' }
]

const PAGE_TYPES = [
    { value: 'home', label: 'Home Page', path: '/' },
    { value: 'bookmarks', label: 'Bookmarks', path: '/bookmarks' },
    { value: 'challenges', label: 'Challenges', path: '/challenges' },
    { value: 'leaderboard', label: 'Leaderboard', path: '/leaderboard' },
    { value: 'trending', label: 'Trending', path: '/trending' },
    { value: 'admin', label: 'Admin Pages', path: '/admin' },
    { value: 'settings', label: 'Settings', path: '/settings' }
]

const SESSION_TYPES = [
    { value: 'new', label: 'New Sessions' },
    { value: 'returning', label: 'Returning Sessions' },
    { value: 'high_engagement', label: 'High Engagement' },
    { value: 'low_engagement', label: 'Low Engagement' }
]

export function AdvancedFilters({ filters, onFiltersChange, className }: AdvancedFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const handleDateRangeChange = useCallback((dateRange: DateRange) => {
        onFiltersChange({ ...filters, dateRange })
    }, [filters, onFiltersChange])

    const toggleEventType = useCallback((eventType: string) => {
        const newEventTypes = filters.eventTypes.includes(eventType)
            ? filters.eventTypes.filter(type => type !== eventType)
            : [...filters.eventTypes, eventType]
        onFiltersChange({ ...filters, eventTypes: newEventTypes })
    }, [filters, onFiltersChange])

    const toggleContentCategory = useCallback((category: string) => {
        const newCategories = filters.contentCategories.includes(category)
            ? filters.contentCategories.filter(cat => cat !== category)
            : [...filters.contentCategories, category]
        onFiltersChange({ ...filters, contentCategories: newCategories })
    }, [filters, onFiltersChange])

    const toggleMoodType = useCallback((mood: string) => {
        const newMoods = filters.moodTypes.includes(mood)
            ? filters.moodTypes.filter(m => m !== mood)
            : [...filters.moodTypes, mood]
        onFiltersChange({ ...filters, moodTypes: newMoods })
    }, [filters, onFiltersChange])

    const togglePageType = useCallback((pageType: string) => {
        const newPageTypes = filters.pageTypes.includes(pageType)
            ? filters.pageTypes.filter(type => type !== pageType)
            : [...filters.pageTypes, pageType]
        onFiltersChange({ ...filters, pageTypes: newPageTypes })
    }, [filters, onFiltersChange])

    const toggleSessionType = useCallback((sessionType: string) => {
        const newSessionTypes = filters.sessionTypes.includes(sessionType)
            ? filters.sessionTypes.filter(type => type !== sessionType)
            : [...filters.sessionTypes, sessionType]
        onFiltersChange({ ...filters, sessionTypes: newSessionTypes })
    }, [filters, onFiltersChange])

    const clearAllFilters = useCallback(() => {
        onFiltersChange({
            ...filters,
            eventTypes: [],
            contentCategories: [],
            moodTypes: [],
            pageTypes: [],
            sessionTypes: []
        })
    }, [filters, onFiltersChange])

    const getActiveFiltersCount = () => {
        return filters.eventTypes.length +
            filters.contentCategories.length +
            filters.moodTypes.length +
            filters.pageTypes.length +
            filters.sessionTypes.length
    }

    const activeFiltersCount = getActiveFiltersCount()

    return (
        <Card className={cn("bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Funnel weight="duotone" className="h-5 w-5" />
                            Advanced Filters
                        </CardTitle>
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {activeFiltersCount} active
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {activeFiltersCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="text-xs"
                            >
                                Clear All
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-xs"
                        >
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </Button>
                    </div>
                </div>
                <CardDescription>
                    Filter analytics data by date range, event types, content categories, and more
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Date Rangeisible */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CalendarBlank weight="duotone" className="h-4 w-4" />
                        Date Range
                    </label>
                    <DateRangePicker
                        dateRange={filters.dateRange}
                        onDateRangeChange={handleDateRangeChange}
                    />
                </div>

                {isExpanded && (
                    <>
                        <Separator />

                        {/* Event Types */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Lightning weight="duotone" className="h-4 w-4" />
                                Event Types
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {EVENT_TYPES.map((eventType) => (
                                    <Button
                                        key={eventType.value}
                                        variant={filters.eventTypes.includes(eventType.value) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleEventType(eventType.value)}
                                        className="text-xs"
                                    >
                                        {eventType.icon}
                                        {eventType.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Content Categories */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Tag weight="duotone" className="h-4 w-4" />
                                Content Categories
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CONTENT_CATEGORIES.map((category) => (
                                    <Button
                                        key={category.value}
                                        variant={filters.contentCategories.includes(category.value) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleContentCategory(category.value)}
                                        className="text-xs"
                                    >
                                        {category.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Mood Types */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Heart weight="duotone" className="h-4 w-4" />
                                Mood Types
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {MOOD_TYPES.map((mood) => (
                                    <Button
                                        key={mood.value}
                                        variant={filters.moodTypes.includes(mood.value) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleMoodType(mood.value)}
                                        className="text-xs"
                                    >
                                        {mood.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Page Types */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Eye weight="duotone" className="h-4 w-4" />
                                Page Types
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PAGE_TYPES.map((pageType) => (
                                    <Button
                                        key={pageType.value}
                                        variant={filters.pageTypes.includes(pageType.value) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => togglePageType(pageType.value)}
                                        className="text-xs"
                                    >
                                        {pageType.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Session Types */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Users weight="duotone" className="h-4 w-4" />
                                Session Types
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SESSION_TYPES.map((sessionType) => (
                                    <Button
                                        key={sessionType.value}
                                        variant={filters.sessionTypes.includes(sessionType.value) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleSessionType(sessionType.value)}
                                        className="text-xs"
                                    >
                                        {sessionType.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
