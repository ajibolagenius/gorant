"use client"

import React, { useEffect, useRef, useState } from "react"
import {
    CheckCircle, Clock, XCircle, User, Bell, Shield, Flag, Users, Star, Heart, Lightning, Trophy, BookOpen, ListChecks, Rocket, Globe, ChatCircleDots, UserCircle, ChartBar, Gear, Bug, Eye, Pencil, PlusCircle, ArrowRight, ArrowDown, ArrowUp, ThumbsUp, ThumbsDown
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
import { supabase } from "@/lib/supabaseClient";
import { Dialog } from "@/components/ui/dialog" // If you have a dialog component, otherwise use a simple modal below

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
    view: <Eye className="inline w-5 h-5 mr-1 text-gray-500" />,
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
    eye: <LucideEye className="inline w-5 h-5 mr-1 text-gray-500" />,
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
    // Parse MVP Gaps table
    const tableSectionRegex = /# 🟡 MVP Gaps & Priorities([\s\S]*?)\n---\n/m
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

// Utility to get or create a persistent anonymous_id
function getOrCreateAnonymousId() {
    if (typeof window === "undefined") return "mock-anon-id";
    let id = localStorage.getItem("anonymous_id");
    if (!id) {
        id = (typeof crypto !== "undefined" && crypto.randomUUID)
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15) + Date.now();
        localStorage.setItem("anonymous_id", id);
    }
    return id;
}

