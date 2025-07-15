"use client"

import React, { useEffect, useRef, useState } from "react"
import {
    CheckCircle, Clock, XCircle, User, Bell, Shield, Flag, Users, Star, Heart, Lightning, Trophy, BookOpen, ListChecks, Rocket, Globe, ChatCircleDots, UserCircle, ChartBar, Gear, Bug, Eye, Pencil, PlusCircle, ArrowRight, ArrowDown, ArrowUp
} from "@phosphor-icons/react"
import { Loader, MessageCircle, Dot, User as LucideUser, Search, List as LucideList, Shield as LucideShield, BarChart, Settings as LucideSettings, Users as LucideUsers, Book as LucideBook, Star as LucideStar, Heart as LucideHeart, Bell as LucideBell, Globe as LucideGlobe, Rocket as LucideRocket, Bug as LucideBug, Eye as LucideEye, Pencil as LucidePencil, Plus as LucidePlus, ArrowRight as LucideArrowRight, ArrowDown as LucideArrowDown, ArrowUp as LucideArrowUp, Check, X, ChevronRight, View, File, Pen, LayoutDashboard, PanelLeft, Calendar, Heading, Clipboard, Moon, Sun, Trash, LogOut, Home, Menu, ChevronDown, ChevronLeft, ChevronUp, Send, SeparatorHorizontal, Link, Copy, ExternalLink, ArrowLeft, ArrowLeftCircle, ArrowRightCircle, ArrowUpCircle as LucideArrowUpCircle, ArrowDownCircle as LucideArrowDownCircle } from "lucide-react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { Badge } from "@/components/ui/badge"
import type { Variants } from "framer-motion"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUpCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Map feature keywords to Phosphor icons
const featureIcons: Record<string, React.ReactNode> = {
    user: <User className="inline w-5 h-5 mr-1 text-blue-500" />,
    notification: <Bell className="inline w-5 h-5 mr-1 text-yellow-500" />,
    moderation: <Shield className="inline w-5 h-5 mr-1 text-purple-500" />,
    report: <Flag className="inline w-5 h-5 mr-1 text-red-500" />,
    community: <Users className="inline w-5 h-5 mr-1 text-green-500" />,
    profile: <UserCircle className="inline w-5 h-5 mr-1 text-indigo-500" />,
    social: <ChatCircleDots className="inline w-5 h-5 mr-1 text-pink-500" />,
    reputation: <Star className="inline w-5 h-5 mr-1 text-yellow-500" />,
    comment: <MessageCircle className="inline w-5 h-5 mr-1 text-cyan-500" />,
    like: <Heart className="inline w-5 h-5 mr-1 text-rose-500" />,
    trending: <Lightning className="inline w-5 h-5 mr-1 text-orange-500" />,
    challenge: <Trophy className="inline w-5 h-5 mr-1 text-amber-500" />,
    guide: <BookOpen className="inline w-5 h-5 mr-1 text-lime-500" />,
    checklist: <ListChecks className="inline w-5 h-5 mr-1 text-teal-500" />,
    launch: <Rocket className="inline w-5 h-5 mr-1 text-fuchsia-500" />,
    global: <Globe className="inline w-5 h-5 mr-1 text-blue-400" />,
    analytics: <ChartBar className="inline w-5 h-5 mr-1 text-violet-500" />,
    settings: <Gear className="inline w-5 h-5 mr-1 text-gray-500" />,
    bug: <Bug className="inline w-5 h-5 mr-1 text-red-400" />,
    view: <Eye className="inline w-5 h-5 mr-1 text-gray-400" />,
    edit: <Pencil className="inline w-5 h-5 mr-1 text-blue-400" />,
    add: <PlusCircle className="inline w-5 h-5 mr-1 text-green-400" />,
}

