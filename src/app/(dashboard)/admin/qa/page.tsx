'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Stats {
  totalContent: number
  drafted: number
  distributed: number
  failed: number
  platforms: number
  pending: number
}

interface RecentActivity {
  id: string
  topic: string
  platform: string
  status: string
  quality_score: number | null
  created_at: string
}

const PLATFORM_COLORS: Record<string, string> = {
  quora: '#B92B27',
  reddit: '#FF4500',
  poe: '#5B4CDB',
  warrior_forum: '#D4A843',
  indiehackers: '#1F6BFF',
  growthhackers: '#00C65E',
  medium: '#000000',
  hackernews: '#FF6600',
  producthunt: '#DA552F',
  dev_to: '#08090A',
  hashnode: '#2962FF',
  linkedin: '#0A66C2',
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#484e78',
  pending: '#ff6b35',
  completed: '#7ed957',
  failed: '#ff3d3d',
  in_progress: '#00d4ff',
}

export default function QADashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/qa/generate?stats=true')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || null)
        setRecent(data.recent || [])
      }
    } catch {
      // Stats not available yet
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>0n</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Loading QA engine...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            QA Distribution Engine
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: 4 }}>
            Multi-platform content generation and distribution
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin" style={{ ...btnGhostStyle, textDecoration: 'none' }}>
            Admin
          </Link>
          <Link href="/admin/qa/generate" style={{ ...btnAccentStyle, textDecoration: 'none' }}>
            Generate Content
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 28 }}>
        <StatBox label="Total Content" value={stats?.totalContent || 0} color="var(--accent)" />
        <StatBox label="Drafted" value={stats?.drafted || 0} color="#484e78" />
        <StatBox label="Distributed" value={stats?.distributed || 0} color="#7ed957" />
        <StatBox label="Pending" value={stats?.pending || 0} color="#ff6b35" />
        <StatBox label="Failed" value={stats?.failed || 0} color="#ff3d3d" />
        <StatBox label="Platforms" value={stats?.platforms || 0} color="#9945ff" />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 32 }}>
        {[
          {
            title: 'Generate Content',
            description: 'Create AI-powered content for multiple platforms.',
            href: '/admin/qa/generate',
            color: 'var(--accent)',
          },
          {
            title: 'Distribution History',
            description: 'View past distributions, filter by platform/status.',
            href: '/admin/qa/history',
            color: '#9945ff',
          },
          {
            title: 'Content Pipeline',
            description: 'Marketing content — review, edit, approve, post.',
            href: '/admin/content',
            color: '#7ed957',
          },
          {
            title: 'Admin Dashboard',
            description: 'Back to main admin panel.',
            href: '/admin',
            color: '#00d4ff',
          },
        ].map((section) => (
          <Link key={section.href} href={section.href} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 14,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = section.color + '60'
                ;(e.currentTarget as HTMLElement).style.background = section.color + '08'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: section.color, marginBottom: 4 }}>
                {section.title}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                {section.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Platform Overview */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>Supported Platforms</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
            <span
              key={platform}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                background: color + '18',
                color: color === '#000000' || color === '#08090A' ? '#aaa' : color,
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {platform.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Recent Activity</h3>
          <Link href="/admin/qa/history" style={{ fontSize: '0.6875rem', color: 'var(--accent)', textDecoration: 'none' }}>
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>No content generated yet</p>
            <p style={{ fontSize: '0.75rem' }}>
              <Link href="/admin/qa/generate" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Generate your first batch
              </Link>
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recent.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: (PLATFORM_COLORS[item.platform] || '#fff') + '18',
                    color: PLATFORM_COLORS[item.platform] || '#fff',
                    flexShrink: 0,
                  }}
                >
                  {item.platform.replace(/_/g, ' ')}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.topic}
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                    {item.quality_score !== null && `Score: ${item.quality_score} | `}
                    {timeAgo(item.created_at)}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: (STATUS_COLORS[item.status] || '#fff') + '18',
                    color: STATUS_COLORS[item.status] || '#fff',
                    flexShrink: 0,
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
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
      <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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

const btnAccentStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 8,
  background: 'var(--accent)',
  border: 'none',
  color: 'var(--bg-primary)',
  fontWeight: 700,
  fontSize: '0.75rem',
  cursor: 'pointer',
}
