import 'server-only';
import { randomUUID } from 'node:crypto';
import { db } from './turso';

/**
 * Server-side data access for the Rant demo backend (Turso / libSQL).
 * Route handlers under /app/api call these functions; the browser never
 * touches the database directly.
 */

const VALID_MOODS = new Set([
    'sad', 'crying', 'happy', 'neutral', 'angry', 'heartbroken',
    'love', 'anxious', 'confused', 'tired', 'excited', 'confident',
]);

const MAX_RANT_LENGTH = 500;
const MAX_COMMENT_LENGTH = 300;

export interface RantRecord {
    id: string;
    content: string;
    mood: string;
    likes_count: number;
    comments_count: number;
    anonymous_id: string;
    tags: string[];
    created_at: string;
}

export interface CommentRecord {
    id: string;
    rant_id: string;
    content: string;
    anonymous_id: string;
    likes_count: number;
    created_at: string;
}

export class ValidationError extends Error {}

function nowIso(): string {
    return new Date().toISOString();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRant(row: any): RantRecord {
    let tags: string[] = [];
    try {
        tags = row.tags ? JSON.parse(row.tags) : [];
        if (!Array.isArray(tags)) tags = [];
    } catch {
        tags = [];
    }
    return {
        id: String(row.id),
        content: String(row.content),
        mood: String(row.mood),
        likes_count: Number(row.likes_count) || 0,
        comments_count: Number(row.comments_count) || 0,
        anonymous_id: String(row.anonymous_id),
        tags,
        created_at: String(row.created_at),
    };
}

function mapComment(row: any): CommentRecord {
    return {
        id: String(row.id),
        rant_id: String(row.rant_id),
        content: String(row.content),
        anonymous_id: String(row.anonymous_id),
        likes_count: Number(row.likes_count) || 0,
        created_at: String(row.created_at),
    };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface ListRantsOptions {
    mood?: string;
    sortBy?: 'latest' | 'popular' | 'most_liked';
    limit?: number;
    offset?: number;
}

export async function listRants(opts: ListRantsOptions = {}): Promise<RantRecord[]> {
    const args: (string | number)[] = [];
    let sql =
        'SELECT id, content, mood, likes_count, comments_count, anonymous_id, tags, created_at FROM rants';

    if (opts.mood && VALID_MOODS.has(opts.mood)) {
        sql += ' WHERE mood = ?';
        args.push(opts.mood);
    }

    const order =
        opts.sortBy === 'popular' || opts.sortBy === 'most_liked'
            ? 'likes_count DESC, created_at DESC'
            : 'created_at DESC';
    sql += ` ORDER BY ${order}`;

    const limit = Math.min(Math.max(opts.limit ?? 100, 1), 200);
    sql += ' LIMIT ?';
    args.push(limit);

    if (opts.offset && opts.offset > 0) {
        sql += ' OFFSET ?';
        args.push(opts.offset);
    }

    const result = await db.execute({ sql, args });
    return result.rows.map(mapRant);
}

export async function createRant(input: {
    content: string;
    mood: string;
    tags?: string[];
    anonymousId: string;
}): Promise<RantRecord> {
    const content = (input.content ?? '').trim();
    if (!content) throw new ValidationError('Content is required.');
    if (content.length > MAX_RANT_LENGTH)
        throw new ValidationError(`Content must be ${MAX_RANT_LENGTH} characters or fewer.`);
    if (!VALID_MOODS.has(input.mood)) throw new ValidationError('Invalid mood.');

    const tags = Array.isArray(input.tags)
        ? input.tags.filter((t) => typeof t === 'string').slice(0, 10)
        : [];
    const id = randomUUID();
    const createdAt = nowIso();
    const anonymousId = (input.anonymousId || 'anon_unknown').slice(0, 64);

    await db.execute({
        sql: `INSERT INTO rants (id, content, mood, likes_count, comments_count, anonymous_id, tags, created_at, is_seed)
              VALUES (?, ?, ?, 0, 0, ?, ?, ?, 0)`,
        args: [id, content, input.mood, anonymousId, JSON.stringify(tags), createdAt],
    });

    return {
        id,
        content,
        mood: input.mood,
        likes_count: 0,
        comments_count: 0,
        anonymous_id: anonymousId,
        tags,
        created_at: createdAt,
    };
}

export async function adjustRantLikes(id: string, delta: number): Promise<number> {
    const step = delta >= 0 ? 1 : -1;
    const result = await db.execute({
        sql: `UPDATE rants SET likes_count = MAX(likes_count + ?, 0) WHERE id = ?
              RETURNING likes_count`,
        args: [step, id],
    });
    if (result.rows.length === 0) throw new ValidationError('Rant not found.');
    return Number(result.rows[0].likes_count) || 0;
}

export async function listComments(
    rantIds: string[]
): Promise<Record<string, CommentRecord[]>> {
    const ids = rantIds.filter(Boolean).slice(0, 200);
    if (ids.length === 0) return {};

    const placeholders = ids.map(() => '?').join(', ');
    const result = await db.execute({
        sql: `SELECT id, rant_id, content, anonymous_id, likes_count, created_at
              FROM comments WHERE rant_id IN (${placeholders})
              ORDER BY created_at DESC`,
        args: ids,
    });

    const grouped: Record<string, CommentRecord[]> = {};
    for (const row of result.rows) {
        const comment = mapComment(row);
        (grouped[comment.rant_id] ??= []).push(comment);
    }
    return grouped;
}

export async function createComment(input: {
    rantId: string;
    content: string;
    anonymousId: string;
}): Promise<CommentRecord> {
    const content = (input.content ?? '').trim();
    if (!content) throw new ValidationError('Comment is required.');
    if (content.length > MAX_COMMENT_LENGTH)
        throw new ValidationError(`Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.`);
    if (!input.rantId) throw new ValidationError('rantId is required.');

    // Ensure the parent rant exists to avoid orphan comments.
    const parent = await db.execute({
        sql: 'SELECT id FROM rants WHERE id = ?',
        args: [input.rantId],
    });
    if (parent.rows.length === 0) throw new ValidationError('Rant not found.');

    const id = randomUUID();
    const createdAt = nowIso();
    const anonymousId = (input.anonymousId || 'anon_unknown').slice(0, 64);

    await db.batch(
        [
            {
                sql: `INSERT INTO comments (id, rant_id, content, anonymous_id, likes_count, created_at, is_seed)
                      VALUES (?, ?, ?, ?, 0, ?, 0)`,
                args: [id, input.rantId, content, anonymousId, createdAt],
            },
            {
                sql: 'UPDATE rants SET comments_count = comments_count + 1 WHERE id = ?',
                args: [input.rantId],
            },
        ],
        'write'
    );

    return {
        id,
        rant_id: input.rantId,
        content,
        anonymous_id: anonymousId,
        likes_count: 0,
        created_at: createdAt,
    };
}

export async function adjustCommentLikes(id: string, delta: number): Promise<number> {
    const step = delta >= 0 ? 1 : -1;
    const result = await db.execute({
        sql: `UPDATE comments SET likes_count = MAX(likes_count + ?, 0) WHERE id = ?
              RETURNING likes_count`,
        args: [step, id],
    });
    if (result.rows.length === 0) throw new ValidationError('Comment not found.');
    return Number(result.rows[0].likes_count) || 0;
}
