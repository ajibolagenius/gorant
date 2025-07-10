import { storageGet, storageSet } from "@/lib/storage"

interface UserPreferences {
    favoriteTopics: string[]
    preferredMoods: string[]
    interactionHistory: {
        likedRants: string[]
        commentedRants: string[]
        bookmarkedRants: string[]
    }
    followedTags: string[]
    blockedUsers: string[]
}

export class PersonalizationService {
    static getRecommendedRants(rants: Rant[], userId: string, followedTags: string[]): Rant[] {
        const preferences = this.getUserPreferences(userId)

        return rants
            .map((rant) => ({
                ...rant,
                relevanceScore: this.calculateRelevanceScore(rant, preferences, followedTags),
            }))
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .map(({ relevanceScore, ...rant }) => rant)
    }

    private static calculateRelevanceScore(rant: Rant, preferences: UserPreferences, followedTags: string[]): number {
        let score = 0

        // Base score from likes (popularity)
        score += Math.log(rant.likes_count + 1) * 0.3

        // Recency bonus
        const hoursOld = (Date.now() - new Date(rant.created_at).getTime()) / (1000 * 60 * 60)
        score += Math.max(0, (24 - hoursOld) / 24) * 0.2

        // Tag matching
        if (rant.tags) {
            const tagMatches = rant.tags.filter((tag) => followedTags.includes(tag)).length
            score += tagMatches * 0.4
        }

        // Mood preference
        if (preferences.preferredMoods.includes(rant.mood)) {
            score += 0.3
        }

        // Sentiment matching (prefer positive content slightly)
        if (rant.sentiment_score && rant.sentiment_score > 0) {
            score += rant.sentiment_score * 0.1
        }

        // Avoid blocked users
        if (preferences.blockedUsers.includes(rant.anonymous_id)) {
            score = -1
        }

        return score
    }

    private static getUserPreferences(userId: string): UserPreferences {
        const saved = storageGet<UserPreferences>(`preferences_${userId}`)
        if (saved) {
            return saved
        }

        return {
            favoriteTopics: [],
            preferredMoods: [],
            interactionHistory: {
                likedRants: [],
                commentedRants: [],
                bookmarkedRants: [],
            },
            followedTags: [],
            blockedUsers: [],
        }
    }

    static updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
        const current = this.getUserPreferences(userId)
        const updated = { ...current, ...preferences }
        storageSet(`preferences_${userId}`, updated)
    }

    static getPersonalizedTags(userId: string, allTags: string[]): string[] {
        const preferences = this.getUserPreferences(userId)

        // Combine followed tags with inferred preferences
        const tagFrequency = new Map<string, number>()

        // Count interactions with tags
        preferences.interactionHistory.likedRants.forEach((rantId) => {
            // In a real app, you'd fetch the rant and count its tags
        })

        return Array.from(tagFrequency.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag]) => tag)
    }

    static shouldShowNotification(userId: string, type: string): boolean {
        const preferences = this.getUserPreferences(userId)
        // Implement notification preferences logic
        return true
    }
}
