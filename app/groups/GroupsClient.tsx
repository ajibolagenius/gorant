"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UsersFour, Plus, SignIn, SignOut, ChatCircle, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import { getAnonymousId } from "@/lib/utils";
import { getMoodIcon, getMoodColor, MOODS } from "@/components/mood-config";
import {
    fetchGroupsApi,
    createGroupApi,
    setGroupMembershipApi,
    type Group,
} from "@/lib/api/groups";

export default function GroupsClient() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyGroupId, setBusyGroupId] = useState<string | null>(null);

    // Create form
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [mood, setMood] = useState("neutral");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetchGroupsApi(getAnonymousId())
            .then((data) => {
                if (!cancelled) setGroups(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err?.message || "Failed to load groups.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleCreate = useCallback(async () => {
        const anonymousId = getAnonymousId();
        if (!anonymousId || !name.trim()) return;
        setCreating(true);
        try {
            const group = await createGroupApi({
                name: name.trim(),
                description: description.trim(),
                mood,
                anonymousId,
            });
            setGroups((prev) => [group, ...prev]);
            setName("");
            setDescription("");
            setMood("neutral");
            setShowCreate(false);
            toast.success(`Group "${group.name}" created!`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create group.");
        } finally {
            setCreating(false);
        }
    }, [name, description, mood]);

    const handleMembership = useCallback(async (group: Group) => {
        const anonymousId = getAnonymousId();
        if (!anonymousId) return;
        setBusyGroupId(group.id);
        try {
            const updated = await setGroupMembershipApi(group.id, anonymousId, !group.is_member);
            setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
            toast.success(updated.is_member ? `Joined ${updated.name}!` : `Left ${updated.name}.`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update membership.");
        } finally {
            setBusyGroupId(null);
        }
    }, []);

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto w-full max-w-3xl px-4">
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                            <UsersFour weight="duotone" className="w-7 h-7 text-purple-600 dark:text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Groups</h1>
                            <p className="text-sm text-muted-foreground">
                                Find your people. Rant together.
                            </p>
                        </div>
                    </div>
                    <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
                        {showCreate ? (
                            <>
                                <X className="w-4 h-4 mr-1" weight="bold" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-1" weight="bold" />
                                New group
                            </>
                        )}
                    </Button>
                </div>

                {showCreate && (
                    <Card className="shadow-sm border-0 bg-card/80 backdrop-blur mb-6">
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-card-foreground">Create a group</h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="group-name">Name</Label>
                                <Input
                                    id="group-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value.slice(0, 50))}
                                    maxLength={50}
                                    placeholder="e.g. Night Shift Workers"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="group-description">Description</Label>
                                <Textarea
                                    id="group-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                                    maxLength={200}
                                    rows={2}
                                    placeholder="What is this group about? (optional)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="group-mood">Vibe</Label>
                                <Select value={mood} onValueChange={setMood}>
                                    <SelectTrigger id="group-mood" className="w-full sm:w-56">
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
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleCreate} disabled={creating || !name.trim()}>
                                    {creating ? "Creating…" : "Create group"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {error ? (
                    <Card className="border-0 bg-card/80">
                        <CardContent className="py-10 text-center text-muted-foreground">
                            {error}
                        </CardContent>
                    </Card>
                ) : loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                ) : groups.length === 0 ? (
                    <Card className="border-0 bg-card/80">
                        <CardContent className="py-12 text-center space-y-3">
                            <p className="text-muted-foreground">
                                No groups yet. Be the first to create one!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {groups.map((group) => {
                            const MoodIcon = getMoodIcon(group.mood);
                            return (
                                <Card key={group.id} className="shadow-sm border-0 bg-card/80 backdrop-blur">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`rounded-full p-3 shrink-0 ${getMoodColor(group.mood)}`}>
                                                <MoodIcon weight="duotone" className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/groups/${encodeURIComponent(group.id)}`}
                                                    className="text-lg font-semibold text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                                >
                                                    {group.name}
                                                </Link>
                                                {group.description && (
                                                    <p className="text-sm text-muted-foreground mt-0.5 break-words">
                                                        {group.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                                    <span>
                                                        <span className="font-semibold text-foreground">{group.members_count}</span>{" "}
                                                        {group.members_count === 1 ? "member" : "members"}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ChatCircle className="w-3.5 h-3.5" weight="duotone" />
                                                        {group.rants_count} {group.rants_count === 1 ? "rant" : "rants"}
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
                                                onClick={() => handleMembership(group)}
                                                disabled={busyGroupId === group.id}
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
