'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

interface ConsoleSidebarProps {
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
}

interface SubNavItem {
  name: string
  href: string
}

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: string
  badgeCyan?: string
  children?: SubNavItem[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: '',
    items: [
      {
        name: 'Dashboard',
        href: '/console',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zm10-3a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Workspace',
    items: [
      {
        name: 'Mail',
        href: '/console/mail',
        badgeCyan: 'NEW',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        children: [
          { name: 'Dashboard', href: '/console/mail' },
          { name: 'Inboxes', href: '/console/mail/inboxes' },
          { name: 'Sequences', href: '/console/mail/sequences' },
          { name: 'Campaigns', href: '/console/mail/campaigns' },
          { name: 'Deliverability', href: '/console/mail/deliverability' },
          { name: 'Replies', href: '/console/mail/replies' },
          { name: 'Analytics', href: '/console/mail/analytics' },
          { name: 'Settings', href: '/console/mail/settings' },
        ],
      },
      {
        name: 'Vault',
        href: '/console/vault',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        ),
      },
      {
        name: 'Builder',
        href: '/console/workflows',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        ),
        children: [
          { name: 'Workflow Builder', href: '/console/workflows' },
          { name: 'Generator', href: '/console/workflow-generator' },
          { name: 'Site Builder', href: '/console/site-builder' },
        ],
      },
      {
        name: 'OnPress',
        href: '/console/onpress',
        badgeCyan: 'NEW',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        ),
        children: [
          { name: 'Projects', href: '/console/onpress' },
          { name: 'New Project', href: '/console/onpress/new' },
        ],
      },
      {
        name: 'Store',
        href: '/console/marketplace',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
        children: [
          { name: 'Browse', href: '/console/marketplace' },
          { name: 'Orders', href: '/console/orders' },
        ],
      },
      {
        name: 'AI Employee',
        href: '/console/ai-employee',
        badgeCyan: 'AI',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        name: 'Sync',
        href: '/console/sync',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        name: 'Social',
        href: '/console/social',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        ),
      },
      {
        name: 'LinkedIn',
        href: '/console/linkedin',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        ),
      },
      {
        name: 'Operations',
        href: '/console/operations',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
      {
        name: 'Reporting',
        href: '/console/reporting',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Tools',
    items: [
      {
        name: 'CRM',
        href: '/console/crm',
        badge: '245',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        name: 'Terminal',
        href: '/console/terminal',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        name: 'Tools',
        href: '/console/tools',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
        children: [
          { name: 'All Tools', href: '/console/tools' },
          { name: 'AI Training', href: '/console/tools/ai-training' },
          { name: 'QR Code', href: '/console/tools/qr-code' },
          { name: 'Email Signature', href: '/console/tools/email-signature' },
        ],
      },
      {
        name: 'Convert',
        href: '/console/convert',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
      },
      {
        name: 'Migrate',
        href: '/console/migrate',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Community',
    items: [
      {
        name: 'Forum',
        href: '/forum',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        ),
      },
      {
        name: 'Crew',
        href: '/console/crew',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        name: 'Learning',
        href: '/console/learn',
        badgeCyan: 'AI',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
        children: [
          { name: 'Browse Courses', href: '/console/learn' },
          { name: 'Course Generator', href: '/console/courses/generate' },
        ],
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        name: 'Pricing',
        href: '/console/pricing',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        name: 'Mods',
        href: '/console/mods',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        ),
      },
      {
        name: 'Code',
        href: '/console/code',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        ),
      },
    ],
  },
]

const adminItem: NavItem = {
  name: 'Admin',
  href: '/admin',
  badge: 'ADMIN',
  icon: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
}

export default function ConsoleSidebar({ isOpen, onClose, isAdmin }: ConsoleSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const isChildActive = (children?: SubNavItem[]) => {
    if (!children) return false
    return children.some(child => pathname === child.href || pathname.startsWith(child.href + '/'))
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`console-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`console-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="console-sidebar-header">
          <Link href="/console" className="console-sidebar-brand" onClick={onClose}>
            <img src="/brand/0n-logo-white.svg" alt="0nMCP" style={{ height: 28, objectFit: 'contain' }} />
          </Link>
        </div>

        {/* Nav */}
        <div className="console-sidebar-body">
          {navGroups.map((group, gi) => {
            const items = group.label === 'Account' && isAdmin
              ? [...group.items, adminItem]
              : group.items
            return (
              <div className="console-menu-group" key={gi}>
                {group.label && (
                  <div className="console-menu-group-label">{group.label}</div>
                )}
                {items.map((item) => {
                  const hasChildren = item.children && item.children.length > 0
                  const isExpanded = expandedItems.has(item.name) || isChildActive(item.children)
                  const isActive = hasChildren
                    ? false
                    : item.href === '/console'
                      ? pathname === '/console'
                      : pathname.startsWith(item.href)

                  return (
                    <div key={item.href}>
                      {hasChildren ? (
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className={`console-nav-item console-nav-parent ${isChildActive(item.children) ? 'active' : ''}`}
                        >
                          <span className="console-nav-icon">{item.icon}</span>
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="console-nav-badge">{item.badge}</span>
                          )}
                          {item.badgeCyan && (
                            <span className="console-nav-badge cyan">{item.badgeCyan}</span>
                          )}
                          <span className={`console-submenu-indicator ${isExpanded ? 'expanded' : ''}`}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4.5 3L7.5 6L4.5 9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`console-nav-item ${isActive ? 'active' : ''}`}
                        >
                          <span className="console-nav-icon">{item.icon}</span>
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="console-nav-badge">{item.badge}</span>
                          )}
                          {item.badgeCyan && (
                            <span className="console-nav-badge cyan">{item.badgeCyan}</span>
                          )}
                        </Link>
                      )}

                      {/* Sub-menu */}
                      {hasChildren && (
                        <div className={`console-submenu ${isExpanded ? 'open' : ''}`}>
                          {item.children!.map((child) => {
                            const isSubActive = pathname === child.href
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onClose}
                                className={`console-submenu-item ${isSubActive ? 'active' : ''}`}
                              >
                                {child.name}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="console-sidebar-footer">
          <div className="console-sidebar-footer-label">Powered by</div>
          <div className="console-sidebar-footer-value">
            <span className="console-sidebar-footer-dot" />
            0nMCP v2.5.0
          </div>
        </div>
      </aside>
    </>
  )
}
