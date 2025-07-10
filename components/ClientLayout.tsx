"use client"
import { useAccessibility } from "@/hooks/use-accessibility"
import React from "react"
import { useGameification } from "@/hooks/use-gamification"
import { useTheme } from "@/hooks/use-theme"
import { usePathname } from "next/navigation"
import Header from "./Header"
import Link from "next/link"
import { TrendUp, Trophy, Lightning, Star } from "phosphor-react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { fontSize, screenReaderMode } = useAccessibility()
    const { userLevel } = useGameification()
    const { theme, toggleTheme } = useTheme()
    const pathname = usePathname()
    return (
        <div
            className={fontSize}
            aria-hidden={screenReaderMode ? undefined : false}
            aria-live={screenReaderMode ? "polite" : undefined}
        >
            <Header userLevel={userLevel} theme={theme} toggleTheme={toggleTheme} pathname={pathname} />
            {children}
            {/* Bottom Navigation Bar for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 md:hidden backdrop-blur shadow-lg">
                <Link href="/trending" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/trending" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                    <TrendUp weight="duotone" className="w-6 h-6 mb-1" />
                    <span className="text-xs">Trending</span>
                </Link>
                <Link href="/challenges" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/challenges" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                    <Trophy weight="duotone" className="w-6 h-6 mb-1" />
                    <span className="text-xs">Challenges</span>
                </Link>
                <Link href="/leaderboard" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/leaderboard" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                    <Lightning weight="duotone" className="w-6 h-6 mb-1" />
                    <span className="text-xs">Leaderboard</span>
                </Link>
                <Link href="/bookmarks" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/bookmarks" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                    <Star weight="duotone" className="w-6 h-6 mb-1" />
                    <span className="text-xs">Bookmarks</span>
                </Link>
            </nav>
        </div>
    )
}
