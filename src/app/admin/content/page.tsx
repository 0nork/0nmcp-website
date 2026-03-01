'use client'

import { useState, useEffect, useCallback } from 'react'

interface Topic {
  id: string
  category: string
  title: string
  priority: number
  times_used: number
  platforms: string[]
}

interface ContentItem {
  id: string
  topic_id: string | null
  platform: string
  content_type: string
  title: string | null
  body: string
  status: string
  scheduled_for: string | null
  posted_at: string | null
  posted_url: string | null
  rejection_reason: string | null
  generated_by: string
  reviewed_by: string | null
  edit_count: number
  created_at: string
  content_topics?: Topic
}

interface Stats {
  total: number
  draft: number
  review: number
  approved: number
  scheduled: number
  posted: number
  rejected: number
  topics: number
  platforms: number
}

type FilterStatus = '' | 'draft' | 'review' | 'approved' | 'scheduled' | 'posted' | 'rejected'
type FilterPlatform = '' | 'reddit' | 'linkedin' | 'blog' | 'hackernews' | 'twitter' | 'dev_to'

const STATUS_COLORS: Record<string, string> = {
  draft: '#484e78',
  review: '#ff6b35',
  approved: '#7ed957',
  scheduled: '#00d4ff',
  posted: '#9945ff',
  rejected: '#ff3d3d',
  failed: '#ff3d3d',
}

const PLATFORM_COLORS: Record<string, string> = {
  reddit: '#FF4500',
  linkedin: '#0A66C2',
  blog: '#7ed957',
  hackernews: '#FF6600',
  twitter: '#1DA1F2',
  dev_to: '#0A0A0A',
}

const CATEGORIES = [
  'mcp_education', 'feature_highlight', 'tutorial', 'comparison',
  'community', 'on_standard', 'roadmap', 'use_case', 'release', 'thought_leadership',
]

