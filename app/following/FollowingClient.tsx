"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { EnhancedRantCard, Rant } from "@/components/enhanced-rant-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, UsersThree } from "@phosphor-icons/react";
import { toast } from "sonner";
import { getAnonymousId } from "@/lib/utils";
import { storageGet, storageSet } from "@/lib/storage";
import { fetchFollowingRantsApi, likeRantApi } from "@/lib/api/feed";
import { MOODS, getMoodIcon, getMoodColor, formatTimeAgo } from "@/components/mood-config";

export default function FollowingClient() {
    const [rants, setRants] = useState<Rant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [likedRants, setLikedRants] = useState<Set<string>>(new Set());
    const [bookmarkedRants, setBookmarkedRants] = useState<Set<string>>(new Set());

    useEffect(() => {
        try {
            const storedLikes = JSON.parse(localStorage.getItem("likedRants") || "[]");
            setLikedRants(new Set(Array.isArray(storedLikes) ? storedLikes : []));
        } catch {
            /* ignore */
        }
        setBookmarkedRants(new Set(storageGet<string[]>("bookmarked_rants", []) ?? []));

        let cancelled = false;
        fetchFollowingRantsApi(getAnonymousId())
            .then((data) => {
                if (!cancelled) setRants(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err?.message || "Failed to load following feed.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleLike = useCallback(
        async (rantId: string) => {
            const isLiked = likedRants.has(rantId);
            setRants((prev) =>
                prev.map((r) =>
                    r.id === rantId
                        ? {
                              ...r,
                              likes_count: isLiked
                                  ? Math.max((r.likes_count || 1) - 1, 0)
                                  : (r.likes_count || 0) + 1,
                          }
                        : r
                )
            );
            setLikedRants((prev) => {
                const next = new Set(prev);
                if (isLiked) next.delete(rantId);
                else next.add(rantId);
                localStorage.setItem("likedRants", JSON.stringify(Array.from(next)));
                return next;
            });
            try {
                await likeRantApi(rantId, isLiked ? -1 : 1);
            } catch {
                toast.error(isLiked ? "Failed to unlike rant." : "Failed to like rant.");
            }
        },
        [likedRants]
    );

    const handleBookmark = useCallback((rantId: string) => {
        setBookmarkedRants((prev) => {
            const next = new Set(prev);
            if (next.has(rantId)) {
                next.delete(rantId);
                toast.info("Bookmark removed.");
            } else {
                next.add(rantId);
                toast.success("Rant bookmarked.");
            }
            storageSet("bookmarked_rants", Array.from(next));
            return next;
        });
    }, []);

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto w-full max-w-3xl px-4">
                <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 mr-1" weight="bold" />
                            Back to feed
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                        <UsersThree weight="duotone" className="w-7 h-7 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Following</h1>
                        <p className="text-sm text-muted-foreground">
                            The latest rants from people you follow.
                        </p>
                    </div>
                </div>

                {error ? (
                    <Card className="border-0 bg-card/80">
                        <CardContent className="py-10 text-center text-muted-foreground">
                            {error}
                        </CardContent>
                    </Card>
                ) : loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                ) : rants.length === 0 ? (
                    <Card className="border-0 bg-card/80">
                        <CardContent className="py-12 text-center space-y-3">
                            <p className="text-muted-foreground">
                                Nothing here yet. Follow someone from their profile and their
                                rants will show up in this feed.
                            </p>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/">Browse the feed</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {rants.map((rant) => (
                            <EnhancedRantCard
                                key={rant.id}
                                rant={rant}
                                onLike={handleLike}
                                onBookmark={handleBookmark}
                                onReport={() => {}}
                                onShare={() => {}}
                                onBlockUser={() => {}}
                                onFollowTag={() => {}}
                                onCommentPost={async () => null as any}
                                onCommentLike={() => {}}
                                isLiked={likedRants.has(rant.id)}
                                isBookmarked={bookmarkedRants.has(rant.id)}
                                isUserBlocked={false}
                                followedTags={new Set()}
                                getMoodColor={getMoodColor}
                                getMoodIcon={getMoodIcon}
                                formatTimeAgo={formatTimeAgo}
                                moods={MOODS}
                                showBookmark={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
