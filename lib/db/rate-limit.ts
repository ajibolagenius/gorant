import 'server-only';

/**
 * Minimal in-memory sliding-window rate limiter for demo write endpoints.
 *
 * Note: state is per serverless instance, so this is a best-effort guard against
 * casual spam on the public demo — not a hard security boundary. For stronger
 * limits, back this with Vercel KV / Upstash Redis.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(
    key: string,
    { max, windowMs }: { max: number; windowMs: number }
): boolean {
    const now = Date.now();
    const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
    if (hits.length >= max) {
        buckets.set(key, hits);
        return false;
    }
    hits.push(now);
    buckets.set(key, hits);
    return true;
}

export function clientIp(req: Request): string {
    const fwd = req.headers.get('x-forwarded-for');
    if (fwd) return fwd.split(',')[0].trim();
    return req.headers.get('x-real-ip') ?? 'unknown';
}
