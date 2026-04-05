'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/user-context'
import { UserProvider } from '@/lib/user-context'
import { STATS, STATS_DISPLAY } from '@/data/stats'

/* ─── Types ────────────────────────────────────────────────────── */

interface DashboardData {
  userName: string
  sparks: number
  plan: string
  stripeConnected: boolean
  crmConnected: boolean
  onboardingStep: number
}

interface WizardStepDef {
  id: string
  label: string
}

/* ─── SVG Icons (no emojis) ────────────────────────────────────── */

const icons = {
  spark: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  tools: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  services: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  circle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  arrow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  terminal: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  mail: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  credit: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  message: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  workflow: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  download: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  book: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  users: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  help: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  monitor: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  code: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  plug: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
}

/* ─── Styles ───────────────────────────────────────────────────── */

const fadeIn: React.CSSProperties = {
  animation: 'dashFadeIn 0.5s ease-out forwards',
  opacity: 0,
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary, #e2e8f0)',
    padding: '2rem 1.5rem 4rem',
    maxWidth: 1280,
    margin: '0 auto',
  } as React.CSSProperties,

  /* Header */
  header: {
    marginBottom: '2rem',
    ...fadeIn,
  } as React.CSSProperties,
  welcome: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  planBadge: (plan: string) => ({
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    padding: '0.2rem 0.6rem',
    borderRadius: 9999,
    background: plan === 'free' ? 'rgba(126,217,87,0.15)' : 'rgba(167,139,250,0.2)',
    color: plan === 'free' ? '#7ed957' : '#a78bfa',
    letterSpacing: '0.05em',
  }),
  subtitle: {
    color: 'var(--text-muted, #64748b)',
    fontSize: '0.95rem',
    marginTop: '0.35rem',
  } as React.CSSProperties,

  /* Stat chips */
  chipRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    marginBottom: '2rem',
    ...fadeIn,
    animationDelay: '0.1s',
  } as React.CSSProperties,
  chip: (color: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.85rem',
    borderRadius: 9999,
    background: 'var(--bg-card, #0d1117)',
    border: '1px solid var(--border, #1e293b)',
    fontSize: '0.8rem',
    color,
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
  }),

  /* Install banner */
  installBanner: {
    background: 'linear-gradient(135deg, rgba(126,217,87,0.1) 0%, rgba(0,212,255,0.08) 100%)',
    border: '1px solid rgba(126,217,87,0.3)',
    borderRadius: 12,
    padding: '1rem 1.5rem',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    ...fadeIn,
    animationDelay: '0.15s',
  } as React.CSSProperties,
  installText: {
    fontWeight: 600,
    color: '#7ed957',
    fontSize: '0.95rem',
  } as React.CSSProperties,
  installBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1.1rem',
    borderRadius: 8,
    background: '#7ed957',
    color: '#060a0f',
    fontWeight: 600,
    fontSize: '0.85rem',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  } as React.CSSProperties,

  /* Layout */
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: '2rem',
    alignItems: 'start',
  } as React.CSSProperties,
  layoutMobile: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
  } as React.CSSProperties,
  main: {} as React.CSSProperties,

  /* Section */
  sectionTitle: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: '1rem',
    marginTop: 0,
  } as React.CSSProperties,

  /* Wizard */
  wizard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border, #1e293b)',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '2rem',
    ...fadeIn,
    animationDelay: '0.2s',
    overflow: 'hidden',
  } as React.CSSProperties,
  wizardComplete: {
    background: 'var(--bg-card)',
    border: '1px solid rgba(126,217,87,0.3)',
    borderRadius: 12,
    padding: '1rem 1.5rem',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    ...fadeIn,
    animationDelay: '0.2s',
  } as React.CSSProperties,
  wizardSteps: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    justifyContent: 'center',
  } as React.CSSProperties,
  wizardPill: (state: 'completed' | 'active' | 'upcoming') => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    flexShrink: 0,
    cursor: state === 'upcoming' ? 'default' : 'pointer',
    transition: 'all 0.3s ease',
    ...(state === 'completed' ? {
      background: '#7ed957',
      color: '#060a0f',
      border: '2px solid #7ed957',
    } : state === 'active' ? {
      background: 'transparent',
      color: '#00d4ff',
      border: '2px solid #00d4ff',
      boxShadow: '0 0 12px rgba(0,212,255,0.3)',
    } : {
      background: 'transparent',
      color: 'var(--text-muted)',
      border: '2px solid #334155',
    }),
  }),
  wizardLine: (done: boolean) => ({
    flex: 1,
    height: 2,
    maxWidth: 40,
    background: done ? '#7ed957' : '#334155',
    transition: 'background 0.3s ease',
  }),
  wizardPanel: {
    position: 'relative' as const,
    minHeight: 220,
    overflow: 'hidden',
  } as React.CSSProperties,
  wizardSlide: (active: boolean, direction: 'left' | 'right' | 'center') => ({
    transition: 'transform 0.35s ease, opacity 0.35s ease',
    opacity: active ? 1 : 0,
    transform: active ? 'translateX(0)' : direction === 'left' ? 'translateX(-30px)' : 'translateX(30px)',
    position: active ? ('relative' as const) : ('absolute' as const),
    top: 0,
    left: 0,
    right: 0,
    pointerEvents: active ? ('auto' as const) : ('none' as const),
  }),
  wizardNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border, #1e293b)',
  } as React.CSSProperties,
  wizardBtn: (variant: 'primary' | 'secondary') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1.1rem',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: '0.85rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    ...(variant === 'primary' ? {
      background: '#7ed957',
      color: '#060a0f',
    } : {
      background: 'var(--border)',
      color: 'var(--text-secondary, #94a3b8)',
    }),
  }),
  wizardSkip: {
    fontSize: '0.78rem',
    color: 'var(--text-muted, #64748b)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.3rem 0.5rem',
    transition: 'color 0.2s',
  } as React.CSSProperties,
  wizardCard: (selected: boolean) => ({
    background: selected ? 'rgba(0,212,255,0.08)' : 'var(--bg-card)',
    border: `1px solid ${selected ? '#00d4ff' : 'var(--border, #1e293b)'}`,
    borderRadius: 10,
    padding: '1rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    textAlign: 'left' as const,
  }),
  wizardCardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  } as React.CSSProperties,
  wizardCodeBlock: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border, #1e293b)',
    borderRadius: 8,
    padding: '1rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.78rem',
    color: '#7ed957',
    overflowX: 'auto' as const,
    marginTop: '0.75rem',
    position: 'relative' as const,
    lineHeight: 1.6,
    whiteSpace: 'pre' as const,
  } as React.CSSProperties,
  wizardCopyBtn: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    padding: '0.3rem 0.6rem',
    borderRadius: 6,
    background: 'rgba(126,217,87,0.15)',
    border: '1px solid rgba(126,217,87,0.25)',
    color: '#7ed957',
    fontSize: '0.7rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  wizardInputRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  wizardInput: {
    flex: 1,
    background: 'var(--bg-primary)',
    border: '1px solid var(--border, #1e293b)',
    borderRadius: 8,
    padding: '0.6rem 0.85rem',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
  } as React.CSSProperties,
  wizardExploreCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border, #1e293b)',
    borderRadius: 10,
    padding: '1.25rem',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,

  /* Quick Command */
  commandBlock: {
    background: 'var(--bg-card, #0d1117)',
    border: '1px solid var(--border, #1e293b)',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '2rem',
    ...fadeIn,
    animationDelay: '0.3s',
  } as React.CSSProperties,
  commandLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted, #64748b)',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  commandInputWrap: {
    display: 'flex',
    gap: '0.5rem',
  } as React.CSSProperties,
  commandInput: {
    flex: 1,
    background: 'var(--bg-primary)',
    border: '1px solid var(--border, #1e293b)',
    borderRadius: 8,
    padding: '0.75rem 1rem',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  commandSubmit: {
    padding: '0.75rem 1.25rem',
    borderRadius: 8,
    background: '#7ed957',
    color: '#060a0f',
    fontWeight: 600,
    fontSize: '0.85rem',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'opacity 0.2s',
  } as React.CSSProperties,

  /* Connections */
  connectionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginBottom: '2rem',
    ...fadeIn,
    animationDelay: '0.35s',
  } as React.CSSProperties,
  connectionCard: (connected: boolean) => ({
    background: 'var(--bg-card, #0d1117)',
    border: `1px solid ${connected ? 'rgba(126,217,87,0.3)' : 'var(--border, #1e293b)'}`,
    borderRadius: 10,
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  }),
  connectionDot: (connected: boolean) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: connected ? '#7ed957' : '#64748b',
    flexShrink: 0,
  }),
  connectionName: {
    fontWeight: 500,
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    flex: 1,
  } as React.CSSProperties,
  connectionStatus: (connected: boolean) => ({
    fontSize: '0.72rem',
    color: connected ? '#7ed957' : 'var(--text-muted, #64748b)',
    fontWeight: 500,
  }),

  /* Capability cards */
  capGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: '0.75rem',
    marginBottom: '2rem',
    ...fadeIn,
    animationDelay: '0.4s',
  } as React.CSSProperties,
  capCard: {
    background: 'var(--bg-card, #0d1117)',
    border: '1px solid var(--border, #1e293b)',
    borderRadius: 10,
    padding: '1.25rem',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  capIcon: (color: string) => ({
    color,
    marginBottom: '0.75rem',
  }),
  capTitle: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: 'var(--text-primary)',
    marginBottom: '0.35rem',
  } as React.CSSProperties,
  capDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted, #64748b)',
    lineHeight: 1.5,
  } as React.CSSProperties,

  /* Platform install */
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginBottom: '2rem',
    ...fadeIn,
    animationDelay: '0.45s',
  } as React.CSSProperties,
  platformCard: {
    background: 'var(--bg-card, #0d1117)',
    border: '1px solid var(--border, #1e293b)',
    borderRadius: 10,
    padding: '0.85rem 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
  } as React.CSSProperties,
  platformName: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  platformBadge: (installed: boolean) => ({
    fontSize: '0.7rem',
    fontWeight: 500,
    padding: '0.2rem 0.55rem',
    borderRadius: 6,
    background: installed ? 'rgba(126,217,87,0.15)' : 'rgba(100,116,139,0.15)',
    color: installed ? '#7ed957' : '#64748b',
    textDecoration: 'none',
    display: 'inline-block',
  }),

  /* Sidebar */
  sidebar: {
    position: 'sticky' as const,
    top: '2rem',
    ...fadeIn,
    animationDelay: '0.25s',
  } as React.CSSProperties,
  sidebarCard: {
    background: 'var(--bg-card, #0d1117)',
    border: '1px solid var(--border, #1e293b)',
    borderRadius: 12,
    padding: '1.25rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  sparkBalance: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#7ed957',
    margin: 0,
  } as React.CSSProperties,
  sparkLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted, #64748b)',
    marginTop: '0.2rem',
  } as React.CSSProperties,
  meterTrack: {
    height: 6,
    borderRadius: 3,
    background: 'var(--border, #1e293b)',
    marginTop: '0.75rem',
    overflow: 'hidden',
  } as React.CSSProperties,
  meterFill: (pct: number) => ({
    height: '100%',
    borderRadius: 3,
    background: pct > 80 ? '#ef4444' : '#7ed957',
    width: `${Math.min(pct, 100)}%`,
    transition: 'width 0.6s ease',
  }),
  meterLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted, #64748b)',
    marginTop: '0.3rem',
    textAlign: 'right' as const,
  } as React.CSSProperties,
  upgradeBtn: {
    display: 'block',
    width: '100%',
    padding: '0.65rem',
    borderRadius: 8,
    background: 'linear-gradient(135deg, #7ed957 0%, #5cb83a 100%)',
    color: '#060a0f',
    fontWeight: 600,
    fontSize: '0.85rem',
    textAlign: 'center' as const,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    marginTop: '1rem',
  } as React.CSSProperties,
  quickLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.55rem 0',
    borderBottom: '1px solid var(--border, #1e293b)',
    color: 'var(--text-secondary, #94a3b8)',
    textDecoration: 'none',
    fontSize: '0.82rem',
    fontWeight: 500,
    transition: 'color 0.2s',
  } as React.CSSProperties,
} as const

