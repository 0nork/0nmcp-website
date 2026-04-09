"use client"

/**
 * WowdashSidebar — 0nMCP Console Navigation
 * Wowdash dark mode tokens ONLY. No custom colors.
 * Active: bg-primary text-white
 * Hover: hover:bg-primary/10 dark:hover:bg-slate-700
 * Text: text-[#b4b4b4] | Active: text-white
 */

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  ChevronRight, LayoutDashboard, MessageSquare, Mail, Zap, Link2,
  Building2, Puzzle, Shield, Layers, Palette, BarChart3, Globe,
  Settings, User, LogOut, CreditCard, Key, type LucideIcon,
} from "lucide-react"

interface SubItem { title: string; url: string; circleColor: string }
interface NavItem {
  title?: string; url?: string; icon?: LucideIcon
  items?: SubItem[]; label?: string; badge?: string; badgeColor?: string
}

const navigation: NavItem[] = [
  { title: "Dashboard", url: "/console", icon: LayoutDashboard },
  { title: "Chat", url: "/console?view=chat", icon: MessageSquare, badge: "AI", badgeColor: "bg-violet-500" },
  { label: "Workspace" },
  { title: "Campaigns", icon: Mail, items: [
    { title: "Campaign Builder", url: "/console/campaigns", circleColor: "bg-primary" },
    { title: "Email Templates", url: "/console/campaigns/templates", circleColor: "bg-yellow-500" },
    { title: "Landing Pages", url: "/console/site-builder", circleColor: "bg-cyan-500" },
  ]},
  { title: "Workflows", url: "/console/agent-workflows", icon: Zap, badge: "26" },
  { title: "Integrations", url: "/console/integrations", icon: Link2, badge: "22" },
  { label: "CRM" },
  { title: "My Business", icon: Building2, items: [
    { title: "Contacts", url: "/console/crm", circleColor: "bg-primary" },
    { title: "Pipeline", url: "/console?view=flows", circleColor: "bg-yellow-500" },
    { title: "Calendar", url: "/console/calendar", circleColor: "bg-cyan-500" },
    { title: "Conversations", url: "/console?view=chat", circleColor: "bg-violet-500" },
  ]},
  { label: "Tools" },
  { title: "Add0ns", icon: Puzzle, items: [
    { title: "Add0n Store", url: "/console/store", circleColor: "bg-primary" },
    { title: "Workflow Library", url: "/console/library", circleColor: "bg-yellow-500" },
    { title: "0nCode", url: "/console/0ncode", circleColor: "bg-cyan-500" },
    { title: "Mail Engine", url: "/console/mail", circleColor: "bg-violet-500" },
  ]},
  { title: "Vault", url: "/console?view=vault", icon: Shield },
  { title: "Builder", url: "/console?view=builder", icon: Layers },
  { label: "Design" },
  { title: "Brand", icon: Palette, items: [
    { title: "0nBrand Generator", url: "/console/brand", circleColor: "bg-primary" },
    { title: "Color Editor", url: "/console/settings/theme", circleColor: "bg-yellow-500" },
    { title: "Style Docs", url: "/console/style-docs", circleColor: "bg-cyan-500" },
  ]},
  { label: "0nExec" },
  { title: "Pipeline", icon: BarChart3, items: [
    { title: "Pipeline Board", url: "/console/exec/pipeline", circleColor: "bg-primary" },
    { title: "Departments", url: "/console/exec/departments", circleColor: "bg-yellow-500" },
    { title: "Flags & Alerts", url: "/console/exec/flags", circleColor: "bg-red-500" },
  ]},
  { label: "Analytics" },
  { title: "Reports", url: "/console?view=reporting", icon: BarChart3 },
  { title: "SEO", url: "/console?view=seo", icon: Globe },
  { label: "Settings" },
  { title: "Account", icon: Settings, items: [
    { title: "Profile", url: "/console?view=account", circleColor: "bg-primary" },
    { title: "Account Info", url: "/console/settings/account", circleColor: "bg-yellow-500" },
    { title: "Notifications", url: "/console/settings/notifications", circleColor: "bg-cyan-500" },
    { title: "API Tokens", url: "/console/settings/tokens", circleColor: "bg-violet-500" },
    { title: "Billing", url: "/console/settings/billing", circleColor: "bg-red-500" },
  ]},
]

