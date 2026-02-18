'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface Group {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string
  member_count: number
  thread_count: number
  is_official: boolean
}

interface Thread {
  id: string
  title: string
  slug: string
  category: string
  body: string
  is_pinned: boolean
  is_locked: boolean
  reply_count: number
  view_count: number
  score: number
  hot_score: number
  last_reply_at: string | null
  created_at: string
  profiles?: { full_name: string | null; email: string; karma?: number; reputation_level?: string }
  community_groups?: { name: string; slug: string; icon: string | null; color: string } | null
}

const SORTS = [
  { value: 'hot', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
  { value: 'controversial', label: 'Controversial' },
]

const TIMEFRAMES = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
]

export default function ForumHome() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [threads, setThreads] = useState<Thread[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})

  const group = searchParams.get('group') || 'all'
  const sort = searchParams.get('sort') || 'hot'
  const timeframe = searchParams.get('timeframe') || 'all'

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all' || (key === 'sort' && value === 'hot') || (key === 'timeframe' && value === 'all')) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/forum?${params.toString()}`)
  }, [searchParams, router])

  // Load groups
  useEffect(() => {
    fetch('/api/community/groups')
      .then(r => r.json())
      .then(d => setGroups(d.groups || []))
  }, [])

  // Load threads
  const loadThreads = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ sort, timeframe })
    if (group !== 'all') params.set('group', group)
    const res = await fetch(`/api/community/threads?${params}`)
    if (res.ok) {
      const data = await res.json()
      setThreads(data.threads || [])
      setTotal(data.total || 0)
      setUserVotes(data.userVotes || {})
    }
    setLoading(false)
  }, [group, sort, timeframe])

  useEffect(() => { loadThreads() }, [loadThreads])

  async function handleVote(threadId: string, vote: 1 | -1) {
    const res = await fetch('/api/community/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread_id: threadId, vote }),
    })
    if (res.ok) {
      const data = await res.json()
      // Optimistic update
      setUserVotes(prev => ({ ...prev, [threadId]: data.vote }))
      setThreads(prev => prev.map(t => {
        if (t.id !== threadId) return t
        const oldVote = userVotes[threadId] || 0
        return { ...t, score: t.score - oldVote + data.vote }
      }))
    }
  }

  function authorName(p?: { full_name: string | null; email: string }) {
    return p?.full_name || p?.email?.split('@')[0] || 'Anonymous'
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d`
    if (days < 365) return `${Math.floor(days / 30)}mo`
    return `${Math.floor(days / 365)}y`
  }

  function reputationColor(level?: string) {
    switch (level) {
      case 'legend': return '#ff69b4'
      case 'expert': return '#FFD700'
      case 'power_user': return '#ff6b35'
      case 'contributor': return '#9945ff'
      case 'member': return '#00d4ff'
      default: return 'var(--text-muted)'
    }
  }

  const activeGroup = groups.find(g => g.slug === group)

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto flex gap-6">

        {/* ==================== SIDEBAR ==================== */}
        <aside className="hidden lg:block w-[260px] flex-shrink-0">
          <div className="sticky top-28 flex flex-col gap-4">
            {/* New Thread Button */}
            <button
              onClick={() => router.push(`/forum/new${group !== 'all' ? `?group=${group}` : ''}`)}
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              + New Thread
            </button>

            {/* Groups */}
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Groups
              </h3>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setParam('group', 'all')}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-all"
                  style={{
                    background: group === 'all' ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: group === 'all' ? 'var(--text)' : 'var(--text-secondary)',
                  }}
                >
                  <span className="text-sm">🏠</span>
                  <span className="font-medium">All</span>
                </button>
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setParam('group', g.slug)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-all"
                    style={{
                      background: group === g.slug ? g.color + '12' : 'transparent',
                      color: group === g.slug ? g.color : 'var(--text-secondary)',
                    }}
                  >
                    <span className="text-sm">{g.icon || '💬'}</span>
                    <span className="font-medium flex-1 truncate">{g.name}</span>
                    <span className="text-[10px] opacity-50">{g.thread_count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Community
              </h3>
              <div className="flex flex-col gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex justify-between">
                  <span>Threads</span>
                  <span className="font-bold" style={{ color: 'var(--text)' }}>{total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Groups</span>
                  <span className="font-bold" style={{ color: 'var(--text)' }}>{groups.length}</span>
                </div>
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <a
                  href="https://0n.app.clientclub.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold no-underline hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Join Community Portal →
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* ==================== MAIN FEED ==================== */}
        <main className="flex-1 min-w-0">
          {/* Group Header */}
          {activeGroup && (
            <div
              className="rounded-xl p-5 mb-4 flex items-center gap-4"
              style={{ background: activeGroup.color + '08', border: `1px solid ${activeGroup.color}20` }}
            >
              <span className="text-3xl">{activeGroup.icon || '💬'}</span>
              <div>
                <h1 className="text-xl font-bold" style={{ color: activeGroup.color }}>{activeGroup.name}</h1>
                {activeGroup.description && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{activeGroup.description}</p>
                )}
              </div>
              <div className="ml-auto text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="font-bold" style={{ color: 'var(--text)' }}>{activeGroup.member_count}</div>
                <div>members</div>
              </div>
            </div>
          )}

          {/* Sort Bar */}
          <div
            className="rounded-xl px-4 py-2 mb-3 flex items-center gap-1 flex-wrap"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {SORTS.map(s => (
              <button
                key={s.value}
                onClick={() => setParam('sort', s.value)}
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: sort === s.value ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: sort === s.value ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {s.label}
              </button>
            ))}
            {(sort === 'top' || sort === 'controversial') && (
              <>
                <span className="text-[10px] mx-1" style={{ color: 'var(--border)' }}>|</span>
                {TIMEFRAMES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setParam('timeframe', t.value)}
                    className="text-[10px] font-semibold px-2 py-1 rounded transition-all"
                    style={{
                      background: timeframe === t.value ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: timeframe === t.value ? 'var(--text)' : 'var(--text-muted)',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </>
            )}
            <div className="ml-auto text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {total} thread{total !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Mobile New Thread */}
          <button
            onClick={() => router.push(`/forum/new${group !== 'all' ? `?group=${group}` : ''}`)}
            className="lg:hidden w-full py-2.5 rounded-xl font-bold text-sm mb-3 transition-all"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            + New Thread
          </button>

          {/* Thread List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Loading...</p>
            </div>
          ) : threads.length === 0 ? (
            <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
              <p className="text-base font-bold mb-1">No threads yet</p>
              <p className="text-sm">Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {threads.map(thread => {
                const myVote = userVotes[thread.id] || 0
                const groupData = thread.community_groups

                return (
                  <div
                    key={thread.id}
                    className="rounded-xl flex transition-all"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    {/* Vote Column */}
                    <div className="flex flex-col items-center py-2 px-2 gap-0.5 flex-shrink-0" style={{ minWidth: '44px' }}>
                      <button
                        onClick={(e) => { e.preventDefault(); handleVote(thread.id, 1) }}
                        className="w-7 h-7 flex items-center justify-center rounded-md transition-all text-sm"
                        style={{
                          color: myVote === 1 ? '#ff6b35' : 'var(--text-muted)',
                          background: myVote === 1 ? 'rgba(255,107,53,0.1)' : 'transparent',
                        }}
                        title="Upvote"
                      >
                        ▲
                      </button>
                      <span
                        className="text-xs font-bold tabular-nums"
                        style={{
                          color: thread.score > 0 ? '#ff6b35' : thread.score < 0 ? '#9945ff' : 'var(--text-muted)',
                        }}
                      >
                        {thread.score}
                      </span>
                      <button
                        onClick={(e) => { e.preventDefault(); handleVote(thread.id, -1) }}
                        className="w-7 h-7 flex items-center justify-center rounded-md transition-all text-sm"
                        style={{
                          color: myVote === -1 ? '#9945ff' : 'var(--text-muted)',
                          background: myVote === -1 ? 'rgba(153,69,255,0.1)' : 'transparent',
                        }}
                        title="Downvote"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Content */}
                    <Link
                      href={`/forum/${thread.slug}`}
                      className="flex-1 py-2.5 pr-4 min-w-0 no-underline"
                    >
                      {/* Meta line */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        {groupData && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: groupData.color + '15', color: groupData.color }}
                          >
                            {groupData.icon} {groupData.name}
                          </span>
                        )}
                        {thread.is_pinned && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>
                            Pinned
                          </span>
                        )}
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <span
                            className="font-semibold"
                            style={{ color: reputationColor(thread.profiles?.reputation_level) }}
                          >
                            {authorName(thread.profiles)}
                          </span>
                          {thread.profiles?.karma ? (
                            <span className="ml-1 opacity-50">({thread.profiles.karma} karma)</span>
                          ) : null}
                          <span className="mx-1">·</span>
                          <span>{timeAgo(thread.created_at)}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold mb-1 leading-snug" style={{ color: 'var(--text)' }}>
                        {thread.is_locked && <span className="mr-1 opacity-50">🔒</span>}
                        {thread.title}
                      </h3>

                      {/* Preview */}
                      <p className="text-xs leading-relaxed mb-1.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {thread.body.slice(0, 200)}
                      </p>

                      {/* Actions bar */}
                      <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        <span>💬 {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}</span>
                        <span>👁 {thread.view_count}</span>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
