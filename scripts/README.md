# Analytics Database Setup

This directory contains SQL scripts for setting up the analytics database schema and related functions.

## Setup Order

Run the scripts in the following order to set up the complete analytics system:

1. **01-create-tables.sql** - Creates the main application tables (rants, comments)
2. **02-create-functions.sql** - Creates functions for the main application
3. **03-seed-data.sql** - Seeds the database with sample data
4. **04-create-analytics-tables.sql** - Creates analytics tables and indexes
5. **05-create-analytics-functions.sql** - Creates analytics utility functions

## Analytics Schema

### Tables

#### `analytics_sessions`
Stores session information for analytics tracking.

- `id` - UUID primary key
- `session_id` - Unique session identifier (VARCHAR(36))
- `first_seen` - Timestamp of first session activity
- `last_seen` - Timestamp of last session activity
- `page_views` - Number of page views in this session
- `events_count` - Total number of events in this session
- `user_agent` - Browser user agent string
- `referrer` - Referrer URL
- `created_at` - Record creation timestamp
- `updated_at` - Record last update timestamp

#### `analytics_events`
Stores individual analytics events.

- `id` - UUID primary key
- `type` - Event type (VARCHAR(50))
- `page` - Page path where event occurred
- `timestamp` - Event timestamp (BIGINT, Unix timestamp in milliseconds)
- `session_id` - Reference to analytics_sessions.session_id
- `details` - Additional event data (JSONB)
- `user_agent` - Browser user agent string
- `referrer` - Referrer URL
- `dnt` - Do Not Track flag (BOOLEAN)
- `created_at` - Record creation timestamp

### Indexes

The following indexes are created for optimal query performance:

- Session ID lookups
- Timestamp-based queries
- Event type filtering
- Page-based analytics
- JSONB details queries (GIN index)
- Composite indexes for common query patterns

### Functions

#### Core Functions

- `upsert_analytics_session()` - Create or update session records
- `increment_session_events()` - Increment event count for a session
- `update_analytics_session_timestamp()` - Trigger function for updating timestamps

#### Analytics Query Functions

- `get_analytics_metrics()` - Get basic metrics (page views, sessions, events)
- `get_top_pages()` - Get most visited pages
- `get_event_counts_by_type()` - Get event counts grouped by type
- `get_analytics_time_series()` - Get time-series data for charts
- `get_content_performance()` - Get content interaction analytics

#### Data Management Functions

- `cleanup_old_analytics_data()` - Remove old data based on retention policy

## Usage Examples

### Running Setup Scripts

```bash
# Connect to your PostgreSQL database and run:
psql -d your_database -f scripts/04-create-analytics-tables.sql
psql -d your_database -f scripts/05-create-analytics-functions.sql
```

### Data Retention

Run the cleanup script periodically to maintain data retention policies:

```bash
# Clean up data older than 365 days (default)
psql -d your_database -f scripts/cleanup-analytics-data.sql

# Or specify custom retention period
psql -d your_database -v retention_days=180 -f scripts/cleanup-analytics-data.sql
```

### Query Examples

```sql
-- Get basic analytics metrics for the last 30 days
SELECT * FROM get_analytics_metrics(NOW() - INTERVAL '30 days', NOW());

-- Get top 10 pages by views
SELECT * FROM get_top_pages(10, NOW() - INTERVAL '7 days', NOW());

-- Get daily time series data
SELECT * FROM get_analytics_time_series('day', NOW() - INTERVAL '30 days', NOW());

-- Get content performance metrics
SELECT * FROM get_content_performance(NOW() - INTERVAL '7 days', NOW());
```

## Privacy and Security

### Privacy Features

- **No PII Collection**: The schema is designed to avoid collecting personally identifiable information
- **Anonymous Sessions**: Session IDs are temporary and not linked to user accounts
- **DNT Support**: Do Not Track preferences are respected and stored
- **Data Sanitization**: Input validation prevents storage of sensitive data

### Security Features

- **Row Level Security (RLS)**: Enabled on all analytics tables
- **Input Validation**: Check constraints prevent invalid data
- **SQL Injection Prevention**: All functions use parameterized queries
- **Access Control**: Functions have appropriate permission grants

### Data Retention

- Default retention period: 365 days
- Automatic cleanup via `cleanup_old_analytics_data()` function
- Configurable retention periods
- Vacuum and analyze operations for space reclamation

## Performance Considerations

### Indexing Strategy

- Primary indexes on frequently queried columns
- Composite indexes for common query patterns
- GIN index for JSONB column queries
- Timestamp indexes for time-range queries

### Query Optimization

- Functions use efficient SQL patterns
- Proper use of aggregation and grouping
- Time-based partitioning considerations for large datasets
- Connection pooling recommendations

### Monitoring

Monitor the following metrics:

- Table sizes and growth rates
- Query performance and execution times
- Index usage and effectiveness
- Data retention cleanup frequency

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure the database user has proper permissions
2. **Index Performance**: Monitor slow queries and add indexes as needed
3. **Storage Growth**: Implement regular cleanup procedures
4. **Connection Limits**: Use connection pooling for high-traffic applications

### Maintenance Tasks

- Run `VACUUM ANALYZE` regularly on analytics tables
- Monitor disk space usage
- Review and adjust retention policies
- Update statistics for query optimization

## Integration

The analytics database integrates with:

- `lib/analytics-db.ts` - TypeScript database utilities
- `lib/self-analytics.ts` - Client-side analytics service
- `app/api/analytics.ts` - API endpoints for data collection
- Analytics dashboard components for data visualization

## Environment Variables

Ensure the following environment variables are configured:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