function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const isDropdownActive = (item: NavItem) =>
    item.items?.some(sub => pathname === sub.url || pathname.startsWith(sub.url.split('?')[0])) ?? false

  return (
    <SidebarGroup className="flex flex-col w-full px-4 py-3">
      <SidebarMenu>
        {items.map((item, idx) => {
          if (item.label) return <SidebarGroupLabel key={`label-${idx}`}>{item.label}</SidebarGroupLabel>

          if (item.items?.length && item.title) {
            const isActive = isDropdownActive(item)
            const isOpen = isActive || openGroup === item.title
            return (
              <SidebarMenuItem key={item.title}>
                <Collapsible open={isOpen}>
                  <div>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => setOpenGroup(prev => prev === item.title ? null : item.title!)}
                        className={cn(
                          "flex items-center py-5.5 px-3 text-base text-[#b4b4b4] hover:bg-primary/10 hover:text-white",
                          isOpen ? "bg-primary text-white" : ""
                        )}
                      >
                        {item.icon && <item.icon className="!w-4.5 !h-4.5" />}
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-lg ml-auto mr-1", item.badgeColor || "bg-primary/15 text-primary")}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={cn("ms-auto transition-transform duration-200", isOpen ? "rotate-90" : "")} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="mt-2 ms-6 space-y-1">
                        {item.items.map(sub => {
                          const subActive = pathname === sub.url || pathname.startsWith(sub.url.split('?')[0])
                          return (
                            <SidebarMenuSubItem key={sub.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "py-5.5 px-3 text-base text-[#b4b4b4] hover:bg-primary/10 hover:text-white",
                                  subActive ? "bg-primary/10 font-bold text-white" : ""
                                )}
                              >
                                <Link href={sub.url} className="flex items-center gap-3.5" onClick={() => setOpenGroup(item.title!)}>
                                  <span className={`w-2 h-2 rounded-full ${sub.circleColor}`} />
                                  <span>{sub.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </SidebarMenuItem>
            )
          }

          if (item.url && item.title) {
            const active = pathname === item.url || pathname.startsWith(item.url.split('?')[0])
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild tooltip={item.title}
                  className={cn(
                    "flex items-center py-5.5 px-3 text-base text-[#b4b4b4] hover:bg-primary/10 hover:text-white",
                    active ? "bg-primary text-white" : ""
                  )}
                  onClick={() => setOpenGroup(null)}
                >
                  <Link href={item.url} className="flex items-center gap-2">
                    {item.icon && <item.icon className="!w-4.5 !h-4.5" />}
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-lg ml-auto", item.badgeColor || "bg-primary/15 text-primary")}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return null
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

interface WowdashSidebarProps {
  userName?: string; userEmail?: string; userPlan?: string; onSignOut?: () => void
}

export function WowdashSidebar({ userName, userEmail, userPlan, onSignOut }: WowdashSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-0">
        <Link href="/console" className="h-[72px] py-3.5 flex items-center justify-center border-b border-white/10 px-4 gap-3">
          <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-[11px] font-black text-white">0n</span>
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm text-white">0nMCP</span>
            <span className="text-xs text-[#b4b4b4]">Console</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        <NavMain items={navigation} />
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="cursor-pointer text-white hover:bg-primary/10">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-slate-700">
                    <User className="size-4 text-[#b4b4b4]" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none text-left group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium truncate text-white">{userName || 'User'}</span>
                    <span className="text-xs text-[#b4b4b4] truncate">{userEmail || ''}</span>
                  </div>
                  {userPlan && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg ml-auto bg-primary/15 text-primary group-data-[collapsible=icon]:hidden">
                      {userPlan.toUpperCase()}
                    </span>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem asChild><Link href="/console?view=account" className="flex items-center gap-2"><User className="size-4" /> Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/console/settings/account" className="flex items-center gap-2"><Key className="size-4" /> Account Info</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/console/settings/billing" className="flex items-center gap-2"><CreditCard className="size-4" /> Billing</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/console/settings/theme" className="flex items-center gap-2"><Palette className="size-4" /> Theme</Link></DropdownMenuItem>
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
