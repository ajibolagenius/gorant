"use client"

import { useState, useEffect } from "react"
import { storageGet, storageSet } from "@/lib/storage"

export function useAccessibility() {
    const [fontSize, setFontSize] = useState("text-base")
    const [contrast, setContrast] = useState("normal")
    const [screenReaderMode, setScreenReaderMode] = useState(false)
    const [reducedMotion, setReducedMotion] = useState(false)

    // Load accessibility preferences
    useEffect(() => {
        const savedFontSize = storageGet<string>("accessibility_font_size")
        const savedContrast = storageGet<string>("accessibility_contrast")
        const savedScreenReader = storageGet<boolean>("accessibility_screen_reader")
        const savedReducedMotion = storageGet<boolean>("accessibility_reduced_motion")

        if (savedFontSize) setFontSize(savedFontSize)
        if (savedContrast) setContrast(savedContrast)
        if (typeof savedScreenReader === "boolean") setScreenReaderMode(savedScreenReader)
        if (typeof savedReducedMotion === "boolean") setReducedMotion(savedReducedMotion)

        // Check for system preferences
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (prefersReducedMotion && typeof savedReducedMotion !== "boolean") {
            setReducedMotion(true)
        }
    }, [])

    // Save accessibility preferences
    useEffect(() => {
        storageSet("accessibility_font_size", fontSize)
        storageSet("accessibility_contrast", contrast)
        storageSet("accessibility_screen_reader", screenReaderMode)
        storageSet("accessibility_reduced_motion", reducedMotion)

        // Apply contrast changes to document
        if (contrast === "high") {
            document.documentElement.classList.add("high-contrast")
        } else {
            document.documentElement.classList.remove("high-contrast")
        }

        // Apply reduced motion
        if (reducedMotion) {
            document.documentElement.classList.add("reduce-motion")
        } else {
            document.documentElement.classList.remove("reduce-motion")
        }
    }, [fontSize, contrast, screenReaderMode, reducedMotion])

    const updateAccessibility = (setting: string, value: any) => {
        switch (setting) {
            case "fontSize":
                setFontSize(value)
                break
            case "contrast":
                setContrast(value)
                break
            case "screenReader":
                setScreenReaderMode(value)
                break
            case "reducedMotion":
                setReducedMotion(value)
                break
        }
    }

    return {
        fontSize,
        contrast,
        screenReaderMode,
        reducedMotion,
        updateAccessibility,
    }
}
