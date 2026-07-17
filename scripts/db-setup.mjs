// Sets up the Turso / libSQL database: applies the schema and (re)seeds demo content.
//
// Usage:
//   node scripts/db-setup.mjs            # apply schema + seed
//   node scripts/db-setup.mjs --reset    # drop all tables first, then schema + seed
//
// Targets TURSO_DATABASE_URL / TURSO_AUTH_TOKEN when set (reads .env.local),
// otherwise falls back to a local embedded SQLite file (./local.db).

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@libsql/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Minimal .env.local loader (no dependency on dotenv).
function loadEnv() {
    const envPath = join(root, '.env.local');
    if (!existsSync(envPath)) return;
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (!m) continue;
        const key = m[1];
        let val = m[2].trim().replace(/^["']|["']$/g, '');
        if (!(key in process.env)) process.env[key] = val;
    }
}

loadEnv();

const url = process.env.TURSO_DATABASE_URL || 'file:./local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;
const reset = process.argv.includes('--reset');

const db = createClient({ url, authToken });

const schema = readFileSync(join(root, 'db', 'schema.sql'), 'utf8');
const seed = readFileSync(join(root, 'db', 'seed.sql'), 'utf8');

async function main() {
    const target = url.startsWith('file:') ? `local file (${url})` : url;
    console.log(`→ Target database: ${target}`);

    if (reset) {
        console.log('→ Dropping existing tables (--reset)…');
        await db.executeMultiple(
            'DROP TABLE IF EXISTS comments; DROP TABLE IF EXISTS bookmarks; DROP TABLE IF EXISTS follows; DROP TABLE IF EXISTS group_members; DROP TABLE IF EXISTS groups; DROP TABLE IF EXISTS profiles; DROP TABLE IF EXISTS rants;'
        );
    }

    // Migrations for pre-existing databases (CREATE TABLE IF NOT EXISTS won't
    // add new columns). Must run BEFORE the schema, because the schema also
    // creates indexes on these columns. Each is a no-op error when the column
    // already exists or the table doesn't exist yet (fresh database).
    try {
        await db.execute('ALTER TABLE rants ADD COLUMN group_id TEXT');
        console.log('→ Migrated: added rants.group_id');
    } catch {
        // Column already exists or table not created yet — nothing to do.
    }

    console.log('→ Applying schema…');
    await db.executeMultiple(schema);

    console.log('→ Seeding demo content…');
    await db.executeMultiple(seed);

    const rants = await db.execute('SELECT COUNT(*) AS n FROM rants');
    const comments = await db.execute('SELECT COUNT(*) AS n FROM comments');
    console.log(
        `✓ Done. rants=${rants.rows[0].n}, comments=${comments.rows[0].n}`
    );
}

main().catch((err) => {
    console.error('✗ Database setup failed:', err);
    process.exit(1);
});
