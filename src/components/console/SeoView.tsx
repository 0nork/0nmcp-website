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

  return (
    <div className="px-8 py-6 max-w-[1100px] mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] m-0">
            SEO Engine
          </h1>
          <p className="text-[0.8rem] text-[var(--text-muted)] mt-1 mb-0">
            Google Search Console analytics + multi-engine indexing
          </p>
        </div>
        <div className="flex gap-1.5">
          {[7, 28, 90].map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer font-[inherit] transition-colors"
              style={{
                border: period === d ? '1px solid #6EE05A' : '1px solid var(--border)',
                background: period === d ? 'rgba(126,217,87,0.1)' : 'transparent',
                color: period === d ? '#6EE05A' : 'var(--text-muted)',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Connection status */}
      {!googleConnected && (
        <div className="rounded-xl border border-[#ff6b35]/30 bg-[#ff6b35]/5 p-5 flex items-center gap-3">
          <span className="text-xl">&#9888;</span>
          <div>
            <div className="text-[0.85rem] font-semibold text-[#ff6b35]">Google not connected</div>
            <div className="text-xs text-[var(--text-muted)]">
              Connect Google in the Vault to see Search Console data. IndexNow indexing still works without Google.
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)] text-[0.85rem]">
          Loading Search Console data...
        </div>
      ) : summary ? (
        <>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {[
              { label: 'Total Clicks', value: summary.totalClicks.toLocaleString(), color: '#6EE05A', sub: `${summary.period} period` },
              { label: 'Impressions', value: summary.totalImpressions.toLocaleString(), color: '#00d4ff', sub: `${summary.totalPages} pages` },
              { label: 'Avg CTR', value: `${summary.avgCtr}%`, color: '#a78bfa', sub: summary.avgCtr > 3 ? 'Above average' : 'Room to grow' },
              { label: 'Avg Position', value: summary.avgPosition.toFixed(1), color: '#ff6b35', sub: summary.avgPosition < 20 ? 'Page 1-2 avg' : 'Optimization needed' },
            ].map((card, i) => (
              <div key={i} className="bg-white/[0.02] rounded-xl border border-[var(--border)] p-5">
                <div className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{card.label}</div>
                <div className="text-[1.75rem] font-extrabold mt-1 font-mono" style={{ color: card.color }}>
                  {card.value}
                </div>
                <div className="text-[0.65rem] text-[var(--text-muted)] mt-1">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Tab toggle */}
          <div className="flex gap-1 bg-white/[0.02] rounded-lg p-1 w-fit">
            {(['pages', 'queries'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2 rounded-md border-0 text-[0.8rem] font-semibold cursor-pointer font-[inherit] transition-colors"
                style={{
                  background: tab === t ? 'rgba(126,217,87,0.1)' : 'transparent',
                  color: tab === t ? '#6EE05A' : 'var(--text-muted)',
                }}
              >
                Top {t === 'pages' ? 'Pages' : 'Queries'}
              </button>
            ))}
          </div>

          {/* Top Pages Table */}
          {tab === 'pages' && (
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[0.8rem]">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Page', 'Top Query', 'Clicks', 'Impr', 'CTR', 'Pos'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] ${h === 'Page' || h === 'Top Query' ? 'text-left' : 'text-right'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map((page, i) => (
                      <tr key={i} className={i < topPages.length - 1 ? 'border-b border-[var(--bg-card)]' : ''}>
                        <td className="px-4 py-2.5 text-[#6EE05A] font-medium font-mono text-xs max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {page.url || '/'}
                        </td>
                        <td className="px-4 py-2.5 text-[var(--text-secondary)] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {page.query}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--text-primary)] font-semibold font-mono">
                          {page.clicks}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--text-muted)] font-mono">
                          {page.impressions.toLocaleString()}
                        </td>
                        <td
                          className="px-4 py-2.5 text-right font-mono"
                          style={{ color: page.ctr > 0.05 ? '#6EE05A' : page.ctr > 0.02 ? '#ff6b35' : 'var(--text-muted)' }}
                        >
                          {(page.ctr * 100).toFixed(1)}%
                        </td>
                        <td
                          className="px-4 py-2.5 text-right font-mono"
                          style={{ color: page.position <= 10 ? '#6EE05A' : page.position <= 20 ? '#00d4ff' : 'var(--text-muted)' }}
                        >
                          {page.position.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {topPages.length === 0 && (
                <div className="py-8 text-center text-[var(--text-muted)] text-[0.8rem]">
                  No page data available for this period
                </div>
              )}
            </div>
          )}

          {/* Top Queries Table */}
          {tab === 'queries' && (
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[0.8rem]">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Query', 'Clicks', 'Impressions', 'Pages'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] ${h === 'Query' ? 'text-left' : 'text-right'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topQueries.map((q, i) => (
                      <tr key={i} className={i < topQueries.length - 1 ? 'border-b border-[var(--bg-card)]' : ''}>
                        <td className="px-4 py-2.5 text-[#00d4ff] font-medium">
                          {q.query}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--text-primary)] font-semibold font-mono">
                          {q.clicks}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--text-muted)] font-mono">
                          {q.impressions.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[var(--text-muted)] font-mono">
                          {q.pages}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {topQueries.length === 0 && (
                <div className="py-8 text-center text-[var(--text-muted)] text-[0.8rem]">
                  No query data available for this period
                </div>
              )}
            </div>
          )}
        </>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 p-5 text-center">
          <div className="text-[0.85rem] text-red-500 mb-2">Unable to load Search Console data</div>
          <div className="text-xs text-[var(--text-muted)]">{error}</div>
        </div>
      ) : null}

      {/* Indexing Section */}
      <div>
        <h2 className="text-[1.1rem] font-bold text-[var(--text-primary)] mb-4">
          Search Engine Indexing
        </h2>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => handleIndex('submit_all')}
            disabled={indexing}
            className="px-5 py-2.5 rounded-lg border-0 bg-[#6EE05A] text-black font-bold text-[0.85rem] cursor-pointer font-[inherit] disabled:opacity-60"
          >
            {indexing ? 'Submitting...' : 'Submit All (GSC + IndexNow)'}
          </button>
          <button
            onClick={() => handleIndex('ping_sitemap')}
            disabled={indexing}
            className="px-5 py-2.5 rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-primary)] font-semibold text-[0.85rem] cursor-pointer font-[inherit] disabled:opacity-60"
          >
            Sitemap Only
          </button>
        </div>

        {/* Engine Status Cards */}
        <div className="grid gap-2.5 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {[
            { label: 'Google GSC', color: '#4285f4', desc: 'OAuth sitemap submit' },
            { label: 'IndexNow', color: '#00d4ff', desc: '4 engines simultaneous' },
            { label: 'Sitemap', color: '#6EE05A', desc: 'sitemap.xml (300+ pages)' },
          ].map((card, i) => (
            <div key={i} className="bg-white/[0.02] rounded-xl border border-[var(--border)] p-3.5">
              <div className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">{card.label}</div>
              <div className="text-[0.85rem] font-semibold mt-1" style={{ color: card.color }}>Active</div>
              <div className="text-[0.65rem] text-[var(--text-muted)] mt-0.5">{card.desc}</div>
            </div>
          ))}
        </div>

        {/* Custom URL Submit */}
        <div className="bg-white/[0.02] rounded-xl border border-[var(--border)] p-5">
          <div className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">Custom URL Submission (IndexNow)</div>
          <textarea
            value={customUrls}
            onChange={e => setCustomUrls(e.target.value)}
            placeholder={'Enter URLs (one per line)\nhttps://www.0nmcp.com/new-page\nhttps://www.0nmcp.com/blog/new-post'}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[0.8rem] font-mono resize-y"
          />
          <button
            onClick={() => handleIndex('indexnow')}
            disabled={indexing || !customUrls.trim()}
            className="mt-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-transparent text-[var(--text-primary)] font-semibold text-[0.8rem] cursor-pointer font-[inherit] disabled:opacity-50"
          >
            Submit Custom URLs
          </button>
        </div>

        {/* Indexing Results */}
        {indexResults && (
          <div className="bg-white/[0.02] rounded-xl border border-[var(--border)] p-5 mt-3">
            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3">Results</div>
            <div className="flex flex-col gap-1.5">
              {Object.entries(indexResults).map(([key, result]) => {
                const engine = ENGINE_LABELS[key] || { name: key, color: 'var(--text-muted)' }
                const isSuccess = result.status === 'success'
                const isInfo = result.status === 'info'
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{
                      background: isSuccess ? 'rgba(126,217,87,0.05)' : isInfo ? 'rgba(0,212,255,0.05)' : 'rgba(239,68,68,0.05)',
                      border: `1px solid ${isSuccess ? 'rgba(126,217,87,0.15)' : isInfo ? 'rgba(0,212,255,0.15)' : 'rgba(239,68,68,0.15)'}`,
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: isSuccess ? '#6EE05A' : isInfo ? '#00d4ff' : '#ef4444' }}
                    />
                    <span className="text-[0.8rem] font-semibold flex-1" style={{ color: engine.color }}>{engine.name}</span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">
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
