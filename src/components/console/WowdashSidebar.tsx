"use client"

/**
 * WowdashSidebar — 0nMCP Console Navigation
 * Extracted from Wowdash template NavMain pattern.
 * Adapted: react-router-dom → Next.js App Router
 * Brand: #6EE05A accent, #080B0F background
 */

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  Mail,
  Zap,
  Link2,
  Building2,
  Puzzle,
  Shield,
  Layers,
  Palette,
  BarChart3,
  Globe,
  Settings,
  User,
  LogOut,
  CreditCard,
  Key,
  type LucideIcon,
} from "lucide-react"

// ── Navigation Data ──

interface SubItem {
  title: string
  url: string
  circleColor: string
}

interface NavItem {
  title?: string
  url?: string
  icon?: LucideIcon
  items?: SubItem[]
  label?: string
  badge?: string
  badgeColor?: string
}

const navigation: NavItem[] = [
  // ─ Main ─
  {
    title: "Dashboard",
    url: "/console",
    icon: LayoutDashboard,
  },
  {
    title: "Chat",
    url: "/console?view=chat",
    icon: MessageSquare,
    badge: "AI",
    badgeColor: "bg-violet-500",
  },

  // ─ Workspace ─
  { label: "Workspace" },
  {
    title: "Campaigns",
    icon: Mail,
    items: [
      { title: "Campaign Builder", url: "/console/campaigns", circleColor: "bg-primary" },
      { title: "Email Templates", url: "/console/campaigns/templates", circleColor: "bg-yellow-500" },
      { title: "Landing Pages", url: "/console/site-builder", circleColor: "bg-cyan-500" },
    ],
  },
  {
    title: "Workflows",
    url: "/console/agent-workflows",
    icon: Zap,
    badge: "26",
  },
  {
    title: "Integrations",
    url: "/console/integrations",
    icon: Link2,
    badge: "22",
  },

  // ─ CRM ─
  { label: "CRM" },
  {
    title: "My Business",
    icon: Building2,
    items: [
      { title: "Contacts", url: "/console/crm", circleColor: "bg-primary" },
      { title: "Pipeline", url: "/console?view=flows", circleColor: "bg-yellow-500" },
      { title: "Calendar", url: "/console/calendar", circleColor: "bg-cyan-500" },
      { title: "Conversations", url: "/console?view=chat", circleColor: "bg-violet-500" },
    ],
  },

  // ─ Tools ─
  { label: "Tools" },
  {
    title: "Add0ns",
    icon: Puzzle,
    items: [
      { title: "Store", url: "/console/marketplace", circleColor: "bg-primary" },
      { title: "0nCode", url: "/console/0ncode", circleColor: "bg-yellow-500" },
      { title: "Mail Engine", url: "/console/mail", circleColor: "bg-cyan-500" },
      { title: "OnPress", url: "/console/onpress", circleColor: "bg-violet-500" },
      { title: "My Add0ns", url: "/console/orders", circleColor: "bg-red-500" },
    ],
  },
  {
    title: "Vault",
    url: "/console?view=vault",
    icon: Shield,
  },
  {
    title: "Builder",
    url: "/console?view=builder",
    icon: Layers,
  },

  // ─ Design ─
  { label: "Design" },
  {
    title: "Brand",
    icon: Palette,
    items: [
      { title: "0nBrand Generator", url: "/console/brand", circleColor: "bg-primary" },
      { title: "Color Editor", url: "/console/settings/theme", circleColor: "bg-yellow-500" },
      { title: "Style Docs", url: "/console/style-docs", circleColor: "bg-cyan-500" },
    ],
  },

  // ─ 0nExec ─
  { label: "0nExec" },
  {
    title: "Pipeline",
    icon: BarChart3,
    items: [
      { title: "Pipeline Board", url: "/console/exec/pipeline", circleColor: "bg-primary" },
      { title: "Departments", url: "/console/exec/departments", circleColor: "bg-yellow-500" },
      { title: "Flags & Alerts", url: "/console/exec/flags", circleColor: "bg-red-500" },
    ],
  },

  // ─ Analytics ─
  { label: "Analytics" },
  {
    title: "Reports",
    url: "/console?view=reporting",
    icon: BarChart3,
  },
  {
    title: "SEO",
    url: "/console?view=seo",
    icon: Globe,
  },

  // ─ Settings ─
  { label: "Settings" },
  {
    title: "Account",
    icon: Settings,
    items: [
      { title: "Profile", url: "/console?view=account", circleColor: "bg-primary" },
      { title: "Account Info", url: "/console/settings/account", circleColor: "bg-yellow-500" },
      { title: "Notifications", url: "/console/settings/notifications", circleColor: "bg-cyan-500" },
      { title: "API Tokens", url: "/console/settings/tokens", circleColor: "bg-violet-500" },
      { title: "Billing", url: "/console/settings/billing", circleColor: "bg-red-500" },
    ],
  },
]

