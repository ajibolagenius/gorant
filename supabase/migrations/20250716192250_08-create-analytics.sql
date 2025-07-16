-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analytics_sessions table
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    anonymous_id VARCHAR(64) UNIQUE NOT NULL,
    first_seen TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        last_seen TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        page_views INTEGER DEFAULT 0 CHECK (page_views >= 0),
        events_count INTEGER DEFAULT 0 CHECK (events_count >= 0),
        user_agent TEXT,
        referrer TEXT,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (length(type) > 0),
    page VARCHAR(255),
    TIMESTAMP BIGINT NOT NULL,
    anonymous_id VARCHAR(64) NOT NULL,
    details JSONB DEFAULT '{}',
    user_agent TEXT,
    referrer TEXT,
    dnt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        CONSTRAINT fk_analytics_events_anonymous_id FOREIGN KEY (anonymous_id) REFERENCES public.analytics_sessions (anonymous_id) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_anonymous_id ON public.analytics_sessions (anonymous_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_created_at ON public.analytics_sessions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen ON public.analytics_sessions (last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_anonymous_id ON public.analytics_events (anonymous_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events (TIMESTAMP DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON public.analytics_events (page);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_timestamp ON public.analytics_events(type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_page_timestamp ON public.analytics_events (page, TIMESTAMP DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_details ON public.analytics_events USING GIN (details);

-- Enable Row Level Security (RLS)
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access on analytics_sessions" ON public.analytics_sessions;

DROP POLICY IF EXISTS "Allow anonymous insert on analytics_sessions" ON public.analytics_sessions;

DROP POLICY IF EXISTS "Allow anonymous update on analytics_sessions" ON public.analytics_sessions;

DROP POLICY IF EXISTS "Allow anonymous read access on analytics_events" ON public.analytics_events;

DROP POLICY IF EXISTS "Allow anonymous insert on analytics_events" ON public.analytics_events;

-- Create policies for analytics tables
CREATE POLICY "Allow anonymous read access on analytics_sessions" ON public.analytics_sessions FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on analytics_sessions" ON public.analytics_sessions FOR
INSERT
WITH
    CHECK (TRUE);

CREATE POLICY "Allow anonymous update on analytics_sessions" ON public.analytics_sessions FOR
UPDATE USING (TRUE);

CREATE POLICY "Allow anonymous read access on analytics_events" ON public.analytics_events FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on analytics_events" ON public.analytics_events FOR
INSERT
WITH
    CHECK (TRUE);
