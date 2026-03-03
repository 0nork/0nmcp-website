'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  bio: string | null
  karma: number
  reputation_level: string
  is_persona: boolean
  onboarding_completed: boolean
  created_at: string
}

interface UserStats {
  total: number
  personas: number
  onboarded: number
  thisWeek: number
}

type FilterType = '' | 'real' | 'persona'
type SortBy = 'newest' | 'karma' | 'name'

export default function UserManagementPage() {
  const supabase = createSupabaseBrowser()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addName, setAddName] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [addMessage, setAddMessage] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const load = useCallback(async () => {
    if (!supabase) return

    const [usersRes, totalRes, personaRes, onboardedRes, weekRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, username, avatar_url, bio, karma, reputation_level, is_persona, onboarding_completed, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_persona', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('onboarding_completed', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (usersRes.data) setUsers(usersRes.data as any)

    setStats({
      total: totalRes.count || 0,
      personas: personaRes.count || 0,
      onboarded: onboardedRes.count || 0,
      thisWeek: weekRes.count || 0,
    })

    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    if (!addEmail.trim()) return
    setAddLoading(true)
    setAddMessage('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail, full_name: addName || undefined, password: addPassword || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        const msg = data.generated_password
          ? `User created. Generated password: ${data.generated_password}`
          : 'User created successfully'
        setAddMessage(msg)
        setAddEmail('')
        setAddName('')
        setAddPassword('')
        load()
      } else {
        setAddMessage(data.error || 'Failed to create user')
      }
    } catch {
      setAddMessage('Network error')
    }
    setAddLoading(false)
  }

  async function handleResetPassword(userId: string, method: 'generate' | 'email') {
    setResetLoading(true)
    setResetMessage('')
    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, method }),
      })
      const data = await res.json()
      if (res.ok) {
        if (method === 'generate') {
          setResetMessage(`New password: ${data.password}`)
        } else {
          setResetMessage(`Reset email sent to ${data.email}`)
        }
      } else {
        setResetMessage(data.error || 'Reset failed')
      }
    } catch {
      setResetMessage('Network error')
    }
    setResetLoading(false)
  }

  const filteredUsers = users
    .filter(u => {
      if (search) {
        const q = search.toLowerCase()
        const match = (u.full_name?.toLowerCase().includes(q)) ||
          u.email.toLowerCase().includes(q) ||
          (u.username?.toLowerCase().includes(q))
        if (!match) return false
      }
      if (filter === 'real' && u.is_persona) return false
      if (filter === 'persona' && !u.is_persona) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'karma') return b.karma - a.karma
      if (sortBy === 'name') return (a.full_name || a.email).localeCompare(b.full_name || b.email)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  if (loading) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>0n</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Loading users...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.75rem' }}>Admin</Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>/</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>User Management</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>User Management</h1>
        </div>
        <button
          onClick={() => setShowAddModal(!showAddModal)}
          style={{
            padding: '8px 16px', borderRadius: 8, background: 'rgba(126,217,87,0.15)',
            color: '#7ed957', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
          }}
        >
          + Add User
        </button>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{
          padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--accent)',
          marginBottom: 16,
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>Create New User</h3>
          {addMessage && (
            <div style={{
              padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: '0.75rem', fontWeight: 600,
              background: addMessage.includes('Failed') || addMessage.includes('error') ? 'rgba(255,61,61,0.1)' : 'rgba(126,217,87,0.1)',
              color: addMessage.includes('Failed') || addMessage.includes('error') ? '#ff3d3d' : 'var(--accent)',
              wordBreak: 'break-all',
            }}>
              {addMessage}
            </div>
          )}
          <form onSubmit={handleAddUser} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Email *</label>
              <input value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="user@example.com" required style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Full Name</label>
              <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="John Doe" style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: '0.625rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Password (auto-gen if blank)</label>
              <input value={addPassword} onChange={e => setAddPassword(e.target.value)} placeholder="Leave blank to auto-generate" type="text" style={inputStyle} />
            </div>
            <button type="submit" disabled={addLoading} style={{
              padding: '8px 20px', borderRadius: 8, background: addLoading ? 'var(--bg-card)' : 'var(--accent)',
              color: addLoading ? 'var(--text-muted)' : 'var(--bg-primary)', border: 'none', fontWeight: 700,
              fontSize: '0.8125rem', cursor: addLoading ? 'wait' : 'pointer', height: 36,
            }}>
              {addLoading ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          <StatBox label="Total Users" value={stats.total} color="var(--accent)" />
          <StatBox label="This Week" value={stats.thisWeek} color="#00d4ff" />
          <StatBox label="Onboarded" value={stats.onboarded} color="#9945ff" />
          <StatBox label="AI Personas" value={stats.personas} color="#ff69b4" />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name, email, or username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: 240 }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value as FilterType)} style={{ ...inputStyle, width: 140, flex: 'none' }}>
          <option value="">All users</option>
          <option value="real">Real only</option>
          <option value="persona">Personas only</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} style={{ ...inputStyle, width: 140, flex: 'none' }}>
          <option value="newest">Newest first</option>
          <option value="karma">Top karma</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      {/* User Detail Panel */}
      {selectedUser && (
        <div style={{
          padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--accent)',
          marginBottom: 16, position: 'relative',
        }}>
          <button
            onClick={() => setSelectedUser(null)}
            style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
          >
            x
          </button>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: selectedUser.is_persona ? 'rgba(255,105,180,0.15)' : 'rgba(126,217,87,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 900,
              color: selectedUser.is_persona ? '#ff69b4' : 'var(--accent)',
            }}>
              {selectedUser.is_persona ? 'AI' : (selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0)).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                {selectedUser.full_name || 'No name'}
                {selectedUser.is_persona && <span style={{ marginLeft: 8, fontSize: '0.6rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,105,180,0.15)', color: '#ff69b4', fontWeight: 700 }}>PERSONA</span>}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0' }}>{selectedUser.email}</p>
              {selectedUser.username && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0' }}>@{selectedUser.username}</p>}
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem' }}>
                <span><strong style={{ color: 'var(--accent)' }}>{selectedUser.karma}</strong> karma</span>
                <span style={{ color: repColor(selectedUser.reputation_level) }}>{selectedUser.reputation_level}</span>
                <span>{selectedUser.onboarding_completed ? 'Onboarded' : 'Not onboarded'}</span>
                <span>Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
              </div>
              {selectedUser.bio && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>{selectedUser.bio}</p>}

              {/* Reset Password */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Password:</span>
                <button
                  onClick={() => handleResetPassword(selectedUser.id, 'generate')}
                  disabled={resetLoading}
                  style={{
                    padding: '4px 10px', borderRadius: 6, background: 'rgba(255,107,53,0.15)',
                    color: '#ff6b35', border: 'none', fontWeight: 700, fontSize: '0.625rem', cursor: 'pointer',
                  }}
                >
                  {resetLoading ? '...' : 'Generate New'}
                </button>
                <button
                  onClick={() => handleResetPassword(selectedUser.id, 'email')}
                  disabled={resetLoading}
                  style={{
                    padding: '4px 10px', borderRadius: 6, background: 'rgba(0,212,255,0.15)',
                    color: '#00d4ff', border: 'none', fontWeight: 700, fontSize: '0.625rem', cursor: 'pointer',
                  }}
                >
                  Send Reset Email
                </button>
                {resetMessage && (
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 600, wordBreak: 'break-all',
                    color: resetMessage.includes('fail') || resetMessage.includes('error') ? '#ff3d3d' : 'var(--accent)',
                  }}>
                    {resetMessage}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User List */}
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 8 }}>
        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredUsers.map(u => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
              borderRadius: 10, background: selectedUser?.id === u.id ? 'rgba(126,217,87,0.05)' : 'var(--bg-card)',
              border: '1px solid ' + (selectedUser?.id === u.id ? 'var(--accent)' : 'var(--border)'),
              cursor: 'pointer', transition: 'all 0.1s',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: u.is_persona ? 'rgba(255,105,180,0.15)' : 'rgba(126,217,87,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6875rem', fontWeight: 900,
              color: u.is_persona ? '#ff69b4' : 'var(--accent)', flexShrink: 0,
            }}>
              {u.is_persona ? 'AI' : (u.full_name?.charAt(0) || u.email.charAt(0)).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.full_name || u.email}
                </span>
                {u.is_persona && <span style={{ fontSize: '0.5rem', padding: '1px 4px', borderRadius: 3, background: 'rgba(255,105,180,0.15)', color: '#ff69b4', fontWeight: 700 }}>AI</span>}
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                {u.email} {u.username ? `(@${u.username})` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)' }}>{u.karma}</div>
              <div style={{ fontSize: '0.5625rem', color: repColor(u.reputation_level) }}>{u.reputation_level}</div>
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', flexShrink: 0, width: 60, textAlign: 'right' }}>
              {timeAgo(u.created_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  )
}

function repColor(level: string): string {
  const colors: Record<string, string> = {
    newcomer: '#888',
    member: '#00d4ff',
    contributor: '#9945ff',
    power_user: '#ff6b35',
    expert: '#FFD700',
    legend: '#ff69b4',
  }
  return colors[level] || '#888'
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

const inputStyle: React.CSSProperties = {
  flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-card)', color: 'var(--text)', fontSize: '0.8125rem', outline: 'none',
}
