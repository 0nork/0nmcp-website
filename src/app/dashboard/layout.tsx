'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import '@/app/jampack.css'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Extensions',
    href: '/dashboard/downloads',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    label: 'Courses',
    href: '/learn',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/console/account')
      .then(r => {
        if (!r.ok) { router.push('/login'); return null }
        return r.json()
      })
      .then(data => {
        if (data) {
          setUserName(data.full_name || '')
          setUserEmail(data.email || '')
          setLoading(false)
        }
      })
      .catch(() => router.push('/login'))
  }, [router])

  async function handleLogout() {
    try {
      const supabase = createSupabaseBrowser()
      if (supabase) await supabase.auth.signOut()
    } catch { /* ignore */ }
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } catch { /* ignore */ }
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--jp-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '2px solid var(--jp-border)',
          borderTopColor: 'var(--jp-green)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div className="jp-wrapper" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      {/* ── SIDEBAR ── */}
      <aside className={`jp-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="jp-sidebar-header">
          <Link href="/" className="jp-sidebar-brand" style={{ textDecoration: 'none' }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#7ed957" strokeWidth="2" />
              <circle cx="16" cy="16" r="6" fill="#7ed957" />
            </svg>
            0nMCP
          </Link>
          <button
            className="jp-sidebar-toggle"
            onClick={() => setSidebarOpen(false)}
            style={{ display: sidebarOpen ? 'flex' : undefined }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="jp-sidebar-body">
          <div className="jp-menu-group">
            <div className="jp-menu-group-label">Menu</div>
            {NAV_ITEMS.map(item => {
              const isActive = item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`jp-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="jp-nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="jp-sidebar-footer">
          <div className="jp-sidebar-footer-label">{userEmail}</div>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--jp-text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: '4px 0',
              fontFamily: 'inherit',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="jp-main">
        <header className="jp-header">
          <div className="jp-header-start">
            <button
              className="jp-header-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              style={{ display: undefined }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--jp-text)',
              margin: 0,
            }}>
              {NAV_ITEMS.find(i => pathname === '/dashboard' ? i.href === '/dashboard' : pathname.startsWith(i.href))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="jp-header-end">
            <span style={{
              fontSize: '0.8125rem',
              color: 'var(--jp-text-secondary)',
            }}>
              {userName || userEmail}
            </span>
          </div>
        </header>

        <main className="jp-content" style={{ overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1030,
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .jp-sidebar { transform: translateX(-100%); }
          .jp-sidebar.open { transform: translateX(0); z-index: 1040; }
          .jp-sidebar-toggle { display: flex !important; }
          .jp-header-mobile-toggle { display: flex !important; }
          .jp-main { margin-left: 0 !important; }
        }
        @media (min-width: 769px) {
          .jp-main { margin-left: var(--jp-sidebar-width); }
          .jp-header-mobile-toggle { display: none !important; }
        }
      `}</style>
    </div>
  )
}
