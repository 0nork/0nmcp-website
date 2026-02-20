'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

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
    case 'legend': return 'Legend'
    case 'expert': return 'Expert'
    case 'power_user': return 'Power User'
    case 'contributor': return 'Contributor'
    case 'member': return 'Member'
    default: return null
  }
}

function authorName(p?: { full_name: string | null; email: string }) {
  return p?.full_name || p?.email?.split('@')[0] || 'Anonymous'
}

export default function ThreadClient({
  threadId,
  threadScore: initialThreadScore,
  isLocked,
  slug,
  initialPosts,
  initialThreadVote,
  initialPostVotes,
}: {
  threadId: string
  threadScore: number
  isLocked: boolean
  slug: string
  initialPosts: Post[]
  initialThreadVote: number
  initialPostVotes: Record<string, number>
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [replyBody, setReplyBody] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [threadVote, setThreadVote] = useState(initialThreadVote)
  const [threadScore, setThreadScore] = useState(initialThreadScore)
  const [postVotes, setPostVotes] = useState<Record<string, number>>(initialPostVotes)
  const [postSort, setPostSort] = useState<'best' | 'new' | 'old'>('best')

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
        setThreadScore(prev => prev - oldVote + data.vote)
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

  // Build nested comment tree
  function buildTree(allPosts: Post[]): (Post & { children: Post[] })[] {
    const map = new Map<string | null, Post[]>()
    allPosts.forEach(p => {
      const parent = p.parent_post_id || null
      if (!map.has(parent)) map.set(parent, [])
      map.get(parent)!.push(p)
    })

    function getChildren(parentId: string | null): (Post & { children: Post[] })[] {
      const children = map.get(parentId) || []
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
        >&#9650;</button>
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
        >&#9660;</button>
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
                <Link
                  href={`/u/${post.user_id}`}
                  className="font-bold no-underline hover:underline"
                  style={{ color: reputationColor(post.profiles?.reputation_level) }}
                >
                  {authorName(post.profiles)}
                </Link>
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
                    Solution
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="text-[13px] leading-relaxed mb-1.5" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                {post.body}
              </div>

              {/* Actions */}
              {!isLocked && (
                <div className="flex items-center gap-3 text-[10px]">
                  <button
                    onClick={() => { setReplyTo(replyTo === post.id ? null : post.id); setReplyBody('') }}
                    className="font-bold transition-all"
                    style={{ color: replyTo === post.id ? 'var(--accent)' : 'var(--text-muted)' }}
                  >
                    Reply
                  </button>
                </div>
              )}

              {/* Inline reply form */}
              {replyTo === post.id && (
                <form onSubmit={handleReply} className="mt-2">
                  <textarea
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    rows={3}
                    placeholder={`Reply to ${authorName(post.profiles)}...`}
                    className="w-full px-3 py-2 rounded-lg text-xs mb-2"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit' }}
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

  const commentTree = buildTree(posts)

  return (
    <>
      {/* Thread vote bar */}
      <div className="flex items-center gap-3 mb-4 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <VoteColumn type="thread" id={threadId} score={threadScore} myVote={threadVote} />
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
      {!isLocked && replyTo === null && (
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
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit' }}
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

      {isLocked && (
        <div className="text-center py-4 mb-6 rounded-xl text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          This thread is locked
        </div>
      )}

      {/* Comment tree */}
      <div className="flex flex-col">
        {commentTree.map(post => (
          <CommentNode key={post.id} post={post} />
        ))}
      </div>
    </>
  )
}
