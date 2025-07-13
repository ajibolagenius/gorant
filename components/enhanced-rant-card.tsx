"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
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
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { Star } from "phosphor-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { SentimentAnalysisService } from "@/services/sentiment-analysis"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import React from "react"
import { audioService } from "@/services/audio-service"

export interface Comment {
    id: string
    rant_id: string
    content: string
    created_at: string
    anonymous_id: string
    likes_count?: number
    replies?: Comment[]
}

export interface Rant {
    id: string
    content: string
    mood: string
    created_at: string
    likes_count: number
    comments_count: number
    anonymous_id: string
    tags?: string[]
    is_trending?: boolean
    sentiment_score?: number
    moderation_status?: "approved" | "flagged" | "pending"
    reputation_impact?: number
    reported?: boolean
    moderation_score?: number
}

interface EnhancedRantCardProps {
    rant: Rant
    onLike: (id: string) => void
    onBookmark: (id: string) => void
    onReport: (id: string, reason: string) => void
    onShare: (rant: Rant) => void
    onBlockUser: (userId: string) => void
    onFollowTag: (tag: string) => void
    onCommentPost: (rantId: string, content: string) => Promise<Comment>
    onCommentLike: (commentId: string) => void
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
    comments?: Comment[]
    showBookmark?: boolean // Show bookmark action (default true)
    showReport?: boolean   // Show report action (default true)
    showShare?: boolean    // Show share action (default true)
}

