-- Analytics Tables Migration Script
-- This script creates the necessary tables and functions for the self-analytics system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analytics_sessions table
CREATE TABLE IF NOT EXISTS public.analytics_sessions (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    session_id VARCHAR(36) UNIQUE NOT NULL,
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
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (length(type) > 0),
    page VARCHAR(255),
    timestamp BIGINT NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    details JSONB DEFAULT '{}',
    user_agent TEXT,
    referrer TEXT,
    dnt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

-- Foreign key constraint to analytics_sessions
CONSTRAINT fk_analytics_events_session_id
        FOREIGN KEY (session_id) REFERENCES public.analytics_sessions(session_id)
        ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON public.analytics_sessions (session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_created_at ON public.analytics_sessions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen ON public.analytics_sessions (last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events (session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events (TIMESTAMP DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON public.analytics_events (page);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_timestamp ON public.analytics_events(type, timestamp DESC);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_type ON public.analytics_events(session_id, type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_page_timestamp ON public.analytics_events (page, TIMESTAMP DESC);

-- Create GIN index for JSONB details column for efficient JSON queries
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

-- Create policies for analytics tables (restrictive - only allow specific operations)
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

-- Create trigger function to update analytics_sessions.updated_at
CREATE OR REPLACE FUNCTION public.update_analytics_session_timestamp()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;

$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at column
DROP TRIGGER IF EXISTS trigger_update_analytics_session_timestamp ON public.analytics_sessions;

CREATE TRIGGER trigger_update_analytics_session_timestamp
    BEFORE UPDATE ON public.analytics_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_analytics_session_timestamp();
