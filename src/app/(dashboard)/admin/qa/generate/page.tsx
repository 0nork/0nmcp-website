'use client'

import { useState } from 'react'
import Link from 'next/link'
import { type PlatformId } from '@/lib/qa/types'

const PLATFORM_OPTIONS: { id: PlatformId; label: string; color: string }[] = [
  { id: 'quora', label: 'Quora', color: '#B92B27' },
  { id: 'reddit', label: 'Reddit', color: '#FF4500' },
  { id: 'poe', label: 'Poe', color: '#5B4CDB' },
  { id: 'warrior_forum', label: 'Warrior Forum', color: '#D4A843' },
  { id: 'indiehackers', label: 'Indie Hackers', color: '#1F6BFF' },
  { id: 'growthhackers', label: 'GrowthHackers', color: '#00C65E' },
  { id: 'medium', label: 'Medium', color: '#888' },
  { id: 'hackernews', label: 'Hacker News', color: '#FF6600' },
  { id: 'producthunt', label: 'Product Hunt', color: '#DA552F' },
  { id: 'dev_to', label: 'Dev.to', color: '#888' },
  { id: 'hashnode', label: 'Hashnode', color: '#2962FF' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
]

interface GeneratedItem {
  id: string
  platform: string
  title?: string
  body: string
  wordCount: number
  readingLevel: number
  scores: {
    authenticity: number
    value: number
    seoOptimization: number
    platformFit: number
  }
}

export default function QAGeneratePage() {
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(['reddit', 'hackernews', 'dev_to'])
  const [variantCount, setVariantCount] = useState(1)
  const [contentType, setContentType] = useState<'post' | 'answer' | 'comment' | 'article'>('post')
  const [includeBacklinks, setIncludeBacklinks] = useState(true)

  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<GeneratedItem[]>([])
  const [previewItem, setPreviewItem] = useState<GeneratedItem | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function togglePlatform(id: PlatformId) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function selectAllPlatforms() {
    if (selectedPlatforms.length === PLATFORM_OPTIONS.length) {
      setSelectedPlatforms([])
    } else {
      setSelectedPlatforms(PLATFORM_OPTIONS.map((p) => p.id))
    }
  }

  async function handleGenerate() {
    if (!topic.trim()) {
      setError('Topic is required')
      return
    }
    if (selectedPlatforms.length === 0) {
      setError('Select at least one platform')
      return
    }

    setGenerating(true)
    setError('')
    setMessage('')
    setResults([])
    setPreviewItem(null)

    try {
      const res = await fetch('/api/qa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          platforms: selectedPlatforms,
          variantCount,
          contentType,
          includeBacklinks,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResults(data.contents || [])
        setMessage(
          `Generated ${data.contents?.length || 0} pieces across ${data.summary?.totalPlatforms || 0} platforms (${data.summary?.totalWords || 0} words)`
        )
      }
    } catch {
      setError('Network error generating content')
    }

    setGenerating(false)
  }

  return (
    <div style={{ padding: '100px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Generate Content</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            AI-powered multi-platform content generation
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/qa" style={{ ...btnGhostStyle, textDecoration: 'none' }}>
            QA Dashboard
          </Link>
          <Link href="/admin/qa/history" style={{ ...btnGhostStyle, textDecoration: 'none' }}>
            History
          </Link>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ padding: '10px 16px', borderRadius: 12, marginBottom: 16, fontSize: '0.8125rem', fontWeight: 600, background: 'rgba(255,61,61,0.1)', color: '#ff3d3d', border: '1px solid rgba(255,61,61,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>&times;</button>
        </div>
      )}
      {message && (
        <div style={{ padding: '10px 16px', borderRadius: 12, marginBottom: 16, fontSize: '0.8125rem', fontWeight: 600, background: 'rgba(126,217,87,0.1)', color: 'var(--accent)', border: '1px solid rgba(126,217,87,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {message}
          <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>&times;</button>
        </div>
      )}

      {/* Generation Form */}
      <div style={{ padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 24 }}>
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 16 }}>Content Settings</h3>

        {/* Topic */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Topic *</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., How to connect 48 services with one MCP server"
            style={inputStyle}
          />
        </div>

        {/* Keywords */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Keywords (comma-separated)</label>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., MCP, AI orchestration, API tools, Claude, 0nMCP"
            style={inputStyle}
          />
        </div>

        {/* Content Type + Variants */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Content Type</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value as typeof contentType)} style={selectStyle}>
              <option value="post">Post</option>
              <option value="answer">Answer</option>
              <option value="comment">Comment</option>
              <option value="article">Article</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Variants per Platform</label>
            <select value={variantCount} onChange={(e) => setVariantCount(Number(e.target.value))} style={selectStyle}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 0, padding: '8px 0' }}>
              <input
                type="checkbox"
                checked={includeBacklinks}
                onChange={(e) => setIncludeBacklinks(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Include backlinks</span>
            </label>
          </div>
        </div>

        {/* Platform Selection */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Platforms ({selectedPlatforms.length} selected)</label>
            <button onClick={selectAllPlatforms} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.6875rem', fontWeight: 600, cursor: 'pointer' }}>
              {selectedPlatforms.length === PLATFORM_OPTIONS.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PLATFORM_OPTIONS.map((platform) => {
              const selected = selectedPlatforms.includes(platform.id)
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: selected ? platform.color + '20' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected ? platform.color + '60' : 'var(--border)'}`,
                    color: selected ? platform.color : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: selected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {platform.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            background: generating ? 'var(--bg-card)' : 'var(--accent)',
            color: generating ? 'var(--text-muted)' : 'var(--bg-primary)',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: generating ? 'wait' : 'pointer',
          }}
        >
          {generating ? 'Generating...' : `Generate for ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: previewItem ? '1fr 1fr' : '1fr', gap: 16 }}>
          {/* Results List */}
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 12 }}>
              Generated Content ({results.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {results.map((item) => {
                const platformOpt = PLATFORM_OPTIONS.find((p) => p.id === item.platform)
                const avgScore = (
                  (item.scores.authenticity + item.scores.value + item.scores.seoOptimization + item.scores.platformFit) / 4
                ).toFixed(1)

                return (
                  <div
                    key={item.id}
                    onClick={() => setPreviewItem(item)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: previewItem?.id === item.id ? 'rgba(255,255,255,0.06)' : 'var(--bg-card)',
                      border: `1px solid ${previewItem?.id === item.id ? 'var(--accent)' : 'var(--border)'}`,
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
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: (platformOpt?.color || '#fff') + '18',
                          color: platformOpt?.color || '#fff',
                        }}
                      >
                        {item.platform.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                        {item.wordCount} words
                      </span>
                      <span style={{ fontSize: '0.625rem', color: 'var(--accent)', marginLeft: 'auto', fontWeight: 700 }}>
                        Score: {avgScore}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title || item.body.slice(0, 80)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Preview Panel */}
          {previewItem && (
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
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: (PLATFORM_OPTIONS.find((p) => p.id === previewItem.platform)?.color || '#fff') + '18',
                    color: PLATFORM_OPTIONS.find((p) => p.id === previewItem.platform)?.color || '#fff',
                  }}
                >
                  {previewItem.platform.replace(/_/g, ' ')}
                </span>
                <button onClick={() => setPreviewItem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>
                  &times;
                </button>
              </div>

              {previewItem.title && (
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>{previewItem.title}</h4>
              )}

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
                  maxHeight: 400,
                  overflowY: 'auto',
                }}
              >
                {previewItem.body}
              </div>

              {/* Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <ScoreBadge label="Authenticity" value={previewItem.scores.authenticity} />
                <ScoreBadge label="Value" value={previewItem.scores.value} />
                <ScoreBadge label="SEO" value={previewItem.scores.seoOptimization} />
                <ScoreBadge label="Platform Fit" value={previewItem.scores.platformFit} />
              </div>

              {/* Meta */}
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                Words: {previewItem.wordCount} | Reading Level: Grade {previewItem.readingLevel}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  const color = value >= 8 ? '#7ed957' : value >= 6 ? '#ff6b35' : '#ff3d3d'
  return (
    <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '1rem', fontWeight: 900, color }}>{value}/10</div>
      <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: 4,
  fontWeight: 600,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  background: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontSize: '0.8125rem',
  fontWeight: 500,
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
