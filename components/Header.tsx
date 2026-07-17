"use client"
import { Star, TrendUp, Trophy, Lightning, Moon, Sun, Bell, Shield, House, Gear, List, UsersThree } from "@phosphor-icons/react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogoIcon } from "@/components/ui/logo-icon"
import React from "react"
import { useNotifications } from "@/hooks/use-notifications"

interface HeaderProps {
    userLevel: number
    theme: string
    toggleTheme: () => void
    pathname: string
}

export default function Header({ userLevel, theme, toggleTheme, pathname }: HeaderProps) {
    const { unreadCount } = useNotifications();
    // Hamburger state is now managed in ClientLayout, so trigger via custom event
    const openMobileNav = () => {
        const event = new CustomEvent("open-mobile-nav")
        window.dispatchEvent(event)
    }
    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-4 max-w-7xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Hamburger for mobile */}
                        <button
                            className="md:hidden mr-2 p-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-none bg-transparent"
                            style={{ borderRadius: 0 }}
                            onClick={openMobileNav}
                            aria-label="Open Navigation Menu"
                        >
                            <List weight="duotone" className="w-6 h-6" />
                        </button>
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="inline-flex items-center">
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Rant</h1> <LogoIcon className="w-7 h-7 text-purple-600 dark:text-purple-300 group-hover:text-purple-800 dark:group-hover:text-purple-400 transition-colors" weight="duotone" />
                            </span>
                        </Link>
                        {userLevel > 1 && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                <Star weight="duotone" className="w-3 h-3 mr-1" />
                                Level {userLevel}
                            </Badge>
                        )}
                    </div>

                    <nav className="hidden md:flex items-center space-x-6">
                        <Link
                            href="/"
                            className={`flex items-center space-x-1 ${pathname === "/" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"} hover:text-purple-600 dark:hover:text-purple-400`}
                        >
                            <House weight="duotone" className="w-4 h-4" />
                            <span>Feed</span>
                        </Link>
                        <Link
                            href="/following"
                            className={`flex items-center space-x-1 ${pathname === "/following" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"} hover:text-purple-600 dark:hover:text-purple-400`}
                        >
                            <UsersThree weight="duotone" className="w-4 h-4" />
                            <span>Following</span>
                        </Link>
                        <Link
                            href="/trending"
                            className={`flex items-center space-x-1 ${pathname === "/trending" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"} hover:text-purple-600 dark:hover:text-purple-400`}
                        >
                            <TrendUp weight="duotone" className="w-4 h-4" />
                            <span>Trending</span>
                        </Link>
                        <Link
                            href="/challenges"
                            className={`flex items-center space-x-1 ${pathname === "/challenges" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"} hover:text-purple-600 dark:hover:text-purple-400`}
                        >
                            <Trophy weight="duotone" className="w-4 h-4" />
                            <span>Challenges</span>
                        </Link>
                        <Link
                            href="/leaderboard"
                            className={`flex items-center space-x-1 ${pathname === "/leaderboard" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"} hover:text-purple-600 dark:hover:text-purple-400`}
                        >
                            <Lightning weight="duotone" className="w-4 h-4" />
                            <span>Leaderboard</span>
                        </Link>
                        <Link
                            href="/bookmarks"
                            className={`flex items-center space-x-1 ${pathname === "/bookmarks" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"} hover:text-purple-600 dark:hover:text-purple-400`}
                        >
                            <Star weight="duotone" className="w-4 h-4" />
                            <span>Bookmarks</span>
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? <Sun weight="duotone" className="w-4 h-4" /> : <Moon weight="duotone" className="w-4 h-4" />}
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                        <Link href="/notifications">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="relative text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label="Notifications"
                            >
                                <Bell weight="duotone" className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-gray-900">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                                <span className="sr-only">Notifications</span>
                            </Button>
                        </Link>
                        <Link href="/settings">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label="Settings"
                            >
                                <Gear weight="duotone" className="w-4 h-4" />
                                <span className="sr-only">Settings</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
