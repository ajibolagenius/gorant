import { NotificationList, Notification } from "@/components/notification-list"

const sampleNotifications: Notification[] = [
    {
        id: "1",
        type: "like",
        message: "Someone liked your rant!",
        timestamp: "2m ago",
        read: false,
    },
    {
        id: "2",
        type: "comment",
        message: "New comment on your rant.",
        timestamp: "10m ago",
        read: false,
    },
    {
        id: "3",
        type: "mention",
        message: "You were mentioned in a rant.",
        timestamp: "1h ago",
        read: true,
    },
    {
        id: "4",
        type: "achievement",
        message: "Achievement unlocked: First Rant!",
        timestamp: "1d ago",
        read: true,
    },
]

export default function NotificationsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-8">
            <div className="container mx-auto max-w-2xl px-4">
                <NotificationList initialNotifications={sampleNotifications} />
            </div>
        </div>
    )
}
