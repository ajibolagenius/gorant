import { Rant, Comment } from '@/components/enhanced-rant-card';
import { normalizeRant } from '@/lib/utils';

/**
 * Browser-side client for the Turso-backed demo API (/app/api/*).
 * Replaces the previous direct Supabase calls. All reads/writes go through
 * server route handlers so the database credentials stay on the server.
 */

async function parseError(res: Response, fallback: string): Promise<string> {
    try {
        const data = await res.json();
        return data?.error || fallback;
    } catch {
        return fallback;
    }
}

export async function fetchRantsApi(): Promise<Rant[]> {
    const res = await fetch('/api/rants', { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to load rants.'));
    const { rants } = await res.json();
    return (rants || []).map(normalizeRant);
}

export async function fetchFollowingRantsApi(viewerId: string): Promise<Rant[]> {
    if (!viewerId) return [];
    const res = await fetch(`/api/rants/following?viewer=${encodeURIComponent(viewerId)}`, {
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to load following feed.'));
    const { rants } = await res.json();
    return (rants || []).map(normalizeRant);
}

export async function fetchCommentsApi(
    rantIds: string[]
): Promise<{ [key: string]: Comment[] }> {
    if (!rantIds.length) return {};
    const qs = encodeURIComponent(rantIds.join(','));
    const res = await fetch(`/api/comments?rantIds=${qs}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to load comments.'));
    const { comments } = await res.json();
    return comments || {};
}

export async function createRantApi(
    content: string,
    mood: string,
    tags: string[],
    anonymousId: string
): Promise<Rant> {
    const res = await fetch('/api/rants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mood, tags, anonymousId }),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to post rant.'));
    const { rant } = await res.json();
    return normalizeRant(rant);
}

export async function createCommentApi(
    rantId: string,
    content: string,
    anonymousId: string
): Promise<Comment> {
    const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rantId, content, anonymousId }),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to post comment.'));
    const { comment } = await res.json();
    return comment as Comment;
}

export async function likeRantApi(rantId: string, delta: number): Promise<number> {
    const res = await fetch(`/api/rants/${rantId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to update likes.'));
    const { likes_count } = await res.json();
    return likes_count as number;
}

export async function likeCommentApi(commentId: string, delta: number): Promise<number> {
    const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
    });
    if (!res.ok) throw new Error(await parseError(res, 'Failed to update likes.'));
    const { likes_count } = await res.json();
    return likes_count as number;
}
