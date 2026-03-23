'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardData {
  userName: string
  sparks: number
  messagesSent: number
  leadsSaved: number
  aiQueries: number
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    userName: '',
    sparks: 0,
    messagesSent: 0,
    leadsSaved: 0,
    aiQueries: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Fetch user info
        const accountRes = await fetch('/api/console/account')
        const account = accountRes.ok ? await accountRes.json() : {}

        // Fetch sparks balance
        const sparksRes = await fetch('/api/sparks/balance')
        const sparks = sparksRes.ok ? await sparksRes.json() : { balance: 0 }

        setData({
          userName: account.full_name?.split(' ')[0] || '',
          sparks: sparks.balance ?? 0,
          messagesSent: 0,
          leadsSaved: 0,
          aiQueries: 0,
        })
      } catch {
        // Silent fail — show defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = [
    { label: 'Sparks Balance', value: data.sparks, accent: 'green', icon: sparkIcon },
    { label: 'Messages Sent', value: data.messagesSent, accent: 'cyan', icon: messageIcon },
    { label: 'Leads Saved', value: data.leadsSaved, accent: 'purple', icon: leadIcon },
    { label: 'AI Queries', value: data.aiQueries, accent: 'amber', icon: queryIcon },
  ]

  const quickActions = [
    { label: 'Install Extension', href: '/dashboard/downloads', desc: 'Get the Chrome extension', accent: 'green' },
    { label: 'Generate a Course', href: '/console/courses/generate', desc: 'AI-powered course creator', accent: 'cyan' },
    { label: 'Browse Courses', href: '/learn', desc: 'Learn AI automation', accent: 'purple' },
    { label: 'Visit Forum', href: '/forum', desc: 'Connect with builders', accent: 'amber' },
  ]

  if (loading) {
    return (
      <div style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32,
          border: '2px solid var(--jp-border)',
          borderTopColor: 'var(--jp-green)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '960px' }}>
      {/* -- WELCOME -- */}
      <div className="jp-page-header">
        <h1 className="jp-page-title">
          {data.userName ? `Welcome back, ${data.userName}` : 'Welcome to 0nMCP'}
        </h1>
        <p className="jp-page-subtitle">
          Your AI command center is ready.
        </p>
      </div>

      {/* -- STAT CARDS -- */}
      <div className="jp-stat-grid" style={{ marginBottom: '2rem' }}>
        {statCards.map(card => (
          <div key={card.label} className={`jp-stat-card ${card.accent}`}>
            <div className="jp-stat-header">
              <span className="jp-stat-label">{card.label}</span>
              <span className={`jp-stat-icon ${card.accent}`}>{card.icon}</span>
            </div>
            <div className="jp-stat-value" style={{ color: `var(--jp-${card.accent})` }}>
              {card.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* -- INSTALL EXTENSION CTA -- */}
      <div className="jp-card" style={{
        padding: '1.5rem',
        background: 'var(--jp-green-glow)',
        borderColor: 'rgba(126, 217, 87, 0.15)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--jp-text)',
            margin: '0 0 0.25rem',
          }}>
            Install the Chrome Extension
          </h3>
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--jp-text-secondary)',
            margin: 0,
          }}>
            Get AI compose, multi-AI council, and LinkedIn tools in your browser.
          </p>
        </div>
        <Link href="/dashboard/downloads" className="jp-btn jp-btn-primary">
          Get Extension
        </Link>
      </div>

      {/* -- QUICK ACTIONS -- */}
      <div className="jp-menu-group-label" style={{ marginBottom: '1rem' }}>
        Quick Actions
      </div>

      <div className="jp-quick-actions">
        {quickActions.map(action => (
          <Link
            key={action.label}
            href={action.href}
            className="jp-quick-action"
          >
            <div className={`jp-activity-dot ${action.accent}`} style={{ width: 10, height: 10 }} />
            <div>
              <div className="jp-quick-action-label">{action.label}</div>
              <div className="jp-quick-action-desc">{action.desc}</div>
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--jp-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ marginLeft: 'auto', flexShrink: 0 }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* -- Inline SVG Icons -- */

const sparkIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const messageIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const leadIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const queryIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
