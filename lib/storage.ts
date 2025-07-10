import CryptoJS from "crypto-js"

const STORAGE_KEY = "rant-app-key"

/**
 * Safe, reusable localStorage utility for JSON data.
 * Handles parsing, stringifying, and error cases.
 */
export function storageGet<T = any>(key: string, fallback?: T): T | undefined {
    if (typeof window === "undefined") return fallback
    try {
        const value = localStorage.getItem(key)
        if (value === null) return fallback
        // Try to decrypt
        try {
            const bytes = CryptoJS.AES.decrypt(value, STORAGE_KEY)
            const decrypted = bytes.toString(CryptoJS.enc.Utf8)
            return JSON.parse(decrypted) as T
        } catch (e) {
            // Fallback: try plain JSON (for legacy data)
            return JSON.parse(value) as T
        }
    } catch (err) {
        console.warn(`storageGet: Failed to parse key '${key}'`, err)
        return fallback
    }
}

export function storageSet<T = any>(key: string, value: T): void {
    if (typeof window === "undefined") return
    try {
        const stringified = JSON.stringify(value)
        const encrypted = CryptoJS.AES.encrypt(stringified, STORAGE_KEY).toString()
        localStorage.setItem(key, encrypted)
    } catch (err) {
        console.warn(`storageSet: Failed to set key '${key}'`, err)
    }
}

export function storageRemove(key: string): void {
    if (typeof window === "undefined") return
    try {
        localStorage.removeItem(key)
    } catch (err) {
        console.warn(`storageRemove: Failed to remove key '${key}'`, err)
    }
}
