'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface SerpEntry {
  id: string
  keyword: string
  position: number | null
  url: string | null
  title: string | null
  featured_snippet: boolean
  people_also_ask: Array<{ question: string }> | null
  related_searches: Array<{ query: string }> | null
  tracked_at: string
}

interface KeywordConfig {
  id: string
  keyword: string
  is_active: boolean
  priority: number
  category: string | null
}

interface KeywordSummary {
  keyword: string
  category: string | null
  current: number | null
  previous: number | null
  change: number | null
  bestEver: number | null
  url: string | null
  featured: boolean
  trackCount: number
}

export default function AnalyticsDashboard() {
  const supabase = createSupabaseBrowser()
  const [summaries, setSummaries] = useState<KeywordSummary[]>([])
  const [keywords, setKeywords] = useState<KeywordConfig[]>([])
  const [history, setHistory] = useState<SerpEntry[]>([])
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState('feature')
  const [tab, setTab] = useState<'rankings' | 'keywords' | 'history'>('rankings')

  const loadData = useCallback(async () => {
    if (!supabase) return

    const [serpRes, kwRes] = await Promise.all([
      supabase
        .from('serp_tracking')
        .select('id, keyword, position, url, title, featured_snippet, people_also_ask, related_searches, tracked_at')
        .order('tracked_at', { ascending: false })
        .limit(500),
      supabase
        .from('serp_keywords')
        .select('*')
        .order('priority', { ascending: true }),
    ])

    const serp = serpRes.data || []
    const kws = kwRes.data || []
    setKeywords(kws)

    // Build summaries per keyword
    const byKeyword = new Map<string, SerpEntry[]>()
    for (const entry of serp) {
      if (!byKeyword.has(entry.keyword)) byKeyword.set(entry.keyword, [])
      byKeyword.get(entry.keyword)!.push(entry)
    }

    const sums: KeywordSummary[] = []
    for (const kw of kws) {
      const entries = byKeyword.get(kw.keyword) || []
      const current = entries[0]?.position ?? null
      const previous = entries[1]?.position ?? null
      const positions = entries.filter(e => e.position !== null).map(e => e.position!)
      const bestEver = positions.length ? Math.min(...positions) : null

      let change: number | null = null
      if (current !== null && previous !== null) {
        change = previous - current // positive = improved
      }

      sums.push({
        keyword: kw.keyword,
        category: kw.category,
        current,
        previous,
        change,
        bestEver,
        url: entries[0]?.url || null,
        featured: entries[0]?.featured_snippet || false,
        trackCount: entries.length,
      })
    }

    // Sort: ranked keywords first (by position), then unranked
    sums.sort((a, b) => {
      if (a.current === null && b.current === null) return 0
      if (a.current === null) return 1
      if (b.current === null) return -1
      return a.current - b.current
    })

    setSummaries(sums)
    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  // Load history for selected keyword
  useEffect(() => {
    if (!selectedKeyword || !supabase) {
      setHistory([])
      return
    }
    supabase
      .from('serp_tracking')
      .select('*')
      .eq('keyword', selectedKeyword)
      .order('tracked_at', { ascending: false })
      .limit(30)
      .then(({ data }) => setHistory(data || []))
  }, [selectedKeyword, supabase])

  const runManual = async () => {
    setRunning(true)
    try {
      const res = await fetch('/api/cron/serp-track', {
        headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}` },
      })
      const data = await res.json()
      alert(`Tracked ${data.tracked} keywords`)
      loadData()
    } catch {
      alert('Failed to run SERP tracker')
    }
    setRunning(false)
  }

  const addKeyword = async () => {
    if (!newKeyword.trim() || !supabase) return
    await supabase.from('serp_keywords').insert({
      keyword: newKeyword.trim(),
      category: newCategory,
      priority: 5,
    })
    setNewKeyword('')
    loadData()
  }

  const toggleKeyword = async (id: string, active: boolean) => {
    if (!supabase) return
    await supabase.from('serp_keywords').update({ is_active: active }).eq('id', id)
    loadData()
  }

  const deleteKeyword = async (id: string) => {
    if (!supabase) return
    await supabase.from('serp_keywords').delete().eq('id', id)
    loadData()
  }

  if (loading) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: '#00d4ff', fontSize: '2rem', fontWeight: 900 }}>SERP</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Loading analytics...</p>
      </div>
    )
  }

  const ranked = summaries.filter(s => s.current !== null)
  const unranked = summaries.filter(s => s.current === null && s.trackCount > 0)
  const untracked = summaries.filter(s => s.trackCount === 0)
  const avgPosition = ranked.length
    ? Math.round(ranked.reduce((s, r) => s + r.current!, 0) / ranked.length * 10) / 10
    : null
  const top10 = ranked.filter(s => s.current! <= 10).length
  const improved = summaries.filter(s => s.change !== null && s.change > 0).length

  return (
    <div style={{ padding: '100px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            SERP Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 4 }}>
            Keyword ranking tracker — powered by Zenserp
          </p>
        </div>
        <button
          onClick={runManual}
          disabled={running}
          style={{
            padding: '8px 20px', borderRadius: 10,
            background: running ? 'var(--bg-card)' : 'linear-gradient(135deg, #00d4ff, #7ed957)',
            border: 'none', color: running ? 'var(--text-muted)' : '#000',
            fontWeight: 700, fontSize: '0.8125rem', cursor: running ? 'not-allowed' : 'pointer',
          }}
        >
          {running ? 'Tracking...' : 'Run Now'}
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 24 }}>
        <StatCard label="Keywords" value={summaries.length} color="#00d4ff" />
        <StatCard label="Ranked" value={ranked.length} color="#7ed957" />
        <StatCard label="Top 10" value={top10} color="#ff6b35" />
        <StatCard label="Avg Position" value={avgPosition !== null ? avgPosition : '—'} color="#a78bfa" />
        <StatCard label="Improved" value={improved} color="#7ed957" sub="vs last check" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {(['rankings', 'keywords', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 16px', borderRadius: 8,
              background: tab === t ? 'rgba(0,212,255,0.15)' : 'transparent',
              border: tab === t ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
              color: tab === t ? '#00d4ff' : 'var(--text-secondary)',
              fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Rankings Tab */}
      {tab === 'rankings' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={thStyle}>Keyword</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Position</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Change</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Best</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>URL</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map(s => (
                  <tr
                    key={s.keyword}
                    onClick={() => { setSelectedKeyword(s.keyword); setTab('history') }}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700 }}>{s.keyword}</span>
                      {s.featured && <span style={{ marginLeft: 6, fontSize: '0.5625rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(255,107,53,0.15)', color: '#ff6b35', fontWeight: 700 }}>FEATURED</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 900, fontSize: '1rem',
                        color: s.current! <= 3 ? '#7ed957' : s.current! <= 10 ? '#00d4ff' : s.current! <= 30 ? '#ff6b35' : 'var(--text-secondary)',
                      }}>
                        {s.current}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {s.change !== null && s.change !== 0 && (
                        <span style={{
                          fontWeight: 700,
                          color: s.change > 0 ? '#7ed957' : '#ff3d3d',
                        }}>
                          {s.change > 0 ? `+${s.change}` : s.change}
                        </span>
                      )}
                      {s.change === 0 && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      {s.change === null && <span style={{ color: 'var(--text-muted)' }}>new</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-secondary)' }}>{s.bestEver}</td>
                    <td style={tdStyle}>
                      {s.category && (
                        <span style={{
                          fontSize: '0.625rem', padding: '2px 6px', borderRadius: 4,
                          background: s.category === 'brand' ? 'rgba(126,217,87,0.1)' : s.category === 'comparison' ? 'rgba(255,107,53,0.1)' : 'rgba(0,212,255,0.1)',
                          color: s.category === 'brand' ? '#7ed957' : s.category === 'comparison' ? '#ff6b35' : '#00d4ff',
                          fontWeight: 700,
                        }}>
                          {s.category}
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.6875rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.url?.replace('https://www.0nmcp.com', '') || '—'}
                    </td>
                  </tr>
                ))}
                {unranked.map(s => (
                  <tr
                    key={s.keyword}
                    onClick={() => { setSelectedKeyword(s.keyword); setTab('history') }}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', opacity: 0.5 }}
                  >
                    <td style={tdStyle}>{s.keyword}</td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>—</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }} />
                    <td style={{ ...tdStyle, textAlign: 'center' }} />
                    <td style={tdStyle}>
                      {s.category && <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{s.category}</span>}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.6875rem' }}>not ranking</td>
                  </tr>
                ))}
                {untracked.map(s => (
                  <tr key={s.keyword} style={{ borderBottom: '1px solid var(--border)', opacity: 0.3 }}>
                    <td style={tdStyle}>{s.keyword}</td>
                    <td colSpan={5} style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.6875rem' }}>not yet tracked</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Keywords Management Tab */}
      {tab === 'keywords' && (
        <div>
          {/* Add keyword */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={newKeyword}
              onChange={e => setNewKeyword(e.target.value)}
              placeholder="Add keyword..."
              onKeyDown={e => e.key === 'Enter' && addKeyword()}
              style={{
                flex: 1, padding: '8px 14px', borderRadius: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none',
              }}
            />
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              style={{
                padding: '8px 14px', borderRadius: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.8125rem',
              }}
            >
              <option value="brand">Brand</option>
              <option value="feature">Feature</option>
              <option value="comparison">Comparison</option>
              <option value="long-tail">Long Tail</option>
            </select>
            <button
              onClick={addKeyword}
              style={{
                padding: '8px 20px', borderRadius: 10,
                background: 'var(--accent)', border: 'none',
                color: '#000', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer',
              }}
            >
              Add
            </button>
          </div>

          {/* Keyword list */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {keywords.map(kw => (
              <div
                key={kw.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', borderBottom: '1px solid var(--border)',
                  opacity: kw.is_active ? 1 : 0.4,
                }}
              >
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, flex: 1 }}>{kw.keyword}</span>
                <span style={{
                  fontSize: '0.625rem', padding: '2px 6px', borderRadius: 4,
                  background: 'rgba(0,212,255,0.1)', color: '#00d4ff', fontWeight: 700,
                }}>
                  P{kw.priority}
                </span>
                {kw.category && (
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{kw.category}</span>
                )}
                <button
                  onClick={() => toggleKeyword(kw.id, !kw.is_active)}
                  style={{
                    padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: kw.is_active ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.05)',
                    color: kw.is_active ? '#7ed957' : 'var(--text-muted)',
                    fontSize: '0.625rem', fontWeight: 700,
                  }}
                >
                  {kw.is_active ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => deleteKeyword(kw.id)}
                  style={{
                    padding: '3px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: 'rgba(255,61,61,0.1)', color: '#ff3d3d',
                    fontSize: '0.625rem', fontWeight: 700,
                  }}
                >
                  DEL
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div>
          {/* Keyword selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {summaries.map(s => (
              <button
                key={s.keyword}
                onClick={() => setSelectedKeyword(s.keyword)}
                style={{
                  padding: '4px 12px', borderRadius: 8,
                  background: selectedKeyword === s.keyword ? 'rgba(0,212,255,0.2)' : 'var(--bg-card)',
                  border: selectedKeyword === s.keyword ? '1px solid rgba(0,212,255,0.4)' : '1px solid var(--border)',
                  color: selectedKeyword === s.keyword ? '#00d4ff' : 'var(--text-secondary)',
                  fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {s.keyword}
                {s.current !== null && (
                  <span style={{ marginLeft: 4, color: s.current <= 10 ? '#7ed957' : 'var(--text-muted)' }}>
                    #{s.current}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Position history chart (ASCII-style bar chart) */}
          {selectedKeyword && history.length > 0 && (
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 20 }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 16 }}>
                Position history: <span style={{ color: '#00d4ff' }}>{selectedKeyword}</span>
              </h3>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120, marginBottom: 16 }}>
                {[...history].reverse().map((h, i) => {
                  const pos = h.position
                  const height = pos ? Math.max(4, ((100 - Math.min(pos, 100)) / 100) * 100) : 2
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: '0.5rem', color: pos ? (pos <= 10 ? '#7ed957' : '#ff6b35') : 'var(--text-muted)' }}>
                        {pos || '—'}
                      </span>
                      <div style={{
                        width: '100%', height: `${height}%`, minHeight: 2, borderRadius: 3,
                        background: pos
                          ? pos <= 3 ? '#7ed957' : pos <= 10 ? '#00d4ff' : pos <= 30 ? '#ff6b35' : 'var(--text-muted)'
                          : 'rgba(255,255,255,0.05)',
                      }} />
                    </div>
                  )
                })}
              </div>

              {/* History table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={thStyle}>Date</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Position</th>
                    <th style={thStyle}>URL</th>
                    <th style={thStyle}>Featured</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdStyle}>{new Date(h.tracked_at).toLocaleDateString()}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: h.position ? (h.position <= 10 ? '#7ed957' : '#ff6b35') : 'var(--text-muted)' }}>
                        {h.position || '—'}
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                        {h.url?.replace('https://www.0nmcp.com', '') || '—'}
                      </td>
                      <td style={tdStyle}>{h.featured_snippet ? '✓' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* People Also Ask */}
              {history[0]?.people_also_ask?.length ? (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>People Also Ask</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {history[0].people_also_ask.map((q, i) => (
                      <div key={i} style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', padding: '4px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                        {q.question}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Related Searches */}
              {history[0]?.related_searches?.length ? (
                <div style={{ marginTop: 12 }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Related Searches</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {history[0].related_searches.map((r, i) => (
                      <span key={i} style={{ fontSize: '0.625rem', padding: '3px 8px', borderRadius: 6, background: 'rgba(0,212,255,0.08)', color: '#00d4ff' }}>
                        {r.query}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {selectedKeyword && history.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No tracking data yet. Click &ldquo;Run Now&rdquo; to start.
            </div>
          )}

          {!selectedKeyword && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Select a keyword to view position history
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, sub }: { label: string; value: number | string; color: string; sub?: string }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left', fontWeight: 700,
  color: 'var(--text-muted)', fontSize: '0.6875rem',
  textTransform: 'uppercase', letterSpacing: '0.06em',
}

const tdStyle: React.CSSProperties = {
  padding: '8px 16px',
}
