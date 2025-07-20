import { useState, useCallback, useEffect } from 'react'

interface PaginationOptions<T> {
    initialData?: T[]
    pageSize?: number
    fetchData: (page: number, pageSize: number) => Promise<T[]>
    totalItems?: number
}

interface PaginationResult<T> {
    data: T[]
    loading: boolean
    error: Error | null
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    goToPage: (page: number) => void
    nextPage: () => void
    previousPage: () => void
    refresh: () => void
}

/**
 * Custom hook for efficient pagination of large datasets
 */
export function useAnalyticsPagination<T>({
    initialData = [],
    pageSize = 10,
    fetchData,
    totalItems = 0
}: PaginationOptions<T>): PaginationResult<T> {
    const [data, setData] = useState<T[]>(initialData)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const [page, setPage] = useState<number>(1)
    const [total, setTotal] = useState<number>(totalItems)

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    const loadData = useCallback(async (pageNumber: number) => {
        setLoading(true)
        setError(null)

        try {
            const newData = await fetchData(pageNumber, pageSize)
            setData(newData)

            // If we got fewer items than requested and we're on page 1,
            // update the total count
            if (pageNumber === 1 && newData.length < pageSize) {
                setTotal(newData.length)
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch data'))
            console.error('Pagination error:', err)
        } finally {
            setLoading(false)
        }
    }, [fetchData, pageSize])

    // Load data when page changes
    useEffect(() => {
        loadData(page)
    }, [page, loadData])

    const goToPage = useCallback((pageNumber: number) => {
        const validPage = Math.max(1, Math.min(pageNumber, totalPages))
        setPage(validPage)
    }, [totalPages])

    const nextPage = useCallback(() => {
        if (hasNextPage) {
            setPage(p => p + 1)
        }
    }, [hasNextPage])

    const previousPage = useCallback(() => {
        if (hasPreviousPage) {
            setPage(p => p - 1)
        }
    }, [hasPreviousPage])

    const refresh = useCallback(() => {
        loadData(page)
    }, [loadData, page])

    return {
        data,
        loading,
        error,
        page,
        pageSize,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        goToPage,
        nextPage,
        previousPage,
        refresh
    }
}

/**
 * Custom hook for cursor-based pagination (more efficient for large datasets)
 */
export function useAnalyticsCursorPagination<T>({
    initialData = [],
    pageSize = 10,
    fetchData
}: {
    initialData?: T[]
    pageSize?: number
    fetchData: (cursor: string | null, limit: number) => Promise<{ data: T[], nextCursor: string | null }>
}) {
    const [data, setData] = useState<T[]>(initialData)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [prevCursors, setPrevCursors] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)

    const loadData = useCallback(async (cursor: string | null) => {
        setLoading(true)
        setError(null)

        try {
            const result = await fetchData(cursor, pageSize)
            setData(result.data)
            setNextCursor(result.nextCursor)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch data'))
            console.error('Cursor pagination error:', err)
        } finally {
            setLoading(false)
        }
    }, [fetchData, pageSize])

    // Load initial data
    useEffect(() => {
        if (initialData.length === 0) {
            loadData(null)
        }
    }, [initialData.length, loadData])

    const goToNextPage = useCallback(() => {
        if (nextCursor) {
            setPrevCursors(prev => [...prev, nextCursor])
            loadData(nextCursor)
            setCurrentPage(p => p + 1)
        }
    }, [nextCursor, loadData])

    const goToPreviousPage = useCallback(() => {
        if (prevCursors.length > 0) {
            const newPrevCursors = [...prevCursors]
            const prevCursor = newPrevCursors.pop()
            setPrevCursors(newPrevCursors)
            loadData(prevCursor || null)
            setCurrentPage(p => p - 1)
        }
    }, [prevCursors, loadData])

    const refresh = useCallback(() => {
        // Refresh current page
        if (prevCursors.length > 0) {
            loadData(prevCursors[prevCursors.length - 1])
        } else {
            loadData(null)
        }
    }, [prevCursors, loadData])

    const reset = useCallback(() => {
        setPrevCursors([])
        setNextCursor(null)
        setCurrentPage(1)
        loadData(null)
    }, [loadData])

    return {
        data,
        loading,
        error,
        hasNextPage: !!nextCursor,
        hasPreviousPage: prevCursors.length > 0,
        currentPage,
        goToNextPage,
        goToPreviousPage,
        refresh,
        reset
    }
}
