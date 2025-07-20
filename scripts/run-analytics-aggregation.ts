/**
 * Script to run analytics aggregation process
 *
 * This script can be run as a scheduled job to aggregate analytics data
 * and clean up old data for better performance.
 *
 * Usage:
 * npx tsx scripts/run-analytics-aggregation.ts
 */

import { AnalyticsDBOptimized } from '../lib/analytics-db-optimized'

async function main() {
    console.log('Starting analytics aggregation process...')

    try {
        // Run the aggregation process
        console.log('Running analytics aggregation...')
        const aggregationResult = await AnalyticsDBOptimized.runAggregation()

        if (aggregationResult) {
            console.log('Analytics aggregation completed successfully')
        } else {
            console.error('Analytics aggregation failed')
        }

        // Run data retention cleanup (default 365 days)
        console.log('Running data retention cleanup...')
        const retentionResult = await AnalyticsDBOptimized.runDataRetention()

        if (retentionResult) {
            console.log('Data retention cleanup completed successfully')
        } else {
            console.error('Data retention cleanup failed')
        }

        console.log('Analytics processing completed')
    } catch (error) {
        console.error('Error running analytics processing:', error)
        process.exit(1)
    }
}

// Run the main function
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Unhandled error:', error)
        process.exit(1)
    })
