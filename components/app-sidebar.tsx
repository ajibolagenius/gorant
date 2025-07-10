"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { House, TrendingUp, Trophy, Target, Gear, Question, ChartBar, Users, Bell, Heart } from "@phosphor-icons/react"

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
import { Separator } from "@/components/ui/separator"

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: House,
    badge: null,
  },
  {
    title: "Trending",
    url: "/trending",
    icon: TrendingUp,
    badge: "Hot",
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: Trophy,
    badge: null,
  },
  {
    title: "Challenges",
    url: "/challenges",
    icon: Target,
    badge: "3",
  },
]

const secondaryItems = [
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartBar,
  },
  {
    title: "Community",
    url: "/community",
    icon: Users,
  },
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
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Heart size={16} weight="duotone" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Rant</span>
            <span className="truncate text-xs text-muted-foreground">Anonymous Venting</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon size={16} weight="duotone" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>More</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon size={16} weight="duotone" />
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
        <div className="p-4 space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
            <Question size={16} weight="duotone" />
            Help & Support
          </Button>
          <div className="text-xs text-muted-foreground text-center">Version 1.0.0</div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
