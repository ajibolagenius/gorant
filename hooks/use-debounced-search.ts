import { useState, useEffect, useCallback } from 'react'

export function useDebouncedSearch(
    initialValue: string = '',
    delay: number = 300
) {
    const [searchQuery, setSearchQuery] = useState(initialValue)
    const [debouncedQuery, setDebouncedQuery] = useState(initialValue)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
        }, delay)

        return () => clearTimeout(timer)
    }, [searchQuery, delay])

    const updateSearch = useCallback((query: string) => {
        setSearchQuery(query)
    }, [])

    return {
        searchQuery,
        debouncedQuery,
        updateSearch,
        isSearching: searchQuery !== debouncedQuery
    }
}
