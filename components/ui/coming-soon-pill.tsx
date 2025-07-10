import React from "react"
import { SpinnerGap } from "phosphor-react"

/**
 * A minimal badge indicating a feature is coming soon.
 * Uses a spinner-gap icon with infinite rotation and hashtag pill colors.
 */
export function ComingSoonPill({ className = "" }: { className?: string }) {
    return (
        <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 ${className}`}
            aria-label="Coming soon"
        >
            <SpinnerGap
                weight="duotone"
                className="w-4 h-4 animate-spin"
                style={{ animation: "spin 1s linear infinite" }}
            />
        </span>
    )
}

export default ComingSoonPill;

// Add global style for spin animation if not present
// @layer utilities {
//   @keyframes spin { to { transform: rotate(360deg); } }
//   .animate-spin { animation: spin 1s linear infinite; }
// }
