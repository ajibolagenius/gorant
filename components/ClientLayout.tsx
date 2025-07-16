"use client"
import { useAccessibility } from "@/hooks/use-accessibility"
import React, { useEffect } from "react"
import { useGameification } from "@/hooks/use-gamification"
import { useTheme } from "@/hooks/use-theme"
import { usePathname } from "next/navigation"
import Header from "./Header"
import Link from "next/link"
import { TrendUp, Trophy, Lightning, Star, House, Bell, Shield, Users, Rocket, Globe } from "@phosphor-icons/react"
import { FileText } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { trackEvent } from "@/lib/self-analytics"
import { getAnonymousId } from "@/lib/utils"
import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { fontSize, screenReaderMode } = useAccessibility()
    const { userLevel } = useGameification()
    const { theme, toggleTheme } = useTheme()
    const pathname = usePathname()
    const showFooter = !pathname.startsWith("/settings")
    const { unreadCount } = useNotifications()

    // Pageview analytics tracking
    useEffect(() => {
        trackEvent("pageview", {
            page: pathname,
            anonId: getAnonymousId(),
            referrer: typeof document !== "undefined" ? document.referrer : null,
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
            platform: typeof navigator !== "undefined" ? navigator.platform : null,
        })
    }, [pathname])

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
                                <Link href="/privacy" className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400"><Shield weight="duotone" className="w-4 h-4" />Privacy</Link>
                                <Link href="/terms-of-service" className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400"><FileText className="w-4 h-4" />Terms</Link>
                                <Link href="/guidelines" className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400"><Users weight="duotone" className="w-4 h-4" />Guidelines</Link>
                                <Link href="/roadmap" className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400"><Rocket weight="duotone" className="w-4 h-4" />Roadmap</Link>
                                <a href="https://stats.uptimerobot.com/MfSyiPnv5E/800934564" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 text-green-800">
                                    <Globe weight="duotone" className="w-4 h-4" />Status
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
            {/* Hamburger and Drawer for Mobile */}
            <HamburgerDrawer />
        </div>
    )
}

