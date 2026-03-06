'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ScoredPage {
  url: string
  query: string
  impressions: number
  clicks: number
  ctr: number
  position: number
  score: number
  bucket: string
  factors: {
    impressions: number
    position: number
    ctrGap: number
    conversions: number
    freshness: number
  }
}

interface GeneratedPost {
  id: string
  title: string
  slug: string
  content: string
  metaDescription: string
  targetQuery: string
  bucket: string
  wordCount: number
  status: string
}

const BUCKET_COLORS: Record<string, string> = {
  CTR_FIX: '#ff3d3d',
  STRIKING_DISTANCE: '#ff6b35',
  RELEVANCE_REBUILD: '#ff69b4',
  LOCAL_BOOST: '#7ed957',
}

export default function GeneratePage() {
  const [analyzing, setAnalyzing] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [pages, setPages] = useState<ScoredPage[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([])
  const [message, setMessage] = useState('')
  const [previewPost, setPreviewPost] = useState<GeneratedPost | null>(null)

  async function runAnalysis() {
    setAnalyzing(true)
    setMessage('')
    try {
      const res = await fetch('/api/blog/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze' }),
      })
      const data = await res.json()
      if (data.pages) {
        setPages(data.pages)
        setMessage(`Analyzed ${data.pages.length} pages, ${data.actionsGenerated} opportunities found`)
      } else {
        setMessage(data.error || 'Analysis failed')
      }
    } catch {
      setMessage('Network error running analysis')
    }
    setAnalyzing(false)
  }

  async function generateForPage(page: ScoredPage) {
    setGenerating(page.url)
    setMessage('')
    try {
      const res = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: page.query,
          bucket: page.bucket,
          url: page.url,
        }),
      })
      const data = await res.json()
      if (data.post) {
        setGeneratedPosts((prev) => [...prev, data.post])
        setMessage(`Generated: ${data.post.title}`)
      } else {
        setMessage(data.error || 'Generation failed')
      }
    } catch {
      setMessage('Network error generating post')
    }
    setGenerating(null)
  }

  async function generateSelected() {
    for (const url of selectedPages) {
      const page = pages.find((p) => p.url === url)
      if (page) {
        await generateForPage(page)
      }
    }
    setSelectedPages(new Set())
  }

  async function handlePublish(postId: string) {
    setPublishing(postId)
    try {
      const res = await fetch('/api/blog/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      const data = await res.json()
      if (data.slug) {
        setMessage(`Published: ${data.title}`)
        setGeneratedPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, status: 'published' } : p
          )
        )
      } else {
        setMessage(data.error || 'Publish failed')
      }
    } catch {
      setMessage('Network error')
    }
    setPublishing(null)
  }

  function togglePage(url: string) {
    setSelectedPages((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
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
            Generate Blog Posts
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              marginTop: 4,
            }}
          >
            Run CRO9 analysis, select opportunities, generate SEO content
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/admin/blog"
            style={{ ...btnGhostStyle, textDecoration: 'none' }}
          >
            Blog Dashboard
          </Link>
          <Link
            href="/admin/blog/seo"
            style={{ ...btnGhostStyle, textDecoration: 'none' }}
          >
            SEO Analysis
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
            background:
              message.includes('fail') || message.includes('error')
                ? 'rgba(255,61,61,0.1)'
                : 'rgba(126,217,87,0.1)',
            color:
              message.includes('fail') || message.includes('error')
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

      {/* Step 1: Analyze */}
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 4 }}>
              Step 1: Run SEO Analysis
            </h3>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                margin: 0,
              }}
            >
              Pull Search Console data, score pages, identify opportunities
            </p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              background: analyzing ? 'var(--bg-card)' : 'var(--accent)',
              color: analyzing ? 'var(--text-muted)' : 'var(--bg-primary)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: analyzing ? 'wait' : 'pointer',
            }}
          >
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* Step 2: Scored pages */}
      {pages.length > 0 && (
        <div
          style={{
            padding: 20,
            borderRadius: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            marginBottom: 24,
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
              Step 2: Select Pages to Generate Content For ({pages.length}{' '}
              opportunities)
            </h3>
            {selectedPages.size > 0 && (
              <button
                onClick={generateSelected}
                disabled={generating !== null}
                style={{
                  padding: '8px 20px',
                  borderRadius: 10,
                  background: '#ff6b3518',
                  color: '#ff6b35',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                Generate {selectedPages.size} Selected
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pages.slice(0, 20).map((page) => (
              <div
                key={page.url}
                onClick={() => togglePage(page.url)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: selectedPages.has(page.url)
                    ? 'rgba(255,107,53,0.08)'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    selectedPages.has(page.url)
                      ? 'rgba(255,107,53,0.3)'
                      : 'var(--border)'
                  }`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedPages.has(page.url)}
                  onChange={() => togglePage(page.url)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 2,
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
                          (BUCKET_COLORS[page.bucket] || '#fff') + '18',
                        color: BUCKET_COLORS[page.bucket] || '#fff',
                      }}
                    >
                      {page.bucket.replace('_', ' ')}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 900,
                        color: 'var(--accent)',
                      }}
                    >
                      {(page.score * 100).toFixed(0)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {page.query}
                  </div>
                  <div
                    style={{
                      fontSize: '0.625rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    Pos {page.position.toFixed(1)} &middot; CTR{' '}
                    {(page.ctr * 100).toFixed(1)}% &middot;{' '}
                    {page.impressions.toLocaleString()} imp &middot;{' '}
                    {page.clicks} clicks
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    generateForPage(page)
                  }}
                  disabled={generating === page.url}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    background:
                      generating === page.url
                        ? 'var(--bg-card)'
                        : 'var(--accent)' + '18',
                    color:
                      generating === page.url
                        ? 'var(--text-muted)'
                        : 'var(--accent)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    cursor:
                      generating === page.url ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {generating === page.url ? 'Generating...' : 'Generate'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Generated posts */}
      {generatedPosts.length > 0 && (
        <div
          style={{
            padding: 20,
            borderRadius: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            Step 3: Review & Publish ({generatedPosts.length} posts)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {generatedPosts.map((post) => (
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
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    {post.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {post.wordCount} words &middot; {post.targetQuery} &middot;{' '}
                    {post.status}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setPreviewPost(post)}
                    style={btnStyle('#00d4ff')}
                  >
                    Preview
                  </button>
                  {post.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      disabled={publishing === post.id}
                      style={btnStyle('#7ed957')}
                    >
                      {publishing === post.id ? 'Publishing...' : 'Publish'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPost && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
          }}
          onClick={() => setPreviewPost(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-primary)',
              borderRadius: 20,
              padding: 32,
              maxWidth: 800,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                {previewPost.title}
              </h2>
              <button
                onClick={() => setPreviewPost(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                }}
              >
                &times;
              </button>
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: 16,
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              Meta: {previewPost.metaDescription}
            </div>
            <div
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.8,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {previewPost.content}
            </div>
          </div>
        </div>
      )}
    </div>
  )
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
