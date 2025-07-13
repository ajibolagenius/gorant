import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
    id: string
    type: 'like' | 'comment' | 'mention' | 'challenge' | 'achievement'
    title: string
    message: string
    timestamp: number
    read: boolean
    data?: {
        rantId?: string
        userId?: string
        achievementId?: string
        challengeId?: string
    }
}

interface NotificationStore {
    notifications: Notification[]
    unreadCount: number
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    removeNotification: (id: string) => void
    clearAll: () => void
}

export const useNotifications = create<NotificationStore>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,

            addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
                const newNotification: Notification = {
                    ...notification,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now(),
                    read: false,
                }

                set((state: NotificationStore) => ({
                    notifications: [newNotification, ...state.notifications],
                    unreadCount: state.unreadCount + 1,
                }))
            },

            markAsRead: (id: string) => {
                set((state: NotificationStore) => ({
                    notifications: state.notifications.map((n: Notification) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1),
                }))
            },

            markAllAsRead: () => {
                set((state: NotificationStore) => ({
                    notifications: state.notifications.map((n: Notification) => ({ ...n, read: true })),
                    unreadCount: 0,
                }))
            },

            removeNotification: (id: string) => {
                set((state: NotificationStore) => {
                    const notification = state.notifications.find((n: Notification) => n.id === id)
                    return {
                        notifications: state.notifications.filter((n: Notification) => n.id !== id),
                        unreadCount: notification?.read ? state.unreadCount : Math.max(0, state.unreadCount - 1),
                    }
                })
            },

            clearAll: () => {
                set({ notifications: [], unreadCount: 0 })
            },
        }),
        {
            name: 'notifications-storage',
        }
    )
)

// Helper functions for common notification types
export const notificationHelpers = {
    like: (rantId: string, userId: string) => ({
        type: 'like' as const,
        title: 'New Like',
        message: 'Someone liked your rant!',
        data: { rantId, userId },
    }),

    comment: (rantId: string, userId: string) => ({
        type: 'comment' as const,
        title: 'New Comment',
        message: 'Someone commented on your rant!',
        data: { rantId, userId },
    }),

    mention: (rantId: string, userId: string) => ({
        type: 'mention' as const,
        title: 'You were mentioned',
        message: 'Someone mentioned you in a rant!',
        data: { rantId, userId },
    }),

    challenge: (challengeId: string, title: string) => ({
        type: 'challenge' as const,
        title: 'New Challenge',
        message: `New challenge: ${title}`,
        data: { challengeId },
    }),

    achievement: (achievementId: string, title: string) => ({
        type: 'achievement' as const,
        title: 'Achievement Unlocked!',
        message: `You earned: ${title}`,
        data: { achievementId },
    }),
}
