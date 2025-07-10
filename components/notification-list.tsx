"use client"
import { useState } from "react"
import { Bell, ChatCircle, Star, UserCircle, XCircle } from "phosphor-react"
import { Button } from "@/components/ui/button"

export interface Notification {
    id: string
    type: "like" | "comment" | "mention" | "achievement"
    message: string
    timestamp: string
    read: boolean
}

const ICONS = {
    like: <Star size={20} weight="duotone" className="text-yellow-500" />,
    comment: <ChatCircle size={20} weight="duotone" className="text-blue-500" />,
    mention: <UserCircle size={20} weight="duotone" className="text-purple-500" />,
    achievement: <Star size={20} weight="duotone" className="text-green-500" />,
}

export function NotificationList({
    initialNotifications = [],
}: {
    initialNotifications?: Notification[]
}) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

    const markAsRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    }

    const clearAll = () => {
        setNotifications([])
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500 flex items-center gap-1">
                    <XCircle size={16} weight="duotone" /> Clear All
                </Button>
            </div>
            {notifications.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No notifications yet.</div>
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((n) => (
                        <li
                            key={n.id}
                            className={`flex items-center gap-3 py-3 px-2 rounded transition bg-white dark:bg-gray-800 ${n.read ? "opacity-60" : "bg-yellow-50 dark:bg-yellow-900/20"}`}
                        >
                            <span>{ICONS[n.type]}</span>
                            <div className="flex-1">
                                <div className="text-sm font-medium">{n.message}</div>
                                <div className="text-xs text-gray-400">{n.timestamp}</div>
                            </div>
                            {!n.read && (
                                <Button variant="outline" size="xs" onClick={() => markAsRead(n.id)}>
                                    Mark as read
                                </Button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
