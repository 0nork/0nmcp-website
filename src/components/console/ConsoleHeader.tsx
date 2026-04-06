'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CartButton } from '@/components/console/Cart'

interface ConsoleHeaderProps {
  userEmail?: string
  userName?: string
  onMenuToggle: () => void
  onLogout: () => void
}

export default function ConsoleHeader({ userEmail, userName, onMenuToggle, onLogout }: ConsoleHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('0n-theme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('0n-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail?.slice(0, 2).toUpperCase() || '0N'

  useEffect(() => {
    if (!showUserMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showUserMenu])

  const headerBtn: React.CSSProperties = {
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, background: 'none', border: 'none', color: 'var(--text-secondary)',
    cursor: 'pointer', position: 'relative', transition: 'color 0.15s',
  }

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 56, padding: '0 20px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg-header)', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mobile toggle */}
        <button onClick={onMenuToggle} style={{ ...headerBtn, display: 'none' }} className="console-mobile-header">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', minWidth: 200 }}>
          <svg width="14" height="14" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search anything..."
            readOnly
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontFamily: 'inherit', width: 160 }}
          />
          <span style={{ fontSize: '0.625rem', padding: '2px 6px', borderRadius: 4, background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>/</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Theme toggle */}
        <button
          style={headerBtn}
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          )}
        </button>

        {/* Notifications */}
        <button style={headerBtn}>
          <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* Cart */}
        <CartButton />

        {/* Home link */}
        <Link href="/" style={{ ...headerBtn, textDecoration: 'none' }} title="Back to site">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>

        {/* User */}
        <div
          ref={menuRef}
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {userName || userEmail?.split('@')[0] || 'User'}
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Member</div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--accent-glow)',
            color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6875rem', fontWeight: 800,
          }}>
            {initials}
          </div>

          {/* Dropdown */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                width: 220,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 8,
                zIndex: 1050,
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: 4,
                }}
              >
                {userEmail}
              </div>
              <Link
                href="/console?view=account"
                style={{
                  display: 'block',
                  padding: '8px 12px',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  borderRadius: 6,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                onClick={() => setShowUserMenu(false)}
              >
                Account Settings
              </Link>
              <button
                onClick={() => { setShowUserMenu(false); onLogout() }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.8125rem',
                  color: 'var(--color-red)',
                  background: 'none',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
