'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface HistoryItem {
  id: string
  content_id: string
  platform: string
  platform_url: string | null
  status: string
  distributed_at: string | null
  created_at: string
  qa_content?: {
    topic: string
    title: string | null
    content: string
    quality_score: number | null
    reading_level: string | null
    keywords: string[]
  }
}

const PLATFORM_COLORS: Record<string, string> = {
  quora: '#B92B27',
  reddit: '#FF4500',
  poe: '#5B4CDB',
  warrior_forum: '#D4A843',
  indiehackers: '#1F6BFF',
  growthhackers: '#00C65E',
  medium: '#888',
  hackernews: '#FF6600',
  producthunt: '#DA552F',
  dev_to: '#888',
  hashnode: '#2962FF',
  linkedin: '#0A66C2',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#ff6b35',
  in_progress: '#00d4ff',
  completed: '#00ff88',
  failed: '#ff3d3d',
  cancelled: '#484e78',
  draft: '#484e78',
}

type FilterPlatform = '' | string
type FilterStatus = '' | string

export default function QAHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPlatform, setFilterPlatform] = useState<FilterPlatform>('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('')
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterPlatform) params.set('platform', filterPlatform)
      if (filterStatus) params.set('status', filterStatus)

      const res = await fetch(`/api/qa/distribute?${params}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.distributions || [])
      }
    } catch {
      // Distribution history not available
    }
    setLoading(false)
  }, [filterPlatform, filterStatus])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  if (loading) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>0n</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Loading distribution history...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Distribution History</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Track past content distributions across platforms
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/qa" style={{ ...btnGhostStyle, textDecoration: 'none' }}>
            QA Dashboard
          </Link>
          <Link href="/admin/qa/generate" style={{ ...btnGhostStyle, textDecoration: 'none' }}>
            Generate
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Platforms</option>
          {Object.keys(PLATFORM_COLORS).map((p) => (
            <option key={p} value={p}>
              {p.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {items.length} distribution{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content list + detail split */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>No distributions yet</p>
              <p style={{ fontSize: '0.75rem' }}>
                <Link href="/admin/qa/generate" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  Generate and distribute content
                </Link>
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: selectedItem?.id === item.id ? 'rgba(255,255,255,0.06)' : 'var(--bg-card)',
                  border: `1px solid ${selectedItem?.id === item.id ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
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
                    }}
                  >
                    {item.platform.replace(/_/g, ' ')}
                  </span>
                  <span
                    style={{
                      fontSize: '0.5625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: (STATUS_COLORS[item.status] || '#fff') + '18',
                      color: STATUS_COLORS[item.status] || '#fff',
                    }}
                  >
                    {item.status}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {timeAgo(item.created_at)}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.qa_content?.title || item.qa_content?.topic || 'Untitled'}
                </div>
                {item.platform_url && (
                  <div style={{ fontSize: '0.625rem', color: 'var(--accent)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.platform_url}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Detail panel */}
        {selectedItem && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: (PLATFORM_COLORS[selectedItem.platform] || '#fff') + '18',
                    color: PLATFORM_COLORS[selectedItem.platform] || '#fff',
                  }}
                >
                  {selectedItem.platform.replace(/_/g, ' ')}
                </span>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: (STATUS_COLORS[selectedItem.status] || '#fff') + '18',
                    color: STATUS_COLORS[selectedItem.status] || '#fff',
                  }}
                >
                  {selectedItem.status}
                </span>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>
                &times;
              </button>
            </div>

            {/* Content Title */}
            {selectedItem.qa_content?.title && (
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
                {selectedItem.qa_content.title}
              </h4>
            )}

            {/* Topic */}
            {selectedItem.qa_content?.topic && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Topic: {selectedItem.qa_content.topic}
              </div>
            )}

            {/* Content Body */}
            {selectedItem.qa_content?.content && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  marginBottom: 16,
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {selectedItem.qa_content.content}
              </div>
            )}

            {/* Platform URL */}
            {selectedItem.platform_url && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Platform URL: </span>
                <a
                  href={selectedItem.platform_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.6875rem', color: 'var(--accent)', textDecoration: 'none' }}
                >
                  {selectedItem.platform_url}
                </a>
              </div>
            )}

            {/* Keywords */}
            {selectedItem.qa_content?.keywords && selectedItem.qa_content.keywords.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Keywords:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {selectedItem.qa_content.keywords.map((kw, i) => (
                    <span key={i} style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', fontSize: '0.625rem', color: 'var(--text-secondary)' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              {selectedItem.qa_content?.quality_score !== undefined && selectedItem.qa_content?.quality_score !== null && (
                <>Quality Score: {selectedItem.qa_content.quality_score}<br /></>
              )}
              {selectedItem.qa_content?.reading_level && (
                <>Reading Level: {selectedItem.qa_content.reading_level}<br /></>
              )}
              Created: {new Date(selectedItem.created_at).toLocaleString()}
              {selectedItem.distributed_at && (
                <><br />Distributed: {new Date(selectedItem.distributed_at).toLocaleString()}</>
              )}
            </div>
          </div>
        )}
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

const selectStyle: React.CSSProperties = {
  padding: '7px 12px',
  borderRadius: 8,
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontSize: '0.75rem',
  fontWeight: 600,
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
