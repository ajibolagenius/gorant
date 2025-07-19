-- Add user tracking to analytics system
-- This migration adds user tracking capabilities while maintaining anonymity

-- Create analytics_users table for tracking anonymous users
CREATE TABLE IF NOT EXISTS public.analytics_users (
    id VARCHAR(64) PRIMARY KEY, -- Anonymous user ID from localStorage
    first_seen TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        last_seen TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        total_sessions INTEGER DEFAULT 0 CHECK (total_sessions >= 0),
        total_page_views INTEGER DEFAULT 0 CHECK (total_page_views >= 0),
        total_events INTEGER DEFAULT 0 CHECK (total_events >= 0),
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Add user_id and session_id columns to analytics_events table
ALTER TABLE public.analytics_events
ADD COLUMN IF NOT EXISTS user_id VARCHAR(64),
ADD COLUMN IF NOT EXISTS session_id VARCHAR(64);

-- Add user_id and is_active columns to analytics_sessions table
ALTER TABLE public.analytics_sessions
ADD COLUMN IF NOT EXISTS user_id VARCHAR(64),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_users_id ON public.analytics_users (id);

CREATE INDEX IF NOT EXISTS idx_analytics_users_last_seen ON public.analytics_users (last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_users_first_seen ON public.analytics_users (first_seen DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events (user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events (session_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON public.analytics_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_is_active ON public.analytics_sessions (is_active);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_active_last_seen ON public.analytics_sessions (is_active, last_seen DESC);

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_analytics_events_user_id'
    ) THEN
        ALTER TABLE public.analytics_events
        ADD CONSTRAINT fk_analytics_events_user_id FOREIGN KEY (user_id) REFERENCES public.analytics_users (id) ON DELETE SET NULL;

END IF;

END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_analytics_sessions_user_id'
    ) THEN
        ALTER TABLE public.analytics_sessions
        ADD CONSTRAINT fk_analytics_sessions_user_id FOREIGN KEY (user_id) REFERENCES public.analytics_users (id) ON DELETE SET NULL;
    END IF;
END$$;

-- Enable Row Level Security (RLS) for analytics_users
ALTER TABLE public.analytics_users ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_users table
CREATE POLICY "Allow anonymous read access on analytics_users" ON public.analytics_users FOR
SELECT USING (TRUE);

CREATE POLICY "Allow anonymous insert on analytics_users" ON public.analytics_users FOR
INSERT
WITH
    CHECK (TRUE);

CREATE POLICY "Allow anonymous update on analytics_users" ON public.analytics_users FOR
UPDATE USING (TRUE);

-- Create function to automatically update user statistics
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's last_seen and increment counters
    INSERT INTO public.analytics_users (id, last_seen, total_events)
    VALUES (NEW.user_id, NOW(), 1)
    ON CONFLICT (id)
    DO UPDATE SET
        last_seen = NOW(),
        total_events = analytics_users.total_events + 1,
        updated_at = NOW();

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

-- Create trigger to automatically update user stats when events are inserted
DROP TRIGGER IF EXISTS trigger_update_user_stats ON public.analytics_events;

CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON public.analytics_events
    FOR EACH ROW
    WHEN (NEW.user_id IS NOT NULL)
    EXECUTE FUNCTION update_user_stats();

-- Create function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session's last_seen and user_id
    UPDATE public.analytics_sessions
    SET
        last_seen = NOW(),
        user_id = COALESCE(NEW.user_id, user_id),
        is_active = TRUE,
        updated_at = NOW()
    WHERE anonymous_id = NEW.anonymous_id OR id::text = NEW.session_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update session activity
DROP TRIGGER IF EXISTS trigger_update_session_activity ON public.analytics_events;

CREATE TRIGGER trigger_update_session_activity
    AFTER INSERT ON public.analytics_events
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- Create function to clean up inactive sessions (older than 30 minutes)
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.analytics_sessions
    SET is_active = FALSE, updated_at = NOW()
    WHERE is_active = TRUE
    AND last_seen < NOW() - INTERVAL '30 minutes';

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user metrics
CREATE OR REPLACE FUNCTION get_user_metrics()
RETURNS TABLE (
    total_users BIGINT,
    online_users BIGINT,
    new_users_today BIGINT,
    active_users_last_7_days BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.analytics_users) as total_users,
        (SELECT COUNT(*) FROM public.analytics_sessions
         WHERE is_active = TRUE
         AND last_seen > NOW() - INTERVAL '5 minutes') as online_users,
        (SELECT COUNT(*) FROM public.analytics_users
         WHERE first_seen >= CURRENT_DATE) as new_users_today,
        (SELECT COUNT(*) FROM public.analytics_users
         WHERE last_seen > NOW() - INTERVAL '7 days') as active_users_last_7_days;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT ALL ON public.analytics_users TO anon, authenticated;

GRANT
EXECUTE ON FUNCTION update_user_stats () TO anon,
authenticated;

GRANT
EXECUTE ON FUNCTION update_session_activity () TO anon,
authenticated;

GRANT
EXECUTE ON FUNCTION cleanup_inactive_sessions () TO anon,
authenticated;

GRANT EXECUTE ON FUNCTION get_user_metrics () TO anon, authenticated;
