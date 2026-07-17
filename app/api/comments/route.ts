import { NextResponse } from 'next/server';
import { listComments, createComment, ValidationError } from '@/lib/db/repo';
import { rateLimit, clientIp } from '@/lib/db/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rantIdsParam = searchParams.get('rantIds') || '';
    const rantIds = rantIdsParam.split(',').map((s) => s.trim()).filter(Boolean);

    try {
        const comments = await listComments(rantIds);
        return NextResponse.json({ comments });
    } catch (err) {
        console.error('GET /api/comments failed:', err);
        return NextResponse.json({ error: 'Failed to load comments.' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!rateLimit(`comment:${clientIp(request)}`, { max: 10, windowMs: 60_000 })) {
        return NextResponse.json(
            { error: 'You are commenting too fast. Please wait a moment.' },
            { status: 429 }
        );
    }

    let body: { rantId?: string; content?: string; anonymousId?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    try {
        const comment = await createComment({
            rantId: body.rantId ?? '',
            content: body.content ?? '',
            anonymousId: body.anonymousId ?? 'anon_unknown',
        });
        return NextResponse.json({ comment }, { status: 201 });
    } catch (err) {
        if (err instanceof ValidationError) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }
        console.error('POST /api/comments failed:', err);
        return NextResponse.json({ error: 'Failed to create comment.' }, { status: 500 });
    }
}
