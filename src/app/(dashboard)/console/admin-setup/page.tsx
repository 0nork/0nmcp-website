'use client'

/**
 * /console/admin-setup — Admin Dashboard Demo (Pulse UI Pro Style + Brand V3)
 *
 * ISOLATED: Delete this directory to remove entirely.
 * Pulse UI Pro inspired: ShadCN-style cards, Recharts-style sparklines,
 * live AI chat panel, real API connection to /api/console/chat.
 * Brand V3: CSS variables, functional colors, proper typography.
 */

import { useState, useRef, useEffect, useCallback } from 'react'

// ── Types ──

interface ChatMsg {
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

// ── Mock Data ──

const STATS = [
  { label: 'Total Users', value: '2,847', change: '+12.5%', up: true, token: '--accent', fallback: '#7ed957', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', spark: [3,7,5,9,4,8,6,10,7,12,8,14] },
  { label: 'Revenue', value: '$12,450', change: '+8.2%', up: true, token: '--color-teal', fallback: '#00C2C7', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', spark: [5,4,8,6,10,9,7,11,8,13,10,15] },
  { label: 'Active Sessions', value: '184', change: '-3.1%', up: false, token: '--color-purple', fallback: '#a78bfa', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', spark: [8,9,7,6,8,5,7,4,6,5,4,3] },
  { label: 'Workflows', value: '63', change: '+24.8%', up: true, token: '--color-orange', fallback: '#FF6B35', icon: 'M13 10V3L4 14h7v7l9-11h-7z', spark: [2,4,3,6,5,8,7,9,10,14,11,16] },
]

const ACTIVITY = [
  { time: '2m', action: 'New user signed up', detail: 'sarah@acme.com', token: '--accent', fallback: '#7ed957' },
  { time: '15m', action: 'Workflow executed', detail: 'new-contact-onboarding', token: '--color-teal', fallback: '#00C2C7' },
  { time: '32m', action: 'Payment received', detail: '$49.00 — Pro plan', token: '--color-gold', fallback: '#FFD700' },
  { time: '1h', action: 'Agent conversation', detail: 'CRM contact lookup', token: '--color-orange', fallback: '#FF6B35' },
  { time: '2h', action: 'Deploy completed', detail: '0nmcp-website → production', token: '--accent', fallback: '#7ed957' },
]

const SERVICES_STATUS = [
  { name: 'CRM', status: 'online', tools: 289, token: '--accent' },
  { name: 'Stripe', status: 'online', tools: 32, token: '--color-teal' },
  { name: 'Slack', status: 'online', tools: 14, token: '--color-purple' },
  { name: 'Telegram', status: 'online', tools: 132, token: '--color-cyan' },
  { name: 'OpenAI', status: 'online', tools: 15, token: '--color-gold' },
  { name: 'GitHub', status: 'online', tools: 28, token: '--color-orange' },
]

// ── Helpers ──

function cv(token: string, fallback: string) { return `var(${token}, ${fallback})` }

function Icon({ d, size = 18, color = 'currentColor' }: { d: string; size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 36 }}>
      {data.map((v, i) => (
        <div key={i} style={{ width: 3, borderRadius: 2, minHeight: 2, height: `${(v/max)*100}%`, background: color, opacity: 0.25 + (i/data.length)*0.75, transition: 'height 0.3s ease' }} />
      ))}
    </div>
  )
}

// ── Shared Card ──

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: 'var(--radius-card, 12px)',
      background: 'var(--bg-card, rgba(255,255,255,0.03))',
      border: '1px solid var(--border, #1e1e2e)',
      padding: '1.25rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--text-muted, #6b7280)', marginBottom: 12, fontFamily: 'var(--font-body, sans-serif)' }}>
      {children}
    </div>
  )
}

// ── Live AI Chat Component ──

function LiveChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', text: 'Hey, I\'m Jaxx — the 0nMCP brain. Ask me anything or run a command.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: ChatMsg = { role: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/console/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, source: 'admin-setup' }),
      })
      const data = await res.json()
      const reply = data.reply || data.text || data.message || 'No response.'
      setMessages(prev => [...prev, { role: 'assistant', text: reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Connection error. Try again.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: 420, padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--border, #1e1e2e)',
        background: 'var(--bg-deep, #040A1A)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent, #7ed957), var(--color-teal, #00C2C7))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.625rem', fontWeight: 900, color: '#000',
        }}>0n</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary, #f0f4f8)' }}>Jaxx</div>
          <div style={{ fontSize: '0.625rem', color: 'var(--accent, #7ed957)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent, #7ed957)', boxShadow: '0 0 6px var(--accent-glow, rgba(126,217,87,0.4))' }} />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 3 }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: 14, fontSize: '0.8125rem', lineHeight: 1.5,
              fontFamily: 'var(--font-body, sans-serif)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              ...(msg.role === 'user' ? {
                background: 'linear-gradient(135deg, var(--accent-glow, rgba(126,217,87,0.12)), rgba(0,194,199,0.08))',
                border: '1px solid var(--accent-dim, rgba(126,217,87,0.2))',
                color: 'var(--text-primary, #f0f4f8)',
                borderBottomRightRadius: 4,
              } : {
                background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
                border: '1px solid var(--border, #1e1e2e)',
                color: 'var(--text-primary, #f0f4f8)',
                borderBottomLeftRadius: 4,
              }),
            }}>
              {msg.text}
            </div>
            <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted, #6b7280)', padding: '0 4px' }}>{msg.timestamp}</span>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border)', maxWidth: '60%' }}>
            {[0,1,2].map(d => (
              <span key={d} style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--accent, #7ed957)',
                animation: `dotPulse 1.2s ease infinite ${d * 0.2}s`,
              }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border, #1e1e2e)', display: 'flex', gap: 8, background: 'var(--bg-deep, #040A1A)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask Jaxx anything..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border, #1e1e2e)',
            background: 'var(--bg-primary, #0a0a0a)', color: 'var(--text-primary, #f0f4f8)',
            fontSize: '0.8125rem', fontFamily: 'var(--font-body, sans-serif)', outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: input.trim() ? 'var(--accent, #7ed957)' : 'var(--bg-secondary, #1e1e2e)',
            color: input.trim() ? '#000' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </Card>
  )
}

