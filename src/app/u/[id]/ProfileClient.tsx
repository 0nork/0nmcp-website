'use client'

import { useState } from 'react'
import Link from 'next/link'

interface BadgeInfo {
  name: string
  slug: string
  icon: string
  description: string
  color: string
  tier: string
}

interface Badge {
  earned_at: string
  community_badges: BadgeInfo | BadgeInfo[] | null
}

interface GroupInfo {
  name: string
  slug: string
  icon: string | null
  color: string
}

interface ThreadInfo {
  title: string
  slug: string
}

interface ThreadSummary {
  id: string
  title: string
  slug: string
  score: number
  reply_count: number
  view_count: number
  created_at: string
  community_groups: GroupInfo | GroupInfo[] | null
}

interface ReplySummary {
  id: string
  body: string
  score: number
  created_at: string
  thread_id: string
  community_threads: ThreadInfo | ThreadInfo[] | null
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
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function ProfileClient({
  badges,
  threads,
  replies,
}: {
  badges: Badge[]
  threads: ThreadSummary[]
  replies: ReplySummary[]
}) {
  const [tab, setTab] = useState<'threads' | 'replies'>('threads')

  return (
    <>
      {/* Badge Shelf */}
      {badges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => {
              const raw = b.community_badges
              const badge: BadgeInfo | null = Array.isArray(raw) ? raw[0] ?? null : raw
              if (!badge) return null
              return (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  style={{ background: badge.color + '15', color: badge.color, border: `1px solid ${badge.color}30` }}
                  title={badge.description}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-1 mb-4 rounded-xl px-2 py-1.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <button
          onClick={() => setTab('threads')}
          className="text-xs font-bold px-4 py-2 rounded-lg transition-all"
          style={{
            background: tab === 'threads' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: tab === 'threads' ? 'var(--accent)' : 'var(--text-muted)',
          }}
        >
          Threads ({threads.length})
        </button>
        <button
          onClick={() => setTab('replies')}
          className="text-xs font-bold px-4 py-2 rounded-lg transition-all"
          style={{
            background: tab === 'replies' ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: tab === 'replies' ? 'var(--accent)' : 'var(--text-muted)',
          }}
        >
          Replies ({replies.length})
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'threads' ? (
        <div className="flex flex-col gap-2">
          {threads.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No threads yet</p>
          ) : (
            threads.map(t => {
              const rawGroup = t.community_groups
              const group: GroupInfo | null = Array.isArray(rawGroup) ? rawGroup[0] ?? null : rawGroup
              return (
                <Link
                  key={t.id}
                  href={`/forum/${t.slug}`}
                  className="rounded-xl p-4 no-underline transition-all"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {group && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: group.color + '15', color: group.color }}>
                        {group.icon} {group.name}
                      </span>
                    )}
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timeAgo(t.created_at)}</span>
                  </div>
                  <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{t.title}</h3>
                  <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: t.score > 0 ? '#ff6b35' : t.score < 0 ? '#9945ff' : 'var(--text-muted)' }}>
                      {t.score > 0 ? '+' : ''}{t.score} points
                    </span>
                    <span>{t.reply_count} {t.reply_count === 1 ? 'reply' : 'replies'}</span>
                    <span>{t.view_count} views</span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {replies.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No replies yet</p>
          ) : (
            replies.map(r => {
              const rawThread = r.community_threads
              const thread: ThreadInfo | null = Array.isArray(rawThread) ? rawThread[0] ?? null : rawThread
              return (
                <Link
                  key={r.id}
                  href={thread ? `/forum/${thread.slug}` : '#'}
                  className="rounded-xl p-4 no-underline transition-all"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {thread && (
                    <div className="text-[10px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Replied in <span className="font-bold" style={{ color: 'var(--accent)' }}>{thread.title}</span>
                    </div>
                  )}
                  <p className="text-xs leading-relaxed line-clamp-3 mb-1.5" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {r.body.slice(0, 300)}
                  </p>
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: r.score > 0 ? '#ff6b35' : r.score < 0 ? '#9945ff' : 'var(--text-muted)' }}>
                      {r.score > 0 ? '+' : ''}{r.score} points
                    </span>
                    <span>{timeAgo(r.created_at)}</span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      )}
    </>
  )
}
