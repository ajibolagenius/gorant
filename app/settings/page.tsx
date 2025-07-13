"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Bell, Lock, Globe, Download } from "phosphor-react"
import { Filter } from "lucide-react"
import Link from "next/link"
import { useAccessibility } from "@/hooks/use-accessibility"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSettings } from "@/hooks/use-settings"
import { AudioSettings } from "@/components/audio-settings"
import { Separator } from "@/components/ui/separator"
import { useNotifications, notificationHelpers } from "@/hooks/use-notifications"

export default function SettingsPage() {
    const { fontSize, contrast, screenReaderMode, reducedMotion, updateAccessibility } = useAccessibility()
    const {
        notifications,
        privacy,
        contentFilters,
        updateNotification,
        updatePrivacy,
        updateContentFilter
    } = useSettings()
    const { addNotification } = useNotifications()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const router = useRouter()

    // Privacy state
    const [privateAccount, setPrivateAccount] = useState(false)
    const [hideFromSearch, setHideFromSearch] = useState(false)
    const [allowMentions, setAllowMentions] = useState(true)
    // Content filter state
    const [hideSensitive, setHideSensitive] = useState(false)
    const [filterNegative, setFilterNegative] = useState(false)
    const [blockedKeywords, setBlockedKeywords] = useState("")

    // Load from localStorage
    useEffect(() => {
        setPrivateAccount(localStorage.getItem("privateAccount") === "true")
        setHideFromSearch(localStorage.getItem("hideFromSearch") === "true")
        setAllowMentions(localStorage.getItem("allowMentions") !== "false")
        setHideSensitive(localStorage.getItem("hideSensitive") === "true")
        setFilterNegative(localStorage.getItem("filterNegative") === "true")
        setBlockedKeywords(localStorage.getItem("blockedKeywords") || "")
    }, [])
    // Save to localStorage
    useEffect(() => {
        localStorage.setItem("privateAccount", privateAccount.toString())
    }, [privateAccount])
    useEffect(() => {
        localStorage.setItem("hideFromSearch", hideFromSearch.toString())
    }, [hideFromSearch])
    useEffect(() => {
        localStorage.setItem("allowMentions", allowMentions.toString())
    }, [allowMentions])
    useEffect(() => {
        localStorage.setItem("hideSensitive", hideSensitive.toString())
    }, [hideSensitive])
    useEffect(() => {
        localStorage.setItem("filterNegative", filterNegative.toString())
    }, [filterNegative])
    useEffect(() => {
        localStorage.setItem("blockedKeywords", blockedKeywords)
    }, [blockedKeywords])

    // Handler wrappers for switches
    const handleNotificationChange = (key: string, value: boolean) => updateNotification(key as any, value)
    const handlePrivacyChange = (key: string, value: boolean) => updatePrivacy(key as any, value)
    const handleContentFilterChange = (key: string, value: boolean | number) => {
        if (key === "minimumModerationScore") {
            updateContentFilter(key as any, value as number)
        } else {
            updateContentFilter(key as any, value as boolean)
        }
    }

    // Save All Settings button handler
    const handleSaveAll = () => {
        toast.success("All settings saved!")
    }

    // Delete Account handler
    const handleDeleteAccount = () => {
        setShowDeleteDialog(true)
    }
    const confirmDeleteAccount = () => {
        localStorage.clear()
        setShowDeleteDialog(false)
        toast.success("Your account and data have been deleted.")
        setTimeout(() => router.push("/"), 1000)
    }

    const testNotifications = () => {
        // Test different notification types
        addNotification(notificationHelpers.like("test-rant-1", "demo-user"))
        setTimeout(() => addNotification(notificationHelpers.comment("test-rant-2", "demo-user")), 500)
        setTimeout(() => addNotification(notificationHelpers.mention("test-rant-3", "demo-user")), 1000)
        setTimeout(() => addNotification(notificationHelpers.challenge("test-challenge", "Daily Rant Challenge")), 1500)
        setTimeout(() => addNotification(notificationHelpers.achievement("test-achievement", "First Rant")), 2000)
    }

    return (
        <div className="min-h-screen bg-background dark:bg-background py-8">
            <div className="container mx-auto w-full max-w-full px-4 mb-safe-bottom wrap-screen overflow-x-auto">
                {/* Enhanced Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                            <Shield weight="duotone" className="w-7 h-7 text-purple-600 dark:text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                Settings & Privacy
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Customize your experience and privacy preferences</p>
                        </div>
                    </div>
                </div>
                <Separator className="mb-6" />
                {/* Main Content */}
                <div className="space-y-6">
                    {/* Accessibility Settings */}
                    <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Eye weight="duotone" className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-card-foreground">Accessibility</h2>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
                                    <Select value={fontSize} onValueChange={(value) => updateAccessibility("fontSize", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text-sm">Small</SelectItem>
                                            <SelectItem value="text-base">Normal</SelectItem>
                                            <SelectItem value="text-lg">Large</SelectItem>
                                            <SelectItem value="text-xl">Extra Large</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contrast</label>
                                    <Select value={contrast} onValueChange={(value) => updateAccessibility("contrast", value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="high">High Contrast</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-800 dark:text-white">Screen Reader Mode</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        Enhanced compatibility with screen readers
                                    </div>
                                </div>
                                <Switch
                                    checked={screenReaderMode}
                                    onCheckedChange={(checked) => updateAccessibility("screenReader", checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-800 dark:text-white">Reduced Motion</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300">Minimize animations and transitions</div>
                                </div>
                                <Switch
                                    checked={reducedMotion}
                                    onCheckedChange={(checked) => updateAccessibility("reducedMotion", checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audio Settings */}
                    <AudioSettings />

                    {/* Notification Settings */}
                    <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Bell weight="duotone" className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold text-card-foreground">Notifications</h2>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-card-foreground">Push Notifications</h4>
                                        <p className="text-sm text-muted-foreground">Receive notifications for likes, comments, and mentions</p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-card-foreground">Achievement Alerts</h4>
                                        <p className="text-sm text-muted-foreground">Notify when you unlock achievements</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-card-foreground">Challenge Updates</h4>
                                        <p className="text-sm text-muted-foreground">Get notified about new challenges</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-medium text-card-foreground mb-3">Test Notifications</h4>
                                <Button onClick={testNotifications} variant="outline" className="w-full">
                                    <Bell className="w-4 h-4 mr-2" />
                                    Send Test Notifications
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                    This will send sample notifications to test the system
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Privacy Section */}
                    <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Lock className="w-5 h-5 text-purple-600" />
                                <CardTitle>Privacy</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-card-foreground">Private Account</h4>
                                    <p className="text-sm text-muted-foreground">Only approved followers can see your rants and profile.</p>
                                </div>
                                <Switch checked={privateAccount} onCheckedChange={setPrivateAccount} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-card-foreground">Hide from Search</h4>
                                    <p className="text-sm text-muted-foreground">Prevent your profile from appearing in search results.</p>
                                </div>
                                <Switch checked={hideFromSearch} onCheckedChange={setHideFromSearch} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-card-foreground">Allow Mentions</h4>
                                    <p className="text-sm text-muted-foreground">Allow others to mention you in rants and comments.</p>
                                </div>
                                <Switch checked={allowMentions} onCheckedChange={setAllowMentions} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Filters Section */}
                    <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Filter className="w-5 h-5 text-orange-600" />
                                <CardTitle>Content Filters</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-card-foreground">Hide Sensitive Content</h4>
                                    <p className="text-sm text-muted-foreground">Blur or hide posts flagged as sensitive or NSFW.</p>
                                </div>
                                <Switch checked={hideSensitive} onCheckedChange={setHideSensitive} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-card-foreground">Filter Negative Language</h4>
                                    <p className="text-sm text-muted-foreground">Reduce exposure to negative or toxic language.</p>
                                </div>
                                <Switch checked={filterNegative} onCheckedChange={setFilterNegative} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-card-foreground">Blocked Keywords/Tags</h4>
                                    <p className="text-sm text-muted-foreground">Hide posts containing these keywords or tags (comma separated).</p>
                                </div>
                            </div>
                            <input
                                type="text"
                                className="w-full mt-1 rounded border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="e.g. politics, spoilers, nsfw"
                                value={blockedKeywords}
                                onChange={e => setBlockedKeywords(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    {/* Account Management */}
                    <Card className="shadow-sm border-0 bg-card/80 dark:bg-card/80 backdrop-blur">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Globe weight="duotone" className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-xl font-semibold text-card-foreground">Account</h2>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <Button variant="outline" asChild>
                                    <Link href="/privacy">Privacy Policy</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/terms-of-service">Terms of Service</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/guidelines">Community Guidelines</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <a
                                        href="https://stats.uptimerobot.com/MfSyiPnv5E/800934564"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-full h-full text-green-600"
                                    >
                                        <span className="relative flex h-3 w-3 mr-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                                        </span>
                                        Uptime status
                                    </a>
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save All Settings Button */}
                    <div className="flex justify-center pt-4">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 rounded" onClick={handleSaveAll}>
                            Save All Settings
                        </Button>
                    </div>
                </div>
            </div>
            {/* Delete Account Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40">
                    <div className="bg-card dark:bg-card rounded-lg shadow-lg p-8 max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Delete Account</h3>
                        <p className="mb-6 text-muted-foreground">Are you sure you want to delete your account and all associated data? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={confirmDeleteAccount}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
