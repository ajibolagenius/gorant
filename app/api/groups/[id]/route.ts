import { NextResponse } from 'next/server';
import { getGroup, listGroupRants } from '@/lib/db/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/groups/[id]?viewer=<anonymous_id>
 * The group with counts + membership state, and its rants (newest first).
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = decodeURIComponent(params.id || '').slice(0, 64);
    if (!id) {
        return NextResponse.json({ error: 'Missing group id.' }, { status: 400 });
    }
    const viewer = (new URL(request.url).searchParams.get('viewer') || '').slice(0, 64);

    try {
        const [group, rants] = await Promise.all([
            getGroup(id, viewer || undefined),
            listGroupRants(id, { limit: 100 }),
        ]);
        if (!group) {
            return NextResponse.json({ error: 'Group not found.' }, { status: 404 });
        }
        return NextResponse.json({ group, rants });
    } catch (err) {
        console.error('GET /api/groups/[id] failed:', err);
        return NextResponse.json({ error: 'Failed to load group.' }, { status: 500 });
    }
}
