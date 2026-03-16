'use client'

import { useState, useEffect, useCallback } from 'react'

const VALID_LABELS = ['owner', 'vip', 'beta', 'early-access', 'contributor', 'vendor', 'partner', 'sponsor'] as const
const VALID_PLANS = ['free', 'creator', 'operator', 'agency'] as const

const LABEL_COLORS: Record<string, string> = {
  owner: '#f97316',
  vip: '#eab308',
  beta: '#a855f7',
  'early-access': '#00d4ff',
  contributor: '#7ed957',
  vendor: '#3b82f6',
  partner: '#ec4899',
  sponsor: '#f59e0b',
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  company: string
  role: string
  plan: string
  is_admin: boolean
  onboarding_completed: boolean
  created_at: string
  post_count: number
  karma: number
  last_seen_at: string | null
  labels: string[]
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLabel, setFilterLabel] = useState<string>('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers((data.users || []).map((u: UserProfile) => ({
        ...u,
        labels: Array.isArray(u.labels) ? u.labels : [],
        plan: u.plan || 'free',
      })))
    } catch {
      setMessage('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const updateUser = async (userId: string, updates: Record<string, unknown>) => {
    setActionLoading(userId)
    setMessage('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      })
      const data = await res.json()
      if (data.error) {
        setMessage(data.error)
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } as UserProfile : u))
        setMessage('User updated')
      }
    } catch {
      setMessage('Failed to update user')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleLabel = (userId: string, currentLabels: string[], label: string) => {
    const newLabels = currentLabels.includes(label)
      ? currentLabels.filter(l => l !== label)
      : [...currentLabels, label]
    updateUser(userId, { labels: newLabels })
  }

  const filtered = users.filter(u => {
    if (filterLabel && !(u.labels || []).includes(filterLabel)) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (u.email || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.company || '').toLowerCase().includes(q)
  })

  const adminCount = users.filter(u => u.is_admin).length
  const vipCount = users.filter(u => (u.labels || []).includes('vip')).length
  const todayCount = users.filter(u => {
    if (!u.last_seen_at) return false
    const d = new Date(u.last_seen_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length
  const weekCount = users.filter(u => {
    const d = new Date(u.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d > weekAgo
  }).length

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total', value: users.length, color: '#7ed957' },
          { label: 'Admins', value: adminCount, color: '#f97316' },
          { label: 'VIP', value: vipCount, color: '#eab308' },
          { label: 'Active Today', value: todayCount, color: '#00d4ff' },
          { label: 'New This Week', value: weekCount, color: '#a855f7' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', borderRadius: '0.625rem', padding: '0.75rem',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or company..."
          style={{
            flex: 1, minWidth: '200px', padding: '0.625rem 1rem', borderRadius: '0.625rem',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <select
          value={filterLabel}
          onChange={e => setFilterLabel(e.target.value)}
          style={{
            padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'inherit',
            outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">All Labels</option>
          {VALID_LABELS.map(l => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {message && (
        <div style={{
          padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem',
          background: message.includes('Failed') || message.includes('error') || message.includes('Invalid')
            ? 'rgba(239,68,68,0.08)' : 'rgba(126,217,87,0.08)',
          border: `1px solid ${message.includes('Failed') || message.includes('error') || message.includes('Invalid')
            ? 'rgba(239,68,68,0.2)' : 'rgba(126,217,87,0.2)'}`,
          fontSize: '0.75rem',
          color: message.includes('Failed') || message.includes('error') || message.includes('Invalid')
            ? '#ef4444' : '#7ed957',
        }}>
          {message}
        </div>
      )}

      {/* User Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Loading users...
        </div>
      ) : (
        <div style={{ borderRadius: '0.75rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.25fr 1.5fr 1.5fr 0.75fr 0.5fr',
            padding: '0.625rem 1rem',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <div>Name</div>
            <div>Email</div>
            <div>Labels</div>
            <div>Plan</div>
            <div>Joined</div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {search || filterLabel ? 'No users match' : 'No users found'}
            </div>
          ) : filtered.map((u, i) => (
            <div key={u.id}>
              {/* Row */}
              <div
                onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.25fr 1.5fr 1.5fr 0.75fr 0.5fr',
                  padding: '0.625rem 1rem',
                  background: i % 2 === 0 ? 'var(--bg-card)' : 'rgba(15,15,21,0.5)',
                  borderBottom: expandedUser === u.id ? 'none' : '1px solid rgba(42,42,58,0.3)',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {u.full_name || '—'}
                  </span>
                  {u.is_admin && (
                    <span style={{
                      fontSize: '0.55rem', padding: '0.1rem 0.35rem', borderRadius: '9999px',
                      background: 'rgba(126,217,87,0.12)', color: '#7ed957',
                      fontWeight: 700, letterSpacing: '0.03em',
                    }}>
                      ADMIN
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  {u.email}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {(u.labels || []).map(label => (
                    <span
                      key={label}
                      style={{
                        fontSize: '0.55rem', padding: '0.1rem 0.375rem', borderRadius: '9999px',
                        background: `${LABEL_COLORS[label] || '#666'}20`,
                        color: LABEL_COLORS[label] || '#666',
                        fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase',
                      }}
                    >
                      {label}
                    </span>
                  ))}
                  {(u.labels || []).length === 0 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>—</span>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem' }}>
                  <span style={{
                    padding: '0.1rem 0.35rem', borderRadius: '4px',
                    background: u.plan === 'free' ? 'rgba(255,255,255,0.05)' : 'rgba(126,217,87,0.08)',
                    color: u.plan === 'free' ? 'var(--text-muted)' : '#7ed957',
                    fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase',
                  }}>
                    {u.plan}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                  {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Expanded Panel */}
              {expandedUser === u.id && (
                <div style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(126,217,87,0.02)',
                  borderBottom: '1px solid var(--border)',
                  borderTop: '1px solid rgba(126,217,87,0.1)',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Labels */}
                    <div>
                      <div style={{
                        fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem',
                      }}>
                        Permission Labels
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {VALID_LABELS.map(label => {
                          const active = (u.labels || []).includes(label)
                          return (
                            <button
                              key={label}
                              onClick={(e) => { e.stopPropagation(); toggleLabel(u.id, u.labels || [], label) }}
                              disabled={actionLoading === u.id}
                              style={{
                                padding: '0.25rem 0.5rem', borderRadius: '6px',
                                border: `1px solid ${active ? LABEL_COLORS[label] || '#666' : 'var(--border)'}`,
                                background: active ? `${LABEL_COLORS[label] || '#666'}15` : 'transparent',
                                color: active ? LABEL_COLORS[label] || '#666' : 'var(--text-muted)',
                                fontSize: '0.7rem', fontWeight: 600,
                                cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit',
                                transition: 'all 0.15s',
                                opacity: actionLoading === u.id ? 0.5 : 1,
                              }}
                            >
                              {active ? '✓ ' : ''}{label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Admin + Plan */}
                    <div>
                      <div style={{
                        fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem',
                      }}>
                        Role & Plan
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateUser(u.id, { is_admin: !u.is_admin }) }}
                          disabled={actionLoading === u.id}
                          style={{
                            padding: '0.25rem 0.625rem', borderRadius: '6px',
                            border: `1px solid ${u.is_admin ? '#7ed957' : 'var(--border)'}`,
                            background: u.is_admin ? 'rgba(126,217,87,0.1)' : 'transparent',
                            color: u.is_admin ? '#7ed957' : 'var(--text-muted)',
                            fontSize: '0.7rem', fontWeight: 600,
                            cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          {u.is_admin ? '✓ Admin' : 'Grant Admin'}
                        </button>
                        <select
                          value={u.plan || 'free'}
                          onChange={(e) => { e.stopPropagation(); updateUser(u.id, { plan: e.target.value }) }}
                          disabled={actionLoading === u.id}
                          style={{
                            padding: '0.25rem 0.5rem', borderRadius: '6px',
                            border: '1px solid var(--border)', background: 'var(--bg-card)',
                            color: 'var(--text-primary)', fontSize: '0.7rem',
                            fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
                          }}
                        >
                          {VALID_PLANS.map(p => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                          ))}
                        </select>
                      </div>

                      {/* Extra info */}
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>Role: {u.role || 'member'}</span>
                        <span>Karma: {u.karma || 0}</span>
                        <span>Posts: {u.post_count || 0}</span>
                        {u.company && <span>Company: {u.company}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
