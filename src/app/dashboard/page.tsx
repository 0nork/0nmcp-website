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
    { label: 'Sparks Balance', value: data.sparks, color: '#7ed957', icon: sparkIcon },
    { label: 'Messages Sent', value: data.messagesSent, color: '#00d4ff', icon: messageIcon },
    { label: 'Leads Saved', value: data.leadsSaved, color: '#a78bfa', icon: leadIcon },
    { label: 'AI Queries', value: data.aiQueries, color: '#fbbf24', icon: queryIcon },
  ]

  const quickActions = [
    { label: 'Install Extension', href: '/dashboard/downloads', desc: 'Get the Chrome extension', color: '#7ed957' },
    { label: 'Generate a Course', href: '/console/courses/generate', desc: 'AI-powered course creator', color: '#00d4ff' },
    { label: 'Browse Courses', href: '/learn', desc: 'Learn AI automation', color: '#a78bfa' },
    { label: 'Visit Forum', href: '/forum', desc: 'Connect with builders', color: '#fbbf24' },
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
      {/* ── WELCOME ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--jp-text)',
          margin: '0 0 0.25rem',
          letterSpacing: '-0.02em',
        }}>
          {data.userName ? `Welcome back, ${data.userName}` : 'Welcome to 0nMCP'}
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--jp-text-secondary)',
          margin: 0,
        }}>
          Your AI command center is ready.
        </p>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {statCards.map(card => (
          <div key={card.label} style={{
            padding: '1.25rem',
            borderRadius: 'var(--jp-radius)',
            background: 'var(--jp-bg-card)',
            border: '1px solid var(--jp-border)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}>
              <span style={{ color: card.color, display: 'flex' }}>{card.icon}</span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--jp-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {card.label}
              </span>
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: card.color,
              letterSpacing: '-0.02em',
            }}>
              {card.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* ── INSTALL EXTENSION CTA ── */}
      <div style={{
        padding: '1.5rem',
        borderRadius: 'var(--jp-radius)',
        background: 'rgba(126, 217, 87, 0.06)',
        border: '1px solid rgba(126, 217, 87, 0.15)',
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
        <Link
          href="/dashboard/downloads"
          style={{
            padding: '0.625rem 1.5rem',
            borderRadius: 'var(--jp-radius-sm)',
            background: 'var(--jp-green)',
            color: '#0a0a0a',
            fontSize: '0.875rem',
            fontWeight: 700,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          Get Extension
        </Link>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <h2 style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--jp-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        margin: '0 0 1rem',
      }}>
        Quick Actions
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1rem',
      }}>
        {quickActions.map(action => (
          <Link
            key={action.label}
            href={action.href}
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--jp-radius)',
              background: 'var(--jp-bg-card)',
              border: '1px solid var(--jp-border)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: action.color,
              flexShrink: 0,
              boxShadow: `0 0 10px ${action.color}33`,
            }} />
            <div>
              <div style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--jp-text)',
                marginBottom: '0.15rem',
              }}>
                {action.label}
              </div>
              <div style={{
                fontSize: '0.8125rem',
                color: 'var(--jp-text-secondary)',
              }}>
                {action.desc}
              </div>
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

/* ── Inline SVG Icons ── */

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
