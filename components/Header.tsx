"use client"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, TrendUp, Trophy, Lightning, Moon, Sun, Bell, Shield, House, TrendUp as TrendUpIcon, Trophy as TrophyIcon, Lightning as LightningIcon, BookmarkSimple, Gear, Target } from "phosphor-react"
import React from "react"
import { useNotifications } from "@/hooks/use-notifications"

interface HeaderProps {
    userLevel: number
    theme: string
    toggleTheme: () => void
    pathname: string
}

export default function Header({ userLevel, theme, toggleTheme, pathname }: HeaderProps) {
    const { unreadCount } = useNotifications()

    return (
        <header className="sticky top-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur border-b border-border dark:border-border">
            <div className="container mx-auto px-4 py-4 max-w-7xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/">
                            <h1 className="text-2xl font-bold text-foreground dark:text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                Rant 💭
                            </h1>
                        </Link>
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link
                                href="/"
                                className={`flex items-center gap-2 px-3 py-2 rounded-none text-sm font-medium transition-colors ${pathname === "/"
                                        ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <House className="w-4 h-4" />
                                Feed
                            </Link>
                            <Link
                                href="/trending"
                                className={`flex items-center gap-2 px-3 py-2 rounded-none text-sm font-medium transition-colors ${pathname === "/trending"
                                        ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <TrendUp className="w-4 h-4" />
                                Trending
                            </Link>
                            <Link
                                href="/challenges"
                                className={`flex items-center gap-2 px-3 py-2 rounded-none text-sm font-medium transition-colors ${pathname === "/challenges"
                                        ? "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Target className="w-4 h-4" />
                                Challenges
                            </Link>
                            <Link
                                href="/leaderboard"
                                className={`flex items-center gap-2 px-3 py-2 rounded-none text-sm font-medium transition-colors ${pathname === "/leaderboard"
                                        ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Trophy className="w-4 h-4" />
                                Leaderboard
                            </Link>
                            <Link
                                href="/bookmarks"
                                className={`flex items-center gap-2 px-3 py-2 rounded-none text-sm font-medium transition-colors ${pathname === "/bookmarks"
                                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <BookmarkSimple className="w-4 h-4" />
                                Bookmarks
                            </Link>
                        </nav>
                        {/* <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        >
                            Anonymous
                        </Badge> */}
                        {userLevel > 1 && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                <Star weight="duotone" className="w-3 h-3 mr-1" />
                                Level {userLevel}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </Button>
                        <Link href="/notifications">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground relative">
                                <Bell className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>
                                )}
                            </Button>
                        </Link>
                        <Link href="/settings">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                <Gear className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
