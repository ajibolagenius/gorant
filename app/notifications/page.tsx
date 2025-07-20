'use client'

import NotificationList from "@/components/notification-list"
import { Bell } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useNotifications } from "@/hooks/use-notifications"

export default function NotificationsPage() {
    const { unreadCount } = useNotifications()
    return (
        <div className="min-h-screen bg-background dark:bg-background py-8">
            <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto">
                {/* Enhanced Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-none bg-accent p-3">
                            <Bell className="w-7 h-7 text-accent-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-card-foreground">Notifications</h1>
                            <p className="text-muted-foreground text-sm mt-1">Stay updated with your activity</p>
                        </div>
                    </div>
                </div>

                <Separator className="mb-6" />

                {/* Main Content */}
                <div className="bg-white/80 dark:bg-gray-900/80 rounded-none shadow-sm p-6 min-h-[300px]">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid grid-cols-2 mb-4">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="unread">
                                Unread{unreadCount > 0 && <span className="ml-1 font-bold">{unreadCount}</span>}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="all">
                            <NotificationList />
                        </TabsContent>
                        <TabsContent value="unread">
                            <NotificationList unreadOnly />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
