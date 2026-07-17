import { NextResponse } from 'next/server';
import { listRants, createRant, ValidationError } from '@/lib/db/repo';
import { rateLimit, clientIp } from '@/lib/db/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mood = searchParams.get('mood') || undefined;
    const sortBy = (searchParams.get('sortBy') as
        | 'latest'
        | 'popular'
        | 'most_liked'
        | null) || undefined;
    const limit = searchParams.get('limit')
        ? Number(searchParams.get('limit'))
        : undefined;
    const offset = searchParams.get('offset')
        ? Number(searchParams.get('offset'))
        : undefined;

    try {
        const rants = await listRants({ mood, sortBy: sortBy ?? undefined, limit, offset });
        return NextResponse.json({ rants });
    } catch (err) {
        console.error('GET /api/rants failed:', err);
        return NextResponse.json({ error: 'Failed to load rants.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!rateLimit(`rant:${clientIp(request)}`, { max: 5, windowMs: 60_000 })) {
        return NextResponse.json(
            { error: 'You are posting too fast. Please wait a moment.' },
            { status: 429 }
        );
    }

    let body: { content?: string; mood?: string; tags?: string[]; anonymousId?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    try {
        const rant = await createRant({
            content: body.content ?? '',
            mood: body.mood ?? '',
            tags: body.tags,
            anonymousId: body.anonymousId ?? 'anon_unknown',
        });
        return NextResponse.json({ rant }, { status: 201 });
    } catch (err) {
        if (err instanceof ValidationError) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }
        console.error('POST /api/rants failed:', err);
        return NextResponse.json({ error: 'Failed to create rant.' }, { status: 500 });
    }
}
