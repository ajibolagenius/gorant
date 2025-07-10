"use client"

import {
  House,
  TrendUp,
  Trophy,
  Zap,
  MagnifyingGlass,
  Bell,
  Gear,
  Shield,
  Users,
  Question,
} from "@phosphor-icons/react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AppSidebarProps {
  userPoints: number
  userLevel: number
  followedTags: Set<string>
  onFollowTag: (tag: string) => void
}

const navigationItems = [
  {
    title: "Feed",
    url: "/",
    icon: House,
  },
  {
    title: "Trending",
    url: "/trending",
    icon: TrendUp,
  },
  {
    title: "Challenges",
    url: "/challenges",
    icon: Trophy,
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Zap,
  },
  {
    title: "Search",
    url: "/search",
    icon: MagnifyingGlass,
  },
]

const accountItems = [
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Gear,
  },
  {
    title: "Privacy",
    url: "/privacy",
    icon: Shield,
  },
]

export function AppSidebar({ userPoints, userLevel, followedTags, onFollowTag }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 dark:border-gray-700">
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2 py-1">
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400">Rant 💭</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon size={20} weight="duotone" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gamification Panel - Collapsed version */}
        <SidebarGroup>
          <SidebarGroupLabel>Progress</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3 p-2">
              <div className="text-center group-data-[collapsible=icon]:hidden">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userPoints}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Points</div>
              </div>
              <div className="text-center group-data-[collapsible=icon]:hidden">
                <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Level {userLevel}</div>
              </div>
              {/* Icon view */}
              <div className="hidden group-data-[collapsible=icon]:block text-center">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                >
                  {userLevel}
                </Badge>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats */}
        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 p-2 group-data-[collapsible=icon]:hidden">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Active Users</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">567</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Today's Rants</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">89</span>
              </div>
            </div>
            {/* Icon view */}
            <div className="hidden group-data-[collapsible=icon]:block text-center p-2">
              <Users size={24} weight="duotone" className="mx-auto text-purple-600 dark:text-purple-400" />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Followed Tags */}
        {followedTags.size > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Following</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="group-data-[collapsible=icon]:hidden">
                <div className="flex flex-wrap gap-1 p-2">
                  {Array.from(followedTags)
                    .slice(0, 5)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50"
                        onClick={() => onFollowTag(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon size={20} weight="duotone" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="group-data-[collapsible=icon]:hidden p-2">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Need Support?</div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent text-xs dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Question size={16} weight="duotone" className="mr-2" />
              Help Center
            </Button>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
