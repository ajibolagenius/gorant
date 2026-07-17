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
 *
 * The underlying client is created LAZILY, on first use. This is important: route
 * modules are imported during `next build` (the "collecting page data" phase), and we
 * must not construct the client — or read/validate the connection URL — at import time,
 * or a missing/invalid env var would fail the entire build.
 */

// Reuse a single client across hot reloads / warm serverless instances.
const globalForDb = globalThis as unknown as { __tursoClient?: Client };

function getClient(): Client {
    if (!globalForDb.__tursoClient) {
        const url = process.env.TURSO_DATABASE_URL || 'file:./local.db';
        const authToken = process.env.TURSO_AUTH_TOKEN;
        globalForDb.__tursoClient = createClient({ url, authToken });
    }
    return globalForDb.__tursoClient;
}

/**
 * Lazily-initialized libSQL client. Accessing any property (e.g. `db.execute(...)`)
 * constructs the real client on first use; importing this module does not.
 */
export const db: Client = new Proxy({} as Client, {
    get(_target, prop, receiver) {
        const client = getClient();
        const value = Reflect.get(client as object, prop, receiver);
        return typeof value === 'function' ? value.bind(client) : value;
    },
});

/** True when a hosted Turso database is configured (as opposed to the local file fallback). */
export function isRemoteDb(): boolean {
    const url = process.env.TURSO_DATABASE_URL || '';
    return url.startsWith('libsql://') || url.startsWith('https://');
}
