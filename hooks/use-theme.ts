"use client"

import { useState, useEffect } from "react"
import { storageGet, storageSet } from "@/lib/storage"

export function useTheme() {
    const [theme, setTheme] = useState<"light" | "dark">("light")

    useEffect(() => {
        // Check for saved theme preference or default to light
        const savedTheme = storageGet<"light" | "dark">("theme")
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

        const initialTheme = savedTheme || (prefersDark ? "dark" : "light")
        setTheme(initialTheme)

        // Apply theme to document
        if (initialTheme === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light"
        setTheme(newTheme)
        storageSet("theme", newTheme)

        if (newTheme === "dark") {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.remove("dark")
        }
    }

    return { theme, toggleTheme }
}
