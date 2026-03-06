'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  meta_description: string
  target_query: string
  bucket: string
  word_count: number
  status: string
  published_at: string | null
  created_at: string
}

interface Stats {
  total: number
  published: number
  drafts: number
  scheduled: number
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#484e78',
  published: '#7ed957',
  scheduled: '#00d4ff',
}

const BUCKET_COLORS: Record<string, string> = {
  CTR_FIX: '#ff3d3d',
  STRIKING_DISTANCE: '#ff6b35',
  RELEVANCE_REBUILD: '#ff69b4',
  LOCAL_BOOST: '#7ed957',
}

export default function BlogDashboard() {
  const supabase = createSupabaseBrowser()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')

  const loadPosts = useCallback(async () => {
    if (!supabase) return

    const [allRes, publishedRes, draftRes, scheduledRes, postsRes] =
      await Promise.all([
        supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published'),
        supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft'),
        supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'scheduled'),
        supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20),
      ])

    setStats({
      total: allRes.count || 0,
      published: publishedRes.count || 0,
      drafts: draftRes.count || 0,
      scheduled: scheduledRes.count || 0,
    })

    if (postsRes.data) setPosts(postsRes.data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  async function handleQuickGenerate() {
    setGenerating(true)
    setMessage('')
    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '', bucket: 'STRIKING_DISTANCE' }),
      })
      const data = await res.json()
      if (data.post) {
        setMessage('Blog post generated as draft')
        loadPosts()
      } else {
        setMessage(data.error || 'Generation failed')
      }
    } catch {
      setMessage('Network error')
    }
    setGenerating(false)
  }

  async function handlePublish(id: string) {
    try {
      const res = await fetch('/api/blog/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id }),
      })
      const data = await res.json()
      if (data.slug) {
        setMessage(`Published: ${data.title}`)
        loadPosts()
      } else {
        setMessage(data.error || 'Publish failed')
      }
    } catch {
      setMessage('Network error')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            fontSize: '2rem',
            fontWeight: 900,
          }}
        >
          0n
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Loading blog dashboard...
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '100px 32px 64px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
          >
            Blog Engine
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              marginTop: 4,
            }}
          >
            CRO9 auto-blogging &mdash; SEO-driven content generation
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/admin/blog/seo"
            style={{ ...btnGhostStyle, textDecoration: 'none' }}
          >
            SEO Analysis
          </Link>
          <Link
            href="/admin/blog/generate"
            style={{ ...btnGhostStyle, textDecoration: 'none' }}
          >
            Generate
          </Link>
          <Link
            href="/admin/blog/learning"
            style={{ ...btnGhostStyle, textDecoration: 'none' }}
          >
            Learning
          </Link>
          <Link
            href="/admin"
            style={{ ...btnGhostStyle, textDecoration: 'none' }}
          >
            Admin Home
          </Link>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            marginBottom: 16,
            fontSize: '0.8125rem',
            fontWeight: 600,
            background: message.includes('fail') || message.includes('error')
              ? 'rgba(255,61,61,0.1)'
              : 'rgba(126,217,87,0.1)',
            color: message.includes('fail') || message.includes('error')
              ? '#ff3d3d'
              : 'var(--accent)',
            border: `1px solid ${
              message.includes('fail') || message.includes('error')
                ? 'rgba(255,61,61,0.2)'
                : 'rgba(126,217,87,0.2)'
            }`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {message}
          <button
            onClick={() => setMessage('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginBottom: 28,
          }}
        >
          <StatBox label="Total Posts" value={stats.total} color="var(--text)" />
          <StatBox
            label="Published"
            value={stats.published}
            color="#7ed957"
          />
          <StatBox label="Drafts" value={stats.drafts} color="#ff6b35" />
          <StatBox
            label="Scheduled"
            value={stats.scheduled}
            color="#00d4ff"
          />
        </div>
      )}

      {/* Quick Generate */}
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Quick Generate
          </h3>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Run CRO9 analysis and generate blog posts from top opportunities
          </p>
        </div>
        <button
          onClick={handleQuickGenerate}
          disabled={generating}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            background: generating ? 'var(--bg-card)' : 'var(--accent)',
            color: generating ? 'var(--text-muted)' : 'var(--bg-primary)',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.8125rem',
            cursor: generating ? 'wait' : 'pointer',
          }}
        >
          {generating ? 'Generating...' : 'Generate Post'}
        </button>
      </div>

      {/* Posts List */}
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>
            Recent Posts
          </h3>
        </div>

        {posts.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              No blog posts yet
            </p>
            <p style={{ fontSize: '0.75rem' }}>
              Generate your first post using the SEO analysis engine
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.5625rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: 4,
                        background:
                          (STATUS_COLORS[post.status] || '#fff') + '18',
                        color: STATUS_COLORS[post.status] || '#fff',
                      }}
                    >
                      {post.status}
                    </span>
                    {post.bucket && (
                      <span
                        style={{
                          fontSize: '0.5625rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background:
                            (BUCKET_COLORS[post.bucket] || '#fff') + '18',
                          color: BUCKET_COLORS[post.bucket] || '#fff',
                        }}
                      >
                        {post.bucket.replace('_', ' ')}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '0.625rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {post.word_count} words
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {post.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      marginTop: 2,
                    }}
                  >
                    {post.target_query || 'No target query'} &middot;{' '}
                    {timeAgo(post.created_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {post.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      style={btnStyle('#7ed957')}
                    >
                      Publish
                    </button>
                  )}
                  {post.status === 'published' && post.slug && (
                    <Link
                      href={`/blog/${post.slug}`}
                      style={{
                        ...btnStyle('#9945ff'),
                        textDecoration: 'none',
                      }}
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{value}</div>
      <div
        style={{
          fontSize: '0.5625rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </div>
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

const btnGhostStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  fontWeight: 600,
  fontSize: '0.75rem',
  cursor: 'pointer',
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 8,
    background: color + '18',
    color,
    border: 'none',
    fontWeight: 700,
    fontSize: '0.75rem',
    cursor: 'pointer',
  }
}
