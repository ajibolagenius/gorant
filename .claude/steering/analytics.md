---
inclusion: always
---

# Analytics Implementation Guidelines

## Overview

The Rant platform implements a comprehensive, privacy-first analytics system that tracks user engagement, content performance, and platform health while respecting user privacy and providing transparent data collection practices.

## Analytics Architecture

### Core Components
- **Self-Analytics System** - Custom analytics implementation with privacy controls
- **Recharts Integration** - Data visualization and chart rendering
- **Supabase Analytics** - Database-backed analytics storage and querying
- **Real-time Metrics** - Live performance tracking and monitoring

### Data Collection Principles
- **Privacy-First** - User consent required for all analytics tracking
- **Anonymous by Default** - No personally identifiable information collected
- **Transparent** - Users can see what data is collected and opt-out
- **Minimal Collection** - Only collect data necessary for platform improvement

## Analytics Modules

### Core Analytics (`lib/self-analytics.ts`)
- Main analytics tracking and event collection
- Privacy-compliant data handling
- Event batching and optimization

### Analytics API (`lib/analytics-api.ts`)
- API layer for analytics data retrieval
- Standardized data formatting and response handling
- Error handling and fallback mechanisms

### Analytics Database (`lib/analytics-db.ts`, `lib/analytics-db-optimized.ts`)
- Database operations for analytics data
- Optimized queries for performance
- Data aggregation and summarization

### Analytics Caching (`lib/analytics-cache.ts`)
- Caching layer for frequently accessed analytics data
- Performance optimization for dashboard loading
- Cache invalidation strategies

### Analytics Configuration (`lib/analytics-config.ts`)
- Centralized configuration for analytics settings
- Environment-specific configurations
- Feature flags for analytics components

### Analytics Privacy (`lib/analytics-privacy.ts`)
- Privacy compliance utilities
- Consent management
- Data anonymization functions

### Analytics Performance (`lib/analytics-performance.ts`)
- Performance monitoring and optimization
- Query performance tracking
- Resource usage monitoring

## Analytics Hooks

### Primary Hooks
- `use-analytics.ts` - Main analytics tracking and state management
- `use-analytics-metrics.ts` - Metrics collection and aggregation
- `use-analytics-pagination.ts` - Paginated analytics data handling
- `use-dashboard-data.ts` - Dashboard-specific data management
- `use-content-performance-data.ts` - Content performance tracking
- `use-user-metrics.ts` - User-specific analytics and metrics

## Analytics Components

### Dashboard Components (`components/analytics/`)
- Analytics dashboard layouts and visualizations
- Chart components using Recharts
- Metric cards and summary displays
- Filter and date range selectors

### Consent Management
- `analytics-consent.tsx` - User consent interface
- Privacy-compliant consent collection
- Opt-in/opt-out functionality

## Data Types and Metrics

### User Engagement Metrics
- Page views and session duration
- Content interaction rates (likes, comments, shares)
- User retention and return visits
- Feature usage statistics

### Content Performance Metrics
- Rant engagement rates
- Popular content identification
- Trending topic analysis
- Content lifecycle tracking

### Platform Health Metrics
- System performance indicators
- Error rates and debugging information
- User experience metrics
- Platform stability monitoring

## Implementation Guidelines

### Event Tracking
- Use consistent event naming conventions
- Include relevant context data with events
- Batch events for performance optimization
- Implement proper error handling

### Data Visualization
- Use Recharts for all chart implementations
- Maintain consistent color schemes and styling
- Implement responsive chart designs
- Provide accessible chart alternatives

### Performance Optimization
- Implement data caching where appropriate
- Use pagination for large datasets
- Optimize database queries for analytics
- Monitor and optimize chart rendering performance

### Privacy Compliance
- Always check user consent before tracking
- Provide clear opt-out mechanisms
- Anonymize all collected data
- Regular privacy compliance audits

## Testing and Validation

### Analytics Testing Scripts
- `scripts/run-analytics-tests.sh` - Automated analytics testing
- `scripts/populate-analytics-data.js` - Test data generation
- `scripts/run-analytics-aggregation.ts` - Data aggregation testing

### Validation Requirements
- Verify data accuracy and consistency
- Test privacy compliance mechanisms
- Validate chart rendering and responsiveness
- Performance testing for large datasets

## Admin Analytics Features

### Admin Dashboard Integration
- Real-time platform metrics
- User engagement analytics
- Content moderation insights
- System health monitoring

### Reporting Capabilities
- Automated report generation
- Custom date range analysis
- Export functionality for data
- Historical trend analysis

## Future Analytics Enhancements

### Planned Improvements
- Advanced user segmentation
- Predictive analytics capabilities
- A/B testing framework integration
- Enhanced privacy controls

### Integration Opportunities
- Third-party analytics service integration
- Advanced visualization libraries
- Machine learning insights
- Real-time alerting systems
