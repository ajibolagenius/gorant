import React from "react"
import { HourglassHigh } from "phosphor-react"

/**
 * A pill badge indicating a feature is coming soon.
 * Uses the design system's accent color and a clock/hourglass icon.
 */
export function ComingSoonPill({ className = "" }: { className?: string }) {
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 shadow ${className}`}
            aria-label="Coming soon"
        >
            <HourglassHigh weight="duotone" className="w-4 h-4 mr-1" />
            Coming Soon
        </span>
    )
}

export default ComingSoonPill;
