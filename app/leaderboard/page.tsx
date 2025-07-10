export const metadata = {
    title: "Leaderboard | Rant",
    description: "See who's leading the Rant community. Check out top users, achievements, and more.",
    alternates: {
        canonical: "https://gorant.live/leaderboard"
    }
}

import LeaderboardClient from "./LeaderboardClient"

const LEADERBOARD_CATEGORIES = [
    { label: "Points", value: "points", icon: "Lightning" },
    { label: "Posts", value: "posts", icon: "TrendUp" },
    { label: "Likes Given", value: "likes_given", icon: "Heart" },
    { label: "Achievements", value: "achievements", icon: "Trophy" },
]

const mockLeaderboardData = {
    points: [
        { rank: 1, userId: "anon_champion", points: 2450, level: 25, badge: "👑" },
        { rank: 2, userId: "anon_warrior", points: 2100, level: 21, badge: "🥈" },
        { rank: 3, userId: "anon_hero", points: 1890, level: 19, badge: "🥉" },
        { rank: 4, userId: "anon_legend", points: 1650, level: 17, badge: "🏅" },
        { rank: 5, userId: "anon_master", points: 1420, level: 15, badge: "⭐" },
        { rank: 6, userId: "anon_sage", points: 1200, level: 12, badge: "🌟" },
        { rank: 7, userId: "anon_knight", points: 980, level: 10, badge: "⚔️" },
        { rank: 8, userId: "anon_scout", points: 750, level: 8, badge: "🎯" },
        { rank: 9, userId: "anon_rookie", points: 520, level: 6, badge: "🔰" },
        { rank: 10, userId: "anon_newbie", points: 340, level: 4, badge: "🌱" },
    ],
    posts: [
        { rank: 1, userId: "anon_prolific", value: 156, badge: "📝" },
        { rank: 2, userId: "anon_writer", value: 134, badge: "✍️" },
        { rank: 3, userId: "anon_storyteller", value: 98, badge: "📚" },
        { rank: 4, userId: "anon_blogger", value: 87, badge: "💭" },
        { rank: 5, userId: "anon_poet", value: 76, badge: "🎭" },
    ],
    likes_given: [
        { rank: 1, userId: "anon_supporter", value: 892, badge: "❤️" },
        { rank: 2, userId: "anon_cheerleader", value: 756, badge: "👏" },
        { rank: 3, userId: "anon_encourager", value: 634, badge: "💪" },
        { rank: 4, userId: "anon_uplifter", value: 523, badge: "🌈" },
        { rank: 5, userId: "anon_motivator", value: 445, badge: "🚀" },
    ],
    achievements: [
        { rank: 1, userId: "anon_achiever", value: 24, badge: "🏆" },
        { rank: 2, userId: "anon_collector", value: 19, badge: "🎖️" },
        { rank: 3, userId: "anon_hunter", value: 16, badge: "🎯" },
        { rank: 4, userId: "anon_seeker", value: 13, badge: "🔍" },
        { rank: 5, userId: "anon_explorer", value: 11, badge: "🗺️" },
    ],
}

export default function LeaderboardPage() {
    return <LeaderboardClient leaderboardCategories={LEADERBOARD_CATEGORIES} leaderboardData={mockLeaderboardData} />
}
