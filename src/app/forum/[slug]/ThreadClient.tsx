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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0, minWidth: '32px' }}>
        <button
          onClick={() => handleVote(type, id, 1)}
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: myVote === 1 ? '#ff6b35' : 'var(--text-muted)',
            background: myVote === 1 ? 'rgba(255,107,53,0.1)' : 'transparent',
            transition: 'color 0.15s, background 0.15s',
            fontFamily: 'inherit',
          }}
        >&#9650;</button>
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: score > 0 ? '#ff6b35' : score < 0 ? '#9945ff' : 'var(--text-muted)',
        }}>{score}</span>
        <button
          onClick={() => handleVote(type, id, -1)}
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: myVote === -1 ? '#9945ff' : 'var(--text-muted)',
            background: myVote === -1 ? 'rgba(153,69,255,0.1)' : 'transparent',
            transition: 'color 0.15s, background 0.15s',
            fontFamily: 'inherit',
          }}
        >&#9660;</button>
      </div>
    )
  }

  function CommentNode({ post, depth = 0 }: { post: Post & { children: Post[] }; depth?: number }) {
    const myVote = postVotes[post.id] || 0
    const repLabel = reputationLabel(post.profiles?.reputation_level)

    return (
      <div
        style={{
          marginLeft: depth > 0 ? '16px' : '0',
          borderLeft: depth > 0 ? '2px solid var(--border)' : 'none',
          paddingLeft: depth > 0 ? '12px' : '0',
        }}
      >
        {/* Comment card — black background */}
        <div
          style={{
            background: '#000000',
            border: '1px solid var(--border)',
            borderRadius: depth === 0 ? '10px' : '8px',
            marginBottom: '6px',
            padding: '0.75rem 0.875rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <VoteColumn type="post" id={post.id} score={post.score} myVote={myVote} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Author line */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.375rem',
                fontSize: '0.75rem',
                flexWrap: 'wrap',
              }}>
                <Link
                  href={`/u/${post.user_id}`}
                  style={{
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: reputationColor(post.profiles?.reputation_level),
                  }}
                >
                  {authorName(post.profiles)}
                </Link>
                {repLabel && (
                  <span style={{
                    fontSize: '0.5625rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: reputationColor(post.profiles?.reputation_level) + '15',
                    color: reputationColor(post.profiles?.reputation_level),
                    fontWeight: 700,
                  }}>
                    {repLabel}
                  </span>
                )}
                {post.profiles?.karma ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>{post.profiles.karma} karma</span>
                ) : null}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>{timeAgo(post.created_at)}</span>
                {post.is_solution && (
                  <span style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(126,217,87,0.1)',
                    color: '#7ed957',
                  }}>
                    Solution
                  </span>
                )}
              </div>

              {/* Body — 15px base size */}
              <div style={{
                fontSize: '0.9375rem',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
              }}>
                {post.body}
              </div>

              {/* Actions */}
              {!isLocked && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => { setReplyTo(replyTo === post.id ? null : post.id); setReplyBody('') }}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      color: replyTo === post.id ? 'var(--accent)' : 'var(--text-muted)',
                      background: replyTo === post.id ? 'rgba(126,217,87,0.08)' : 'transparent',
                      transition: 'color 0.15s, background 0.15s',
                      minHeight: '28px',
                    } as React.CSSProperties}
                  >
                    Reply
                  </button>
                </div>
              )}

              {/* Inline reply form */}
              {replyTo === post.id && (
                <form onSubmit={handleReply} style={{ marginTop: '0.625rem' }}>
                  <textarea
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    rows={3}
                    dir="ltr"
                    placeholder={`Reply to ${authorName(post.profiles)}...`}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      background: '#111118',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      lineHeight: 1.7,
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      direction: 'ltr',
                      unicodeBidi: 'normal',
                      outline: 'none',
                      boxSizing: 'border-box',
                    } as React.CSSProperties}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="submit"
                      disabled={submitting || !replyBody.trim()}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        border: 'none',
                        cursor: submitting || !replyBody.trim() ? 'default' : 'pointer',
                        background: submitting || !replyBody.trim() ? 'var(--bg-card)' : 'var(--accent)',
                        color: submitting || !replyBody.trim() ? 'var(--text-muted)' : 'var(--bg-primary)',
                        fontFamily: 'inherit',
                        minHeight: '36px',
                        transition: 'background 0.15s',
                      }}
                    >
                      {submitting ? 'Posting...' : 'Reply'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setReplyTo(null); setReplyBody('') }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        border: 'none',
                        cursor: 'pointer',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontFamily: 'inherit',
                        minHeight: '36px',
                      }}
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
      {/* Thread vote row — slim, under the banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 1.25rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <VoteColumn type="thread" id={threadId} score={threadScore} myVote={threadVote} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Vote on this thread
        </span>
      </div>

      {/* Comment sort + count */}
      {posts.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.875rem',
          }}
        >
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {posts.length} {posts.length === 1 ? 'Comment' : 'Comments'}
          </span>
          <div style={{ display: 'flex', gap: '2px' }}>
            {(['best', 'new', 'old'] as const).map(s => (
              <button
                key={s}
                onClick={() => setPostSort(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  textTransform: 'capitalize',
                  background: postSort === s ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: postSort === s ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'background 0.15s, color 0.15s',
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
        <form onSubmit={handleReply} style={{ marginBottom: '1.25rem' }}>
          {error && (
            <div style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: '8px',
              background: 'rgba(255,61,61,0.1)',
              color: '#ff3d3d',
            }}>
              {error}
              {error.includes('log in') && (
                <Link href={`/login?redirect=/forum/${slug}`} style={{ marginLeft: '0.5rem', textDecoration: 'underline', color: '#ff3d3d' }}>Log in</Link>
              )}
            </div>
          )}
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            rows={4}
            dir="ltr"
            placeholder="What are your thoughts?"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              marginBottom: '0.625rem',
              background: '#000000',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              lineHeight: 1.7,
              resize: 'vertical',
              fontFamily: 'inherit',
              direction: 'ltr',
              unicodeBidi: 'normal',
              outline: 'none',
              boxSizing: 'border-box',
            } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={submitting || !replyBody.trim()}
            style={{
              padding: '0.625rem 1.75rem',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: submitting || !replyBody.trim() ? 'default' : 'pointer',
              background: submitting || !replyBody.trim() ? 'var(--bg-card)' : 'var(--accent)',
              color: submitting || !replyBody.trim() ? 'var(--text-muted)' : 'var(--bg-primary)',
              fontFamily: 'inherit',
              minHeight: '44px',
              transition: 'background 0.15s',
            }}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {isLocked && (
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          marginBottom: '1.25rem',
          borderRadius: '10px',
          fontSize: '0.875rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}>
          This thread is locked
        </div>
      )}

      {/* Comment tree */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {commentTree.map(post => (
          <CommentNode key={post.id} post={post} />
        ))}
      </div>
    </>
  )
}
