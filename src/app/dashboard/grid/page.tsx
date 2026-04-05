'use client'

/**
 * /dashboard/grid — Native Grid Community
 * No iframe. Real data. Dashboard design language.
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutGrid, MessageSquare, ChevronUp, ChevronDown,
  Plus, ArrowLeft, Clock, User, Hash,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────────── */

interface Group {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  threadCount: number
}

interface ThreadAuthor {
  id: string
  full_name?: string
  email?: string
  avatar_url?: string
  karma?: number
  reputation_level?: string
}

interface Thread {
  id: string
  title: string
  slug: string
  body: string
  vote_count: number
  created_at: string
  group_id: string
  replyCount: number
  profiles?: ThreadAuthor
}

interface Post {
  id: string
  body: string
  vote_count: number
  created_at: string
  profiles?: ThreadAuthor
}

/* ─── Styles ─────────────────────────────────────────────── */

const BG = '#0B0F19'
const CARD = '#162032'
const CARD_BORDER = '#243042'
const TEXT = '#e1e8f0'
const TEXT_DIM = '#7d8a9a'
const TEXT_MUTED = '#4a5568'
const ACCENT = '#6EE05A'

/* ─── Component ──────────────────────────────────────────── */

export default function GridPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [activeGroup, setActiveGroup] = useState('all')
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [composing, setComposing] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')

  const fetchData = useCallback(async (group?: string, threadId?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (group && group !== 'all') params.set('group', group)
    if (threadId) params.set('thread', threadId)

    try {
      const res = await fetch(`/api/dashboard/grid?${params}`)
      const data = await res.json()
      setGroups(data.groups || [])
      if (data.thread) {
        setActiveThread(data.thread)
        setPosts(data.posts || [])
      } else {
        setThreads(data.threads || [])
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const selectGroup = (slug: string) => {
    setActiveGroup(slug)
    setActiveThread(null)
    fetchData(slug)
  }

  const openThread = (thread: Thread) => {
    setActiveThread(thread)
    fetchData(activeGroup, thread.id)
  }

  const backToThreads = () => {
    setActiveThread(null)
    setPosts([])
    fetchData(activeGroup)
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>

      {/* ── Header ──────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 1.75rem', borderBottom: `1px solid ${CARD_BORDER}`,
        position: 'sticky', top: 0, zIndex: 50, background: BG,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" style={{ color: TEXT_DIM, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} />
          </Link>
          <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={100} height={35} style={{ objectFit: 'contain' }} />
          <span style={{ color: TEXT_MUTED, fontSize: '0.875rem' }}>/</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutGrid size={18} style={{ color: ACCENT }} />
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Grid</span>
          </div>
        </div>
        <button
          onClick={() => setComposing(!composing)}
          style={{
            padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
            background: ACCENT, color: '#000', fontWeight: 700, fontSize: '0.875rem',
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}
        >
          <Plus size={16} /> New Thread
        </button>
      </header>

      <div style={{ display: 'flex', maxWidth: '1280px', margin: '0 auto' }}>

        {/* ── Groups Sidebar ────────────────────── */}
        <aside style={{
          width: '240px', flexShrink: 0, padding: '1.25rem 0.75rem',
          borderRight: `1px solid ${CARD_BORDER}`, minHeight: 'calc(100vh - 60px)',
        }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_MUTED, padding: '0 0.75rem', marginBottom: '0.75rem' }}>
            Groups
          </div>

          {/* All */}
          <button
            onClick={() => selectGroup('all')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.625rem 0.75rem', borderRadius: '10px', border: 'none',
              background: activeGroup === 'all' ? `${ACCENT}15` : 'transparent',
              color: activeGroup === 'all' ? TEXT : TEXT_DIM,
              fontSize: '0.875rem', fontWeight: activeGroup === 'all' ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              marginBottom: '0.25rem',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Hash size={16} style={{ color: activeGroup === 'all' ? ACCENT : TEXT_MUTED }} />
              All
            </span>
          </button>

          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => selectGroup(g.slug)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.625rem 0.75rem', borderRadius: '10px', border: 'none',
                background: activeGroup === g.slug ? `${ACCENT}15` : 'transparent',
                color: activeGroup === g.slug ? TEXT : TEXT_DIM,
                fontSize: '0.875rem', fontWeight: activeGroup === g.slug ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                marginBottom: '0.25rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Hash size={16} style={{ color: activeGroup === g.slug ? ACCENT : TEXT_MUTED }} />
                {g.name}
              </span>
              {g.threadCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: TEXT_MUTED }}>{g.threadCount}</span>
              )}
            </button>
          ))}

          {/* Back to Dashboard */}
          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <Link
              href="/dashboard"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 0.75rem', color: TEXT_MUTED, textDecoration: 'none',
                fontSize: '0.8125rem',
              }}
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
        </aside>

        {/* ── Main Content ──────────────────────── */}
        <main style={{ flex: 1, padding: '1.25rem 1.5rem', minWidth: 0 }}>

          {/* Compose */}
          {composing && (
            <div style={{
              padding: '1.25rem', borderRadius: '14px', background: CARD,
              border: `1px solid ${CARD_BORDER}`, marginBottom: '1.25rem',
            }}>
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Thread title"
                style={{
                  width: '100%', padding: '0.75rem', background: 'var(--bg-card)',
                  border: `1px solid ${CARD_BORDER}`, borderRadius: '10px',
                  color: TEXT, fontSize: '1rem', fontWeight: 600, outline: 'none',
                  fontFamily: 'inherit', marginBottom: '0.75rem',
                }}
              />
              <textarea
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                style={{
                  width: '100%', padding: '0.75rem', background: 'var(--bg-card)',
                  border: `1px solid ${CARD_BORDER}`, borderRadius: '10px',
                  color: TEXT, fontSize: '0.875rem', outline: 'none', resize: 'vertical',
                  fontFamily: 'inherit', marginBottom: '0.75rem', lineHeight: 1.6,
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{
                  padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
                  background: ACCENT, color: '#000', fontWeight: 700, fontSize: '0.8125rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Post Thread</button>
                <button onClick={() => setComposing(false)} style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', border: `1px solid ${CARD_BORDER}`,
                  background: 'transparent', color: TEXT_DIM, fontSize: '0.8125rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem', color: TEXT_MUTED }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', margin: '0 auto 1rem',
                border: `3px solid ${CARD_BORDER}`, borderTopColor: ACCENT,
                animation: 'grid-spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes grid-spin { to { transform: rotate(360deg) } }`}</style>
              Loading community...
            </div>
          )}

          {/* Thread Detail View */}
          {!loading && activeThread && (
            <div>
              <button onClick={backToThreads} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: 'none', border: 'none', color: ACCENT, fontSize: '0.8125rem',
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: '1rem', fontWeight: 600,
              }}>
                <ArrowLeft size={14} /> Back to threads
              </button>

              <div style={{
                padding: '1.5rem', borderRadius: '14px', background: CARD,
                border: `1px solid ${CARD_BORDER}`, marginBottom: '1rem',
              }}>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 800, margin: '0 0 0.75rem', lineHeight: 1.3 }}>
                  {activeThread.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.8125rem', color: TEXT_DIM }}>
                  <span style={{ fontWeight: 600, color: TEXT }}>{activeThread.profiles?.full_name || 'Anonymous'}</span>
                  <span>·</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={13} /> {timeAgo(activeThread.created_at)}
                  </span>
                </div>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'rgba(225,232,240,0.8)', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {activeThread.body}
                </p>
              </div>

              {/* Replies */}
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: TEXT_DIM, marginBottom: '0.75rem' }}>
                {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
              </h3>
              {posts.map(post => (
                <div key={post.id} style={{
                  padding: '1rem 1.25rem', borderRadius: '12px', background: CARD,
                  border: `1px solid ${CARD_BORDER}`, marginBottom: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: TEXT }}>{post.profiles?.full_name || 'Anonymous'}</span>
                    <span style={{ color: TEXT_MUTED }}>·</span>
                    <span style={{ color: TEXT_MUTED }}>{timeAgo(post.created_at)}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(225,232,240,0.75)', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {post.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Thread List */}
          {!loading && !activeThread && (
            <div>
              {threads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: TEXT_MUTED }}>
                  <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: TEXT, margin: '0 0 0.25rem' }}>No threads yet</p>
                  <p style={{ fontSize: '0.875rem' }}>Be the first to start a conversation.</p>
                </div>
              ) : (
                threads.map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => openThread(thread)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'flex-start', gap: '1rem',
                      padding: '1rem 1.25rem', borderRadius: '12px', border: `1px solid ${CARD_BORDER}`,
                      background: CARD, cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'inherit', marginBottom: '0.5rem',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `${ACCENT}44`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = CARD_BORDER)}
                  >
                    {/* Votes */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem', flexShrink: 0, minWidth: '32px' }}>
                      <ChevronUp size={16} style={{ color: TEXT_MUTED }} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: ACCENT }}>{thread.vote_count || 0}</span>
                      <ChevronDown size={16} style={{ color: TEXT_MUTED }} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: TEXT, margin: '0 0 0.375rem', lineHeight: 1.3 }}>
                        {thread.title}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: TEXT_DIM, margin: '0 0 0.5rem', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                        {thread.body}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: TEXT_MUTED }}>
                        <span>{thread.profiles?.full_name || 'Anonymous'}</span>
                        <span>·</span>
                        <span>{timeAgo(thread.created_at)}</span>
                        <span>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MessageSquare size={12} /> {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
