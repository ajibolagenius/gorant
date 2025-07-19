import { useMemo } from 'react'

interface ContentPerformanceData {
    contentType: string
    actionType: string
    actionCount: number
    uniqueSessions: number
}

interface MoodEngagementData {
    mood: string
    likes: number
    comments: number
    bookmarks: number
    posts: number
}

interface ActionDistribution {
    name: string
    value: number
}

interface MoodInsights {
    topMood: string
    topMoodPercentage: string
    totalEngagement: number
    mostEngagedAction: string
}

interface ProcessedData {
    moodEngagementArray: MoodEngagementData[]
    actionDistribution: ActionDistribution[]
    moodInsights: MoodInsights | null
}

export function useContentPerformanceData(data: ContentPerformanceData[]): ProcessedData {
    return useMemo(() => {
        if (!data || data.length === 0) {
            return {
                moodEngagementArray: [],
                actionDistribution: [],
                moodInsights: null
            }
        }

        // Process mood engagement data
        const moodEngagementData = data.reduce((acc, item) => {
            const mood = item.contentType || 'unknown'
            if (!acc[mood]) {
                acc[mood] = { mood, likes: 0, comments: 0, bookmarks: 0, posts: 0 }
            }

            switch (item.actionType) {
                case 'like':
                    acc[mood].likes += item.actionCount
                    break
                case 'comment':
                    acc[mood].comments += item.actionCount
                    break
                case 'bookmark':
                    acc[mood].bookmarks += item.actionCount
                    break
                case 'post':
                    acc[mood].posts += item.actionCount
                    break
            }

            return acc
        }, {} as Record<string, MoodEngagementData>)

        const moodEngagementArray = Object.values(moodEngagementData)

        // Process action distribution
        const actionDistribution = data.reduce((acc, item) => {
            const action = item.actionType
            const existing = acc.find(a => a.name === action)
            if (existing) {
                existing.value += item.actionCount
            } else {
                acc.push({ name: action, value: item.actionCount })
            }
            return acc
        }, [] as ActionDistribution[])

        // Calculate insights
        let moodInsights: MoodInsights | null = null
        if (moodEngagementArray.length > 0) {
            const totalEngagement = moodEngagementArray.reduce((sum, mood) =>
                sum + mood.likes + mood.comments + mood.bookmarks + mood.posts, 0
            )

            const topMood = moodEngagementArray.reduce((prev, current) => {
                const prevTotal = prev.likes + prev.comments + prev.bookmarks + prev.posts
                const currentTotal = current.likes + current.comments + current.bookmarks + current.posts
                return currentTotal > prevTotal ? current : prev
            })

            const topMoodTotal = topMood.likes + topMood.comments + topMood.bookmarks + topMood.posts
            const topMoodPercentage = totalEngagement > 0 ? ((topMoodTotal / totalEngagement) * 100).toFixed(1) : '0'

            const actionEntries: Array<[string, number]> = [
                ['likes', topMood.likes],
                ['comments', topMood.comments],
                ['bookmarks', topMood.bookmarks],
                ['posts', topMood.posts]
            ]
            const mostEngagedAction = actionEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0]

            moodInsights = {
                topMood: topMood.mood,
                topMoodPercentage,
                totalEngagement,
                mostEngagedAction
            }
        }

        return {
            moodEngagementArray,
            actionDistribution,
            moodInsights
        }
    }, [data])
}
