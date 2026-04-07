"use client"

/**
 * PulseSidebar — 0nMCP Console Sidebar (Pulse UI Pro style)
 *
 * Navigation: Chat, Integrations, My Business, Add0ns, Account Settings
 * OnCORE V2.0 color scheme, ShadCN Sidebar component
 */

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MessageSquare, Link2, Building2, Puzzle, Settings,
  Bell, User, ChevronRight, LogOut, CreditCard,
  Shield, Key, Plug, LayoutDashboard, Search, Zap,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  badge?: string
  items?: { title: string; url: string }[]
}

const mainNav: NavItem[] = [
  {
    title: "Dashboard",
    url: "/console",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    title: "Chat",
    url: "/console?view=chat",
    icon: <MessageSquare className="size-4" />,
    badge: "AI",
  },
  {
    title: "Integrations",
    url: "/console/integrations",
    icon: <Link2 className="size-4" />,
    badge: "22",
  },
  {
    title: "Workflows",
    url: "/console/agent-workflows",
    icon: <Zap className="size-4" />,
    badge: "22",
  },
  {
    title: "My Business",
    url: "/console/my-business",
    icon: <Building2 className="size-4" />,
    items: [
      { title: "Overview", url: "/console/my-business" },
      { title: "Contacts", url: "/console/crm" },
      { title: "Pipeline", url: "/console/pipeline" },
      { title: "Calendar", url: "/console/calendar" },
    ],
  },
  {
    title: "Add0ns",
    url: "/console/marketplace",
    icon: <Puzzle className="size-4" />,
    items: [
      { title: "Browse Store", url: "/console/marketplace" },
      { title: "0nCode", url: "/console/0ncode" },
      { title: "Mail Engine", url: "/console/mail" },
      { title: "OnPress", url: "/console/onpress" },
      { title: "My Add0ns", url: "/console/orders" },
    ],
  },
]

const settingsNav: NavItem[] = [
  {
    title: "Account Settings",
    url: "/console/settings",
    icon: <Settings className="size-4" />,
    items: [
      { title: "Profile", url: "/console/settings/profile" },
      { title: "Account Info", url: "/console/settings/account" },
      { title: "Notifications", url: "/console/settings/notifications" },
      { title: "API Tokens", url: "/console/settings/tokens" },
      { title: "Billing", url: "/console/settings/billing" },
    ],
  },
]

interface PulseSidebarProps {
  userName?: string
  userEmail?: string
  userPlan?: string
  onSignOut?: () => void
}

export function PulseSidebar({ userName, userEmail, userPlan, onSignOut }: PulseSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Header — 0n Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/console">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #7ed957, #00C2C7)' }}>
                  <span className="text-[10px] font-black text-black">0n</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold text-sm">0nMCP</span>
                  <span className="text-xs text-muted-foreground">Console</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                item.items ? (
                  <Collapsible key={item.title} defaultOpen={pathname.startsWith(item.url.split('?')[0])}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenu className="pl-6 mt-1">
                          {item.items.map((sub) => (
                            <SidebarMenuItem key={sub.title}>
                              <SidebarMenuButton asChild isActive={pathname === sub.url}>
                                <Link href={sub.url}>
                                  <span>{sub.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}
                      isActive={pathname === item.url || pathname === item.url.split('?')[0]}>
                      <Link href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{
                              background: item.badge === 'AI' ? 'rgba(167,139,250,0.15)' : 'rgba(126,217,87,0.12)',
                              color: item.badge === 'AI' ? '#a78bfa' : '#7ed957',
                            }}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNav.map((item) => (
                <Collapsible key={item.title} defaultOpen={pathname.startsWith('/console/settings')}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu className="pl-6 mt-1">
                        {item.items?.map((sub) => (
                          <SidebarMenuItem key={sub.title}>
                            <SidebarMenuButton asChild isActive={pathname === sub.url}>
                              <Link href={sub.url}>
                                <span>{sub.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — User Profile */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="cursor-pointer">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                    <User className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="text-sm font-medium truncate">{userName || 'User'}</span>
                    <span className="text-xs text-muted-foreground truncate">{userEmail || ''}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/console/settings/profile" className="flex items-center gap-2">
                    <User className="size-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/console/settings/account" className="flex items-center gap-2">
                    <Key className="size-4" /> Account Info
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/console/settings/billing" className="flex items-center gap-2">
                    <CreditCard className="size-4" /> Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {userPlan && (
                  <div className="px-2 py-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ background: 'rgba(126,217,87,0.12)', color: '#7ed957' }}>
                      {userPlan.toUpperCase()}
                    </span>
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-red-400 cursor-pointer">
                  <LogOut className="size-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
