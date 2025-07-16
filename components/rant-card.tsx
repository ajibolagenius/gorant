"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
    Heart,
    MessageCircle,
    Bookmark,
    Send,
    Flag,
    Share2,
    MoreHorizontal,
    UserX,
    Eye,
    Shield,
    TrendingUp,
    Star,
} from "lucide-react"
import type { Rant } from "@/components/enhanced-rant-card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { SentimentAnalysisService } from "@/services/sentiment-analysis"
import { Star as PhosphorStar } from "@phosphor-icons/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import React from "react"
import { motion } from "framer-motion"
import { audioService } from "@/services/audio-service"
import { trackEvent } from "@/lib/self-analytics"
import { getAnonymousId } from "@/lib/utils"

interface RantCardProps {
    rant: Rant
    onLike: (id: string) => void
    onBookmark: (id: string) => void
    onReport: (id: string, reason: string) => void
    onShare: (rant: Rant) => void
    onBlockUser: (userId: string) => void
    onFollowTag: (tag: string) => void
    isLiked: boolean
    isBookmarked: boolean
    isUserBlocked: boolean
    followedTags: Set<string>
    getMoodIcon: (mood: string) => React.ElementType
    getMoodColor: (mood: string) => string
    formatTimeAgo: (date: string) => string
    moods: Array<{ icon: React.ElementType; label: string; value: string; color: string }>
    showSentiment?: boolean
    showModeration?: boolean
    showBookmark?: boolean // Show bookmark action (default true)
    showReport?: boolean   // Show report action (default true)
    showShare?: boolean    // Show share action (default true)
}

