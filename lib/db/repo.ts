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
    /** Author's custom display name from their profile, if they set one. */
    display_name: string | null;
    tags: string[];
    created_at: string;
    /** Group this rant was posted into, if any. */
    group_id: string | null;
}

export interface CommentRecord {
    id: string;
    rant_id: string;
    content: string;
    anonymous_id: string;
    /** Author's custom display name from their profile, if they set one. */
    display_name: string | null;
    likes_count: number;
    created_at: string;
}

export interface ProfileRecord {
    anonymous_id: string;
    display_name: string;
    bio: string;
    avatar_mood: string;
    created_at: string;
    updated_at: string;
}

export interface AuthorStats {
    rants_count: number;
    likes_received: number;
    first_seen: string | null;
}

export const MAX_DISPLAY_NAME_LENGTH = 40;
export const MAX_BIO_LENGTH = 280;

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
        display_name: row.display_name ? String(row.display_name) : null,
        tags,
        created_at: String(row.created_at),
        group_id: row.group_id ? String(row.group_id) : null,
    };
}

function mapProfile(row: any): ProfileRecord {
    return {
        anonymous_id: String(row.anonymous_id),
        display_name: String(row.display_name ?? ''),
        bio: String(row.bio ?? ''),
        avatar_mood: String(row.avatar_mood ?? 'neutral'),
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
    };
}

function mapComment(row: any): CommentRecord {
    return {
        id: String(row.id),
        rant_id: String(row.rant_id),
        content: String(row.content),
        anonymous_id: String(row.anonymous_id),
        display_name: row.display_name ? String(row.display_name) : null,
        likes_count: Number(row.likes_count) || 0,
        created_at: String(row.created_at),
    };
}

/** Shared SELECT for rant queries: rants joined to author profiles. */
const RANT_SELECT = `SELECT r.id, r.content, r.mood, r.likes_count, r.comments_count,
       r.anonymous_id, r.tags, r.created_at, r.group_id,
       NULLIF(TRIM(p.display_name), '') AS display_name
FROM rants r
LEFT JOIN profiles p ON p.anonymous_id = r.anonymous_id`;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface ListRantsOptions {
    mood?: string;
    sortBy?: 'latest' | 'popular' | 'most_liked';
    limit?: number;
    offset?: number;
}

