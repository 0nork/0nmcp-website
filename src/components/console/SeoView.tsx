'use client'

import { useState, useEffect, useCallback } from 'react'

interface SeoSummary {
  totalClicks: number
  totalImpressions: number
  avgCtr: number
  avgPosition: number
  totalPages: number
  period: string
}

interface TopPage {
  url: string
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface TopQuery {
  query: string
  clicks: number
  impressions: number
  pages: number
}

interface IndexResult {
  status: string
  response?: string
  error?: string
}

const ENGINE_LABELS: Record<string, { name: string; color: string }> = {
  google_gsc: { name: 'Google (GSC)', color: '#4285f4' },
  bing_ping: { name: 'Bing (Sitemap)', color: '#00809d' },
  bing_indexnow: { name: 'Bing (IndexNow)', color: '#00809d' },
  yandex_indexnow: { name: 'Yandex', color: '#ff0000' },
  seznam_indexnow: { name: 'Seznam', color: '#cc0000' },
  naver_indexnow: { name: 'Naver', color: '#03c75a' },
  urls_submitted: { name: 'URLs Submitted', color: '#6EE05A' },
}

export function SeoView() {
  const [summary, setSummary] = useState<SeoSummary | null>(null)
  const [topPages, setTopPages] = useState<TopPage[]>([])
  const [topQueries, setTopQueries] = useState<TopQuery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState(28)
  const [tab, setTab] = useState<'pages' | 'queries'>('pages')

  // Indexing state
  const [indexResults, setIndexResults] = useState<Record<string, IndexResult> | null>(null)
  const [indexing, setIndexing] = useState(false)
  const [customUrls, setCustomUrls] = useState('')
  const [googleConnected, setGoogleConnected] = useState(false)

  const fetchData = useCallback(async (days: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/console/seo?days=${days}`)
      const data = await res.json()
      if (data.error && !data.summary) {
        setError(data.detail || data.error)
        setSummary(null)
        setTopPages([])
        setTopQueries([])
      } else {
        setSummary(data.summary)
        setTopPages(data.topPages || [])
        setTopQueries(data.topQueries || [])
        if (data.error) setError(data.detail || data.error)
      }
    } catch {
      setError('Failed to fetch SEO data')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData(period)
    // Check connection status
    fetch('/api/console/seo?action=status')
      .then(r => r.json())
      .then(data => setGoogleConnected(data.google_connected))
      .catch(() => {})
  }, [fetchData, period])

  const handleIndex = useCallback(async (action: string) => {
    setIndexing(true)
    setIndexResults(null)
    try {
      const body: Record<string, unknown> = { action }
      if (action === 'indexnow' && customUrls.trim()) {
        body.urls = customUrls.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'))
      }
      const res = await fetch('/api/console/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setIndexResults(data.results)
    } catch {
      setIndexResults({ error: { status: 'error', error: 'Failed to submit' } })
    }
    setIndexing(false)
  }, [customUrls])

  const cardStyle = {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '0.75rem',
    border: '1px solid var(--border)',
    padding: '1.25rem',
  }

  const labelStyle = {
    fontSize: '0.6rem',
    fontWeight: 600 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
  }

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
            SEO Engine
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Google Search Console analytics + multi-engine indexing
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {[7, 28, 90].map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '0.375rem',
                border: period === d ? '1px solid #6EE05A' : '1px solid var(--border)',
                background: period === d ? 'rgba(126,217,87,0.1)' : 'transparent',
                color: period === d ? '#6EE05A' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Connection status */}
      {!googleConnected && (
        <div style={{
          ...cardStyle,
          borderColor: 'rgba(255,107,53,0.3)',
          background: 'rgba(255,107,53,0.05)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.25rem' }}>&#9888;</span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ff6b35' }}>Google not connected</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Connect Google in the Vault to see Search Console data. IndexNow indexing still works without Google.
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Loading Search Console data...
        </div>
      ) : summary ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Total Clicks', value: summary.totalClicks.toLocaleString(), color: '#6EE05A', sub: `${summary.period} period` },
              { label: 'Impressions', value: summary.totalImpressions.toLocaleString(), color: '#00d4ff', sub: `${summary.totalPages} pages` },
              { label: 'Avg CTR', value: `${summary.avgCtr}%`, color: '#a78bfa', sub: summary.avgCtr > 3 ? 'Above average' : 'Room to grow' },
              { label: 'Avg Position', value: summary.avgPosition.toFixed(1), color: '#ff6b35', sub: summary.avgPosition < 20 ? 'Page 1-2 avg' : 'Optimization needed' },
            ].map((card, i) => (
              <div key={i} style={cardStyle}>
                <div style={labelStyle}>{card.label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: card.color, fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Tab toggle */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', padding: '0.25rem', width: 'fit-content' }}>
            {(['pages', 'queries'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  background: tab === t ? 'rgba(126,217,87,0.1)' : 'transparent',
                  color: tab === t ? '#6EE05A' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Top {t === 'pages' ? 'Pages' : 'Queries'}
              </button>
            ))}
          </div>

          {/* Top Pages Table */}
          {tab === 'pages' && (
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Page', 'Top Query', 'Clicks', 'Impr', 'CTR', 'Pos'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: h === 'Page' || h === 'Top Query' ? 'left' : 'right', ...labelStyle }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map((page, i) => (
                      <tr key={i} style={{ borderBottom: i < topPages.length - 1 ? '1px solid var(--bg-card)' : 'none' }}>
                        <td style={{ padding: '0.625rem 1rem', color: '#6EE05A', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {page.url || '/'}
                        </td>
                        <td style={{ padding: '0.625rem 1rem', color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {page.query}
                        </td>
                        <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                          {page.clicks}
                        </td>
                        <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {page.impressions.toLocaleString()}
                        </td>
                        <td style={{ padding: '0.625rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: page.ctr > 0.05 ? '#6EE05A' : page.ctr > 0.02 ? '#ff6b35' : 'var(--text-muted)' }}>
                          {(page.ctr * 100).toFixed(1)}%
                        </td>
                        <td style={{ padding: '0.625rem 1rem', textAlign: 'right', fontFamily: 'var(--font-mono)', color: page.position <= 10 ? '#6EE05A' : page.position <= 20 ? '#00d4ff' : 'var(--text-muted)' }}>
                          {page.position.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {topPages.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No page data available for this period
                </div>
              )}
            </div>
          )}

          {/* Top Queries Table */}
          {tab === 'queries' && (
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Query', 'Clicks', 'Impressions', 'Pages'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: h === 'Query' ? 'left' : 'right', ...labelStyle }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topQueries.map((q, i) => (
                      <tr key={i} style={{ borderBottom: i < topQueries.length - 1 ? '1px solid var(--bg-card)' : 'none' }}>
                        <td style={{ padding: '0.625rem 1rem', color: '#00d4ff', fontWeight: 500 }}>
                          {q.query}
                        </td>
                        <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                          {q.clicks}
                        </td>
                        <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {q.impressions.toLocaleString()}
                        </td>
                        <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {q.pages}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {topQueries.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No query data available for this period
                </div>
              )}
            </div>
          )}
        </>
      ) : error ? (
        <div style={{ ...cardStyle, borderColor: 'rgba(239,68,68,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#ef4444', marginBottom: '0.5rem' }}>Unable to load Search Console data</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{error}</div>
        </div>
      ) : null}

      {/* Indexing Section */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem', fontFamily: 'var(--font-display)' }}>
          Search Engine Indexing
        </h2>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            onClick={() => handleIndex('submit_all')}
            disabled={indexing}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: 'none',
              background: '#6EE05A', color: '#000', fontWeight: 700,
              fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
              opacity: indexing ? 0.6 : 1,
            }}
          >
            {indexing ? 'Submitting...' : 'Submit All (GSC + IndexNow)'}
          </button>
          <button
            onClick={() => handleIndex('ping_sitemap')}
            disabled={indexing}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: '0.5rem',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-primary)', fontWeight: 600,
              fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
              opacity: indexing ? 0.6 : 1,
            }}
          >
            Sitemap Only
          </button>
        </div>

        {/* Engine Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.625rem', marginBottom: '1rem' }}>
          {[
            { label: 'Google GSC', color: '#4285f4', desc: 'OAuth sitemap submit' },
            { label: 'IndexNow', color: '#00d4ff', desc: '4 engines simultaneous' },
            { label: 'Sitemap', color: '#6EE05A', desc: 'sitemap.xml (300+ pages)' },
          ].map((card, i) => (
            <div key={i} style={{ ...cardStyle, padding: '0.875rem' }}>
              <div style={labelStyle}>{card.label}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: card.color, marginTop: '0.25rem' }}>Active</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{card.desc}</div>
            </div>
          ))}
        </div>

        {/* Custom URL Submit */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Custom URL Submission (IndexNow)</div>
          <textarea
            value={customUrls}
            onChange={e => setCustomUrls(e.target.value)}
            placeholder={'Enter URLs (one per line)\nhttps://www.0nmcp.com/new-page\nhttps://www.0nmcp.com/blog/new-post'}
            rows={3}
            style={{
              width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
              border: '1px solid var(--border)', background: 'var(--bg-primary)',
              color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
              resize: 'vertical',
            }}
          />
          <button
            onClick={() => handleIndex('indexnow')}
            disabled={indexing || !customUrls.trim()}
            style={{
              marginTop: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.8rem',
              cursor: 'pointer', fontFamily: 'inherit',
              opacity: indexing || !customUrls.trim() ? 0.5 : 1,
            }}
          >
            Submit Custom URLs
          </button>
        </div>

        {/* Indexing Results */}
        {indexResults && (
          <div style={{ ...cardStyle, marginTop: '0.75rem' }}>
            <div style={{ ...labelStyle, marginBottom: '0.75rem' }}>Results</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {Object.entries(indexResults).map(([key, result]) => {
                const engine = ENGINE_LABELS[key] || { name: key, color: 'var(--text-muted)' }
                const isSuccess = result.status === 'success'
                const isInfo = result.status === 'info'
                return (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                    background: isSuccess ? 'rgba(126,217,87,0.05)' : isInfo ? 'rgba(0,212,255,0.05)' : 'rgba(239,68,68,0.05)',
                    border: `1px solid ${isSuccess ? 'rgba(126,217,87,0.15)' : isInfo ? 'rgba(0,212,255,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: isSuccess ? '#6EE05A' : isInfo ? '#00d4ff' : '#ef4444',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: engine.color, flex: 1 }}>{engine.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {result.response || result.error || result.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
