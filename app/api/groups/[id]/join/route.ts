import { NextResponse } from 'next/server';
import { joinGroup, leaveGroup, getGroup, ValidationError } from '@/lib/db/repo';
import { rateLimit, clientIp } from '@/lib/db/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST   /api/groups/[id]/join — join the group
 * DELETE /api/groups/[id]/join — leave the group
 * Body: { anonymousId }
 */
async function readAnonymousId(request: Request): Promise<string | null> {
    try {
        const body = await request.json();
        const id = (body?.anonymousId || '').slice(0, 64);
        return id || null;
    } catch {
        return null;
    }
}

async function handle(
    request: Request,
    groupIdRaw: string,
    action: 'join' | 'leave'
) {
    const groupId = decodeURIComponent(groupIdRaw || '').slice(0, 64);
    if (!groupId) {
        return NextResponse.json({ error: 'Missing group id.' }, { status: 400 });
    }
    if (!rateLimit(`group-join:${clientIp(request)}`, { max: 30, windowMs: 60_000 })) {
        return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const anonymousId = await readAnonymousId(request);
    if (!anonymousId) {
        return NextResponse.json({ error: 'anonymousId is required.' }, { status: 400 });
    }

    try {
        if (action === 'join') await joinGroup(groupId, anonymousId);
        else await leaveGroup(groupId, anonymousId);
        const group = await getGroup(groupId, anonymousId);
        return NextResponse.json({ group });
    } catch (err) {
        if (err instanceof ValidationError) {
            return NextResponse.json({ error: err.message }, { status: 400 });
        }
        console.error(`${action} group failed:`, err);
        return NextResponse.json({ error: `Failed to ${action} group.` }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    return handle(request, params.id, 'join');
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    return handle(request, params.id, 'leave');
}
