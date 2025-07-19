import { useMemo } from 'react'
import type { DashboardData } from '@/lib/analytics-api'

interface AnalyticsMetrics {
    totalPageViews: number
    uniqueSessions: number
    totalEvents: number
    avgSessionDuration: string
    trends?: {
        pageViewsTrend: number
        sessionsTrend: number
        eventsTrend: number
    }
}

export function useAnalyticsMetrics(
    dashboardData: DashboardData | null,
    previousPeriodData?: DashboardData | null
): AnalyticsMetrics {
    return useMemo(() => {
        const current = dashboardData?.metrics
        const previous = previousPeriodData?.metrics

        const metrics: AnalyticsMetrics = {
            totalPageViews: current?.totalPageViews ?? 0,
            uniqueSessions: current?.uniqueSessions ?? 0,
            totalEvents: current?.totalEvents ?? 0,
            avgSessionDuration: current?.avgSessionDuration ?? "0m"
        }

        // Calculate trends if previous period data is available
        if (current && previous) {
            const calculateTrend = (current: number, previous: number): number => {
                if (previous === 0) return current > 0 ? 100 : 0
                return Math.round(((current - previous) / previous) * 100)
            }

            metrics.trends = {
                pageViewsTrend: calculateTrend(current.totalPageViews, previous.totalPageViews),
                sessionsTrend: calculateTrend(current.uniqueSessions, previous.uniqueSessions),
                eventsTrend: calculateTrend(current.totalEvents, previous.totalEvents)
            }
        }

        return metrics
    }, [dashboardData?.metrics, previousPeriodData?.metrics])
}
