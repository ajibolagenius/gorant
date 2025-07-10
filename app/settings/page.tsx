"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Bell, Lock, Globe, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useAccessibility } from "@/hooks/use-accessibility"
import { toast } from "sonner"

export default function SettingsPage() {
  const { fontSize, contrast, screenReaderMode, reducedMotion, updateAccessibility } = useAccessibility()
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    mentions: false,
    challenges: true,
    achievements: true,
  })
  const [privacy, setPrivacy] = useState({
    showInLeaderboard: true,
    allowDirectMessages: false,
    shareAnalytics: true,
  })
  const [contentFilters, setContentFilters] = useState({
    hideNegativeSentiment: false,
    hideReportedContent: true,
    minimumModerationScore: 0.7,
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
    toast.success("Notification preferences updated")
  }

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }))
    toast.success("Privacy settings updated")
  }

  const handleContentFilterChange = (key: string, value: boolean | number) => {
    setContentFilters((prev) => ({ ...prev, [key]: value }))
    toast.success("Content filter updated")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                <Shield className="w-8 h-8 mr-3 text-purple-600" />
                Settings & Privacy
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Customize your experience and privacy preferences</p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Feed</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Accessibility Settings */}
          <Card className="shadow-sm border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Accessibility</h2>
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

          {/* Notification Settings */}
          <Card className="shadow-sm border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Notifications</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {key === "likes" && "Get notified when someone likes your rant"}
                      {key === "comments" && "Get notified when someone comments on your rant"}
                      {key === "mentions" && "Get notified when someone mentions you"}
                      {key === "challenges" && "Get notified about new challenges"}
                      {key === "achievements" && "Get notified when you unlock achievements"}
                    </div>
                  </div>
                  <Switch checked={value} onCheckedChange={(checked) => handleNotificationChange(key, checked)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="shadow-sm border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Privacy</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {key === "showInLeaderboard" && "Show in Leaderboard"}
                      {key === "allowDirectMessages" && "Allow Direct Messages"}
                      {key === "shareAnalytics" && "Share Analytics Data"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {key === "showInLeaderboard" && "Display your anonymous ID in public leaderboards"}
                      {key === "allowDirectMessages" && "Allow other users to send you direct messages"}
                      {key === "shareAnalytics" && "Help improve the platform by sharing anonymous usage data"}
                    </div>
                  </div>
                  <Switch checked={value} onCheckedChange={(checked) => handlePrivacyChange(key, checked)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Content Moderation */}
          <Card className="shadow-sm border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Content Filters</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Hide Negative Sentiment</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Automatically hide rants with negative sentiment
                  </div>
                </div>
                <Switch
                  checked={contentFilters.hideNegativeSentiment}
                  onCheckedChange={(checked) => handleContentFilterChange("hideNegativeSentiment", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">Hide Reported Content</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Hide content that has been reported by other users
                  </div>
                </div>
                <Switch
                  checked={contentFilters.hideReportedContent}
                  onCheckedChange={(checked) => handleContentFilterChange("hideReportedContent", checked)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">Moderation Threshold</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Minimum moderation score to show content
                    </div>
                  </div>
                  <Badge variant="outline">{Math.round(contentFilters.minimumModerationScore * 100)}%</Badge>
                </div>
                <Slider
                  value={[contentFilters.minimumModerationScore]}
                  onValueChange={([value]) => handleContentFilterChange("minimumModerationScore", value)}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="shadow-sm border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Account</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start bg-transparent">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                <Button variant="outline" className="justify-start bg-transparent">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Button>
                <Button variant="outline" className="justify-start bg-transparent">
                  <Globe className="w-4 h-4 mr-2" />
                  Terms of Service
                </Button>
                <Button variant="destructive" className="justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pt-6">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
