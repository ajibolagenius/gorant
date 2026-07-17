"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { EnhancedRantCard, Rant } from "@/components/enhanced-rant-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, SignIn, SignOut, PaperPlaneRight } from "@phosphor-icons/react";
import { toast } from "sonner";
import { getAnonymousId } from "@/lib/utils";
import { storageGet, storageSet } from "@/lib/storage";
import { createRantApi, likeRantApi } from "@/lib/api/feed";
import { MOODS, getMoodIcon, getMoodColor, formatTimeAgo } from "@/components/mood-config";
import { fetchGroupApi, setGroupMembershipApi, type Group } from "@/lib/api/groups";

const MAX_RANT_LENGTH = 500;

export default function GroupDetailClient({ id }: { id: string }) {
    const [group, setGroup] = useState<Group | null>(null);
    const [rants, setRants] = useState<Rant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [membershipBusy, setMembershipBusy] = useState(false);

    // Composer
    const [content, setContent] = useState("");
    const [mood, setMood] = useState("neutral");
    const [posting, setPosting] = useState(false);

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
        fetchGroupApi(id, getAnonymousId())
            .then((data) => {
                if (cancelled) return;
                setGroup(data.group);
                setRants(data.rants);
            })
            .catch((err) => {
                if (!cancelled) setError(err?.message || "Failed to load group.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleMembership = useCallback(async () => {
        if (!group) return;
        const anonymousId = getAnonymousId();
        if (!anonymousId) return;
        setMembershipBusy(true);
        try {
            const updated = await setGroupMembershipApi(group.id, anonymousId, !group.is_member);
            setGroup(updated);
            toast.success(updated.is_member ? `Joined ${updated.name}!` : `Left ${updated.name}.`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update membership.");
        } finally {
            setMembershipBusy(false);
        }
    }, [group]);

    const handlePost = useCallback(async () => {
        if (!group || !content.trim()) return;
        const anonymousId = getAnonymousId();
        if (!anonymousId) return;
        setPosting(true);
        try {
            const rant = await createRantApi(content.trim(), mood, [], anonymousId, group.id);
            setRants((prev) => [rant, ...prev]);
            setGroup((prev) => (prev ? { ...prev, rants_count: prev.rants_count + 1 } : prev));
            setContent("");
            setMood("neutral");
            toast.success("Rant posted to the group!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to post rant.");
        } finally {
            setPosting(false);
        }
    }, [group, content, mood]);

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

    const MoodIcon = getMoodIcon(group?.mood || "neutral");

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto w-full max-w-3xl px-4">
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/groups">
                            <ArrowLeft className="w-4 h-4 mr-1" weight="bold" />
                            All groups
                        </Link>
                    </Button>
                </div>

                {error ? (
                    <Card className="border-0 bg-card/80">
                        <CardContent className="py-10 text-center text-muted-foreground">
                            {error}
                        </CardContent>
                    </Card>
                ) : loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-28 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                ) : group ? (
                    <>
                        {/* Group header */}
                        <Card className="shadow-sm border-0 bg-card/80 backdrop-blur mb-6">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className={`rounded-full p-4 shrink-0 ${getMoodColor(group.mood)}`}>
                                        <MoodIcon weight="duotone" className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl font-bold text-foreground">{group.name}</h1>
                                        {group.description && (
                                            <p className="text-sm text-muted-foreground mt-1 break-words">
                                                {group.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                            <span>
                                                <span className="font-semibold text-foreground">{group.members_count}</span>{" "}
                                                {group.members_count === 1 ? "member" : "members"}
                                            </span>
                                            <span>
                                                <span className="font-semibold text-foreground">{group.rants_count}</span>{" "}
                                                {group.rants_count === 1 ? "rant" : "rants"}
                                            </span>
                                            {group.is_member && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    Joined
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant={group.is_member ? "outline" : "default"}
                                        size="sm"
                                        onClick={handleMembership}
                                        disabled={membershipBusy}
                                    >
                                        {group.is_member ? (
                                            <>
                                                <SignOut className="w-4 h-4 mr-1" weight="bold" />
                                                Leave
                                            </>
                                        ) : (
                                            <>
                                                <SignIn className="w-4 h-4 mr-1" weight="bold" />
                                                Join
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Composer — members only */}
                        {group.is_member && (
                            <Card className="shadow-sm border-0 bg-card/80 backdrop-blur mb-6">
                                <CardContent className="pt-6 space-y-3">
                                    <Textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value.slice(0, MAX_RANT_LENGTH))}
                                        maxLength={MAX_RANT_LENGTH}
                                        rows={3}
                                        placeholder={`Rant to ${group.name}…`}
                                    />
                                    <div className="flex items-center justify-between gap-3">
                                        <Select value={mood} onValueChange={setMood}>
                                            <SelectTrigger className="w-40" aria-label="Select mood">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MOODS.map((m) => (
                                                    <SelectItem key={m.value} value={m.value}>
                                                        {m.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                {content.length}/{MAX_RANT_LENGTH}
                                            </span>
                                            <Button onClick={handlePost} disabled={posting || !content.trim()}>
                                                <PaperPlaneRight className="w-4 h-4 mr-1" weight="bold" />
                                                {posting ? "Posting…" : "Post"}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Group feed */}
                        {rants.length === 0 ? (
                            <Card className="border-0 bg-card/80">
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    {group.is_member
                                        ? "No rants here yet. Start the conversation!"
                                        : "No rants here yet. Join the group to post the first one."}
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
                    </>
                ) : null}
            </div>
        </div>
    );
}
