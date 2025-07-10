"use client"

import { useState, useEffect } from "react"
import { generateUUID, generateFriendlyAnonymousName } from "../lib/utils"

interface AnonymousUser {
    id: string
    name: string
}

/**
 * Custom hook to manage and expose a persistent anonymous user ID and friendly name.
 * Stores values in localStorage on first use and reuses them on subsequent visits.
 */
export function useAnonymousUser(): AnonymousUser {
    const [user, setUser] = useState<AnonymousUser>({ id: "", name: "" })

    useEffect(() => {
        let id = localStorage.getItem("anonymous_user_id")
        let name = localStorage.getItem("anonymous_user_name")

        if (!id) {
            id = generateUUID()
            localStorage.setItem("anonymous_user_id", id)
        }
        if (!name) {
            name = generateFriendlyAnonymousName()
            localStorage.setItem("anonymous_user_name", name)
        }
        setUser({ id, name })
    }, [])

    return user
}
