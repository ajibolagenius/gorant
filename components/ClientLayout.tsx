"use client"
import { useAccessibility } from "@/hooks/use-accessibility"
import React, { useEffect } from "react"
import { useGameification } from "@/hooks/use-gamification"
import { useTheme } from "@/hooks/use-theme"
import { usePathname } from "next/navigation"
import Header from "./Header"
import Link from "next/link"
import { TrendUp, Trophy, Lightning, Star, House, Bell } from "phosphor-react"
import { useNotifications } from "@/hooks/use-notifications"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { fontSize, screenReaderMode } = useAccessibility()
    const { userLevel } = useGameification()
    const { theme, toggleTheme } = useTheme()
    const pathname = usePathname()
    const showFooter = !pathname.startsWith("/settings")
    const { unreadCount } = useNotifications()

    // Lenis smooth scrolling integration
    useEffect(() => {
        // Only run on client
        if (typeof window === "undefined") return
        // Respect reduced motion
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (prefersReducedMotion) return
        let lenis: any
        import('lenis').then(({ default: Lenis }) => {
            lenis = new Lenis({
                duration: 1.2,
                smooth: true,
                direction: 'vertical',
                gestureOrientation: 'vertical',
                smoothTouch: false,
                touchMultiplier: 1.5,
            })
            function raf(time: number) {
                lenis.raf(time)
                requestAnimationFrame(raf)
            }
            requestAnimationFrame(raf)
        })
        return () => {
            if (lenis && lenis.destroy) lenis.destroy()
        }
    }, [])

    // Apply font size globally to <body>
    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.body.classList.remove("text-sm", "text-base", "text-lg", "text-xl");
        document.body.classList.add(fontSize);
    }, [fontSize]);

    return (
        <div
            className={screenReaderMode ? 'screen-reader' : ''}
            aria-live={screenReaderMode ? "polite" : undefined}
        >
            <Header userLevel={userLevel} theme={theme} toggleTheme={toggleTheme} pathname={pathname} />
            {children}
            {/* Desktop Footer */}
            {showFooter && (
                <footer className="fixed bottom-0 left-0 w-full z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t border-gray-200 dark:border-gray-700 mt-12 md:block hidden">
                    <div className="container mx-auto px-4 py-4 max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-500 dark:text-gray-400 text-sm items-center">
                            {/* Column 1: Branding */}
                            <div className="text-center md:text-left">
                                <p>Your thoughts matter. Share them freely.</p>
                            </div>
                            {/* Column 2: Navigation Links */}
                            <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6">
                                <Link href="/privacy" className="hover:text-purple-600 dark:hover:text-purple-400">Privacy</Link>
                                <Link href="/terms-of-service" className="hover:text-purple-600 dark:hover:text-purple-400">Terms</Link>
                                <Link href="/guidelines" className="hover:text-purple-600 dark:hover:text-purple-400">Community Guidelines</Link>
                                <a href="https://stats.uptimerobot.com/MfSyiPnv5E/800934564" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 dark:hover:text-purple-400 text-green-600 flex items-center">
                                    <span className="relative flex h-3 w-3 mr-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                                    </span>
                                    Uptime status
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
            {/* Bottom Navigation Bar for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 md:hidden backdrop-blur shadow-lg">
                <Link href="/" aria-label="Feed" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                    <House weight="duotone" className="w-6 h-6" />
                </Link>
                <Link href="/trending" aria-label="Trending" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/trending" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                    <TrendUp weight="duotone" className="w-6 h-6" />
                </Link>
                <Link href="/challenges" aria-label="Challenges" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/challenges" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                    <Trophy weight="duotone" className="w-6 h-6" />
                </Link>
                <Link href="/leaderboard" aria-label="Leaderboard" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/leaderboard" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                    <Lightning weight="duotone" className="w-6 h-6" />
                </Link>
                <Link href="/bookmarks" aria-label="Bookmarks" className={`flex flex-col items-center justify-center flex-1 h-full ${pathname === "/bookmarks" ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-300"}`}>
                    <Star weight="duotone" className="w-6 h-6" />
                </Link>
            </nav>
        </div>
    )
}
