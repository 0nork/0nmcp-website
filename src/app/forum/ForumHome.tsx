'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  last_reply_at: string | null
  created_at: string
  profiles?: { full_name: string | null; email: string }
}

const CATEGORIES = [
  { value: 'all', label: 'All', color: 'var(--text)' },
  { value: 'general', label: 'General', color: '#00ff88' },
  { value: 'help', label: 'Help', color: '#ff6b35' },
  { value: 'showcase', label: 'Showcase', color: '#9945ff' },
  { value: 'feature-request', label: 'Feature Request', color: '#00d4ff' },
  { value: 'bug-report', label: 'Bug Report', color: '#ff3d3d' },
  { value: 'tutorial', label: 'Tutorial', color: '#FFD700' },
]

const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.value, c.color]))

export default function ForumHome() {
  const router = useRouter()
  const [threads, setThreads] = useState<Thread[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('recent')

  const load = useCallback(async () => {
    const params = new URLSearchParams({ sort })
    if (category !== 'all') params.set('category', category)
    const res = await fetch(`/api/community/threads?${params}`)
    if (res.ok) {
      const data = await res.json()
      setThreads(data.threads || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }, [category, sort])

  useEffect(() => { load() }, [load])

  function authorName(t: Thread) {
    return t.profiles?.full_name || t.profiles?.email?.split('@')[0] || 'Anonymous'
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-12 px-8 text-center relative">
        <div
          className="absolute w-[500px] h-[500px] top-[5%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)' }}
        />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 relative z-[2]">
          Community{' '}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' }}>
            Forum
          </span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto relative z-[2] mb-6">
          Ask questions, share automations, help others. Built on Supabase Realtime.
        </p>
        <button
          onClick={() => router.push('/forum/new')}
          className="px-5 py-2.5 rounded-xl font-bold text-sm relative z-[2] transition-all"
          style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
        >
          New Thread
        </button>
      </section>

      {/* Filters */}
      <section className="px-8 max-w-4xl mx-auto mb-4">
        <div className="flex gap-2 flex-wrap items-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
              style={{
                background: category === cat.value ? cat.color + '18' : 'var(--bg-card)',
                color: category === cat.value ? cat.color : 'var(--text-muted)',
                border: `1px solid ${category === cat.value ? cat.color + '30' : 'var(--border)'}`,
              }}
            >
              {cat.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            {['recent', 'popular', 'unanswered'].map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className="text-[10px] font-bold uppercase px-2 py-1 rounded"
                style={{
                  background: sort === s ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: sort === s ? 'var(--text)' : 'var(--text-muted)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
          {total} thread{total !== 1 ? 's' : ''}
        </div>
      </section>

      {/* Thread list */}
      <section className="px-8 max-w-4xl mx-auto pb-24">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Loading threads...</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm font-semibold mb-2">No threads yet</p>
            <p className="text-xs">Be the first to start a discussion!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {threads.map(thread => (
              <Link
                key={thread.id}
                href={`/forum/${thread.slug}`}
                className="block rounded-xl px-4 py-3 transition-all hover:scale-[1.005]"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {thread.is_pinned && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>
                      Pinned
                    </span>
                  )}
                  <span
                    className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ background: (CATEGORY_COLORS[thread.category] || '#fff') + '15', color: CATEGORY_COLORS[thread.category] || '#fff' }}
                  >
                    {thread.category}
                  </span>
                  {thread.is_locked && (
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>🔒</span>
                  )}
                </div>
                <h3 className="text-sm font-bold mb-0.5">{thread.title}</h3>
                <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <span>{authorName(thread)}</span>
                  <span>{thread.reply_count} repl{thread.reply_count !== 1 ? 'ies' : 'y'}</span>
                  <span>{thread.view_count} views</span>
                  <span className="ml-auto">{timeAgo(thread.last_reply_at || thread.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
