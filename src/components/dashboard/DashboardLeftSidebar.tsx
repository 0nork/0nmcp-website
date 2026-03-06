'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { DASHBOARD_SITEMAP } from './dashboard-nav'

export default function DashboardLeftSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Determine which sitemap section to show
  const sectionKey = Object.keys(DASHBOARD_SITEMAP).find(
    (key) => pathname === key || pathname.startsWith(key + '/')
  )
  const links = sectionKey ? DASHBOARD_SITEMAP[sectionKey] : []

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div ref={panelRef} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Collapsed strip */}
      <div
        style={{
          width: 40,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 12,
          borderRight: '1px solid var(--border)',
          background: 'var(--bg-card)',
        }}
      >
        <button
          onClick={() => setOpen((p) => !p)}
          title="Sitemap"
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: open ? 'var(--accent-glow, rgba(126,217,87,0.1))' : 'transparent',
            color: open ? 'var(--accent, #7ed957)' : 'var(--text-muted)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!open) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.color = 'var(--text-secondary)'
            }
          }}
          onMouseLeave={(e) => {
            if (!open) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width={16}
            height={16}
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Flyout panel */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: 0,
          width: 240,
          height: '100%',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          boxShadow: open ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          opacity: open ? 1 : 0,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
          zIndex: 40,
          overflowY: 'auto',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div style={{ padding: '16px 12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Sitemap
        </div>
        <nav style={{ padding: '0 8px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? 'var(--accent-glow, rgba(126,217,87,0.1))' : 'transparent',
                  color: isActive ? 'var(--accent, #7ed957)' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {link.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
