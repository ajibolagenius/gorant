"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Heart,
    Search,
    TrendingUp,
    Clock,
    Send,
    Filter,
    Moon,
    Sun,
    Bell,
    Users,
    Trophy,
    Globe,
    HelpCircle,
    Star,
    Zap,
    Shield,
    MessageCircle,
} from "lucide-react"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"
import { useGameification } from "@/hooks/use-gamification"
import { useAccessibility } from "@/hooks/use-accessibility"
import { MasonryGrid } from "@/components/masonry-grid"
import { EnhancedRantCard } from "@/components/enhanced-rant-card"
import { PostRantModal } from "@/components/post-rant-modal"
import { FilterPanel } from "@/components/filter-panel"
import { GameificationPanel } from "@/components/gamification-panel"
import { ContentModerationService } from "@/services/content-moderation"
import { SentimentAnalysisService } from "@/services/sentiment-analysis"
import { PersonalizationService } from "@/services/personalization"
import { getAnonymousId } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Initialize Supabase client with fallback for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Comment {
    id: string
    rant_id: string
    content: string
    created_at: string
    anonymous_id: string
    likes_count?: number
    replies?: Comment[]
}

interface Rant {
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
}

const MOODS = [
    { emoji: "😢", label: "Sad", value: "sad", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    { emoji: "😭", label: "Crying", value: "crying", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" },
    { emoji: "😃", label: "Happy", value: "happy", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
    { emoji: "😐", label: "Neutral", value: "neutral", color: "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300" },
    { emoji: "😡", label: "Angry", value: "angry", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
    { emoji: "💔", label: "Heartbroken", value: "heartbroken", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
    { emoji: "❤️", label: "Love", value: "love", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" },
    { emoji: "😰", label: "Anxious", value: "anxious", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
    { emoji: "🤔", label: "Confused", value: "confused", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
    { emoji: "😴", label: "Tired", value: "tired", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
    { emoji: "🎉", label: "Excited", value: "excited", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
    { emoji: "💪", label: "Confident", value: "confident", color: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300" },
]

const mockComments: { [key: string]: Comment[] } = {
    "1": [
        {
            id: "c1",
            rant_id: "1",
            content: "I totally understand how you feel. Work can be really overwhelming sometimes. Hang in there! 💪",
            created_at: new Date(Date.now() - 1800000).toISOString(),
            anonymous_id: "anon_supporter_001",
            likes_count: 3,
        },
        {
            id: "c2",
            rant_id: "1",
            content: "Same here! Yesterday was absolutely terrible for me too. Hope tomorrow is better for both of us.",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            anonymous_id: "anon_empathy_002",
            likes_count: 1,
        },
    ],
    "2": [
        {
            id: "c3",
            rant_id: "2",
            content: "Congratulations! That's amazing news! You totally deserve it! 🎉",
            created_at: new Date(Date.now() - 1200000).toISOString(),
            anonymous_id: "anon_cheerleader_001",
            likes_count: 5,
        },
        {
            id: "c4",
            rant_id: "2",
            content: "So happy for you! Hard work really does pay off. Celebrate tonight!",
            created_at: new Date(Date.now() - 2400000).toISOString(),
            anonymous_id: "anon_motivator_003",
            likes_count: 2,
        },
    ],
}

const mockRants: Rant[] = [
    {
        id: "1",
        content:
            "Just had the worst day at work. Everything that could go wrong did go wrong. Need to vent somewhere! Sometimes I feel like the universe is conspiring against me. My computer crashed, I spilled coffee on important documents, and my boss was in the worst mood ever.",
        mood: "angry",
        created_at: new Date().toISOString(),
        likes_count: 15,
        comments_count: 2,
        anonymous_id: "anon_001",
        tags: ["work", "stress", "bad-day"],
        is_trending: true,
        sentiment_score: -0.7,
        moderation_status: "approved",
        reputation_impact: 2,
    },
    {
        id: "2",
        content:
            "Finally got that promotion I've been working towards for months! So grateful and excited for what's next. Hard work really does pay off! I can't believe it's finally happening. Time to celebrate! 🎉",
        mood: "excited",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        likes_count: 32,
        comments_count: 2,
        anonymous_id: "anon_002",
        tags: ["success", "career", "promotion"],
        is_trending: true,
        sentiment_score: 0.9,
        moderation_status: "approved",
        reputation_impact: 5,
    },
    {
        id: "3",
        content:
            "Feeling really anxious about the presentation tomorrow. Public speaking has always been my weakness. My heart is already racing just thinking about it. Any tips for dealing with presentation anxiety?",
        mood: "anxious",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        likes_count: 8,
        comments_count: 0,
        anonymous_id: "anon_003",
        tags: ["anxiety", "presentation", "help"],
        sentiment_score: -0.5,
        moderation_status: "approved",
        reputation_impact: 1,
    },
    {
        id: "4",
        content:
            "My dog passed away today. 15 years of unconditional love. I'm going to miss him so much. He was my best friend through everything - college, breakups, job changes. The house feels so empty without him.",
        mood: "sad",
        created_at: new Date(Date.now() - 10800000).toISOString(),
        likes_count: 45,
        comments_count: 0,
        anonymous_id: "anon_004",
        tags: ["loss", "pets", "grief"],
        sentiment_score: -0.8,
        moderation_status: "approved",
        reputation_impact: 3,
    },
    {
        id: "5",
        content:
            "Sometimes I wonder what the point of it all is. Life feels so confusing and overwhelming lately. Everything seems to be moving so fast and I can't keep up.",
        mood: "confused",
        created_at: new Date(Date.now() - 14400000).toISOString(),
        likes_count: 12,
        comments_count: 0,
        anonymous_id: "anon_005",
        tags: ["existential", "overwhelmed", "life"],
        sentiment_score: -0.3,
        moderation_status: "approved",
        reputation_impact: 1,
    },
    {
        id: "6",
        content:
            "Met someone amazing today. There's something special about genuine human connection. My heart feels so full right now! We talked for hours about everything and nothing. It's been so long since I felt this happy.",
        mood: "love",
        created_at: new Date(Date.now() - 18000000).toISOString(),
        likes_count: 28,
        comments_count: 0,
        anonymous_id: "anon_006",
        tags: ["connection", "relationships", "happiness"],
        sentiment_score: 0.8,
        moderation_status: "approved",
        reputation_impact: 4,
    },
]

const FILTER_OPTIONS = [
    { icon: Clock, label: "Latest", value: "latest" },
    { icon: TrendingUp, label: "Popular", value: "popular" },
    { icon: Heart, label: "Most Liked", value: "most_liked" },
    { icon: Star, label: "Recommended", value: "recommended" },
]

export default function RantApp() {
    const [rants, setRants] = useState<Rant[]>([])
    const [filteredRants, setFilteredRants] = useState<Rant[]>([])
    const [comments, setComments] = useState<{ [key: string]: Comment[] }>(mockComments)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
    const [moodFilter, setMoodFilter] = useState("")
    const [sortFilter, setSortFilter] = useState("latest")
    const [likedRants, setLikedRants] = useState<Set<string>>(new Set())
    const [bookmarkedRants, setBookmarkedRants] = useState<Set<string>>(new Set())
    const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set())
    const [followedTags, setFollowedTags] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [showPostModal, setShowPostModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [rantOfTheDay, setRantOfTheDay] = useState<Rant | null>(null)
    // Add state for Rant of the Day modal
    const [showRantOfTheDayModal, setShowRantOfTheDayModal] = useState(false)

    const { theme, toggleTheme } = useTheme()
    const { userPoints, userLevel, addPoints, checkAchievements } = useGameification()
    const { fontSize, contrast, screenReaderMode, updateAccessibility } = useAccessibility()

    // Enhanced comment posting function
    const handleCommentPost = async (rantId: string, content: string): Promise<Comment> => {
        // Content moderation check
        const moderationResult = await ContentModerationService.moderateContent(content)
        if (!moderationResult.isAppropriate) {
            throw new Error(`Comment flagged: ${moderationResult.reason}`)
        }

        const newComment: Comment = {
            id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            rant_id: rantId,
            content: content.trim(),
            created_at: new Date().toISOString(),
            anonymous_id: getAnonymousId(),
            likes_count: 0,
        }

        // Update local comments state
        setComments((prev) => ({
            ...prev,
            [rantId]: [newComment, ...(prev[rantId] || [])],
        }))

        // Update rant comments count
        setRants((prev) =>
            prev.map((rant) => (rant.id === rantId ? { ...rant, comments_count: rant.comments_count + 1 } : rant)),
        )

        // Add points for commenting
        addPoints(2, "comment")
        checkAchievements("comments_posted", Object.values(comments).flat().length + 1)

        return newComment
    }

    // Handle comment likes
    const handleCommentLike = (commentId: string) => {
        addPoints(1, "like")
        toast.success("Comment liked! +1 point")
    }

    // Advanced search with suggestions
    const handleSearchChange = (query: string) => {
        setSearchQuery(query)
        if (query.length >= 2) {
            const suggestions = [
                ...new Set([
                    ...rants
                        .filter((r) => r.content.toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 3)
                        .map((r) => r.content.substring(0, 50) + "..."),
                    ...rants
                        .flatMap((r) => r.tags || [])
                        .filter((tag) => tag.toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 3)
                        .map((tag) => `#${tag}`),
                ]),
            ]
            setSearchSuggestions(suggestions.slice(0, 5))
        } else {
            setSearchSuggestions([])
        }
    }

    // Fetch rants with personalization
    const fetchRants = async () => {
        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                console.warn("Supabase not configured - using mock data")
                let data = [...mockRants]

                // Apply personalization
                if (sortFilter === "recommended") {
                    data = PersonalizationService.getRecommendedRants(data, getAnonymousId(), Array.from(followedTags))
                }

                // Filter out blocked users
                data = data.filter((rant) => !blockedUsers.has(rant.anonymous_id))

                setRants(data)
                // Set rant of the day
                if (data.length > 0) {
                    setRantOfTheDay(data.reduce((prev, current) => (prev.likes_count > current.likes_count ? prev : current)))
                }
                setLoading(false)
                return
            }

            // Supabase implementation would go here
            const { data, error } = await supabase.from("rants").select("*").order("created_at", { ascending: false })

            if (error) throw error

            setRants(data || [])
        } catch (error) {
            console.error("Error fetching rants:", error)
            toast.error("Failed to load rants - using demo data")
            setRants(mockRants)
        } finally {
            setLoading(false)
        }
    }

    // Enhanced content moderation
    const moderateContent = async (content: string): Promise<boolean> => {
        const moderationResult = await ContentModerationService.moderateContent(content)
        if (!moderationResult.isAppropriate) {
            toast.error(`Content flagged: ${moderationResult.reason}`)
            return false
        }
        return true
    }

    // Filter and search rants with advanced features
    useEffect(() => {
        let filtered = rants.filter((rant) => {
            const matchesSearch =
                searchQuery.length < 3 ||
                rant.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (rant.tags && rant.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
            const matchesMood = !moodFilter || rant.mood === moodFilter
            const notBlocked = !blockedUsers.has(rant.anonymous_id)
            const moderationPassed = rant.moderation_status === "approved"
            return matchesSearch && matchesMood && notBlocked && moderationPassed
        })

        // Apply sorting with personalization
        if (sortFilter === "recommended") {
            filtered = PersonalizationService.getRecommendedRants(filtered, getAnonymousId(), Array.from(followedTags))
        } else if (sortFilter === "popular" || sortFilter === "most_liked") {
            filtered.sort((a, b) => b.likes_count - a.likes_count)
        } else {
            filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }

        setFilteredRants(filtered)
    }, [rants, searchQuery, moodFilter, sortFilter, blockedUsers, followedTags])

    // Enhanced like function with gamification
    const likeRant = async (rantId: string) => {
        if (likedRants.has(rantId)) {
            toast.info("You already liked this rant!")
            return
        }

        try {
            setLikedRants((prev) => new Set([...prev, rantId]))
            setRants((prev) =>
                prev.map((rant) => (rant.id === rantId ? { ...rant, likes_count: rant.likes_count + 1 } : rant)),
            )

            // Add points for liking
            addPoints(1, "like")
            checkAchievements("likes_given", likedRants.size + 1)

            toast.success("Rant liked! +1 point")

            // Trigger confetti
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
            })
        } catch (error) {
            console.error("Error liking rant:", error)
        }
    }

    // Block user function
    const blockUser = (userId: string) => {
        setBlockedUsers((prev) => new Set([...prev, userId]))
        toast.success("User blocked successfully")
    }

    // Follow tag function
    const followTag = (tag: string) => {
        setFollowedTags((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(tag)) {
                newSet.delete(tag)
                toast.info(`Unfollowed #${tag}`)
            } else {
                newSet.add(tag)
                toast.success(`Following #${tag}`)
            }
            return newSet
        })
    }

    // Share rant function
    const shareRant = async (rant: Rant) => {
        const shareData = {
            title: "Check out this rant on Rant App",
            text: rant.content.substring(0, 100) + "...",
            url: `${window.location.origin}/rant/${rant.id}`,
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
                addPoints(2, "share")
                toast.success("Rant shared! +2 points")
            } catch (error) {
                console.log("Error sharing:", error)
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
            toast.success("Link copied to clipboard!")
        }
    }

    // Toggle bookmark
    const toggleBookmark = (rantId: string) => {
        setBookmarkedRants((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(rantId)) {
                newSet.delete(rantId)
                toast.info("Bookmark removed")
            } else {
                newSet.add(rantId)
                addPoints(1, "bookmark")
                toast.success("Rant bookmarked! +1 point")
            }
            return newSet
        })
    }

    // Report rant
    const reportRant = (rantId: string, reason: string) => {
        toast.success("Rant reported. Thank you for helping keep our community safe.")
    }

    // Initial load
    useEffect(() => {
        fetchRants()
    }, [sortFilter])

    const getMoodEmoji = (mood: string) => {
        return MOODS.find((m) => m.value === mood)?.emoji || "😐"
    }

    const getMoodColor = (mood: string) => {
        return (
            MOODS.find((m) => m.value === mood)?.color || "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300"
        )
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading rants...</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 transition-colors ${fontSize} ${contrast}`}
            style={{ fontSize: fontSize === "text-lg" ? "1.125rem" : fontSize === "text-xl" ? "1.25rem" : "1rem" }}
        >
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-4 max-w-7xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Rant 💭</h1>
                            <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            >
                                Anonymous
                            </Badge>
                            {userLevel > 1 && (
                                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                    <Star className="w-3 h-3 mr-1" />
                                    Level {userLevel}
                                </Badge>
                            )}
                        </div>

                        <nav className="hidden md:flex items-center space-x-6">
                            <Link
                                href="/trending"
                                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span>Trending</span>
                            </Link>
                            <Link
                                href="/challenges"
                                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                            >
                                <Trophy className="w-4 h-4" />
                                <span>Challenges</span>
                            </Link>
                            <Link
                                href="/leaderboard"
                                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                            >
                                <Zap className="w-4 h-4" />
                                <span>Leaderboard</span>
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleTheme}
                                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </Button>
                            <Link href="/notifications">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Bell className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/settings">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Shield className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Rant of the Day */}
                        {rantOfTheDay && (
                            <>
                                <Card
                                    className="shadow-lg border-0 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 dark:border-yellow-800/30 cursor-pointer"
                                    onClick={() => setShowRantOfTheDayModal(true)}
                                >
                                    <CardHeader>
                                        <div className="flex items-center space-x-2">
                                            <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Rant of the Day</h2>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-start space-x-3">
                                            <div className="text-2xl">{getMoodEmoji(rantOfTheDay.mood)}</div>
                                            <div className="flex-1">
                                                <p className="text-gray-800 dark:text-gray-200 mb-2 line-clamp-3">{rantOfTheDay.content}</p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                                                    <span className="flex items-center">
                                                        <Heart className="w-4 h-4 mr-1" />
                                                        {rantOfTheDay.likes_count} likes
                                                    </span>
                                                    <span className="flex items-center">
                                                        <MessageCircle className="w-4 h-4 mr-1" />
                                                        {rantOfTheDay.comments_count} comments
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Dialog open={showRantOfTheDayModal} onOpenChange={setShowRantOfTheDayModal}>
                                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                                                <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                                Rant of the Day
                                            </DialogTitle>
                                        </DialogHeader>
                                        {/* Only show EnhancedRantCard, remove duplicate content */}
                                        <EnhancedRantCard
                                            rant={rantOfTheDay}
                                            onLike={likeRant}
                                            onBookmark={toggleBookmark}
                                            onReport={reportRant}
                                            onShare={shareRant}
                                            onBlockUser={blockUser}
                                            onFollowTag={followTag}
                                            onCommentPost={handleCommentPost}
                                            onCommentLike={handleCommentLike}
                                            isLiked={likedRants.has(rantOfTheDay.id)}
                                            isBookmarked={bookmarkedRants.has(rantOfTheDay.id)}
                                            isUserBlocked={blockedUsers.has(rantOfTheDay.anonymous_id)}
                                            followedTags={followedTags}
                                            getMoodEmoji={getMoodEmoji}
                                            getMoodColor={getMoodColor}
                                            formatTimeAgo={formatTimeAgo}
                                            moods={MOODS}
                                            showSentiment={true}
                                            showModeration={true}
                                            comments={comments[rantOfTheDay.id] || []}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}

                        {/* Welcome Message */}
                        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                        Welcome to Your Safe Space
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        Express yourself freely and anonymously. Your thoughts matter.
                                    </p>
                                    <Button
                                        onClick={() => setShowPostModal(true)}
                                        className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Share Your Thoughts
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Enhanced Search with Suggestions */}
                        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Search */}
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                        <Input
                                            placeholder="Search rants, tags, or users... (min 2 characters)"
                                            value={searchQuery}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            className="pl-10 border-gray-200 dark:border-gray-600 focus:border-purple-400 dark:focus:border-purple-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                        />
                                        {/* Search Suggestions */}
                                        {searchSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md mt-1 shadow-lg z-10">
                                                {searchSuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm dark:text-gray-200"
                                                        onClick={() => {
                                                            setSearchQuery(suggestion.startsWith("#") ? suggestion.slice(1) : suggestion)
                                                            setSearchSuggestions([])
                                                        }}
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Filter Toggle */}
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Filter className="w-4 h-4" />
                                        <span>Filters</span>
                                    </Button>
                                </div>

                                {/* Expandable Filters */}
                                {showFilters && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <FilterPanel
                                            moods={MOODS}
                                            moodFilter={moodFilter}
                                            setMoodFilter={setMoodFilter}
                                            sortFilter={sortFilter}
                                            setSortFilter={setSortFilter}
                                            filterOptions={FILTER_OPTIONS}
                                            followedTags={followedTags}
                                            onFollowTag={followTag}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Masonry Grid Rants Feed */}
                        {filteredRants.length === 0 ? (
                            <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                                <CardContent className="pt-6 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {searchQuery.length >= 2 || moodFilter
                                            ? "No rants match your filters"
                                            : "No rants yet. Be the first to share!"}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <MasonryGrid columns={2} gap={20} className="w-full">
                                {filteredRants.map((rant) => (
                                    <EnhancedRantCard
                                        key={rant.id}
                                        rant={rant}
                                        onLike={likeRant}
                                        onBookmark={toggleBookmark}
                                        onReport={reportRant}
                                        onShare={shareRant}
                                        onBlockUser={blockUser}
                                        onFollowTag={followTag}
                                        onCommentPost={handleCommentPost}
                                        onCommentLike={handleCommentLike}
                                        isLiked={likedRants.has(rant.id)}
                                        isBookmarked={bookmarkedRants.has(rant.id)}
                                        isUserBlocked={blockedUsers.has(rant.anonymous_id)}
                                        followedTags={followedTags}
                                        getMoodEmoji={getMoodEmoji}
                                        getMoodColor={getMoodColor}
                                        formatTimeAgo={formatTimeAgo}
                                        moods={MOODS}
                                        showSentiment={true}
                                        showModeration={true}
                                        comments={comments[rant.id] || []}
                                    />
                                ))}
                            </MasonryGrid>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Gamification Panel */}
                        <GameificationPanel userPoints={userPoints} userLevel={userLevel} nextLevelPoints={userLevel * 100} />

                        {/* Quick Stats */}
                        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Community Stats</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Total Rants</span>
                                    <span className="font-semibold text-purple-600 dark:text-purple-400">1,234</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Active Users</span>
                                    <span className="font-semibold text-purple-600 dark:text-purple-400">567</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Today's Rants</span>
                                    <span className="font-semibold text-purple-600 dark:text-purple-400">89</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Comments Today</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">156</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Followed Tags */}
                        {followedTags.size > 0 && (
                            <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                                <CardHeader>
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Following</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(followedTags).map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50"
                                                onClick={() => followTag(tag)}
                                            >
                                                #{tag} ✓
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Current Challenge */}
                        <Card className="shadow-sm border-0 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30">
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Weekly Challenge</h3>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                    Share a rant about something that made you grateful this week! 🙏
                                </p>
                                <Button
                                    size="sm"
                                    className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white"
                                >
                                    Join Challenge
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Support Resources */}
                        <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Need Support?</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    Remember, you're not alone. Help is always available.
                                </p>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Globe className="w-4 h-4 mr-2" />
                                        Crisis Hotline
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full justify-start bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        Support Groups
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Enhanced Post Rant Modal */}
            <PostRantModal
                isOpen={showPostModal}
                onClose={() => setShowPostModal(false)}
                moods={MOODS}
                onSubmit={async (content, mood, tags) => {
                    // Content moderation check
                    const isAppropriate = await moderateContent(content)
                    if (!isAppropriate) return

                    // Sentiment analysis
                    const sentimentScore = await SentimentAnalysisService.analyzeSentiment(content)

                    const newRant: Rant = {
                        id: Date.now().toString(),
                        content,
                        mood,
                        created_at: new Date().toISOString(),
                        likes_count: 0,
                        comments_count: 0,
                        anonymous_id: getAnonymousId(),
                        tags,
                        sentiment_score: sentimentScore,
                        moderation_status: "approved",
                        reputation_impact: 3,
                    }

                    setRants((prev) => [newRant, ...prev])

                    // Add points for posting
                    addPoints(5, "post")
                    checkAchievements("posts_created", rants.length + 1)

                    toast.success("Your rant has been posted! +5 points")
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                    })
                }}
            />

            {/* Footer */}
            <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t border-gray-200 dark:border-gray-700 mt-12">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                        <p className="mb-2">Rant - Anonymous. Safe. Expressive.</p>
                        <p>Your thoughts matter. Share them freely.</p>
                        <div className="flex justify-center space-x-4 mt-4">
                            <Link href="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400">
                                Privacy
                            </Link>
                            <Link href="/guidelines" className="hover:text-purple-600 dark:hover:text-purple-400">
                                Guidelines
                            </Link>
                            <Link href="/support" className="hover:text-purple-600 dark:hover:text-purple-400">
                                Support
                            </Link>
                            <Link href="/accessibility" className="hover:text-purple-600 dark:hover:text-purple-400">
                                Accessibility
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
