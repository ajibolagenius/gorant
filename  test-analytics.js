// Simple test to verify analytics data
import { AnalyticsDB } from './lib/analytics-db.js';

async function testAnalytics() {
    console.log('Testing analytics database...');

    try {
        // Test if DB is available
        console.log('DB Available:', AnalyticsDB.isAvailable());

        // Get metrics
        const metrics = await AnalyticsDB.getMetrics();
        console.log('Metrics:', metrics);

        // Get top pages
        const topPages = await AnalyticsDB.getTopPages(5);
        console.log('Top Pages:', topPages);

        // Get event counts
        const eventCounts = await AnalyticsDB.getEventCountsByType();
        console.log('Event Counts:', eventCounts.slice(0, 5));

    } catch (error) {
        console.error('Error testing analytics:', error);
    }
}

testAnalytics();
