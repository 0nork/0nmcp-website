'use client'

/**
 * /console/admin-setup — Admin Dashboard Demo
 *
 * ISOLATED: This entire page can be wiped by deleting this one directory.
 * No dependencies on other files. All styles inline. All data mock.
 *
 * Borrowed patterns from Rasket React v2.0:
 * - Stats card grid with trend indicators
 * - Activity timeline
 * - Quick actions grid
 * - Recent items table
 * - Mini chart sparklines (CSS-only)
 *
 * Uses 0nmcp.com console CSS variables (--jp-*) for theme compatibility.
 */

import { useState } from 'react'

// ── Mock Data ──

const STATS = [
  { label: 'Total Users', value: '2,847', change: '+12.5%', up: true, color: '#6EE05A', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Revenue', value: '$12,450', change: '+8.2%', up: true, color: '#00d4ff', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Active Sessions', value: '184', change: '-3.1%', up: false, color: '#a78bfa', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'Workflows', value: '63', change: '+24.8%', up: true, color: '#ff6b35', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
]

const ACTIVITY = [
  { time: '2m ago', text: 'New user signed up', detail: 'sarah@acme.com', color: '#6EE05A' },
  { time: '15m ago', text: 'Workflow executed', detail: 'new-contact-onboarding', color: '#00d4ff' },
  { time: '32m ago', text: 'Payment received', detail: '$49.00 — Pro plan', color: '#a78bfa' },
  { time: '1h ago', text: 'Agent conversation', detail: 'CRM contact lookup', color: '#ff6b35' },
  { time: '2h ago', text: 'Deploy completed', detail: '0nmcp-website → production', color: '#6EE05A' },
  { time: '3h ago', text: 'KB updated', detail: 'Spa Ligonier knowledge base', color: '#00d4ff' },
]

const RECENT_ITEMS = [
  { name: 'mike@rocketopp.com', type: 'Contact', status: 'Active', date: 'Today' },
  { name: 'new-contact-onboarding', type: 'Workflow', status: 'Running', date: 'Today' },
  { name: 'Pro Plan — $49/mo', type: 'Invoice', status: 'Paid', date: 'Yesterday' },
  { name: '0nCode snippet #42', type: 'Asset', status: 'Draft', date: 'Yesterday' },
  { name: 'Spa Ligonier', type: 'Location', status: 'Active', date: '2 days ago' },
]

const QUICK_ACTIONS = [
  { label: 'New Contact', color: '#6EE05A', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
  { label: 'Send Email', color: '#00d4ff', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'New Workflow', color: '#a78bfa', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { label: 'View Reports', color: '#ff6b35', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
]

// ── Sparkline (CSS-only mini bar chart) ──

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 32 }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: `${(v / max) * 100}%`,
            minHeight: 2,
            borderRadius: 2,
            background: color,
            opacity: 0.4 + (i / data.length) * 0.6,
          }}
        />
      ))}
    </div>
  )
}

// ── Status Badge ──

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: '#6EE05A',
    Running: '#00d4ff',
    Paid: '#a78bfa',
    Draft: '#71717a',
  }
  const c = colors[status] || '#71717a'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 600,
      background: `${c}15`, color: c, border: `1px solid ${c}20`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
      {status}
    </span>
  )
}

// ── SVG Icon helper ──