// ── Page ──

export default function AdminSetupPage() {
  const [tab, setTab] = useState<'overview' | 'chat' | 'services'>('overview')

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary, #f0f4f8)', fontFamily: 'var(--font-display, Inter, sans-serif)' }}>
            Command Center
          </h1>
          <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-muted, #6b7280)' }}>
            Admin dashboard demo — fully wipeable
          </p>
        </div>
        <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--bg-card, rgba(255,255,255,0.03))', borderRadius: 10, border: '1px solid var(--border, #1e1e2e)' }}>
          {(['overview', 'chat', 'services'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-body, sans-serif)',
              textTransform: 'capitalize',
              background: tab === t ? 'var(--accent-glow, rgba(126,217,87,0.12))' : 'transparent',
              color: tab === t ? 'var(--accent, #7ed957)' : 'var(--text-muted, #6b7280)',
              transition: 'all 0.15s ease',
            }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '1.25rem' }}>
            {STATS.map(s => (
              <Card key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-card, 12px)',
                    background: `color-mix(in srgb, ${cv(s.token, s.fallback)} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${cv(s.token, s.fallback)} 15%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon d={s.icon} size={20} color={cv(s.token, s.fallback)} />
                  </div>
                  <Spark data={s.spark} color={cv(s.token, s.fallback)} />
                </div>
                <div style={{ fontSize: '1.625rem', fontWeight: 800, color: cv(s.token, s.fallback), fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #6b7280)' }}>{s.label}</span>
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px', borderRadius: 4,
                    background: s.up ? 'rgba(126,217,87,0.1)' : 'rgba(239,68,68,0.1)',
                    color: s.up ? 'var(--accent, #7ed957)' : 'var(--color-red, #ef4444)',
                  }}>
                    {s.change}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Main Grid: Activity + Chat */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 12 }}>
            {/* Activity Feed */}
            <Card>
              <Label>Recent Activity</Label>
              {ACTIVITY.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                  borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--border, #1e1e2e)' : 'none',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: `color-mix(in srgb, ${cv(item.token, item.fallback)} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${cv(item.token, item.fallback)} 18%, transparent)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cv(item.token, item.fallback), boxShadow: `0 0 8px color-mix(in srgb, ${cv(item.token, item.fallback)} 40%, transparent)` }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary, #f0f4f8)' }}>{item.action}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6b7280)', fontFamily: 'var(--font-mono)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.detail}</div>
                  </div>
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted, #6b7280)',
                    padding: '3px 8px', borderRadius: 6,
                    background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
                    border: '1px solid var(--border, #1e1e2e)',
                    flexShrink: 0, fontFamily: 'var(--font-mono)',
                  }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </Card>

            {/* Live AI Chat */}
            <LiveChat />
          </div>
        </>
      )}

      {tab === 'chat' && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <LiveChat />
        </div>
      )}

      {tab === 'services' && (
        <Card>
          <Label>Connected Services</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {SERVICES_STATUS.map(svc => (
              <div key={svc.name} style={{
                padding: '16px', borderRadius: 'var(--radius-card, 12px)',
                background: 'var(--bg-secondary, rgba(255,255,255,0.02))',
                border: '1px solid var(--border, #1e1e2e)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `color-mix(in srgb, ${cv(svc.token, '#7ed957')} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${cv(svc.token, '#7ed957')} 18%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6875rem', fontWeight: 800, color: cv(svc.token, '#7ed957'),
                  fontFamily: 'var(--font-mono)',
                }}>
                  {svc.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary, #f0f4f8)' }}>{svc.name}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{svc.tools} tools</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent, #7ed957)', boxShadow: '0 0 6px var(--accent-glow, rgba(126,217,87,0.4))' }} />
                  <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--accent, #7ed957)' }}>Live</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="1fr 380px"] { grid-template-columns: 1fr !important; }
          div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          div[style*="repeat(2, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
