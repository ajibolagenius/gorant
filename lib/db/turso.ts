import 'server-only';
import { createClient, type Client } from '@libsql/client';

/**
 * Server-side libSQL (Turso / SQLite) client.
 *
 * - In production, set `TURSO_DATABASE_URL` (libsql://...) and `TURSO_AUTH_TOKEN`.
 * - In local development, it falls back to an embedded SQLite file (`file:./local.db`)
 *   so you can run the whole app without any hosted database.
 *
 * This module is `server-only` — never import it from a client component. The browser
 * talks to the database exclusively through the `/api/*` route handlers.
 */

const url = process.env.TURSO_DATABASE_URL || 'file:./local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

// Reuse a single client across hot reloads / warm serverless instances.
const globalForDb = globalThis as unknown as { __tursoClient?: Client };

export const db: Client =
    globalForDb.__tursoClient ?? createClient({ url, authToken });

if (process.env.NODE_ENV !== 'production') {
    globalForDb.__tursoClient = db;
}

/** True when a hosted Turso database is configured (as opposed to the local file fallback). */
export const isRemoteDb = url.startsWith('libsql://') || url.startsWith('https://');