function Icon({ path, size = 20, color = 'currentColor' }: { path: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

// ── Page ──

export default function AdminSetupPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview')

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--jp-text, #e2e2e8)', margin: '0 0 4px', fontFamily: 'var(--font-display, inherit)' }}>
            Admin Setup
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--jp-text-muted, #52525b)', margin: 0 }}>
            Dashboard demo — delete /console/admin-setup to remove entirely
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['overview', 'activity', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 600, fontFamily: 'inherit',
                textTransform: 'capitalize',
                background: activeTab === tab ? 'rgba(110,224,90,0.12)' : 'transparent',
                color: activeTab === tab ? '#6EE05A' : 'var(--jp-text-muted, #71717a)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {STATS.map(stat => (
              <div key={stat.label} style={{
                padding: '1.125rem', borderRadius: 12,
                background: 'var(--jp-surface, rgba(255,255,255,0.02))',
                border: '1px solid var(--jp-border, #27272a)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${stat.color}0c`, border: `1px solid ${stat.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon path={stat.icon} size={18} color={stat.color} />
                  </div>
                  <Sparkline data={[3, 7, 5, 9, 4, 8, 6, 10, 7, 12]} color={stat.color} />
                </div>
                <div style={{ fontSize: '1.375rem', fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono, monospace)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted, #71717a)' }}>{stat.label}</span>
                  <span style={{ fontSize: '0.625rem', fontWeight: 600, color: stat.up ? '#6EE05A' : '#ef4444' }}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Two Column: Quick Actions + Recent Items */}
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {/* Quick Actions */}
            <div style={{
              padding: '1.125rem', borderRadius: 12,
              background: 'var(--jp-surface, rgba(255,255,255,0.02))',
              border: '1px solid var(--jp-border, #27272a)',
            }}>
              <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--jp-text-muted, #71717a)', margin: '0 0 12px' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {QUICK_ACTIONS.map(action => (
                  <button key={action.label} style={{
                    padding: '12px 8px', borderRadius: 10, border: `1px solid var(--jp-border, #27272a)`,
                    background: 'transparent', cursor: 'pointer', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    fontFamily: 'inherit',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${action.color}0c`, border: `1px solid ${action.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon path={action.icon} size={16} color={action.color} />
                    </div>
                    <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--jp-text-secondary, #a1a1aa)' }}>
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Items Table */}
            <div style={{
              padding: '1.125rem', borderRadius: 12,
              background: 'var(--jp-surface, rgba(255,255,255,0.02))',
              border: '1px solid var(--jp-border, #27272a)',
            }}>
              <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--jp-text-muted, #71717a)', margin: '0 0 12px' }}>
                Recent Items
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Type', 'Status', 'Date'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '6px 8px', fontSize: '0.625rem',
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--jp-text-muted, #71717a)',
                        borderBottom: '1px solid var(--jp-border, #27272a)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ITEMS.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px', fontSize: '0.8125rem', color: 'var(--jp-text, #e2e2e8)', fontFamily: 'var(--font-mono, monospace)', borderBottom: '1px solid var(--jp-border, #1a1a2e)' }}>
                        {item.name}
                      </td>
                      <td style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--jp-text-secondary, #a1a1aa)', borderBottom: '1px solid var(--jp-border, #1a1a2e)' }}>
                        {item.type}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid var(--jp-border, #1a1a2e)' }}>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--jp-text-muted, #71717a)', borderBottom: '1px solid var(--jp-border, #1a1a2e)' }}>
                        {item.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'activity' && (
        /* Activity Timeline */
        <div style={{
          padding: '1.25rem', borderRadius: 12,
          background: 'var(--jp-surface, rgba(255,255,255,0.02))',
          border: '1px solid var(--jp-border, #27272a)',
        }}>
          <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--jp-text-muted, #71717a)', margin: '0 0 16px' }}>
            Activity Feed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ACTIVITY.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--jp-border, #1a1a2e)' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  {i < ACTIVITY.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--jp-border, #27272a)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--jp-text, #e2e2e8)' }}>{item.text}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted, #71717a)', marginTop: 2 }}>{item.detail}</div>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted, #52525b)', flexShrink: 0 }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={{
          padding: '1.25rem', borderRadius: 12,
          background: 'var(--jp-surface, rgba(255,255,255,0.02))',
          border: '1px solid var(--jp-border, #27272a)',
        }}>
          <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--jp-text-muted, #71717a)', margin: '0 0 16px' }}>
            Settings
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary, #a1a1aa)', margin: 0 }}>
            Settings panel placeholder. This entire /console/admin-setup directory can be deleted to remove this demo page completely.
          </p>
        </div>
      )}

      {/* Responsive breakpoint styles */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          div[style*="grid-template-columns: 280px"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          div[style*="grid-template-columns: repeat(2"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