// ── NavMain Component (Wowdash pattern) ──

function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const handleToggleGroup = (title?: string) => {
    if (!title) return
    setOpenGroup((prev) => (prev === title ? null : title))
  }

  const isDropdownActive = (item: NavItem) => {
    if (!item.items) return false
    return item.items.some(
      (sub) => sub.url && (pathname === sub.url || pathname.startsWith(sub.url.split('?')[0]))
    )
  }

  return (
    <SidebarGroup className="flex flex-col w-full px-4 py-3">
      <SidebarMenu>
        {items.map((item, idx) => {
          // Label
          if (item.label) {
            return (
              <SidebarGroupLabel key={`label-${item.label}-${idx}`}>
                {item.label}
              </SidebarGroupLabel>
            )
          }

          // Dropdown with subitems
          if (item.items && item.items.length > 0 && item.title) {
            const isActiveDropdown = isDropdownActive(item)
            const isOpen = isActiveDropdown || openGroup === item.title

            return (
              <SidebarMenuItem key={item.title}>
                <Collapsible open={isOpen}>
                  <div>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => handleToggleGroup(item.title)}
                        className={cn(
                          "flex items-center py-5.5 px-3 text-base text-[#6B6B6B] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]",
                          isOpen ? "bg-[#1A1A1A] text-[#FFFFFF] border-l-2 border-l-[#6EE05A]" : ""
                        )}
                      >
                        {item.icon && <item.icon className="!w-4.5 !h-4.5" />}
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto mr-1",
                            item.badgeColor || "bg-primary/15 text-primary"
                          )}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={cn(
                          "ms-auto transition-transform duration-200",
                          isOpen ? "rotate-90" : ""
                        )} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub className="mt-2 ms-6 space-y-1">
                        {item.items.map((subItem) => {
                          const isSubActive = pathname === subItem.url ||
                            pathname.startsWith(subItem.url.split('?')[0])

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "py-5.5 px-3 text-base text-[#6B6B6B] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]",
                                  isSubActive ? "bg-[#1A1A1A] font-bold text-[#FFFFFF]" : ""
                                )}
                              >
                                <Link
                                  href={subItem.url}
                                  className="flex items-center gap-3.5"
                                  onClick={() => item.title && setOpenGroup(item.title)}
                                >
                                  <span className={`w-2 h-2 rounded-full ${subItem.circleColor}`} />
                                  <span>{subItem.title}</span>
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

          // Top-level single page
          if (item.url && item.title) {
            const isMenuActive = pathname === item.url ||
              pathname.startsWith(item.url.split('?')[0])

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "flex items-center py-5.5 px-3 text-base text-[#6B6B6B] hover:bg-[#1A1A1A] hover:text-[#FFFFFF]",
                    isMenuActive ? "bg-[#1A1A1A] text-[#FFFFFF] border-l-2 border-l-[#6EE05A]" : ""
                  )}
                  onClick={() => setOpenGroup(null)}
                >
                  <Link href={item.url} className="flex items-center gap-2">
                    {item.icon && <item.icon className="!w-4.5 !h-4.5" />}
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto",
                        item.badgeColor || "bg-primary/15 text-primary"
                      )}>
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

// ── Main Sidebar Export ──

interface WowdashSidebarProps {
  userName?: string
  userEmail?: string
  userPlan?: string
  onSignOut?: () => void
}

export function WowdashSidebar({ userName, userEmail, userPlan, onSignOut }: WowdashSidebarProps) {
  return (
    <Sidebar>
      {/* Header — 0n Brand Logo */}
      <SidebarHeader className="p-0">
        <Link
          href="/console"
          className="h-[72px] py-3.5 flex items-center justify-center border-b border-[#2A2A2A] px-4 gap-3"
        >
          <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-[11px] font-black text-black">0n</span>
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm text-white">0nMCP</span>
            <span className="text-xs text-[#6B6B6B]">Console</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="scrollbar-thin">
        <NavMain items={navigation} />
      </SidebarContent>

      {/* Footer — User Profile */}
      <SidebarFooter className="border-t border-[#2A2A2A] p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="cursor-pointer text-white hover:bg-primary/10">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#1A1A1A]">
                    <User className="size-4 text-[#D4D4D4]" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none text-left group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium truncate text-white">{userName || 'User'}</span>
                    <span className="text-xs text-[#6B6B6B] truncate">{userEmail || ''}</span>
                  </div>
                  {userPlan && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto bg-primary/15 text-primary group-data-[collapsible=icon]:hidden">
                      {userPlan.toUpperCase()}
                    </span>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/console?view=account" className="flex items-center gap-2">
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
                <DropdownMenuItem asChild>
                  <Link href="/console/settings/theme" className="flex items-center gap-2">
                    <Palette className="size-4" /> Theme
                  </Link>
                </DropdownMenuItem>
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
