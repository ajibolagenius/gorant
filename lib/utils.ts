import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Rant } from "@/components/enhanced-rant-card"
import { storageGet, storageSet } from "@/lib/storage"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getAnonymousId(): string {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("anon_id");
    if (!id) {
        id = Math.random().toString(36).substring(2, 15);
        localStorage.setItem("anon_id", id);
    }
    return id;
}

/**
 * Generates a RFC4122 version 4 compliant UUID.
 */
export function generateUUID(): string {
    // https://stackoverflow.com/a/2117523/2715716
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

const FRIENDLY_ADJECTIVES = [
    'Calm', 'Brave', 'Gentle', 'Clever', 'Bold', 'Quiet', 'Witty', 'Kind', 'Lively', 'Mellow',
    'Sunny', 'Chill', 'Bright', 'Lucky', 'Noble', 'Swift', 'Wise', 'Happy', 'Jolly', 'Serene',
]
const FRIENDLY_ANIMALS = [
    'Lion', 'Otter', 'Panda', 'Falcon', 'Wolf', 'Dolphin', 'Fox', 'Bear', 'Hawk', 'Tiger',
    'Koala', 'Eagle', 'Rabbit', 'Owl', 'Seal', 'Moose', 'Swan', 'Badger', 'Lynx', 'Heron',
]

/**
 * Generates a friendly, human-readable anonymous name (e.g., "Calm Lion").
 * Optionally accepts a separator (default: space).
 */
export function generateFriendlyAnonymousName(separator = ' '): string {
    const adjective = FRIENDLY_ADJECTIVES[Math.floor(Math.random() * FRIENDLY_ADJECTIVES.length)]
    const animal = FRIENDLY_ANIMALS[Math.floor(Math.random() * FRIENDLY_ANIMALS.length)]
    return `${adjective}${separator}${animal}`
}

/**
 * Deterministically maps an anonymous_id to a stable friendly name
 * (e.g., "Calm Lion") so the same author always renders identically across the
 * app. Used as the fallback display name when a user hasn't set a custom one.
 */
export function friendlyNameFromId(id: string, separator = ' '): string {
    if (!id) return 'Anonymous'
    // Simple deterministic 32-bit hash (djb2-ish) over the id characters.
    let hash = 5381
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) + hash + id.charCodeAt(i)) | 0
    }
    const adjIndex = Math.abs(hash) % FRIENDLY_ADJECTIVES.length
    const aniIndex = Math.abs(Math.floor(hash / FRIENDLY_ADJECTIVES.length)) % FRIENDLY_ANIMALS.length
    return `${FRIENDLY_ADJECTIVES[adjIndex]}${separator}${FRIENDLY_ANIMALS[aniIndex]}`
}

/**
 * Ensures a rant object has all required fields with sensible defaults.
 * Use this when loading or updating rants from any source.
 */
export function normalizeRant(rant: any): Rant {
    return {
        id: rant.id ?? Math.random().toString(36).substr(2, 9),
        content: rant.content ?? "",
        mood: rant.mood ?? "neutral",
        created_at: rant.created_at ?? new Date().toISOString(),
        likes_count: rant.likes_count ?? 0,
        comments_count: rant.comments_count ?? 0,
        anonymous_id: rant.anonymous_id ?? "anon_unknown",
        tags: rant.tags ?? [],
        is_trending: rant.is_trending ?? false,
        sentiment_score: rant.sentiment_score ?? 0,
        moderation_status: rant.moderation_status ?? "approved",
        reputation_impact: rant.reputation_impact ?? 0,
        reported: rant.reported ?? false,
        moderation_score: rant.moderation_score ?? 1,
        // Add any additional fields as needed
    }
}
