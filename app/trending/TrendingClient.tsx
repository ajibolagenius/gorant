"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
    TrendUp,
    Clock,
    Calendar,
    Trophy,
    House,
    MagnifyingGlass,
    Funnel,
    SortAscending
} from "@phosphor-icons/react"
import Link from "next/link"
import { RantCard } from "@/components/rant-card"
import type { Rant } from "@/components/enhanced-rant-card"
import { FixedSizeList as VirtualizedList, ListChildComponentProps } from "react-window"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TRENDING_PERIODS = [
    { label: "Today", value: "today", icon: Clock },
    { label: "This Week", value: "week", icon: Calendar },
    { label: "This Month", value: "month", icon: Trophy }, // Use Trophy instead of Award
]

const mockTrendingRants = [
    {
        id: "trending_1",
        content:
            "Just realized I've been pronouncing 'epitome' wrong my entire life. I'm 28. How did nobody correct me?! 😅",
        mood: "confused",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        likes_count: 156,
        comments_count: 43,
        anonymous_id: "anon_trending_001",
        tags: ["embarrassing", "learning"],
        is_trending: true,
    },
    {
        id: "trending_2",
        content:
            "My neighbor's dog has been barking for 3 hours straight. I'm about to lose my mind! Why do people get dogs if they can't train them properly?",
        mood: "angry",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        likes_count: 89,
        comments_count: 67,
        anonymous_id: "anon_trending_002",
        tags: ["neighbors", "noise"],
        is_trending: true,
    },
    {
        id: "trending_3",
        content:
            "Finally told my crush how I feel and they said yes to a date! I'm literally floating on cloud nine right now! ☁️✨",
        mood: "excited",
        created_at: new Date(Date.now() - 10800000).toISOString(),
        likes_count: 234,
        comments_count: 89,
        anonymous_id: "anon_trending_003",
        tags: ["love", "success", "dating"],
        is_trending: true,
    },
    {
        id: "trending_4",
        content: "Lost my wallet on the bus today. If anyone finds a brown leather wallet, please DM!",
        mood: "sad",
        created_at: new Date(Date.now() - 14400000).toISOString(),
        likes_count: 45,
        comments_count: 12,
        anonymous_id: "anon_trending_004",
        tags: ["lost", "help"],
        is_trending: true,
    },
    {
        id: "trending_5",
        content: "Got a promotion at work! Drinks on me tonight!",
        mood: "happy",
        created_at: new Date(Date.now() - 18000000).toISOString(),
        likes_count: 120,
        comments_count: 30,
        anonymous_id: "anon_trending_005",
        tags: ["work", "success"],
        is_trending: true,
    },
    {
        id: "trending_6",
        content: "Why does coffee taste better on Mondays?",
        mood: "neutral",
        created_at: new Date(Date.now() - 21600000).toISOString(),
        likes_count: 60,
        comments_count: 10,
        anonymous_id: "anon_trending_006",
        tags: ["coffee", "monday"],
        is_trending: true,
    },
    {
        id: "trending_7",
        content: "My cat just brought a mouse into the house. Again.",
        mood: "anxious",
        created_at: new Date(Date.now() - 25200000).toISOString(),
        likes_count: 77,
        comments_count: 15,
        anonymous_id: "anon_trending_007",
        tags: ["cat", "pets"],
        is_trending: true,
    },
    {
        id: "trending_8",
        content: "Baked my first loaf of sourdough and it actually turned out great!",
        mood: "confident",
        created_at: new Date(Date.now() - 28800000).toISOString(),
        likes_count: 99,
        comments_count: 22,
        anonymous_id: "anon_trending_008",
        tags: ["baking", "success"],
        is_trending: true,
    },
]

