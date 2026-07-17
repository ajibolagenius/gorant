import { NextResponse } from 'next/server';
import { followUser, unfollowUser, getFollowCounts, ValidationError } from '@/lib/db/repo';
import { rateLimit, clientIp } from '@/lib/db/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST   /api/profiles/[id]/follow  — follow the identity [id]
 * DELETE /api/profiles/[id]/follow  — unfollow the identity [id]
 *
 * Body: { followerId }. The follower is identified by the client-supplied
 * anonymous_id. This is not a secret, so it's spam mitigation, not real auth.
 */
async function readFollowerId(request: Request): Promise<string | null> {
    try {
        const body = await request.json();
        const id = (body?.followerId || '').slice(0, 64);
        return id || null;
    } catch {
        return null;
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    const followeeId = decodeURIComponent(params.id || '').slice(0, 64);
    if (!followeeId) {
        return NextResponse.json({ error: 'Missing profile id.' }, { status: 400 });
    }
    if (!rateLimit(`follow:${clientIp(request)}`, { max: 60, windowMs: 60_000 })) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const followerId = await readFollowerId(request);
    if (!followerId) {
        return NextResponse.json({ error: 'followerId is required.' }, { status: 400 });
    }

    try {
        await followUser(followerId, followeeId);
        const counts = await getFollowCounts(followeeId);
        return NextResponse.json({ following: true, counts });
    } catch (err) {
        if (err instanceof ValidationError) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }
        console.error('POST /api/profiles/[id]/follow failed:', err);
        return NextResponse.json({ error: 'Failed to follow.' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const followeeId = decodeURIComponent(params.id || '').slice(0, 64);
    if (!followeeId) {
        return NextResponse.json({ error: 'Missing profile id.' }, { status: 400 });
    }
    if (!rateLimit(`follow:${clientIp(request)}`, { max: 60, windowMs: 60_000 })) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const followerId = await readFollowerId(request);
    if (!followerId) {
        return NextResponse.json({ error: 'followerId is required.' }, { status: 400 });
    }

    try {
        await unfollowUser(followerId, followeeId);
        const counts = await getFollowCounts(followeeId);
        return NextResponse.json({ following: false, counts });
    } catch (err) {
        if (err instanceof ValidationError) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }
        console.error('DELETE /api/profiles/[id]/follow failed:', err);
        return NextResponse.json({ error: 'Failed to unfollow.' }, { status: 500 });
    }
}
