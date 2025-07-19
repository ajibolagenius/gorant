# Analytics Testing Guide

This guide covers testing the analytics system in the Rant platform, including the test utility, manual testing procedures, and troubleshooting common issues.

---

## 🧪 Test Utility Overview

The `test-analytics.js` file provides a command-line utility for testing analytics functionality without needing to run the full application. This is particularly useful for:

- Verifying database connectivity
- Testing analytics data retrieval
- Debugging analytics issues
- Validating configuration changes
- Development and CI/CD testing

---

## 🚀 Running the Test Utility

### Basic Usage
```bash
node test-analytics.js
```

### Expected Output
When the analytics system is working correctly, you should see output similar to:

```
Testing analytics database...
DB Available: true
Metrics: {
  totalPageViews: 1247,
  uniqueSessions: 342,
  totalEvents: 2891,
  avgSessionDuration: "4m 32s"
}
Top Pages: [
  { page: "/", pageViews: 456, uniqueSessions: 123 },
  { page: "/bookmarks", pageViews: 234, uniqueSessions: 89 },
  { page: "/challenges", pageViews: 189, uniqueSessions: 67 },
  { page: "/leaderboard", pageViews: 156, uniqueSessions: 45 },
  { page: "/admin", pageViews: 78, uniqueSessions: 23 }
]
Event Counts: [
  { eventType: "pageview", eventCount: 1247, uniqueSessions: 342 },
  { eventType: "user_action", eventCount: 891, uniqueSessions: 234 },
  { eventType: "rant_posted", eventCount: 456, uniqueSessions: 156 },
  { eventType: "like_clicked", eventCount: 297, uniqueSessions: 123 }
]
```

---

## 🔍 What the Test Covers

### 1. Database Availability Check
- Tests if Supabase connection is configured and working
- Returns `true` if database is available, `false` otherwise
- Falls back to mock data when database is unavailable

### 2. Metrics Retrieval
Tests the core analytics metrics:
- **Total Page Views** - Count of all pageview events
- **Unique Sessions** - Number of distinct user sessions
- **Total Events** - Count of all tracked events
- **Average Session Duration** - Time users spend on the platform

### 3. Top Pages Analysis
Retrieves and displays:
- Most visited pages by view count
- Unique sessions per page
- Sorted by popularity (highest views first)
- Limited to top 5 results for testing

### 4. Event Type Breakdown
Shows analytics by event type:
- Event type names (pageview, user_action, etc.)
- Total count for each event type
- Unique sessions that triggered each event type
- Sorted by frequency (most common first)

---

## 🛠️ Troubleshooting

### Database Connection Issues

**Problem:** `DB Available: false`
```
Testing analytics database...
DB Available: false
Metrics: { totalPageViews: 1247, uniqueSessions: 342, totalEvents: 2891, avgSessionDuration: "4m 32s" }
```

**Solutions:**
1. Check your `.env.local` file for correct Supabase credentials
2. Verify Supabase project is active and accessible
3. Ensure database migrations have been run
4. Check network connectivity

### Import/Export Errors

**Problem:** `SyntaxError: Cannot use import statement outside a module`

**Solutions:**
1. Ensure you're using Node.js 14+ with ES modules support
2. Check that the import path is correct: `./lib/analytics-db.js`
3. Verify the analytics-db.ts file has been compiled or is accessible

### Empty Data Results

**Problem:** All metrics return 0 or empty arrays
```
Metrics: { totalPageViews: 0, uniqueSessions: 0, totalEvents: 0 }
Top Pages: []
Event Counts: []
```

**Solutions:**
1. Check if analytics tables exist in your database
2. Verify that the application has been used to generate some analytics data
3. Run the data seeding script if available
4. Check date range filters (if any) in the test queries

### Permission Errors

**Problem:** Database query errors or permission denied

**Solutions:**
1. Verify Supabase RLS (Row Level Security) policies
2. Check that the service key has appropriate permissions
3. Ensure analytics tables are accessible to the application user

---

## 🔧 Manual Testing Procedures

### 1. End-to-End Analytics Flow
1. Start the development server: `npm run dev`
2. Navigate through different pages in the application
3. Perform user actions (like posts, bookmarks, etc.)
4. Run the test utility: `node test-analytics.js`
5. Verify that metrics have increased

### 2. Privacy Settings Testing
1. Disable analytics in user settings
2. Perform actions in the application
3. Run the test utility
4. Verify that no new events were recorded

### 3. Dashboard Integration Testing
1. Navigate to `/admin/analytics`
2. Compare dashboard data with test utility output
3. Verify that both show consistent metrics
4. Test date range filtering if implemented

---

## 📊 Mock Data Behavior

When the database is unavailable, the test utility returns realistic mock data:

- **Metrics:** Simulated usage statistics
- **Top Pages:** Common application routes with realistic view counts
- **Event Counts:** Typical user interaction patterns

This allows development and testing to continue even without a database connection.

---

## 🚀 Integration with CI/CD

The test utility can be integrated into automated testing pipelines:

```bash
# In your CI/CD script
npm install
node test-analytics.js
```

**Exit Codes:**
- `0` - All tests passed successfully
- `1` - Tests failed or errors occurred

---

## 📝 Adding Custom Tests

You can extend the test utility by modifying `test-analytics.js`:

```javascript
// Add custom test functions
async function testCustomMetric() {
    try {
        const customData = await AnalyticsDB.getCustomMetric();
        console.log('Custom Metric:', customData);
    } catch (error) {
        console.error('Custom test failed:', error);
    }
}

// Call in main test function
await testCustomMetric();
```

---

## 🔍 Performance Testing

For performance testing of the analytics system:

1. **Load Testing:** Generate multiple concurrent analytics events
2. **Volume Testing:** Test with large datasets (1000+ events)
3. **Stress Testing:** Test system behavior under high load
4. **Memory Testing:** Monitor memory usage during batch operations

---

**The analytics testing utility provides a comprehensive way to verify that your analytics system is working correctly and helps identify issues before they affect users.**
