import { Rant } from '@/components/enhanced-rant-card';
import { normalizeRant } from '@/lib/utils';

/**
 * Browser-side client for the pseudonymous-profile API (/app/api/profiles/*).
 * All reads/writes go through server route handlers.
 */

export interface Profile {
    anonymous_id: string;
    display_name: string;
    bio: string;
    avatar_mood: string;
    created_at: string;
    updated_at: string;
}

export interface AuthorStats {
    rants_count: number;
    likes_received: number;
    first_seen: string | null;
}

export interface ProfileResponse {
    id: string;
    profile: Profile | null;
    stats: AuthorStats;
    rants: Rant[];
}

async function parseError(res: Response, fallback: string): Promise<string> {
    try {
        const data = await res.json();
        return data?.error || fallback;
    } catch {
        return fallback;
    }
}

export async function fetchProfileApi(id: string): Promise<ProfileResponse> {
    const res = await fetch(`/api/profiles/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to load profile.'));
    const data = await res.json();
    return {
        id: data.id,
        profile: data.profile ?? null,
        stats: data.stats ?? { rants_count: 0, likes_received: 0, first_seen: null },
        rants: (data.rants || []).map(normalizeRant),
    };
}

export async function updateProfileApi(
    anonymousId: string,
    input: { displayName: string; bio: string; avatarMood: string }
): Promise<Profile> {
    const res = await fetch(`/api/profiles/${encodeURIComponent(anonymousId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId, ...input }),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to save profile.'));
    const { profile } = await res.json();
    return profile as Profile;
}
