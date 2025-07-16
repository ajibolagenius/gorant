-- Analytics Functions and Data Retention Policies
-- This script creates utility functions for analytics operations and data cleanup

-- Function to upsert analytics session (insert or update if exists)
CREATE OR REPLACE FUNCTION public.upsert_analytics_session(
    p_session_id VARCHAR(36),
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS UUID AS $
DECLARE
    session_uuid UUID;
BEGIN
    -- Try to update existing session
    UPDATE public.analytics_sessions
    SET
        last_seen = NOW(),
        page_views = page_views + 1,
        updated_at = NOW()
    WHERE session_id = p_session_id
    RETURNING id INTO session_uuid;

    -- If no session was updated, insert a new one
    IF session_uuid IS NULL THEN
        INSERT INTO public.analytics_sessions (session_id, user_agent, referrer, page_views)
        VALUES (p_session_id, p_user_agent, p_referrer, 1)
        RETURNING id INTO session_uuid;
    END IF;

    RETURN session_uuid;
END;

$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment events count for a session
CREATE OR REPLACE FUNCTION public.increment_session_events(p_session_id VARCHAR(36))
RETURNS VOID AS $
BEGIN
    UPDATE public.analytics_sessions
    SET
        events_count = events_count + 1,
        last_seen = NOW(),
        updated_at = NOW()
    WHERE session_id = p_session_id;
END;

$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get analytics metrics for dashboard
CREATE OR REPLACE FUNCTION public.get_analytics_metrics(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    total_page_views BIGINT,
    unique_sessions BIGINT,
    total_events BIGINT,
    avg_session_duration INTERVAL
) AS $
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(s.page_views), 0) as total_page_views,
        COUNT(DISTINCT s.session_id) as unique_sessions,
        COALESCE(SUM(s.events_count), 0) as total_events,
        AVG(s.last_seen - s.first_seen) as avg_session_duration
    FROM public.analytics_sessions s
    WHERE s.created_at >= p_start_date
    AND s.created_at <= p_end_date;
END;

$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top pages by views
CREATE OR REPLACE FUNCTION public.get_top_pages(
    p_limit INTEGER DEFAULT 10,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    page VARCHAR(255),
    page_views BIGINT,
    unique_sessions BIGINT
) AS $
BEGIN
    RETURN QUERY
    SELECT
        e.page,
        COUNT(*) as page_views,
        COUNT(DISTINCT e.session_id) as unique_sessions
    FROM public.analytics_events e
    WHERE e.type = 'pageview'
    AND e.created_at >= p_start_date
    AND e.created_at <= p_end_date
    AND e.page IS NOT NULL
    GROUP BY e.page
    ORDER BY page_views DESC
    LIMIT p_limit;
END;

$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get event counts by type
CREATE OR REPLACE FUNCTION public.get_event_counts_by_type(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    event_type VARCHAR(50),
    event_count BIGINT,
    unique_sessions BIGINT
) AS $
BEGIN
    RETURN QUERY
    SELECT
        e.type as event_type,
        COUNT(*) as event_count,
        COUNT(DISTINCT e.session_id) as unique_sessions
    FROM public.analytics_events e
    WHERE e.created_at >= p_start_date
    AND e.created_at <= p_end_date
    GROUP BY e.type
    ORDER BY event_count DESC;
END;

$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get time series data for charts
CREATE OR REPLACE FUNCTION public.get_analytics_time_series(
    p_interval_type VARCHAR(10) DEFAULT 'day', -- 'hour', 'day', 'week'
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    time_bucket TIMESTAMP WITH TIME ZONE,
    page_views BIGINT,
    unique_sessions BIGINT,
    total_events BIGINT
) AS $
DECLARE
    interval_format TEXT;
