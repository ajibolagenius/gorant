"use client"

import React, { useEffect, useRef, useState } from "react"
import {
    CheckCircle, Clock, XCircle, User, Bell, Shield, Flag, Users, Star, Heart, Lightning, Trophy, BookOpen, ListChecks, Rocket, Globe, ChatCircleDots, UserCircle, ChartBar, Gear, Bug, Eye, Pencil, PlusCircle, ArrowRight, ArrowDown, ArrowUp, ThumbsUp, ThumbsDown, Tag as TagIcon, Flag as FlagIcon
} from "@phosphor-icons/react"
import { Loader, MessageCircle, Dot, User as LucideUser, Search, List as LucideList, Shield as LucideShield, BarChart, Settings as LucideSettings, Users as LucideUsers, Book as LucideBook, Star as LucideStar, Heart as LucideHeart, Bell as LucideBell, Globe as LucideGlobe, Rocket as LucideRocket, Bug as LucideBug, Eye as LucideEye, Pencil as LucidePencil, Plus as LucidePlus, ArrowRight as LucideArrowRight, ArrowDown as LucideArrowDown, ArrowUp as LucideArrowUp, Check, X, ChevronRight, View, File, Pen, LayoutDashboard, PanelLeft, Calendar, Heading, Clipboard, Moon, Sun, Trash, LogOut, Home, Menu, ChevronDown, ChevronLeft, ChevronUp, Send, SeparatorHorizontal, Link, Copy, ExternalLink, ArrowLeft, ArrowLeftCircle, ArrowRightCircle, ArrowUpCircle as LucideArrowUpCircle, ArrowDownCircle as LucideArrowDownCircle } from "lucide-react"
import { MagnifyingGlass, Funnel, SortAscending } from "@phosphor-icons/react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { Badge } from "@/components/ui/badge"
import type { Variants } from "framer-motion"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUpCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { CaretDown } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState("");
    const [filterPriority, setFilterPriority] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    // Admin flag (toggleable)
    const [isAdmin, setIsAdmin] = useState(false); // Default to user view
    // Sort state, default to 'all'
    const [sortBy, setSortBy] = useState('all');
    const [search, setSearch] = useState("");
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
    // Commented out voting UI and logic for now. To restore, uncomment the relevant sections below.
    // --- VOTING LOGIC START ---
    // const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})
    // const [voting, setVoting] = useState<Record<string, boolean>>({})
    // const fetchUserVotes = async (suggestionIds: string[]) => { /* ... */ }
    // const fetchSuggestionsAndVotes = async () => { /* ... */ }
    // useEffect(() => { fetchSuggestionsAndVotes() }, [])
    // const handleVote = async (suggestionId: string, voteType: 'up' | 'down') => { /* ... */ }
    // --- VOTING LOGIC END ---

    // 1. Add state for slide-out form and new fields
    const [showForm, setShowForm] = useState(false);
    const [category, setCategory] = useState("Feature");
    const [priority, setPriority] = useState("Not important");
    // Suggestion form error state
    const [formError, setFormError] = useState("");

    // Fetch suggestions (refactored to a function for refresh)
    const fetchSuggestions = () => {
        setLoadingSuggestions(true)
        supabase
            .from("suggestions")
            .select("id, title, description, votes_up, votes_down, status, created_at, category, priority")
            .order("created_at", { ascending: false })
            .then(({ data, error }) => {
                setSuggestions(data || [])
                setLoadingSuggestions(false)
            })
    }

    // Ensure suggestions are loaded on mount
    useEffect(() => {
        fetchSuggestions();
    }, []);
    // 2. Update handleSubmit to include category and priority
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        const titleWordCount = title.trim().split(/\s+/).length;
        const descriptionWordCount = description.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
        if (!title.trim() || titleWordCount < 5) {
            setFormError("Title must be at least 5 words.");
            return;
        }
        if (!description.trim() || descriptionWordCount < 15) {
            setFormError("Description must be at least 15 words.");
            return;
        }
        setSubmitting(true);
        setSubmitMsg(null);
        const anonymous_id = getOrCreateAnonymousId();
        const { error } = await supabase.from("suggestions").insert({
            title: title.trim(),
            description,
            anonymous_id,
            category,
            priority
        });
        if (error) {
            setSubmitMsg("Failed to submit suggestion. Please try again.");
        } else {
            setSubmitMsg("Thank you for your suggestion!");
            setTitle("");
            setDescription("");
            setCategory("Feature");
            setPriority("Not important");
            setShowForm(false);
            fetchSuggestions();
        }
        setSubmitting(false);
    };
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
        if (typeof window !== "undefined") {
            const onScroll = () => setShowTopBtn(window.scrollY > 300)
            window.addEventListener("scroll", onScroll)
            return () => window.removeEventListener("scroll", onScroll)
        }
    }, [])
    const scrollToTop = () => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
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
        }
    }, [parsed.phases])
    const scrollToPhase = (title: string) => {
        if (typeof window !== "undefined") {
            const ref = phaseRefs.current[title]
            if (ref) {
                window.scrollTo({
                    top: ref.getBoundingClientRect().top + window.scrollY - 100,
                    behavior: "smooth"
                })
            }
        }
    }

    // Filtering, sorting, and searching logic
    let filteredSuggestions = suggestions;
    if (sortBy === 'all') {
        filteredSuggestions = suggestions;
    } else if (sortBy.startsWith('category:')) {
        const cat = sortBy.split(':')[1];
        filteredSuggestions = suggestions.filter(s => s.category === cat);
    } else if (sortBy.startsWith('priorityLevel:')) {
        const pri = sortBy.split(':')[1];
        filteredSuggestions = suggestions.filter(s => s.priority === pri);
    } else if (sortBy.startsWith('status:')) {
        const stat = sortBy.split(':')[1];
        filteredSuggestions = suggestions.filter(s => s.status === stat);
    }
    if (sortBy === "newest") filteredSuggestions.sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (sortBy === "oldest") filteredSuggestions.sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (sortBy === "priority") filteredSuggestions.sort((a, b) => a.priority.localeCompare(b.priority));

    const [currentPage, setCurrentPage] = useState(1);
    const SUGGESTIONS_PER_PAGE = 10;
    // Pagination logic
    const totalPages = Math.ceil(filteredSuggestions.length / SUGGESTIONS_PER_PAGE);
    const paginatedSuggestions = filteredSuggestions.slice((currentPage - 1) * SUGGESTIONS_PER_PAGE, currentPage * SUGGESTIONS_PER_PAGE);

    return (
        <div className="min-h-screen bg-background" role="main" aria-label="Product Roadmap">
            {/* Dashboard-style Header (solid background, no gradient) */}
            <div className="w-full bg-background border-b border-border shadow-sm mb-0">
                <div className="container mx-auto px-4 py-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Rocket className="w-8 h-8 text-primary" />
                        <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-foreground" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                            Product Roadmap
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Share your ideas and help shape the future!</span>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8">
                {/* Main Content as Card */}
                <div className="flex-1 min-w-0">
                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur mb-8">
                        <CardContent className="pt-6">
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
                            <div className="flex items-center gap-2 mb-6 sticky top-[56px] z-20 bg-background/80 backdrop-blur px-2 py-2 rounded-none shadow-sm border-b border-muted">
                                <MagnifyingGlass className="w-5 h-5 text-muted-foreground ml-2" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search roadmap and suggestions..."
                                    className="w-full bg-transparent outline-none border-0 text-base placeholder:text-muted-foreground font-mono px-2 py-2 focus:ring-2 focus:ring-purple-400 rounded-none"
                                    style={{ fontFamily: 'JetBrains Mono, monospace', borderRadius: 0 }}
                                    aria-label="Search roadmap and suggestions"
                                />
                            </div>
                            {/* Phases as Section Cards */}
                            <div className="space-y-8">
                                {filteredPhases.map(phase => {
                                    if (!phase) return null
                                    const total = phase.items.length
                                    const completed = phase.items.filter(i => i.checked).length
                                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
                                    return (
                                        <Card key={phase.title} className="bg-card/80 dark:bg-card/80 backdrop-blur border-0 shadow-sm p-6" ref={el => { phaseRefs.current[phase.title] = el; }}>
                                            <CardHeader className="flex flex-row items-center gap-2 mb-2 p-0">
                                                <span className="text-lg font-bold font-heading tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{phase.emoji} {highlight(phase.title)}</span>
                                            </CardHeader>
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
                                                            className="flex items-center gap-2 text-base font-body tracking-normal"
                                                            style={{ fontFamily: 'Manrope, sans-serif' }}
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
                                        </Card>
                                    )
                                })}
                            </div>
                            {/* MVP Gaps Table as Card */}
                            <Card className="bg-card/80 dark:bg-card/80 backdrop-blur border-0 shadow-sm p-6 mt-10">
                                <CardHeader className="p-0 mb-2">
                                    <h2 className="text-xl font-bold font-heading tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>MVP Gaps & Priorities</h2>
                                </CardHeader>
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
                            </Card>
                        </CardContent>
                    </Card>
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
                {/* Sidebar as Card */}
                <aside className="w-full md:w-[380px] flex-shrink-0 z-30">
                    <Card className="bg-card/80 dark:bg-card/80 backdrop-blur shadow-sm border-0 p-6 mb-6">
                        <CardHeader className="p-0 mb-4">
                            <h2 className="text-lg font-bold font-heading tracking-tight flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                <Star className="w-5 h-5 text-yellow-500" /> Community Suggestions
                            </h2>
                        </CardHeader>
                        {/* Admin toggle button */}
                        <div className="flex items-center gap-2 mb-2">
                            <button
                                className={`px-3 py-1 text-xs font-mono border ${isAdmin ? 'bg-primary text-white' : 'bg-muted text-foreground'} rounded-none focus:outline-none focus:ring-2 focus:ring-primary`}
                                onClick={() => setIsAdmin(v => !v)}
                                aria-pressed={isAdmin}
                            >
                                {isAdmin ? 'Admin Mode: ON' : 'Admin Mode: OFF'}
                            </button>
                        </div>
                        {/* Total suggestions count */}
                        <div className="mb-2 text-xs font-mono text-muted-foreground">Total suggestions: {suggestions.length}</div>
                        {/* Suggest a Feature button remains at the top */}
                        <button
                            className="w-full inline-flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 font-bold text-sm font-heading px-4 py-2 shadow transition-colors focus-visible:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 mb-4 rounded-none min-h-[44px]"
                            aria-label="Suggest a feature"
                            onClick={() => { setShowForm(true); setSubmitMsg(null); }}
                            style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.01em' }}
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span className="font-heading" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                Suggest a Feature
                            </span>
                        </button>
                        {/* Suggestion Modal */}
                        <Dialog open={showForm} onOpenChange={setShowForm}>
                            <DialogContent className="w-screen h-screen max-w-full max-h-full p-0 rounded-none flex items-center justify-center bg-background">
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-full max-w-2xl mx-auto bg-card/90 border border-muted p-8 shadow-xl rounded-none relative flex flex-col" style={{ minHeight: '70vh', maxHeight: '90vh' }}>
                                        <h3 className="text-lg font-bold mb-4 font-heading tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                                            <PlusCircle className="w-5 h-5 mr-1 inline" /> Suggest a Feature
                                        </h3>
                                        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-1">
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                placeholder="Title (at least 5 words)"
                                                className="w-full border border-input bg-background px-3 py-2 focus:border-purple-400 text-sm font-heading rounded-none mb-1"
                                                style={{ fontFamily: 'Space Grotesk, sans-serif', borderRadius: 0 }}
                                                required
                                            />
                                            <div className="flex flex-col flex-1">
                                                <ReactQuill
                                                    value={description}
                                                    onChange={setDescription}
                                                    placeholder="Describe your suggestion (at least 15 words)"
                                                    className="bg-background rounded-none mb-1 flex-1"
                                                    style={{ fontFamily: 'Manrope, sans-serif', borderRadius: 0, minHeight: 320, maxHeight: 480, height: 400 }}
                                                    theme="snow"
                                                />
                                                <div className="text-xs text-muted-foreground font-mono mt-1 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                    {description.replace(/<[^>]+>/g, '').length}/500
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <label className="text-xs font-bold font-mono">Category:</label>
                                                <select value={category} onChange={e => setCategory(e.target.value)} className="border px-2 py-1 rounded-none text-xs font-mono">
                                                    <option value="Feature">Feature</option>
                                                    <option value="Bug">Bug</option>
                                                    <option value="Improvement">Improvement</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                <label className="text-xs font-bold font-mono ml-2">Priority:</label>
                                                <select value={priority} onChange={e => setPriority(e.target.value)} className="border px-2 py-1 rounded-none text-xs font-mono">
                                                    <option value="Not important">Not important</option>
                                                    <option value="Nice to have">Nice to have</option>
                                                    <option value="Important">Important</option>
                                                    <option value="Critical">Critical</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                                {formError && <span className="text-red-600">{formError}</span>}
                                                {submitMsg && <span className="text-green-600">{submitMsg}</span>}
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white hover:bg-purple-700 text-sm font-bold py-2 rounded-none min-h-[40px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                                                disabled={submitting || !title.trim() || !description.trim()}
                                                style={{ fontFamily: 'Space Grotesk, sans-serif', borderRadius: 0 }}
                                            >
                                                <Pencil weight="duotone" className="w-4 h-4 mr-1" />
                                                {submitting ? "Submitting..." : "Submit Suggestion"}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                        {/* Sort dropdown moved below the suggest button */}
                        <div className="flex items-center gap-1 mb-4">
                            <span className="text-xs font-mono">Sort:</span>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border px-2 py-1 rounded-none text-xs font-mono bg-background">
                                <option value="all">All</option>
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="priority">Priority</option>
                                <option disabled>──────────</option>
                                <option value="category:Feature">Category: Feature</option>
                                <option value="category:Bug">Category: Bug</option>
                                <option value="category:Improvement">Category: Improvement</option>
                                <option value="category:Other">Category: Other</option>
                                <option disabled>──────────</option>
                                <option value="priorityLevel:Not important">Priority: Not important</option>
                                <option value="priorityLevel:Nice to have">Priority: Nice to have</option>
                                <option value="priorityLevel:Important">Priority: Important</option>
                                <option value="priorityLevel:Critical">Priority: Critical</option>
                                <option disabled>──────────</option>
                                <option value="status:pending">Status: Pending</option>
                                <option value="status:accepted">Status: Accepted</option>
                                <option value="status:reviewed">Status: Reviewed</option>
                                <option value="status:rejected">Status: Rejected</option>
                            </select>
                        </div>
                        {loadingSuggestions ? (
                            <div className="text-muted-foreground text-sm font-body" style={{ fontFamily: 'Manrope, sans-serif' }}>Loading suggestions...</div>
                        ) : suggestions.length === 0 ? (
                            <div className="text-muted-foreground text-sm font-body" style={{ fontFamily: 'Manrope, sans-serif' }}>No suggestions yet. Be the first to suggest a feature!</div>
                        ) : (
                            <ul className="space-y-4">
                                {paginatedSuggestions.map((s, idx) => (
                                    <li key={s.id} className="relative bg-card/80 border border-muted p-5 flex flex-col gap-3 font-body text-sm font-medium text-foreground rounded-none" style={{ fontFamily: 'Manrope, sans-serif', borderRadius: 0 }}>
                                        {/* Simple bullet instead of numbering */}
                                        <span className="absolute left-0 top-7 flex items-center justify-center w-4 h-4 bg-primary text-white font-bold font-mono text-xs rounded-full shadow-sm" style={{ borderRadius: '50%' }}>
                                            •
                                        </span>
                                        {/* Title row */}
                                        <div className="flex items-center gap-2 cursor-pointer select-none pl-7" onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}>
                                            <span className="font-heading text-base font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{s.title}</span>
                                            <CaretDown weight="duotone" className={`w-4 h-4 transition-transform ${expandedId === s.id ? 'rotate-180' : ''}`} />
                                        </div>
                                        {/* Inline tags */}
                                        <div className="flex flex-wrap gap-2 pl-7">
                                            {s.status && (
                                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-xs font-medium rounded-none
                                                    ${s.status === 'pending' ? 'bg-warning text-yellow-900' :
                                                        s.status === 'accepted' ? 'bg-success text-green-900' :
                                                            s.status === 'reviewed' ? 'bg-muted text-gray-700' :
                                                                s.status === 'rejected' ? 'bg-accent text-red-900' :
                                                                    'bg-muted text-muted-foreground'}`}
                                                    style={{ fontFamily: 'JetBrains Mono, monospace', borderRadius: 0 }}
                                                >
                                                    {s.status === 'pending' && <Clock weight="duotone" className="w-3 h-3 mr-0.5" />}
                                                    {s.status === 'accepted' && <CheckCircle weight="duotone" className="w-3 h-3 mr-0.5" />}
                                                    {s.status === 'reviewed' && <Eye weight="duotone" className="w-3 h-3 mr-0.5" />}
                                                    {s.status === 'rejected' && <XCircle weight="duotone" className="w-3 h-3 mr-0.5" />}
                                                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                                </span>
                                            )}
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-xs font-medium rounded-none bg-blue-100 text-blue-800">
                                                <TagIcon weight="duotone" className="w-3 h-3 mr-0.5" />{s.category}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 font-mono text-xs font-medium rounded-none bg-purple-100 text-purple-800">
                                                <FlagIcon weight="duotone" className="w-3 h-3 mr-0.5" />{s.priority}
                                            </span>
                                        </div>
                                        {/* Description (expandable) */}
                                        {expandedId === s.id && (
                                            <div className="animate-slide-down mt-2 prose prose-sm max-w-none pl-7" style={{ fontFamily: 'Manrope, sans-serif', maxHeight: 380, overflowY: 'auto' }} dangerouslySetInnerHTML={{ __html: s.description }} />
                                        )}
                                        {/* Admin status dropdown */}
                                        {isAdmin && (
                                            <div className="flex items-center gap-2 pl-7 mt-2">
                                                <label htmlFor={`status-select-${s.id}`} className="text-xs font-mono">Status:</label>
                                                <select
                                                    id={`status-select-${s.id}`}
                                                    value={s.status || 'pending'}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        // Update status in Supabase
                                                        setSuggestions(prev => prev.map(sug => sug.id === s.id ? { ...sug, status: newStatus } : sug));
                                                        await supabase.from('suggestions').update({ status: newStatus }).eq('id', s.id);
                                                        fetchSuggestions();
                                                    }}
                                                    className="border px-2 py-1 rounded-none text-xs font-mono bg-background"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="accepted">Accepted</option>
                                                    <option value="reviewed">Reviewed</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-4">
                                <button
                                    className="px-2 py-1 text-xs font-mono bg-muted text-foreground rounded-none border border-muted disabled:opacity-50"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        className={`px-2 py-1 text-xs font-mono rounded-none border ${currentPage === i + 1 ? 'bg-primary text-white border-primary' : 'bg-muted text-foreground border-muted'}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="px-2 py-1 text-xs font-mono bg-muted text-foreground rounded-none border border-muted disabled:opacity-50"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </Card>
                </aside>
            </div>
        </div>
    )
}
