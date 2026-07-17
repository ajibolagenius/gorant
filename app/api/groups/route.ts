import { NextResponse } from 'next/server';
import { listGroups, createGroup, ValidationError } from '@/lib/db/repo';
import { rateLimit, clientIp } from '@/lib/db/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/groups?viewer=<anonymous_id>
 * All groups with member/rant counts; viewer marks which ones they joined.
 */
export async function GET(request: Request) {
    const viewer = (new URL(request.url).searchParams.get('viewer') || '').slice(0, 64);
    try {
        const groups = await listGroups(viewer || undefined);
        return NextResponse.json({ groups });
    } catch (err) {
        console.error('GET /api/groups failed:', err);
        return NextResponse.json({ error: 'Failed to load groups.' }, { status: 500 });
    }
}

/**
 * POST /api/groups
 * Body: { name, description?, mood?, anonymousId }. Creator auto-joins.
 */
export async function POST(request: Request) {
    if (!rateLimit(`group:${clientIp(request)}`, { max: 3, windowMs: 60_000 })) {
        return NextResponse.json(
            { error: 'You are creating groups too fast. Please wait a moment.' },
            { status: 429 }
        );
    }

    let body: { name?: string; description?: string; mood?: string; anonymousId?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    try {
        const group = await createGroup({
            name: body.name ?? '',
            description: body.description,
            mood: body.mood,
            createdBy: body.anonymousId ?? '',
        });
        return NextResponse.json({ group }, { status: 201 });
    } catch (err) {
        if (err instanceof ValidationError) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }
        console.error('POST /api/groups failed:', err);
        return NextResponse.json({ error: 'Failed to create group.' }, { status: 500 });
    }
}
