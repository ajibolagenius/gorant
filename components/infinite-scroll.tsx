"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface InfiniteScrollProps {
  children: React.ReactNode
  hasMore: boolean
  loadMore: () => void
  loading: boolean
}

export function InfiniteScroll({ children, hasMore, loadMore, loading }: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadMore, loading])

  return (
    <div>
      {children}
      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-8">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">Loading more rants...</div>
          )}
        </div>
      )}
    </div>
  )
}
