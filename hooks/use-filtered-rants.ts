import { useMemo } from "react"
import type { Rant } from "@/components/enhanced-rant-card"

interface UseFilteredRantsParams {
    rants: Rant[]
    searchQuery: string
    moodFilter: string
    sortFilter: string
    blockedUsers: Set<string>
    followedTags: Set<string>
    contentFilterSettings: {
        hideNegativeSentiment: boolean
        hideReportedContent: boolean
        minimumModerationScore: number
    }
    settingsLoaded: boolean
    getAnonymousId: () => string
    personalizationService?: any // Optional, for recommended sorting
}

/**
 * Returns filtered and sorted rants based on search, mood, blocked users, and content moderation settings.
 */
export function useFilteredRants({
    rants,
    searchQuery,
    moodFilter,
    sortFilter,
    blockedUsers,
    followedTags,
    contentFilterSettings,
    settingsLoaded,
    getAnonymousId,
    personalizationService,
}: UseFilteredRantsParams): Rant[] {
    return useMemo(() => {
        if (!settingsLoaded) return rants
        let filtered = rants.filter((rant) => {
            const matchesSearch =
                searchQuery.length < 3 ||
                rant.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (rant.tags && rant.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
            const matchesMood = !moodFilter || rant.mood === moodFilter
            const notBlocked = !blockedUsers.has(rant.anonymous_id)
            const moderationPassed = rant.moderation_status === "approved"
            // Content filter logic
            const sentimentOk =
                !contentFilterSettings.hideNegativeSentiment ||
                (rant.sentiment_score === undefined || rant.sentiment_score >= 0)
            const reportedOk =
                !contentFilterSettings.hideReportedContent ||
                !rant.reported
            const moderationScoreOk =
                rant.moderation_score === undefined ||
                rant.moderation_score >= contentFilterSettings.minimumModerationScore
            return (
                matchesSearch &&
                matchesMood &&
                notBlocked &&
                moderationPassed &&
                sentimentOk &&
                reportedOk &&
                moderationScoreOk
            )
        })
        // Apply sorting with personalization
        if (sortFilter === "recommended" && personalizationService) {
            filtered = personalizationService.getRecommendedRants(filtered, getAnonymousId(), Array.from(followedTags))
        } else if (sortFilter === "popular" || sortFilter === "most_liked") {
            filtered = [...filtered].sort((a, b) => b.likes_count - a.likes_count)
        } else {
            filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }
        return filtered
    }, [rants, searchQuery, moodFilter, sortFilter, blockedUsers, followedTags, contentFilterSettings, settingsLoaded, getAnonymousId, personalizationService])
}
