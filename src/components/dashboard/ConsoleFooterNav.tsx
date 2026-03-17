'use client'

/**
 * ConsoleFooterNav — APEX-style bottom tab bar
 *
 * Fixed bottom bar with 6 icon tabs, active state with accent background.
 * Hidden on desktop (md+), shown on mobile as primary nav.
 * On desktop, shown as a sleek dock at the bottom.
 */

import { type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface FooterTab {
  key: string
  label: string
  href: string
  icon: ReactNode
  accent?: boolean // highlighted tab (0nMCP brand)
}

const TABS: FooterTab[] = [
  {
    key: 'console',
    label: 'Overview',
    href: '/console',
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'connectors',
    label: 'Connectors',
    href: '/console?view=connectors',
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
  },
  {
    key: 'crm',
    label: 'CRM',
    href: '/console/crm',
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'mods',
    label: 'MODs',
    href: '/console/mods',
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
      </svg>
    ),
  },
  {
    key: 'builder',
    label: '0nFlow',
    href: '/builder',
    accent: true,
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    key: 'store',
    label: 'Store',
    href: '/console/marketplace',
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5z" />
        <line x1="3" y1="7" x2="21" y2="7" />
        <path d="M16 11a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    key: 'account',
    label: 'Account',
    href: '/console?view=account',
    icon: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
]

export default function ConsoleFooterNav() {
  const pathname = usePathname()

  function isActive(tab: FooterTab) {
    if (tab.key === 'console') return pathname === '/console'
    if (tab.key === 'builder') return pathname === '/builder'
    if (tab.href.includes('?')) return false // view params can't be detected from pathname alone
    return pathname.startsWith(tab.href)
  }

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: 'rgba(8, 10, 16, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        zIndex: 30,
        padding: '0 8px',
      }}
    >
      {TABS.map(tab => {
        const active = isActive(tab)
        return (
          <Link
            key={tab.key}
            href={tab.href}
            style={{
              flex: 1,
              maxWidth: 88,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 0',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            {/* Icon container */}
            <div
              style={{
                width: tab.accent ? 44 : 36,
                height: tab.accent ? 44 : 36,
                borderRadius: tab.accent ? 14 : 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: tab.accent
                  ? '#7ed957'
                  : active
                    ? 'rgba(126, 217, 87, 0.12)'
                    : 'transparent',
                color: tab.accent
                  ? '#080B0F'
                  : active
                    ? '#7ed957'
                    : '#5f6672',
                transition: 'all 0.2s ease',
                marginTop: tab.accent ? -8 : 0,
                boxShadow: tab.accent ? '0 4px 16px rgba(126, 217, 87, 0.3)' : 'none',
              }}
            >
              {tab.icon}
            </div>
            {/* Label */}
            <span
              style={{
                fontSize: 10,
                fontWeight: active || tab.accent ? 700 : 500,
                color: tab.accent
                  ? '#7ed957'
                  : active
                    ? '#7ed957'
                    : '#5f6672',
                letterSpacing: '0.01em',
                transition: 'color 0.2s',
                marginTop: tab.accent ? -2 : 0,
              }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