const MOODS = [
    { icon: SmileySad, label: "Sad", value: "sad", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
    { icon: SmileySad, label: "Crying", value: "crying", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" },
    { icon: Smiley, label: "Happy", value: "happy", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
    { icon: SmileyMeh, label: "Neutral", value: "neutral", color: "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300" },
    { icon: SmileyNervous, label: "Angry", value: "angry", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
    { icon: HeartBreak, label: "Heartbroken", value: "heartbroken", color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
    { icon: Heart, label: "Love", value: "love", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" },
    { icon: SmileyNervous, label: "Anxious", value: "anxious", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
    { icon: SmileyMeh, label: "Confused", value: "confused", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
    { icon: Cloud, label: "Tired", value: "tired", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
    { icon: Confetti, label: "Excited", value: "excited", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
    { icon: SmileySticker, label: "Confident", value: "confident", color: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300" },
]

export function TrendingClient() {
    const [selectedPeriod, setSelectedPeriod] = useState("today")
    const [trendingRants, setTrendingRants] = useState(mockTrendingRants)
    const [likedRants, setLikedRants] = useState<Set<string>>(new Set())
    const [bookmarkedRants, setBookmarkedRants] = useState<Set<string>>(new Set())
    const [shareModalOpen, setShareModalOpen] = useState(false)
    const [blockModalOpen, setBlockModalOpen] = useState(false)
    // selectedRant: for share, it's a Rant; for block/report, it's a string (userId or rantId)
    const [selectedRant, setSelectedRant] = useState<Rant | string | null>(null)
    const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState("");
    const [moodFilter, setMoodFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);

    const getMoodIcon = (mood: string) => {
        return MOODS.find((m) => m.value === mood)?.icon || SmileyMeh
    }

    const getMoodColor = (mood: string) => {
        return MOODS.find((m) => m.value === mood)?.color || "bg-gray-100 text-gray-800"
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

    const handleLike = (rantId: string) => {
        if (likedRants.has(rantId)) return

        setLikedRants((prev) => new Set([...prev, rantId]))
        setTrendingRants((prev) =>
            prev.map((rant) => (rant.id === rantId ? { ...rant, likes_count: rant.likes_count + 1 } : rant)),
        )
    }

    const handleBookmark = (rantId: string) => {
        setBookmarkedRants((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(rantId)) {
                newSet.delete(rantId)
            } else {
                newSet.add(rantId)
            }
            return newSet
        })
    }

    // Advanced Handlers
    const handleShare = (rant: Rant) => {
        setSelectedRant(rant)
        setShareModalOpen(true)
    }
    const handleBlockUser = (userId: string) => {
        setSelectedRant(userId)
        setBlockModalOpen(true)
    }
    type RantId = string;
    const handleReport = (rantId: RantId) => {
        toast.success("Rant reported. Thank you for helping keep the community safe.")
        // Optionally, add logic to update state or send to backend here
    }
    const confirmBlockUser = () => {
        if (typeof selectedRant === "string") {
            setBlockedUsers((prev) => {
                const newSet = new Set(prev)
                if (selectedRant) newSet.add(selectedRant)
                return newSet
            })
            setBlockModalOpen(false)
            toast.success("User blocked. You won't see their rants anymore.")
        }
    }
    const handleCopyLink = () => {
        if (selectedRant && typeof selectedRant !== "string") {
            navigator.clipboard.writeText(window.location.origin + "/rants/" + selectedRant.id)
            toast.success("Link copied to clipboard!")
        }
    }
    const handleNativeShare = () => {
        if (selectedRant && typeof selectedRant !== "string" && typeof navigator.share === "function") {
            navigator.share({
                title: "Check out this rant!",
                text: selectedRant.content,
                url: window.location.origin + "/rants/" + selectedRant.id,
            })
            setShareModalOpen(false)
        }
    }

    // Filter and sort trending rants
    const filteredAndSortedRants = useMemo(() => {
        let filtered = trendingRants;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((rant) =>
                rant.content.toLowerCase().includes(query) ||
                rant.tags?.some(tag => tag.toLowerCase().includes(query)) ||
                rant.mood.toLowerCase().includes(query)
            );
        }
        if (moodFilter !== "all") {
            filtered = filtered.filter((rant) => rant.mood === moodFilter);
        }
        switch (sortBy) {
            case "newest":
                filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case "oldest":
                filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                break;
            case "most_liked":
                filtered.sort((a, b) => b.likes_count - a.likes_count);
                break;
            case "most_commented":
                filtered.sort((a, b) => b.comments_count - a.comments_count);
                break;
            case "mood":
                filtered.sort((a, b) => a.mood.localeCompare(b.mood));
                break;
        }
        return filtered;
    }, [trendingRants, searchQuery, moodFilter, sortBy]);
    const topTrendingRants = filteredAndSortedRants.slice(0, 5);

    // Helper to determine virtualization
    const VIRTUALIZATION_THRESHOLD = 30
    const isVirtualized = trendingRants.length > VIRTUALIZATION_THRESHOLD

    return (
        <main role="main" className="min-h-screen bg-background dark:bg-background">
            {/* Enhanced Header */}
            <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto mt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-0 sm:mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-none bg-orange-100 dark:bg-orange-900/30 p-3">
                            <TrendUp weight="duotone" className="w-7 h-7 text-orange-600 dark:text-orange-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-heading text-gray-800 dark:text-white flex items-center gap-2">
                                Trending Rants
                                <span className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs font-semibold px-2 py-0.5 rounded-none ml-2">
                                    {filteredAndSortedRants.length}
                                </span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">See what's hot in the community right now.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8 max-w-6xl mb-safe-bottom wrap-screen overflow-x-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-wrap">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Search and Filters */}
                        <Card className="shadow-sm border-0 rounded-none bg-white/80 dark:bg-gray-800/80 backdrop-blur mb-6">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                        <Input
                                            placeholder="Search trending rants by content, tags, or mood..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {/* Filter Controls */}
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="flex items-center gap-2 rounded-none"
                                        >
                                            <Funnel className="w-4 h-4" />
                                            Filters
                                            {moodFilter !== "all" && (
                                                <Badge variant="secondary" className="ml-1 rounded-none">
                                                    1
                                                </Badge>
                                            )}
                                        </Button>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="w-48 rounded-none">
                                                <SortAscending className="w-4 h-4 mr-2" />
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="newest">Newest First</SelectItem>
                                                <SelectItem value="oldest">Oldest First</SelectItem>
                                                <SelectItem value="most_liked">Most Liked</SelectItem>
                                                <SelectItem value="most_commented">Most Commented</SelectItem>
                                                <SelectItem value="mood">By Mood</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {showFilters && (
                                            <div className="flex items-center gap-4 ml-4">
                                                <Select value={moodFilter} onValueChange={setMoodFilter}>
                                                    <SelectTrigger className="w-32 rounded-none">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Moods</SelectItem>
                                                        {MOODS.map((mood) => (
                                                            <SelectItem key={mood.value} value={mood.value}>
                                                                {mood.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Period Selector */}
                        <Card className="shadow-sm border-0 rounded-none bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardContent className="pt-2 sm:pt-6">
                                <div className="flex flex-wrap w-full gap-2">
                                    {TRENDING_PERIODS.map((period) => (
                                        <Button
                                            key={period.value}
                                            variant={selectedPeriod === period.value ? "default" : "outline"}
                                            onClick={() => setSelectedPeriod(period.value)}
                                            className={`${selectedPeriod === period.value
                                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300"
                                                : "hover:bg-orange-100/50 dark:hover:bg-orange-900/10 text-orange-600 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                                                } flex-1 min-w-[120px] rounded-none`}
                                        >
                                            <period.icon weight="duotone" className="w-4 h-4 mr-2" />
                                            {period.label}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        {/* Trending Rants */}
                        <div className="space-y-4">
                            {isVirtualized ? (
                                <VirtualizedList
                                    height={800}
                                    itemCount={topTrendingRants.length}
                                    itemSize={340}
                                    width="100%"
                                    className="w-full"
                                >
                                    {({ index, style }: ListChildComponentProps) => (
                                        <div style={style} key={topTrendingRants[index].id} className="relative">
                                            <div className="absolute -left-4 top-4 z-10">
                                                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 font-bold rounded-none">#{index + 1}</Badge>
                                            </div>
                                            <RantCard
                                                rant={topTrendingRants[index]}
                                                onLike={handleLike}
                                                onBookmark={handleBookmark}
                                                onReport={() => handleReport(topTrendingRants[index].id)}
                                                onShare={() => handleShare(topTrendingRants[index])}
                                                onBlockUser={() => handleBlockUser(topTrendingRants[index].anonymous_id)}
                                                onFollowTag={() => { }}
                                                isLiked={likedRants.has(topTrendingRants[index].id)}
                                                isBookmarked={bookmarkedRants.has(topTrendingRants[index].id)}
                                                isUserBlocked={blockedUsers.has(topTrendingRants[index].anonymous_id)}
                                                followedTags={new Set()}
                                                getMoodIcon={getMoodIcon}
                                                getMoodColor={getMoodColor}
                                                formatTimeAgo={formatTimeAgo}
                                                moods={MOODS}
                                                showSentiment={true}
                                                showModeration={true}
                                            />
                                        </div>
                                    )}
                                </VirtualizedList>
                            ) : (
                                topTrendingRants.map((rant, index) => (
                                    <div key={rant.id} className="relative">
                                        <div className="absolute -left-4 top-4 z-10">
                                            <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 font-bold rounded-none">#{index + 1}</Badge>
                                        </div>
                                        <RantCard
                                            rant={rant}
                                            onLike={handleLike}
                                            onBookmark={handleBookmark}
                                            onReport={() => handleReport(rant.id)}
                                            onShare={() => handleShare(rant)}
                                            onBlockUser={() => handleBlockUser(rant.anonymous_id)}
                                            onFollowTag={() => { }}
                                            isLiked={likedRants.has(rant.id)}
                                            isBookmarked={bookmarkedRants.has(rant.id)}
                                            isUserBlocked={blockedUsers.has(rant.anonymous_id)}
                                            followedTags={new Set()}
                                            getMoodIcon={getMoodIcon}
                                            getMoodColor={getMoodColor}
                                            formatTimeAgo={formatTimeAgo}
                                            moods={MOODS}
                                            showSentiment={true}
                                            showModeration={true}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                        {/* Share Modal */}
                        <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Share Rant</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <Button onClick={handleCopyLink} className="w-full">Copy Link</Button>
                                    {typeof navigator.share === "function" && (
                                        <Button onClick={handleNativeShare} className="w-full" variant="outline">Share via Device</Button>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setShareModalOpen(false)}>Close</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        {/* Block User Modal */}
                        <Dialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Block User</DialogTitle>
                                </DialogHeader>
                                <div className="mb-4">Are you sure you want to block this user? You won't see their rants anymore.</div>
                                <DialogFooter>
                                    <Button variant="destructive" onClick={confirmBlockUser}>Block</Button>
                                    <Button variant="ghost" onClick={() => setBlockModalOpen(false)}>Cancel</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trending Stats */}
                        <Card className="shadow-sm border-0 rounded-none bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Trending Stats</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground dark:text-gray-300">Top Rant Likes</span>
                                    <span className="font-semibold text-accent">234</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground dark:text-gray-300">Most Comments</span>
                                    <span className="font-semibold text-accent">89</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground dark:text-gray-300">Trending Tags</span>
                                    <span className="font-semibold text-accent">#love</span>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Popular Moods */}
                        <Card className="shadow-sm border-0 rounded-none bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Popular Moods Today</h3>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span>🎉</span>
                                        <span className="text-sm text-muted-foreground dark:text-gray-300">Excited</span>
                                    </div>
                                    <Badge variant="secondary">45%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span>😡</span>
                                        <span className="text-sm text-muted-foreground dark:text-gray-300">Angry</span>
                                    </div>
                                    <Badge variant="secondary">23%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span>🤔</span>
                                        <span className="text-sm text-muted-foreground dark:text-gray-300">Confused</span>
                                    </div>
                                    <Badge variant="secondary">18%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span>😢</span>
                                        <span className="text-sm text-muted-foreground dark:text-gray-300">Sad</span>
                                    </div>
                                    <Badge variant="secondary">14%</Badge>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Trending Tags */}
                        <Card className="shadow-sm border-0 rounded-none bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Trending Tags</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent-dark">
                                        #work
                                    </Badge>
                                    <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent-dark">
                                        #love
                                    </Badge>
                                    <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent-dark">
                                        #stress
                                    </Badge>
                                    <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent-dark">
                                        #success
                                    </Badge>
                                    <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent-dark">
                                        #anxiety
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