BEGIN
    -- Set the date truncation format based on interval type
    CASE p_interval_type
        WHEN 'hour' THEN interval_format := 'hour';
        WHEN 'week' THEN interval_format := 'week';
        ELSE interval_format := 'day';
    END CASE;

    RETURN QUERY
    EXECUTE format('
        SELECT
            date_trunc(%L, e.created_at) as time_bucket,
            COUNT(CASE WHEN e.type = ''pageview'' THEN 1 END) as page_views,
            COUNT(DISTINCT e.session_id) as unique_sessions,
            COUNT(*) as total_events
        FROM public.analytics_events e
        WHERE e.created_at >= %L
        AND e.created_at <= %L
        GROUP BY date_trunc(%L, e.created_at)
        ORDER BY time_bucket ASC',
        interval_format, p_start_date, p_end_date, interval_format
    );
END;

$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old analytics data (data retention policy)
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics_data(
    p_retention_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $
DECLARE
    deleted_events INTEGER;
    deleted_sessions INTEGER;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - (p_retention_days || ' days')::INTERVAL;

    -- Delete old events first (due to foreign key constraint)
    DELETE FROM public.analytics_events
    WHERE created_at < cutoff_date;

    GET DIAGNOSTICS deleted_events = ROW_COUNT;

    -- Delete old sessions that have no events
    DELETE FROM public.analytics_sessions
    WHERE created_at < cutoff_date
    AND NOT EXISTS (
        SELECT 1 FROM public.analytics_events
        WHERE analytics_events.session_id = analytics_sessions.session_id
    );

    GET DIAGNOSTICS deleted_sessions = ROW_COUNT;

    -- Log the cleanup operation
    INSERT INTO public.analytics_events (type, details, session_id, timestamp)
    VALUES (
        'system_cleanup',
        jsonb_build_object(
            'deleted_events', deleted_events,
            'deleted_sessions', deleted_sessions,
            'retention_days', p_retention_days,
            'cutoff_date', cutoff_date
        ),
        'system',
        EXTRACT(EPOCH FROM NOW()) * 1000
    );

    RETURN deleted_events + deleted_sessions;
END;

$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get content performance analytics
CREATE OR REPLACE FUNCTION public.get_content_performance(
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    content_type VARCHAR(50),
    action_type VARCHAR(50),
    action_count BIGINT,
    unique_sessions BIGINT
) AS $
BEGIN
    RETURN QUERY
    SELECT
        COALESCE((e.details->>'contentType')::VARCHAR(50), 'unknown') as content_type,
        COALESCE((e.details->>'action')::VARCHAR(50), e.type) as action_type,
        COUNT(*) as action_count,
        COUNT(DISTINCT e.session_id) as unique_sessions
    FROM public.analytics_events e
    WHERE e.created_at >= p_start_date
    AND e.created_at <= p_end_date
    AND e.type IN ('user_action', 'content_interaction', 'rant_action')
    GROUP BY content_type, action_type
    ORDER BY action_count DESC;
END;

$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions to anonymous users
GRANT
EXECUTE ON FUNCTION public.upsert_analytics_session (VARCHAR(36), TEXT, TEXT) TO anon;

GRANT
EXECUTE ON FUNCTION public.increment_session_events (VARCHAR(36)) TO anon;

GRANT
EXECUTE ON FUNCTION public.get_analytics_metrics (
    TIMESTAMP
    WITH
        TIME ZONE,
        TIMESTAMP
    WITH
        TIME ZONE
) TO anon;

GRANT
EXECUTE ON FUNCTION public.get_top_pages (
    INTEGER,
    TIMESTAMP
    WITH
        TIME ZONE,
        TIMESTAMP
    WITH
        TIME ZONE
) TO anon;

GRANT
EXECUTE ON FUNCTION public.get_event_counts_by_type (
    TIMESTAMP
    WITH
        TIME ZONE,
        TIMESTAMP
    WITH
        TIME ZONE
) TO anon;

GRANT
EXECUTE ON FUNCTION public.get_analytics_time_series (
    VARCHAR(10),
    TIMESTAMP
    WITH
        TIME ZONE,
        TIMESTAMP
    WITH
        TIME ZONE
) TO anon;

GRANT
EXECUTE ON FUNCTION public.cleanup_old_analytics_data (INTEGER) TO anon;

GRANT
EXECUTE ON FUNCTION public.get_content_performance (
    TIMESTAMP
    WITH
        TIME ZONE,
        TIMESTAMP
    WITH
        TIME ZONE
) TO anon;
