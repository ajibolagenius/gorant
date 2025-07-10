"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Calendar, Users, Target, Award, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

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
  const [activeTab, setActiveTab] = useState<"current" | "past" | "badges">("current")

  const joinChallenge = (challengeId: string) => {
    console.log("Joining challenge:", challengeId)
    // Handle challenge joining logic
  }

  const formatDaysLeft = (days: number) => {
    if (days === 0) return "Ended"
    if (days === 1) return "1 day left"
    return `${days} days left`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
                Rant Challenges
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Join themed challenges and earn badges for your participation
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Feed</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tab Navigation */}
            <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <Button
                    variant={activeTab === "current" ? "default" : "ghost"}
                    onClick={() => setActiveTab("current")}
                    className={`flex-1 ${
                      activeTab === "current"
                        ? "bg-white dark:bg-gray-600 shadow-sm"
                        : "hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Current
                  </Button>
                  <Button
                    variant={activeTab === "past" ? "default" : "ghost"}
                    onClick={() => setActiveTab("past")}
                    className={`flex-1 ${
                      activeTab === "past"
                        ? "bg-white dark:bg-gray-600 shadow-sm"
                        : "hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Past
                  </Button>
                  <Button
                    variant={activeTab === "badges" ? "default" : "ghost"}
                    onClick={() => setActiveTab("badges")}
                    className={`flex-1 ${
                      activeTab === "badges"
                        ? "bg-white dark:bg-gray-600 shadow-sm"
                        : "hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Badges
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Challenges */}
            {activeTab === "current" && (
              <div className="space-y-4">
                {CURRENT_CHALLENGES.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className={`shadow-sm border-0 backdrop-blur ${
                      challenge.isActive ? "bg-white/80 dark:bg-gray-800/80" : "bg-gray-100/80 dark:bg-gray-700/80"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{challenge.emoji}</div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{challenge.title}</h3>
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
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Joined
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center text-gray-600 dark:text-gray-300">
                              <Users className="w-4 h-4 mr-1" />
                              {challenge.participants} participants
                            </span>
                            <span className="flex items-center text-gray-600 dark:text-gray-300">
                              <Clock className="w-4 h-4 mr-1" />
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
                          <Progress value={challenge.progress} className="h-2" />
                        </div>

                        <div className="flex justify-end">
                          {challenge.userParticipating ? (
                            <Button variant="outline" disabled>
                              <CheckCircle className="w-4 h-4 mr-2" />
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
                {PAST_CHALLENGES.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="shadow-sm border-0 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur"
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
                                <Users className="w-4 h-4 mr-1" />
                                {challenge.participants} participants
                              </span>
                              <span>Completed {challenge.completedDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {challenge.winner && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Trophy className="w-3 h-3 mr-1" />
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
                {USER_BADGES.map((badge, index) => (
                  <Card
                    key={index}
                    className={`shadow-sm border-0 backdrop-blur ${
                      badge.earned
                        ? "bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                        : "bg-gray-100/80 dark:bg-gray-700/80"
                    }`}
                  >
                    <CardContent className="pt-6 text-center">
                      <div className={`text-4xl mb-3 ${badge.earned ? "" : "opacity-30"}`}>{badge.emoji}</div>
                      <h3
                        className={`font-semibold ${
                          badge.earned ? "text-yellow-800 dark:text-yellow-200" : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {badge.name}
                      </h3>
                      {badge.earned ? (
                        <Badge className="bg-yellow-100 text-yellow-800 mt-2">
                          <CheckCircle className="w-3 h-3 mr-1" />
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
            <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
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
            <Card className="shadow-sm border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur">
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
            <Card className="shadow-sm border-0 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
    </div>
  )
}
