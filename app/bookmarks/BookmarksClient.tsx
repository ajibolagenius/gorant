"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { EnhancedRantCard, Rant } from "@/components/enhanced-rant-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { storageGet, storageSet } from "@/lib/storage";
import { FixedSizeList as VirtualizedList, ListChildComponentProps } from "react-window";
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
    House,
    BookmarkSimple,
    MagnifyingGlass,
    Funnel,
    SortAscending,
    Trash,
    ArrowLeft,
    Star,
    Clock,
    Heart as HeartIcon,
    MessageCircle,
    Share,
    MoreHorizontal
} from "phosphor-react";
import { toast } from "sonner";

export default function BookmarksClient() {
    const [rants, setRants] = useState<Rant[]>([]);
    const [bookmarkedRants, setBookmarkedRants] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [moodFilter, setMoodFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);
    const [showOnlyLiked, setShowOnlyLiked] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load data on mount
    useEffect(() => {
        const loadData = () => {
            try {
                const savedRants = storageGet<Rant[]>("all_rants", []);
                const savedBookmarks = storageGet<string[]>("bookmarked_rants", []);
                setRants(savedRants);
                setBookmarkedRants(new Set(savedBookmarks));
            } catch (error) {
                console.error("Error loading bookmarks:", error);
                toast.error("Failed to load bookmarks");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Mood definitions
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
    ];

    // Filter and sort bookmarked rants
    const filteredAndSortedBookmarks = useMemo(() => {
        let filtered = rants.filter((rant) => bookmarkedRants.has(rant.id));

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((rant) =>
                rant.content.toLowerCase().includes(query) ||
                rant.tags?.some(tag => tag.toLowerCase().includes(query)) ||
                rant.mood.toLowerCase().includes(query)
            );
        }

        // Mood filter
        if (moodFilter !== "all") {
            filtered = filtered.filter((rant) => rant.mood === moodFilter);
        }

        // Sort
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
    }, [rants, bookmarkedRants, searchQuery, moodFilter, sortBy]);

    // Helper functions
    const getMoodIcon = useCallback((mood: string) => {
        return MOODS.find((m) => m.value === mood)?.icon || SmileyMeh;
    }, []);

    const getMoodColor = useCallback((mood: string) => {
        return MOODS.find((m) => m.value === mood)?.color || "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300";
    }, []);

    const formatTimeAgo = useCallback((dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }, []);

    // Unbookmark functionality
    const handleUnbookmark = useCallback((rantId: string) => {
        setBookmarkedRants((prev) => {
            const updated = new Set(prev);
            updated.delete(rantId);
            storageSet("bookmarked_rants", Array.from(updated));
            return updated;
        });
        toast.success("Rant removed from bookmarks");
    }, []);

    // Clear all bookmarks
    const handleClearAllBookmarks = useCallback(() => {
        if (window.confirm("Are you sure you want to remove all bookmarks? This action cannot be undone.")) {
            setBookmarkedRants(new Set());
            storageSet("bookmarked_rants", []);
            toast.success("All bookmarks cleared");
        }
    }, []);

    // Virtualization threshold
    const VIRTUALIZATION_THRESHOLD = 30;
    const isVirtualized = filteredAndSortedBookmarks.length > VIRTUALIZATION_THRESHOLD;

    if (loading) {
        return (
            <div className="min-h-screen bg-background dark:bg-background py-8">
                <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background dark:bg-background py-8">
            <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto">
                {/* Enhanced Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                            <BookmarkSimple weight="duotone" className="w-7 h-7 text-purple-600 dark:text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                Bookmarked Rants
                                <Badge variant="secondary" className="ml-2">
                                    {filteredAndSortedBookmarks.length}
                                </Badge>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Your saved thoughts and expressions
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/" className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Feed
                            </Link>
                        </Button>
                        {bookmarkedRants.size > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleClearAllBookmarks}
                                className="flex items-center gap-2"
                            >
                                <Trash className="w-4 h-4" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>
                <Separator className="mb-6" />

                {/* Search and Filters */}
                <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur mb-6">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                                <Input
                                    placeholder="Search bookmarks by content, tags, or mood..."
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
                                    className="flex items-center gap-2"
                                >
                                    <Funnel className="w-4 h-4" />
                                    Filters
                                    {moodFilter !== "all" && (
                                        <Badge variant="secondary" className="ml-1">
                                            1
                                        </Badge>
                                    )}
                                </Button>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-48">
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
                                            <SelectTrigger className="w-32">
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

                {/* Main Content */}
                {filteredAndSortedBookmarks.length === 0 ? (
                    <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                                <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-4">
                                    <BookmarkSimple weight="duotone" className="w-12 h-12 text-purple-600 dark:text-purple-300" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                        {searchQuery || moodFilter !== "all" ? "No matching bookmarks" : "No bookmarks yet"}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        {searchQuery || moodFilter !== "all"
                                            ? "Try adjusting your search or filters to find what you're looking for."
                                            : "When you bookmark rants, they'll appear here for easy access."
                                        }
                                    </p>
                                </div>
                                <Button asChild>
                                    <Link href="/" className="flex items-center gap-2">
                                        <House className="w-4 h-4" />
                                        Explore Feed
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {isVirtualized ? (
                            <VirtualizedList
                                height={800}
                                itemCount={filteredAndSortedBookmarks.length}
                                itemSize={340}
                                width="100%"
                                className="w-full"
                            >
                                {({ index, style }: ListChildComponentProps) => (
                                    <div style={style} key={filteredAndSortedBookmarks[index].id}>
                                        <EnhancedRantCard
                                            rant={filteredAndSortedBookmarks[index]}
                                            onLike={() => { }}
                                            onBookmark={handleUnbookmark}
                                            onReport={() => { }}
                                            onShare={() => { }}
                                            onBlockUser={() => { }}
                                            onFollowTag={() => { }}
                                            onCommentPost={async () => null as any}
                                            onCommentLike={() => { }}
                                            isLiked={false}
                                            isBookmarked={true}
                                            isUserBlocked={false}
                                            followedTags={new Set()}
                                            getMoodEmoji={() => ""}
                                            getMoodColor={getMoodColor}
                                            formatTimeAgo={formatTimeAgo}
                                            moods={MOODS}
                                            showBookmark={true}
                                            getMoodIcon={getMoodIcon}
                                        />
                                    </div>
                                )}
                            </VirtualizedList>
                        ) : (
                            filteredAndSortedBookmarks.map((rant) => (
                                <EnhancedRantCard
                                    key={rant.id}
                                    rant={rant}
                                    onLike={() => { }}
                                    onBookmark={handleUnbookmark}
                                    onReport={() => { }}
                                    onShare={() => { }}
                                    onBlockUser={() => { }}
                                    onFollowTag={() => { }}
                                    onCommentPost={async () => null as any}
                                    onCommentLike={() => { }}
                                    isLiked={false}
                                    isBookmarked={true}
                                    isUserBlocked={false}
                                    followedTags={new Set()}
                                    getMoodEmoji={() => ""}
                                    getMoodColor={getMoodColor}
                                    formatTimeAgo={formatTimeAgo}
                                    moods={MOODS}
                                    showBookmark={true}
                                    getMoodIcon={getMoodIcon}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
