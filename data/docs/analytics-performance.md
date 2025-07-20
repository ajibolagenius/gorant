# Analytics Performance Optimizations

This document describes the performance optimizations implemented for the analytics system. These optimizations have been fully implemented as part of the Self Analytics integration in Phase 2 of the project roadmap.

## Database Optimizations

### Indexes

The following indexes have been added to improve query performance:

```sql
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp_type ON analytics_events (timestamp DESC, type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at_type ON analytics_events (created_at DESC, type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_anonymous_id_timestamp ON analytics_events (anonymous_id, timestamp DESC);
```

These indexes help speed up common queries like:
- Finding events by type and time range
- Finding events for a specific user/session
- Sorting events by timestamp

### Pre-aggregated Data

A table for storing pre-aggregated analytics data has been created:

```sql
CREATE TABLE IF NOT EXISTS analytics_aggregations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aggregation_type VARCHAR(50) NOT NULL,
    time_period VARCHAR(20) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

This table stores pre-calculated metrics for different time periods (daily, weekly, monthly), which significantly reduces the load on the database for dashboard queries.

### Aggregation Functions

Several SQL functions have been created to efficiently aggregate analytics data:

- `process_analytics_aggregations()`: Processes and stores daily, weekly, and monthly aggregations
- `aggregate_top_pages()`: Aggregates top pages data for a given time period
- `aggregate_event_counts()`: Aggregates event counts by type for a given time period
- `aggregate_time_series()`: Aggregates time series data with different interval types

### Pagination

Efficient cursor-based pagination has been implemented for large datasets:

```sql
CREATE OR REPLACE FUNCTION get_paginated_analytics_events(
    p_limit INTEGER DEFAULT 100,
    p_cursor_timestamp BIGINT DEFAULT NULL,
    p_event_type VARCHAR DEFAULT NULL,
    p_page VARCHAR DEFAULT NULL
)
```

This function returns a limited number of events with a cursor for the next page, which is much more efficient than offset-based pagination for large datasets.

### Data Retention

A data retention policy has been implemented to automatically clean up old analytics data:

```sql
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data(retention_days INTEGER DEFAULT 365)
```

This function deletes events older than the specified retention period, which helps keep the database size manageable.

## Caching Layer

A caching layer has been implemented in `lib/analytics-cache.ts` with the following features:

- In-memory caching with TTL (Time To Live)
- Automatic cache invalidation
- Cache key generation for different types of analytics data
- Cache statistics for monitoring

## Optimized Database Access

The `lib/analytics-db-optimized.ts` file provides optimized functions for accessing analytics data:

- `getMetrics()`: Gets analytics metrics using pre-aggregated data
- `getTopPages()`: Gets top pages using aggregation function
- `getEventCountsByType()`: Gets event counts by type using aggregation function
- `getTimeSeriesData()`: Gets time series data using aggregation function
- `getPaginatedEvents()`: Gets paginated events using cursor-based pagination

## Background Processing

A script has been created to run the analytics aggregation process as a scheduled job:

```
scripts/run-analytics-aggregation.ts
```

This script can be run daily to aggregate analytics data and clean up old data.

## Usage

### API Route

The API route has been updated to use the optimized functions:

```typescript
// Use optimized metrics function
const metrics = await analyticsPerformance.getMetrics(startDate, endDate)
```

### Pagination Hook

A pagination hook has been created for efficient data handling in the UI:

```typescript
const {
    data,
    loading,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage
} = useAnalyticsPagination({
    initialData,
    pageSize: 5,
    fetchData: async (page, pageSize) => {
        // Fetch data with pagination
    }
})
```

## Maintenance

### Running Aggregation Process

To run the aggregation process manually:

```bash
npx tsx scripts/run-analytics-aggregation.ts
```

### Clearing Cache

To clear the cache programmatically:

```typescript
analyticsPerformance.clearAllCaches()
```

Or for a specific cache type:

```typescript
analyticsPerformance.clearCacheByType('metrics')
```

### Monitoring Cache

To get cache statistics:

```typescript
const stats = analyticsPerformance.getCacheStats()
```