// Map feature keywords to Lucide icons (for missing Phosphor icons)
const lucideIcons: Record<string, React.ReactNode> = {
    analytics: <BarChart className="inline w-5 h-5 mr-1 text-violet-500" />,
    search: <Search className="inline w-5 h-5 mr-1 text-blue-400" />,
    admin: <LayoutDashboard className="inline w-5 h-5 mr-1 text-gray-700" />,
    dashboard: <LayoutDashboard className="inline w-5 h-5 mr-1 text-gray-700" />,
    settings: <LucideSettings className="inline w-5 h-5 mr-1 text-gray-500" />,
    profile: <LucideUser className="inline w-5 h-5 mr-1 text-indigo-500" />,
    users: <LucideUsers className="inline w-5 h-5 mr-1 text-green-500" />,
    book: <LucideBook className="inline w-5 h-5 mr-1 text-lime-500" />,
    star: <LucideStar className="inline w-5 h-5 mr-1 text-yellow-500" />,
    heart: <LucideHeart className="inline w-5 h-5 mr-1 text-rose-500" />,
    bell: <LucideBell className="inline w-5 h-5 mr-1 text-yellow-500" />,
    globe: <LucideGlobe className="inline w-5 h-5 mr-1 text-blue-400" />,
    rocket: <LucideRocket className="inline w-5 h-5 mr-1 text-fuchsia-500" />,
    bug: <LucideBug className="inline w-5 h-5 mr-1 text-red-400" />,
    eye: <LucideEye className="inline w-5 h-5 mr-1 text-gray-400" />,
    pencil: <LucidePencil className="inline w-5 h-5 mr-1 text-blue-400" />,
    plus: <LucidePlus className="inline w-5 h-5 mr-1 text-green-400" />,
    list: <LucideList className="inline w-5 h-5 mr-1 text-teal-500" />,
    check: <Check className="inline w-5 h-5 mr-1 text-green-500" />,
    x: <X className="inline w-5 h-5 mr-1 text-red-500" />,
    chevron: <ChevronRight className="inline w-5 h-5 mr-1 text-gray-400" />,
    view: <View className="inline w-5 h-5 mr-1 text-gray-400" />,
    file: <File className="inline w-5 h-5 mr-1 text-gray-400" />,
    pen: <Pen className="inline w-5 h-5 mr-1 text-blue-400" />,
    panel: <PanelLeft className="inline w-5 h-5 mr-1 text-gray-400" />,
    calendar: <Calendar className="inline w-5 h-5 mr-1 text-blue-400" />,
    heading: <Heading className="inline w-5 h-5 mr-1 text-gray-400" />,
    clipboard: <Clipboard className="inline w-5 h-5 mr-1 text-gray-400" />,
    moon: <Moon className="inline w-5 h-5 mr-1 text-gray-400" />,
    sun: <Sun className="inline w-5 h-5 mr-1 text-yellow-400" />,
    trash: <Trash className="inline w-5 h-5 mr-1 text-red-400" />,
    logout: <LogOut className="inline w-5 h-5 mr-1 text-gray-400" />,
    home: <Home className="inline w-5 h-5 mr-1 text-blue-400" />,
    menu: <Menu className="inline w-5 h-5 mr-1 text-gray-400" />,
    send: <Send className="inline w-5 h-5 mr-1 text-blue-400" />,
    separator: <SeparatorHorizontal className="inline w-5 h-5 mr-1 text-gray-400" />,
    link: <Link className="inline w-5 h-5 mr-1 text-blue-400" />,
    copy: <Copy className="inline w-5 h-5 mr-1 text-gray-400" />,
    external: <ExternalLink className="inline w-5 h-5 mr-1 text-blue-400" />,
}

// Animation variants for framer-motion
const phaseVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.6, type: "spring" } },
}

// Fetch the markdown file client-side
const useRoadmapMarkdown = () => {
    const [markdown, setMarkdown] = useState<string>("# Roadmap\n\n_Loading..._")
    useEffect(() => {
        fetch("/data/roadmap.md")
            .then((res) => res.text())
            .then(setMarkdown)
            .catch(() => setMarkdown("# Roadmap\n\n_Could not load roadmap file._"))
    }, [])
    return markdown
}

function parseRoadmapMarkdown(markdown: string) {
    // Parse phases
    const phaseRegex = /^# (.+)$/gm
    const checklistRegex = /^[-*] \[( |x)\] (.+)$/gm
    const tableSectionRegex = /# 🟡 MVP Gaps & Priorities([\s\S]*?)---/m
    const checklistSectionRegex = /# 🏁 MVP Checklist([\s\S]*)$/m

    const phases: Array<{ emoji: string; title: string; items: Array<{ text: string; checked: boolean }> }> = []
    let match: RegExpExecArray | null
    let lastIndex = 0
    const lines = markdown.split('\n')
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const phaseMatch = /^# (.+)$/.exec(line)
        if (phaseMatch) {
            const [emoji, ...titleParts] = phaseMatch[1].split(' ')
            const title = titleParts.join(' ').trim()
            const items: Array<{ text: string; checked: boolean }> = []
            // Collect checklist items until next phase or end
            for (let j = i + 1; j < lines.length; j++) {
                const itemMatch = /^[-*] \[( |x)\] (.+)$/.exec(lines[j])
                if (itemMatch) {
                    items.push({ text: itemMatch[2], checked: itemMatch[1] === 'x' })
                } else if (/^# /.test(lines[j])) {
                    break
                }
            }
            phases.push({ emoji, title, items })
        }
    }
    // Parse MVP Gaps table
    const tableSection = tableSectionRegex.exec(markdown)?.[1] || ''
    const tableRows = tableSection.split('\n').filter(l => l.trim().startsWith('|'))
    const gaps = tableRows.slice(2).map(row => {
        const cols = row.split('|').map(c => c.trim()).filter(Boolean)
        return cols.length === 3 ? { feature: cols[0], priority: cols[1], status: cols[2] } : null
    }).filter(Boolean)
    // Parse MVP Checklist
    const checklistSection = checklistSectionRegex.exec(markdown)?.[1] || ''
    const checklistItems = checklistSection.split(/\n\d+\. /).slice(1).map(s => s.trim()).filter(Boolean)
    return { phases, gaps, checklist: checklistItems }
}

