import { useState, useEffect, useCallback } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { AnalyticsAPI, type DashboardData } from '@/lib/analytics-api'

interface DateRange {
    from: Date
    to: Date
}

interface UseDashboardDataReturn {
    data: DashboardData | null
    loading: boolean
    refreshing: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useDashboardData(dateRange: DateRange): UseDashboardDataReturn {
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

            const result = await AnalyticsAPI.getDashboardData({
                startDate,
                endDate
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
    }, [dateRange])

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
