import { NextResponse } from 'next/server';
import { resetDemoDatabase } from '@/lib/db/reset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Allow enough time for drop + schema + seed against a remote database.
export const maxDuration = 60;

/**
 * Nightly cron endpoint: resets the demo database to its pristine seeded state.
 *
 * Triggered by the Vercel Cron defined in vercel.json. Vercel automatically
 * attaches `Authorization: Bearer $CRON_SECRET` to cron invocations, which we
 * verify here so the endpoint cannot be triggered by the public.
 */
export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;

    // Require CRON_SECRET to be configured and matched. If it is not set, refuse
    // rather than run unauthenticated — safer default for a destructive action.
    const authHeader = request.headers.get('authorization');
    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const counts = await resetDemoDatabase();
        console.log(
            `[cron] Demo database reset: rants=${counts.rants}, comments=${counts.comments}`
        );
        return NextResponse.json({ success: true, ...counts, resetAt: new Date().toISOString() });
    } catch (err) {
        console.error('[cron] Demo database reset failed:', err);
        return NextResponse.json({ success: false, error: 'Reset failed.' }, { status: 500 });
    }
}
