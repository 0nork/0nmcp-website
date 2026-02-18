'use client'

import { useState, useEffect, useCallback } from 'react'
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
  score: number
  created_at: string
  group_id: string | null
  profiles?: { full_name: string | null; email: string; karma?: number; reputation_level?: string }
  community_groups?: { name: string; slug: string; icon: string | null; color: string } | null
}

interface Post {
  id: string
  body: string
  is_solution: boolean
  score: number
  created_at: string
  parent_post_id: string | null
  user_id: string
  profiles?: { full_name: string | null; email: string; karma?: number; reputation_level?: string }
}

export default function ThreadPage() {
  const { slug } = useParams<{ slug: string }>()
  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [replyBody, setReplyBody] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null) // parent_post_id for nested replies
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [threadVote, setThreadVote] = useState(0)
  const [postVotes, setPostVotes] = useState<Record<string, number>>({})
  const [postSort, setPostSort] = useState<'best' | 'new' | 'old'>('best')

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/community/threads/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setThread(data.thread)
        setPosts(data.posts || [])
        setThreadVote(data.userThreadVote || 0)
        setPostVotes(data.userPostVotes || {})
      }
      setLoading(false)
    }
    load()
  }, [slug])

  async function handleVote(type: 'thread' | 'post', id: string, vote: 1 | -1) {
    const body: Record<string, unknown> = { vote }
    if (type === 'thread') body.thread_id = id
    else body.post_id = id

    const res = await fetch('/api/community/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const data = await res.json()
      if (type === 'thread') {
        const oldVote = threadVote
        setThreadVote(data.vote)
        setThread(prev => prev ? { ...prev, score: prev.score - oldVote + data.vote } : prev)
      } else {
        const oldVote = postVotes[id] || 0
        setPostVotes(prev => ({ ...prev, [id]: data.vote }))
        setPosts(prev => prev.map(p =>
          p.id === id ? { ...p, score: p.score - oldVote + data.vote } : p
        ))
      }
    }
  }

  const handleReply = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyBody.trim()) return

    setSubmitting(true)
    setError('')
    const res = await fetch(`/api/community/threads/${slug}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: replyBody, parent_post_id: replyTo }),
    })

    if (res.ok) {
      const post = await res.json()
      setPosts(prev => [...prev, post])
      setReplyBody('')
      setReplyTo(null)
    } else if (res.status === 401) {
      setError('Please log in to reply')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to post reply')
    }
    setSubmitting(false)
  }, [replyBody, replyTo, slug])

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

  function reputationLabel(level?: string) {
    switch (level) {
      case 'legend': return '👑 Legend'
      case 'expert': return '⭐ Expert'
      case 'power_user': return '🔥 Power User'
      case 'contributor': return '📝 Contributor'
      case 'member': return 'Member'
      default: return null
    }
  }

  // Build nested comment tree
  function buildTree(posts: Post[]): (Post & { children: Post[] })[] {
    const map = new Map<string | null, Post[]>()
    posts.forEach(p => {
      const parent = p.parent_post_id || null
      if (!map.has(parent)) map.set(parent, [])
      map.get(parent)!.push(p)
    })

    function getChildren(parentId: string | null): (Post & { children: Post[] })[] {
      const children = map.get(parentId) || []
      // Sort children
      const sorted = [...children].sort((a, b) => {
        if (postSort === 'best') return b.score - a.score || new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        if (postSort === 'new') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
      return sorted.map(p => ({ ...p, children: getChildren(p.id) }))
    }

    return getChildren(null)
  }

  function VoteColumn({ type, id, score, myVote }: { type: 'thread' | 'post'; id: string; score: number; myVote: number }) {
    return (
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0" style={{ minWidth: '36px' }}>
        <button
          onClick={() => handleVote(type, id, 1)}
          className="w-6 h-6 flex items-center justify-center rounded text-xs transition-all"
          style={{
            color: myVote === 1 ? '#ff6b35' : 'var(--text-muted)',
            background: myVote === 1 ? 'rgba(255,107,53,0.1)' : 'transparent',
          }}
        >▲</button>
        <span className="text-[11px] font-bold tabular-nums" style={{
          color: score > 0 ? '#ff6b35' : score < 0 ? '#9945ff' : 'var(--text-muted)',
        }}>{score}</span>
        <button
          onClick={() => handleVote(type, id, -1)}
          className="w-6 h-6 flex items-center justify-center rounded text-xs transition-all"
          style={{
            color: myVote === -1 ? '#9945ff' : 'var(--text-muted)',
            background: myVote === -1 ? 'rgba(153,69,255,0.1)' : 'transparent',
          }}
        >▼</button>
      </div>
    )
  }

  function CommentNode({ post, depth = 0 }: { post: Post & { children: Post[] }; depth?: number }) {
    const myVote = postVotes[post.id] || 0
    const repLabel = reputationLabel(post.profiles?.reputation_level)

    return (
      <div style={{ marginLeft: depth > 0 ? '16px' : '0', borderLeft: depth > 0 ? '2px solid var(--border)' : 'none', paddingLeft: depth > 0 ? '12px' : '0' }}>
        <div className="py-2">
          <div className="flex gap-2">
            <VoteColumn type="post" id={post.id} score={post.score} myVote={myVote} />
            <div className="flex-1 min-w-0">
              {/* Author line */}
              <div className="flex items-center gap-2 mb-1 text-[11px] flex-wrap">
                <span className="font-bold" style={{ color: reputationColor(post.profiles?.reputation_level) }}>
                  {authorName(post.profiles)}
                </span>
                {repLabel && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: reputationColor(post.profiles?.reputation_level) + '15', color: reputationColor(post.profiles?.reputation_level) }}>
                    {repLabel}
                  </span>
                )}
                {post.profiles?.karma ? (
                  <span style={{ color: 'var(--text-muted)' }}>{post.profiles.karma} karma</span>
                ) : null}
                <span style={{ color: 'var(--text-muted)' }}>{timeAgo(post.created_at)}</span>
                {post.is_solution && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
                    ✓ Solution
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="text-[13px] leading-relaxed mb-1.5" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                {post.body}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 text-[10px]">
                <button
                  onClick={() => { setReplyTo(replyTo === post.id ? null : post.id); setReplyBody('') }}
                  className="font-bold transition-all"
                  style={{ color: replyTo === post.id ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  Reply
                </button>
              </div>

              {/* Inline reply form */}
              {replyTo === post.id && (
                <form onSubmit={handleReply} className="mt-2">
                  <textarea
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    rows={3}
                    placeholder={`Reply to ${authorName(post.profiles)}...`}
                    className="w-full px-3 py-2 rounded-lg text-xs mb-2"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit' }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting || !replyBody.trim()}
                      className="px-3 py-1 rounded-lg font-bold text-[11px]"
                      style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
                    >
                      {submitting ? 'Posting...' : 'Reply'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setReplyTo(null); setReplyBody('') }}
                      className="px-3 py-1 rounded-lg text-[11px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Children */}
        {post.children.map(child => (
          <CommentNode key={child.id} post={child as Post & { children: Post[] }} depth={depth + 1} />
        ))}
      </div>
    )
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

  const groupData = thread.community_groups
  const commentTree = buildTree(posts)
  const repLabel = reputationLabel(thread.profiles?.reputation_level)

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <Link href="/forum" className="hover:underline">Forum</Link>
          {groupData && (
            <>
              <span>/</span>
              <Link
                href={`/forum?group=${groupData.slug}`}
                className="hover:underline"
                style={{ color: groupData.color }}
              >
                {groupData.icon} {groupData.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate">{thread.title}</span>
        </div>

        {/* Thread */}
        <div
          className="rounded-xl mb-6 flex"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {/* Vote column */}
          <div className="py-4 px-2">
            <VoteColumn type="thread" id={thread.id} score={thread.score} myVote={threadVote} />
          </div>

          {/* Content */}
          <div className="py-4 pr-5 flex-1 min-w-0">
            {/* Meta */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2 text-[11px]">
              {groupData && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: groupData.color + '15', color: groupData.color }}>
                  {groupData.icon} {groupData.name}
                </span>
              )}
              {thread.is_pinned && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>Pinned</span>
              )}
              <span style={{ color: 'var(--text-muted)' }}>
                Posted by{' '}
                <span className="font-bold" style={{ color: reputationColor(thread.profiles?.reputation_level) }}>
                  {authorName(thread.profiles)}
                </span>
                {repLabel && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: reputationColor(thread.profiles?.reputation_level) + '15', color: reputationColor(thread.profiles?.reputation_level) }}>
                    {repLabel}
                  </span>
                )}
                {thread.profiles?.karma ? (
                  <span className="ml-1 opacity-50">({thread.profiles.karma} karma)</span>
                ) : null}
                <span className="mx-1">·</span>
                {timeAgo(thread.created_at)}
                <span className="mx-1">·</span>
                {thread.view_count} views
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-bold mb-3 leading-tight">
              {thread.is_locked && <span className="mr-1.5 opacity-50">🔒</span>}
              {thread.title}
            </h1>

            {/* Body */}
            <div className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
              {thread.body}
            </div>

            {/* Thread actions */}
            <div className="flex items-center gap-4 mt-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span className="font-bold">💬 {thread.reply_count} {thread.reply_count === 1 ? 'comment' : 'comments'}</span>
            </div>
          </div>
        </div>

        {/* Comment sort + count */}
        {posts.length > 0 && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold">{posts.length} Comment{posts.length !== 1 ? 's' : ''}</span>
            <div className="flex gap-1">
              {(['best', 'new', 'old'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setPostSort(s)}
                  className="text-[10px] font-bold px-2 py-1 rounded transition-all capitalize"
                  style={{
                    background: postSort === s ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: postSort === s ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reply form (top-level) */}
        {!thread.is_locked && replyTo === null && (
          <form onSubmit={handleReply} className="mb-6">
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
              placeholder="What are your thoughts?"
              className="w-full px-3 py-2 rounded-xl text-sm mb-2"
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
              {submitting ? 'Posting...' : 'Comment'}
            </button>
          </form>
        )}

        {thread.is_locked && (
          <div className="text-center py-4 mb-6 rounded-xl text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            🔒 This thread is locked
          </div>
        )}

        {/* Comment tree */}
        <div className="flex flex-col">
          {commentTree.map(post => (
            <CommentNode key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}
