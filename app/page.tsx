"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Smiley,
    SmileySad,
    SmileyMeh,
    SmileyNervous,
    Heart,
    HeartBreak,
    Cloud,
    Confetti,
    SmileySticker
} from "phosphor-react"
import { HelpCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MoreHorizontal, Dot, GripVertical, Search, PanelLeft, Award, MessageCircle, Send, X, Filter, Eraser } from "lucide-react"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"
import { useGameification } from "@/hooks/use-gamification"
import { useAccessibility } from "@/hooks/use-accessibility"
import { MasonryGrid } from "@/components/masonry-grid"
import { EnhancedRantCard, Rant, Comment } from "@/components/enhanced-rant-card"
import { PostRantModal } from "@/components/post-rant-modal"
import { FilterPanel } from "@/components/filter-panel"
import { GameificationPanel } from "@/components/gamification-panel"
import { ContentModerationService } from "@/services/content-moderation"
import { SentimentAnalysisService } from "@/services/sentiment-analysis"
import { PersonalizationService } from "@/services/personalization"
import { getAnonymousId, normalizeRant } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SidebarContent } from "@/components/sidebar-content"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useSettings } from "@/hooks/use-settings"
import { useFilteredRants } from "@/hooks/use-filtered-rants"
import { storageSet } from "@/lib/storage"
import { FixedSizeList as VirtualizedList, ListChildComponentProps } from "react-window"
import React from "react"


import { audioService } from "@/services/audio-service"

