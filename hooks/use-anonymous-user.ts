"use client"

import { useState, useEffect } from "react"
import { generateUUID, generateFriendlyAnonymousName } from "../lib/utils"
import { storageGet, storageSet } from "@/lib/storage"

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
        let id = storageGet<string>("anonymous_user_id")
        let name = storageGet<string>("anonymous_user_name")

        if (!id) {
            id = generateUUID()
            storageSet("anonymous_user_id", id)
        }
        if (!name) {
            name = generateFriendlyAnonymousName()
            storageSet("anonymous_user_name", name)
        }
        setUser({ id, name })
    }, [])

    return user
}