export default function ContentDashboard() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('')
  const [filterPlatform, setFilterPlatform] = useState<FilterPlatform>('')
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [posting, setPosting] = useState(false)
  const [message, setMessage] = useState('')

  // Generate form
  const [genPlatform, setGenPlatform] = useState('reddit')
  const [genType, setGenType] = useState('post')
  const [genCategory, setGenCategory] = useState('')

  const loadContent = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (filterPlatform) params.set('platform', filterPlatform)

    const res = await fetch(`/api/admin/content?${params}`)
    if (!res.ok) {
      setMessage('Failed to load content — check admin access')
      setLoading(false)
      return
    }
    const data = await res.json()
    setItems(data.items || [])
    setStats(data.stats)
    setLoading(false)
  }, [filterStatus, filterPlatform])

  const loadTopics = useCallback(async () => {
    const res = await fetch('/api/admin/content/topics')
    if (res.ok) {
      const data = await res.json()
      setTopics(data)
    }
  }, [])

  useEffect(() => {
    loadContent()
    loadTopics()
  }, [loadContent, loadTopics])

  async function handleGenerate() {
    setGenerating(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: genPlatform,
          content_type: genType,
          topic_category: genCategory || undefined,
        }),
      })
      const data = await res.json()
      if (data.item) {
        setMessage('Content generated successfully')
        loadContent()
      } else {
        setMessage(data.error || 'Generation failed')
      }
    } catch {
      setMessage('Network error')
    }
    setGenerating(false)
  }

  async function handleAction(id: string, action: string, extra?: Record<string, unknown>) {
    const res = await fetch(`/api/admin/content/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action, ...extra }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => prev.map(i => i.id === id ? updated : i))
      if (selectedItem?.id === id) setSelectedItem(updated)
      setMessage(`Content ${action}`)
    }
  }

  async function handleSaveEdit() {
    if (!selectedItem) return
    const res = await fetch(`/api/admin/content/${selectedItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, body: editBody }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
      setSelectedItem(updated)
      setMessage('Saved')
    }
  }

  async function handlePost(id: string) {
    setPosting(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/content/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage(`Posted to ${data.platform}${data.url ? ` — ${data.url}` : ''}`)
        loadContent()
        if (selectedItem?.id === id) {
          setSelectedItem({ ...selectedItem, status: 'posted', posted_url: data.url })
        }
      } else {
        setMessage(`Post failed: ${data.error || 'Unknown error'}`)
      }
    } catch {
      setMessage('Network error posting content')
    }
    setPosting(false)
  }

  async function handlePostAll() {
    const approved = items.filter(i => i.status === 'approved')
    if (approved.length === 0) {
      setMessage('No approved content to post')
      return
    }
    if (!confirm(`Post ${approved.length} approved item${approved.length !== 1 ? 's' : ''}?`)) return

    setPosting(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/content/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: approved.map(i => i.id) }),
      })
      const data = await res.json()
      setMessage(`Batch complete: ${data.posted} posted, ${data.failed} failed`)
      loadContent()
    } catch {
      setMessage('Network error during batch post')
    }
    setPosting(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this content permanently?')) return
    const res = await fetch(`/api/admin/content/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== id))
      if (selectedItem?.id === id) setSelectedItem(null)
      setMessage('Deleted')
    }
  }

  function openItem(item: ContentItem) {
    setSelectedItem(item)
    setEditTitle(item.title || '')
    setEditBody(item.body)
  }

  if (loading) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>0n</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Loading content dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Content Pipeline</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            AI-generated marketing content — review, edit, approve, post.
          </p>
        </div>
        <button
          onClick={handlePostAll}
          disabled={posting || items.filter(i => i.status === 'approved').length === 0}
          style={{
            padding: '8px 20px',
            borderRadius: 10,
            background: posting ? 'var(--bg-card)' : '#9945ff18',
            color: posting ? 'var(--text-muted)' : '#9945ff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.8125rem',
            cursor: posting ? 'wait' : 'pointer',
          }}
        >
          {posting ? 'Posting...' : `Post All Approved (${items.filter(i => i.status === 'approved').length})`}
        </button>
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
            background: message.includes('fail') || message.includes('error') ? 'rgba(255,61,61,0.1)' : 'rgba(126,217,87,0.1)',
            color: message.includes('fail') || message.includes('error') ? '#ff3d3d' : 'var(--accent)',
            border: `1px solid ${message.includes('fail') || message.includes('error') ? 'rgba(255,61,61,0.2)' : 'rgba(126,217,87,0.2)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {message}
          <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>&times;</button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 24 }}>
          {Object.entries(stats).filter(([k]) => k !== 'platforms').map(([key, val]) => (
            <div
              key={key}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: STATUS_COLORS[key] || 'var(--text)' }}>{val}</div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{key}</div>
            </div>
          ))}
        </div>
      )}

      {/* Generate section */}
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          marginBottom: 24,
        }}
      >
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 12 }}>Generate Content</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Platform</label>
            <select value={genPlatform} onChange={e => setGenPlatform(e.target.value)} style={selectStyle}>
              <option value="reddit">Reddit</option>
              <option value="linkedin">LinkedIn</option>
              <option value="blog">Blog</option>
              <option value="hackernews">Hacker News</option>
              <option value="twitter">Twitter</option>
              <option value="dev_to">Dev.to</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
            <select value={genType} onChange={e => setGenType(e.target.value)} style={selectStyle}>
              <option value="post">Post</option>
              <option value="article">Article</option>
              <option value="comment">Comment</option>
              <option value="thread">Thread</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Category (optional)</label>
            <select value={genCategory} onChange={e => setGenCategory(e.target.value)} style={selectStyle}>
              <option value="">Any</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              background: generating ? 'var(--bg-card)' : 'var(--accent)',
              color: generating ? 'var(--text-muted)' : 'var(--bg-primary)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: generating ? 'wait' : 'pointer',
            }}
          >
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)} style={selectStyle}>
          <option value="">All statuses</option>
          <option value="review">Review</option>
          <option value="approved">Approved</option>
          <option value="scheduled">Scheduled</option>
          <option value="posted">Posted</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
        </select>
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value as FilterPlatform)} style={selectStyle}>
          <option value="">All platforms</option>
          <option value="reddit">Reddit</option>
          <option value="linkedin">LinkedIn</option>
          <option value="blog">Blog</option>
          <option value="hackernews">Hacker News</option>
          <option value="twitter">Twitter</option>
          <option value="dev_to">Dev.to</option>
        </select>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Content list + detail split */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>No content yet</p>
              <p style={{ fontSize: '0.75rem' }}>Generate your first piece above</p>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                onClick={() => openItem(item)}
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
                    {item.platform}
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
                    {item.content_type}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title || item.body.slice(0, 80)}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {item.content_topics?.title || 'No topic'} &middot; {new Date(item.created_at).toLocaleDateString()}
                </div>
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
              <div>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: (PLATFORM_COLORS[selectedItem.platform] || '#fff') + '18',
                    color: PLATFORM_COLORS[selectedItem.platform],
                  }}
                >
                  {selectedItem.platform} {selectedItem.content_type}
                </span>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 6,
                    marginLeft: 6,
                    background: (STATUS_COLORS[selectedItem.status] || '#fff') + '18',
                    color: STATUS_COLORS[selectedItem.status],
                  }}
                >
                  {selectedItem.status}
                </span>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
            </div>

            {/* Editable title */}
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Title..."
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '8px 12px',
                color: 'var(--text)',
                fontSize: '0.875rem',
                fontWeight: 700,
                marginBottom: 8,
              }}
            />

            {/* Editable body */}
            <textarea
              value={editBody}
              onChange={e => setEditBody(e.target.value)}
              rows={16}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
                color: 'var(--text)',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: 12,
              }}
            />

            {/* Meta */}
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.8 }}>
              Topic: {selectedItem.content_topics?.title || '—'}<br />
              Generated: {new Date(selectedItem.created_at).toLocaleString()}<br />
              Edits: {selectedItem.edit_count} &middot; By: {selectedItem.generated_by}
              {selectedItem.reviewed_by && <><br />Reviewed by: {selectedItem.reviewed_by}</>}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={handleSaveEdit} style={btnStyle('var(--accent)')}>Save Edits</button>
              {selectedItem.status !== 'approved' && (
                <button onClick={() => handleAction(selectedItem.id, 'approved')} style={btnStyle('#7ed957')}>Approve</button>
              )}
              {selectedItem.status !== 'rejected' && (
                <button onClick={() => handleAction(selectedItem.id, 'rejected')} style={btnStyle('#ff3d3d')}>Reject</button>
              )}
              {(selectedItem.status === 'approved' || selectedItem.status === 'scheduled') && (
                <button
                  onClick={() => handlePost(selectedItem.id)}
                  disabled={posting}
                  style={btnStyle('#9945ff')}
                >
                  {posting ? 'Posting...' : 'Post Now'}
                </button>
              )}
              {selectedItem.status === 'approved' && (
                <button onClick={() => handleAction(selectedItem.id, 'scheduled', { scheduled_for: new Date(Date.now() + 86400000).toISOString() })} style={btnStyle('#00d4ff')}>Schedule +1d</button>
              )}
              {selectedItem.posted_url && (
                <a href={selectedItem.posted_url} target="_blank" rel="noopener noreferrer" style={{ ...btnStyle('#7ed957'), textDecoration: 'none', display: 'inline-block' }}>View Post</a>
              )}
              <button onClick={() => handleDelete(selectedItem.id)} style={btnStyle('#ff3d3d', true)}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '7px 12px',
  borderRadius: 8,
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: '0.75rem',
  fontWeight: 600,
}

function btnStyle(color: string, ghost?: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 8,
    background: ghost ? 'transparent' : color + '18',
    color,
    border: ghost ? `1px solid ${color}30` : 'none',
    fontWeight: 700,
    fontSize: '0.75rem',
    cursor: 'pointer',
  }
}
