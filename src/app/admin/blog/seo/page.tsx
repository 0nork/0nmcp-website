'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'

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

interface BucketStats {
  CTR_FIX: number
  STRIKING_DISTANCE: number
  RELEVANCE_REBUILD: number
  LOCAL_BOOST: number
}

interface SEORun {
  id: string
  pages_analyzed: number
  actions_generated: number
  status: string
  created_at: string
}

const BUCKET_COLORS: Record<string, string> = {
  CTR_FIX: '#ff3d3d',
  STRIKING_DISTANCE: '#ff6b35',
  RELEVANCE_REBUILD: '#ff69b4',
  LOCAL_BOOST: '#00ff88',
}

const BUCKET_LABELS: Record<string, string> = {
  CTR_FIX: 'CTR Fix',
  STRIKING_DISTANCE: 'Striking Distance',
  RELEVANCE_REBUILD: 'Relevance Rebuild',
  LOCAL_BOOST: 'Local Boost',
}

export default function SEODashboard() {
  const supabase = createSupabaseBrowser()
  const [analyzing, setAnalyzing] = useState(false)
  const [pages, setPages] = useState<ScoredPage[]>([])
  const [bucketStats, setBucketStats] = useState<BucketStats | null>(null)
  const [runs, setRuns] = useState<SEORun[]>([])
  const [message, setMessage] = useState('')
  const [selectedPage, setSelectedPage] = useState<ScoredPage | null>(null)
  const [filterBucket, setFilterBucket] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const loadRuns = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('seo_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setRuns(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadRuns()
  }, [loadRuns])

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
        // Calculate bucket distribution
        const stats: BucketStats = {
          CTR_FIX: 0,
          STRIKING_DISTANCE: 0,
          RELEVANCE_REBUILD: 0,
          LOCAL_BOOST: 0,
        }
        for (const page of data.pages) {
          if (stats[page.bucket as keyof BucketStats] !== undefined) {
            stats[page.bucket as keyof BucketStats]++
          }
        }
        setBucketStats(stats)
        setMessage(
          `Analysis complete: ${data.pagesAnalyzed} pages scored, ${data.actionsGenerated} opportunities`
        )
        loadRuns()
      } else {
        setMessage(data.error || 'Analysis failed')
      }
    } catch {
      setMessage('Network error running analysis')
    }
    setAnalyzing(false)
  }

  const filteredPages = filterBucket
    ? pages.filter((p) => p.bucket === filterBucket)
    : pages

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
          Loading SEO dashboard...
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
            CRO9 SEO Analysis
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              marginTop: 4,
            }}
          >
            5-factor opportunity scoring with adaptive weights
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
            href="/admin/blog/learning"
            style={{ ...btnGhostStyle, textDecoration: 'none' }}
          >
            Weight Learning
          </Link>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            style={{
              padding: '8px 20px',
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
                : 'rgba(0,255,136,0.1)',
            color:
              message.includes('fail') || message.includes('error')
                ? '#ff3d3d'
                : 'var(--accent)',
          }}
        >
          {message}
        </div>
      )}

      {/* Bucket Distribution */}
      {bucketStats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginBottom: 24,
          }}
        >
          {Object.entries(bucketStats).map(([bucket, count]) => (
            <div
              key={bucket}
              onClick={() =>
                setFilterBucket(filterBucket === bucket ? '' : bucket)
              }
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background:
                  filterBucket === bucket
                    ? (BUCKET_COLORS[bucket] || '#fff') + '18'
                    : 'var(--bg-card)',
                border: `1px solid ${
                  filterBucket === bucket
                    ? BUCKET_COLORS[bucket] || 'var(--border)'
                    : 'var(--border)'
                }`,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: BUCKET_COLORS[bucket],
                }}
              >
                {count}
              </div>
              <div
                style={{
                  fontSize: '0.5625rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {BUCKET_LABELS[bucket] || bucket}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Two-column: Pages + Detail */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selectedPage ? '1fr 1fr' : '1fr',
          gap: 16,
        }}
      >
        {/* Scored Pages Table */}
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
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>
              Scored Pages
              {filterBucket && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: BUCKET_COLORS[filterBucket],
                    marginLeft: 8,
                  }}
                >
                  ({BUCKET_LABELS[filterBucket]})
                </span>
              )}
            </h3>
            <span
              style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}
            >
              {filteredPages.length} pages
            </span>
          </div>

          {filteredPages.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                No data yet
              </p>
              <p style={{ fontSize: '0.75rem' }}>
                Run an analysis to see scored pages
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {filteredPages.slice(0, 30).map((page) => (
                <div
                  key={page.url}
                  onClick={() => setSelectedPage(page)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background:
                      selectedPage?.url === page.url
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${
                      selectedPage?.url === page.url
                        ? 'var(--accent)'
                        : 'var(--border)'
                    }`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
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
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        color: 'var(--accent)',
                        minWidth: 28,
                      }}
                    >
                      {(page.score * 100).toFixed(0)}
                    </span>
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
                    {page.impressions.toLocaleString()} imp
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedPage && (
          <div
            style={{
              padding: 20,
              borderRadius: 16,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              position: 'sticky',
              top: 100,
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: 6,
                  background:
                    (BUCKET_COLORS[selectedPage.bucket] || '#fff') + '18',
                  color: BUCKET_COLORS[selectedPage.bucket],
                }}
              >
                {selectedPage.bucket.replace('_', ' ')}
              </span>
              <button
                onClick={() => setSelectedPage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                &times;
              </button>
            </div>

            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              {selectedPage.query}
            </h3>

            <div
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                marginBottom: 16,
                wordBreak: 'break-all',
              }}
            >
              {selectedPage.url}
            </div>

            {/* Score Breakdown */}
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Score:{' '}
              <span style={{ color: 'var(--accent)', fontSize: '1.25rem' }}>
                {(selectedPage.score * 100).toFixed(1)}
              </span>
            </div>

            {/* Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <MetricBox
                label="Position"
                value={selectedPage.position.toFixed(1)}
              />
              <MetricBox
                label="CTR"
                value={`${(selectedPage.ctr * 100).toFixed(1)}%`}
              />
              <MetricBox
                label="Impressions"
                value={selectedPage.impressions.toLocaleString()}
              />
              <MetricBox
                label="Clicks"
                value={selectedPage.clicks.toString()}
              />
            </div>

            {/* Factor Breakdown */}
            <h4
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Factor Breakdown
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                marginBottom: 16,
              }}
            >
              {Object.entries(selectedPage.factors).map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      width: 80,
                      textTransform: 'capitalize',
                    }}
                  >
                    {key}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.05)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(value as number) * 100}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: 'var(--accent)',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      width: 32,
                      textAlign: 'right',
                    }}
                  >
                    {((value as number) * 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            {/* Generate action */}
            <Link
              href={`/admin/blog/generate`}
              style={{
                display: 'block',
                padding: '10px 20px',
                borderRadius: 10,
                background: 'var(--accent)' + '18',
                color: 'var(--accent)',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              Generate Content for This Page
            </Link>
          </div>
        )}
      </div>

      {/* Recent Runs */}
      {runs.length > 0 && (
        <div
          style={{
            padding: 20,
            borderRadius: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            marginTop: 24,
          }}
        >
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Recent Analysis Runs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {runs.map((run) => (
              <div
                key={run.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: '0.75rem',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      run.status === 'completed'
                        ? '#00ff88'
                        : run.status === 'failed'
                          ? '#ff3d3d'
                          : '#ff6b35',
                  }}
                >
                  {run.status}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {run.pages_analyzed} pages &middot;{' '}
                  {run.actions_generated} actions
                </span>
                <span
                  style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}
                >
                  {new Date(run.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          fontSize: '0.5625rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{value}</div>
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
