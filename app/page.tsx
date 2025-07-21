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
    SmileySticker,
    LegoSmiley
} from "@phosphor-icons/react"
import { HelpCircle, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MoreHorizontal, Dot, GripVertical, Search, PanelLeft, Award, MessageCircle, Send, X, Filter, Eraser } from "lucide-react"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { useTheme } from "@/hooks/use-theme"
import { useGamification } from "@/hooks/use-gamification"
import { useAccessibility } from "@/hooks/use-accessibility"
import { MasonryGrid } from "@/components/masonry-grid"
import { EnhancedRantCard, Rant, Comment } from "@/components/enhanced-rant-card"
import { PostRantModal } from "@/components/post-rant-modal"
import { FilterPanel } from "@/components/filter-panel"
import { ContentModerationService } from "@/services/content-moderation"
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
import { LogoIcon } from "@/components/ui/logo-icon";

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
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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
        contentFilters: contentFilterSettings,
        loaded: settingsLoaded,
        feedLayout,
        defaultSort,
        keyboardShortcuts,
    } = useSettings()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showPersonalizationTip, setShowPersonalizationTip] = useState(false)
    const personalizationTipDismissed = useRef(false)

    // Track rant visibility
    const [visibleRants, setVisibleRants] = useState<Set<string>>(new Set())
    const rantRefs = useRef<Map<string, HTMLElement>>(new Map())

    const { theme, toggleTheme } = useTheme()
    const { fontSize, contrast, screenReaderMode } = useAccessibility()

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

    const { userPoints, userLevel, addPoints, checkAchievements } = useGamification()
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
                resultsCount: rants.filter(r => r?.mood === moodFilter).length
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
        // Track liked comments in localStorage
        const likedCommentsKey = `likedComments_${rantId}`
        const likedComments = new Set(JSON.parse(localStorage.getItem(likedCommentsKey) || '[]'))
        const isLiked = likedComments.has(commentId)
        setComments(prev => {
            const updated = { ...prev }
            if (updated[rantId]) {
                updated[rantId] = updated[rantId].map(c =>
                    c.id === commentId
                        ? { ...c, likes_count: isLiked ? Math.max((c.likes_count || 1) - 1, 0) : (c.likes_count || 0) + 1 }
                        : c
                )
            }
            return updated
        })
        if (isLiked) {
            likedComments.delete(commentId)
        } else {
            likedComments.add(commentId)
        }
        localStorage.setItem(likedCommentsKey, JSON.stringify(Array.from(likedComments)))
        // Update likes_count in Supabase
        const { error } = await supabase.from('comments').update({
            likes_count: isLiked
                ? Math.max((comments[rantId]?.find(c => c.id === commentId)?.likes_count || 1) - 1, 0)
                : (comments[rantId]?.find(c => c.id === commentId)?.likes_count || 0) + 1
        }).eq('id', commentId)
        if (error) {
            toast.error(isLiked ? 'Failed to unlike comment.' : 'Failed to like comment.')
        } else {
            if (isLiked) {
                toast.info('Comment unliked.')
            } else {
                toast.success('Comment liked!')
            }
        }
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
                    r?.content?.toLowerCase().includes(query.toLowerCase()) ||
                    r?.tags?.some(tag => tag?.toLowerCase().includes(query.toLowerCase()))
                ).length
            })

            const suggestions = [
                ...new Set([
                    ...rants
                        .filter((r) => r?.content?.toLowerCase().includes(query.toLowerCase()))
                        .slice(0, 3)
                        .map((r) => r?.content?.length > 50 ? r.content.substring(0, 50) : r.content),
                    ...rants
                        .flatMap((r) => r?.tags || [])
                        .filter((tag) => tag?.toLowerCase().includes(query.toLowerCase()))
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
                // Type assertion for payload.new and payload.old
                const newComment = payload.new as Comment | undefined;
                const oldComment = payload.old as Partial<Comment> | undefined;

                const rantId = newComment?.rant_id || oldComment?.rant_id;
                if (!rantId) return;

                setComments(prev => {
                    const updated = { ...prev };
                    if (payload.eventType === 'INSERT' && newComment) {
                        updated[rantId] = [newComment, ...(updated[rantId] || [])];
                    } else if (payload.eventType === 'UPDATE' && newComment) {
                        updated[rantId] = (updated[rantId] || []).map(c =>
                            c.id === newComment.id ? newComment : c
                        );
                    } else if (payload.eventType === 'DELETE' && oldComment?.id) {
                        updated[rantId] = (updated[rantId] || []).filter(c =>
                            c.id !== oldComment.id
                        );
                    }
                    return updated;
                });
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
        // Optimistically update UI
        setRants(prev => prev.map(r => r.id === rantId ? { ...r, likes_count: isLiked ? Math.max((r.likes_count || 1) - 1, 0) : (r.likes_count || 0) + 1 } : r))
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
        // Update likes_count in Supabase
        const { error } = await supabase.from('rants').update({
            likes_count: isLiked ? Math.max((rant?.likes_count || 1) - 1, 0) : (rant?.likes_count || 0) + 1
        }).eq('id', rantId)
        if (error) {
            toast.error(isLiked ? 'Failed to unlike rant.' : 'Failed to like rant.')
        } else {
            if (!isLiked) {
                // Like analytics, points, confetti, etc.
                await trackUserAction("like_rant", {
                    rantId,
                    rantMood: rant?.mood,
                    rantTags: rant?.tags,
                    rantAge: rant ? Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)) : null,
                    previousLikesCount: rant?.likes_count || 0,
                    userTotalLikes: likedRants.size + 1
                })
                addPoints(1, "like")
                await checkAchievements("likes_given", likedRants.size + 1)
                await audioService.playActionSound('like')
                toast.success("Rant liked! +1 point")
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } })
            } else {
                toast.info("Rant unliked.")
            }
        }
    }

    // Block user function
    const blockUser = (userId: string) => {
        // Track block user analytics
        trackUserAction("block_user", {
            blockedUserId: userId,
            userTotalBlocked: blockedUsers.size + 1,
            triggerContext: "rant_card_menu"
        })

        setBlockedUsers((prev) => new Set([...prev, userId]))
        toast.success("User blocked successfully")
    }

    // Follow tag function
    const followTag = (tag: string) => {
        const isCurrentlyFollowed = followedTags.has(tag)

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

        // Track analytics for tag follow/unfollow
        trackUserAction(isCurrentlyFollowed ? "unfollow_tag" : "follow_tag", {
            tag,
            userTotalFollowedTags: isCurrentlyFollowed ? followedTags.size - 1 : followedTags.size + 1,
            tagPopularity: rants.filter(r => r.tags?.includes(tag)).length
        })
    }

    // Share rant function
    const shareRant = async (rant: Rant) => {
        // Remove all HTML tags from rant.content for sharing
        const plainText = rant.content.replace(/<[^>]+>/g, '').trim();
        const shareData = {
            title: "Check out this rant on Rant App",
            text: plainText.substring(0, 100) + (plainText.length > 100 ? "..." : ""),
            url: `${window.location.origin}/rant/${rant.id}`,
        }

        // Track analytics for share action
        await trackUserAction("share_rant", {
            rantId: rant.id,
            rantMood: rant.mood,
            rantTags: rant.tags,
            shareMethod: 'share' in navigator ? "native_share" : "clipboard",
            rantAge: Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60))
        })

        if (typeof navigator !== 'undefined' && 'share' in navigator) {
            try {
                await (navigator as any).share(shareData)
                addPoints(2, "share")
                toast.success("Rant shared! +2 points")
            } catch (error) {
                console.log("Error sharing:", error)
            }
        } else if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
            // Fallback: copy to clipboard
            await (navigator as any).clipboard.writeText(`${shareData.text} ${shareData.url}`)
            toast.success("Link copied to clipboard!")
        } else {
            // No sharing capabilities
            toast.error("Sharing is not supported on this device")
        }
    }

    // Toggle bookmark
    const toggleBookmark = (rantId: string) => {
        const rant = rants.find(r => r.id === rantId)
        const isCurrentlyBookmarked = bookmarkedRants.has(rantId)

        if (isCurrentlyBookmarked) {
            // Remove bookmark from Supabase
            supabase.from('bookmarks').delete().match({ rant_id: rantId, anonymous_id: getAnonymousId() })
            setBookmarkedRants((prev) => {
                const newSet = new Set(prev)
                newSet.delete(rantId)
                return newSet
            })
            toast.info("Bookmark removed")
        } else {
            // Add bookmark to Supabase
            supabase.from('bookmarks').insert([
                { rant_id: rantId, anonymous_id: getAnonymousId() }
            ])
            setBookmarkedRants((prev) => {
                const newSet = new Set(prev)
                newSet.add(rantId)
                return newSet
            })
            addPoints(1, "bookmark")
            toast.success("Rant bookmarked! +1 point")
        }

        // Track analytics for bookmark action
        trackUserAction(isCurrentlyBookmarked ? "unbookmark_rant" : "bookmark_rant", {
            rantId,
            rantMood: rant?.mood,
            rantTags: rant?.tags,
            rantAge: rant ? Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)) : null,
            userTotalBookmarks: isCurrentlyBookmarked ? bookmarkedRants.size - 1 : bookmarkedRants.size + 1
        })
    }

    // Report rant
    const reportRant = (rantId: string, reason: string) => {
        const rant = rants.find(r => r.id === rantId)

        // Track report analytics
        trackUserAction("report_rant", {
            rantId,
            reason,
            rantMood: rant?.mood,
            rantTags: rant?.tags,
            rantAge: rant ? Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)) : null,
            reporterTotalReports: parseInt(localStorage.getItem("totalReports") || "0") + 1
        })

        // Update local report count
        const totalReports = parseInt(localStorage.getItem("totalReports") || "0") + 1
        localStorage.setItem("totalReports", totalReports.toString())

        toast.success("Rant reported. Thank you for helping keep our community safe.")
    }

    // Track content performance metrics
    useEffect(() => {
        if (rants.length > 0) {
            // Track content performance analytics
            const moodDistribution = rants.reduce((acc, rant) => {
                acc[rant.mood] = (acc[rant.mood] || 0) + 1
                return acc
            }, {} as Record<string, number>)

            const tagDistribution = rants.reduce((acc, rant) => {
                rant.tags?.forEach(tag => {
                    acc[tag] = (acc[tag] || 0) + 1
                })
                return acc
            }, {} as Record<string, number>)

            const engagementMetrics = {
                totalRants: rants.length,
                averageLikes: rants.reduce((sum, r) => sum + r.likes_count, 0) / rants.length,
                averageComments: rants.reduce((sum, r) => sum + r.comments_count, 0) / rants.length,
                trendingCount: rants.filter(r => r.is_trending).length,
                moodDistribution,
                topTags: Object.entries(tagDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([tag, count]) => ({ tag, count }))
            }

            trackEvent("content_performance", engagementMetrics)
        }
    }, [rants])

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

    // Show a toast the first time keyboard shortcuts are enabled
    useEffect(() => {
        if (keyboardShortcuts && typeof window !== "undefined" && !localStorage.getItem("shortcutsHintShown")) {
            toast.info("Tip: Press ? to see all keyboard shortcuts!")
            localStorage.setItem("shortcutsHintShown", "true")
        }
    }, [keyboardShortcuts])

    // Track session analytics
    useEffect(() => {
        const sessionStart = Date.now()
        const sessionId = `session_${sessionStart}_${Math.random().toString(36).substr(2, 9)}`

        // Track session start
        trackEvent("session_start", {
            sessionId,
            userLevel,
            theme,
            fontSize,
            screenReaderMode,
            keyboardShortcuts,
            defaultSort,
            feedLayout
        })

        // Track session activity periodically
        const activityInterval = setInterval(() => {
            trackEvent("session_activity", {
                sessionId,
                timeSpent: Math.floor((Date.now() - sessionStart) / 1000),
                rantsViewed: filteredRants.length,
                currentPage: pathname,
                scrollPosition: window.scrollY
            })
        }, 30000) // Every 30 seconds

        // Track session end on page unload
        const handleBeforeUnload = () => {
            trackEvent("session_end", {
                sessionId,
                totalTimeSpent: Math.floor((Date.now() - sessionStart) / 1000),
                rantsViewed: filteredRants.length,
                actionsPerformed: {
                    likes: likedRants.size,
                    bookmarks: bookmarkedRants.size,
                    followedTags: followedTags.size
                }
            })
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            clearInterval(activityInterval)
            window.removeEventListener('beforeunload', handleBeforeUnload)
            handleBeforeUnload() // Track session end on component unmount
        }
    }, []) // Empty dependency array to run only once

    // Track rant visibility with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const rantId = entry.target.getAttribute('data-rant-id')
                    if (!rantId) return

                    if (entry.isIntersecting && !visibleRants.has(rantId)) {
                        setVisibleRants(prev => new Set([...prev, rantId]))

                        const rant = rants.find(r => r.id === rantId)
                        if (rant) {
                            // Track rant view
                            trackUserAction("rant_viewed", {
                                rantId,
                                rantMood: rant.mood,
                                rantTags: rant.tags,
                                rantAge: Math.floor((Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)),
                                likesCount: rant.likes_count,
                                commentsCount: rant.comments_count,
                                viewportPosition: entry.boundingClientRect.top,
                                scrollPosition: window.scrollY
                            })
                        }
                    }
                })
            },
            { threshold: 0.5 } // Trigger when 50% of the rant is visible
        )

        // Observe all rant elements
        rantRefs.current.forEach((element) => {
            observer.observe(element)
        })

        return () => {
            observer.disconnect()
        }
    }, [filteredRants, rants, trackUserAction, visibleRants]) // Removed visibleRants from dependencies to avoid circular dependency

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

    // Keyboard shortcut state
    const [selectedRantIndex, setSelectedRantIndex] = useState(0)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)

    // Keyboard shortcut handlers
    useKeyboardShortcuts({
        enabled: keyboardShortcuts,
        onNewRant: () => setShowPostModal(true),
        onNextRant: () => setSelectedRantIndex((i) => Math.min(i + 1, filteredRants.length - 1)),
        onPrevRant: () => setSelectedRantIndex((i) => Math.max(i - 1, 0)),
        onLike: () => {
            const rant = filteredRants[selectedRantIndex]
            if (rant) likeRant(rant.id)
        },
        onBookmark: () => {
            const rant = filteredRants[selectedRantIndex]
            if (rant) toggleBookmark(rant.id)
        },
        onComment: () => {
            // Optionally focus comment input if available
        },
        onFocusSearch: () => {
            if (searchInputRef.current) searchInputRef.current.focus()
        },
        onClose: () => {
            setShowPostModal(false)
            setShowShortcutsHelp(false)
        },
        onShowHelp: () => setShowShortcutsHelp(true),
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center">
                <main className="container mx-auto px-4 py-8 max-w-7xl pb-32 mb-safe-bottom wrap-screen overflow-x-auto lg:overflow-visible w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-wrap justify-center">
                        {/* Feed Skeletons */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Header Skeleton */}
                            <Skeleton className="h-16 w-full rounded-none mb-2" />
                            {/* Welcome Card Skeleton */}
                            <Skeleton className="h-32 w-full rounded-none mb-2" />
                            {/* Rant of the Day Skeleton */}
                            <Skeleton className="h-28 w-full rounded-none mb-2" />
                            {/* Search/Filter Bar Skeleton */}
                            <Skeleton className="h-20 w-full rounded-none mb-2" />
                            {/* Feed Card Skeletons (grid) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-56 w-full rounded-none" />
                                ))}
                            </div>
                        </div>
                        {/* Sidebar Skeletons */}
                        <div className="sticky top-24 self-start hidden lg:block w-full max-w-xs space-y-6">
                            {/* Gamification Panel Skeleton */}
                            <Skeleton className="h-32 w-full rounded-none" />
                            {/* Community Stats Skeleton */}
                            <Skeleton className="h-40 w-full rounded-none" />
                            {/* Followed Tags Skeleton */}
                            <Skeleton className="h-24 w-full rounded-none" />
                            {/* Weekly Challenge Skeleton */}
                            <Skeleton className="h-32 w-full rounded-none" />
                            {/* Support Resources Skeleton */}
                            <Skeleton className="h-40 w-full rounded-none" />
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <main
                role="main"
                className={`min-h-screen bg-background dark:bg-background transition-colors ${fontSize} ${contrast} pb-28 md:pb-32`}
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
                            {/* Modern Feed Header */}
                            <div className="flex items-center justify-between rounded-none bg-purple-100/80 dark:bg-purple-900/40 backdrop-blur px-6 py-4 mb-2 shadow border-0">
                                <div className="flex flex-1 items-center gap-3">
                                    <LogoIcon className="w-8 h-8 text-purple-600 dark:text-purple-300" weight="duotone" />
                                    <Badge
                                        variant="secondary"
                                        className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                    >
                                        Anonymous
                                    </Badge>
                                    <Badge
                                        className="ml-2 bg-green-400 text-green-900 dark:bg-green-300/20 dark:text-green-300 font-normal text-sm px-3 py-1 rounded-none h-7 flex items-center"
                                    >
                                        Live
                                    </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground ml-4">Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">?</kbd> for shortcuts</span>
                            </div>
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
                            <Card className="shadow-lg bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-none">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                                        {/* Search */}
                                        <div className="relative w-full">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 dark:text-purple-300 w-4 h-4" />
                                            <Input
                                                ref={searchInputRef}
                                                placeholder="Search rants, tags, or users... (min 2 characters)"
                                                value={searchQuery}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                className="w-full pl-10 focus:border-purple-500 dark:focus:border-purple-400 dark:bg-gray-700 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-none shadow-sm"
                                            />
                                            {/* Search Suggestions */}
                                            {searchSuggestions.length > 0 && (
                                                <div className="bg-white dark:bg-gray-800 rounded-none mt-1 shadow-lg z-10 absolute w-full left-0">
                                                    {searchSuggestions.map((suggestion, index) => (
                                                        <button
                                                            key={index}
                                                            className="w-full text-left px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-900 text-sm dark:text-gray-200 rounded-none"
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
                                                className="flex-1 flex items-center space-x-2 dark:text-gray-300 dark:hover:bg-gray-700 relative rounded-none"
                                            >
                                                <Filter className="w-4 h-4 text-purple-500" />
                                                <span>Filters</span>
                                                {/* Active filter count badge */}
                                                {(moodFilter || sortFilter !== 'latest' || followedTags.size > 0 || searchQuery.length > 0) && (
                                                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-none bg-purple-600 text-white absolute -top-2 -right-2">
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
                                                    className="flex-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 rounded-none"
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
                                        <div className="mt-4 pt-4">
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

                            {/* Personalization Tip */}
                            {sortFilter === "recommended" && showPersonalizationTip && (
                                <div className="flex items-center justify-between bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded px-4 py-2 mb-4">
                                    <span className="text-green-800 dark:text-green-200 text-sm">Try the Recommended feed for a personalized experience! These rants are tailored to your interests and activity. <span className="italic">(Anonymous & private)</span></span>
                                    <button onClick={dismissPersonalizationTip} className="ml-4 text-green-700 dark:text-green-300 hover:underline text-xs">Dismiss</button>
                                </div>
                            )}
                            {sortFilter === "recommended" && !showPersonalizationTip && (
                                <div className="flex items-center bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded px-4 py-2 mb-4">
                                    <span className="text-green-800 dark:text-green-200 text-sm">These rants are recommended for you based on your interests and activity. <span className="italic">(Anonymous & private)</span></span>
                                </div>
                            )}

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
                                    width="100%"
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
                                                recommended={sortFilter === "recommended"}
                                            />
                                            {index === filteredRants.length - 1 && (
                                                <div className="w-full text-center text-gray-500 dark:text-gray-300 py-6 text-base font-mono">
                                                    You’ve reached the end of the feed!
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </VirtualizedList>
                            ) : (
                                // Desktop: Use MasonryGrid for layout
                                <MasonryGrid columns={2} gap={20} className={`w-full overflow-x-auto ${feedLayout === "compact" ? "feed-compact" : "feed-comfortable"}`}>
                                    {filteredRants.map((rant, index) => (
                                        <React.Fragment key={rant.id}>
                                            <EnhancedRantCard
                                                ref={(el) => {
                                                    if (el) {
                                                        rantRefs.current.set(rant.id, el)
                                                    } else {
                                                        rantRefs.current.delete(rant.id)
                                                    }
                                                }}
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
                                                recommended={sortFilter === "recommended"}
                                            />
                                            {index === filteredRants.length - 1 && (
                                                <div className="w-full text-center text-gray-500 dark:text-gray-300 py-6 text-base font-mono">
                                                    You’ve reached the end of the feed! 🎬
                                                </div>
                                            )}
                                        </React.Fragment>
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
                    className="fixed bottom-8 right-6 z-40 bg-primary text-primary-foreground rounded-none shadow-lg p-3 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all md:hidden"
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

                {/* Enhanced Post Rant Modal */}
                <PostRantModal
                    isOpen={showPostModal}
                    onClose={() => setShowPostModal(false)}
                    moods={MOODS}
                    onSubmit={async (content, mood, tags) => {
                        // Content moderation check
                        const isAppropriate = await moderateContent(content)
                        if (!isAppropriate) return
                        // Only send valid fields, including tags array
                        const { data, error } = await supabase.from('rants').insert([
                            {
                                content,
                                mood,
                                anonymous_id: getAnonymousId(),
                                tags: Array.isArray(tags) ? tags : [],
                                created_at: new Date().toISOString(),
                                likes_count: 0,
                                comments_count: 0
                            }
                        ]).select('*')
                        if (error) {
                            toast.error('Failed to post rant.')
                            return
                        }
                        // Optimistically update UI
                        if (data && data[0]) {
                            setRants((prev) => [normalizeRant(data[0]), ...prev])
                        }
                        fetchRants()
                        addPoints(5, "post")
                        await checkAchievements("posts_created", rants.length + 1)
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
                {/* (REMOVED: footer content now in hamburger drawer for mobile) */}
                {showShortcutsHelp && (
                    <Dialog open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Keyboard Shortcuts</DialogTitle>
                            </DialogHeader>
                            <ul className="space-y-2 mt-4 text-sm">
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">n</kbd> — New rant (open post modal)</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">j</kbd> / <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">↓</kbd> — Next rant</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">k</kbd> / <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">↑</kbd> — Previous rant</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">l</kbd> — Like selected rant</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">b</kbd> — Bookmark selected rant</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">c</kbd> — Comment on selected rant</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">/</kbd> — Focus search</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> — Close modals/help</li>
                                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">?</kbd> — Show this help</li>
                            </ul>
                            <Button className="mt-6 w-full" onClick={() => setShowShortcutsHelp(false)}>Close</Button>
                        </DialogContent>
                    </Dialog>
                )}
            </main>
        </ErrorBoundary>
    )
}
