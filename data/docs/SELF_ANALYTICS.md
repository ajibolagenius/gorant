# Self Analytics System

A privacy-friendly, self-hosted analytics system for the Rant platform that provides comprehensive usage insights while respecting user privacy.

---

## Overview

The Rant platform now includes a fully implemented, privacy-first analytics system that tracks essential engagement and usage metrics without relying on third-party services. The system includes event tracking, data storage, an admin dashboard, and comprehensive privacy controls.

---

## ✅ Current Implementation Status

### **Completed Features**

- ✅ **Analytics Service** (`lib/self-analytics.ts`) - Core tracking service with privacy controls
- ✅ **Analytics Database** (`lib/analytics-db.ts`) - Database operations and data retrieval
- ✅ **Analytics API** (`app/api/analytics/route.ts`) - REST endpoints for event storage and dashboard data
- ✅ **React Hook** (`hooks/use-analytics.ts`) - Easy integration for React components
- ✅ **Admin Dashboard** (`app/admin/analytics/page.tsx`) - Web interface for viewing analytics
- ✅ **Dashboard Components** (`components/analytics/`) - Reusable dashboard UI components
- ✅ **Database Migrations** - Supabase schema for analytics storage
- ✅ **Testing Utility** (`test-analytics.js`) - Command-line tool for testing analytics functionality and database connectivity

---

## 🎯 What We Track

### **Page Analytics**
- **Page Views** - Which pages are visited and how often
- **Unique Sessions** - Anonymous session tracking without personal identifiers
- **Session Duration** - Time spent on the platform
- **Top Pages** - Most popular content and navigation patterns

### **User Interactions**
- **User Actions** - Key interactions (posting, liking, bookmarking, commenting)
- **Content Performance** - Engagement metrics by content type and mood
- **Event Counts** - Frequency of different user actions
- **Time Series Data** - Activity trends over time (hourly, daily, weekly)

### **Technical Metrics**
- **Browser/Device Info** - For optimization and troubleshooting (optional)
- **Referrer Sources** - Understanding traffic origins (optional)
- **Error Tracking** - Failed requests and system issues

---

## 🔒 Privacy & Security Features

### **Privacy by Design**
- **No Personal Data** - Zero collection of emails, names, or identifying information
- **Anonymous Sessions** - Generated session IDs with no cross-session tracking
- **DNT Respect** - Honors "Do Not Track" browser settings
- **User Consent** - Respects user privacy preferences from settings and consent banner
- **Data Sanitization** - Automatic removal of potential PII from event data (enforced at API level)
- **PII Enforcement** - All analytics event details are sanitized server-side to remove any fields that could contain personally identifiable information (PII) before storage. This includes keys like email, name, address, IP, userId, etc.
- **Audit Logging** - Every access to the analytics dashboard is logged for compliance, including timestamp, query parameters, and client identifier. This supports privacy audits and regulatory requirements.
- **Session Anonymization** - All analytics identifiers (sessionId, userId) are randomly generated and not linkable to real users. No persistent or cross-session tracking is performed.

### **Security Measures**
- **Rate Limiting** - Prevents abuse and spam
- **Input Validation** - Zod schema validation for all data
- **Error Handling** - Silent failures to avoid impacting user experience
- **Data Retention** - Configurable cleanup of old analytics data

---

## 🏗️ Architecture

### **Frontend Tracking**
```typescript
// Using the analytics hook
const { trackEvent, trackPageView, trackUserAction } = useAnalytics()

// Track page views
await trackPageView('/bookmarks')

// Track user actions
await trackUserAction('rant_posted', { mood: 'happy', tags: ['coding'] })

// Track custom events
await trackEvent('feature_used', { feature: 'dark_mode' })
```

### **Database Schema**

#### `analytics_events` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| type | TEXT | Event type (pageview, user_action, etc.) |
| page | TEXT | Page path where event occurred |
| timestamp | BIGINT | Unix timestamp |
| anonymous_id | TEXT | Session identifier |
| details | JSONB | Event-specific data |
| user_agent | TEXT | Browser information (optional) |
| referrer | TEXT | Referrer URL (optional) |
| dnt | BOOLEAN | Do Not Track preference |

#### `analytics_sessions` Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| anonymous_id | TEXT | Session identifier |
| first_seen | TIMESTAMP | Session start time |
| last_seen | TIMESTAMP | Last activity time |
| page_views | INTEGER | Number of pages viewed |
| events_count | INTEGER | Total events in session |

