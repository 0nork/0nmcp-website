'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { STATS_DISPLAY } from '@/data/stats'

/* ── Clean light mega-menu — Figma reference ── */

type MenuLink = { label: string; href: string; bold?: boolean }
type MenuSection = {
  label: string
  href?: string
  columns: { title?: string; links: MenuLink[] }[]
  featured?: { title: string; href: string; image?: string }
}

const MENU: Record<string, MenuSection> = {
  product: {
    label: 'Product',
    columns: [
      {
        title: 'Platform',
        links: [
          { label: 'Integrations', href: '/integrations', bold: true },
          { label: 'Turn it 0n', href: '/turn-it-on' },
          { label: 'SXO Audit', href: '/audit' },
          { label: 'Security & Vault', href: '/security' },
          { label: 'Technology', href: '/technology' },
        ],
      },
      {
        title: 'Solutions',
        links: [
          { label: 'Compare', href: '/compare', bold: true },
          { label: 'Marketplace', href: '/marketplace' },
          { label: 'Canvas', href: '/canvas' },
          { label: '.0n Standard', href: '/0n-standard' },
          { label: 'Converter', href: '/convert' },
        ],
      },
    ],
    featured: {
      title: `${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services — ${STATS_DISPLAY.patents} patents pending`,
      href: '/start',
    },
  },
  resources: {
    label: 'Resources',
    columns: [
      {
        title: 'Learn',
        links: [
          { label: 'Blog', href: '/blog', bold: true },
          { label: 'Courses', href: '/learn' },
          { label: 'Glossary', href: '/glossary' },
          { label: 'Examples', href: '/examples' },
        ],
      },
      {
        title: 'Community',
        links: [
          { label: 'Forum', href: '/forum', bold: true },
          { label: 'Community', href: '/community' },
          { label: 'Partners', href: '/partners' },
          { label: 'Sponsor', href: '/sponsor' },
        ],
      },
    ],
    featured: {
      title: 'Free AI website audit — get your SXO score in 5 seconds',
      href: '/audit',
    },
  },
}

type MenuKey = keyof typeof MENU

