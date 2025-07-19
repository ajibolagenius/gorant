import { useState, useEffect, useCallback } from 'react'
import { AnalyticsAPI } from '@/lib/analytics-api'

interface UserMetrics {
    totalUsers: number
    onlineUsers: number
    newUsersToday: number
    activeUsersLast7Days: number
}

interface UserGrowthData {
    date: string
    newUsers: number
    totalUsers: number
}

interface UseUserMetricsReturn {
    metrics: UserMetrics | null
    growthData: UserGrowthData[] | null
    loading: boolean
    refreshing: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useUserMetrics(refreshInterval: number = 30000): UseUserMetricsReturn {
    const [metrics, setMetrics] = useState<UserMetrics | null>(null)
    const [growthData, setGrowthData] = useState<UserGrowthData[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUserMetrics = useCallback(async () => {
        try {
            setRefreshing(true)
            setError(null)

            // Fetch user metrics and growth data in parallel
            const [metricsResult, growthResult] = await Promise.all([
                AnalyticsAPI.getUserMetrics(),
                AnalyticsAPI.getUserGrowthData(30) // Last 30 days
            ])

            if (metricsResult) {
                setMetrics(metricsResult)
            } else {
                setError('Failed to load user metrics')
            }

            if (growthResult) {
                setGrowthData(growthResult)
            }
        } catch (err) {
            console.error('Failed to fetch user metrics:', err)
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchUserMetrics()

        // Set up auto-refresh for real-time metrics
        const interval = setInterval(fetchUserMetrics, refreshInterval)

        return () => clearInterval(interval)
    }, [fetchUserMetrics, refreshInterval])

    return {
        metrics,
        growthData,
        loading,
        refreshing,
        error,
        refetch: fetchUserMetrics
    }
}