### **API Endpoints**

#### `POST /api/analytics`
Store analytics events (single or batch)
```json
{
  "type": "pageview",
  "page": "/bookmarks",
  "timestamp": 1642694400000,
  "sessionId": "session_123",
  "details": { "mood": "happy" }
}
```

#### `GET /api/analytics`
Retrieve dashboard data with optional filtering
```
/api/analytics?startDate=2024-01-01&endDate=2024-01-31&endpoint=metrics
```

---

## 📊 Admin Dashboard

### **Access**
- Navigate to `/admin/analytics` (requires admin access)
- Real-time metrics and historical data
- Date range filtering and data export capabilities

### **Key Metrics Display**
- **Overview Cards** - Total page views, unique sessions, total events, avg session duration
- **Top Pages Table** - Most visited pages with view counts and unique sessions
- **Event Analytics** - Breakdown of user actions and interactions
- **Time Series Charts** - Activity trends over time (coming soon)

### **Features**
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Updates** - Automatic data refresh
- **Error Handling** - Graceful fallbacks when data is unavailable
- **Loading States** - Smooth user experience during data fetching

---

## 🧪 Testing & Development

### **Testing Analytics**
Use the included test utility to verify analytics functionality:

```bash
node test-analytics.js
```

This will test:
- Database connectivity and availability check
- Metrics retrieval (total page views, unique sessions, total events)
- Top pages data with view counts and unique sessions
- Event counts by type with session tracking
- Error handling and graceful fallbacks

For detailed testing procedures, troubleshooting, and advanced testing scenarios, see the [Analytics Testing Guide](ANALYTICS_TESTING.md).

### **Development Mode**
- Enhanced logging and error reporting
- Mock data when database is unavailable
- Console warnings for debugging

---

## ⚙️ Configuration

### **Analytics Configuration** (`lib/analytics-config.ts`)
```typescript
export interface AnalyticsConfig {
  enabled: boolean
  batchSize: number
  flushInterval: number
  maxRetries: number
  retryDelay: number
  maxStringLength: number
}
```

### **User Privacy Settings**
Users can control analytics through the settings page:
- **Share Analytics** - Enable/disable all analytics tracking
- **Privacy Mode** - Enhanced privacy with minimal data collection

---

## 🚀 Usage Examples

### **Component Integration**
```typescript
import { useAnalytics, usePageViewTracking } from '@/hooks/use-analytics'

function MyComponent() {
  const { trackUserAction } = useAnalytics()

  // Automatic page view tracking
  usePageViewTracking()

  const handleLike = async () => {
    await trackUserAction('rant_liked', {
      rantId: 'abc123',
      mood: 'happy'
    })
  }

  return <button onClick={handleLike}>Like</button>
}
```

### **Service Integration**
```typescript
import { analyticsService } from '@/lib/self-analytics'

// Check if analytics is enabled
if (analyticsService.isEnabled()) {
  await analyticsService.trackEvent('custom_event', { data: 'value' })
}

// Get current session info
const sessionId = analyticsService.getSessionId()
const queueSize = analyticsService.getQueueSize()
```

---

## 🔄 Data Flow

1. **Event Generation** - User interactions trigger analytics events
2. **Privacy Check** - System verifies user consent and DNT settings
3. **Data Sanitization** - Remove PII and validate event data (client and API enforced)
4. **Audit Logging** - Dashboard access is logged for compliance and security
5. **Queuing** - Events are batched for efficient processing
6. **Storage** - Events stored in Supabase database
7. **Dashboard** - Admin interface queries and displays analytics data

---

## 📈 Performance Optimizations

- **Batch Processing** - Events sent in configurable batches
- **Offline Support** - Queue events when offline, sync when online
- **Retry Logic** - Exponential backoff for failed requests
- **Silent Failures** - Analytics never impacts user experience
- **Database Indexing** - Optimized queries for dashboard performance

---

## 🛠️ Maintenance

### **Data Retention**
- Configurable cleanup of old analytics data
- Default retention: 365 days
- Manual cleanup via `AnalyticsDB.cleanupOldData()`

### **Monitoring**
- Queue size monitoring for debugging
- Error logging in development mode
- Performance metrics for optimization

---

**The Self Analytics system is now fully operational and provides comprehensive insights while maintaining user privacy and system performance.**
