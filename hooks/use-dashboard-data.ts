import { useState, useEffect, useCallback } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { AnalyticsAPI, type DashboardData } from '@/lib/analytics-api'

interface DateRange {
    from: Date
    to: Date
}

interface AnalyticsFilters {
    dateRange: DateRange
    eventTypes: string[]
    contentCategories: string[]
    moodTypes: string[]
    pageTypes: string[]
    sessionTypes: string[]
}

interface UseDashboardDataReturn {
    data: DashboardData | null
    loading: boolean
    refreshing: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useDashboardData(dateRange: DateRange, filters?: Partial<AnalyticsFilters>): UseDashboardDataReturn {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setRefreshing(true)
            setError(null)

            const startDate = startOfDay(dateRange.from).toISOString()
            const endDate = endOfDay(dateRange.to).toISOString()

            // Single batched API call for better performance with filtering support
            const result = await AnalyticsAPI.getDashboardDataComplete({
                startDate,
                endDate,
                includeTimeSeries: true,
                includeContentPerformance: true,
                includeEventCounts: true,
                includeTrendingTopics: true,
                includePopularMoods: true,
                includeUserBehavior: true,
                includeModerationStats: true
            })

            if (result) {
                setData(result)
            } else {
                setError('Failed to load analytics data')
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err)
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [dateRange, filters])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        refreshing,
        error,
        refetch: fetchData
    }
}
