import { useState, useEffect } from "react"
import { storageGet, storageSet } from "@/lib/storage"

export interface NotificationSettings {
    likes: boolean
    comments: boolean
    mentions: boolean
    challenges: boolean
    achievements: boolean
}

export interface PrivacySettings {
    showInLeaderboard: boolean
    allowDirectMessages: boolean
    shareAnalytics: boolean
}

export interface ContentFilterSettings {
    hideNegativeSentiment: boolean
    hideReportedContent: boolean
    minimumModerationScore: number
}

export type FeedLayout = "compact" | "comfortable"
export type FeedSort = "latest" | "trending" | "most_liked"

export function useSettings() {
    const [notifications, setNotifications] = useState<NotificationSettings>({
        likes: true,
        comments: true,
        mentions: false,
        challenges: true,
        achievements: true,
    })
    const [privacy, setPrivacy] = useState<PrivacySettings>({
        showInLeaderboard: true,
        allowDirectMessages: false,
        shareAnalytics: true,
    })
    const [contentFilters, setContentFilters] = useState<ContentFilterSettings>({
        hideNegativeSentiment: false,
        hideReportedContent: true,
        minimumModerationScore: 0.7,
    })
    const [feedLayout, setFeedLayout] = useState<FeedLayout>("comfortable")
    const [defaultSort, setDefaultSort] = useState<FeedSort>("latest")
    const [keyboardShortcuts, setKeyboardShortcuts] = useState<boolean>(true)
    const [loaded, setLoaded] = useState(false)

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedNotifications = storageGet<NotificationSettings>("settings_notifications")
        const savedPrivacy = storageGet<PrivacySettings>("settings_privacy")
        const savedContentFilters = storageGet<ContentFilterSettings>("settings_contentFilters")
        if (savedNotifications) setNotifications(savedNotifications)
        if (savedPrivacy) setPrivacy(savedPrivacy)
        if (savedContentFilters) setContentFilters(savedContentFilters)
        const savedFeedLayout = storageGet<FeedLayout>("settings_feedLayout")
        const savedDefaultSort = storageGet<FeedSort>("settings_defaultSort")
        const savedKeyboardShortcuts = storageGet<boolean>("settings_keyboardShortcuts")
        if (savedFeedLayout) setFeedLayout(savedFeedLayout)
        if (savedDefaultSort) setDefaultSort(savedDefaultSort)
        if (typeof savedKeyboardShortcuts === "boolean") setKeyboardShortcuts(savedKeyboardShortcuts)
        setLoaded(true)
    }, [])

    // Persist settings to localStorage on change
    useEffect(() => {
        if (loaded) storageSet("settings_notifications", notifications)
    }, [notifications, loaded])
    useEffect(() => {
        if (loaded) storageSet("settings_privacy", privacy)
    }, [privacy, loaded])
    useEffect(() => {
        if (loaded) storageSet("settings_contentFilters", contentFilters)
    }, [contentFilters, loaded])
    useEffect(() => {
        if (loaded) storageSet("settings_feedLayout", feedLayout)
    }, [feedLayout, loaded])
    useEffect(() => {
        if (loaded) storageSet("settings_defaultSort", defaultSort)
    }, [defaultSort, loaded])
    useEffect(() => {
        if (loaded) storageSet("settings_keyboardShortcuts", keyboardShortcuts)
    }, [keyboardShortcuts, loaded])

    const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
        setNotifications((prev) => ({ ...prev, [key]: value }))
    }
    const updatePrivacy = (key: keyof PrivacySettings, value: boolean) => {
        setPrivacy((prev) => ({ ...prev, [key]: value }))
    }
    const updateContentFilter = (key: keyof ContentFilterSettings, value: boolean | number) => {
        setContentFilters((prev) => ({ ...prev, [key]: value }))
    }

    return {
        notifications,
        privacy,
        contentFilters,
        setNotifications,
        setPrivacy,
        setContentFilters,
        updateNotification,
        updatePrivacy,
        updateContentFilter,
        loaded,
        feedLayout,
        setFeedLayout,
        defaultSort,
        setDefaultSort,
        keyboardShortcuts,
        setKeyboardShortcuts,
    }
}
