"use client"

import { useState } from "react"
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
    getMoodEmoji: (mood: string) => string
    getMoodColor: (mood: string) => string
    formatTimeAgo: (date: string) => string
    moods: Array<{ emoji: string; label: string; value: string; color: string }>
    showSentiment?: boolean
    showModeration?: boolean
}

export function RantCard({
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
    getMoodEmoji,
    getMoodColor,
    formatTimeAgo,
    moods,
    showSentiment = false,
    showModeration = false,
}: RantCardProps) {
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [showReportDialog, setShowReportDialog] = useState(false)

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

    const getSentimentDisplay = () => {
        if (!rant.sentiment_score) return null

        const label = SentimentAnalysisService.getSentimentLabel(rant.sentiment_score)
        const emoji = SentimentAnalysisService.getSentimentEmoji(rant.sentiment_score)

        return (
            <Badge
                variant="outline"
                className={`${label === "positive"
                        ? "text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20"
                        : label === "negative"
                            ? "text-red-600 border-red-300 bg-red-50 dark:bg-red-900/20"
                            : "text-gray-600 border-gray-300 bg-gray-50 dark:bg-gray-700"
                    }`}
            >
                {emoji} {label}
            </Badge>
        )
    }

    return (
        <Card className="shadow-sm border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-md transition-all duration-200">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Badge variant="secondary" className={getMoodColor(rant.mood)}>
                            {getMoodEmoji(rant.mood)} {moods.find((m) => m.value === rant.mood)?.label}
                        </Badge>
                        {rant.is_trending && (
                            <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            >
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                            </Badge>
                        )}
                        {showSentiment && getSentimentDisplay()}
                        {showModeration && rant.moderation_status === "approved" && (
                            <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified
                            </Badge>
                        )}
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
                                <DropdownMenuItem onClick={handleShare}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onBlockUser(rant.anonymous_id)}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Block User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleReport("inappropriate")}>
                                    <Flag className="mr-2 h-4 w-4" />
                                    Report
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">{rant.content}</p>

                {/* Tags */}
                {rant.tags && rant.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {rant.tags.map((tag, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className={`text-xs cursor-pointer transition-colors ${followedTags.has(tag)
                                        ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900"
                                    }`}
                                onClick={() => onFollowTag(tag)}
                            >
                                #{tag} {followedTags.has(tag) && "✓"}
                            </Badge>
                        ))}
                    </div>
                )}

                <Separator className="mb-4" />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onLike(rant.id)}
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

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onBookmark(rant.id)}
                            className={`${isBookmarked
                                    ? "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
                                    : "text-gray-600 hover:text-yellow-600 dark:text-gray-400"
                                }`}
                        >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <Eye className="w-3 h-3" />
                        <span>{rant.anonymous_id}</span>
                        {rant.reputation_impact && (
                            <Badge variant="outline" className="text-xs">
                                +{rant.reputation_impact} rep
                            </Badge>
                        )}
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
    )
}