export default function RoadmapPage() {
    const markdown = useRoadmapMarkdown()
    const parsed = parseRoadmapMarkdown(markdown)
    const [search, setSearch] = useState("")
    const [activePhase, setActivePhase] = useState<string>("")
    const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const [showTopBtn, setShowTopBtn] = useState(false)

    // Filtered phases/items based on search
    const filteredPhases = parsed.phases
        .map(phase => {
            if (
                phase.title.toLowerCase().includes(search.toLowerCase()) ||
                phase.emoji.toLowerCase().includes(search.toLowerCase())
            ) return phase
            const filteredItems = phase.items.filter(item => item.text.toLowerCase().includes(search.toLowerCase()))
            if (filteredItems.length > 0) return { ...phase, items: filteredItems }
            return null
        })
        .filter(Boolean)
    function highlight(text: string) {
        if (!search) return text
        const regex = new RegExp(`(${search})`, "gi")
        return text.split(regex).map((part, i) =>
            regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 text-black dark:text-white rounded px-0.5 font-bold">{part}</mark> : part
        )
    }

    useEffect(() => {
        const onScroll = () => setShowTopBtn(window.scrollY > 300)
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY
            let current = ""
            for (const phase of parsed.phases) {
                const ref = phaseRefs.current[phase.title]
                if (ref) {
                    const top = ref.getBoundingClientRect().top + window.scrollY - 120
                    if (scrollY >= top) current = phase.title
                }
            }
            setActivePhase(current)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [parsed.phases])
    const scrollToPhase = (title: string) => {
        const ref = phaseRefs.current[title]
        if (ref) {
            window.scrollTo({
                top: ref.getBoundingClientRect().top + window.scrollY - 100,
                behavior: "smooth"
            })
        }
    }

    return (
        <div className="container mx-auto max-w-3xl py-10 px-4 relative overflow-hidden">
            {/* Animated Background */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
                <svg width="100%" height="100%" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-0 w-full h-full opacity-30 dark:opacity-20">
                    <defs>
                        <radialGradient id="roadmap-bg1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%" gradientTransform="rotate(45)">
                            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#f0abfc" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="roadmap-bg2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%" gradientTransform="rotate(-30)">
                            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#f0abfc" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="150" cy="120" r="180" fill="url(#roadmap-bg1)" />
                    <circle cx="500" cy="400" r="200" fill="url(#roadmap-bg2)" />
                </svg>
            </div>
            {/* Suggest a Feature Button */}
            <div className="flex justify-end mb-4">
                <a
                    href="mailto:feedback@gorant.app?subject=Feature%20Suggestion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Suggest a feature"
                    style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '0.01em' }}
                >
                    <PlusCircle className="w-5 h-5" />
                    <span className="font-heading" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        Suggest a Feature
                    </span>
                </a>
            </div>
            {/* Sticky Nav Bar */}
            <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border mb-6 flex overflow-x-auto gap-2 py-2 px-1 rounded-b-none shadow-sm">
                {parsed.phases.map(phase => (
                    <button
                        key={phase.title}
                        onClick={() => scrollToPhase(phase.title)}
                        className={`px-3 py-1 rounded-none font-bold whitespace-nowrap transition-colors text-sm font-heading tracking-tight ${activePhase === phase.title ? "bg-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                        <span className="mr-1">{phase.emoji}</span>{phase.title}
                    </button>
                ))}
            </nav>
            {/* Search Bar */}
            <div className="flex items-center gap-2 mb-6 sticky top-[56px] z-20 bg-background/80 backdrop-blur px-2 py-2 rounded-xl shadow-sm">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search roadmap..."
                    className="w-full bg-transparent outline-none border-0 text-base placeholder:text-muted-foreground"
                    aria-label="Search roadmap"
                />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 font-heading tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <Rocket className="w-7 h-7 text-fuchsia-500" /> Product Roadmap
            </h1>
            <div className="bg-card/80 dark:bg-card/80 backdrop-blur rounded-none shadow-sm border-0 p-6">
                <div className="prose max-w-none">
                    {filteredPhases.map(phase => {
                        if (!phase) return null
                        const total = phase.items.length
                        const completed = phase.items.filter(i => i.checked).length
                        const percent = total > 0 ? Math.round((completed / total) * 100) : 0
                        return (
                            <div
                                key={phase.title}
                                ref={el => { phaseRefs.current[phase.title] = el; }}
                                className="mb-8"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg font-bold font-heading tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{phase.emoji} {highlight(phase.title)}</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-full h-3 bg-muted rounded-none overflow-hidden">
                                        <div
                                            className="h-3 bg-primary transition-all duration-500 rounded-none"
                                            style={{ width: `${percent}%` }}
                                            aria-valuenow={percent}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            role="progressbar"
                                        />
                                    </div>
                                    <span className="text-xs font-mono font-medium text-muted-foreground min-w-[40px] text-right" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{percent}%</span>
                                </div>
                                {/* Animated Checklist */}
                                <ul className="ml-2 mb-4 space-y-1">
                                    {phase.items.map((item, idx) => {
                                        const text = item.text.toLowerCase()
                                        const featureIcon = Object.entries(featureIcons).find(([k]) => text.includes(k))?.[1]
                                        const lucideIcon = featureIcon ? null : Object.entries(lucideIcons).find(([k]) => text.includes(k))?.[1]
                                        const fallbackIcon = (!featureIcon && !lucideIcon) ? <Dot className="inline w-4 h-4 text-gray-400 mr-2" /> : null
                                        const iconLabel = featureIcon ? Object.keys(featureIcons).find(k => text.includes(k)) : lucideIcon ? Object.keys(lucideIcons).find(k => text.includes(k)) : "feature"
                                        return (
                                            <motion.li
                                                key={item.text}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.07, duration: 0.4, type: "spring" }}
                                                className="flex items-center gap-2 text-base font-body tracking-normal" style={{ fontFamily: 'Manrope, sans-serif' }}
                                            >
                                                {/* Status Icon */}
                                                {item.checked ? <CheckCircle className="inline w-4 h-4 text-green-500 mr-1" /> : <Clock className="inline w-4 h-4 text-gray-400 mr-1" />}
                                                {/* Feature Icon with Tooltip */}
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            {featureIcon}
                                                            {lucideIcon}
                                                            {fallbackIcon}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">{iconLabel}</TooltipContent>
                                                </Tooltip>
                                                <span>{highlight(item.text)}</span>
                                            </motion.li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )
                    })}
                    {/* Gaps Table */}
                    <h2 className="text-xl font-bold mt-10 mb-2 font-heading tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>MVP Gaps & Priorities</h2>
                    <div className="overflow-x-auto rounded-none">
                        <table className="min-w-full text-sm font-mono border-collapse" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            <thead>
                                <tr className="bg-muted text-gray-700 dark:text-gray-300">
                                    <th className="px-3 py-2 text-left font-bold">Feature</th>
                                    <th className="px-3 py-2 text-left font-bold">Priority</th>
                                    <th className="px-3 py-2 text-left font-bold">Status/Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsed.gaps.map((gap: any) => (
                                    <tr key={gap.feature} className="border-b border-muted last:border-0">
                                        <td className="px-3 py-2">{gap.feature}</td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-block px-2 py-0.5 rounded-none font-mono text-xs font-bold ${gap.priority === 'High' ? 'bg-yellow-200 text-yellow-800' : gap.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>{gap.priority}</span>
                                        </td>
                                        <td className="px-3 py-2">{gap.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/*  */}
                </div>
            </div>
            {/* Floating Back to Top Button */}
            <motion.button
                type="button"
                aria-label="Back to top"
                onClick={scrollToTop}
                initial={{ opacity: 0, y: 40 }}
                animate={showTopBtn ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground rounded-full shadow-lg p-3 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                style={{ pointerEvents: showTopBtn ? 'auto' : 'none' }}
            >
                <ArrowUpCircle className="w-7 h-7" />
            </motion.button>
        </div>
    )
}