const EnhancedRantCardComponent = ({
    rant,
    onLike,
    onBookmark,
    onReport,
    onShare,
    onBlockUser,
    onFollowTag,
    onCommentPost,
    onCommentLike,
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
    comments = [],
    showBookmark = true,
    showReport = true,
    showShare = true,
}: EnhancedRantCardProps) => {
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [isPostingComment, setIsPostingComment] = useState(false)
    const [localComments, setLocalComments] = useState<Comment[]>(comments)
    const [localCommentsCount, setLocalCommentsCount] = useState(rant.comments_count)
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
    const [isMobile, setIsMobile] = useState(false)
    const [showRepTooltip, setShowRepTooltip] = useState(false)
    const [commentCooldown, setCommentCooldown] = useState(0)

    // Cooldown logic for comments
    useEffect(() => {
        if (!showComments) return
        const lastComment = localStorage.getItem("lastCommentPost")
        if (lastComment) {
            const diff = 10 - Math.floor((Date.now() - Number(lastComment)) / 1000)
            if (diff > 0) setCommentCooldown(diff)
        }
    }, [showComments])

    useEffect(() => {
        if (commentCooldown > 0) {
            const timer = setTimeout(() => setCommentCooldown(commentCooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [commentCooldown])

    useEffect(() => {
        setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    }, [])

    // Update local comments when props change
    useEffect(() => {
        setLocalComments(comments)
        setLocalCommentsCount(rant.comments_count)
    }, [comments, rant.comments_count])

    if (isUserBlocked) {
        return (
            <Card className="shadow-sm border-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur">
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
    }

    const handleCommentSubmit = async () => {
        if (!newComment.trim() || isPostingComment || commentCooldown > 0) return

        setIsPostingComment(true)
        try {
            const comment = await onCommentPost(rant.id, newComment.trim())
            setNewComment("")
            toast.success("Comment posted successfully!")
            // Set cooldown
            localStorage.setItem("lastCommentPost", Date.now().toString())
            setCommentCooldown(10)
        } catch (error) {
            toast.error("Failed to post comment")
            console.error("Error posting comment:", error)
        } finally {
            setIsPostingComment(false)
        }
    }

    const handleCommentLike = (commentId: string) => {
        if (likedComments.has(commentId)) return

        setLikedComments((prev) => new Set([...prev, commentId]))
        setLocalComments((prev) =>
            prev.map((comment) =>
                comment.id === commentId ? { ...comment, likes_count: (comment.likes_count || 0) + 1 } : comment,
            ),
        )
        onCommentLike(commentId)
        toast.success("Comment liked!")
    }

    const handleLike = (id: string) => {
        audioService.playActionSound('like')
        onLike(id)
    }

    const getSentimentDisplay = () => {
        if (!rant.sentiment_score) return null

        const label = SentimentAnalysisService.getSentimentLabel(rant.sentiment_score)
        const emoji = SentimentAnalysisService.getSentimentEmoji(rant.sentiment_score)

        return (
            <Badge
                variant="outline"
                className={`${label === "positive"
                    ? "text-green-700 border-green-300 bg-green-50 dark:text-green-300 dark:border-green-700 dark:bg-green-900/20"
                    : label === "negative"
                        ? "text-red-700 border-red-300 bg-red-50 dark:text-red-300 dark:border-red-700 dark:bg-red-900/20"
                        : "text-gray-700 border-gray-300 bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:bg-gray-800/50"
                    }`}
            >
                {emoji} {label}
            </Badge>
        )
    }

    const getCardHeight = () => {
        const baseHeight = 200
        const contentLength = rant.content.length
        const tagsHeight = rant.tags ? rant.tags.length * 8 : 0
        const commentsHeight = showComments ? Math.min(localComments.length * 60, 300) : 0
        return baseHeight + Math.min(contentLength / 3, 100) + tagsHeight + commentsHeight
    }

    const MoodIcon = getMoodIcon(rant.mood)

    return (
        <Card
            className="shadow-lg border-0 bg-card/90 dark:bg-card/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group relative"
            style={{ minHeight: `${getCardHeight()}px` }}
        >
            <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
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
                                        className="bg-accent text-accent-foreground dark:bg-accent dark:text-accent-foreground text-xs"
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >
                                {showShare && (
                                    <DropdownMenuItem onClick={handleShare} className="dark:text-gray-200 dark:hover:bg-gray-700">
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => onBlockUser(rant.anonymous_id)}
                                    className="dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Block User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                {showReport && (
                                    <DropdownMenuItem
                                        onClick={() => handleReport("inappropriate")}
                                        className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
                                    >
                                        <Flag className="mr-2 h-4 w-4" />
                                        Report
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <p className="text-gray-800 dark:text-gray-100 mb-4 leading-relaxed text-base">{rant.content}</p>

                {/* Tags */}
                {rant.tags && rant.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {rant.tags.map((tag, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className={`text-xs px-2 py-0.5 border font-medium cursor-pointer transition-all duration-200 hover:scale-105 ${followedTags.has(tag)
                                    ? "bg-purple-100 text-purple-800 border-purple-400 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-400"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-400 dark:border-gray-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    }`}
                                onClick={() => onFollowTag(tag)}
                            >
                                #{tag} {followedTags.has(tag) && "✓"}
                            </Badge>
                        ))}
                    </div>
                )}

                <Separator className="mb-4 dark:bg-gray-700" />

                <div className="flex flex-row w-full items-center justify-between gap-2 mt-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(rant.id)}
                            className={`transition-all duration-200 hover:scale-110 ${isLiked
                                ? "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                : "text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                }`}
                        >
                            <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                            {rant.likes_count}
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowComments(!showComments)}
                            className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
                        >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {localCommentsCount}
                            {showComments ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                        </Button>

                        {showBookmark && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onBookmark(rant.id)}
                                className={`transition-all duration-200 hover:scale-110 ${isBookmarked
                                    ? "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                                    : "text-gray-600 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400"
                                    }`}
                            >
                                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
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
                                        <Star weight="duotone" className="w-4 h-4 mr-0.5" />
                                        +{rant.reputation_impact}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    sideOffset={8}
                                    className="bg-popover text-gray-900 dark:bg-gray-900 dark:text-white rounded-xl shadow-lg p-4 max-w-xs border border-yellow-400 dark:border-yellow-400 z-50 whitespace-normal break-words"
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <Star weight="duotone" className="w-5 h-5 text-yellow-400" />
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

                {/* Enhanced Comments Section */}
                {showComments && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                        {/* Add Comment */}
                        <div className="space-y-3">
                            <Textarea
                                placeholder="Share your thoughts on this rant..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="min-h-[80px] resize-none border-gray-200 dark:border-gray-600 focus:border-purple-400 dark:focus:border-purple-500 dark:bg-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                maxLength={500}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{newComment.length}/500 characters</span>
                                <Button
                                    size="sm"
                                    disabled={!newComment.trim() || isPostingComment || commentCooldown > 0}
                                    onClick={handleCommentSubmit}
                                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white"
                                >
                                    {isPostingComment ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    ) : (
                                        <Send className="w-4 h-4 mr-2" />
                                    )}
                                    {isPostingComment ? "Posting..." : commentCooldown > 0 ? `Wait ${commentCooldown}s` : "Post Comment"}
                                </Button>
                            </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {localComments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No comments yet. Be the first to share your thoughts!</p>
                                </div>
                            ) : (
                                localComments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    {comment.anonymous_id}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatTimeAgo(comment.created_at)}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCommentLike(comment.id)}
                                                className={`h-6 px-2 ${likedComments.has(comment.id)
                                                    ? "text-red-600 dark:text-red-400"
                                                    : "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                    }`}
                                            >
                                                <Heart className={`w-3 h-3 mr-1 ${likedComments.has(comment.id) ? "fill-current" : ""}`} />
                                                {comment.likes_count || 0}
                                            </Button>
                                        </div>
                                        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export const EnhancedRantCard = React.memo(EnhancedRantCardComponent)
