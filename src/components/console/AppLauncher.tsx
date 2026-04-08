'use client'

/**
 * AppLauncher — Quick access grid dropdown
 * Icon-first, color-coded circles. Clean, simple, larger.
 * Appears in the console header toolbar.
 */

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface AppItem {
  label: string
  url: string
  icon: string // SVG path data
  color: string // Circle background
  iconColor: string // Icon stroke color
}

const apps: AppItem[] = [
  {
    label: 'Chat',
    url: '/console?view=chat',
    icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
    color: 'rgba(167,139,250,0.15)',
    iconColor: '#a78bfa',
  },
  {
    label: 'Campaigns',
    url: '/console/campaigns',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    color: 'rgba(126,217,87,0.15)',
    iconColor: '#7ed957',
  },
  {
    label: 'Workflows',
    url: '/console/agent-workflows',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'rgba(255,107,53,0.15)',
    iconColor: '#FF6B35',
  },
  {
    label: 'Contacts',
    url: '/console/crm',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    color: 'rgba(244,63,94,0.15)',
    iconColor: '#f43f5e',
  },
  {
    label: 'Integrations',
    url: '/console/integrations',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    color: 'rgba(20,184,166,0.15)',
    iconColor: '#14b8a6',
  },
  {
    label: 'Store',
    url: '/console/marketplace',
    icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    color: 'rgba(245,158,11,0.15)',
    iconColor: '#f59e0b',
  },
  {
    label: '0nCode',
    url: '/console/0ncode',
    icon: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
    color: 'rgba(56,189,248,0.15)',
    iconColor: '#38bdf8',
  },
  {
    label: 'Vault',
    url: '/console?view=vault',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    color: 'rgba(34,197,94,0.15)',
    iconColor: '#22c55e',
  },
  {
    label: 'Theme',
    url: '/console/settings/theme',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    color: 'rgba(139,92,246,0.15)',
    iconColor: '#8b5cf6',
  },
  {
    label: 'Settings',
    url: '/console/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
    color: 'rgba(148,163,184,0.15)',
    iconColor: '#94a3b8',
  },
]

export function AppLauncher() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: open ? 'var(--accent-glow, rgba(126,217,87,0.1))' : 'transparent',
          color: open ? 'var(--accent, #7ed957)' : 'var(--text-muted, #6b7280)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          width: 320, borderRadius: 16, overflow: 'hidden',
          background: 'var(--bg-card, #1f2937)',
          border: '1px solid var(--border, #30363d)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          zIndex: 100,
          animation: 'launcherIn 0.2s ease',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
          }}>
            {apps.map((app, i) => (
              <Link
                key={app.label}
                href={app.url}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: '20px 16px', textDecoration: 'none',
                  borderBottom: i < apps.length - 2 ? '1px solid var(--border, #30363d)' : 'none',
                  borderRight: i % 2 === 0 ? '1px solid var(--border, #30363d)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: app.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${app.color}`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={app.iconColor} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d={app.icon} />
                  </svg>
                </div>
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-primary, #f0f4f8)',
                  fontFamily: 'var(--font-body, sans-serif)',
                }}>
                  {app.label}
                </span>
              </Link>
            ))}
          </div>

          <style>{`
            @keyframes launcherIn {
              from { opacity: 0; transform: translateY(-8px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