export default function MegaNav() {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'dynamic'>('light')
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dynamicIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Calculate if it's currently daytime based on approximate sunrise/sunset
  const isDaytime = useCallback((lat?: number, lng?: number) => {
    const now = new Date()
    const hour = now.getHours()
    if (!lat || !lng) {
      // Fallback: 6am-6pm is day
      return hour >= 6 && hour < 18
    }
    // Simple sunrise/sunset approximation
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
    const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81))
    const latRad = lat * Math.PI / 180
    const decRad = declination * Math.PI / 180
    const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad))
    const sunriseHour = 12 - (hourAngle * 180 / Math.PI) / 15
    const sunsetHour = 12 + (hourAngle * 180 / Math.PI) / 15
    const currentHourDecimal = hour + now.getMinutes() / 60
    return currentHourDecimal >= sunriseHour && currentHourDecimal < sunsetHour
  }, [])

  const applyTheme = useCallback((t: 'light' | 'dark') => {
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
    // Smooth transition on theme change
    document.documentElement.style.transition = 'background-color 1.5s ease, color 0.8s ease'
    setTimeout(() => { document.documentElement.style.transition = '' }, 2000)
  }, [])

  // Initialize theme
  useEffect(() => {
    const savedMode = localStorage.getItem('0n-theme-mode') as 'light' | 'dark' | 'dynamic' | null
    const mode = savedMode || 'light'
    setThemeMode(mode)
    if (mode === 'dynamic') {
      applyTheme(isDaytime() ? 'light' : 'dark')
    } else {
      applyTheme(mode)
    }
  }, [applyTheme, isDaytime])

  // Dynamic mode: check every 60s and get geolocation once
  useEffect(() => {
    if (themeMode !== 'dynamic') {
      if (dynamicIntervalRef.current) clearInterval(dynamicIntervalRef.current)
      return
    }
    let lat: number | undefined
    let lng: number | undefined
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { lat = pos.coords.latitude; lng = pos.coords.longitude; applyTheme(isDaytime(lat, lng) ? 'light' : 'dark') },
        () => { applyTheme(isDaytime() ? 'light' : 'dark') }
      )
    }
    dynamicIntervalRef.current = setInterval(() => {
      applyTheme(isDaytime(lat, lng) ? 'light' : 'dark')
    }, 60000)
    return () => { if (dynamicIntervalRef.current) clearInterval(dynamicIntervalRef.current) }
  }, [themeMode, applyTheme, isDaytime])

  const setMode = useCallback((mode: 'light' | 'dark' | 'dynamic') => {
    setThemeMode(mode)
    localStorage.setItem('0n-theme-mode', mode)
    localStorage.setItem('0n-theme', mode === 'dynamic' ? (isDaytime() ? 'light' : 'dark') : mode)
    if (mode === 'dynamic') {
      applyTheme(isDaytime() ? 'light' : 'dark')
    } else {
      applyTheme(mode)
    }
    setThemeMenuOpen(false)
  }, [applyTheme, isDaytime])

  const toggleTheme = useCallback(() => {
    setThemeMenuOpen(prev => !prev)
  }, [])

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    if (!supabase) { setAuthReady(true); return }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email ?? undefined, id: data.user.id } : null)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? undefined, id: session.user.id } : null)
      setAuthReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) { setOpenMenu(null); setThemeMenuOpen(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const enter = (key: MenuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpenMenu(key)
  }
  const leave = () => { timeoutRef.current = setTimeout(() => setOpenMenu(null), 180) }
  const cancelLeave = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }

  const section = openMenu ? MENU[openMenu] : null

  return (
    <nav ref={navRef} className="mn" onMouseLeave={leave}>
      <div className="mn-bar">
        {/* Logo */}
        <Link href="/" className="mn-logo no-underline">
          <Image
            src={theme === 'dark' ? '/brand/0nmcp-logo-white.svg' : '/brand/0nmcp-logo-dark.svg'}
            alt="0nMCP" width={120} height={40}
            style={{ objectFit: 'contain' }} priority
          />
        </Link>

        {/* Desktop links */}
        <div className="mn-links">
          {(Object.keys(MENU) as MenuKey[]).map(key => (
            <button
              key={key}
              className={`mn-trigger${openMenu === key ? ' active' : ''}`}
              onMouseEnter={() => enter(key)}
              onClick={() => setOpenMenu(openMenu === key ? null : key)}
            >
              {MENU[key].label}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mn-chev">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
          <Link href="/audit" className="mn-link no-underline" onMouseEnter={() => { cancelLeave(); setOpenMenu(null) }}>Audit</Link>
          <Link href="/blog" className="mn-link no-underline" onMouseEnter={() => { cancelLeave(); setOpenMenu(null) }}>Blog</Link>
          <Link href="/forum" className="mn-link no-underline" onMouseEnter={() => { cancelLeave(); setOpenMenu(null) }}>Forum</Link>
        </div>

        {/* Right CTAs */}
        <div className="mn-actions" style={authReady ? undefined : { visibility: 'hidden' }}>
          {/* Theme toggle with dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={toggleTheme}
              aria-label="Theme settings"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
                color: 'var(--text-secondary, #64748b)', display: 'flex', alignItems: 'center',
                transition: 'color 0.2s ease',
              }}
            >
              {themeMode === 'dynamic' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/><path d="M20 12.79A9 9 0 0112.21 4" opacity="0.4"/></svg>
              ) : theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              )}
            </button>
            {themeMenuOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '0.5rem', minWidth: 180,
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                animation: 'fadeIn 0.15s ease', zIndex: 100,
              }}>
                {([
                  { mode: 'light' as const, label: 'Light', desc: 'Always light', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg> },
                  { mode: 'dark' as const, label: 'Dark', desc: 'Always dark', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
                  { mode: 'dynamic' as const, label: 'Dynamic', desc: 'Follows sunrise & sunset', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><path d="M16 5l-4 4-4-4" opacity="0.4"/></svg> },
                ]).map(({ mode, label, desc, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setMode(mode)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                      padding: '0.6rem 0.75rem', borderRadius: 8, border: 'none',
                      background: themeMode === mode ? 'rgba(126,217,87,0.1)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                    }}
                  >
                    <div style={{ color: themeMode === mode ? '#7ed957' : 'var(--text-muted)', display: 'flex' }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: themeMode === mode ? '#7ed957' : 'var(--text-primary)' }}>{label}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{desc}</div>
                    </div>
                    {themeMode === mode && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {!user ? (
            <>
              <Link href="/login" className="mn-signin no-underline">Login</Link>
              <Link href="/start" className="mn-cta no-underline">Get Started</Link>
            </>
          ) : (
            <Link href="/dashboard" className="mn-cta no-underline">Dashboard</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="mn-hamburger" onClick={() => { setMobileOpen(!mobileOpen); setOpenMenu(null) }} aria-label="Menu">
          <span className={`mn-burger${mobileOpen ? ' open' : ''}`}><span /><span /><span /></span>
        </button>
      </div>

      {/* Desktop mega dropdown */}
      {section && (
        <div className="mn-dropdown" onMouseEnter={cancelLeave}>
          <div className="mn-dropdown-inner">
            {section.columns.map((col, i) => (
              <div key={i} className="mn-col">
                {col.title && <span className="mn-col-title">{col.title}</span>}
                {col.links.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`mn-item no-underline${link.bold ? ' mn-item-bold' : ''}`}
                    onClick={() => setOpenMenu(null)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            {section.featured && (
              <div className="mn-featured">
                <Link href={section.featured.href} className="mn-featured-card no-underline" onClick={() => setOpenMenu(null)}>
                  <span className="mn-featured-title">{section.featured.title}</span>
                  <span className="mn-featured-arrow">Read more &rarr;</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mn-mobile">
          {Object.values(MENU).map(sec =>
            sec.columns.map((col, i) =>
              col.links.map(link => (
                <Link key={`${i}-${link.label}`} href={link.href} className="mn-mobile-link no-underline" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))
            )
          )}
          <Link href="/#pricing" className="mn-mobile-link no-underline" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/compare" className="mn-mobile-link no-underline" onClick={() => setMobileOpen(false)}>Compare</Link>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!user ? (
              <>
                <Link href="/signup" className="mn-cta no-underline" style={{ textAlign: 'center' }} onClick={() => setMobileOpen(false)}>Request Access</Link>
                <Link href="/login" className="mn-signin no-underline" style={{ textAlign: 'center' }} onClick={() => setMobileOpen(false)}>Login</Link>
              </>
            ) : (
              <Link href="/dashboard" className="mn-cta no-underline" style={{ textAlign: 'center' }} onClick={() => setMobileOpen(false)}>Dashboard</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