export const RantCard = React.memo(function RantCard({
    rant,
    onLike,
    onBookmark,
    onReport,
    onShare,
    onBlockUser,
    onFollowTag,
    isLiked,
    isBookmarked,
    isUserBlocked,
    followedTags,
    getMoodIcon,
    getMoodColor,
    formatTimeAgo,
    moods,
    showSentiment = false,
    showModeration = false,
    showBookmark = true,
    showReport = true,
    showShare = true,
}: RantCardProps) {
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [showReportDialog, setShowReportDialog] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [showRepTooltip, setShowRepTooltip] = useState(false)

    useEffect(() => {
        setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    }, [])

    if (isUserBlocked) {
        return (
            <Card className="shadow-sm border-0 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur">
                <CardContent className="pt-6 text-center">
                    <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                        <UserX className="w-5 h-5" />
                        <span>Content from blocked user</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const handleShare = () => {
        onShare(rant)
    }

    const handleReport = (reason: string) => {
        onReport(rant.id, reason)
        setShowReportDialog(false)
    }

    const handleLike = (id: string) => {
        trackEvent("rant_liked", {
            rantId: id,
            anonId: getAnonymousId(),
        })
        audioService.playActionSound('like')
        onLike(id)
    }

    const handleBookmark = (id: string) => {
        trackEvent("rant_bookmarked", {
            rantId: id,
            anonId: getAnonymousId(),
        })
        onBookmark(id)
    }

    const getSentimentDisplay = () => {
        if (!rant.sentiment_score) return null

        const label = SentimentAnalysisService.getSentimentLabel(rant.sentiment_score)
        const emoji = SentimentAnalysisService.getSentimentEmoji(rant.sentiment_score)

        return (
            <Badge
                variant="outline"
                className={`${label === "positive"
                    ? "text-green-800 border-green-400 bg-green-100 dark:bg-green-900/20"
                    : label === "negative"
                        ? "text-red-600 border-red-300 bg-red-50 dark:bg-red-900/20"
                        : "text-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700"
                    }`}
            >
                {emoji} {label}
            </Badge>
        )
    }

    const MoodIcon = getMoodIcon(rant.mood);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur hover:shadow-md transition-all duration-200 relative">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-wrap gap-2">
                            {/* Mood badge */}
                            <Badge
                                variant="secondary"
                                size="default"
                                className={`${getMoodColor(rant.mood)} text-xs font-medium`}
                            >
                                <MoodIcon weight="duotone" className={`w-5 h-5 mr-1 ${getMoodColor(rant.mood).replace(/bg-[^ ]+/, '').replace('text-', 'text-')}`} />
                                {moods.find((m) => m.value === rant.mood)?.label}
                            </Badge>
                            {/* Trending badge */}
                            {rant.is_trending && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="secondary"
                                            size="default"
                                            className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs"
                                        >
                                            <TrendingUp className="w-3 h-3" />
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={2} delayDuration={0}>Trending</TooltipContent>
                                </Tooltip>
                            )}
                            {/* Negative sentiment badge */}
                            {showSentiment && rant.sentiment_score && SentimentAnalysisService.getSentimentLabel(rant.sentiment_score) === "negative" && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="outline"
                                            size="default"
                                            className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs"
                                        >
                                            {SentimentAnalysisService.getSentimentEmoji(rant.sentiment_score)}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={2} delayDuration={0}>Negative</TooltipContent>
                                </Tooltip>
                            )}
                            {/* Verified badge */}
                            {showModeration && rant.moderation_status === "approved" && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="outline"
                                            size="default"
                                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs"
                                        >
                                            <Shield className="w-3 h-3" />
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" sideOffset={2} delayDuration={0}>Verified</TooltipContent>
                                </Tooltip>
                            )}
                            {/* If tooltips still do not show, ensure TooltipProvider wraps your app in layout.tsx */}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(rant.created_at)}</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {showShare && (
                                        <DropdownMenuItem onClick={handleShare}>
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Share
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => onBlockUser(rant.anonymous_id)}>
                                        <UserX className="mr-2 h-4 w-4" />
                                        Block User
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {showReport && (
                                        <DropdownMenuItem onClick={() => handleReport("inappropriate")}>
                                            <Flag className="mr-2 h-4 w-4" />
                                            Report
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Rant Content */}
                    <div className="prose prose-sm dark:prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: rant.content }} />

                    {/* Tags */}
                    {rant.tags && rant.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                            {rant.tags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 border font-medium cursor-pointer transition-colors ${followedTags.has(tag)
                                        ? "bg-purple-100 text-purple-800 border-purple-400 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-400"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-400 dark:border-gray-500 hover:bg-purple-50 dark:hover:bg-purple-900"
                                        }`}
                                    onClick={() => onFollowTag(tag)}
                                >
                                    #{tag} {followedTags.has(tag) && "✓"}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <Separator className="mb-4" />

                    <div className="flex flex-row w-full items-center justify-between mt-4 gap-2">
                        <div className="flex items-center gap-4 min-w-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike(rant.id)}
                                className={`${isLiked
                                    ? "text-red-600 hover:text-red-700 dark:text-red-400"
                                    : "text-gray-600 hover:text-red-600 dark:text-gray-400"
                                    }`}
                            >
                                <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                                {rant.likes_count}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowComments(!showComments)}
                                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {rant.comments_count}
                            </Button>

                            {showBookmark && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBookmark(rant.id)}
                                    className={`${isBookmarked
                                        ? "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
                                        : "text-gray-600 hover:text-yellow-600 dark:text-gray-400"
                                        }`}
                                    aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                                >
                                    <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                                    <span className="sr-only">{isBookmarked ? "Remove bookmark" : "Add bookmark"}</span>
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap justify-end min-w-0">
                            {rant.reputation_impact && (
                                <Tooltip open={isMobile ? showRepTooltip : undefined} onOpenChange={isMobile ? setShowRepTooltip : undefined}>
                                    <TooltipTrigger asChild>
                                        <span
                                            className="inline-flex items-center text-yellow-700 dark:text-yellow-300 cursor-pointer"
                                            onClick={isMobile ? () => setShowRepTooltip((v) => !v) : undefined}
                                            aria-label="Reputation info"
                                        >
                                            <PhosphorStar weight="duotone" className="w-4 h-4 mr-0.5" />
                                            +{rant.reputation_impact}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="top"
                                        sideOffset={8}
                                        className="bg-popover text-gray-900 dark:bg-gray-900 dark:text-white rounded-xl shadow-lg p-4 max-w-xs border border-yellow-400 dark:border-yellow-400 z-50 whitespace-normal break-words"
                                    >
                                        <div className="mb-2 flex items-center gap-2">
                                            <PhosphorStar weight="duotone" className="w-5 h-5 text-yellow-400" />
                                            <span className="font-semibold text-base">Reputation</span>
                                        </div>
                                        <div className="text-sm text-gray-200 mb-2 whitespace-normal break-words">
                                            Earned by positive community actions. Higher reputation unlocks more features and recognition.
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <Eye className="w-3 h-3" />
                            <span>{rant.anonymous_id}</span>
                        </div>
                    </div>

                    {/* Comments Section */}
                    {showComments && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            {/* Add Comment */}
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-1 border-gray-200 dark:border-gray-600 focus:border-purple-400 dark:bg-gray-700 dark:text-white"
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter" && newComment.trim()) {
                                            // Handle comment submission
                                            setNewComment("")
                                        }
                                    }}
                                />
                                <Button size="sm" disabled={!newComment.trim()} className="bg-purple-600 hover:bg-purple-700">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-3">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                    <p className="text-gray-800 dark:text-gray-200 text-sm mb-1">
                                        I totally understand how you feel. Hang in there! 💪
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">2h ago</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">anon_123</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
})