/* ─── Keyframes injection ──────────────────────────────────────── */

function StyleInjector() {
  return (
    <style>{`
      @keyframes dashFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .dash-command-input:focus {
        border-color: #7ed957 !important;
      }
      .wizard-explore-card:hover {
        border-color: rgba(126,217,87,0.4) !important;
      }
      .wizard-card:hover {
        border-color: #00d4ff !important;
      }
      .wizard-skip:hover {
        color: #94a3b8 !important;
      }
      .dash-cap-card:hover {
        border-color: rgba(126,217,87,0.4) !important;
      }
      .dash-quick-link:hover {
        color: #7ed957 !important;
      }
      @media (max-width: 860px) {
        .dash-layout {
          grid-template-columns: 1fr !important;
        }
        .dash-sidebar {
          position: static !important;
        }
      }
    `}</style>
  )
}

/* ─── Main Dashboard ───────────────────────────────────────────── */

function DashboardContent() {
  const { tier } = useUser()
  const [data, setData] = useState<DashboardData>({
    userName: '',
    sparks: 0,
    plan: 'free',
    stripeConnected: false,
    crmConnected: false,
    onboardingStep: 1,
  })
  const [loading, setLoading] = useState(true)
  const [command, setCommand] = useState('')

  /* Wizard state */
  const WIZARD_STEPS: WizardStepDef[] = [
    { id: 'account', label: 'Account Created' },
    { id: 'install', label: 'Install 0nMCP' },
    { id: 'connect', label: 'Connect a Service' },
    { id: 'run', label: 'Run a Workflow' },
    { id: 'explore', label: 'Explore' },
  ]
  const TOTAL_STEPS = WIZARD_STEPS.length
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardCompleted, setWizardCompleted] = useState<Record<number, boolean>>({ 1: true })
  const [setupDone, setSetupDone] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [wizardCommand, setWizardCommand] = useState('')
  const [slideDir, setSlideDir] = useState<'left' | 'right' | 'center'>('center')

  /* Load user data */
  useEffect(() => {
    async function load() {
      try {
        const [accountRes, sparksRes] = await Promise.all([
          fetch('/api/console/account'),
          fetch('/api/sparks/balance'),
        ])
        const account = accountRes.ok ? await accountRes.json() : {}
        const sparks = sparksRes.ok ? await sparksRes.json() : { balance: 0 }

        setData({
          userName: account.full_name?.split(' ')[0] || '',
          sparks: sparks.balance ?? 0,
          plan: tier || 'free',
          stripeConnected: !!account.stripe_customer_id,
          crmConnected: !!account.crm_location_id,
          onboardingStep: account.onboarding_step ?? 1,
        })
      } catch {
        // Silent fail — defaults are fine
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tier])

  /* Load wizard state from localStorage */
  useEffect(() => {
    try {
      const savedStep = localStorage.getItem('0n-setup-step')
      const savedCompleted = localStorage.getItem('0n-setup-completed')
      const savedDone = localStorage.getItem('0n-setup-done')
      if (savedStep) setWizardStep(parseInt(savedStep, 10))
      if (savedCompleted) setWizardCompleted(JSON.parse(savedCompleted))
      if (savedDone === 'true') setSetupDone(true)
    } catch {
      // ignore
    }
  }, [])

  const persistWizard = useCallback((step: number, completed: Record<number, boolean>, done: boolean) => {
    try {
      localStorage.setItem('0n-setup-step', String(step))
      localStorage.setItem('0n-setup-completed', JSON.stringify(completed))
      localStorage.setItem('0n-setup-done', String(done))
    } catch { /* */ }
  }, [])

  const goToStep = useCallback((target: number) => {
    setSlideDir(target > wizardStep ? 'right' : 'left')
    setWizardStep(target)
    persistWizard(target, wizardCompleted, setupDone)
  }, [wizardStep, wizardCompleted, setupDone, persistWizard])

  const nextStep = useCallback(() => {
    if (wizardStep < TOTAL_STEPS) {
      const newCompleted = { ...wizardCompleted, [wizardStep]: true }
      setWizardCompleted(newCompleted)
      setSlideDir('right')
      const next = wizardStep + 1
      setWizardStep(next)
      persistWizard(next, newCompleted, setupDone)
    }
  }, [wizardStep, TOTAL_STEPS, wizardCompleted, setupDone, persistWizard])

  const prevStep = useCallback(() => {
    if (wizardStep > 1) {
      setSlideDir('left')
      const prev = wizardStep - 1
      setWizardStep(prev)
      persistWizard(prev, wizardCompleted, setupDone)
    }
  }, [wizardStep, wizardCompleted, setupDone, persistWizard])

  const completeSetup = useCallback(() => {
    const allDone = { ...wizardCompleted }
    for (let i = 1; i <= TOTAL_STEPS; i++) allDone[i] = true
    setWizardCompleted(allDone)
    setSetupDone(true)
    persistWizard(TOTAL_STEPS, allDone, true)
  }, [TOTAL_STEPS, wizardCompleted, persistWizard])

  const copyConfig = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  /* Wizard progress for sidebar */
  const completedCount = Object.values(wizardCompleted).filter(Boolean).length
  const progressPct = setupDone ? 100 : Math.round((completedCount / TOTAL_STEPS) * 100)

  /* Platform configs */
  const platformConfigs: Record<string, { name: string; desc: string; config: string }> = {
    claude: {
      name: 'Claude Desktop',
      desc: 'Add to claude_desktop_config.json',
      config: `{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp@latest"]
    }
  }
}`,
    },
    cursor: {
      name: 'Cursor',
      desc: 'Add to .cursor/mcp.json',
      config: `{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp@latest"]
    }
  }
}`,
    },
    slack: {
      name: 'Slack',
      desc: 'Connect via the 0nMCP bot',
      config: `# Install the 0nMCP Slack app:
https://0nmcp.com/connect/slack

# Or self-host:
0nmcp serve --port 3001`,
    },
    terminal: {
      name: 'Terminal',
      desc: 'Run 0nMCP from any shell',
      config: `# Install globally:
npm install -g 0nmcp

# Start the MCP server:
0nmcp

# Or run a workflow:
0nmcp run my-workflow.0n`,
    },
  }

  /* Service configs for step 3 */
  const wizardServices = [
    { id: 'stripe', name: 'Stripe', keyUrl: 'https://dashboard.stripe.com/apikeys' },
    { id: 'openai', name: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys' },
    { id: 'slack', name: 'Slack', keyUrl: 'https://api.slack.com/apps' },
    { id: 'supabase', name: 'Supabase', keyUrl: 'https://supabase.com/dashboard/project/_/settings/api' },
  ]

  /* Connections */
  const connections = [
    { name: 'Stripe', connected: data.stripeConnected },
    { name: 'CRM', connected: data.crmConnected },
    { name: 'Slack', connected: false },
    { name: 'GitHub', connected: false },
    { name: 'Google', connected: false },
    { name: 'Supabase', connected: false },
  ]
  const hasAnyConnection = connections.some(c => c.connected)

  /* Platform install status */
  const platforms = [
    { name: 'Claude Desktop', icon: icons.monitor, installed: false },
    { name: 'Cursor', icon: icons.code, installed: false },
    { name: 'VS Code', icon: icons.code, installed: false },
    { name: 'Slack', icon: icons.message, installed: false },
  ]

  /* Capability cards */
  const capabilities = [
    { title: 'Automate Email', desc: 'Send personalized emails through CRM, Gmail, or SendGrid', icon: icons.mail, color: '#60A5FA', href: '/turn-it-on/sendgrid' },
    { title: 'Manage Payments', desc: 'Create invoices, track subscriptions via Stripe', icon: icons.credit, color: '#A78BFA', href: '/turn-it-on/stripe' },
    { title: 'Team Communication', desc: 'Post to Slack channels, manage messages', icon: icons.message, color: '#00d4ff', href: '/turn-it-on/slack' },
    { title: 'Build Workflows', desc: 'Chain services together with .0n SWITCH files', icon: icons.workflow, color: '#7ed957', href: '/builder' },
  ]

  /* Submit command */
  const handleCommand = () => {
    if (!command.trim()) return
    window.location.href = `/console?prompt=${encodeURIComponent(command.trim())}`
  }

  const sparksMax = 50
  const sparksPct = (data.sparks / sparksMax) * 100

  /* Loading state */
  if (loading) {
    return (
      <div style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32,
          border: '2px solid var(--border)',
          borderTopColor: '#7ed957',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  /* Check if installed — heuristic: if onboardingStep > 2 or any connection */
  const hasInstalled = data.onboardingStep > 2 || hasAnyConnection

  return (
    <div style={s.page}>
      <StyleInjector />

      {/* ─── Section 1: Welcome + Status Bar ─── */}
      <div style={s.header}>
        <h1 style={s.welcome}>
          {data.userName ? `Welcome back, ${data.userName}` : 'Welcome to 0nMCP'}
          <span style={s.planBadge(data.plan)}>{data.plan}</span>
        </h1>
        <p style={s.subtitle}>Your AI command center is ready. Get executing in 60 seconds.</p>
      </div>

      {/* Stat chips */}
      <div style={s.chipRow}>
        <div style={s.chip('#7ed957')}>
          {icons.spark}
          <span>Sparks: {data.sparks}</span>
        </div>
        <div style={s.chip('#60A5FA')}>
          {icons.tools}
          <span>Tools: {STATS_DISPLAY.tools}</span>
        </div>
        <div style={s.chip('#A78BFA')}>
          {icons.services}
          <span>Services: {STATS_DISPLAY.services}</span>
        </div>
        <div style={s.chip('var(--text-secondary, #94a3b8)')}>
          Plan: {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </div>
      </div>

      {/* Install banner (show if not installed) */}
      {!hasInstalled && (
        <div style={s.installBanner}>
          <div>
            <div style={s.installText}>You have not installed 0nMCP yet</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', marginTop: '0.2rem' }}>
              One config paste. Works with Claude Desktop, Cursor, VS Code, and more.
            </div>
          </div>
          <Link href="/install" style={s.installBtn}>
            {icons.download}
            Install 0nMCP
          </Link>
        </div>
      )}

      {/* ─── Run Setup Wizard CTA ─── */}
      {!setupDone && (
        <Link href="/setup" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(126,217,87,0.06)',
          border: '1px solid rgba(126,217,87,0.15)',
          borderRadius: 14,
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'border-color 0.2s',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7ed957, #3ecf8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 900, color: '#0a1a0f', flexShrink: 0,
          }}>0n</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Run Setup Wizard</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Install 0nMCP on Claude, Slack, ChatGPT, or WordPress in 60 seconds</div>
          </div>
          <div style={{ color: '#7ed957', fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            Start {icons.arrow}
          </div>
        </Link>
      )}

      {/* ─── Layout: Main + Sidebar ─── */}
      <div className="dash-layout" style={s.layout}>
        <div style={s.main}>

          {/* ─── Section 2: Getting Started Wizard ─── */}
          {setupDone ? (
            <div style={s.wizardComplete}>
              <span style={{ color: '#7ed957', lineHeight: 0 }}>{icons.check}</span>
              <span style={{ fontWeight: 600, color: '#7ed957', fontSize: '0.9rem' }}>
                Setup complete
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
                All steps finished. You are ready to build.
              </span>
              <button
                style={{ ...s.wizardSkip, marginLeft: 'auto' }}
                className="wizard-skip"
                onClick={() => { setSetupDone(false); persistWizard(wizardStep, wizardCompleted, false) }}
              >
                Reopen
              </button>
            </div>
          ) : (
            <div style={s.wizard}>
              <h2 style={{ ...s.sectionTitle, marginBottom: '1rem' }}>Getting Started</h2>

              {/* Step indicators */}
              <div style={s.wizardSteps}>
                {WIZARD_STEPS.map((step, i) => {
                  const num = i + 1
                  const state = wizardCompleted[num] && num !== wizardStep ? 'completed' : num === wizardStep ? 'active' : 'upcoming'
                  return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={s.wizardPill(state)}
                        onClick={() => state !== 'upcoming' && goToStep(num)}
                        title={step.label}
                      >
                        {state === 'completed' ? (
                          <span style={{ lineHeight: 0 }}>{icons.check}</span>
                        ) : num}
                      </div>
                      {i < WIZARD_STEPS.length - 1 && (
                        <div style={s.wizardLine(!!wizardCompleted[num])} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Step panels */}
              <div style={s.wizardPanel}>
                {/* Step 1: Account Created */}
                <div style={s.wizardSlide(wizardStep === 1, slideDir)}>
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(126,217,87,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <span style={{ color: '#7ed957', lineHeight: 0 }}>{icons.check}</span>
                    </div>
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
                      Account Created
                    </h3>
                    <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.88rem', margin: '0 0 1rem' }}>
                      Your account is ready. Let&apos;s set you up.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' as const }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Name</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{data.userName || 'User'}</div>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Plan</div>
                        <span style={s.planBadge(data.plan)}>{data.plan}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Install 0nMCP */}
                <div style={s.wizardSlide(wizardStep === 2, slideDir)}>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.35rem' }}>
                    Install 0nMCP
                  </h3>
                  <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                    Pick your platform and paste one config.
                  </p>
                  <div style={s.wizardCardGrid}>
                    {Object.entries(platformConfigs).map(([key, cfg]) => (
                      <div
                        key={key}
                        className="wizard-card"
                        style={s.wizardCard(selectedPlatform === key)}
                        onClick={() => setSelectedPlatform(selectedPlatform === key ? null : key)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: '#00d4ff', lineHeight: 0 }}>
                            {key === 'claude' ? icons.monitor : key === 'cursor' ? icons.code : key === 'slack' ? icons.message : icons.terminal}
                          </span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{cfg.name}</span>
                        </div>
                        <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>{cfg.desc}</div>
                      </div>
                    ))}
                  </div>
                  {selectedPlatform && (
                    <div style={s.wizardCodeBlock}>
                      <button
                        style={s.wizardCopyBtn}
                        onClick={() => copyConfig(platformConfigs[selectedPlatform].config)}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      {platformConfigs[selectedPlatform].config}
                    </div>
                  )}
                </div>

                {/* Step 3: Connect a Service */}
                <div style={s.wizardSlide(wizardStep === 3, slideDir)}>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.35rem' }}>
                    Connect a Service
                  </h3>
                  <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                    Link your first service to unlock AI workflows.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
                    {wizardServices.map(svc => (
                      <div key={svc.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border, #1e293b)', borderRadius: 10, padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem' }}>{svc.name}</span>
                          <a
                            href={svc.keyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#00d4ff', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none' }}
                          >
                            Get Key {String.fromCharCode(8594)}
                          </a>
                        </div>
                        <div style={s.wizardInputRow}>
                          <input
                            style={s.wizardInput}
                            className="dash-command-input"
                            placeholder={`Enter ${svc.name} API key...`}
                            type="password"
                          />
                          <button style={{ ...s.wizardBtn('primary'), padding: '0.6rem 0.85rem', fontSize: '0.78rem' }}>
                            Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 4: Run Your First Workflow */}
                <div style={s.wizardSlide(wizardStep === 4, slideDir)}>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.35rem' }}>
                    Run Your First Workflow
                  </h3>
                  <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                    Describe what you want. AI executes it.
                  </p>
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border, #1e293b)', borderRadius: 10, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-muted, #64748b)', fontSize: '0.82rem' }}>
                      {icons.terminal}
                      <span>Describe your workflow</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        className="dash-command-input"
                        style={s.commandInput}
                        placeholder="Send an invoice on Stripe and notify Slack..."
                        value={wizardCommand}
                        onChange={e => setWizardCommand(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && wizardCommand.trim()) window.location.href = `/console?prompt=${encodeURIComponent(wizardCommand.trim())}` }}
                      />
                      <button
                        style={s.commandSubmit}
                        onClick={() => { if (wizardCommand.trim()) window.location.href = `/console?prompt=${encodeURIComponent(wizardCommand.trim())}` }}
                      >
                        Run {icons.arrow}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 5: Explore */}
                <div style={s.wizardSlide(wizardStep === 5, slideDir)}>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.35rem' }}>
                    You&apos;re All Set
                  </h3>
                  <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                    Here&apos;s what to explore next.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <Link href="/console/marketplace" className="wizard-explore-card" style={s.wizardExploreCard}>
                      <div style={{ color: '#7ed957', marginBottom: '0.5rem', lineHeight: 0 }}>{icons.services}</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem' }}>Marketplace</div>
                      <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>Browse pre-built workflows</div>
                    </Link>
                    <Link href="/forum" className="wizard-explore-card" style={s.wizardExploreCard}>
                      <div style={{ color: '#00d4ff', marginBottom: '0.5rem', lineHeight: 0 }}>{icons.users}</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem' }}>Forum</div>
                      <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>Ask questions, share work</div>
                    </Link>
                    <Link href="/docs" className="wizard-explore-card" style={s.wizardExploreCard}>
                      <div style={{ color: '#a78bfa', marginBottom: '0.5rem', lineHeight: 0 }}>{icons.book}</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem' }}>Documentation</div>
                      <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>Full API reference</div>
                    </Link>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                    <button style={s.wizardBtn('primary')} onClick={completeSetup}>
                      Complete Setup {icons.arrow}
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              {wizardStep < 5 && (
                <div style={s.wizardNav}>
                  <div>
                    {wizardStep > 1 && (
                      <button style={s.wizardBtn('secondary')} onClick={prevStep}>
                        {String.fromCharCode(8592)} Back
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {wizardStep > 1 && (
                      <button className="wizard-skip" style={s.wizardSkip} onClick={nextStep}>
                        Skip
                      </button>
                    )}
                    <button style={s.wizardBtn('primary')} onClick={nextStep}>
                      Next {String.fromCharCode(8594)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Section 3: Quick Command ─── */}
          <div style={s.commandBlock}>
            <div style={s.commandLabel}>
              {icons.terminal}
              <span>What do you want to build?</span>
            </div>
            <div style={s.commandInputWrap}>
              <input
                className="dash-command-input"
                style={s.commandInput}
                placeholder="Send an invoice on Stripe and notify Slack..."
                value={command}
                onChange={e => setCommand(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCommand() }}
              />
              <button style={s.commandSubmit} onClick={handleCommand}>
                Run {icons.arrow}
              </button>
            </div>
          </div>

          {/* ─── Section 4: Your Connections ─── */}
          <h2 style={s.sectionTitle}>Your Connections</h2>
          {hasAnyConnection ? (
            <div style={s.connectionsGrid}>
              {connections.map(c => (
                <div key={c.name} style={s.connectionCard(c.connected)}>
                  <div style={s.connectionDot(c.connected)} />
                  <div style={s.connectionName}>{c.name}</div>
                  <div style={s.connectionStatus(c.connected)}>
                    {c.connected ? 'Connected' : 'Not connected'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...s.connectionsGrid, gridTemplateColumns: '1fr' }}>
              <Link href="/connect" style={{
                ...s.connectionCard(false),
                textDecoration: 'none',
                justifyContent: 'center',
                padding: '1.5rem',
                gap: '0.75rem',
                cursor: 'pointer',
              }}>
                <span style={{ color: '#7ed957' }}>{icons.plug}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                  Connect your first service
                </span>
                <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.8rem' }}>
                  Stripe, Slack, CRM, and {STATS_DISPLAY.services}+ more
                </span>
                {icons.chevron}
              </Link>
            </div>
          )}

          {/* ─── Section 5: What You Can Do ─── */}
          <h2 style={s.sectionTitle}>What You Can Do</h2>
          <div style={s.capGrid}>
            {capabilities.map(cap => (
              <Link key={cap.title} href={cap.href} className="dash-cap-card" style={s.capCard}>
                <div style={s.capIcon(cap.color)}>{cap.icon}</div>
                <div style={s.capTitle}>{cap.title}</div>
                <div style={s.capDesc}>{cap.desc}</div>
              </Link>
            ))}
          </div>

          {/* ─── Section 6: Platform Install Status ─── */}
          <h2 style={s.sectionTitle}>Platform Install Status</h2>
          <div style={s.platformGrid}>
            {platforms.map(p => (
              <div key={p.name} style={s.platformCard}>
                <div style={s.platformName}>
                  {p.icon}
                  {p.name}
                </div>
                {p.installed ? (
                  <span style={s.platformBadge(true)}>Installed</span>
                ) : (
                  <Link href="/install" style={s.platformBadge(false)}>
                    Install
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right Sidebar ─── */}
        <div className="dash-sidebar" style={s.sidebar}>
          {/* Sparks balance */}
          <div style={s.sidebarCard}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', marginBottom: '0.25rem' }}>
              Sparks Balance
            </div>
            <p style={s.sparkBalance}>{data.sparks}</p>
            <div style={s.sparkLabel}>of {sparksMax} free executions</div>
            <div style={s.meterTrack}>
              <div style={s.meterFill(sparksPct)} />
            </div>
            <div style={s.meterLabel}>{Math.round(sparksPct)}% used</div>

            {tier === 'free' && (
              <Link href="/console/pricing" style={s.upgradeBtn}>
                Upgrade Plan {icons.arrow}
              </Link>
            )}
          </div>

          {/* Quick links */}
          <div style={s.sidebarCard}>
            <div style={{ ...s.sectionTitle, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Quick Links</div>
            <Link href="/docs" className="dash-quick-link" style={s.quickLink}>
              {icons.book}
              Documentation
            </Link>
            <Link href="/forum" className="dash-quick-link" style={s.quickLink}>
              {icons.users}
              Forum
            </Link>
            <Link href="/community" className="dash-quick-link" style={s.quickLink}>
              {icons.help}
              Support
            </Link>
            <Link href="/examples" className="dash-quick-link" style={{ ...s.quickLink, borderBottom: 'none' }}>
              {icons.workflow}
              Examples
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <UserProvider>
      <DashboardContent />
    </UserProvider>
  )
}
