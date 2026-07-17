"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { EnhancedRantCard, Rant } from "@/components/enhanced-rant-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    ArrowLeft,
    PencilSimple,
    ChatCircle,
    Heart as HeartIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { getAnonymousId, friendlyNameFromId } from "@/lib/utils";
import { storageGet, storageSet } from "@/lib/storage";
import { fetchProfileApi, type AuthorStats, type Profile } from "@/lib/api/profiles";
import { likeRantApi } from "@/lib/api/feed";

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

function getMoodIcon(mood: string) {
    return MOODS.find((m) => m.value === mood)?.icon || SmileyMeh;
}
function getMoodColor(mood: string) {
    return (
        MOODS.find((m) => m.value === mood)?.color ||
        "bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300"
    );
}
function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
}
function formatJoinDate(dateString: string | null) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
    });
}

export default function ProfileClient({ id }: { id: string }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<AuthorStats>({
        rants_count: 0,
        likes_received: 0,
        first_seen: null,
    });
    const [rants, setRants] = useState<Rant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    const [likedRants, setLikedRants] = useState<Set<string>>(new Set());
    const [bookmarkedRants, setBookmarkedRants] = useState<Set<string>>(new Set());

    useEffect(() => {
        setIsOwnProfile(getAnonymousId() === id);
        try {
            const storedLikes = JSON.parse(localStorage.getItem("likedRants") || "[]");
            setLikedRants(new Set(Array.isArray(storedLikes) ? storedLikes : []));
        } catch {
            /* ignore */
        }
        setBookmarkedRants(new Set(storageGet<string[]>("bookmarked_rants", []) ?? []));
    }, [id]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchProfileApi(id)
            .then((data) => {
                if (cancelled) return;
                setProfile(data.profile);
                setStats(data.stats);
                setRants(data.rants);
            })
            .catch((err) => {
                if (!cancelled) setError(err?.message || "Failed to load profile.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

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

    const displayName = profile?.display_name?.trim() || friendlyNameFromId(id);
    const AvatarIcon = getMoodIcon(profile?.avatar_mood || "neutral");
    const avatarColor = getMoodColor(profile?.avatar_mood || "neutral");
    const joinDate = formatJoinDate(stats.first_seen || profile?.created_at || null);

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto w-full max-w-3xl px-4">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 mr-1" weight="bold" />
                            Back to feed
                        </Link>
                    </Button>
                </div>

                {/* Profile header */}
                <Card className="shadow-sm border-0 bg-card/80 backdrop-blur mb-6">
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-56" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                <div className={`rounded-full p-4 ${avatarColor}`}>
                                    <AvatarIcon weight="duotone" className="w-8 h-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-xl font-bold text-foreground truncate">
                                            {displayName}
                                        </h1>
                                        {isOwnProfile && (
                                            <Badge variant="secondary" className="text-xs">
                                                This is you
                                            </Badge>
                                        )}
                                    </div>
                                    {profile?.bio ? (
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">
                                            {profile.bio}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground/70 mt-1 italic">
                                            {isOwnProfile
                                                ? "You haven't added a bio yet."
                                                : "No bio yet."}
                                        </p>
                                    )}
                                    {joinDate && (
                                        <p className="text-xs text-muted-foreground/70 mt-2">
                                            Active since {joinDate}
                                        </p>
                                    )}
                                </div>
                                {isOwnProfile && (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/settings">
                                            <PencilSimple className="w-4 h-4 mr-1" weight="bold" />
                                            Edit profile
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Stat tiles */}
                        {!loading && (
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <div className="rounded-lg bg-muted/50 p-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground">
                                        <ChatCircle className="w-5 h-5 text-muted-foreground" weight="duotone" />
                                        {stats.rants_count}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {stats.rants_count === 1 ? "Rant" : "Rants"}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground">
                                        <HeartIcon className="w-5 h-5 text-rose-500" weight="duotone" />
                                        {stats.likes_received}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Likes received
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Activity */}
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                    Rants
                </h2>

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
                        <CardContent className="py-10 text-center text-muted-foreground">
                            {isOwnProfile
                                ? "You haven't posted any rants yet."
                                : "This user hasn't posted any rants yet."}
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
