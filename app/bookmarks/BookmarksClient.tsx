"use client";

import { useEffect, useState } from "react";
import { EnhancedRantCard, Rant } from "@/components/enhanced-rant-card";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function BookmarksClient() {
    const [rants, setRants] = useState<Rant[]>([]);
    const [bookmarkedRants, setBookmarkedRants] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Load rants and bookmarks from localStorage (or fetch from API if needed)
        const savedRants = localStorage.getItem("all_rants");
        const savedBookmarks = localStorage.getItem("bookmarked_rants");
        if (savedRants) setRants(JSON.parse(savedRants));
        if (savedBookmarks) setBookmarkedRants(new Set(JSON.parse(savedBookmarks)));
    }, []);

    const bookmarked = rants.filter((rant) => bookmarkedRants.has(rant.id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-8">
            <div className="container mx-auto max-w-2xl px-4">
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
                                moods={[]}
                                showBookmark={false}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
