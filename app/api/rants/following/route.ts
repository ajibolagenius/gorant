import { NextResponse } from 'next/server';
import { listFollowingRants } from '@/lib/db/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/rants/following?viewer=<anonymous_id>
 * Rants authored by everyone the viewer follows, newest first.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const viewer = (searchParams.get('viewer') || '').slice(0, 64);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined;

    if (!viewer) {
        return NextResponse.json({ rants: [] });
    }

    try {
        const rants = await listFollowingRants(viewer, { limit, offset });
        return NextResponse.json({ rants });
    } catch (err) {
        console.error('GET /api/rants/following failed:', err);
        return NextResponse.json({ error: 'Failed to load following feed.' }, { status: 500 });
    }
}
