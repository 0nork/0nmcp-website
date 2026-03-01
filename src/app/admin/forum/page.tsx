'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface Thread {
  id: string
  title: string
  slug: string
  body: string
  reply_count: number
  score: number
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  profiles: { full_name: string | null; email: string; is_persona: boolean } | null
  community_groups: { name: string; slug: string; color: string } | null
}

interface Group {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string
  is_default: boolean
  is_official: boolean
  member_count: number
  thread_count: number
}

interface ForumStats {
  threads: number
  posts: number
  groups: number
  votes: number
}

type Tab = 'threads' | 'groups'

export default function ForumModerationPage() {
  const supabase = createSupabaseBrowser()
  const [tab, setTab] = useState<Tab>('threads')
  const [threads, setThreads] = useState<Thread[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [stats, setStats] = useState<ForumStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return

    const [threadsRes, groupsRes, threadCount, postCount, groupCount, voteCount] = await Promise.all([
      supabase
        .from('community_threads')
        .select('id, title, slug, body, reply_count, score, is_pinned, is_locked, created_at, profiles!community_threads_user_id_fkey(full_name, email, is_persona), community_groups(name, slug, color)')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('community_groups').select('*').order('thread_count', { ascending: false }),
      supabase.from('community_threads').select('*', { count: 'exact', head: true }),
      supabase.from('community_posts').select('*', { count: 'exact', head: true }),
      supabase.from('community_groups').select('*', { count: 'exact', head: true }),
      supabase.from('community_votes').select('*', { count: 'exact', head: true }),
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (threadsRes.data) setThreads(threadsRes.data as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (groupsRes.data) setGroups(groupsRes.data as any)

    setStats({
      threads: threadCount.count || 0,
      posts: postCount.count || 0,
      groups: groupCount.count || 0,
      votes: voteCount.count || 0,
    })

    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function togglePin(threadId: string, current: boolean) {
    if (!supabase) return
    setActionLoading(threadId)
    await supabase.from('community_threads').update({ is_pinned: !current }).eq('id', threadId)
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_pinned: !current } : t))
    setActionLoading(null)
  }

  async function toggleLock(threadId: string, current: boolean) {
    if (!supabase) return
    setActionLoading(threadId)
    await supabase.from('community_threads').update({ is_locked: !current }).eq('id', threadId)
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, is_locked: !current } : t))
    setActionLoading(null)
  }

  async function deleteThread(threadId: string) {
    if (!supabase) return
    if (!confirm('Delete this thread and all its replies? This cannot be undone.')) return
    setActionLoading(threadId)
    // Delete replies first, then thread
    await supabase.from('community_posts').delete().eq('thread_id', threadId)
    await supabase.from('community_votes').delete().eq('thread_id', threadId)
    await supabase.from('community_threads').delete().eq('id', threadId)
    setThreads(prev => prev.filter(t => t.id !== threadId))
    setActionLoading(null)
  }

  const filteredThreads = threads.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (filterGroup && t.community_groups?.slug !== filterGroup) return false
    return true
  })

  if (loading) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>0n</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Loading forum...</p>
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
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Forum Moderation</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Forum Moderation</h1>
        </div>
        <Link href="/forum" style={{ ...btnStyle, textDecoration: 'none' }}>View Forum</Link>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          <StatBox label="Threads" value={stats.threads} color="#9945ff" />
          <StatBox label="Replies" value={stats.posts} color="#ff6b35" />
          <StatBox label="Groups" value={stats.groups} color="#00d4ff" />
          <StatBox label="Votes" value={stats.votes} color="var(--accent)" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {(['threads', 'groups'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
              color: tab === t ? '#000' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.75rem', textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Threads Tab */}
      {tab === 'threads' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              placeholder="Search threads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={inputStyle}
            />
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              style={{ ...inputStyle, width: 180 }}
            >
              <option value="">All groups</option>
              {groups.map(g => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredThreads.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: 20, textAlign: 'center' }}>No threads found.</p>
            )}
            {filteredThreads.map(t => (
              <div
                key={t.id}
                style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  opacity: actionLoading === t.id ? 0.5 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.is_pinned && <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(255,215,0,0.15)', color: '#FFD700', fontWeight: 700 }}>PINNED</span>}
                  {t.is_locked && <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(255,61,61,0.15)', color: '#ff3d3d', fontWeight: 700 }}>LOCKED</span>}
                  {t.profiles?.is_persona && <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(255,105,180,0.15)', color: '#ff69b4', fontWeight: 700 }}>AI</span>}
                  {t.community_groups && (
                    <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 4, background: t.community_groups.color + '15', color: t.community_groups.color, fontWeight: 700 }}>
                      {t.community_groups.name}
                    </span>
                  )}
                  <Link
                    href={`/forum/${t.slug}`}
                    style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)', textDecoration: 'none', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {t.title}
                  </Link>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {t.reply_count} replies &middot; score {t.score}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {t.profiles?.full_name || t.profiles?.email || 'Anonymous'} &middot; {timeAgo(t.created_at)}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => togglePin(t.id, t.is_pinned)} style={actionBtnStyle} title={t.is_pinned ? 'Unpin' : 'Pin'}>
                      {t.is_pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => toggleLock(t.id, t.is_locked)} style={actionBtnStyle} title={t.is_locked ? 'Unlock' : 'Lock'}>
                      {t.is_locked ? 'Unlock' : 'Lock'}
                    </button>
                    <button onClick={() => deleteThread(t.id)} style={{ ...actionBtnStyle, color: '#ff3d3d' }} title="Delete">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Groups Tab */}
      {tab === 'groups' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {groups.map(g => (
            <div key={g.id} style={{ padding: '16px 20px', borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '1.25rem' }}>{g.icon || '💬'}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: g.color }}>{g.name}</span>
                {g.is_official && <span style={{ fontSize: '0.5rem', padding: '1px 4px', borderRadius: 3, background: 'rgba(126,217,87,0.15)', color: 'var(--accent)', fontWeight: 700 }}>OFFICIAL</span>}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.4 }}>{g.description}</p>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                <span>{g.thread_count} threads</span>
                <span>{g.member_count} members</span>
              </div>
            </div>
          ))}
        </div>
      )}
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

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

const btnStyle: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer',
}

const inputStyle: React.CSSProperties = {
  flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-card)', color: 'var(--text)', fontSize: '0.8125rem', outline: 'none',
}

const actionBtnStyle: React.CSSProperties = {
  padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--text-muted)', fontSize: '0.625rem',
  fontWeight: 700, cursor: 'pointer',
}
