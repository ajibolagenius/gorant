-- Migration for analytics performance optimizations

-- Add additional indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp_type ON analytics_events ("timestamp" DESC, type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at_type ON analytics_events (created_at DESC, type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_anonymous_id_timestamp ON analytics_events (
    anonymous_id,
    "timestamp" DESC
);

-- Create a table for storing pre-aggregated analytics data
CREATE TABLE IF NOT EXISTS analytics_aggregations (
    id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
    aggregation_type VARCHAR(50) NOT NULL,
    time_period VARCHAR(20) NOT NULL,
    start_date TIMESTAMP
    WITH
        TIME ZONE,
        end_date TIMESTAMP
    WITH
        TIME ZONE,
        data JSONB NOT NULL,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying of aggregations
CREATE INDEX IF NOT EXISTS idx_analytics_aggregations_type ON analytics_aggregations (aggregation_type);

CREATE INDEX IF NOT EXISTS idx_analytics_aggregations_period ON analytics_aggregations (time_period);

CREATE INDEX IF NOT EXISTS idx_analytics_aggregations_dates ON analytics_aggregations (start_date, end_date);

-- Create a function for background processing of analytics data
CREATE OR REPLACE FUNCTION process_analytics_aggregations()
RETURNS void AS $$
DECLARE
    current_date TIMESTAMP WITH TIME ZONE := NOW();
    yesterday TIMESTAMP WITH TIME ZONE := current_date - INTERVAL '1 day';
    last_week TIMESTAMP WITH TIME ZONE := current_date - INTERVAL '7 days';
    last_month TIMESTAMP WITH TIME ZONE := current_date - INTERVAL '30 days';
    daily_data JSONB;
    weekly_data JSONB;
    monthly_data JSONB;
BEGIN
    -- Process daily aggregations
    SELECT jsonb_build_object(
        'pageViews', COUNT(*) FILTER (WHERE type = 'pageview'),
        'uniqueSessions', COUNT(DISTINCT anonymous_id),
        'totalEvents', COUNT(*)
    )
    INTO daily_data
    FROM analytics_events
    WHERE created_at >= yesterday
    AND created_at < current_date;

    -- Store daily aggregation
    INSERT INTO analytics_aggregations (aggregation_type, time_period, start_date, end_date, data)
    VALUES ('dashboard', 'daily', yesterday, current_date, daily_data);

    -- Process weekly aggregations
    SELECT jsonb_build_object(
        'pageViews', COUNT(*) FILTER (WHERE type = 'pageview'),
        'uniqueSessions', COUNT(DISTINCT anonymous_id),
        'totalEvents', COUNT(*)
    )
    INTO weekly_data
    FROM analytics_events
    WHERE created_at >= last_week
    AND created_at < current_date;

    -- Store weekly aggregation
    INSERT INTO analytics_aggregations (aggregation_type, time_period, start_date, end_date, data)
    VALUES ('dashboard', 'weekly', last_week, current_date, weekly_data);

    -- Process monthly aggregations
    SELECT jsonb_build_object(
        'pageViews', COUNT(*) FILTER (WHERE type = 'pageview'),
        'uniqueSessions', COUNT(DISTINCT anonymous_id),
        'totalEvents', COUNT(*)
    )
    INTO monthly_data
    FROM analytics_events
    WHERE created_at >= last_month
    AND created_at < current_date;

    -- Store monthly aggregation
    INSERT INTO analytics_aggregations (aggregation_type, time_period, start_date, end_date, data)
    VALUES ('dashboard', 'monthly', last_month, current_date, monthly_data);
END;
$$ LANGUAGE plpgsql;

-- Create a function to aggregate top pages data
CREATE OR REPLACE FUNCTION aggregate_top_pages(start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'page', page,
            'pageViews', COUNT(*),
            'uniqueSessions', COUNT(DISTINCT anonymous_id)
        )
    )
    INTO result
    FROM (
        SELECT page, anonymous_id
        FROM analytics_events
        WHERE type = 'pageview'
        AND created_at >= start_date
        AND created_at < end_date
        AND page IS NOT NULL
        GROUP BY page, anonymous_id
        ORDER BY COUNT(*) OVER (PARTITION BY page) DESC
        LIMIT 10
    ) AS top_pages
    GROUP BY page
    ORDER BY COUNT(*) DESC;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to aggregate event counts data
CREATE OR REPLACE FUNCTION aggregate_event_counts(start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'eventType', type,
            'eventCount', COUNT(*),
            'uniqueSessions', COUNT(DISTINCT anonymous_id)
        )
    )
    INTO result
    FROM analytics_events
    WHERE created_at >= start_date
    AND created_at < end_date
    GROUP BY type
    ORDER BY COUNT(*) DESC;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a function to aggregate time series data
CREATE OR REPLACE FUNCTION aggregate_time_series(interval_type TEXT, start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    truncation_unit TEXT;
BEGIN
    IF interval_type = 'hour' THEN
        truncation_unit := 'hour';
    ELSIF interval_type = 'week' THEN
        truncation_unit := 'week';
    ELSE
        truncation_unit := 'day';
    END IF;

    EXECUTE format('
        SELECT jsonb_agg(
            jsonb_build_object(
                ''timeBucket'', to_char(time_bucket, ''YYYY-MM-DD HH24:MI:SS''),
                ''pageViews'', page_views,
                ''uniqueSessions'', unique_sessions,
                ''totalEvents'', total_events
            )
            ORDER BY time_bucket DESC
        )
        FROM (
            SELECT
                DATE_TRUNC(%L, created_at) AS time_bucket,
                COUNT(*) FILTER (WHERE type = ''pageview'') AS page_views,
                COUNT(DISTINCT anonymous_id) AS unique_sessions,
                COUNT(*) AS total_events
            FROM analytics_events
            WHERE created_at >= %L
            AND created_at < %L
            GROUP BY DATE_TRUNC(%L, created_at)
        ) AS time_series
    ', truncation_unit, start_date, end_date, truncation_unit)
    INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add pagination support with efficient cursor-based pagination
CREATE OR REPLACE FUNCTION get_paginated_analytics_events(
    p_limit INTEGER DEFAULT 100,
    p_cursor_timestamp BIGINT DEFAULT NULL,
    p_event_type VARCHAR DEFAULT NULL,
    p_page VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    type VARCHAR,
    page VARCHAR,
    "timestamp" BIGINT,
    anonymous_id VARCHAR,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    next_cursor BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH paginated_events AS (
        SELECT
            e.id,
            e.type,
            e.page,
            e."timestamp",
            e.anonymous_id,
            e.details,
            e.created_at,
            LEAD(e."timestamp") OVER (ORDER BY e."timestamp" DESC) AS next_cursor
        FROM
            analytics_events e
        WHERE
            (p_cursor_timestamp IS NULL OR e."timestamp" < p_cursor_timestamp)
            AND (p_event_type IS NULL OR e.type = p_event_type)
            AND (p_page IS NULL OR e.page = p_page)
        ORDER BY
            e."timestamp" DESC
        LIMIT p_limit
    )
    SELECT * FROM paginated_events;
END;
$$ LANGUAGE plpgsql;

-- Add data retention policy to automatically clean up old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data(retention_days INTEGER DEFAULT 365)
RETURNS void AS $$
BEGIN
    -- Delete events older than retention period
    DELETE FROM analytics_events
    WHERE created_at < NOW() - (retention_days * INTERVAL '1 day');

    -- Delete sessions with no events
    DELETE FROM analytics_sessions
    WHERE NOT EXISTS (
        SELECT 1 FROM analytics_events
        WHERE analytics_events.anonymous_id = analytics_sessions.anonymous_id
    );

    -- Delete old aggregations
    DELETE FROM analytics_aggregations
    WHERE created_at < NOW() - (retention_days * INTERVAL '1 day');
END;
$$ LANGUAGE plpgsql;
