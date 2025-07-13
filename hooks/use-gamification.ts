"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { storageGet, storageSet } from "@/lib/storage"
import { audioService } from "@/services/audio-service"

interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    unlocked: boolean
    unlockedAt?: Date
}

interface UserStats {
    postsCreated: number
    likesGiven: number
    likesReceived: number
    commentsPosted: number
    challengesCompleted: number
    streakDays: number
}

export function useGameification() {
    const [userPoints, setUserPoints] = useState(0)
    const [userLevel, setUserLevel] = useState(1)
    const [userStats, setUserStats] = useState<UserStats>({
        postsCreated: 0,
        likesGiven: 0,
        likesReceived: 0,
        commentsPosted: 0,
        challengesCompleted: 0,
        streakDays: 0,
    })
    const [achievements, setAchievements] = useState<Achievement[]>([
        {
            id: "first_post",
            name: "First Steps",
            description: "Post your first rant",
            icon: "🎯",
            unlocked: false,
        },
        {
            id: "social_butterfly",
            name: "Social Butterfly",
            description: "Give 10 likes to other rants",
            icon: "🦋",
            unlocked: false,
        },
        {
            id: "popular_voice",
            name: "Popular Voice",
            description: "Receive 50 likes on your rants",
            icon: "⭐",
            unlocked: false,
        },
        {
            id: "conversation_starter",
            name: "Conversation Starter",
            description: "Post 25 comments",
            icon: "💬",
            unlocked: false,
        },
        {
            id: "challenge_champion",
            name: "Challenge Champion",
            description: "Complete 5 challenges",
            icon: "🏆",
            unlocked: false,
        },
        {
            id: "streak_master",
            name: "Streak Master",
            description: "Maintain a 7-day posting streak",
            icon: "🔥",
            unlocked: false,
        },
    ])

    // Load user data from localStorage
    useEffect(() => {
        const savedPoints = storageGet<number>("user_points")
        const savedLevel = storageGet<number>("user_level")
        const savedStats = storageGet<UserStats>("user_stats")
        const savedAchievements = storageGet<Achievement[]>("user_achievements")

        if (typeof savedPoints === "number") setUserPoints(savedPoints)
        if (typeof savedLevel === "number") setUserLevel(savedLevel)
        if (savedStats) setUserStats(savedStats)
        if (savedAchievements) setAchievements(savedAchievements)
    }, [])

    // Save user data to localStorage
    useEffect(() => {
        storageSet("user_points", userPoints)
        storageSet("user_level", userLevel)
        storageSet("user_stats", userStats)
        storageSet("user_achievements", achievements)
    }, [userPoints, userLevel, userStats, achievements])

    // Calculate level based on points
    useEffect(() => {
        const newLevel = Math.floor(userPoints / 100) + 1
        if (newLevel > userLevel) {
            setUserLevel(newLevel)
            toast.success(`🎉 Level up! You're now level ${newLevel}!`)
        }
    }, [userPoints, userLevel])

    const addPoints = (points: number, action: string) => {
        setUserPoints((prev) => prev + points)

        // Update stats based on action
        setUserStats((prev) => {
            const newStats = { ...prev }
            switch (action) {
                case "post":
                    newStats.postsCreated += 1
                    break
                case "like":
                    newStats.likesGiven += 1
                    break
                case "comment":
                    newStats.commentsPosted += 1
                    break
                case "challenge":
                    newStats.challengesCompleted += 1
                    break
            }
            return newStats
        })
    }

    const checkAchievements = async (type: string, value: number) => {
        let newAchievements: Achievement[] = []
        let hasNewAchievement = false
        let unlockedAchievement: Achievement | null = null

        setAchievements((prev) => {
            const updated = [...prev]

            updated.forEach((achievement) => {
                if (achievement.unlocked) return

                let shouldUnlock = false
                switch (achievement.id) {
                    case "first_post":
                        shouldUnlock = type === "posts_created" && value >= 1
                        break
                    case "social_butterfly":
                        shouldUnlock = type === "likes_given" && value >= 10
                        break
                    case "popular_voice":
                        shouldUnlock = type === "likes_received" && value >= 50
                        break
                    case "conversation_starter":
                        shouldUnlock = type === "comments_posted" && value >= 25
                        break
                    case "challenge_champion":
                        shouldUnlock = type === "challenges_completed" && value >= 5
                        break
                    case "streak_master":
                        shouldUnlock = type === "streak_days" && value >= 7
                        break
                }

                if (shouldUnlock) {
                    achievement.unlocked = true
                    achievement.unlockedAt = new Date()
                    hasNewAchievement = true
                    unlockedAchievement = achievement
                }
            })

            newAchievements = hasNewAchievement ? updated : prev
            return newAchievements
        })

        // Handle async operations outside of setState
        if (hasNewAchievement && unlockedAchievement) {
            try {
                // Play achievement sound
                await audioService.playActionSound('achievement')
                toast.success(`🏆 Achievement unlocked: ${unlockedAchievement.name}!`)
                addPoints(20, "achievement")
            } catch (error) {
                console.warn('Failed to play achievement sound:', error)
                // Still show the toast even if audio fails
                toast.success(`🏆 Achievement unlocked: ${unlockedAchievement.name}!`)
                addPoints(20, "achievement")
            }
        }
    }

    const getProgressToNextLevel = () => {
        const currentLevelPoints = (userLevel - 1) * 100
        const nextLevelPoints = userLevel * 100
        const progress = ((userPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
        return Math.min(progress, 100)
    }

    return {
        userPoints,
        userLevel,
        userStats,
        achievements,
        addPoints,
        checkAchievements,
        getProgressToNextLevel,
    }
}