// HamburgerDrawer component for mobile nav and footer links
function HamburgerDrawer() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    // Support modals state
    const [showHotlineModal, setShowHotlineModal] = useState(false)
    const [showSupportModal, setShowSupportModal] = useState(false)
    // Listen for custom event from header
    React.useEffect(() => {
        const handler = () => setOpen(true)
        window.addEventListener("open-mobile-nav", handler)
        return () => window.removeEventListener("open-mobile-nav", handler)
    }, [])
    // Only show Sheet, not FAB
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="w-72 max-w-full p-0 md:hidden rounded-none" style={{ borderRadius: 0 }}>
                <nav className="flex flex-col gap-2 p-6">
                    <span className="text-xs uppercase font-bold text-muted-foreground mb-2 tracking-widest select-none">Navigation</span>
                    <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-none font-medium text-base ${pathname === "/" ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-200"}`}> <House weight="duotone" className="w-5 h-5" />Feed</Link>
                    <Link href="/trending" className={`flex items-center gap-3 px-3 py-2 rounded-none font-medium text-base ${pathname === "/trending" ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-200"}`}> <TrendUp weight="duotone" className="w-5 h-5" />Trending</Link>
                    <Link href="/challenges" className={`flex items-center gap-3 px-3 py-2 rounded-none font-medium text-base ${pathname === "/challenges" ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-200"}`}> <Trophy weight="duotone" className="w-5 h-5" />Challenges</Link>
                    <Link href="/leaderboard" className={`flex items-center gap-3 px-3 py-2 rounded-none font-medium text-base ${pathname === "/leaderboard" ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-200"}`}> <Lightning weight="duotone" className="w-5 h-5" />Leaderboard</Link>
                    <Link href="/bookmarks" className={`flex items-center gap-3 px-3 py-2 rounded-none font-medium text-base ${pathname === "/bookmarks" ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-200"}`}> <Star weight="duotone" className="w-5 h-5" />Bookmarks</Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
                    <span className="text-xs uppercase font-bold text-muted-foreground mb-2 tracking-widest select-none">More</span>
                    <Link href="/privacy" className="flex items-center gap-3 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-none font-medium text-base"><Shield weight="duotone" className="w-5 h-5" />Privacy</Link>
                    <Link href="/terms-of-service" className="flex items-center gap-3 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-none font-medium text-base"><FileText className="w-5 h-5" />Terms</Link>
                    <Link href="/guidelines" className="flex items-center gap-3 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-none font-medium text-base"><Users weight="duotone" className="w-5 h-5" />Guidelines</Link>
                    <Link href="/roadmap" className="flex items-center gap-3 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-none font-medium text-base"><Rocket weight="duotone" className="w-5 h-5" />Roadmap</Link>
                    <a href="https://stats.uptimerobot.com/MfSyiPnv5E/800934564" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-purple-600 dark:hover:text-purple-400 text-green-800 px-3 py-2 rounded-none font-medium text-base">
                        <Globe weight="duotone" className="w-5 h-5" />Status
                    </a>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
                    <span className="text-xs uppercase font-bold text-muted-foreground mb-2 tracking-widest select-none">Need Support?</span>
                    <div className="bg-card/60 dark:bg-card/60 p-4 rounded-none shadow-sm border-0 mb-2">
                        <p className="text-sm text-muted-foreground mb-3">Remember, you're not alone. Help is always available.</p>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="w-full rounded-none" onClick={() => setShowHotlineModal(true)}>
                                Crisis Helplines
                            </Button>
                            <Button variant="outline" className="w-full rounded-none" onClick={() => setShowSupportModal(true)}>
                                Support Groups
                            </Button>
                        </div>
                    </div>
                </nav>
                {/* Crisis Helplines Modal */}
                <Dialog open={showHotlineModal} onOpenChange={setShowHotlineModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                                Nigerian Crisis Helplines
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <p className="text-gray-700 dark:text-gray-200">
                                If you or someone you know is in crisis, please reach out immediately to these Nigerian helplines:
                            </p>
                            <ul className="text-sm text-gray-800 dark:text-gray-100 space-y-1">
                                <li><strong>Suicide Prevention Initiative in Nigeria (SUPRIN):</strong> <a href="tel:09080217555" className="text-purple-700 underline">0908 021 7555</a></li>
                                <li><strong>Mentally Aware Nigeria Initiative (MANI):</strong> <a href="tel:08091116264" className="text-purple-700 underline">0809 111 6264</a></li>
                                <li><strong>She Writes Woman (Mental Health Helpline):</strong> <a href="tel:08008002000" className="text-purple-700 underline">0800 800 2000</a></li>
                                <li><strong>Lagos State Helpline:</strong> <a href="tel:08058820777" className="text-purple-700 underline">0805 882 0777</a></li>
                                <li><strong>National Emergency Hotline:</strong> <a href="tel:112" className="text-purple-700 underline">112</a></li>
                            </ul>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Your feelings matter. Help is available 24/7. All calls are confidential.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Support Groups Modal */}
                <Dialog open={showSupportModal} onOpenChange={setShowSupportModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                                <Users className="w-5 h-5 text-purple-700" /> Nigerian Support Groups
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <p className="text-gray-700 dark:text-gray-200">
                                Connect with mental health support groups and communities in Nigeria:
                            </p>
                            <ul className="text-sm text-gray-800 dark:text-gray-100 space-y-1">
                                <li><a href="https://mentallyaware.org/join-a-support-group/" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline">Mentally Aware Nigeria Initiative (MANI) Support Groups</a></li>
                                <li><a href="https://shewriteswoman.org/helpline/" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline">She Writes Woman Peer Support</a></li>
                                <li><a href="https://www.surpinng.org/" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline">SUPRIN Community</a></li>
                                <li><a href="https://www.facebook.com/groups/mentalhealthnigeria/" target="_blank" rel="noopener noreferrer" className="text-purple-700 underline">Mental Health Nigeria (Facebook Group)</a></li>
                            </ul>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                These groups offer peer support, resources, and a safe space to share your journey.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            </SheetContent>
        </Sheet>
    )
}
