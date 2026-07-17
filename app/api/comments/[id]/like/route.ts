import { NextResponse } from 'next/server';
import { adjustCommentLikes, ValidationError } from '@/lib/db/repo';
import { rateLimit, clientIp } from '@/lib/db/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    if (!rateLimit(`clike:${clientIp(request)}`, { max: 60, windowMs: 60_000 })) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    let delta = 1;
    try {
        const body = await request.json();
        if (body && typeof body.delta === 'number') delta = body.delta;
    } catch {
        // default delta = 1
    }

    try {
        const likes_count = await adjustCommentLikes(params.id, delta);
        return NextResponse.json({ likes_count });
    } catch (err) {
        if (err instanceof ValidationError) {
            return NextResponse.json({ error: err.message }, { status: 404 });
        }
        console.error('POST /api/comments/[id]/like failed:', err);
        return NextResponse.json({ error: 'Failed to update likes.' }, { status: 500 });
    }
}
