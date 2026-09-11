'use client'

import { useState } from 'react'

export default function SiteBuilderPage() {
  const [domain, setDomain] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)

  const handleBuild = async () => {
    if (!businessName.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/autobuild/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          domain: domain.trim() || undefined,
          description: description.trim() || undefined,
        }),
      })
      const data = await res.json()
      setResult({ success: res.ok, message: data.message || (res.ok ? 'Build started!' : 'Build failed') })
    } catch {
      setResult({ success: false, message: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '32px 28px 96px', maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
        Website Builder
      </h1>
      <p style={{ fontSize: 14, color: '#7a8290', marginTop: 8, marginBottom: 32 }}>
        Describe your business and we build you a complete website with AI. Deployed live in minutes.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#7A8290', display: 'block', marginBottom: 6 }}>
            Business Name *
          </label>
          <input
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="e.g. Acme Marketing Agency"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#7A8290', display: 'block', marginBottom: 6 }}>
            Domain (optional)
          </label>
          <input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="e.g. acmemarketing.com"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#7A8290', display: 'block', marginBottom: 6 }}>
            What does your business do?
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tell us about your business, services, target audience..."
            rows={4}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          onClick={handleBuild}
          disabled={loading || !businessName.trim()}
          style={{
            padding: '14px 24px', borderRadius: 10, border: 'none',
            background: loading ? 'rgba(126,217,87,0.3)' : '#6EE05A',
            color: '#080B0F', fontSize: 15, fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          {loading ? 'Building...' : 'Build My Website'}
        </button>

        {result && (
          <div style={{
            padding: '14px 16px', borderRadius: 10,
            background: result.success ? 'rgba(126,217,87,0.06)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${result.success ? 'rgba(126,217,87,0.2)' : 'rgba(239,68,68,0.2)'}`,
            color: result.success ? '#6EE05A' : '#ef4444',
            fontSize: 13,
          }}>
            {result.message}
          </div>
        )}
      </div>
    </div>
  )
}
