"use client"
import { useAccessibility } from "@/hooks/use-accessibility"
import React from "react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { fontSize, screenReaderMode } = useAccessibility()
    return (
        <div
            className={fontSize}
            aria-hidden={screenReaderMode ? undefined : false}
            aria-live={screenReaderMode ? "polite" : undefined}
        >
            {children}
        </div>
    )
}