export default function RoadmapPage() {
    const markdown = useRoadmapMarkdown()
    const parsed = parseRoadmapMarkdown(markdown)
    const [search, setSearch] = useState("")
    const [activePhase, setActivePhase] = useState<string>("")
    const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const [showTopBtn, setShowTopBtn] = useState(false)
    // Sidebar state
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [loadingSuggestions, setLoadingSuggestions] = useState(true)
    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [suggestionText, setSuggestionText] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [submitMsg, setSubmitMsg] = useState<string | null>(null)
    // Voting state
    const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})
    const [voting, setVoting] = useState<Record<string, boolean>>({})
    // Fetch suggestions (refactored to a function for refresh)
    const fetchSuggestions = () => {
        setLoadingSuggestions(true)
        supabase
            .from("suggestions")
            .select("id, content, votes_up, votes_down, status, created_at")
            .order("created_at", { ascending: false })
            .then(({ data, error }) => {
                setSuggestions(data || [])
                setLoadingSuggestions(false)
            })
    }
    // Fetch user votes for visible suggestions
    const fetchUserVotes = async (suggestionIds: string[]) => {
        const anonymous_id = getOrCreateAnonymousId()
        if (suggestionIds.length === 0) return setUserVotes({})
        const { data, error } = await supabase
            .from("suggestion_votes")
            .select("suggestion_id, vote_type")
            .in("suggestion_id", suggestionIds)
            .eq("anonymous_id", anonymous_id)
        if (data) {
            const votes: Record<string, 'up' | 'down' | null> = {}
            data.forEach((v: any) => { votes[v.suggestion_id] = v.vote_type })
            setUserVotes(votes)
        } else {
            setUserVotes({})
        }
    }
    // Fetch suggestions and user votes together
    const fetchSuggestionsAndVotes = async () => {
        setLoadingSuggestions(true)
        const { data, error } = await supabase
            .from("suggestions")
            .select("id, content, votes_up, votes_down, status, created_at")
            .order("created_at", { ascending: false })
        setSuggestions(data || [])
        setLoadingSuggestions(false)
        if (data) {
            fetchUserVotes(data.map((s: any) => s.id))
        }
    }
    useEffect(() => {
        fetchSuggestionsAndVotes()
    }, [])
    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!suggestionText.trim()) return
        setSubmitting(true)
        setSubmitMsg(null)
        const anonymous_id = getOrCreateAnonymousId()
        const { error } = await supabase.from("suggestions").insert({ content: suggestionText.trim(), anonymous_id })
        if (error) {
            setSubmitMsg("Failed to submit suggestion. Please try again.")
        } else {
            setSubmitMsg("Thank you for your suggestion!")
            setSuggestionText("")
            setShowModal(false)
            fetchSuggestionsAndVotes()
        }
        setSubmitting(false)
    }
    // Voting handler (improved)
    const handleVote = async (suggestionId: string, voteType: 'up' | 'down') => {
        const anonymous_id = getOrCreateAnonymousId()
        const currentVote = userVotes[suggestionId]
        if (currentVote === voteType || voting[suggestionId]) return // Prevent double voting
        setVoting(v => ({ ...v, [suggestionId]: true }))
        // Upsert vote
        await supabase.from("suggestion_votes").upsert({
            suggestion_id: suggestionId,
            anonymous_id,
            vote_type: voteType,
        }, { onConflict: "suggestion_id,anonymous_id" })
        // Update suggestion vote counts via RPC
        await supabase.rpc('update_suggestion_votes', { suggestion_id: suggestionId, vote_type: voteType, prev_vote: currentVote })
        // Optimistically update UI
        setUserVotes(v => ({ ...v, [suggestionId]: voteType }))
        fetchSuggestionsAndVotes()
        setVoting(v => ({ ...v, [suggestionId]: false }))
    }

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
        <div className="container mx-auto max-w-6xl py-10 px-4 relative flex flex-col md:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
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
                {/* Sticky Nav Bar, Search, Roadmap, etc. */}
                <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border mb-6 flex overflow-x-auto gap-2 py-2 px-1 rounded-b-none shadow-sm">
                    {parsed.phases.map(phase => (
                        <button
                            key={phase.title}
                            onClick={() => scrollToPhase(phase.title)}
                            className={`px-3 py-1 rounded-none font-bold whitespace-nowrap transition-colors text-sm font-heading tracking-tight ${activePhase === phase.title
                                ? "bg-primary text-primary-foreground shadow"
                                : "bg-muted text-foreground hover:bg-accent"
                                }`}
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
                                                aria-label={`${phase.emoji} ${phase.title} progress`}
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
                                                    {item.checked ? <CheckCircle className="inline w-4 h-4 text-green-800 mr-1" /> : <Clock className="inline w-4 h-4 text-gray-400 mr-1" />}
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
                    className="fixed right-4 bottom-10 z-40 bg-black text-white hover:bg-gray-900 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-none shadow-sm w-11 h-11 min-w-[44px] min-h-[44px] p-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-all"
                    style={{ pointerEvents: showTopBtn ? 'auto' : 'none', borderRadius: 0 }}
                >
                    <ArrowUpCircle className="w-6 h-6" />
                </motion.button>
            </div>
            {/* Sidebar */}
            <aside className="w-full md:w-80 flex-shrink-0 z-30">
                <div
                    className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0 p-6 mb-6"
                    style={{
                        position: 'sticky',
                        top: '4rem',
                        zIndex: 30,
                        maxHeight: 'calc(100vh - 2rem)',
                        overflowY: 'auto',
                    }}
                >
                    <h2 className="text-lg font-bold mb-4 font-heading tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        <Star className="w-5 h-5 text-yellow-500" /> Community Suggestions
                    </h2>
                    <button
                        className="w-full inline-flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 font-bold text-sm font-heading px-4 py-2 shadow transition-colors focus-visible:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 mb-4 rounded-none min-h-[44px]"
                        aria-label="Suggest a feature"
                        onClick={() => { setShowModal(true); setSubmitMsg(null); }}
                        style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.01em' }}
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span className="font-heading" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            Suggest a Feature
                        </span>
                    </button>
                    {/* Suggestion Modal */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="bg-card p-6 shadow-lg w-full max-w-md relative border-0 rounded-none" style={{ borderRadius: 0 }}>
                                <button
                                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    onClick={() => setShowModal(false)}
                                    aria-label="Close"
                                    style={{ minWidth: 44, minHeight: 44 }}
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                                <h3 className="text-lg font-bold mb-2 font-heading" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Suggest a Feature</h3>
                                <form onSubmit={handleSubmit}>
                                    <textarea
                                        className="w-full border border-input bg-background px-3 py-2 focus:border-purple-400 mb-3 min-h-[80px] font-body text-base rounded-none resize-y max-h-40"
                                        maxLength={500}
                                        value={suggestionText}
                                        onChange={e => setSuggestionText(e.target.value)}
                                        placeholder="What would you like to see?"
                                        required
                                        aria-label="Feature suggestion"
                                        autoFocus
                                        style={{ fontFamily: 'Manrope, sans-serif', borderRadius: 0, maxHeight: '160px' }}
                                    />
                                    <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                        <span>{suggestionText.length}/500</span>
                                        {submitMsg && <span className="text-green-600">{submitMsg}</span>}
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-purple-600 text-white hover:bg-purple-700 font-bold py-2 rounded-none min-h-[44px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                                        disabled={submitting || !suggestionText.trim()}
                                        style={{ fontFamily: 'Space Grotesk, sans-serif', borderRadius: 0 }}
                                    >
                                        {submitting ? "Submitting..." : "Submit Suggestion"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                    {loadingSuggestions ? (
                        <div className="text-muted-foreground text-sm font-body" style={{ fontFamily: 'Manrope, sans-serif' }}>Loading suggestions...</div>
                    ) : suggestions.length === 0 ? (
                        <div className="text-muted-foreground text-sm font-body" style={{ fontFamily: 'Manrope, sans-serif' }}>No suggestions yet. Be the first to suggest a feature!</div>
                    ) : (
                        <ul className="space-y-4">
                            {suggestions.map(s => (
                                <li key={s.id} className="bg-muted/60 p-3 flex flex-col gap-1 border border-muted font-body text-base font-medium text-foreground rounded-none" style={{ fontFamily: 'Manrope, sans-serif', borderRadius: 0 }}>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span>{s.content}</span>
                                            {s.status && (
                                                <span
                                                    className={`inline-block px-2 py-0.5 font-mono text-xs font-bold rounded-none ml-2
                                                        ${s.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                                            s.status === 'accepted' ? 'bg-green-200 text-green-800' :
                                                                s.status === 'reviewed' ? 'bg-gray-200 text-gray-700' :
                                                                    s.status === 'rejected' ? 'bg-red-200 text-red-700' :
                                                                        'bg-muted text-muted-foreground'}`}
                                                    style={{ fontFamily: 'JetBrains Mono, monospace', borderRadius: 0 }}
                                                >
                                                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                        <button
                                            className={`flex items-center focus:outline-none focus:ring-2 focus:ring-purple-400 ${userVotes[s.id] === 'up' ? 'text-green-700' : 'text-green-600 opacity-60 hover:opacity-100'} transition`}
                                            aria-label="Upvote suggestion"
                                            onClick={() => handleVote(s.id, 'up')}
                                            disabled={userVotes[s.id] === 'up' || voting[s.id]}
                                            style={{ minWidth: 32, minHeight: 32 }}
                                        >
                                            <ThumbsUp weight="duotone" className="w-4 h-4 mr-1" />{s.votes_up ?? 0}
                                        </button>
                                        <button
                                            className={`flex items-center focus:outline-none focus:ring-2 focus:ring-purple-400 ${userVotes[s.id] === 'down' ? 'text-red-700' : 'text-red-500 opacity-60 hover:opacity-100'} transition`}
                                            aria-label="Downvote suggestion"
                                            onClick={() => handleVote(s.id, 'down')}
                                            disabled={userVotes[s.id] === 'down' || voting[s.id]}
                                            style={{ minWidth: 32, minHeight: 32 }}
                                        >
                                            <ThumbsDown weight="duotone" className="w-4 h-4 mr-1" />{s.votes_down ?? 0}
                                        </button>
                                        <span className="ml-auto">{new Date(s.created_at).toLocaleDateString()}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>
        </div>
    )
}
