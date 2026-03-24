'use client'

import { useState, useEffect } from 'react'

interface DashboardData {
  totalOpportunities: number
  totalContent: number
  totalPosted: number
  totalEngagements: number
  avgScore: number
  topSubreddits: Array<{ dimension: string; key: string; weight: number; total_posts: number; avg_score: number }>
  topContentTypes: Array<{ dimension: string; key: string; weight: number; total_posts: number; avg_score: number }>
  topTones: Array<{ dimension: string; key: string; weight: number; total_posts: number; avg_score: number }>
  recentContent: Array<{
    id: string
    content_type: string
    subreddit: string
    title: string | null
    persona: string | null
    tone: string | null
    word_count: number
    status: string
    posted_at: string | null
    created_at: string
  }>
}

export function AdminRedditEngine() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<string | null>(null)

  const fetchData = () => {
    fetch('/api/admin/reddit-engine')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const runPhase = async (phase: string) => {
    setRunning(phase)
    try {
      const res = await fetch(`/api/cron/reddit-engine?phase=${phase}`)
      const result = await res.json()
      console.log(`[reddit-engine] ${phase}:`, result)
      fetchData() // Refresh dashboard
    } catch (err) {
      console.error(`[reddit-engine] ${phase} failed:`, err)
    }
    setRunning(null)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem',
            border: '1px solid var(--border)', height: '80px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    )
  }

  if (!data) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Failed to load Reddit Engine data</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header + Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Reddit Growth Engine
        </h2>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {['scan', 'draft', 'post', 'track', 'learn', 'all'].map(phase => (
            <button
              key={phase}
              onClick={() => runPhase(phase)}
              disabled={running !== null}
              style={{
                padding: '0.3rem 0.6rem', borderRadius: '0.375rem',
                border: '1px solid var(--border)', cursor: running ? 'not-allowed' : 'pointer',
                background: running === phase ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.02)',
                color: running === phase ? '#6EE05A' : 'var(--text-secondary)',
                fontSize: '0.65rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                opacity: running && running !== phase ? 0.5 : 1,
              }}
            >
              {running === phase ? `Running ${phase}...` : phase}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        <KPICard label="Opportunities" value={String(data.totalOpportunities)} color="#00d4ff" />
        <KPICard label="Content Drafted" value={String(data.totalContent)} color="#a78bfa" />
        <KPICard label="Posted" value={String(data.totalPosted)} color="#6EE05A" />
        <KPICard label="Engagements" value={String(data.totalEngagements)} color="#f59e0b" />
        <KPICard label="Avg Score" value={String(data.avgScore)} color="#00d4ff" />
      </div>

      {/* Weight Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        <WeightTable title="Top Subreddits" items={data.topSubreddits} />
        <WeightTable title="Content Types" items={data.topContentTypes} />
        <WeightTable title="Best Tones" items={data.topTones} />
      </div>

      {/* Recent Content */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
          Recent Content
        </h3>
        {data.recentContent.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>No content yet — run "scan" + "draft" to start</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Status', 'Type', 'Subreddit', 'Title/Preview', 'Persona', 'Words', 'Time'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentContent.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.4rem 0.5rem' }}>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {c.content_type}
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', color: '#00d4ff' }}>
                      r/{c.subreddit}
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title || '(comment)'}
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', color: '#a78bfa' }}>
                      {c.persona || '-'}
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {c.word_count}
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                      {c.posted_at ? new Date(c.posted_at).toLocaleDateString() : new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function KPICard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', padding: '1rem',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.375rem',
        fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '1.4rem', fontWeight: 700, color,
        fontFamily: 'var(--font-mono)',
      }}>
        {value}
      </div>
    </div>
  )
}

function WeightTable({ title, items }: {
  title: string
  items: Array<{ key: string; weight: number; total_posts: number; avg_score: number }>
}) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem' }}>
      <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
        {title}
      </h3>
      {items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>No data yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {items.map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
              <div style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                {item.key}
              </div>
              <div style={{
                width: '60px', height: '6px', borderRadius: '3px',
                background: 'rgba(255,255,255,0.05)', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.min(100, (item.weight / 2) * 100)}%`,
                  height: '100%', borderRadius: '3px',
                  background: item.weight > 1.2 ? '#6EE05A' : item.weight > 0.8 ? '#f59e0b' : '#ef4444',
                }} />
              </div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>
                {item.weight.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', width: '20px', textAlign: 'right' }}>
                {item.total_posts}p
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    draft: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
    approved: { bg: 'rgba(0,212,255,0.1)', text: '#00d4ff' },
    posted: { bg: 'rgba(126,217,87,0.1)', text: '#6EE05A' },
    failed: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
  }
  const c = colors[status] || { bg: 'rgba(255,255,255,0.05)', text: 'var(--text-muted)' }

  return (
    <span style={{
      fontSize: '0.55rem', fontWeight: 600, padding: '0.1rem 0.4rem',
      borderRadius: '9999px', background: c.bg, color: c.text,
      textTransform: 'uppercase', letterSpacing: '0.03em',
    }}>
      {status}
    </span>
  )
}