export async function listRants(opts: ListRantsOptions = {}): Promise<RantRecord[]> {
    const args: (string | number)[] = [];
    let sql = RANT_SELECT;

    if (opts.mood && VALID_MOODS.has(opts.mood)) {
        sql += ' WHERE r.mood = ?';
        args.push(opts.mood);
    }

    const order =
        opts.sortBy === 'popular' || opts.sortBy === 'most_liked'
            ? 'r.likes_count DESC, r.created_at DESC'
            : 'r.created_at DESC';
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
    groupId?: string;
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

    // If posting into a group, ensure it exists.
    let groupId: string | null = null;
    if (input.groupId) {
        const candidate = input.groupId.slice(0, 64);
        const group = await db.execute({
            sql: 'SELECT id FROM groups WHERE id = ?',
            args: [candidate],
        });
        if (group.rows.length === 0) throw new ValidationError('Group not found.');
        groupId = candidate;
    }

    await db.execute({
        sql: `INSERT INTO rants (id, content, mood, likes_count, comments_count, anonymous_id, tags, group_id, created_at, is_seed)
              VALUES (?, ?, ?, 0, 0, ?, ?, ?, ?, 0)`,
        args: [id, content, input.mood, anonymousId, JSON.stringify(tags), groupId, createdAt],
    });

    const profile = await getProfile(anonymousId);

    return {
        id,
        content,
        mood: input.mood,
        likes_count: 0,
        comments_count: 0,
        anonymous_id: anonymousId,
        display_name: profile?.display_name?.trim() || null,
        tags,
        created_at: createdAt,
        group_id: groupId,
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
        sql: `SELECT c.id, c.rant_id, c.content, c.anonymous_id, c.likes_count, c.created_at,
                     NULLIF(TRIM(p.display_name), '') AS display_name
              FROM comments c
              LEFT JOIN profiles p ON p.anonymous_id = c.anonymous_id
              WHERE c.rant_id IN (${placeholders})
              ORDER BY c.created_at DESC`,
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

    const profile = await getProfile(anonymousId);

    return {
        id,
        rant_id: input.rantId,
        content,
        anonymous_id: anonymousId,
        display_name: profile?.display_name?.trim() || null,
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

/* -------------------------------------------------------------------------- */
/*  Profiles                                                                  */
/* -------------------------------------------------------------------------- */

/** Fetch a profile row by anonymous_id, or null if the user never customized one. */
export async function getProfile(anonymousId: string): Promise<ProfileRecord | null> {
    const id = (anonymousId || '').slice(0, 64);
    if (!id) return null;
    const result = await db.execute({
        sql: `SELECT anonymous_id, display_name, bio, avatar_mood, created_at, updated_at
              FROM profiles WHERE anonymous_id = ?`,
        args: [id],
    });
    return result.rows.length ? mapProfile(result.rows[0]) : null;
}

/** Create or update the caller's own profile. Returns the persisted row. */
export async function upsertProfile(input: {
    anonymousId: string;
    displayName?: string;
    bio?: string;
    avatarMood?: string;
}): Promise<ProfileRecord> {
    const id = (input.anonymousId || '').slice(0, 64);
    if (!id) throw new ValidationError('anonymousId is required.');

    const displayName = (input.displayName ?? '').trim().slice(0, MAX_DISPLAY_NAME_LENGTH);
    const bio = (input.bio ?? '').trim().slice(0, MAX_BIO_LENGTH);
    const avatarMood = VALID_MOODS.has(input.avatarMood ?? '')
        ? (input.avatarMood as string)
        : 'neutral';
    const now = nowIso();

    await db.execute({
        sql: `INSERT INTO profiles (anonymous_id, display_name, bio, avatar_mood, created_at, updated_at, is_seed)
              VALUES (?, ?, ?, ?, ?, ?, 0)
              ON CONFLICT (anonymous_id) DO UPDATE SET
                  display_name = excluded.display_name,
                  bio          = excluded.bio,
                  avatar_mood  = excluded.avatar_mood,
                  updated_at   = excluded.updated_at`,
        args: [id, displayName, bio, avatarMood, now, now],
    });

    const saved = await getProfile(id);
    if (!saved) throw new ValidationError('Failed to save profile.');
    return saved;
}

/** Aggregate activity stats for an author, derived from their rants. */
export async function getAuthorStats(anonymousId: string): Promise<AuthorStats> {
    const id = (anonymousId || '').slice(0, 64);
    if (!id) return { rants_count: 0, likes_received: 0, first_seen: null };
    const result = await db.execute({
        sql: `SELECT COUNT(*) AS rants_count,
                     COALESCE(SUM(likes_count), 0) AS likes_received,
                     MIN(created_at) AS first_seen
              FROM rants WHERE anonymous_id = ?`,
        args: [id],
    });
    const row = result.rows[0] ?? {};
    return {
        rants_count: Number(row.rants_count) || 0,
        likes_received: Number(row.likes_received) || 0,
        first_seen: row.first_seen ? String(row.first_seen) : null,
    };
}

/** List an author's rants, newest first. */
export async function listRantsByAuthor(
    anonymousId: string,
    opts: { limit?: number; offset?: number } = {}
): Promise<RantRecord[]> {
    const id = (anonymousId || '').slice(0, 64);
    if (!id) return [];
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
    const args: (string | number)[] = [id, limit];
    let sql = `${RANT_SELECT} WHERE r.anonymous_id = ? ORDER BY r.created_at DESC LIMIT ?`;
    if (opts.offset && opts.offset > 0) {
        sql += ' OFFSET ?';
        args.push(opts.offset);
    }
    const result = await db.execute({ sql, args });
    return result.rows.map(mapRant);
}

/* -------------------------------------------------------------------------- */
/*  Groups                                                                    */
/* -------------------------------------------------------------------------- */

export const MAX_GROUP_NAME_LENGTH = 50;
export const MAX_GROUP_DESCRIPTION_LENGTH = 200;

export interface GroupRecord {
    id: string;
    name: string;
    description: string;
    mood: string;
    created_by: string;
    created_at: string;
    members_count: number;
    rants_count: number;
    /** True when the requesting viewer is a member (only set if a viewer was given). */
    is_member: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapGroup(row: any): GroupRecord {
    return {
        id: String(row.id),
        name: String(row.name),
        description: String(row.description ?? ''),
        mood: String(row.mood ?? 'neutral'),
        created_by: String(row.created_by),
        created_at: String(row.created_at),
        members_count: Number(row.members_count) || 0,
        rants_count: Number(row.rants_count) || 0,
        is_member: Boolean(Number(row.is_member)),
    };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const GROUP_SELECT = `SELECT g.id, g.name, g.description, g.mood, g.created_by, g.created_at,
       (SELECT COUNT(*) FROM group_members m WHERE m.group_id = g.id) AS members_count,
       (SELECT COUNT(*) FROM rants r WHERE r.group_id = g.id) AS rants_count,
       EXISTS (SELECT 1 FROM group_members m WHERE m.group_id = g.id AND m.anonymous_id = ?) AS is_member
FROM groups g`;

/** All groups, most members first. Pass viewer to mark which ones they joined. */
export async function listGroups(viewerId?: string): Promise<GroupRecord[]> {
    const viewer = normId(viewerId ?? '');
    const result = await db.execute({
        sql: `${GROUP_SELECT} ORDER BY members_count DESC, g.created_at ASC LIMIT 100`,
        args: [viewer],
    });
    return result.rows.map(mapGroup);
}

/** A single group by id, or null. */
export async function getGroup(id: string, viewerId?: string): Promise<GroupRecord | null> {
    const groupId = normId(id);
    if (!groupId) return null;
    const viewer = normId(viewerId ?? '');
    const result = await db.execute({
        sql: `${GROUP_SELECT} WHERE g.id = ?`,
        args: [viewer, groupId],
    });
    return result.rows.length ? mapGroup(result.rows[0]) : null;
}

/** Create a group. The creator automatically becomes its first member. */
export async function createGroup(input: {
    name: string;
    description?: string;
    mood?: string;
    createdBy: string;
}): Promise<GroupRecord> {
    const name = (input.name ?? '').trim();
    if (!name) throw new ValidationError('Group name is required.');
    if (name.length > MAX_GROUP_NAME_LENGTH)
        throw new ValidationError(`Group name must be ${MAX_GROUP_NAME_LENGTH} characters or fewer.`);
    const description = (input.description ?? '').trim().slice(0, MAX_GROUP_DESCRIPTION_LENGTH);
    const mood = VALID_MOODS.has(input.mood ?? '') ? (input.mood as string) : 'neutral';
    const createdBy = normId(input.createdBy);
    if (!createdBy) throw new ValidationError('createdBy is required.');

    const existing = await db.execute({
        sql: 'SELECT id FROM groups WHERE name = ? COLLATE NOCASE',
        args: [name],
    });
    if (existing.rows.length > 0)
        throw new ValidationError('A group with that name already exists.');

    const id = randomUUID();
    const createdAt = nowIso();

    await db.batch(
        [
            {
                sql: `INSERT INTO groups (id, name, description, mood, created_by, created_at, is_seed)
                      VALUES (?, ?, ?, ?, ?, ?, 0)`,
                args: [id, name, description, mood, createdBy, createdAt],
            },
            {
                sql: `INSERT INTO group_members (group_id, anonymous_id, joined_at, is_seed)
                      VALUES (?, ?, ?, 0)`,
                args: [id, createdBy, createdAt],
            },
        ],
        'write'
    );

    return {
        id,
        name,
        description,
        mood,
        created_by: createdBy,
        created_at: createdAt,
        members_count: 1,
        rants_count: 0,
        is_member: true,
    };
}

/** Join a group. Idempotent. */
export async function joinGroup(groupId: string, anonymousId: string): Promise<void> {
    const gid = normId(groupId);
    const anon = normId(anonymousId);
    if (!gid || !anon) throw new ValidationError('groupId and anonymousId are required.');
    const group = await db.execute({ sql: 'SELECT id FROM groups WHERE id = ?', args: [gid] });
    if (group.rows.length === 0) throw new ValidationError('Group not found.');
    await db.execute({
        sql: `INSERT INTO group_members (group_id, anonymous_id, joined_at, is_seed)
              VALUES (?, ?, ?, 0)
              ON CONFLICT (group_id, anonymous_id) DO NOTHING`,
        args: [gid, anon, nowIso()],
    });
}

/** Leave a group. Idempotent. */
export async function leaveGroup(groupId: string, anonymousId: string): Promise<void> {
    const gid = normId(groupId);
    const anon = normId(anonymousId);
    if (!gid || !anon) throw new ValidationError('groupId and anonymousId are required.');
    await db.execute({
        sql: 'DELETE FROM group_members WHERE group_id = ? AND anonymous_id = ?',
        args: [gid, anon],
    });
}

/** Rants posted into a group, newest first. */
export async function listGroupRants(
    groupId: string,
    opts: { limit?: number; offset?: number } = {}
): Promise<RantRecord[]> {
    const gid = normId(groupId);
    if (!gid) return [];
    const limit = Math.min(Math.max(opts.limit ?? 100, 1), 200);
    const args: (string | number)[] = [gid, limit];
    let sql = `${RANT_SELECT} WHERE r.group_id = ? ORDER BY r.created_at DESC LIMIT ?`;
    if (opts.offset && opts.offset > 0) {
        sql += ' OFFSET ?';
        args.push(opts.offset);
    }
    const result = await db.execute({ sql, args });
    return result.rows.map(mapRant);
}

/* -------------------------------------------------------------------------- */
/*  Follows                                                                   */
/* -------------------------------------------------------------------------- */

export interface FollowCounts {
    followers: number;
    following: number;
}

function normId(id: string): string {
    return (id || '').slice(0, 64);
}

/** Follow followeeId as followerId. Idempotent; self-follows are rejected. */
export async function followUser(followerId: string, followeeId: string): Promise<void> {
    const follower = normId(followerId);
    const followee = normId(followeeId);
    if (!follower || !followee) throw new ValidationError('Both ids are required.');
    if (follower === followee) throw new ValidationError('You cannot follow yourself.');
    await db.execute({
        sql: `INSERT INTO follows (follower_id, followee_id, created_at, is_seed)
              VALUES (?, ?, ?, 0)
              ON CONFLICT (follower_id, followee_id) DO NOTHING`,
        args: [follower, followee, nowIso()],
    });
}

/** Remove a follow edge. Idempotent. */
export async function unfollowUser(followerId: string, followeeId: string): Promise<void> {
    const follower = normId(followerId);
    const followee = normId(followeeId);
    if (!follower || !followee) throw new ValidationError('Both ids are required.');
    await db.execute({
        sql: 'DELETE FROM follows WHERE follower_id = ? AND followee_id = ?',
        args: [follower, followee],
    });
}

/** Follower / following counts for a given identity. */
export async function getFollowCounts(id: string): Promise<FollowCounts> {
    const anon = normId(id);
    if (!anon) return { followers: 0, following: 0 };
    const result = await db.execute({
        sql: `SELECT
                (SELECT COUNT(*) FROM follows WHERE followee_id = ?) AS followers,
                (SELECT COUNT(*) FROM follows WHERE follower_id = ?) AS following`,
        args: [anon, anon],
    });
    const row = result.rows[0] ?? {};
    return {
        followers: Number(row.followers) || 0,
        following: Number(row.following) || 0,
    };
}

/** True if followerId currently follows followeeId. */
export async function isFollowing(followerId: string, followeeId: string): Promise<boolean> {
    const follower = normId(followerId);
    const followee = normId(followeeId);
    if (!follower || !followee || follower === followee) return false;
    const result = await db.execute({
        sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ? LIMIT 1',
        args: [follower, followee],
    });
    return result.rows.length > 0;
}

/** Rants authored by everyone followerId follows, newest first. */
export async function listFollowingRants(
    followerId: string,
    opts: { limit?: number; offset?: number } = {}
): Promise<RantRecord[]> {
    const follower = normId(followerId);
    if (!follower) return [];
    const limit = Math.min(Math.max(opts.limit ?? 100, 1), 200);
    const args: (string | number)[] = [follower, limit];
    let sql = `${RANT_SELECT}
               JOIN follows f ON f.followee_id = r.anonymous_id
               WHERE f.follower_id = ?
               ORDER BY r.created_at DESC
               LIMIT ?`;
    if (opts.offset && opts.offset > 0) {
        sql += ' OFFSET ?';
        args.push(opts.offset);
    }
    const result = await db.execute({ sql, args });
    return result.rows.map(mapRant);
}
