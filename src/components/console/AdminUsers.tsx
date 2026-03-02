'use client'

import { useState, useEffect, useCallback } from 'react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  company: string
  role: string
  is_admin: boolean
  onboarding_completed: boolean
  created_at: string
  post_count: number
  karma: number
  last_seen_at: string | null
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      setMessage('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const toggleAdmin = async (userId: string, currentAdmin: boolean) => {
    setActionLoading(userId)
    setMessage('')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, is_admin: !currentAdmin }),
      })
      const data = await res.json()
      if (data.error) {
        setMessage(data.error)
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentAdmin } : u))
        setMessage(`Admin ${!currentAdmin ? 'granted' : 'revoked'} for user`)
      }
    } catch {
      setMessage('Failed to update user')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (u.email || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.company || '').toLowerCase().includes(q)
  })

  const adminCount = users.filter(u => u.is_admin).length
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total', value: users.length, color: '#7ed957' },
          { label: 'Admins', value: adminCount, color: '#f97316' },
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

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or company..."
          style={{
            width: '100%', padding: '0.625rem 1rem', borderRadius: '0.625rem',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'inherit',
            outline: 'none',
          }}
        />
      </div>

      {message && (
        <div style={{
          padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.75rem',
          background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.2)',
          fontSize: '0.75rem', color: '#7ed957',
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr 0.75fr 0.5fr 0.75fr 0.75fr',
            padding: '0.625rem 1rem',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Posts</div>
            <div>Joined</div>
            <div>Actions</div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {search ? 'No users match your search' : 'No users found'}
            </div>
          ) : filtered.map((u, i) => (
            <div
              key={u.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr 0.75fr 0.5fr 0.75fr 0.75fr',
                padding: '0.625rem 1rem',
                background: i % 2 === 0 ? 'var(--bg-card)' : 'rgba(15,15,21,0.5)',
                borderBottom: '1px solid rgba(42,42,58,0.3)',
                alignItems: 'center',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {u.full_name || '—'}
                </span>
                {u.is_admin && (
                  <span style={{
                    fontSize: '0.6rem', padding: '0.1rem 0.375rem', borderRadius: '9999px',
                    background: 'rgba(126,217,87,0.12)', color: '#7ed957',
                    fontWeight: 700, letterSpacing: '0.03em',
                  }}>
                    ADMIN
                  </span>
                )}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                {u.email}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {u.role || 'member'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                {u.post_count || 0}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                {new Date(u.created_at).toLocaleDateString()}
              </div>
              <div>
                <button
                  onClick={() => toggleAdmin(u.id, u.is_admin)}
                  disabled={actionLoading === u.id}
                  style={{
                    padding: '0.2rem 0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)',
                    fontSize: '0.65rem', cursor: actionLoading === u.id ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', fontWeight: 600,
                  }}
                >
                  {actionLoading === u.id ? '...' : u.is_admin ? 'Revoke' : 'Grant'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
