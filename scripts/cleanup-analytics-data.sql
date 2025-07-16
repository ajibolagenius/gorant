-- Analytics Data Cleanup Script
-- This script can be run periodically to maintain analytics data retention policies
-- Default retention period is 365 days (1 year)

-- Set the retention period (in days)
-- You can modify this value based on your data retention requirements
\set retention_days 365

-- Display current analytics data statistics before cleanup
SELECT
    'Before Cleanup' AS status,
    (
        SELECT COUNT(*)
        FROM public.analytics_events
    ) AS total_events,
    (
        SELECT COUNT(*)
        FROM public.analytics_sessions
    ) AS total_sessions,
    (
        SELECT MIN(created_at)
        FROM public.analytics_events
    ) AS oldest_event,
    (
        SELECT MAX(created_at)
        FROM public.analytics_events
    ) AS newest_event;

-- Execute the cleanup function
SELECT public.cleanup_old_analytics_data(:retention_days) as deleted_records;

-- Display analytics data statistics after cleanup
SELECT
    'After Cleanup' AS status,
    (
        SELECT COUNT(*)
        FROM public.analytics_events
    ) AS total_events,
    (
        SELECT COUNT(*)
        FROM public.analytics_sessions
    ) AS total_sessions,
    (
        SELECT MIN(created_at)
        FROM public.analytics_events
    ) AS oldest_event,
    (
        SELECT MAX(created_at)
        FROM public.analytics_events
    ) AS newest_event;

-- Display disk space usage for analytics tables
SELECT
    schemaname,
    tablename,
    pg_size_pretty (
        pg_total_relation_size (
            schemaname || '.' || tablename
        )
    ) AS size
FROM pg_tables
WHERE
    tablename IN (
        'analytics_events',
        'analytics_sessions'
    )
    AND schemaname = 'public';

-- Vacuum and analyze tables to reclaim space and update statistics
VACUUM ANALYZE public.analytics_events;

VACUUM ANALYZE public.analytics_sessions;

-- Display final message
SELECT 'Analytics data cleanup completed successfully!' AS message;
