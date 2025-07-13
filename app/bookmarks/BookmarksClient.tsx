"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { EnhancedRantCard, Rant } from "@/components/enhanced-rant-card";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { storageGet } from "@/lib/storage"
import { FixedSizeList as VirtualizedList, ListChildComponentProps } from "react-window"
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
    BookmarkSimple
} from "phosphor-react"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"

export default function BookmarksClient() {
    const [rants, setRants] = useState<Rant[]>([]);
    const [bookmarkedRants, setBookmarkedRants] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Load rants and bookmarks from localStorage (or fetch from API if needed)
        const savedRants = storageGet<Rant[]>("all_rants", []);
        const savedBookmarks = storageGet<string[]>("bookmarked_rants", []);
        setRants(savedRants);
        setBookmarkedRants(new Set(savedBookmarks));
    }, []);

    const bookmarked = useMemo(() => rants.filter((rant) => bookmarkedRants.has(rant.id)), [rants, bookmarkedRants]);

    // Helper to determine virtualization
    const VIRTUALIZATION_THRESHOLD = 30;
    const isVirtualized = bookmarked.length > VIRTUALIZATION_THRESHOLD;

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
    const getMoodIcon = useCallback((mood: string) => {
        return MOODS.find((m) => m.value === mood)?.icon || SmileyMeh
    }, []);

    // Unbookmark functionality
    const handleUnbookmark = useCallback((rantId: string) => {
        setBookmarkedRants((prev) => {
            const updated = new Set(prev);
            updated.delete(rantId);
            // Update localStorage
            localStorage.setItem("bookmarked_rants", JSON.stringify(Array.from(updated)));
            return updated;
        });
    }, []);

    return (
        <div className="min-h-screen bg-background dark:bg-background py-8">
            <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto">
                {/* Enhanced Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-accent p-3">
                            <BookmarkSimple weight="duotone" className="w-7 h-7 text-accent-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                                Bookmarked Rants
                                <span className="inline-block bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded ml-2">
                                    {bookmarked.length}
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1">All your saved rants in one place.</p>
                        </div>
                    </div>
                </div>
                <Separator className="mb-6" />
                {/* Main Content */}
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-sm p-6 min-h-[300px]">
                    {bookmarked.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-4">
                            <BookmarkSimple weight="duotone" className="w-14 h-14 text-purple-300 mb-2" />
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">No bookmarks yet</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-2">You haven’t bookmarked any rants. When you do, they’ll show up here!</p>
                            <Link href="/">
                                <Button variant="outline" className="inline-flex items-center gap-2">
                                    <House weight="duotone" className="w-4 h-4" />
                                    Go to Feed
                                </Button>
                            </Link>
                        </div>
                    ) : isVirtualized ? (
                        <VirtualizedList
                            height={800}
                            itemCount={bookmarked.length}
                            itemSize={340}
                            width={"100%"}
                            className="w-full"
                        >
                            {({ index, style }: ListChildComponentProps) => (
                                <div style={style} key={bookmarked[index].id}>
                                    <EnhancedRantCard
                                        rant={bookmarked[index]}
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
                                        getMoodColor={() => ""}
                                        formatTimeAgo={() => ""}
                                        moods={MOODS}
                                        showBookmark={true}
                                        getMoodIcon={getMoodIcon}
                                    />
                                </div>
                            )}
                        </VirtualizedList>
                    ) : (
                        <div className="space-y-6">
                            {bookmarked.map((rant) => (
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
                                    getMoodColor={() => ""}
                                    formatTimeAgo={() => ""}
                                    moods={MOODS}
                                    showBookmark={true}
                                    getMoodIcon={getMoodIcon}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
