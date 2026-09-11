'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface TokenEntry {
  id: string
  label: string
  permissions: string[]
  expires_at: string | null
  created_at: string | null
  last_used_at: string | null
  is_revoked: boolean
  token_preview: string
  tokenType: 'master' | 'scoped'
}

type ExpiryOption = '1h' | '24h' | '7d' | '30d' | '90d' | 'forever'

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: '1h', label: '1 hour' },
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'forever', label: 'Forever' },
]

const PERMISSION_GROUPS = [
  { key: 'all', label: 'Full Access', description: 'Unrestricted access to all services' },
  { key: 'crm:read', label: 'CRM Read', description: 'Read contacts, pipelines, conversations' },
  { key: 'crm:write', label: 'CRM Write', description: 'Create and update CRM records' },
  { key: 'stripe:read', label: 'Stripe Read', description: 'View payments, subscriptions, invoices' },
  { key: 'stripe:write', label: 'Stripe Write', description: 'Create charges, manage subscriptions' },
  { key: 'slack:read', label: 'Slack Read', description: 'Read messages and channels' },
  { key: 'slack:write', label: 'Slack Write', description: 'Send messages, manage channels' },
  { key: 'ai:chat', label: 'AI Chat', description: 'Use AI chat completions' },
  { key: 'workflows:run', label: 'Workflows Run', description: 'Execute existing workflows' },
  { key: 'workflows:create', label: 'Workflows Create', description: 'Create and edit workflows' },
]

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function permissionSummary(perms: string[]): string {
  if (!perms || perms.length === 0 || perms.includes('all')) return 'Full access'
  return perms.map(p => {
    const parts = p.split(':')
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)}${parts[1] ? ' ' + parts[1] : ''}`
  }).join(', ')
}

export default function TokenPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [tokens, setTokens] = useState<TokenEntry[]>([])
  const [revealedTokens, setRevealedTokens] = useState<Record<string, string>>({})
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set())
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<{ token: string; label: string } | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Advanced form state
  const [newLabel, setNewLabel] = useState('')
  const [newExpiry, setNewExpiry] = useState<ExpiryOption>('forever')
  const [newPermissions, setNewPermissions] = useState<string[]>(['all'])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchTokens = useCallback(async () => {
    const res = await fetch('/api/token')
    if (res.ok) {
      const data = await res.json()
      setTokens(data.tokens || [])
    }
  }, [])

  useEffect(() => {
    async function init() {
      const user = (await supabase.auth.getSession()).data.session?.user ?? null
      if (!user) {
        router.push('/login?redirect=/connect/token')
        return
      }
      setAuthed(true)
      await fetchTokens()
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const masterToken = tokens.find(t => t.tokenType === 'master')
  const scopedTokens = tokens.filter(t => t.tokenType === 'scoped')

  async function handleRevealMaster() {
    if (revealedTokens['master']) {
      toggleVisibility('master')
      return
    }
    // Fetch the actual master token (only time we fetch full token for master)
    const res = await fetch('/api/token')
    if (!res.ok) return
    // We need a dedicated endpoint or use existing GET that returns the full master token
    // Actually the GET /api/token only returns previews. For master reveal, we call the old GET behavior.
    // Let's fetch it via a separate mechanism — we stored it in profiles
    // Actually the task says the full token is ONLY shown once after creation. For master, we allow reveal.
    // Let me use a query param to get the full token
    setError('Use "Generate New Token" to see your full master token')
  }

  function toggleVisibility(id: string) {
    setVisibleTokens(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleCopy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  async function handleRegenerateMaster() {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'master' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to regenerate')
        return
      }
      setNewlyCreatedToken({ token: data.token, label: 'Master Token' })
      setRevealedTokens(prev => ({ ...prev, master: data.token }))
      setVisibleTokens(prev => new Set(prev).add('master'))
      await fetchTokens()
    } finally {
      setCreating(false)
    }
  }

  async function handleCreateScoped() {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'scoped',
          label: newLabel || 'My Token',
          permissions: newPermissions,
          expires_in: newExpiry,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create token')
        return
      }
      setNewlyCreatedToken({ token: data.token, label: data.label })
      setRevealedTokens(prev => ({ ...prev, [data.id]: data.token }))
      setVisibleTokens(prev => new Set(prev).add(data.id))
      setNewLabel('')
      setNewExpiry('forever')
      setNewPermissions(['all'])
      await fetchTokens()
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id)
    setError(null)
    try {
      const res = await fetch('/api/token', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to revoke')
        return
      }
      await fetchTokens()
    } finally {
      setRevoking(null)
    }
  }

  function togglePermission(perm: string) {
    if (perm === 'all') {
      setNewPermissions(['all'])
      return
    }
    setNewPermissions(prev => {
      const filtered = prev.filter(p => p !== 'all')
      if (filtered.includes(perm)) {
        const next = filtered.filter(p => p !== perm)
        return next.length === 0 ? ['all'] : next
      }
      return [...filtered, perm]
    })
  }

  if (loading || !authed) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-muted)',
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: '48px 16px',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 8,
          color: 'var(--text-primary)',
        }}>
          Your 0n Access Token
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          marginBottom: 32,
          lineHeight: 1.6,
        }}>
          Use this token to connect 0nMCP anywhere — Claude, Slack, Cursor, CLI
        </p>

        {/* New token banner */}
        {newlyCreatedToken && (
          <div style={{
            padding: '16px 20px',
            borderRadius: 10,
            marginBottom: 24,
            backgroundColor: 'var(--accent-glow)',
            border: '1px solid var(--accent-dim)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: 'var(--accent)',
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                {newlyCreatedToken.label} created
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Copy this token now — you won&apos;t see it again
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'var(--bg-card)',
              padding: '10px 14px',
              borderRadius: 8,
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 13,
              wordBreak: 'break-all',
              color: 'var(--text-primary)',
            }}>
              <span style={{ flex: 1 }}>{newlyCreatedToken.token}</span>
              <button
                onClick={() => handleCopy(newlyCreatedToken.token, 'new')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {copiedId === 'new' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => setNewlyCreatedToken(null)}
              style={{
                marginTop: 10,
                fontSize: 12,
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: 13,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}
            >
              x
            </button>
          </div>
        )}

        {/* Master Token Card */}
        {masterToken && (
          <div style={{
            padding: '20px 24px',
            borderRadius: 12,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            marginBottom: 24,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 8,
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 14,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}>
              <span style={{ flex: 1 }}>
                {visibleTokens.has('master') && revealedTokens['master']
                  ? revealedTokens['master']
                  : masterToken.token_preview.replace('...', '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022')
                }
              </span>
              {revealedTokens['master'] && (
                <button
                  onClick={() => toggleVisibility('master')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {visibleTokens.has('master') ? 'Hide' : 'Reveal'}
                </button>
              )}
              {revealedTokens['master'] && (
                <button
                  onClick={() => handleCopy(revealedTokens['master'], 'master')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {copiedId === 'master' ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px 24px',
              marginTop: 16,
              fontSize: 13,
              color: 'var(--text-muted)',
            }}>
              <span>Permissions: <strong style={{ color: 'var(--text-secondary)' }}>Full access</strong></span>
              <span>Expires: <strong style={{ color: 'var(--text-secondary)' }}>Never</strong></span>
              {masterToken.created_at && (
                <span>Created: <strong style={{ color: 'var(--text-secondary)' }}>{timeAgo(masterToken.created_at)}</strong></span>
              )}
            </div>

            <button
              onClick={handleRegenerateMaster}
              disabled={creating}
              style={{
                marginTop: 20,
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: 'var(--accent)',
                color: '#000',
                fontSize: 14,
                fontWeight: 600,
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.6 : 1,
                width: '100%',
              }}
            >
              {creating ? 'Generating...' : 'Generate New Token'}
            </button>
          </div>
        )}

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 0',
            fontSize: 13,
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <span style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: 1,
            backgroundColor: 'var(--border)',
            zIndex: 0,
          }} />
          <span style={{
            position: 'relative',
            zIndex: 1,
            backgroundColor: 'var(--bg-primary)',
            padding: '0 16px',
          }}>
            Advanced {showAdvanced ? '\u25B4' : '\u25BE'}
          </span>
        </button>

        {/* Advanced section */}
        {showAdvanced && (
          <div style={{ marginTop: 16 }}>
            {/* Create scoped token form */}
            <div style={{
              padding: '20px 24px',
              borderRadius: 12,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              marginBottom: 24,
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
                Create Scoped Token
              </h2>

              {/* Label */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="My Token"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Expiry */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Expires
                </label>
                <select
                  value={newExpiry}
                  onChange={e => setNewExpiry(e.target.value as ExpiryOption)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {EXPIRY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                  Permissions
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {PERMISSION_GROUPS.map(pg => (
                    <label
                      key={pg.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        backgroundColor: (newPermissions.includes(pg.key) || (pg.key !== 'all' && newPermissions.includes('all')))
                          ? 'var(--accent-glow)'
                          : 'transparent',
                        cursor: 'pointer',
                        fontSize: 13,
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={newPermissions.includes(pg.key) || (pg.key !== 'all' && newPermissions.includes('all'))}
                        onChange={() => togglePermission(pg.key)}
                        disabled={pg.key !== 'all' && newPermissions.includes('all')}
                        style={{ marginTop: 2, accentColor: 'var(--accent)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{pg.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{pg.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateScoped}
                disabled={creating}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: 'var(--accent)',
                  color: '#000',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.6 : 1,
                  width: '100%',
                }}
              >
                {creating ? 'Creating...' : 'Create Scoped Token'}
              </button>
            </div>

            {/* Active tokens list */}
            {scopedTokens.length > 0 && (
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
                  Scoped Tokens ({scopedTokens.filter(t => !t.is_revoked).length} active)
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {scopedTokens.map(token => (
                    <div
                      key={token.id}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 10,
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        opacity: token.is_revoked ? 0.5 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                            {token.label}
                          </span>
                          {token.is_revoked && (
                            <span style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                            }}>
                              Revoked
                            </span>
                          )}
                          {!token.is_revoked && token.expires_at && new Date(token.expires_at) < new Date() && (
                            <span style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 4,
                              backgroundColor: 'rgba(251, 191, 36, 0.15)',
                              color: '#fbbf24',
                            }}>
                              Expired
                            </span>
                          )}
                        </div>
                        {!token.is_revoked && (
                          <button
                            onClick={() => handleRevoke(token.id)}
                            disabled={revoking === token.id}
                            style={{
                              padding: '4px 12px',
                              borderRadius: 6,
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              backgroundColor: 'transparent',
                              color: '#ef4444',
                              fontSize: 12,
                              cursor: revoking === token.id ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {revoking === token.id ? 'Revoking...' : 'Revoke'}
                          </button>
                        )}
                      </div>

                      {/* Token preview */}
                      <div style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                        <span>
                          {visibleTokens.has(token.id) && revealedTokens[token.id]
                            ? revealedTokens[token.id]
                            : token.token_preview
                          }
                        </span>
                        {revealedTokens[token.id] && (
                          <>
                            <button
                              onClick={() => toggleVisibility(token.id)}
                              style={{
                                padding: '2px 8px',
                                borderRadius: 4,
                                border: '1px solid var(--border)',
                                backgroundColor: 'transparent',
                                color: 'var(--text-muted)',
                                fontSize: 11,
                                cursor: 'pointer',
                              }}
                            >
                              {visibleTokens.has(token.id) ? 'Hide' : 'Reveal'}
                            </button>
                            <button
                              onClick={() => handleCopy(revealedTokens[token.id], token.id)}
                              style={{
                                padding: '2px 8px',
                                borderRadius: 4,
                                border: '1px solid var(--border)',
                                backgroundColor: 'transparent',
                                color: 'var(--text-muted)',
                                fontSize: 11,
                                cursor: 'pointer',
                              }}
                            >
                              {copiedId === token.id ? 'Copied!' : 'Copy'}
                            </button>
                          </>
                        )}
                      </div>

                      {/* Meta info */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px 16px',
                        fontSize: 12,
                        color: 'var(--text-muted)',
                      }}>
                        <span>Permissions: {permissionSummary(token.permissions)}</span>
                        <span>Created: {timeAgo(token.created_at)}</span>
                        <span>Last used: {timeAgo(token.last_used_at)}</span>
                        <span>Expires: {token.expires_at ? timeAgo(token.expires_at) : 'Never'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
