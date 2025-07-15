"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Calendar, Users, Target, Medal, Clock, CheckCircle, House, MagnifyingGlass, Funnel, SortAscending } from "@phosphor-icons/react"
import Link from "next/link"
import { useNotifications, notificationHelpers } from "@/hooks/use-notifications"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Challenge {
    id: string;
    title: string;
    description: string;
    emoji: string;
    type?: string;
    participants: number;
    progress?: number;
    daysLeft?: number;
    reward?: string;
    isActive?: boolean;
    userParticipating?: boolean;
    winner?: boolean;
    completedDate?: string;
}

interface BadgeType {
    name: string;
    emoji: string;
    earned: boolean;
}

interface ChallengeClientProps {
    currentChallenges: Challenge[];
    pastChallenges: Challenge[];
    userBadges: BadgeType[];
}

export default function ChallengeClient({ currentChallenges, pastChallenges, userBadges }: ChallengeClientProps) {
    const [activeTab, setActiveTab] = useState<"current" | "past" | "badges">("current")
    const { addNotification } = useNotifications()
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [showFilters, setShowFilters] = useState(false);
    const [challengeTypeFilter, setChallengeTypeFilter] = useState("all");

    const joinChallenge = (challengeId: string) => {
        console.log("Joining challenge:", challengeId)
        // Handle challenge joining logic
    }

    const formatDaysLeft = (days?: number) => {
        if (days === undefined) return "";
        if (days === 0) return "Ended"
        if (days === 1) return "1 day left"
        return `${days} days left`
    }

    const handleChallengeComplete = (challengeId: string, title: string) => {
        // Trigger achievement notification for completing a challenge
        addNotification(notificationHelpers.achievement(challengeId, `Challenge Complete: ${title}`))

        // Trigger new challenge notification
        setTimeout(() => {
            addNotification(notificationHelpers.challenge("new-challenge", "New Daily Challenge Available"))
        }, 2000)
    }

    // Filter and sort challenges
    const filteredCurrentChallenges = currentChallenges.filter((challenge) => {
        if (challengeTypeFilter !== "all" && challenge.type !== challengeTypeFilter) return false;
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            challenge.title.toLowerCase().includes(query) ||
            challenge.description.toLowerCase().includes(query) ||
            (challenge.type && challenge.type.toLowerCase().includes(query))
        );
    }).sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return b.participants - a.participants;
            case "oldest":
                return a.participants - b.participants;
            case "most_participants":
                return b.participants - a.participants;
            case "progress":
                return (b.progress || 0) - (a.progress || 0);
            default:
                return 0;
        }
    });

    return (
        <main role="main" className="min-h-screen bg-background dark:bg-background">
            {/* Enhanced Header */}
            <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto mt-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-0 sm:mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-none bg-yellow-100 dark:bg-yellow-900/30 p-3">
                            <Trophy weight="duotone" className="w-7 h-7 text-yellow-600 dark:text-yellow-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold font-heading text-gray-800 dark:text-white flex items-center gap-2">
                                Rant Challenges
                                <span className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200 text-xs font-semibold px-2 py-0.5 rounded-none ml-2">
                                    {currentChallenges.length}
                                </span>
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Join themed challenges and earn badges for your participation.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8 max-w-6xl mb-safe-bottom wrap-screen overflow-x-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-wrap">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Search and Filters */}
                        <Card className="shadow-sm border-0 rounded-none bg-white/80 dark:bg-gray-800/80 backdrop-blur mb-6">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 w-4 h-4" />
                                        <Input
                                            placeholder="Search challenges by title, description, or type..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {/* Filter Controls */}
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="flex items-center gap-2 rounded-none"
                                        >
                                            <Funnel className="w-4 h-4" />
                                            Filters
                                            {challengeTypeFilter !== "all" && (
                                                <Badge variant="secondary" className="ml-1 rounded-none">1</Badge>
                                            )}
                                        </Button>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="w-48 rounded-none">
                                                <SortAscending className="w-4 h-4 mr-2" />
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="newest">Most Participants</SelectItem>
                                                <SelectItem value="oldest">Least Participants</SelectItem>
                                                <SelectItem value="progress">By Progress</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {showFilters && (
                                            <div className="flex items-center gap-4 ml-4">
                                                <Select value={challengeTypeFilter} onValueChange={setChallengeTypeFilter}>
                                                    <SelectTrigger className="w-32 rounded-none">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Types</SelectItem>
                                                        <SelectItem value="daily">Daily</SelectItem>
                                                        <SelectItem value="weekly">Weekly</SelectItem>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Tab Navigation */}
                        <Card className="shadow-sm border-0 rounded-none bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardContent className="pt-2 sm:pt-6">
                                <div className="flex flex-wrap w-full gap-1 bg-gray-100 dark:bg-gray-700 rounded-none p-1">
                                    <Button
                                        variant={activeTab === "current" ? "default" : "ghost"}
                                        onClick={() => setActiveTab("current")}
                                        className={`flex-1 min-w-[120px] ${activeTab === "current"
                                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                            : "hover:bg-yellow-50 dark:hover:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"
                                            }`}
                                    >
                                        <Target weight="duotone" className="w-4 h-4 mr-2" />
                                        Current
                                    </Button>
                                    <Button
                                        variant={activeTab === "past" ? "default" : "ghost"}
                                        onClick={() => setActiveTab("past")}
                                        className={`flex-1 min-w-[120px] ${activeTab === "past"
                                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                            : "hover:bg-yellow-50 dark:hover:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"
                                            }`}
                                    >
                                        <Calendar weight="duotone" className="w-4 h-4 mr-2" />
                                        Past
                                    </Button>
                                    <Button
                                        variant={activeTab === "badges" ? "default" : "ghost"}
                                        onClick={() => setActiveTab("badges")}
                                        className={`flex-1 min-w-[120px] ${activeTab === "badges"
                                            ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                            : "hover:bg-yellow-50 dark:hover:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"
                                            }`}
                                    >
                                        <Medal weight="duotone" className="w-4 h-4 mr-2" />
                                        Badges
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Current Challenges */}
                        {activeTab === "current" && (
                            <div className="space-y-4">
                                {filteredCurrentChallenges.map((challenge) => (
                                    <Card
                                        key={challenge.id}
                                        className={`shadow-sm border-0 rounded-none backdrop-blur ${challenge.isActive ? "bg-white/80 dark:bg-gray-800/80" : "bg-gray-100/80 dark:bg-gray-700/80"
                                            }`}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-3xl">{challenge.emoji}</div>
                                                    <div>
                                                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{challenge.title}</h2>
                                                        <p className="text-gray-600 dark:text-gray-300 mt-1">{challenge.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    <Badge
                                                        variant={challenge.type === "daily" ? "default" : "secondary"}
                                                        className={
                                                            challenge.type === "daily"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : challenge.type === "weekly"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-purple-100 text-purple-800"
                                                        }
                                                    >
                                                        {challenge.type}
                                                    </Badge>
                                                    {challenge.userParticipating && (
                                                        <Badge className="bg-yellow-100 text-yellow-800">
                                                            <CheckCircle weight="duotone" className="w-3 h-3 mr-1" />
                                                            Joined
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center space-x-4">
                                                        <span className="flex items-center text-gray-600 dark:text-gray-300">
                                                            <Users weight="duotone" className="w-4 h-4 mr-1" />
                                                            {challenge.participants} participants
                                                        </span>
                                                        <span className="flex items-center text-gray-600 dark:text-gray-300">
                                                            <Clock weight="duotone" className="w-4 h-4 mr-1" />
                                                            {formatDaysLeft(challenge.daysLeft)}
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-600 dark:text-gray-300">Reward: {challenge.reward}</span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600 dark:text-gray-300">Progress</span>
                                                        <span className="text-gray-600 dark:text-gray-300">{challenge.progress}%</span>
                                                    </div>
                                                    <Progress value={challenge.progress} className="h-2" aria-label={`Progress for ${challenge.title}`} />
                                                </div>

                                                <div className="flex justify-end">
                                                    {challenge.userParticipating ? (
                                                        <Button variant="outline" disabled>
                                                            <CheckCircle weight="duotone" className="w-4 h-4 mr-2" />
                                                            Participating
                                                        </Button>
                                                    ) : challenge.isActive ? (
                                                        <Button
                                                            onClick={() => joinChallenge(challenge.id)}
                                                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                                        >
                                                            Join Challenge
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" disabled>
                                                            Challenge Ended
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Past Challenges */}
                        {activeTab === "past" && (
                            <div className="space-y-4">
                                {pastChallenges.map((challenge) => (
                                    <Card
                                        key={challenge.id}
                                        className="shadow-sm border-0 rounded-none bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur"
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-3xl opacity-60">{challenge.emoji}</div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                                                            {challenge.title}
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400 mt-1">{challenge.description}</p>
                                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center">
                                                                <Users weight="duotone" className="w-4 h-4 mr-1" />
                                                                {challenge.participants} participants
                                                            </span>
                                                            <span>Completed {challenge.completedDate}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end space-y-2">
                                                    {challenge.winner && (
                                                        <Badge className="bg-yellow-100 text-yellow-800">
                                                            <Trophy weight="duotone" className="w-3 h-3 mr-1" />
                                                            Winner
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="opacity-60">
                                                        Completed
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Badges */}
                        {activeTab === "badges" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userBadges.map((badge, index) => (
                                    <Card
                                        key={index}
                                        className={`shadow-sm border-0 rounded-none backdrop-blur ${badge.earned
                                            ? "bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                                            : "bg-gray-100/80 dark:bg-gray-700/80"
                                            }`}
                                    >
                                        <CardContent className="pt-6 text-center">
                                            <div className={`text-4xl mb-3 ${badge.earned ? "" : "opacity-30"}`}>{badge.emoji}</div>
                                            <h3
                                                className={`font-semibold ${badge.earned ? "text-yellow-800 dark:text-yellow-200" : "text-gray-500 dark:text-gray-400"
                                                    }`}
                                            >
                                                {badge.name}
                                            </h3>
                                            {badge.earned ? (
                                                <Badge className="bg-yellow-100 text-yellow-800 mt-2">
                                                    <CheckCircle weight="duotone" className="w-3 h-3 mr-1" />
                                                    Earned
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="opacity-60 mt-2">
                                                    Not Earned
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* User Stats */}
                        <Card className="shadow-sm border-0 rounded-none bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Your Stats</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Challenges Joined</span>
                                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">5</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Badges Earned</span>
                                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">3</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-300">Current Streak</span>
                                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">7 days</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leaderboard */}
                        <Card className="shadow-sm border-0 rounded-none bg-white/60 dark:bg-gray-800/60 backdrop-blur">
                            <CardHeader>
                                <h3 className="font-semibold text-gray-800 dark:text-white">Top Participants</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Badge className="bg-yellow-100 text-yellow-800">1</Badge>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">anon_champion</span>
                                    </div>
                                    <span className="text-sm font-semibold text-yellow-600">12 badges</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Badge className="bg-gray-100 text-gray-800">2</Badge>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">anon_warrior</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-600">9 badges</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Badge className="bg-orange-100 text-orange-800">3</Badge>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">anon_hero</span>
                                    </div>
                                    <span className="text-sm font-semibold text-orange-600">7 badges</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next Challenge Preview */}
                        <Card className="shadow-sm border-0 rounded-none bg-orange-100 dark:bg-orange-900/30">
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <Calendar weight="duotone" className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    <h3 className="font-semibold text-gray-800 dark:text-white">Coming Soon</h3>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl mb-2">🌟</div>
                                    <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Dream Big Challenge</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                        Share your biggest dreams and aspirations
                                    </p>
                                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                                        Starts in 3 days
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
