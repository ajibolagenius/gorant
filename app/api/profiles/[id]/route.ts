import { NextResponse } from 'next/server';
import {
    getProfile,
    upsertProfile,
    getAuthorStats,
    listRantsByAuthor,
    getFollowCounts,
    isFollowing,
    ValidationError,
} from '@/lib/db/repo';
import { rateLimit, clientIp } from '@/lib/db/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/profiles/[id]
 * Returns the public profile for an anonymous_id: profile row (or null),
 * aggregate stats, and the author's rants. Anyone can read any profile.
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = decodeURIComponent(params.id || '').slice(0, 64);
    if (!id) {
        return NextResponse.json({ error: 'Missing profile id.' }, { status: 400 });
    }

    // Optional viewer id lets us report whether the viewer follows this profile.
    const viewer = (new URL(request.url).searchParams.get('viewer') || '').slice(0, 64);

    try {
        const [profile, stats, rants, followCounts, viewerFollows] = await Promise.all([
            getProfile(id),
            getAuthorStats(id),
            listRantsByAuthor(id, { limit: 50 }),
            getFollowCounts(id),
            viewer ? isFollowing(viewer, id) : Promise.resolve(false),
        ]);
        return NextResponse.json({
            id,
            profile,
            stats,
            rants,
            followCounts,
            isFollowing: viewerFollows,
        });
    } catch (err) {
        console.error('GET /api/profiles/[id] failed:', err);
        return NextResponse.json({ error: 'Failed to load profile.' }, { status: 500 });
    }
}

/**
 * PUT /api/profiles/[id]
 * Create or update a profile. The body must carry `anonymousId` matching the
 * path id — a best-effort guard so a visitor can only edit their own profile.
 * (The anonymous_id is not a secret, so this is spam mitigation, not real auth.)
 */
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = decodeURIComponent(params.id || '').slice(0, 64);
    if (!id) {
        return NextResponse.json({ error: 'Missing profile id.' }, { status: 400 });
    }

    if (!rateLimit(`profile:${clientIp(request)}`, { max: 10, windowMs: 60_000 })) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    let body: {
        anonymousId?: string;
        displayName?: string;
        bio?: string;
        avatarMood?: string;
    };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if ((body.anonymousId || '').slice(0, 64) !== id) {
        return NextResponse.json(
            { error: 'You can only edit your own profile.' },
            { status: 403 }
        );
    }

    try {
        const profile = await upsertProfile({
            anonymousId: id,
            displayName: body.displayName,
            bio: body.bio,
            avatarMood: body.avatarMood,
        });
        return NextResponse.json({ profile });
    } catch (err) {
        if (err instanceof ValidationError) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }
        console.error('PUT /api/profiles/[id] failed:', err);
        return NextResponse.json({ error: 'Failed to save profile.' }, { status: 500 });
    }
}
