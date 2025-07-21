import { Metadata } from "next"
import { getPageMetadata } from "@/lib/seo/metadata"

export const generateMetadata = async (): Promise<Metadata> {
    return getPageMetadata('challenge', {
        title: "Rant Challenges",
        description: "Join community challenges, share your story, and earn badges on Rant."
    });
}

import ChallengeClient from "./ChallengeClient"

const CURRENT_CHALLENGES = [
    {
        id: "gratitude_week",
        title: "Gratitude Week Challenge",
        description: "Share something you're grateful for every day this week",
        emoji: "🙏",
        type: "weekly",
        participants: 234,
        progress: 65,
        daysLeft: 3,
        reward: "Gratitude Badge",
        isActive: true,
        userParticipating: true,
    },
    {
        id: "monday_motivation",
        title: "Monday Motivation",
        description: "Share what motivates you to start the week strong",
        emoji: "💪",
        type: "daily",
        participants: 89,
        progress: 100,
        daysLeft: 0,
        reward: "Motivator Badge",
        isActive: false,
        userParticipating: false,
    },
    {
        id: "creative_expression",
        title: "Creative Expression Month",
        description: "Share your creative thoughts, ideas, or artistic rants",
        emoji: "🎨",
        type: "monthly",
        participants: 456,
        progress: 23,
        daysLeft: 18,
        reward: "Artist Badge",
        isActive: true,
        userParticipating: false,
    },
]

const PAST_CHALLENGES = [
    {
        id: "kindness_chain",
        title: "Kindness Chain",
        description: "Share acts of kindness you witnessed or performed",
        emoji: "❤️",
        participants: 567,
        winner: true,
        completedDate: "2024-01-15",
    },
    {
        id: "weekend_vibes",
        title: "Weekend Vibes",
        description: "Share what makes your weekends special",
        emoji: "🌟",
        participants: 234,
        winner: false,
        completedDate: "2024-01-08",
    },
]

const USER_BADGES = [
    { name: "First Rant", emoji: "🎯", earned: true },
    { name: "Week Warrior", emoji: "⚔️", earned: true },
    { name: "Kindness Champion", emoji: "❤️", earned: true },
    { name: "Gratitude Guru", emoji: "🙏", earned: false },
    { name: "Creative Soul", emoji: "🎨", earned: false },
    { name: "Motivator", emoji: "💪", earned: false },
]

export default function ChallengesPage() {
    return <ChallengeClient currentChallenges={CURRENT_CHALLENGES} pastChallenges={PAST_CHALLENGES} userBadges={USER_BADGES} />
}
