'use client'

/**
 * /console/admin-setup — Admin Dashboard Demo (Brand V3)
 *
 * ISOLATED: Delete this directory to remove entirely.
 * 0nMCP Brand V3: CSS variables only, functional color mapping,
 * --bg-deep hero sections, --bg-vault feature cards, Action Orange CTAs.
 */

import { useState } from 'react'

// ── Mock Data (uses Brand V3 functional color tokens) ──

const STATS = [
  {
    label: 'Total Users', value: '2,847', change: '+12.5%', up: true,
    cssColor: 'var(--accent, #7ed957)',       // Brand green — primary metric
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    sparkData: [3, 7, 5, 9, 4, 8, 6, 10, 7, 12],
  },
  {
    label: 'Revenue', value: '$12,450', change: '+8.2%', up: true,
    cssColor: 'var(--color-teal, #00C2C7)',   // Teal — API/connectivity
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    sparkData: [5, 4, 8, 6, 10, 9, 7, 11, 8, 13],
  },
  {
    label: 'Active Sessions', value: '184', change: '-3.1%', up: false,
    cssColor: 'var(--color-purple, #a78bfa)', // Purple — data flow
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    sparkData: [8, 9, 7, 6, 8, 5, 7, 4, 6, 5],
  },
  {
    label: 'Workflows', value: '63', change: '+24.8%', up: true,
    cssColor: 'var(--color-orange, #FF6B35)', // Orange — action/trigger
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    sparkData: [2, 4, 3, 6, 5, 8, 7, 9, 10, 14],
  },
]

const ACTIVITY = [
  { time: '2m ago', text: 'New user signed up', detail: 'sarah@acme.com', cssColor: 'var(--accent, #7ed957)' },
  { time: '15m ago', text: 'Workflow executed', detail: 'new-contact-onboarding', cssColor: 'var(--color-teal, #00C2C7)' },
  { time: '32m ago', text: 'Payment received', detail: '$49.00 — Pro plan', cssColor: 'var(--color-gold, #FFD700)' },
  { time: '1h ago', text: 'Agent conversation', detail: 'CRM contact lookup', cssColor: 'var(--color-orange, #FF6B35)' },
  { time: '2h ago', text: 'Deploy completed', detail: '0nmcp-website → production', cssColor: 'var(--accent, #7ed957)' },
  { time: '3h ago', text: 'KB updated', detail: 'Spa Ligonier knowledge base', cssColor: 'var(--color-purple, #a78bfa)' },
]

const RECENT_ITEMS = [
  { name: 'mike@rocketopp.com', type: 'Contact', status: 'Active', date: 'Today' },
  { name: 'new-contact-onboarding', type: 'Workflow', status: 'Running', date: 'Today' },
  { name: 'Pro Plan — $49/mo', type: 'Invoice', status: 'Paid', date: 'Yesterday' },
  { name: '0nCode snippet #42', type: 'Asset', status: 'Draft', date: 'Yesterday' },
  { name: 'Spa Ligonier', type: 'Location', status: 'Active', date: '2 days ago' },
]

