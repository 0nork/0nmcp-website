'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * 0nboard Forum — Clean public SEO layer
 * Light theme, modern cards, drives users to Grid for premium features.
 */

interface Group {
  id: string; name: string; slug: string; description: string | null
  icon: string | null; color: string; member_count: number; thread_count: number
}

interface Thread {
  id: string; title: string; slug: string; category: string; body: string
  is_pinned: boolean; is_locked: boolean; reply_count: number; view_count: number
  score: number; hot_score: number; created_at: string; user_id: string
  profiles?: { full_name: string | null; email: string; karma?: number; reputation_level?: string; avatar_url?: string | null }
  community_groups?: { name: string; slug: string; icon: string | null; color: string } | null
}

const SORTS = [
  { value: 'hot', label: 'Trending' },
  { value: 'new', label: 'Latest' },
  { value: 'top', label: 'Top' },
]

export default function ForumClient({
  initialThreads, initialGroups, initialTotal,
}: {
  initialThreads: Thread[]; initialGroups: Group[]; initialTotal: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [threads, setThreads] = useState<Thread[]>(initialThreads)
  const [groups] = useState<Group[]>(initialGroups)
  const [total, setTotal] = useState(initialTotal)
  const [loading, setLoading] = useState(false)
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})
  const group = searchParams.get('group') || 'all'
  const sort = searchParams.get('sort') || 'hot'
  const isInitialMount = useRef(true)

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || (key === 'sort' && value === 'hot')) params.delete(key)
    else params.set(key, value)
    router.push(`/forum?${params.toString()}`)
  }, [searchParams, router])

  const loadThreads = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ sort })
    if (group !== 'all') params.set('group', group)
    const res = await fetch(`/api/community/threads?${params}`)
    if (res.ok) {
      const data = await res.json()
      setThreads(data.threads || [])
      setTotal(data.total || 0)
      setUserVotes(data.userVotes || {})
    }
    setLoading(false)
  }, [group, sort])

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return }
    loadThreads()
  }, [loadThreads])

  useEffect(() => {
    if (initialThreads.length > 0) {
      fetch('/api/community/threads?sort=hot&limit=1').then(r => r.json()).then(d => { if (d.userVotes) setUserVotes(d.userVotes) }).catch(() => {})
    }
  }, [initialThreads.length])

  async function handleVote(threadId: string, vote: 1 | -1) {
    const res = await fetch('/api/community/votes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread_id: threadId, vote }),
    })
    if (res.ok) {
      const data = await res.json()
      setUserVotes(prev => ({ ...prev, [threadId]: data.vote }))
      setThreads(prev => prev.map(t => t.id !== threadId ? t : { ...t, score: t.score - (userVotes[threadId] || 0) + data.vote }))
    }
  }

  function authorName(p?: { full_name: string | null; email: string }) {
    return p?.full_name || p?.email?.split('@')[0] || 'Anonymous'
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '6rem 1.5rem 4rem' }}>
      <style>{`
        .forum-layout {
          display: grid;
          grid-template-columns: 220px minmax(0, 680px) 260px;
          gap: 2rem;
          align-items: start;
          justify-content: center;
          max-width: 1400px;
          margin: 0 auto;
        }
        @media (max-width: 1200px) {
          .forum-layout { grid-template-columns: minmax(0, 680px) 260px; gap: 1.75rem; }
          .forum-sidebar-left { display: none; }
        }
        @media (max-width: 860px) {
          .forum-layout { grid-template-columns: minmax(0, 1fr); max-width: 680px; }
          .forum-sidebar-left { display: none; }
          .forum-sidebar { order: 2; }
        }

        .forum-thread {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          transition: all 0.2s;
          text-decoration: none;
          display: block;
          color: inherit;
        }
        .forum-thread:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .forum-thread-pinned {
          border-left: 3px solid #6EE05A;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a', margin: 0, letterSpacing: '-0.02em' }}>
            Community
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: '0.25rem 0 0' }}>
            {total} discussions across {groups.length} topics
          </p>
        </div>
        <Link href="/forum/new" style={{
          padding: '8px 18px', borderRadius: 8, background: '#6EE05A', color: '#000',
          fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(110,224,90,0.2)',
        }}>
          New Thread
        </Link>
      </div>

      <div className="forum-layout">
        {/* ── Left Sidebar: Quick Nav ── */}
        <div className="forum-sidebar-left" style={{ position: 'sticky', top: '5.5rem', maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
          <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1.125rem 1.25rem' }}>
            <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid #6EE05A' }}>
              Quick Nav
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {groups.slice(0, 8).map(g => (
                <button key={g.slug} onClick={() => setParam('group', g.slug)} style={{
                  display: 'flex', justifyContent: 'space-between', width: '100%',
                  padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: group === g.slug ? 'rgba(110,224,90,0.06)' : 'transparent',
                  color: group === g.slug ? '#6EE05A' : '#6b7280',
                  fontSize: '0.75rem', fontWeight: 600, textAlign: 'left',
                  borderLeft: group === g.slug ? '2px solid #6EE05A' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}>
                  <span>{g.name}</span>
                  <span style={{ fontSize: '0.625rem', color: '#9ca3af' }}>{g.thread_count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1rem 1.125rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Threads', value: total },
                { label: 'Topics', value: groups.length },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: '#9ca3af' }}>{s.label}</span>
                  <span style={{ color: '#1a1a1a', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Feed ── */}
        <div>
          {/* Sort + Filter Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, marginBottom: '1rem',
            padding: '6px', borderRadius: 10, background: '#f3f4f6',
          }}>
            {SORTS.map(s => (
              <button key={s.value} onClick={() => setParam('sort', s.value)} style={{
                padding: '6px 14px', borderRadius: 7, border: 'none',
                background: sort === s.value ? '#fff' : 'transparent',
                color: sort === s.value ? '#1a1a1a' : '#9ca3af',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: sort === s.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
                {s.label}
              </button>
            ))}
            {group !== 'all' && (
              <button onClick={() => setParam('group', 'all')} style={{
                marginLeft: 'auto', padding: '4px 10px', borderRadius: 6,
                border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280',
                fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Clear filter
              </button>
            )}
          </div>

          {/* Thread List */}
          {loading ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
          ) : threads.length === 0 ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: '#9ca3af' }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>No threads yet</p>
              <p style={{ fontSize: '0.875rem' }}>Be the first to start a discussion!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {threads.map(thread => {
                const myVote = userVotes[thread.id] || 0
                const groupData = thread.community_groups
                return (
                  <Link
                    key={thread.id}
                    href={`/forum/${thread.slug}`}
                    className={`forum-thread ${thread.is_pinned ? 'forum-thread-pinned' : ''}`}
                  >
                    {/* Meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                      {groupData && (
                        <span style={{
                          fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                          background: `${groupData.color}12`, color: groupData.color,
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {groupData.name}
                        </span>
                      )}
                      {thread.is_pinned && (
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'rgba(110,224,90,0.08)', color: '#6EE05A' }}>
                          Pinned
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        <span style={{ fontWeight: 600, color: '#6b7280' }}>{authorName(thread.profiles)}</span>
                        {' '}&middot;{' '}{timeAgo(thread.created_at)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.375rem', lineHeight: 1.35 }}>
                      {thread.title}
                    </h3>

                    {/* Preview */}
                    <p style={{
                      fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 0.625rem',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                    }}>
                      {thread.body.slice(0, 200)}
                    </p>

                    {/* Footer stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        color: myVote === 1 ? '#6EE05A' : myVote === -1 ? '#ef4444' : '#9ca3af',
                        fontWeight: 600,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3l4 5H4l4-5z" fill="currentColor"/></svg>
                        {thread.score}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        {thread.reply_count}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        {thread.view_count}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Right Sidebar ── */}
        <div className="forum-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Grid CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #0B0F19, #162032)',
            borderRadius: 14, padding: '1.5rem', textAlign: 'center',
            border: '1px solid rgba(110,224,90,0.15)',
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E8EAED', marginBottom: 6 }}>
              Join the <span style={{ color: '#6EE05A' }}>Grid</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#7A8290', lineHeight: 1.6, marginBottom: '1rem' }}>
              Unlock gamification, leaderboards, events, AI courses, and affiliate rewards.
            </p>
            <Link href="/grid" style={{
              display: 'block', padding: '10px', borderRadius: 8, background: '#6EE05A', color: '#000',
              fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center',
            }}>
              Enter the Grid
            </Link>
          </div>

          {/* Topics */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1rem 1.125rem',
          }}>
            <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid #6EE05A' }}>
              Topics
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => setParam('group', 'all')} style={{
                display: 'flex', justifyContent: 'space-between', width: '100%',
                padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: group === 'all' ? 'rgba(110,224,90,0.06)' : 'transparent',
                color: group === 'all' ? '#6EE05A' : '#6b7280',
                fontSize: '0.8125rem', fontWeight: 600, textAlign: 'left',
              }}>
                <span>All Topics</span>
                <span style={{ fontSize: '0.6875rem', color: '#9ca3af', background: '#f3f4f6', padding: '1px 8px', borderRadius: 10 }}>{total}</span>
              </button>
              {groups.map(g => (
                <button key={g.slug} onClick={() => setParam('group', g.slug)} style={{
                  display: 'flex', justifyContent: 'space-between', width: '100%',
                  padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: group === g.slug ? 'rgba(110,224,90,0.06)' : 'transparent',
                  color: group === g.slug ? '#6EE05A' : '#6b7280',
                  fontSize: '0.8125rem', fontWeight: 600, textAlign: 'left',
                }}>
                  <span>{g.name}</span>
                  <span style={{ fontSize: '0.6875rem', color: '#9ca3af', background: '#f3f4f6', padding: '1px 8px', borderRadius: 10 }}>{g.thread_count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1rem 1.125rem',
          }}>
            <h4 style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem', paddingBottom: '0.5rem', borderBottom: '2px solid #6EE05A' }}>
              About
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
              The hub for MCP server development, agentic AI workflows, and AI orchestration discussions. Built on 0nMCP.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
