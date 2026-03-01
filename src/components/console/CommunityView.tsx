'use client'

import { useState, useEffect, useCallback } from 'react'

interface ThreadProfile {
  full_name: string | null
  avatar_url: string | null
}

interface ThreadGroup {
  name: string
  slug: string
  icon: string | null
  color: string | null
}

interface Thread {
  id: string
  title: string
  slug: string
  body: string
  score: number
  reply_count: number
  created_at: string
  is_pinned: boolean
  profiles: ThreadProfile | null
  community_groups: ThreadGroup | null
}

interface Group {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  thread_count: number
}

export function CommunityView() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroup, setActiveGroup] = useState('all')
  const [sort, setSort] = useState('hot')
  const [loading, setLoading] = useState(true)

  // New thread
  const [composing, setComposing] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [posting, setPosting] = useState(false)

  const fetchThreads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ sort, limit: '20' })
      if (activeGroup !== 'all') params.set('group', activeGroup)

      const res = await fetch(`/api/community/threads?${params}`)
      if (res.ok) {
        const data = await res.json()
        setThreads(data.threads || [])
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [activeGroup, sort])

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/community/groups')
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups || data || [])
      }
    } catch {
      // Ignore
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  const handleCreateThread = async () => {
    if (!newTitle.trim() || !newBody.trim()) return
    setPosting(true)
    try {
      const res = await fetch('/api/community/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          body: newBody,
          group_slug: activeGroup !== 'all' ? activeGroup : 'general',
        }),
      })
      if (res.ok) {
        setNewTitle('')
        setNewBody('')
        setComposing(false)
        fetchThreads()
      }
    } catch {
      // Ignore
    } finally {
      setPosting(false)
    }
  }

  const handleVote = async (threadId: string, vote: 1 | -1) => {
    try {
      await fetch('/api/community/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId, vote }),
      })
      // Optimistic update
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, score: t.score + vote } : t
        )
      )
    } catch {
      // Ignore
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 20,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    backgroundColor: active ? 'var(--accent-glow)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  })

  return (
    <div
      style={{
        padding: 24,
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.02em' }}>
            Community
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Discuss, share, and get help from the 0nMCP community
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setComposing(true)}
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: '#0a0a0f',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            + New Thread
          </button>
          <a
            href="/forum"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'none',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Full Forum
          </a>
        </div>
      </div>

      {/* Group tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setActiveGroup('all')} style={tabStyle(activeGroup === 'all')}>All</button>
        {groups.map((g) => (
          <button key={g.slug} onClick={() => setActiveGroup(g.slug)} style={tabStyle(activeGroup === g.slug)}>
            {g.icon} {g.name}
          </button>
        ))}
      </div>

      {/* Sort tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['hot', 'new', 'top'].map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            style={{
              padding: '4px 12px',
              borderRadius: 8,
              border: sort === s ? '1px solid var(--accent)' : '1px solid var(--border)',
              background: sort === s ? 'var(--accent-glow)' : 'none',
              color: sort === s ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              textTransform: 'capitalize' as const,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* New thread composer */}
      {composing && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--accent)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Thread title..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: 'var(--text-primary)',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              outline: 'none',
              marginBottom: 10,
            }}
          />
          <textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'vertical',
              marginBottom: 12,
            }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleCreateThread}
              disabled={posting || !newTitle.trim() || !newBody.trim()}
              style={{
                padding: '8px 20px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                color: '#0a0a0f',
                fontSize: 13,
                fontWeight: 600,
                cursor: posting ? 'wait' : 'pointer',
                opacity: posting ? 0.6 : 1,
                fontFamily: 'var(--font-display)',
              }}
            >
              {posting ? 'Posting...' : 'Post Thread'}
            </button>
            <button
              onClick={() => { setComposing(false); setNewTitle(''); setNewBody('') }}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'none',
                color: 'var(--text-muted)',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Thread list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
          Loading threads...
        </div>
      ) : threads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
          No threads yet. Be the first to post!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {threads.map((thread) => (
            <div
              key={thread.id}
              style={{
                display: 'flex',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 12,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                transition: 'border-color 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              onClick={() => window.open(`/forum/${thread.slug}`, '_blank')}
            >
              {/* Vote column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  minWidth: 36,
                  flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleVote(thread.id, 1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: '2px 4px',
                    borderRadius: 4,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  ▲
                </button>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: thread.score > 0 ? 'var(--accent)' : thread.score < 0 ? '#ff3b30' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {thread.score}
                </span>
                <button
                  onClick={() => handleVote(thread.id, -1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: '2px 4px',
                    borderRadius: 4,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ff3b30')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  ▼
                </button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  {thread.is_pinned && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#7ed957', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>PINNED</span>
                  )}
                  {thread.community_groups && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: thread.community_groups.color || 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {thread.community_groups.icon} {thread.community_groups.name}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                  {thread.title}
                </h3>

                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    margin: '0 0 8px 0',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                  }}
                >
                  {thread.body}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>{thread.profiles?.full_name || 'Anonymous'}</span>
                  <span>{timeAgo(thread.created_at)}</span>
                  <span>{thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
