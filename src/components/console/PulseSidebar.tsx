"use client"

/**
 * PulseSidebar — 0nMCP Console Navigation
 * Organized, optimized, testable. Every tool accessible.
 */

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  MessageSquare, Link2, Building2, Puzzle, Settings,
  User, ChevronRight, LogOut, CreditCard,
  Key, LayoutDashboard, Zap, Mail,
  Palette, Bell, ShoppingBag, Code, FileText,
  BarChart3, Globe, Shield, Briefcase, Users,
  Calendar, PieChart, Search, Layers,
} from "lucide-react"

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  badge?: string
  badgeColor?: string
  items?: { title: string; url: string }[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    label: "",
    items: [
      { title: "Dashboard", url: "/console", icon: <LayoutDashboard className="size-4" /> },
      { title: "Chat", url: "/console?view=chat", icon: <MessageSquare className="size-4" />, badge: "AI", badgeColor: "#a78bfa" },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        title: "Campaigns", url: "/console/campaigns", icon: <Mail className="size-4" />,
        items: [
          { title: "Campaign Builder", url: "/console/campaigns" },
          { title: "Email Templates", url: "/console/campaigns/templates" },
          { title: "Landing Pages", url: "/console/site-builder" },
        ],
      },
      {
        title: "Workflows", url: "/console/agent-workflows", icon: <Zap className="size-4" />, badge: "26",
      },
      {
        title: "Integrations", url: "/console/integrations", icon: <Link2 className="size-4" />, badge: "22",
      },
    ],
  },
  {
    label: "CRM",
    items: [
      {
        title: "My Business", url: "/console/crm", icon: <Building2 className="size-4" />,
        items: [
          { title: "Contacts", url: "/console/crm" },
          { title: "Pipeline", url: "/console?view=flows" },
          { title: "Calendar", url: "/console/calendar" },
          { title: "Conversations", url: "/console?view=chat" },
        ],
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        title: "Add0ns", url: "/console/marketplace", icon: <Puzzle className="size-4" />,
        items: [
          { title: "Store", url: "/console/marketplace" },
          { title: "0nCode", url: "/console/0ncode" },
          { title: "Mail Engine", url: "/console/mail" },
          { title: "OnPress", url: "/console/onpress" },
          { title: "My Add0ns", url: "/console/orders" },
        ],
      },
      { title: "Vault", url: "/console?view=vault", icon: <Shield className="size-4" /> },
      { title: "Builder", url: "/console?view=builder", icon: <Layers className="size-4" /> },
    ],
  },
  {
    label: "Design",
    items: [
      {
        title: "Theme", url: "/console/settings/theme", icon: <Palette className="size-4" />,
        items: [
          { title: "Color Editor", url: "/console/settings/theme" },
          { title: "Admin Demo", url: "/console/admin-setup" },
        ],
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Reports", url: "/console?view=reporting", icon: <BarChart3 className="size-4" /> },
      { title: "SEO", url: "/console?view=seo", icon: <Globe className="size-4" /> },
    ],
  },
]

const settingsNav: NavGroup = {
  label: "Settings",
  items: [
    {
      title: "Account", url: "/console/settings", icon: <Settings className="size-4" />,
      items: [
        { title: "Profile", url: "/console?view=account" },
        { title: "Account Info", url: "/console/settings/account" },
        { title: "Notifications", url: "/console/settings/notifications" },
        { title: "API Tokens", url: "/console/settings/tokens" },
        { title: "Billing", url: "/console/settings/billing" },
      ],
    },
  ],
}

interface PulseSidebarProps {
  userName?: string
  userEmail?: string
  userPlan?: string
  onSignOut?: () => void
}

function NavItemComponent({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive = pathname === item.url || pathname === item.url.split('?')[0]
  const hasChildren = item.items && item.items.length > 0
  const isChildActive = hasChildren && item.items!.some(sub => pathname === sub.url || pathname.startsWith(sub.url.split('?')[0]))

  if (hasChildren) {
    return (
      <Collapsible defaultOpen={isChildActive}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              {item.icon}
              <span>{item.title}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.5625rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4, marginLeft: 'auto', marginRight: 4,
                  background: `${item.badgeColor || 'var(--accent)'}15`,
                  color: item.badgeColor || 'var(--accent)',
                }}>{item.badge}</span>
              )}
              <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenu className="pl-6 mt-0.5 border-l border-sidebar-border ml-3.5">
              {item.items!.map(sub => (
                <SidebarMenuItem key={sub.title}>
                  <SidebarMenuButton asChild isActive={pathname === sub.url || pathname.startsWith(sub.url.split('?')[0])} size="sm">
                    <Link href={sub.url}><span>{sub.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
        <Link href={item.url}>
          {item.icon}
          <span>{item.title}</span>
          {item.badge && (
            <span style={{
              fontSize: '0.5625rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4, marginLeft: 'auto',
              background: `${item.badgeColor || 'var(--accent)'}15`,
              color: item.badgeColor || 'var(--accent)',
            }}>{item.badge}</span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
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
                  style={{ background: 'linear-gradient(135deg, var(--accent, #7ed957), var(--color-teal, #00C2C7))' }}>
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
        {/* Main Navigation Groups */}
        {navigation.map((group, gi) => (
          <SidebarGroup key={gi}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => (
                  <NavItemComponent key={item.title} item={item} pathname={pathname} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>{settingsNav.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNav.items.map(item => (
                <NavItemComponent key={item.title} item={item} pathname={pathname} />
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
                {userPlan && (
                  <>
                    <div className="px-2 py-1.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ background: 'rgba(126,217,87,0.12)', color: 'var(--accent, #7ed957)' }}>
                        {userPlan.toUpperCase()}
                      </span>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
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
