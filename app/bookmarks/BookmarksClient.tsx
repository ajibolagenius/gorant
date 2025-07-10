"use client";

import { useEffect, useState } from "react";
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
    SmileySticker
} from "phosphor-react"

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

    const bookmarked = rants.filter((rant) => bookmarkedRants.has(rant.id));

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
    const getMoodIcon = (mood: string) => {
        return MOODS.find((m) => m.value === mood)?.icon || SmileyMeh
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-8">
            <div className="container mx-auto max-w-2xl px-4 mb-safe-bottom wrap-screen">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bookmarked Rants</h1>
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-800 transition"
                    >
                        Back to Feed
                    </Link>
                </div>
                {bookmarked.length === 0 ? (
                    <Card className="p-8 text-center text-gray-500 dark:text-gray-300">No bookmarks yet.</Card>
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
                                    onBookmark={() => { }}
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
                                    showBookmark={false}
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
                                onBookmark={() => { }}
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
                                showBookmark={false}
                                getMoodIcon={getMoodIcon}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
