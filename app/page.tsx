"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
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
} from "@phosphor-icons/react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useAnalytics } from "@/hooks/use-analytics"

import { audioService } from "@/services/audio-service"

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

// Demo fallback: mockRants is only used if Supabase is not configured (local/dev only)
// const mockRants: Rant[] = [ ... ]

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
    // Remove mockRants as initial state for rants
    const [rants, setRants] = useState<Rant[]>([])
    // Remove filteredRants state, use hook instead
    const [comments, setComments] = useState<{ [key: string]: Comment[] }>(mockComments)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
    const [moodFilter, setMoodFilter] = useState("")
    const [sortFilter, setSortFilter] = useState("latest")
    const [likedRants, setLikedRants] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('likedRants')
            if (stored) return new Set(JSON.parse(stored))
        }
        return new Set()
    })
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
        loaded: settingsLoaded,
        feedLayout,
        defaultSort,
        keyboardShortcuts,
    } = useSettings()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showPersonalizationTip, setShowPersonalizationTip] = useState(false)
    const personalizationTipDismissed = useRef(false)

    const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

    // Show onboarding tip for personalization
    useEffect(() => {
        if (sortFilter === "recommended" && !localStorage.getItem("personalizationTipDismissed")) {
            setShowPersonalizationTip(true)
        }
    }, [sortFilter])

    const dismissPersonalizationTip = () => {
        setShowPersonalizationTip(false)
        personalizationTipDismissed.current = true
        localStorage.setItem("personalizationTipDismissed", "true")
    }

    const { theme, toggleTheme } = useTheme()
    const { userPoints, userLevel, addPoints, checkAchievements } = useGameification()
    const { fontSize, contrast, screenReaderMode, updateAccessibility } = useAccessibility()
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { trackEvent, trackPageView, trackUserAction } = useAnalytics()


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

    // Track filter changes
    useEffect(() => {
        if (moodFilter) {
            trackUserAction("filter_by_mood", {
                mood: moodFilter,
                resultsCount: rants.filter(r => r.mood === moodFilter).length
            })
        }
    }, [moodFilter])

    useEffect(() => {
        if (sortFilter && sortFilter !== "latest") {
            trackUserAction("change_sort", {
                sortType: sortFilter,
                previousSort: "latest" // Could track previous sort if needed
            })
        }
    }, [sortFilter])

    // Load settings from localStorage on mount
    useEffect(() => {
        // The useSettings hook already handles loading from localStorage
    }, [])

    // Set initial sortFilter to defaultSort
    useEffect(() => {
        setSortFilter(defaultSort)
    }, [defaultSort])

    // Enhanced comment posting function
    const handleCommentPost = async (rantId: string, content: string): Promise<Comment> => {
        // Content moderation check
        const moderationResult = await ContentModerationService.moderateContent(content)
        if (!moderationResult.isAppropriate) {
            if (notificationSettings.comments) toast.error(`Comment flagged: ${moderationResult.reason}`)
            throw new Error(`Comment flagged: ${moderationResult.reason}`)
        }
        // Only send valid fields
        const { error } = await supabase.from('comments').insert([
            {
                rant_id: rantId,
                content: content.trim(),
                created_at: new Date().toISOString(),
                anonymous_id: getAnonymousId(),
            }
        ])
        if (error) {
            toast.error('Failed to post comment.')
            throw new Error('Failed to post comment.')
        }
        await supabase.from('rants').update({ comments_count: (rants.find(r => r.id === rantId)?.comments_count || 0) + 1 }).eq('id', rantId)
        fetchRants()
        addPoints(2, "comment")
        checkAchievements("comments_posted", Object.values(comments).flat().length + 1)
        if (notificationSettings.comments) toast.success("Comment posted! +2 points")
        // Return a minimal comment object for UI
        return {
            id: '', // You may want to re-fetch comments to get the real ID
            rant_id: rantId,
            content: content.trim(),
            created_at: new Date().toISOString(),
            anonymous_id: getAnonymousId(),
            likes_count: 0,
        }
    }

    // --- Like logic for comments ---
    const handleCommentLike = async (commentId: string) => {
        // Find the rantId for this comment
        let rantId = null
        for (const [rid, commentList] of Object.entries(comments)) {
            if (commentList.some(c => c.id === commentId)) {
                rantId = rid
                break
            }
        }
        if (!rantId) return
        const comment = comments[rantId]?.find(c => c.id === commentId)
        const isLiked = likedComments.has(commentId)
        const newLikesCount = (comment?.likes_count || 0) + (isLiked ? -1 : 1)
        // Optimistically update UI
        setComments(prev => {
            const updated = { ...prev }
            if (updated[rantId]) {
                updated[rantId] = updated[rantId].map(c =>
                    c.id === commentId ? { ...c, likes_count: newLikesCount } : c
                )
            }
            return updated
        })
        // Update likes_count in Supabase
        const { error } = await supabase.from('comments').update({
            likes_count: newLikesCount
        }).eq('id', commentId)
        if (error) {
            toast.error(isLiked ? 'Failed to unlike comment.' : 'Failed to like comment.')
            return
        }
        setLikedComments(prev => {
            const newSet = new Set(prev)
            if (isLiked) {
                newSet.delete(commentId)
            } else {
                newSet.add(commentId)
            }
            return newSet
        })
        toast.success(isLiked ? 'Comment unliked.' : 'Comment liked!')
    }

    // Advanced search with suggestions
    const handleSearchChange = (query: string) => {
        setSearchQuery(query)

        // Track search analytics
        if (query.length >= 2) {
            trackUserAction("search", {
                query: query.toLowerCase(),
                queryLength: query.length,
                resultsCount: rants.filter(r =>
                    r.content.toLowerCase().includes(query.toLowerCase()) ||
                    r.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                ).length
            })

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

    // Update fetchRants to only use mockRants if Supabase is not configured
    const fetchRants = async () => {
        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                // Demo mode: use mock data
                // Only use mockRants in local/dev fallback
                // setRants(mockRants.map(normalizeRant))
                setRants([]) // Empty array for production safety
                setLoading(false)
                return
            }
            // Always use Supabase in production
            const { data, error } = await supabase
                .from("rants")
                .select("id, content, mood, likes_count, comments_count, anonymous_id, created_at, tags")
                .order("created_at", { ascending: false })
            // console.log("Supabase rants data:", data)
            if (error) throw error
            const safeData = (data || []).map(normalizeRant)
            // console.log("Normalized rants:", safeData)
            setRants(safeData)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching rants:", error)
            toast.error("Failed to load rants from server.")
            setRants([])
            setLoading(false)
        }
    }

    // --- Fetch comments for each rant from Supabase ---
    const fetchCommentsForRants = async (rantIds: string[]) => {
        if (!rantIds.length) return {}
        const { data, error } = await supabase
            .from('comments')
            .select('id, rant_id, content, created_at, anonymous_id, likes_count')
            .in('rant_id', rantIds)
        if (error) {
            console.error('Error fetching comments:', error)
            return {}
        }
        // Group comments by rant_id
        const grouped: { [key: string]: Comment[] } = {}
        for (const comment of data || []) {
            if (!grouped[comment.rant_id]) grouped[comment.rant_id] = []
            grouped[comment.rant_id].push(comment)
        }
        return grouped
    }

    // --- Robust real-time listeners for rants and comments ---
    useEffect(() => {
        // Listen for rants changes
        const rantsChannel = supabase
            .channel('public:rants')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rants' }, payload => {
                if (payload.eventType === 'INSERT') {
                    setRants(prev => [normalizeRant(payload.new), ...prev])
                } else if (payload.eventType === 'UPDATE') {
                    setRants(prev => prev.map(r => r.id === payload.new.id ? normalizeRant(payload.new) : r))
                } else if (payload.eventType === 'DELETE') {
                    setRants(prev => prev.filter(r => r.id !== payload.old.id))
                }
            })
            .subscribe()
        // Listen for comments changes
        const commentsChannel = supabase
            .channel('public:comments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, payload => {
                const rantId = payload.new?.rant_id || payload.old?.rant_id
                if (!rantId) return
                setComments(prev => {
                    const updated = { ...prev }
                    if (payload.eventType === 'INSERT') {
                        updated[rantId] = [payload.new, ...(updated[rantId] || [])]
                    } else if (payload.eventType === 'UPDATE') {
                        updated[rantId] = (updated[rantId] || []).map(c => c.id === payload.new.id ? payload.new : c)
                    } else if (payload.eventType === 'DELETE') {
                        updated[rantId] = (updated[rantId] || []).filter(c => c.id !== payload.old.id)
                    }
                    return updated
                })
            })
            .subscribe()
        return () => {
            supabase.removeChannel(rantsChannel)
            supabase.removeChannel(commentsChannel)
        }
    }, [])

    // --- Fetch comments when rants change ---
    useEffect(() => {
        fetchCommentsForRants(rants.map(r => r.id)).then(setComments)
    }, [rants])

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
        const rant = rants.find(r => r.id === rantId)
        const isLiked = likedRants.has(rantId)
        const newLikesCount = (rant?.likes_count || 0) + (isLiked ? -1 : 1)
        try {
            const { error } = await supabase.from('rants').update({ likes_count: newLikesCount }).eq('id', rantId)
            if (error) {
                toast.error(isLiked ? 'Failed to unlike rant.' : 'Failed to like rant.')
                return
            }
            setLikedRants((prev) => {
                const newSet = new Set(prev)
                if (isLiked) {
                    newSet.delete(rantId)
                } else {
                    newSet.add(rantId)
                }
                localStorage.setItem('likedRants', JSON.stringify(Array.from(newSet)))
                return newSet
            })
            fetchRants()
            if (!isLiked) {
                // Track analytics for like action
                await trackUserAction("like_rant", {
                    rantId,
                    rantMood: rant?.mood,
                    rantTags: rant?.tags,
                    rantAge: rant ? Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)) : null, // hours
                    previousLikesCount: rant?.likes_count || 0,
                    userTotalLikes: likedRants.size + 1
                })
                addPoints(1, "like")
                await checkAchievements("likes_given", likedRants.size + 1)
                await audioService.playActionSound('like')
                toast.success("Rant liked! +1 point")
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 },
                })
            } else {
                toast.info("Rant unliked.")
            }
        } catch (error) {
            console.error("Error toggling rant like:", error)
        }
    }

    const handleCommentLike = async (commentId: string) => {
        // Find the rantId for this comment
        let rantId = null
        for (const [rid, commentList] of Object.entries(comments)) {
            if (commentList.some(c => c.id === commentId)) {
                rantId = rid
                break
            }
        }
        if (!rantId) return
        const comment = comments[rantId]?.find(c => c.id === commentId)
        const isLiked = likedComments.has(commentId)
        const newLikesCount = (comment?.likes_count || 0) + (isLiked ? -1 : 1)
        // Optimistically update UI
        setComments(prev => {
            const updated = { ...prev }
            if (updated[rantId]) {
                updated[rantId] = updated[rantId].map(c =>
                    c.id === commentId ? { ...c, likes_count: newLikesCount } : c
                )
            }
            return updated
        })
        // Update likes_count in Supabase
        const { error } = await supabase.from('comments').update({
            likes_count: newLikesCount
        }).eq('id', commentId)
        if (error) {
            toast.error(isLiked ? 'Failed to unlike comment.' : 'Failed to like comment.')
            return
        }
        setLikedComments(prev => {
            const newSet = new Set(prev)
            if (isLiked) {
                newSet.delete(commentId)
            } else {
                newSet.add(commentId)
            }
            return newSet
        })
        toast.success(isLiked ? 'Comment unliked.' : 'Comment liked!')
    }

    // Advanced search with suggestions
    const handleSearchChange = (query: string) => {
        setSearchQuery(query)

        // Track search analytics
        if (query.length >= 2) {
            trackUserAction("search", {
                query: query.toLowerCase(),
                queryLength: query.length,
                resultsCount: rants.filter(r =>
                    r.content.toLowerCase().includes(query.toLowerCase()) ||
                    r.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                ).length
            })

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

    // Update fetchRants to only use mockRants if Supabase is not configured
    const fetchRants = async () => {
        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                // Demo mode: use mock data
                // Only use mockRants in local/dev fallback
                // setRants(mockRants.map(normalizeRant))
                setRants([]) // Empty array for production safety
                setLoading(false)
                return
            }
            // Always use Supabase in production
            const { data, error } = await supabase
                .from("rants")
                .select("id, content, mood, likes_count, comments_count, anonymous_id, created_at, tags")
                .order("created_at", { ascending: false })
            // console.log("Supabase rants data:", data)
            if (error) throw error
            const safeData = (data || []).map(normalizeRant)
            // console.log("Normalized rants:", safeData)
            setRants(safeData)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching rants:", error)
            toast.error("Failed to load rants from server.")
            setRants([])
            setLoading(false)
        }
    }

    // --- Fetch comments for each rant from Supabase ---
    const fetchCommentsForRants = async (rantIds: string[]) => {
        if (!rantIds.length) return {}
        const { data, error } = await supabase
            .from('comments')
            .select('id, rant_id, content, created_at, anonymous_id, likes_count')
            .in('rant_id', rantIds)
        if (error) {
            console.error('Error fetching comments:', error)
            return {}
        }
        // Group comments by rant_id
        const grouped: { [key: string]: Comment[] } = {}
        for (const comment of data || []) {
            if (!grouped[comment.rant_id]) grouped[comment.rant_id] = []
            grouped[comment.rant_id].push(comment)
        }
        return grouped
    }

    // --- Robust real-time listeners for rants and comments ---
    useEffect(() => {
        // Listen for rants changes
        const rantsChannel = supabase
            .channel('public:rants')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rants' }, payload => {
                if (payload.eventType === 'INSERT') {
                    setRants(prev => [normalizeRant(payload.new), ...prev])
                } else if (payload.eventType === 'UPDATE') {
                    setRants(prev => prev.map(r => r.id === payload.new.id ? normalizeRant(payload.new) : r))
                } else if (payload.eventType === 'DELETE') {
                    setRants(prev => prev.filter(r => r.id !== payload.old.id))
                }
            })
            .subscribe()
        // Listen for comments changes
        const commentsChannel = supabase
            .channel('public:comments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, payload => {
                const rantId = payload.new?.rant_id || payload.old?.rant_id
                if (!rantId) return
                setComments(prev => {
                    const updated = { ...prev }
                    if (payload.eventType === 'INSERT') {
                        updated[rantId] = [payload.new, ...(updated[rantId] || [])]
                    } else if (payload.eventType === 'UPDATE') {
                        updated[rantId] = (updated[rantId] || []).map(c => c.id === payload.new.id ? payload.new : c)
                    } else if (payload.eventType === 'DELETE') {
                        updated[rantId] = (updated[rantId] || []).filter(c => c.id !== payload.old.id)
                    }
                    return updated
                })
            })
            .subscribe()
        return () => {
            supabase.removeChannel(rantsChannel)
            supabase.removeChannel(commentsChannel)
        }
    }, [])

    // --- Fetch comments when rants change ---
    useEffect(() => {
        fetchCommentsForRants(rants.map(r => r.id)).then(setComments)
    }, [rants])

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
        const rant = rants.find(r => r.id === rantId)
        const isLiked = likedRants.has(rantId)
        const newLikesCount = (rant?.likes_count || 0) + (isLiked ? -1 : 1)
        try {
            const { error } = await supabase.from('rants').update({ likes_count: newLikesCount }).eq('id', rantId)
            if (error) {
                toast.error(isLiked ? 'Failed to unlike rant.' : 'Failed to like rant.')
                return
            }
            setLikedRants((prev) => {
                const newSet = new Set(prev)
                if (isLiked) {
                    newSet.delete(rantId)
                } else {
                    newSet.add(rantId)
                }
                localStorage.setItem('likedRants', JSON.stringify(Array.from(newSet)))
                return newSet
            })
            fetchRants()
            if (!isLiked) {
                // Track analytics for like action
                await trackUserAction("like_rant", {
                    rantId,
                    rantMood: rant?.mood,
                    rantTags: rant?.tags,
                    rantAge: rant ? Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)) : null, // hours
                    previousLikesCount: rant?.likes_count || 0,
                    userTotalLikes: likedRants.size + 1
                })
                addPoints(1, "like")
                await checkAchievements("likes_given", likedRants.size + 1)
                await audioService.playActionSound('like')
                toast.success("Rant liked! +1 point")
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 },
                })
            } else {
                toast.info("Rant unliked.")
            }
        } catch (error) {
            console.error("Error toggling rant like:", error)
        }
    }

    const handleCommentLike = async (commentId: string) => {
        // Find the rantId for this comment
        let rantId = null
        for (const [rid, commentList] of Object.entries(comments)) {
            if (commentList.some(c => c.id === commentId)) {
                rantId = rid
                break
            }
        }
        if (!rantId) return
        const comment = comments[rantId]?.find(c => c.id === commentId)
        const isLiked = likedComments.has(commentId)
        const newLikesCount = (comment?.likes_count || 0) + (isLiked ? -1 : 1)
        // Optimistically update UI
        setComments(prev => {
            const updated = { ...prev }
            if (updated[rantId]) {
                updated[rantId] = updated[rantId].map(c =>
                    c.id === commentId ? { ...c, likes_count: newLikesCount } : c
                )
            }
            return updated
        })
        // Update likes_count in Supabase
        const { error } = await supabase.from('comments').update({
            likes_count: newLikesCount
        }).eq('id', commentId)
        if (error) {
            toast.error(isLiked ? 'Failed to unlike comment.' : 'Failed to like comment.')
            return
        }
        setLikedComments(prev => {
            const newSet = new Set(prev)
            if (isLiked) {
                newSet.delete(commentId)
            } else {
                newSet.add(commentId)
            }
            return newSet
        })
        toast.success(isLiked ? 'Comment unliked.' : 'Comment liked!')
    }

    // Advanced search with suggestions
    const handleSearchChange = (query: string) => {
        setSearchQuery(query)

        // Track search analytics
        if (query.length >= 2) {
            trackUserAction("search", {
                query: query.toLowerCase(),
                queryLength: query.length,
                resultsCount: rants.filter(r =>
                    r.content.toLowerCase().includes(query.toLowerCase()) ||
                    r.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                ).length
            })

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

    // Update fetchRants to only use mockRants if Supabase is not configured
    const fetchRants = async () => {
        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                // Demo mode: use mock data
                // Only use mockRants in local/dev fallback
                // setRants(mockRants.map(normalizeRant))
                setRants([]) // Empty array for production safety
                setLoading(false)
                return
            }
            // Always use Supabase in production
            const { data, error } = await supabase
                .from("rants")
                .select("id, content, mood, likes_count, comments_count, anonymous_id, created_at, tags")
                .order("created_at", { ascending: false })
            // console.log("Supabase rants data:", data)
            if (error) throw error
            const safeData = (data || []).map(normalizeRant)
            // console.log("Normalized rants:", safeData)
            setRants(safeData)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching rants:", error)
            toast.error("Failed to load rants from server.")
            setRants([])
            setLoading(false)
        }
    }

    // --- Fetch comments for each rant from Supabase ---
    const fetchCommentsForRants = async (rantIds: string[]) => {
        if (!rantIds.length) return {}
        const { data, error } = await supabase
            .from('comments')
            .select('id, rant_id, content, created_at, anonymous_id, likes_count')
            .in('rant_id', rantIds)
        if (error) {
            console.error('Error fetching comments:', error)
            return {}
        }
        // Group comments by rant_id
        const grouped: { [key: string]: Comment[] } = {}
        for (const comment of data || []) {
            if (!grouped[comment.rant_id]) grouped[comment.rant_id] = []
            grouped[comment.rant_id].push(comment)
        }
        return grouped
    }

    // --- Robust real-time listeners for rants and comments ---
    useEffect(() => {
        // Listen for rants changes
        const rantsChannel = supabase
            .channel('public:rants')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rants' }, payload => {
                if (payload.eventType === 'INSERT') {
                    setRants(prev => [normalizeRant(payload.new), ...prev])
                } else if (payload.eventType === 'UPDATE') {
                    setRants(prev => prev.map(r => r.id === payload.new.id ? normalizeRant(payload.new) : r))
                } else if (payload.eventType === 'DELETE') {
                    setRants(prev => prev.filter(r => r.id !== payload.old.id))
                }
            })
            .subscribe()
        // Listen for comments changes
        const commentsChannel = supabase
            .channel('public:comments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, payload => {
                const rantId = payload.new?.rant_id || payload.old?.rant_id
                if (!rantId) return
                setComments(prev => {
                    const updated = { ...prev }
                    if (payload.eventType === 'INSERT') {
                        updated[rantId] = [payload.new, ...(updated[rantId] || [])]
                    } else if (payload.eventType === 'UPDATE') {
                        updated[rantId] = (updated[rantId] || []).map(c => c.id === payload.new.id ? payload.new : c)
                    } else if (payload.eventType === 'DELETE') {
                        updated[rantId] = (updated[rantId] || []).filter(c => c.id !== payload.old.id)
                    }
                    return updated
                })
            })
            .subscribe()
        return () => {
            supabase.removeChannel(rantsChannel)
            supabase.removeChannel(commentsChannel)
        }
    }, [])

    // --- Fetch comments when rants change ---
    useEffect(() => {
        fetchCommentsForRants(rants.map(r => r.id)).then(setComments)
    }, [rants])

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
        const rant = rants.find(r => r.id === rantId)
        const isLiked = likedRants.has(rantId)
        const newLikesCount = (rant?.likes_count || 0) + (isLiked ? -1 : 1)
        try {
            const { error } = await supabase.from('rants').update({ likes_count: newLikesCount }).eq('id', rantId)
            if (error) {
                toast.error(isLiked ? 'Failed to unlike rant.' : 'Failed to like rant.')
                return
            }
            setLikedRants((prev) => {
                const newSet = new Set(prev)
                if (isLiked) {
                    newSet.delete(rantId)
                } else {
                    newSet.add(rantId)
                }
                localStorage.setItem('likedRants', JSON.stringify(Array.from(newSet)))
                return newSet
            })
            fetchRants()
            if (!isLiked) {
                // Track analytics for like action
                await trackUserAction("like_rant", {
                    rantId,
                    rantMood: rant?.mood,
                    rantTags: rant?.tags,
                    rantAge: rant ? Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)) : null, // hours
                    previousLikesCount: rant?.likes_count || 0,
                    userTotalLikes: likedRants.size + 1
                })
                addPoints(1, "like")
                await checkAchievements("likes_given", likedRants.size + 1)
                await audioService.playActionSound('like')
                toast.success("Rant liked! +1 point")
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 },
                })
            } else {
                toast.info("Rant unliked.")
            }
        } catch (error) {
            console.error("Error toggling rant like:", error)
        }
    }

    const handleCommentLike = async (commentId: string) => {
        // Find the rantId for this comment
        let rantId = null
        for (const [rid, commentList] of Object.entries(comments)) {
            if (commentList.some(c => c.id === commentId)) {
                rantId = rid
                break
            }
        }
        if (!rantId) return
        const comment = comments[rantId]?.find(c => c.id === commentId)
        const isLiked = likedComments.has(commentId)
        const newLikesCount = (comment?.likes_count || 0) + (isLiked ? -1 : 1)
        // Optimistically update UI
        setComments(prev => {
            const updated = { ...prev }
            if (updated[rantId]) {
                updated[rantId] = updated[rantId].map(c =>
                    c.id === commentId ? { ...c, likes_count: newLikesCount } : c
                )
            }
            return updated
        })
        // Update likes_count in Supabase
        const { error } = await supabase.from('comments').update({
            likes_count: newLikesCount
        }).eq('id', commentId)
        if (error) {
            toast.error(isLiked ? 'Failed to unlike comment.' : 'Failed to like comment.')
            return
        }
        setLikedComments(prev => {
            const newSet = new Set(prev)
            if (isLiked) {
                newSet.delete(commentId)
            } else {
                newSet.add(commentId)
            }
            return newSet
        })
        toast.success(isLiked ? 'Comment unliked.' : 'Comment liked!')
    }

    // Advanced search with suggestions
    const handleSearchChange = (query: string) => {
        setSearchQuery(query)

        // Track search analytics
        if (query.length >= 2) {
            trackUserAction("search", {
                query: query.toLowerCase(),
                queryLength: query.length,
                resultsCount: rants.filter(r =>
                    r.content.toLowerCase().includes(query.toLowerCase()) ||
                    r.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                ).length
            })

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

    // Update fetchRants to only use mockRants if Supabase is not configured
    const fetchRants = async () => {
        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                // Demo mode: use mock data
                // Only use mockRants in local/dev fallback
                // setRants(mockRants.map(normalizeRant))
                setRants([]) // Empty array for production safety
                setLoading(false)
                return
            }
            // Always use Supabase in production
            const { data, error } = await supabase
                .from("rants")
                .select("id, content, mood, likes_count, comments_count, anonymous_id, created_at, tags")
                .order("created_at", { ascending: false })
            // console.log("Supabase rants data:", data)
            if (error) throw error
            const safeData = (data || []).map(normalizeRant)
            // console.log("Normalized rants:", safeData)
            setRants(safeData)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching rants:", error)
            toast.error("Failed to load rants from server.")
            setRants([])
            setLoading(false)
        }
    }

    // --- Fetch comments for each rant from Supabase ---
    const fetchCommentsForRants = async (rantIds: string[]) => {
        if (!rantIds.length) return {}
        const { data, error } = await supabase
            .from('comments')
            .select('id, rant_id, content, created_at, anonymous_id, likes_count')
            .in('rant_id', rantIds)
        if (error) {
            console.error('Error fetching comments:', error)
            return {}
        }
        // Group comments by rant_id
        const grouped: { [key: string]: Comment[] } = {}
        for (const comment of data || []) {
            if (!grouped[comment.rant_id]) grouped[comment.rant_id] = []
            grouped[comment.rant_id].push(comment)
        }
        return grouped
    }

    // --- Robust real-time listeners for rants and comments ---
    useEffect(() => {
        // Listen for rants changes
        const rantsChannel = supabase
            .channel('public:rants')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rants' }, payload => {
                if (payload.eventType === 'INSERT') {
                    setRants(prev => [normalizeRant(payload.new), ...prev])
                } else if (payload.eventType === 'UPDATE') {
                    setRants(prev => prev.map(r => r.id === payload.new.id ? normalizeRant(payload.new) : r))
                } else if (payload.eventType === 'DELETE') {
                    setRants(prev => prev.filter(r => r.id !== payload.old.id))
                }
            })
            .subscribe()
        // Listen for comments changes
        const commentsChannel = supabase
            .channel('public:comments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, payload => {
                const rantId = payload.new?.rant_id || payload.old?.rant_id
                if (!rantId) return
                setComments(prev => {
                    const updated = { ...prev }
                    if (payload.eventType === 'INSERT') {
                        updated[rantId] = [payload.new, ...(updated[rantId] || [])]
                    } else if (payload.eventType === 'UPDATE') {
                        updated[rantId] = (updated[rantId] || []).map(c => c.id === payload.new.id ? payload.new : c)
                    } else if (payload.eventType === 'DELETE') {
                        updated[rantId] = (updated[rantId] || []).filter(c => c.id !== payload.old.id)
                    }
                    return updated
                })
            })
            .subscribe()
        return () => {
            supabase.removeChannel(rantsChannel)
            supabase.removeChannel(commentsChannel)
        }
    }, [])

    // --- Fetch comments when rants change ---
    useEffect(() => {
        fetchCommentsForRants(rants.map(r => r.id)).then(setComments)
    }, [rants])

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
        const rant = rants.find(r => r.id === rantId)
        const isLiked = likedRants.has(rantId)
        const newLikesCount = (rant?.likes_count || 0) + (isLiked ? -1 : 1)
        try {
            const { error } = await supabase.from('rants').update({ likes_count: newLikesCount }).eq('id', rantId)
            if (error) {
                toast.error(isLiked ? 'Failed to unlike rant.' : 'Failed to like rant.')
                return
            }
            setLikedRants((prev) => {
                const newSet = new Set(prev)
                if (isLiked) {
                    newSet.delete(rantId)
                } else {
                    newSet.add(rantId)
                }
                localStorage.setItem('likedRants', JSON.stringify(Array.from(newSet)))
                return newSet
            })
            fetchRants()
            if (!isLiked) {
                // Track analytics for like action
                await trackUserAction("like_rant", {
                    rantId,
                    rantMood: rant?.mood,
                    rantTags: rant?.tags,
                    rantAge: rant ? Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)) : null, // hours
                    previousLikesCount: rant?.likes_count || 0,
                    userTotalLikes: likedRants.size + 1
                })
                addPoints(1, "like")
                await checkAchievements("likes_given", likedRants.size + 1)
                await audioService.playActionSound('like')
                toast.success("Rant liked! +1 point")
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 },
                })
            } else {
                toast.info("Rant unliked.")
            }
        } catch (error) {
            console.error("Error toggling rant like:", error)
        }
    }

    const handleCommentLike = async (commentId: string) => {
        // Find the rantId for this comment
        let rantId = null
        for (const [rid, commentList] of Object.entries(comments)) {
            if (commentList.some(c => c.id === commentId)) {
                rantId = rid
                break
            }
        }
        if (!rantId) return
        const comment = comments[rantId]?.find(c => c.id === commentId)
        const isLiked = likedComments.has(commentId)
        const newLikesCount = (comment?.likes_count || 0) + (isLiked ? -1 : 1)
        // Optimistically update UI
        setComments(prev => {
            const updated = { ...prev }
            if (updated[rantId]) {
                updated[rantId] = updated[rantId].map(c =>
                    c.id === commentId ? { ...c, likes_count: newLikesCount } : c
                )
            }
            return updated
        })
        // Update likes_count in Supabase
        const { error } = await supabase.from('comments').update({
            likes_count: newLikesCount
        }).eq('id', commentId)
        if (error) {
            toast.error(isLiked ? 'Failed to unlike comment.' : 'Failed to like comment.')
            return
        }
        setLikedComments(prev => {
            const newSet = new Set(prev)
            if (isLiked) {
                newSet.delete(commentId)
            } else {
                newSet.add(commentId)
            }
            return newSet
        })
        toast.success(isLiked ? 'Comment unliked.' : 'Comment liked!')
    }

    // Advanced search with suggestions
    const handleSearchChange = (query: string) => {
        setSearchQuery(query)

        // Track search analytics
        if (query.length >= 2) {
            trackUserAction("search", {
                query: query.toLowerCase(),
                queryLength: query.length,
                resultsCount: rants.filter(r =>
                    r.content.toLowerCase().includes(query.toLowerCase()) ||
                    r.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                ).length
            })

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

    // Update fetchRants to only use mockRants if Supabase is not configured
    const fetchRants = async () => {
        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                // Demo mode: use mock data
                // Only use mockRants in local/dev fallback
                // setRants(mockRants.map(normalizeRant))
                setRants([]) // Empty array for production safety
                setLoading(false)
                return
            }
            // Always use Supabase in production
            const { data, error } = await supabase
                .from("rants")
                .select("id, content, mood, likes_count, comments_count, anonymous_id, created_at, tags")
                .order("created_at", { ascending: false })
            // console.log("Supabase rants data:", data)
            if (error) throw error
            const safeData = (data || []).map(normalizeRant)
            // console.log("Normalized rants:", safeData)
            setRants(safeData)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching rants:", error)
            toast.error("Failed to load rants from server.")
            setRants([])
            setLoading(false)
        }
    }

    // --- Fetch comments for each rant from Supabase ---
    const fetchCommentsForRants = async (rantIds: string[]) => {
        if (!rantIds.length) return {}
        const { data, error } = await supabase
            .from('comments')
            .select('id, rant_id, content, created_at, anonymous_id, likes_count')
            .in('rant_id', rantIds)
        if (error) {
            console.error('Error fetching comments:', error)
            return {}
        }
        // Group comments by rant_id
        const grouped: { [key: string]: Comment[] } = {}
        for (const comment of data || []) {
            if (!grouped[comment.rant_id]) grouped[comment.rant_id] = []
            grouped[comment.rant_id].push(comment)
        }
        return grouped
    }

    // --- Robust real-time listeners for rants and comments ---
    useEffect(() => {
        // Listen for rants changes
        const rantsChannel = supabase
            .channel('public:rants')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rants' }, payload => {
                if (payload.eventType === 'INSERT') {
                    setRants(prev => [normalizeRant(payload.new), ...prev])
                } else if (payload.eventType === 'UPDATE') {
                    setRants(prev => prev.map(r => r.id === payload.new.id ? normalizeRant(payload.new) : r))
                } else if (payload.eventType === 'DELETE') {
                    setRants(prev => prev.filter(r => r.id !== payload.old.id))
                }
            })
            .subscribe()
        // Listen for comments changes
        const commentsChannel = supabase
            .channel('public:comments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, payload => {
                const rantId = payload.new?.rant_id || payload.old?.rant_id
                if (!rantId) return
                setComments(prev => {
                    const updated = { ...prev }
                    if (payload.eventType === 'INSERT') {
                        updated[rantId] = [payload.new, ...(updated[rantId] || [])]
                    } else if (payload.eventType === 'UPDATE') {
                        updated[rantId] = (updated[rantId] || []).map(c => c.id === payload.new.id ? payload.new : c)
                    } else if (payload.eventType === 'DELETE') {
                        updated[rantId] = (updated[rantId] || []).filter(c => c.id !== payload.old.id)
                    }
                    return updated
                })
            })
            .subscribe()
        return () => {
            supabase.removeChannel(rantsChannel)
            supabase.removeChannel(commentsChannel)
        }
    }, [])

    // --- Fetch comments when rants change ---
    useEffect(() => {
        fetchCommentsForRants(rants.map(r => r.id)).then(setComments)
    }, [rants])

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
        const rant = rants.find(r => r.id === rantId)
        const isLiked = likedRants.has(rantId)
        const newLikesCount = (rant?.likes_count || 0) + (isLiked ? -1 : 1)
        try {
            const { error } = await supabase.from('rants').update({ likes_count: newLikesCount }).eq('id', rantId)
            if (error) {
                toast.error(isLiked ? 'Failed to unlike rant.' : 'Failed to like rant.')
                return
            }
            setLikedRants((prev) => {
                const newSet = new Set(prev)
                if (isLiked) {
                    newSet.delete(rantId)
                } else {
                    newSet.add(rantId)
                }
                localStorage.setItem('likedRants', JSON.stringify(Array.from(newSet)))
                return newSet
            })
            fetchRants()
            if (!isLiked) {
                // Track analytics for like action
                await trackUserAction("like_rant", {
                    rantId,
                    rantMood: rant?.mood,
                    rantTags: rant?.tags,
                    rantAge: rant ? Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)) : null, // hours
                    previousLikesCount: rant?.likes_count || 0,
                    userTotalLikes: likedRants.size + 1
                })
                addPoints(1, "like")
                await checkAchievements("likes_given", likedRants.size + 1)
                await audioService.playActionSound('like')
                toast.success("Rant liked! +1 point")
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 },
                })
            } else {
                toast.info("Rant unliked.")
            }
        } catch (error) {
            console.error("Error toggling rant like:", error)
        }
    }

    const handleCommentLike = async (commentId: string) => {
        // Find the rantId for this comment
        let rantId = null
        for (const [rid, commentList] of Object.entries(comments)) {
            if (commentList.some(c => c.id === commentId)) {
                rantId = rid
                break
            }
        }
        if (!rantId) return
        const comment = comments[rantId]?.find(c => c.id === commentId)
        const isLiked = likedComments.has(commentId)
        const newLikesCount = (comment?.likes_count || 0) + (isLiked ? -1 : 1)
        // Optimistically update UI
        setComments(prev => {
            const updated = { ...prev }
            if (updated[rantId]) {
                updated[rantId] = updated[rantId].map(c =>
                    c.id === commentId ? { ...c, likes_count: newLikesCount } : c
                )
            }
            return updated
        })
        // Update likes_count in Supabase
        const { error } = await supabase.from('comments').update({
            likes_count: newLikesCount
        }).eq('id', commentId)
        if (error) {
            toast.error(isLiked ? 'Failed to unlike comment.' : 'Failed to like comment.')
            return
        }
        setLikedComments(prev => {
            const newSet = new Set(prev)
            if (isLiked) {
                newSet.delete(commentId)
            } else {
                newSet.add(commentId)
            }
            return newSet
        })
        toast.success(isLiked ? 'Comment unliked.' : 'Comment liked!')
    }

    // Advanced search with suggestions
    const handleSearchChange = (query: string) => {
        setSearchQuery(query)

        // Track search analytics
        if (query.length >= 2) {
            trackUserAction("search", {
                query: query.toLowerCase(),
                queryLength: query.length,
                resultsCount: rants.filter(r =>
                    r.content.toLowerCase().includes(query.toLowerCase()) ||
                    r.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                ).length
            })

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

    // Update fetchRants to only use mockRants if Supabase is not configured
    const fetchRants = async () => {
        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                // Demo mode: use mock data
                // Only use mockRants in local/dev fallback
                // setRants(mockRants.map(normalizeRant))
                setRants([]) // Empty array for production safety
                setLoading(false)
                return
            }
            // Always use Supabase in production
            const { data, error } = await supabase
                .from("rants")
                .select("id, content, mood, likes_count, comments_count, anonymous_id, created_at, tags")
                .order("created_at", { ascending: false })
            // console.log("Supabase rants data:", data)
            if (error) throw error
            const safeData = (data || []).map(normalizeRant)
            // console.log("Normalized rants:", safeData)
            setRants(safeData)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching rants:", error)
            toast.error("Failed to load rants from server.")
            setRants([])
            setLoading(false)
        }
    }

    // --- Fetch comments for each rant from Supabase ---
    const fetchCommentsForRants = async (rantIds: string[]) => {
        if (!rantIds.length) return {}
        const { data, error } = await supabase
            .from('comments')
            .select('id, rant_id, content, created_at, anonymous_id, likes_count')
            .in('rant_id', rantIds)
        if (error) {
            console.error('Error fetching comments:', error)
            return {}
        }
        // Group comments by rant_id
        const grouped: { [key: string]: Comment[] } = {}
        for (const comment of data || []) {
            if (!grouped[comment.rant_id]) grouped[comment.rant_id] = []
            grouped[comment.rant_id].push(comment)
        }
        return grouped
    }

    // --- Robust real-time listeners for rants and comments ---
    useEffect(() => {
        // Listen for rants changes
        const rantsChannel = supabase
            .channel('public:rants')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rants' }, payload => {
                if (payload.eventType === 'INSERT') {
                    setRants(prev => [normalizeRant(payload.new), ...prev])
                } else if (payload.eventType === 'UPDATE') {
                    setRants(prev => prev.map(r => r.id === payload.new.id ? normalizeRant(payload.new) : r))
                } else if (payload.eventType === 'DELETE') {
                    setRants(prev => prev.filter(r => r.id !== payload.old.id))
                }
            })
            .subscribe()
        // Listen for comments changes
        const commentsChannel = supabase
            .channel('public:comments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, payload => {
                const rantId = payload.new?.rant_id || payload.old?.rant_id
                if (!rantId) return
                setComments(prev => {
                    const updated = { ...prev }
                    if (payload.eventType === 'INSERT') {
                        updated[rantId] = [payload.new, ...(updated[rantId] || [])]
                    } else if (payload.eventType === 'UPDATE') {
                        updated[rantId] = (updated[rantId] || []).map(c => c.id === payload.new.id ? payload.new : c)
                    } else if (payload.eventType === 'DELETE') {
                        updated[rantId] = (updated[rantId] || []).filter(c => c.id !== payload.old.id)
                    }
                    return updated
                })
            })
            .subscribe()
        return () => {
            supabase.removeChannel(rantsChannel)
            supabase.removeChannel(commentsChannel)
        }
    }, [])

    // --- Fetch comments when rants change ---
    useEffect(() => {
        fetchCommentsForRants(rants.map(r => r.id)).then(setComments)
    }, [rants])

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
        const rant = rants.find(r => r.id === rantId)
        const isLiked = likedRants.has(rantId)
        const newLikesCount = (rant?.likes_count || 0) + (isLiked ? -1 : 1)
        try {
            const { error } = await supabase.from('rants').update({ likes_count: newLikesCount }).eq('id', rantId)
            if (error) {
                toast.error(isLiked ? 'Failed to unlike rant.' : 'Failed to like rant.')
                return
            }
            setLikedRants((prev) => {
                const newSet = new Set(prev)
                if (isLiked) {
                    newSet.delete(rantId)
                } else {
                    newSet.add(rantId)
                }
                localStorage.setItem('likedRants', JSON.stringify(Array.from(newSet)))
                return newSet
            })
            fetchRants()
            if (!isLiked) {
                // Track analytics for like action
                await trackUserAction("like_rant", {
                    rantId,
                    rantMood: rant?.mood,
                    rantTags: rant?.tags,
                    rantAge: rant ? Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)) : null, // hours
                    previousLikesCount: rant?.likes_count || 0,
                    userTotalLikes: likedRants.size + 1
                })
                addPoints(1, "like")
                await checkAchievements("likes_given", likedRants.size + 1)
                await audioService.playActionSound('like')
                toast.success("Rant liked! +1 point")
                confetti({
