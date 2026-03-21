'use client'

/**
 * AppShell — Universal wrapper for all app sections
 *
 * Every section (0nEngine, CRM, Store, Affiliates, etc.) uses this
 * identical shell. Only the config changes per app.
 *
 * Pattern from 0nBoard (forum) design:
 * - Header: logo, hamburger, breadcrumb, search, Ask AI, green CTA, Console
 * - Sidebar: logo, green CTA, nav items with counts, back to dashboard
 */

import { useState, useCallback, type ReactNode } from 'react'
import {
  Menu, Search, MessageSquare, ArrowLeft, X,
} from 'lucide-react'

// ── Config types ────────────────────────────────────────────────

export interface AppNavItem {
  key: string
  label: string
  icon: ReactNode
  count?: number
  active?: boolean
}

export interface AppShellConfig {
  /** App name displayed in breadcrumb and search placeholder */
  appName: string
  /** App logo component or image element */
  logo: ReactNode
  /** Green CTA button text */
  ctaLabel: string
  /** Called when CTA is clicked */
  onCta?: () => void
  /** Current breadcrumb path (e.g., "/ Thread" or "/ Contacts") */
  breadcrumb?: string
  /** Sidebar section label (e.g., "GROUPS", "MODULES", "TOOLS") */
  sectionLabel?: string
  /** Nav items for sidebar */
  navItems: AppNavItem[]
  /** Called when nav item is clicked */
  onNav: (key: string) => void
  /** Currently active nav key */
  activeNav?: string
  /** Called when search is submitted */
  onSearch?: (query: string) => void
  /** Called when "Ask AI" is clicked */
  onAskAI?: () => void
  /** Called when "Console" is clicked — default goes to /console */
  onConsole?: () => void
  /** Called when "Back to Dashboard" is clicked */
  onDashboard?: () => void
}

interface AppShellProps {
  config: AppShellConfig
  children: ReactNode
}

// ── Styles ──────────────────────────────────────────────────────

const G = '#7ed957'
const BG = '#0f1419'
const BORDER = 'rgba(255,255,255,0.08)'

// ── Component ───────────────────────────────────────────────────

export function AppShell({ config, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    config.onSearch?.(searchQuery)
  }, [config, searchQuery])

  return (
    <div style={{ display: 'flex', height: '100%', background: BG, color: '#e8e8ef', fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>

      {/* ── SIDEBAR ───────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? '240px' : '0px',
        minWidth: sidebarOpen ? '240px' : '0px',
        background: BG,
        borderRight: `1px solid ${BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 16px 12px', display: 'flex', justifyContent: 'center' }}>
          {config.logo}
        </div>

        {/* Green CTA */}
        <div style={{ padding: '0 12px 16px' }}>
          <button
            onClick={config.onCta}
            style={{
              width: '100%',
              padding: '10px',
              background: G,
              border: 'none',
              borderRadius: '8px',
              color: BG,
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {config.ctaLabel}
          </button>
        </div>

        {/* Section Label */}
        {config.sectionLabel && (
          <div style={{
            padding: '0 16px 8px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#555',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            {config.sectionLabel}
          </div>
        )}

        {/* Nav Items */}
        <nav style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
          {config.navItems.map(item => {
            const isActive = item.active || config.activeNav === item.key
            return (
              <button
                key={item.key}
                onClick={() => config.onNav(item.key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  background: isActive ? 'rgba(126,217,87,0.08)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: isActive ? '#e8e8ef' : '#888',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  marginBottom: '2px',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ color: isActive ? G : '#666', display: 'flex', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.count !== undefined && (
                  <span style={{ fontSize: '11px', color: '#555', fontWeight: 500 }}>
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom: Back to Dashboard */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER}` }}>
          <button
            onClick={config.onDashboard || (() => window.location.href = '/console')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: '4px 0',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#aaa')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── HEADER ────────────────────────────────────── */}
        <header style={{
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 16px',
          borderBottom: `1px solid ${BORDER}`,
          background: BG,
          flexShrink: 0,
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none', border: 'none', color: '#888', cursor: 'pointer',
              padding: '4px', display: 'flex', borderRadius: '4px',
            }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Breadcrumb */}
          <span style={{ fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>
            {config.breadcrumb || `/ ${config.appName}`}
          </span>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '420px', margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${config.appName}...`}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '8px',
                  color: '#e8e8ef',
                  fontSize: '12px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </form>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Ask AI */}
            <button
              onClick={config.onAskAI}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${BORDER}`, borderRadius: '8px',
                color: '#888', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <MessageSquare size={13} /> Ask AI
            </button>

            {/* Green CTA (header) */}
            <button
              onClick={config.onCta}
              style={{
                padding: '6px 14px',
                background: G,
                border: `1px solid ${G}`,
                borderRadius: '8px',
                color: BG,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {config.ctaLabel}
            </button>

            {/* Console */}
            <button
              onClick={config.onConsole || (() => window.location.href = '/console')}
              style={{
                padding: '6px 12px', background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${BORDER}`, borderRadius: '8px',
                color: '#888', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Console
            </button>
          </div>
        </header>

        {/* ── CONTENT ───────────────────────────────────── */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
