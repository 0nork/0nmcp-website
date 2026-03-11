'use client'

import { useState, useCallback } from 'react'

interface IndexResult {
  status: string
  response?: string
  error?: string
}

const ENGINE_LABELS: Record<string, { name: string; color: string }> = {
  google_gsc: { name: 'Google Search Console', color: '#4285f4' },
  bing_ping: { name: 'Bing (Sitemap Ping)', color: '#00809d' },
  bing_indexnow: { name: 'Bing (IndexNow)', color: '#00809d' },
  yandex_indexnow: { name: 'Yandex (IndexNow)', color: '#ff0000' },
  seznam_indexnow: { name: 'Seznam (IndexNow)', color: '#cc0000' },
  naver_indexnow: { name: 'Naver (IndexNow)', color: '#03c75a' },
  urls_submitted: { name: 'URLs Submitted', color: '#7ed957' },
}

export function AdminIndexing() {
  const [results, setResults] = useState<Record<string, IndexResult> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [customUrls, setCustomUrls] = useState('')
  const [lastSubmit, setLastSubmit] = useState<string | null>(null)

  const submitAll = useCallback(async () => {
    setSubmitting(true)
    setResults(null)
    try {
      const res = await fetch('/api/admin/indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_all' }),
      })
      const data = await res.json()
      setResults(data.results)
      setLastSubmit(new Date().toLocaleString())
    } catch {
      setResults({ error: { status: 'error', error: 'Failed to submit' } })
    }
    setSubmitting(false)
  }, [])

  const pingSitemap = useCallback(async () => {
    setSubmitting(true)
    setResults(null)
    try {
      const res = await fetch('/api/admin/indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping_sitemap' }),
      })
      const data = await res.json()
      setResults(data.results)
      setLastSubmit(new Date().toLocaleString())
    } catch {
      setResults({ error: { status: 'error', error: 'Failed to ping' } })
    }
    setSubmitting(false)
  }, [])

  const submitCustom = useCallback(async () => {
    if (!customUrls.trim()) return
    setSubmitting(true)
    setResults(null)
    const urls = customUrls.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'))
    try {
      const res = await fetch('/api/admin/indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'indexnow', urls }),
      })
      const data = await res.json()
      setResults(data.results)
      setLastSubmit(new Date().toLocaleString())
    } catch {
      setResults({ error: { status: 'error', error: 'Failed to submit' } })
    }
    setSubmitting(false)
  }, [customUrls])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
          Search Engine Indexing
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
          Submit to Google, Bing, Yandex, Seznam, Naver — sitemap ping + IndexNow protocol
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={submitAll}
          disabled={submitting}
          style={{
            padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: 'none',
            background: '#7ed957', color: '#000', fontWeight: 700,
            fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Submitting...' : 'Submit All (Sitemap + IndexNow)'}
        </button>
        <button
          onClick={pingSitemap}
          disabled={submitting}
          style={{
            padding: '0.625rem 1.25rem', borderRadius: '0.5rem',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-primary)', fontWeight: 600,
            fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          Ping Sitemap Only
        </button>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Sitemap', value: 'sitemap.xml', color: '#7ed957', desc: 'Auto-generated, 300+ pages' },
          { label: 'IndexNow', value: '5 engines', color: '#00d4ff', desc: 'Bing, Yandex, Seznam, Naver, DuckDuckGo' },
          { label: 'Protocol', value: 'Active', color: '#a78bfa', desc: 'Key file at /0nmcp-indexnow-2026-03.txt' },
        ].map((card, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem',
            border: '1px solid var(--border)', padding: '1rem',
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: card.color, fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {card.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Custom URL Submission */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem',
        border: '1px solid var(--border)', padding: '1rem',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Custom URL Submission (IndexNow)
        </div>
        <textarea
          value={customUrls}
          onChange={e => setCustomUrls(e.target.value)}
          placeholder="Enter URLs (one per line)&#10;https://www.0nmcp.com/new-page&#10;https://www.0nmcp.com/blog/new-post"
          rows={4}
          style={{
            width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
            border: '1px solid var(--border)', background: 'var(--bg-primary)',
            color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
            resize: 'vertical',
          }}
        />
        <button
          onClick={submitCustom}
          disabled={submitting || !customUrls.trim()}
          style={{
            marginTop: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.8rem',
            cursor: 'pointer', fontFamily: 'inherit',
            opacity: submitting || !customUrls.trim() ? 0.5 : 1,
          }}
        >
          Submit Custom URLs
        </button>
      </div>

      {/* Results */}
      {results && (
        <div style={{
          background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem',
          border: '1px solid var(--border)', padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Results
            </div>
            {lastSubmit && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                Last: {lastSubmit}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {Object.entries(results).map(([key, result]) => {
              const engine = ENGINE_LABELS[key] || { name: key, color: '#94a3b8' }
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
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: isSuccess ? '#7ed957' : isInfo ? '#00d4ff' : '#ef4444',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: engine.color }}>{engine.name}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {result.response || result.error || result.status}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Setup Checklist */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem',
        border: '1px solid var(--border)', padding: '1rem',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Verification Checklist
        </div>
        {[
          { label: 'robots.txt configured', done: true, note: 'Allows all crawlers, references sitemap' },
          { label: 'sitemap.xml auto-generated', done: true, note: '300+ pages, dynamic forum/profile/marketplace content' },
          { label: 'IndexNow key file deployed', done: true, note: 'public/0nmcp-indexnow-2026-03.txt' },
          { label: 'Google Search Console', done: true, note: 'Uses OAuth — GOOGLE_CLIENT_ID + SECRET + REFRESH_TOKEN in env' },
          { label: 'Bing Webmaster Tools', done: true, note: 'IndexNow auto-registers, no manual verification needed' },
          { label: 'Google Analytics connected', done: true, note: 'GA4 Property 444978038' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.03)' : 'none',
          }}>
            <span style={{ fontSize: '0.85rem' }}>{item.done ? '\u2705' : '\u2B1C'}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.label}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{item.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
