import 'server-only';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { db } from './turso';

/**
 * Reset the demo database to a pristine seeded state.
 *
 * Drops all tables, re-applies the schema, and re-seeds the demo content.
 * This wipes visitor-generated posts — intended to run nightly so the public
 * showcase can't be defaced or spammed permanently.
 *
 * Reads the canonical db/schema.sql and db/seed.sql files (the same source of
 * truth used by `npm run db:setup`). Those files are bundled with the route via
 * `outputFileTracingIncludes` in next.config.mjs.
 */
export async function resetDemoDatabase(): Promise<{
    rants: number;
    comments: number;
}> {
    const dbDir = join(process.cwd(), 'db');
    const schema = readFileSync(join(dbDir, 'schema.sql'), 'utf8');
    const seed = readFileSync(join(dbDir, 'seed.sql'), 'utf8');

    await db.executeMultiple(
        'DROP TABLE IF EXISTS comments; DROP TABLE IF EXISTS bookmarks; DROP TABLE IF EXISTS rants;'
    );
    await db.executeMultiple(schema);
    await db.executeMultiple(seed);

    const rants = await db.execute('SELECT COUNT(*) AS n FROM rants');
    const comments = await db.execute('SELECT COUNT(*) AS n FROM comments');

    return {
        rants: Number(rants.rows[0].n) || 0,
        comments: Number(comments.rows[0].n) || 0,
    };
}
