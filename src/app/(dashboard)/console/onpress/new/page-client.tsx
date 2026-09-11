'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewOnPressProject() {
  const [name, setName] = useState('')
  const [figmaUrl, setFigmaUrl] = useState('')
  const [type, setType] = useState<'theme' | 'plugin'>('theme')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const parseFigmaUrl = (url: string) => {
    const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  }

  const handleCreate = async () => {
    if (!name.trim()) { setError('Project name is required'); return }
    if (!figmaUrl.trim()) { setError('Figma URL is required'); return }

    const fileKey = parseFigmaUrl(figmaUrl)
    if (!fileKey) { setError('Invalid Figma URL. Use format: figma.com/file/KEY/name or figma.com/design/KEY/name'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/onpress/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          figma_file_key: fileKey,
          figma_file_name: name.trim(),
          generation_type: type,
          config: {
            slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            options: { woocommerce: false },
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create project')

      router.push(`/console/onpress/${data.project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  }

  const labelStyle = {
    fontSize: 12, fontWeight: 600 as const, color: '#7A8290',
    display: 'block' as const, marginBottom: 6,
  }

  return (
    <div style={{ padding: '32px 28px 96px', maxWidth: 600, margin: '0 auto' }}>
      <button
        onClick={() => router.back()}
        style={{
          background: 'none', border: 'none', color: '#7A8290',
          fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 24,
          fontFamily: 'inherit',
        }}
      >
        &larr; Back to OnPress
      </button>

      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
        New OnPress Project
      </h1>
      <p style={{ fontSize: 14, color: '#7a8290', marginBottom: 32 }}>
        Paste your Figma file URL and we'll extract the design system, then generate a WordPress theme or plugin.
      </p>

      {error && (
        <div style={{
          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
          fontSize: 13, color: '#F87171',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Project Name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. My Client Website"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Figma File URL *</label>
          <input
            value={figmaUrl}
            onChange={e => setFigmaUrl(e.target.value)}
            placeholder="https://www.figma.com/file/ABC123/FileName"
            style={inputStyle}
          />
          <p style={{ fontSize: 11, color: '#4A5568', marginTop: 4 }}>
            Paste the full URL from your Figma file. We'll extract design tokens and components.
          </p>
        </div>

        <div>
          <label style={labelStyle}>Generate</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['theme', 'plugin'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 10,
                  background: type === t ? 'rgba(110,224,90,0.1)' : 'var(--bg-card)',
                  border: `1px solid ${type === t ? 'rgba(110,224,90,0.3)' : 'var(--border)'}`,
                  color: type === t ? '#6EE05A' : '#7A8290',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                  textTransform: 'capitalize' as const,
                }}
              >
                WordPress {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Text Domain / Slug (optional)</label>
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="auto-generated from name"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading}
          style={{
            padding: '14px', borderRadius: 10, marginTop: 8,
            background: loading ? '#4A5568' : '#6EE05A',
            color: '#0B0F19', border: 'none', fontWeight: 700,
            fontSize: 15, cursor: loading ? 'default' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </div>
  )
}
