"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Bell,
    Heart,
    MessageCircle,
    AtSign,
    Trophy,
    Target,
    Trash2,
    Check,
    CheckCheck
} from "lucide-react"
import { useNotifications, notificationHelpers } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

export default function NotificationList() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll
    } = useNotifications()

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return <Heart className="w-4 h-4 text-red-500" />
            case 'comment':
                return <MessageCircle className="w-4 h-4 text-blue-500" />
            case 'mention':
                return <AtSign className="w-4 h-4 text-purple-500" />
            case 'challenge':
                return <Target className="w-4 h-4 text-orange-500" />
            case 'achievement':
                return <Trophy className="w-4 h-4 text-yellow-500" />
            default:
                return <Bell className="w-4 h-4 text-gray-500" />
        }
    }

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'like':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            case 'comment':
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            case 'mention':
                return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
            case 'challenge':
                return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
            case 'achievement':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            default:
                return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-card-foreground">Notifications</h2>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {unreadCount}
                        </Badge>
                    )}
                </div>
                <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-8"
                        >
                            <CheckCheck className="w-4 h-4 mr-1" />
                            Mark all read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAll}
                            className="h-8 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Clear all
                        </Button>
                    )}
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications yet.</p>
                    <p className="text-sm">We'll notify you when something happens!</p>
                </div>
            ) : (
                <ul className="divide-y divide-border">
                    {notifications.map((notification) => (
                        <li
                            key={notification.id}
                            className={`flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 ${!notification.read ? 'bg-muted/30' : ''
                                }`}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-card-foreground">
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => markAsRead(notification.id)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Check className="w-3 h-3" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeNotification(notification.id)}
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
