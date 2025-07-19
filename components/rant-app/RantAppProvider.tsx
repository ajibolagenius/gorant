"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Rant, Comment } from '@/components/enhanced-rant-card'
import { useSettings } from '@/hooks/use-settings'
import { useAnalytics } from '@/hooks/use-analytics'

interface RantAppContextType {
    rants: Rant[]
    comments: { [key: string]: Comment[] }
    loading: boolean
    searchQuery: string
    moodFilter: string
    sortFilter: string
    likedRants: Set<string>
    bookmarkedRants: Set<string>
    setSearchQuery: (query: string) => void
    setMoodFilter: (mood: string) => void
    setSortFilter: (sort: string) => void
    // Add other shared state and actions
}

const RantAppContext = createContext<RantAppContextType | undefined>(undefined)

export function useRantApp() {
    const context = useContext(RantAppContext)
    if (!context) {
        throw new Error('useRantApp must be used within RantAppProvider')
    }
    return context
}

export function RantAppProvider({ children }: { children: React.ReactNode }) {
    // Move shared state logic here
    const [rants, setRants] = useState<Rant[]>([])
    const [loading, setLoading] = useState(true)
    // ... other state

    return (
        <RantAppContext.Provider value={{
            rants,
            loading,
            // ... other values
        }}>
            {children}
        </RantAppContext.Provider>
    )
}
