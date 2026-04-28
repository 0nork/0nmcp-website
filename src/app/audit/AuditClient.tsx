'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

interface AuditCheck {
  id: string; name: string; status: 'pass' | 'warn' | 'fail'; score: number; detail: string; fix?: string
}
interface ActionItem { check: string; priority: string; action: string }
interface AuditResult {
  url: string; scannedAt: string; loadTimeMs: number; score: number; grade: string; gradeColor: string
  checks: AuditCheck[]; actionItems: ActionItem[]
  summary: { passed: number; warnings: number; failed: number }
  meta: { title: string; description: string; ogImage: string }
}

export default function AuditClient() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  async function runAudit() {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/audit/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const statusIcon = (s: string) => s === 'pass'
    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#6EE05A" fillOpacity="0.12"/><path d="M5.5 8l2 2 3.5-3.5" stroke="#6EE05A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    : s === 'warn'
    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#f59e0b" fillOpacity="0.12"/><path d="M8 5v3M8 10h.01" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/></svg>
    : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#ef4444" fillOpacity="0.12"/><path d="M6 6l4 4M10 6l-4 4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/></svg>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      {/* ── Hero ── */}
      <section style={{
        textAlign: 'center', padding: '6rem 1.5rem 3rem',
        backgroundImage: "linear-gradient(180deg, rgba(8,10,15,0.55) 0%, rgba(8,10,15,0.85) 70%, rgba(8,10,15,1) 100%), url('/images/audit-hero-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(110,224,90,0.18), transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 999, background: 'rgba(110,224,90,0.12)', border: '1px solid rgba(110,224,90,0.35)',
            color: '#a3f08e', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
            marginBottom: '1.25rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE05A', boxShadow: '0 0 8px #6EE05A' }} />
            FREE SXO AUDIT
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#ffffff',
            lineHeight: 1.1, margin: '0 0 1rem', letterSpacing: '-0.03em',
          }}>
            How does your<br />website <span style={{ color: '#6EE05A' }}>score</span>?
          </h1>

          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: '0 0 2rem' }}>
            10 checks. 5 seconds. Speed, SEO, security, mobile, schema, and more.
            Get your SXO score with actionable fixes.
          </p>

          {/* URL Input */}
          <div style={{
            display: 'flex', gap: 8, maxWidth: 520, margin: '0 auto',
            padding: 6, borderRadius: 14,
            background: 'rgba(20,22,30,0.85)', border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(110,224,90,0.05)',
          }}>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runAudit()}
              placeholder="Enter any website URL..."
              style={{
                flex: 1, padding: '14px 18px', borderRadius: 10, border: 'none',
                fontSize: '0.9375rem', color: '#ffffff', outline: 'none', background: 'transparent',
                fontFamily: 'inherit',
              }}
            />
            <button onClick={runAudit} disabled={loading || !url.trim()} style={{
              padding: '14px 28px', borderRadius: 10,
              background: loading ? '#3f4452' : '#6EE05A', color: loading ? '#9ca3af' : '#0a0a0a',
              fontSize: '0.9375rem', fontWeight: 700, border: 'none',
              cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap', transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 2px 16px rgba(110,224,90,0.4)',
            }}>
              {loading ? 'Scanning...' : 'Audit'}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: '0.8125rem', color: '#fca5a5', marginTop: 12 }}>{error}</p>
          )}

          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: 12 }}>
            No signup required. Powered by 0nMCP.
          </p>
        </div>
      </section>

      {/* ── Results ── */}
      {result && (
        <div ref={resultRef} style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
          {/* Grade Card */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border)',
            padding: '2rem', marginBottom: '1.5rem', textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', margin: '0 auto 1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${result.gradeColor}12`,
              border: `3px solid ${result.gradeColor}`,
              boxShadow: `0 0 30px ${result.gradeColor}20`,
            }}>
              <span style={{
                fontSize: '2.5rem', fontWeight: 900, color: result.gradeColor,
                fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em',
              }}>
                {result.grade}
              </span>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {result.score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '1rem' }}>
              {result.url} &middot; {(result.loadTimeMs / 1000).toFixed(2)}s load time
            </div>

            {/* Summary pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <span style={{ padding: '4px 14px', borderRadius: 8, background: 'rgba(110,224,90,0.08)', color: '#6EE05A', fontSize: '0.8125rem', fontWeight: 700 }}>
                {result.summary.passed} passed
              </span>
              {result.summary.warnings > 0 && (
                <span style={{ padding: '4px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', color: '#f59e0b', fontSize: '0.8125rem', fontWeight: 700 }}>
                  {result.summary.warnings} warnings
                </span>
              )}
              {result.summary.failed > 0 && (
                <span style={{ padding: '4px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.8125rem', fontWeight: 700 }}>
                  {result.summary.failed} failed
                </span>
              )}
            </div>
          </div>

          {/* Checks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            {result.checks.map(check => (
              <div key={check.id} style={{
                background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
                padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: 12,
                transition: 'all 0.2s',
              }}>
                <div style={{ marginTop: 2, flexShrink: 0 }}>{statusIcon(check.status)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{check.name}</span>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      color: check.status === 'pass' ? '#6EE05A' : check.status === 'warn' ? '#f59e0b' : '#ef4444',
                    }}>
                      {check.score}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.5 }}>{check.detail}</div>
                  {check.fix && (
                    <div style={{
                      marginTop: 8, padding: '8px 12px', borderRadius: 8,
                      background: 'var(--bg-secondary)', border: '1px solid #f0f0f0',
                      fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.5,
                    }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Fix: </span>{check.fix}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Items */}
          {result.actionItems.length > 0 && (
            <div style={{
              background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)',
              padding: '1.5rem', marginBottom: '2rem',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
                Priority Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.actionItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{
                      flexShrink: 0, width: 24, height: 24, borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6875rem', fontWeight: 800,
                      background: item.priority === 'critical' ? 'rgba(239,68,68,0.1)' : item.priority === 'important' ? 'rgba(245,158,11,0.1)' : 'rgba(110,224,90,0.1)',
                      color: item.priority === 'critical' ? '#ef4444' : item.priority === 'important' ? '#f59e0b' : '#6EE05A',
                    }}>
                      {i + 1}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.check}</div>
                      <div style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.5 }}>{item.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upsell */}
          <div style={{
            background: 'linear-gradient(135deg, #0B0F19, #162032)',
            borderRadius: 16, padding: '2rem', textAlign: 'center',
            border: '1px solid rgba(110,224,90,0.15)',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
              Want the full <span style={{ color: '#6EE05A' }}>domain report</span>?
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#7A8290', lineHeight: 1.6, margin: '0 0 1.25rem', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              Crawl up to 50 pages. Broken links, duplicate content, sitemap analysis, competitor comparison, and white-labeled client reports.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/signup" style={{
                padding: '12px 28px', borderRadius: 10, background: '#6EE05A', color: '#000',
                fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(110,224,90,0.25)',
              }}>
                Get Full Report — $14.99
              </Link>
              <Link href="/start" style={{
                padding: '12px 28px', borderRadius: 10, background: 'var(--border)',
                border: '1px solid var(--border)', color: 'var(--text-primary)',
                fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
              }}>
                Learn More
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Pre-results: Feature grid ── */}
      {!result && !loading && (
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.75rem' }}>
            {[
              { name: 'Page Speed', desc: 'Load time and performance analysis' },
              { name: 'Meta Tags', desc: 'Title and description optimization' },
              { name: 'Open Graph', desc: 'Social sharing preview tags' },
              { name: 'Security', desc: '6 critical security headers' },
              { name: 'Mobile', desc: 'Viewport and responsive check' },
              { name: 'Schema.org', desc: 'Structured data validation' },
              { name: 'Image Alt Text', desc: 'Accessibility coverage' },
              { name: 'Headings', desc: 'H1-H6 hierarchy check' },
              { name: 'Internal Links', desc: 'Crawlability analysis' },
              { name: 'HTTPS', desc: 'SSL certificate verification' },
            ].map(f => (
              <div key={f.name} style={{
                background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)',
                padding: '1rem 1.125rem',
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{f.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
