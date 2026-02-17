'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

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
  created_at: string
  profiles?: { full_name: string | null; email: string }
}

interface Post {
  id: string
  body: string
  is_solution: boolean
  created_at: string
  parent_post_id: string | null
  profiles?: { full_name: string | null; email: string }
}

interface Reaction {
  thread_id: string | null
  post_id: string | null
  reaction_type: string
}

const CATEGORY_COLORS: Record<string, string> = {
  general: '#00ff88',
  help: '#ff6b35',
  showcase: '#9945ff',
  'feature-request': '#00d4ff',
  'bug-report': '#ff3d3d',
  tutorial: '#FFD700',
}

export default function ThreadPage() {
  const { slug } = useParams<{ slug: string }>()
  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [loading, setLoading] = useState(true)
  const [replyBody, setReplyBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/community/threads/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setThread(data.thread)
        setPosts(data.posts || [])
        setReactions(data.reactions || [])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyBody.trim()) return

    setSubmitting(true)
    setError('')
    const res = await fetch(`/api/community/threads/${slug}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: replyBody }),
    })

    if (res.ok) {
      const post = await res.json()
      setPosts(prev => [...prev, post])
      setReplyBody('')
    } else if (res.status === 401) {
      setError('Please log in to reply')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to post reply')
    }
    setSubmitting(false)
  }

  async function toggleReaction(targetType: 'thread' | 'post', targetId: string, reactionType: string) {
    const body: Record<string, string> = { reaction_type: reactionType }
    if (targetType === 'thread') body.thread_id = targetId
    else body.post_id = targetId

    const res = await fetch('/api/community/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      // Reload reactions
      const threadRes = await fetch(`/api/community/threads/${slug}`)
      if (threadRes.ok) {
        const data = await threadRes.json()
        setReactions(data.reactions || [])
      }
    }
  }

  function authorName(profiles?: { full_name: string | null; email: string }) {
    return profiles?.full_name || profiles?.email?.split('@')[0] || 'Anonymous'
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  function reactionCount(targetType: 'thread' | 'post', targetId: string, type: string) {
    return reactions.filter(r =>
      r.reaction_type === type &&
      (targetType === 'thread' ? r.thread_id === targetId : r.post_id === targetId)
    ).length
  }

  if (loading) {
    return (
      <div className="pt-40 pb-16 px-8 text-center">
        <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Loading thread...</p>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="pt-40 pb-16 px-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Thread Not Found</h1>
        <Link href="/forum" className="text-sm" style={{ color: 'var(--accent)' }}>Back to forum</Link>
      </div>
    )
  }

  const catColor = CATEGORY_COLORS[thread.category] || '#fff'

  return (
    <div className="pt-32 pb-24 px-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
        <Link href="/forum" className="hover:underline">Forum</Link>
        <span className="mx-2">/</span>
        <span>{thread.title}</span>
      </div>

      {/* Thread */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          {thread.is_pinned && (
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>Pinned</span>
          )}
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: catColor + '15', color: catColor }}>
            {thread.category}
          </span>
          {thread.is_locked && <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Locked</span>}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{thread.title}</h1>
        <div className="flex items-center gap-4 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold">{authorName(thread.profiles)}</span>
          <span>{timeAgo(thread.created_at)}</span>
          <span>{thread.view_count} views</span>
          <span>{thread.reply_count} replies</span>
        </div>

        <div
          className="rounded-2xl p-5 mb-3"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.875rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
        >
          {thread.body}
        </div>

        {/* Reactions */}
        <div className="flex gap-2">
          {['like', 'helpful', 'fire'].map(type => {
            const count = reactionCount('thread', thread.id, type)
            const emoji = type === 'like' ? '👍' : type === 'helpful' ? '💡' : '🔥'
            return (
              <button
                key={type}
                onClick={() => toggleReaction('thread', thread.id, type)}
                className="text-xs px-2 py-1 rounded-lg transition-all"
                style={{ background: count > 0 ? 'rgba(255,255,255,0.06)' : 'transparent', border: '1px solid var(--border)' }}
              >
                {emoji} {count > 0 ? count : ''}
              </button>
            )
          })}
        </div>
      </div>

      {/* Replies */}
      {posts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-muted)' }}>
            {posts.length} Repl{posts.length !== 1 ? 'ies' : 'y'}
          </h2>
          <div className="flex flex-col gap-3">
            {posts.map(post => (
              <div key={post.id}>
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: post.is_solution ? 'rgba(0,255,136,0.03)' : 'var(--bg-card)',
                    border: `1px solid ${post.is_solution ? 'rgba(0,255,136,0.2)' : 'var(--border)'}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-semibold">{authorName(post.profiles)}</span>
                    <span>{timeAgo(post.created_at)}</span>
                    {post.is_solution && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                        Solution
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8125rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {post.body}
                  </div>
                </div>
                {/* Post reactions */}
                <div className="flex gap-2 mt-1 ml-2">
                  {['like', 'helpful'].map(type => {
                    const count = reactionCount('post', post.id, type)
                    const emoji = type === 'like' ? '👍' : '💡'
                    return (
                      <button
                        key={type}
                        onClick={() => toggleReaction('post', post.id, type)}
                        className="text-[11px] px-1.5 py-0.5 rounded transition-all"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {emoji} {count > 0 ? count : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply form */}
      {!thread.is_locked ? (
        <form onSubmit={handleReply}>
          <h3 className="text-sm font-bold mb-2">Reply</h3>
          {error && (
            <div className="text-xs font-semibold mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,61,61,0.1)', color: '#ff3d3d' }}>
              {error}
              {error.includes('log in') && (
                <Link href={`/login?redirect=/forum/${slug}`} className="ml-2 underline">Log in</Link>
              )}
            </div>
          )}
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            rows={4}
            placeholder="Write your reply..."
            className="w-full px-3 py-2 rounded-xl text-sm mb-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit' }}
          />
          <button
            type="submit"
            disabled={submitting || !replyBody.trim()}
            className="px-5 py-2 rounded-xl font-bold text-sm"
            style={{
              background: submitting ? 'var(--bg-card)' : 'var(--accent)',
              color: submitting ? 'var(--text-muted)' : 'var(--bg-primary)',
            }}
          >
            {submitting ? 'Posting...' : 'Post Reply'}
          </button>
        </form>
      ) : (
        <div className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          This thread is locked.
        </div>
      )}
    </div>
  )
}
