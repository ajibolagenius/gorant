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