const QUICK_ACTIONS = [
  { label: 'New Contact', cssColor: 'var(--accent, #7ed957)', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
  { label: 'Send Email', cssColor: 'var(--color-teal, #00C2C7)', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { label: 'Run Workflow', cssColor: 'var(--color-orange, #FF6B35)', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { label: 'View Reports', cssColor: 'var(--color-purple, #a78bfa)', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Chat with AI', cssColor: 'var(--color-gold, #FFD700)', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { label: 'Integrations', cssColor: 'var(--color-cyan, #00d4ff)', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
]

const STATUS_COLORS: Record<string, string> = {
  Active: 'var(--accent, #7ed957)',
  Running: 'var(--color-teal, #00C2C7)',
  Paid: 'var(--color-gold, #FFD700)',
  Draft: 'var(--text-muted, #6b7280)',
}

// ── Components ──

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 32 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          width: 4, minHeight: 2, borderRadius: 2,
          height: `${(v / max) * 100}%`,
          background: color,
          opacity: 0.3 + (i / data.length) * 0.7,
        }} />
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || 'var(--text-muted)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 'var(--radius-badge, 6px)',
      fontSize: '0.6875rem', fontWeight: 600,
      background: `color-mix(in srgb, ${c} 12%, transparent)`,
      color: c, border: `1px solid color-mix(in srgb, ${c} 20%, transparent)`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
      {status}
    </span>
  )
}

function SvgIcon({ path, size = 20, color = 'currentColor' }: { path: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

// Card wrapper using Brand V3 bg tokens
function Card({ children, vault, style }: { children: React.ReactNode; vault?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{
      padding: '1.125rem',
      borderRadius: 'var(--radius-card, 12px)',
      background: vault ? 'var(--bg-vault, #081C4F)' : 'var(--bg-secondary, rgba(255,255,255,0.02))',
      border: '1px solid var(--border, #27272a)',
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: 'var(--text-muted, #6b7280)',
      margin: '0 0 12px', fontFamily: 'var(--font-body, Inter, sans-serif)',
    }}>
      {children}
    </h3>
  )
}

// ── Page ──

export default function AdminSetupPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview')

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
      {/* Header — Brand V3 typography */}
      <div style={{
        marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: '1.25rem', borderBottom: '1px solid var(--border, #27272a)',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.375rem', fontWeight: 800, margin: '0 0 4px',
            color: 'var(--text-primary, #f0f4f8)',
            fontFamily: 'var(--font-display, Inter, sans-serif)',
          }}>
            Admin Setup
          </h1>
          <p style={{
            fontSize: '0.8125rem', margin: 0,
            color: 'var(--text-muted, #6b7280)',
            fontFamily: 'var(--font-body, Nunito Sans, sans-serif)',
          }}>
            Dashboard demo — fully wipeable
          </p>
        </div>
        <div style={{
          display: 'flex', gap: 4, padding: 3,
          background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
          borderRadius: 'var(--radius-card, 12px)',
          border: '1px solid var(--border, #27272a)',
        }}>
          {(['overview', 'activity', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'var(--font-body, Nunito Sans, sans-serif)',
                textTransform: 'capitalize',
                background: activeTab === tab ? 'var(--accent-glow, rgba(126,217,87,0.12))' : 'transparent',
                color: activeTab === tab ? 'var(--accent, #7ed957)' : 'var(--text-muted, #6b7280)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Grid — Brand V3 functional colors */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {STATS.map(stat => (
              <Card key={stat.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{
                    width: 38, height: 38,
                    borderRadius: 'var(--radius-card, 12px)',
                    background: `color-mix(in srgb, ${stat.cssColor} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${stat.cssColor} 15%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <SvgIcon path={stat.icon} size={18} color={stat.cssColor} />
                  </div>
                  <Sparkline data={stat.sparkData} color={stat.cssColor} />
                </div>
                <div style={{
                  fontSize: '1.5rem', fontWeight: 800, color: stat.cssColor,
                  fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #6b7280)', fontFamily: 'var(--font-body)' }}>
                    {stat.label}
                  </span>
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 700,
                    fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                    color: stat.up ? 'var(--accent, #7ed957)' : 'var(--color-red, #ef4444)',
                  }}>
                    {stat.change}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Two Column: Quick Actions + Recent Items */}
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {/* Quick Actions — vault background for secure feel */}
            <Card vault>
              <SectionLabel>Quick Actions</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {QUICK_ACTIONS.map(action => (
                  <button key={action.label} style={{
                    padding: '14px 8px',
                    borderRadius: 'var(--radius-card, 12px)',
                    border: '1px solid var(--border, #27272a)',
                    background: 'var(--bg-primary, #0a0a0a)',
                    cursor: 'pointer', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    fontFamily: 'inherit', transition: 'all 0.15s ease',
                  }}>
                    <div style={{
                      width: 34, height: 34,
                      borderRadius: 10,
                      background: `color-mix(in srgb, ${action.cssColor} 10%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${action.cssColor} 18%, transparent)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <SvgIcon path={action.icon} size={16} color={action.cssColor} />
                    </div>
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 600,
                      color: 'var(--text-secondary, #9ca3af)',
                      fontFamily: 'var(--font-body, Nunito Sans, sans-serif)',
                    }}>
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Recent Items Table */}
            <Card>
              <SectionLabel>Recent Items</SectionLabel>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Type', 'Status', 'Date'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '8px', fontSize: '0.625rem',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--text-muted, #6b7280)',
                        borderBottom: '1px solid var(--border, #27272a)',
                        fontFamily: 'var(--font-body)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ITEMS.map((item, i) => (
                    <tr key={i} style={{ transition: 'background 0.1s' }}>
                      <td style={{
                        padding: '10px 8px', fontSize: '0.8125rem',
                        color: 'var(--text-primary, #f0f4f8)',
                        fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                        borderBottom: '1px solid var(--border, #1a1a2e)',
                      }}>
                        {item.name}
                      </td>
                      <td style={{
                        padding: '10px 8px', fontSize: '0.75rem',
                        color: 'var(--text-secondary, #9ca3af)',
                        borderBottom: '1px solid var(--border, #1a1a2e)',
                        fontFamily: 'var(--font-body)',
                      }}>
                        {item.type}
                      </td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--border, #1a1a2e)' }}>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{
                        padding: '10px 8px', fontSize: '0.75rem',
                        color: 'var(--text-muted, #6b7280)',
                        borderBottom: '1px solid var(--border, #1a1a2e)',
                        fontFamily: 'var(--font-body)',
                      }}>
                        {item.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'activity' && (
        <Card>
          <SectionLabel>Activity Feed</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ACTIVITY.map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '14px 0',
                borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--border, #1a1a2e)' : 'none',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 14 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: item.cssColor, flexShrink: 0,
                    boxShadow: `0 0 8px color-mix(in srgb, ${item.cssColor} 40%, transparent)`,
                  }} />
                  {i < ACTIVITY.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: 'var(--border, #27272a)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: 'var(--text-primary, #f0f4f8)',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {item.text}
                  </div>
                  <div style={{
                    fontSize: '0.75rem', marginTop: 3,
                    color: 'var(--text-muted, #6b7280)',
                    fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                  }}>
                    {item.detail}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.6875rem', flexShrink: 0,
                  color: 'var(--text-muted, #6b7280)',
                  fontFamily: 'var(--font-body)',
                }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card vault>
          <SectionLabel>Settings</SectionLabel>
          <p style={{
            fontSize: '0.8125rem', margin: '0 0 16px',
            color: 'var(--text-secondary, #9ca3af)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.6,
          }}>
            This is a demo page. Delete <code style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              padding: '2px 6px', borderRadius: 4,
              background: 'var(--bg-primary, #0a0a0a)',
              color: 'var(--accent, #7ed957)',
            }}>/console/admin-setup/</code> to remove entirely.
          </p>
          <button style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-card, 12px)',
            border: 'none', cursor: 'pointer',
            fontSize: '0.8125rem', fontWeight: 700,
            fontFamily: 'var(--font-body)',
            background: 'var(--color-orange, #FF6B35)',
            color: '#fff',
          }}>
            Action Orange CTA
          </button>
        </Card>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="300px 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          div[style*="repeat(2, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
