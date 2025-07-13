"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Mood {
    icon: React.ElementType
    label: string
    value: string
    color: string
}

interface FilterOption {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
}

interface FilterPanelProps {
    moods: Mood[]
    moodFilter: string
    setMoodFilter: (mood: string) => void
    sortFilter: string
    setSortFilter: (sort: string) => void
    filterOptions: FilterOption[]
    followedTags: Set<string>
    onFollowTag: (tag: string) => void
}

export function FilterPanel({
    moods,
    moodFilter,
    setMoodFilter,
    sortFilter,
    setSortFilter,
    filterOptions,
    followedTags,
    onFollowTag,
}: FilterPanelProps) {
    const popularTags = ["work", "love", "stress", "anxiety", "success", "family", "friends", "health"]

    return (
        <div className="space-y-4">
            {/* Mood Filter */}
            <div>
                <h4 className="text-sm font-medium text-card-foreground mb-2">Filter by Mood</h4>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={!moodFilter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMoodFilter("")}
                        className={!moodFilter ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
                    >
                        All Moods
                    </Button>
                    {moods.map((mood) => (
                        <Button
                            key={mood.value}
                            variant={moodFilter === mood.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMoodFilter(moodFilter === mood.value ? "" : mood.value)}
                            className={`${moodFilter === mood.value
                                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                : "hover:bg-accent dark:hover:bg-accent"
                                }`}
                        >
                            <mood.icon weight="duotone" className={`w-5 h-5 mr-1 ${mood.color.replace(/bg-[^ ]+/, '').replace('text-', 'text-')}`} />
                            {mood.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Sort Filter */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort by</h4>
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant={sortFilter === option.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortFilter(option.value)}
                            className={`${sortFilter === option.value
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "hover:bg-purple-50 dark:hover:bg-purple-900"
                                }`}
                        >
                            <option.icon className="w-4 h-4 mr-1" />
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Popular Tags */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Popular Tags</h4>
                <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="outline"
                            className={`cursor-pointer transition-colors ${followedTags.has(tag)
                                ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200"
                                : "hover:bg-purple-50 dark:hover:bg-purple-900"
                                }`}
                            onClick={() => onFollowTag(tag)}
                        >
                            #{tag} {followedTags.has(tag) && "✓"}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    )
}
