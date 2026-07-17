-- SQLite / libSQL (Turso) schema for the Rant demo backend.
-- Mirrors the Supabase Postgres schema, adapted to SQLite:
--   * UUIDs are TEXT (generated in the API layer via crypto.randomUUID()).
--   * created_at is an ISO-8601 TEXT string (UTC).
--   * tags (a Postgres text[]) is stored as a JSON array string.
--   * is_seed marks rows inserted by the seed so they can be preserved on reset.

CREATE TABLE IF NOT EXISTS rants (
    id             TEXT PRIMARY KEY,
    content        TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
    mood           TEXT NOT NULL CHECK (mood IN (
                       'sad','crying','happy','neutral','angry','heartbroken',
                       'love','anxious','confused','tired','excited','confident'
                   )),
    likes_count    INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
    comments_count INTEGER NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
    anonymous_id   TEXT NOT NULL,
    tags           TEXT NOT NULL DEFAULT '[]',
    created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    is_seed        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS comments (
    id           TEXT PRIMARY KEY,
    rant_id      TEXT NOT NULL REFERENCES rants (id) ON DELETE CASCADE,
    content      TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 300),
    anonymous_id TEXT NOT NULL,
    likes_count  INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    is_seed      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id           TEXT PRIMARY KEY,
    anonymous_id TEXT NOT NULL,
    rant_id      TEXT NOT NULL REFERENCES rants (id) ON DELETE CASCADE,
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (anonymous_id, rant_id)
);

CREATE INDEX IF NOT EXISTS idx_rants_created_at   ON rants (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rants_likes_count  ON rants (likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_rants_mood         ON rants (mood);
CREATE INDEX IF NOT EXISTS idx_comments_rant_id   ON comments (rant_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_anon     ON bookmarks (anonymous_id);
