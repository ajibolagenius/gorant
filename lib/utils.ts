import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getAnonymousId(): string {
    let anonymousId = localStorage.getItem("anonymous_id")
    if (!anonymousId) {
        anonymousId = `anon_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("anonymous_id", anonymousId)
    }
    return anonymousId
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

/**
 * Generates a friendly, human-readable anonymous name (e.g., "Calm Lion").
 * Optionally accepts a separator (default: space).
 */
export function generateFriendlyAnonymousName(separator = ' '): string {
    const adjectives = [
        'Calm', 'Brave', 'Gentle', 'Clever', 'Bold', 'Quiet', 'Witty', 'Kind', 'Lively', 'Mellow',
        'Sunny', 'Chill', 'Bright', 'Lucky', 'Noble', 'Swift', 'Wise', 'Happy', 'Jolly', 'Serene',
    ]
    const animals = [
        'Lion', 'Otter', 'Panda', 'Falcon', 'Wolf', 'Dolphin', 'Fox', 'Bear', 'Hawk', 'Tiger',
        'Koala', 'Eagle', 'Rabbit', 'Owl', 'Seal', 'Moose', 'Swan', 'Badger', 'Lynx', 'Heron',
    ]
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const animal = animals[Math.floor(Math.random() * animals.length)]
    return `${adjective}${separator}${animal}`
}
