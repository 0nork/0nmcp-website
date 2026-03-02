'use client'

import { useState } from 'react'
import { AdminDefender } from './AdminDefender'
import { AdminUsers } from './AdminUsers'

type AdminTab = 'overview' | 'defender' | 'users'

const TABS: { key: AdminTab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'defender', label: '0nDefender', icon: '🛡️' },
  { key: 'users', label: 'Users', icon: '👥' },
]

export function AdminView() {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [stats, setStats] = useState<{ users: number; threats: number; scans: number } | null>(null)

  // Fetch overview stats on first render
  useState(() => {
    fetch('/api/admin/users?stats=true')
      .then(r => r.json())
      .then(data => {
        setStats({ users: data.total || 0, threats: 0, scans: 0 })
      })
      .catch(() => {})
  })

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, rgba(126,217,87,0.15), rgba(126,217,87,0.05))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(126,217,87,0.2)',
          fontSize: '1.25rem',
        }}>
          🛡️
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
            Admin Console
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Super admin access — full system control
          </p>
        </div>
        <div style={{
          marginLeft: 'auto',
          padding: '0.25rem 0.75rem', borderRadius: '9999px',
          background: 'rgba(126,217,87,0.12)', border: '1px solid rgba(126,217,87,0.25)',
          fontSize: '0.7rem', fontWeight: 600, color: '#7ed957',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
        }}>
          ADMIN
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '2px', marginBottom: '1.5rem',
        background: 'var(--bg-card)', borderRadius: '0.75rem', padding: '3px',
        border: '1px solid var(--border)',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '0.625rem 1rem', borderRadius: '0.625rem',
              border: 'none', cursor: 'pointer',
              background: tab === t.key ? 'rgba(126,217,87,0.1)' : 'transparent',
              color: tab === t.key ? '#7ed957' : 'var(--text-secondary)',
              fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && (
        <div>
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Users', value: stats?.users ?? '...', color: '#7ed957' },
              { label: 'Active Threats', value: stats?.threats ?? '...', color: '#ef4444' },
              { label: 'Scans Run', value: stats?.scans ?? '...', color: '#00d4ff' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', borderRadius: '0.75rem', padding: '1.25rem',
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: '0.75rem', padding: '1.25rem',
            border: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {([
                { label: 'Run Defender Scan', tab: 'defender' as AdminTab, href: undefined, icon: '🛡️' },
                { label: 'Manage Users', tab: 'users' as AdminTab, href: undefined, icon: '👥' },
                { label: 'View Admin Dashboard', tab: undefined, href: '/admin', icon: '📊' },
                { label: 'Forum Moderation', tab: undefined, href: '/admin/forum', icon: '💬' },
                { label: 'AI Personas', tab: undefined, href: '/admin/personas', icon: '🤖' },
              ] as { label: string; tab?: AdminTab; href?: string; icon: string }[]).map((a, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (a.href) window.open(a.href, '_blank')
                    else if (a.tab) setTab(a.tab)
                  }}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '0.625rem',
                    border: '1px solid var(--border)', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)',
                    fontSize: '0.8rem', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(126,217,87,0.3)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <span>{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'defender' && <AdminDefender />}
      {tab === 'users' && <AdminUsers />}
    </div>
  )
}