// Initialize Supabase client with fallback for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const MOODS = [
    { icon: SmileySad, emoji: "", label: "Sad", value: "sad", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    { icon: SmileySad, emoji: "", label: "Crying", value: "crying", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" },
    { icon: Smiley, emoji: "", label: "Happy", value: "happy", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
    { icon: SmileyMeh, emoji: "", label: "Neutral", value: "neutral", color: "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300" },
    { icon: SmileyNervous, emoji: "", label: "Angry", value: "angry", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
    { icon: HeartBreak, emoji: "", label: "Heartbroken", value: "heartbroken", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
    { icon: Heart, emoji: "", label: "Love", value: "love", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" },
    { icon: SmileyNervous, emoji: "", label: "Anxious", value: "anxious", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
    { icon: SmileyMeh, emoji: "", label: "Confused", value: "confused", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
    { icon: Cloud, emoji: "", label: "Tired", value: "tired", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
    { icon: Confetti, emoji: "", label: "Excited", value: "excited", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
    { icon: SmileySticker, emoji: "", label: "Confident", value: "confident", color: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300" },
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

// Ensure all mockRants and Rant objects have all required properties
const mockRants: Rant[] = [
    {
        id: "1",
        content: "Just had the worst day at work. Everything that could go wrong did go wrong. Need to vent somewhere! Sometimes I feel like the universe is conspiring against me. My computer crashed, I spilled coffee on important documents, and my boss was in the worst mood ever.",
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
        reported: false,
        moderation_score: 1,
    },
    {
        id: "2",
        content: "Finally got that promotion I've been working towards for months! So grateful and excited for what's next. Hard work really does pay off! I can't believe it's finally happening. Time to celebrate! 🎉",
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
        reported: false,
        moderation_score: 1,
    },
    {
        id: "3",
        content: "Feeling really anxious about the presentation tomorrow. Public speaking has always been my weakness. My heart is already racing just thinking about it. Any tips for dealing with presentation anxiety?",
        mood: "anxious",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        likes_count: 8,
        comments_count: 0,
        anonymous_id: "anon_003",
        tags: ["anxiety", "presentation", "help"],
        is_trending: false,
        sentiment_score: -0.5,
        moderation_status: "approved",
        reputation_impact: 1,
        reported: false,
        moderation_score: 1,
    },
    {
        id: "4",
        content: "My dog passed away today. 15 years of unconditional love. I'm going to miss him so much. He was my best friend through everything - college, breakups, job changes. The house feels so empty without him.",
        mood: "sad",
        created_at: new Date(Date.now() - 10800000).toISOString(),
        likes_count: 45,
        comments_count: 0,
        anonymous_id: "anon_004",
        tags: ["loss", "pets", "grief"],
        is_trending: false,
        sentiment_score: -0.8,
        moderation_status: "approved",
        reputation_impact: 3,
        reported: false,
        moderation_score: 1,
    },
    {
        id: "5",
        content: "Sometimes I wonder what the point of it all is. Life feels so confusing and overwhelming lately. Everything seems to be moving so fast and I can't keep up.",
        mood: "confused",
        created_at: new Date(Date.now() - 14400000).toISOString(),
        likes_count: 12,
        comments_count: 0,
        anonymous_id: "anon_005",
        tags: ["existential", "overwhelmed", "life"],
        is_trending: false,
        sentiment_score: -0.3,
        moderation_status: "approved",
        reputation_impact: 1,
        reported: false,
        moderation_score: 1,
    },
    {
        id: "6",
        content: "Met someone amazing today. It's rare to feel such a strong connection right away. Maybe this is the start of something special.",
        mood: "love",
        created_at: new Date(Date.now() - 18000000).toISOString(),
        likes_count: 28,
        comments_count: 0,
        anonymous_id: "anon_006",
        tags: ["connection", "relationships", "happiness"],
        is_trending: false,
        sentiment_score: 0.8,
        moderation_status: "approved",
        reputation_impact: 4,
        reported: false,
        moderation_score: 1,
    },
]

const FILTER_OPTIONS = [
    { icon: Cloud, label: "Latest", value: "latest" },
    { icon: SmileySticker, label: "Popular", value: "popular" },
    { icon: SmileySticker, label: "Most Liked", value: "most_liked" },
    { icon: Award, label: "Recommended", value: "recommended" },
]

// ErrorBoundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props)
        this.state = { hasError: false }
    }
    static getDerivedStateFromError() {
        return { hasError: true }
    }
    componentDidCatch(error: any, errorInfo: any) {
        // Log error if needed
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-background">
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Something went wrong.</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">An unexpected error occurred. Please refresh the page or try again later.</p>
                    <Button onClick={() => window.location.reload()}>Reload</Button>
                </div>
            )
        }
        return this.props.children
    }
}

export default function RantApp() {
    const [rants, setRants] = useState<Rant[]>(mockRants)
    // Remove filteredRants state, use hook instead
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
    const {
        notifications: notificationSettings,
        privacy: privacySettings,
        contentFilters: contentFilterSettings,
        updateNotification,
        updatePrivacy,
        updateContentFilter,
        loaded: settingsLoaded
    } = useSettings()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const { theme, toggleTheme } = useTheme()
    const { userPoints, userLevel, addPoints, checkAchievements } = useGameification()
    const { fontSize, contrast, screenReaderMode, updateAccessibility } = useAccessibility()
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()


    // Initialize state from URL on mount
    useEffect(() => {
        const urlSearch = searchParams.get("search") || ""
        const urlMood = searchParams.get("mood") || ""
        const urlSort = searchParams.get("sort") || "latest"
        setSearchQuery(urlSearch)
        setMoodFilter(urlMood)
        setSortFilter(urlSort)
    }, [])

    // Update URL when filters/search change
    useEffect(() => {
        const params = new URLSearchParams()
        if (searchQuery) params.set("search", searchQuery)
        if (moodFilter) params.set("mood", moodFilter)
        if (sortFilter && sortFilter !== "latest") params.set("sort", sortFilter)
        const query = params.toString()
        router.replace(query ? `/?${query}` : "/", { scroll: false })
    }, [searchQuery, moodFilter, sortFilter])

    // Load settings from localStorage on mount
    useEffect(() => {
        // The useSettings hook already handles loading from localStorage
    }, [])

    // Enhanced comment posting function
    const handleCommentPost = async (rantId: string, content: string): Promise<Comment> => {
        // Content moderation check
        const moderationResult = await ContentModerationService.moderateContent(content)
        if (!moderationResult.isAppropriate) {
            if (notificationSettings.comments) toast.error(`Comment flagged: ${moderationResult.reason}`)
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
        if (notificationSettings.comments) toast.success("Comment posted! +2 points")

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
                        .map((r) => r.content.length > 50 ? r.content.substring(0, 50) : r.content),
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
                if (sortFilter === "recommended") {
                    data = PersonalizationService.getRecommendedRants(data, getAnonymousId(), Array.from(followedTags))
                }
                data = data.filter((rant) => !blockedUsers.has(rant.anonymous_id))
                data = data.map(normalizeRant)
                setRants(data)
                // Set rant of the day
                if (data.length > 0) {
                    setRantOfTheDay(data.reduce((prev, current) => (prev.likes_count > current.likes_count ? prev : current)))
                }
                setLoading(false)
                return
            }

            // Supabase implementation would go here
            const { data, error } = await supabase
                .from("rants")
                .select("id, content, mood, created_at, likes_count, comments_count, anonymous_id, tags, is_trending, sentiment_score, moderation_status, reputation_impact, reported, moderation_score")
                .order("created_at", { ascending: false })

            if (error) throw error

            const safeData = (data || []).map(normalizeRant)
            setRants(safeData)
        } catch (error) {
            console.error("Error fetching rants:", error)
            toast.error("Failed to load rants - using demo data")
            setRants(mockRants.map(normalizeRant))
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

    const filteredRants = useFilteredRants({
        rants,
        searchQuery,
        moodFilter,
        sortFilter,
        blockedUsers,
        followedTags,
        contentFilterSettings,
        settingsLoaded,
        getAnonymousId,
        personalizationService: PersonalizationService,
    })

    // Helper to determine virtualization
    const VIRTUALIZATION_THRESHOLD = 30
    const isVirtualized = filteredRants.length > VIRTUALIZATION_THRESHOLD

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
            await checkAchievements("likes_given", likedRants.size + 1)

            // Play like sound
            await audioService.playActionSound('like')

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

    // Initialize audio context on first user interaction
    useEffect(() => {
        const handleUserInteraction = () => {
            // Initialize audio context on first user interaction
            if (typeof window !== 'undefined' && audioService.isEnabled()) {
                // This will trigger audio context initialization
                audioService.playActionSound('like').catch(() => {
                    // Silently fail if audio context can't be initialized
                })
            }
            // Remove the event listeners after first interaction
            document.removeEventListener('click', handleUserInteraction)
            document.removeEventListener('touchstart', handleUserInteraction)
        }

        document.addEventListener('click', handleUserInteraction)
        document.addEventListener('touchstart', handleUserInteraction)

        return () => {
            document.removeEventListener('click', handleUserInteraction)
            document.removeEventListener('touchstart', handleUserInteraction)
        }
    }, [])

    // Persist all rants and bookmarks to localStorage for bookmarks page
    useEffect(() => {
        storageSet("all_rants", rants)
    }, [rants])
    useEffect(() => {
        storageSet("bookmarked_rants", Array.from(bookmarkedRants))
    }, [bookmarkedRants])

    const getMoodIcon = (mood: string) => {
        return MOODS.find((m) => m.value === mood)?.icon || SmileyMeh
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
            <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading rants...</p>
                </div>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <main
                role="main"
                className={`min-h-screen bg-background dark:bg-background transition-colors ${fontSize} ${contrast}`}
                style={{ fontSize: fontSize === "text-lg" ? "1.125rem" : fontSize === "text-xl" ? "1.25rem" : "1rem" }}
            >
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "Rant - Anonymous Expression Platform",
                            "url": "https://gorant.live/",
                            "description": "A safe, anonymous space to express your thoughts and feelings. Join the community and share your story anonymously.",
                            "publisher": {
                                "@type": "Organization",
                                "name": "Rant Team",
                                "url": "https://gorant.live/"
                            }
                        })
                    }}
                />
                {/* Main Content */}
                <div className="container mx-auto px-4 py-8 max-w-7xl pb-32 mb-safe-bottom wrap-screen overflow-x-auto lg:overflow-visible">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-wrap justify-center">
                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">
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

                            {/* Rant of the Day */}
                            {rantOfTheDay && (
                                <>
                                    <Card
                                        className="shadow-lg border-0 bg-yellow-100 dark:bg-yellow-900/30 dark:border-yellow-800/30 cursor-pointer relative"
                                        onClick={() => setShowRantOfTheDayModal(true)}
                                    >
                                        <button
                                            onClick={e => { e.stopPropagation(); setRantOfTheDay(null); }}
                                            aria-label="Close Rant of the Day"
                                            className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        >
                                            <X className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
                                            <span className="sr-only">Close Rant of the Day</span>
                                        </button>
                                        <CardHeader>
                                            <div className="flex items-center space-x-2">
                                                <SmileySticker weight="duotone" className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Rant of the Day</h2>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-start space-x-3">
                                                <div className="text-2xl">{React.createElement(getMoodIcon(rantOfTheDay.mood), { weight: 'duotone', className: 'w-5 h-5' })}</div>
                                                <div className="flex-1">
                                                    <p className="text-gray-800 dark:text-gray-200 mb-2 line-clamp-3">{rantOfTheDay.content}</p>
                                                    {/* Removed likes and comments UI here */}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Dialog open={showRantOfTheDayModal} onOpenChange={setShowRantOfTheDayModal}>
                                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                                                    <SmileySticker weight="duotone" className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
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
                                                getMoodIcon={getMoodIcon}
                                                getMoodColor={getMoodColor}
                                                formatTimeAgo={formatTimeAgo}
                                                moods={MOODS}
                                                showSentiment={true}
                                                showModeration={true}
                                                comments={comments[rantOfTheDay.id] || []}
                                                showBookmark={true}
                                                showReport={true}
                                                showShare={true}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}

                            {/* Enhanced Search with Suggestions */}
                            <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                                        {/* Search */}
                                        <div className="relative w-full lg:w-2/3">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                            <Input
                                                placeholder="Search rants, tags, or users... (min 2 characters)"
                                                value={searchQuery}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                className="pl-10 border-gray-200 dark:border-gray-600 focus:border-purple-400 dark:focus:border-purple-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                            />
                                            {/* Search Suggestions */}
                                            {searchSuggestions.length > 0 && (
                                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md mt-1 shadow-lg">
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
                                        <div className="flex flex-row w-full gap-2 mb-2 sm:mb-0">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowFilters(!showFilters)}
                                                className="flex-1 flex items-center space-x-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 relative"
                                            >
                                                <Filter className="w-4 h-4" />
                                                <span>Filters</span>
                                                {/* Active filter count badge */}
                                                {(moodFilter || sortFilter !== 'latest' || followedTags.size > 0 || searchQuery.length > 0) && (
                                                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-600 text-white absolute -top-2 -right-2">
                                                        {[
                                                            moodFilter ? 1 : 0,
                                                            sortFilter !== 'latest' ? 1 : 0,
                                                            followedTags.size > 0 ? 1 : 0,
                                                            searchQuery.length > 0 ? 1 : 0
                                                        ].reduce((a, b) => a + b, 0)}
                                                    </span>
                                                )}
                                            </Button>
                                            {/* Clear filters button */}
                                            {(moodFilter || sortFilter !== 'latest' || followedTags.size > 0 || searchQuery.length > 0) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex-1 text-gray-500 dark:text-gray-300 hover:text-purple-600"
                                                    onClick={() => {
                                                        setMoodFilter("");
                                                        setSortFilter("latest");
                                                        setFollowedTags(new Set());
                                                        setSearchQuery("");
                                                    }}
                                                >
                                                    <Eraser className="w-4 h-4 mr-1" />
                                                    <span>Clear</span>
                                                </Button>
                                            )}
                                        </div>
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

                            {/* Masonry Grid, Virtualized List, or Swiper Rants Feed */}
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
                            ) : isVirtualized ? (
                                // Desktop: Use VirtualizedList for performance
                                <VirtualizedList
                                    height={800}
                                    itemCount={filteredRants.length}
                                    itemSize={340}
                                    width={"100%"}
                                    className="w-full overflow-x-auto"
                                >
                                    {({ index, style }: ListChildComponentProps) => (
                                        <div style={style} key={filteredRants[index].id}>
                                            <EnhancedRantCard
                                                rant={filteredRants[index]}
                                                onLike={likeRant}
                                                onBookmark={toggleBookmark}
                                                onReport={reportRant}
                                                onShare={shareRant}
                                                onBlockUser={blockUser}
                                                onFollowTag={followTag}
                                                onCommentPost={handleCommentPost}
                                                onCommentLike={handleCommentLike}
                                                isLiked={likedRants.has(filteredRants[index].id)}
                                                isBookmarked={bookmarkedRants.has(filteredRants[index].id)}
                                                isUserBlocked={blockedUsers.has(filteredRants[index].anonymous_id)}
                                                followedTags={followedTags}
                                                getMoodIcon={getMoodIcon}
                                                getMoodColor={getMoodColor}
                                                formatTimeAgo={formatTimeAgo}
                                                moods={MOODS}
                                                showSentiment={true}
                                                showModeration={true}
                                                comments={comments[filteredRants[index].id] || []}
                                                showBookmark={true}
                                                showReport={true}
                                                showShare={true}
                                            />
                                        </div>
                                    )}
                                </VirtualizedList>
                            ) : (
                                // Desktop: Use MasonryGrid for layout
                                <MasonryGrid columns={2} gap={20} className="w-full overflow-x-auto">
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
                                            getMoodIcon={getMoodIcon}
                                            getMoodColor={getMoodColor}
                                            formatTimeAgo={formatTimeAgo}
                                            moods={MOODS}
                                            showSentiment={true}
                                            showModeration={true}
                                            comments={comments[rant.id] || []}
                                            showBookmark={true}
                                            showReport={true}
                                            showShare={true}
                                        />
                                    ))}
                                </MasonryGrid>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="sticky top-24 self-start hidden lg:block">
                            <SidebarContent
                                userPoints={userPoints}
                                userLevel={userLevel}
                                nextLevelPoints={userLevel * 100}
                                followedTags={followedTags}
                                followTag={followTag}
                            />
                        </div>
                    </div>
                </div>

                {/* Floating Action Button for Mobile Sidebar */}
                <button
                    className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-purple-600 text-white shadow-lg md:hidden hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-20"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open Sidebar"
                >
                    <PanelLeft className="w-6 h-6" />
                    <span className="sr-only">Open Sidebar</span>
                </button>
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="right" className="w-80 max-w-full p-0">
                        <div className="p-4 overflow-y-auto pb-24">
                            <SidebarContent
                                userPoints={userPoints}
                                userLevel={userLevel}
                                nextLevelPoints={userLevel * 100}
                                followedTags={followedTags}
                                followTag={followTag}
                            />
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Bottom Navigation Bar for Mobile */}
                <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 md:hidden backdrop-blur shadow-lg">
                    <Link href="/trending" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/trending" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                        <SmileySticker weight="duotone" className="w-6 h-6 mb-1" />
                        <span className="text-xs">Trending</span>
                    </Link>
                    <Link href="/challenges" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/challenges" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                        <SmileySticker weight="duotone" className="w-6 h-6 mb-1" />
                        <span className="text-xs">Challenges</span>
                    </Link>
                    <Link href="/leaderboard" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/leaderboard" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                        <SmileySticker weight="duotone" className="w-6 h-6 mb-1" />
                        <span className="text-xs">Leaderboard</span>
                    </Link>
                    <Link href="/bookmarks" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/bookmarks" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                        <SmileySticker weight="duotone" className="w-6 h-6 mb-1" />
                        <span className="text-xs">Bookmarks</span>
                    </Link>
                </nav>

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
                            reported: false,
                            moderation_score: 1,
                        }

                        setRants((prev) => [newRant, ...prev])

                        // Add points for posting
                        addPoints(5, "post")
                        await checkAchievements("posts_created", rants.length + 1)

                        // Play post sound and mood sound
                        await audioService.playActionSound('post')
                        await audioService.playMoodSound(mood)

                        toast.success("Your rant has been posted! +5 points")
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                        })
                    }}
                />

                {/* Footer */}
                <footer className="fixed bottom-0 left-0 w-full z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t border-gray-200 dark:border-gray-700 mt-12 md:block hidden">
                    <div className="container mx-auto px-4 py-4 max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-500 dark:text-gray-400 text-sm items-center">
                            {/* Column 1: Branding */}
                            <div className="text-center md:text-left">
                                <p>Your thoughts matter. Share them freely.</p>
                            </div>
                            {/* Column 2: Navigation Links */}
                            <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6">
                                <Link href="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400">Privacy</Link>
                                <Link href="/terms-of-service" className="hover:text-purple-600 dark:hover:text-purple-400">Terms of Service</Link>
                                <Link href="/guidelines" className="hover:text-purple-600 dark:hover:text-purple-400">Guidelines</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </ErrorBoundary>
    )
}
