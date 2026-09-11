'use client'

import { useState } from 'react'

interface PageResult {
  name: string
  slug: string
  html: string
  htmlLength?: number
}

interface DeployResult {
  funnelId?: string
  funnelUrl?: string
  pages: Array<{ name: string; pageId?: string }>
  error?: string
}

const DEFAULT_COLOR = '#6EE05A'

export default function SiteBuilderAdmin() {
  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [services, setServices] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [website, setWebsite] = useState('')
  const [brandColor, setBrandColor] = useState(DEFAULT_COLOR)
  const [tagline, setTagline] = useState('')
  const [locationId, setLocationId] = useState('')

  // Generated pages
  const [pages, setPages] = useState<PageResult[]>([])
  const [previewIdx, setPreviewIdx] = useState(0)

  // Deploy state
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null)

  // UI state
  const [generating, setGenerating] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'preview' | 'deployed'>('form')

  async function handleGenerate() {
    if (!name.trim()) { setError('Business name is required'); return }
    setError('')
    setGenerating(true)

    try {
      const res = await fetch('/api/admin/site-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          business: {
            name: name.trim(),
            type: type.trim() || undefined,
            services: services.trim() ? services.split(',').map(s => s.trim()) : undefined,
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
            address: address.trim() || undefined,
            city: city.trim() || undefined,
            state: state.trim() || undefined,
            zip: zip.trim() || undefined,
            website: website.trim() || undefined,
            brandColor: brandColor || DEFAULT_COLOR,
            tagline: tagline.trim() || undefined,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setPages(data.fullPages || [])
      setPreviewIdx(0)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDeploy() {
    if (!locationId.trim()) { setError('Location ID is required to deploy'); return }
    if (!pages.length) { setError('Generate pages first'); return }
    setError('')
    setDeploying(true)

    try {
      const res = await fetch('/api/admin/site-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deploy',
          pages,
          locationId: locationId.trim(),
          businessName: name.trim(),
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setDeployResult(data)
      setStep('deployed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deploy failed')
    } finally {
      setDeploying(false)
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Site Builder
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 4 }}>
            AI-powered website generation + CRM funnel deployment
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {step !== 'form' && (
            <button onClick={() => { setStep('form'); setPages([]); setDeployResult(null); setError('') }} style={btnGhost}>
              New Build
            </button>
          )}
          <a href="/admin" style={{ ...btnGhost, textDecoration: 'none' }}>Back to Admin</a>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: 16,
          background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)',
          color: '#ff4444', fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1rem' }}>x</button>
        </div>
      )}

      {/* Cost warning */}
      {step === 'form' && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: 20,
          background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.25)',
          color: '#6EE05A', fontSize: '0.75rem',
        }}>
          AI provider auto-fallback: Groq (free) → OpenAI → Gemini → Anthropic. Uses the first available provider with credits.
        </div>
      )}

      {/* ==================== FORM STEP ==================== */}
      {step === 'form' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Left column — Business Info */}
          <div style={cardStyle}>
            <h2 style={sectionTitle}>Business Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Business Name *" value={name} onChange={setName} placeholder="The Spa In Ligonier" />
              <Field label="Business Type" value={type} onChange={setType} placeholder="Day Spa & Wellness Center" />
              <Field label="Services (comma-separated)" value={services} onChange={setServices} placeholder="Massage, Facials, Waxing, Nail Care" />
              <Field label="Tagline" value={tagline} onChange={setTagline} placeholder="Your Relaxation Destination" />
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="+1-724-238-9800" />
              <Field label="Email" value={email} onChange={setEmail} placeholder="info@business.com" />
              <Field label="Website (existing)" value={website} onChange={setWebsite} placeholder="https://example.com" />
            </div>
          </div>

          {/* Right column — Location + Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={cardStyle}>
              <h2 style={sectionTitle}>Location</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field label="Address" value={address} onChange={setAddress} placeholder="201 S Fairfield St" />
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                  <Field label="City" value={city} onChange={setCity} placeholder="Ligonier" />
                  <Field label="State" value={state} onChange={setState} placeholder="PA" />
                  <Field label="Zip" value={zip} onChange={setZip} placeholder="15658" />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h2 style={sectionTitle}>Brand & Deploy</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Brand Color</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      style={{ width: 40, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                  </div>
                </div>
                <Field
                  label="CRM Location ID (for deploy)"
                  value={locationId}
                  onChange={setLocationId}
                  placeholder="F76MNKOMQCMruMrumtdf"
                />
                <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', margin: 0 }}>
                  Location ID is only needed for deploying to CRM funnel. You can generate + preview without it.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || !name.trim()}
              style={{
                ...btnPrimary,
                opacity: generating || !name.trim() ? 0.5 : 1,
                cursor: generating ? 'wait' : 'pointer',
              }}
            >
              {generating ? 'Generating with Claude AI...' : 'Generate Website'}
            </button>
          </div>
        </div>
      )}

      {/* ==================== PREVIEW STEP ==================== */}
      {step === 'preview' && pages.length > 0 && (
        <div>
          {/* Page tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {pages.map((p, i) => (
              <button
                key={i}
                onClick={() => setPreviewIdx(i)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid',
                  borderColor: i === previewIdx ? 'var(--accent)' : 'var(--border)',
                  background: i === previewIdx ? 'rgba(126,217,87,0.1)' : 'var(--bg-card)',
                  color: i === previewIdx ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer',
                }}
              >
                {p.name}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={handleDeploy} disabled={deploying} style={{
              ...btnPrimary,
              background: 'rgba(0,212,255,0.15)', borderColor: 'rgba(0,212,255,0.4)', color: '#00d4ff',
              opacity: deploying ? 0.5 : 1,
            }}>
              {deploying ? 'Deploying...' : 'Deploy to CRM Funnel'}
            </button>
            <button onClick={() => setStep('form')} style={btnGhost}>Edit Info</button>
          </div>

          {/* Stats bar */}
          <div style={{
            display: 'flex', gap: 16, padding: '8px 16px', borderRadius: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 12,
            fontSize: '0.6875rem', color: 'var(--text-muted)',
          }}>
            <span>{pages.length} pages generated</span>
            <span>|</span>
            <span>Viewing: <strong style={{ color: 'var(--accent)' }}>{pages[previewIdx]?.name}</strong></span>
            <span>|</span>
            <span>{(pages[previewIdx]?.html?.length / 1024).toFixed(1)}KB HTML</span>
            {locationId && <>
              <span>|</span>
              <span>Deploy to: <code style={{ color: '#00d4ff' }}>{locationId}</code></span>
            </>}
          </div>

          {/* HTML preview iframe */}
          <div style={{
            borderRadius: 12, overflow: 'hidden',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            height: 'calc(100vh - 280px)',
          }}>
            <iframe
              srcDoc={pages[previewIdx]?.html || ''}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={`Preview: ${pages[previewIdx]?.name}`}
              sandbox="allow-scripts"
            />
          </div>

          {/* Download HTML button */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                const blob = new Blob([pages[previewIdx]?.html || ''], { type: 'text/html' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${pages[previewIdx]?.name?.toLowerCase() || 'page'}.html`
                a.click()
                URL.revokeObjectURL(url)
              }}
              style={btnGhost}
            >
              Download HTML
            </button>
            <button
              onClick={() => {
                const allHtml = pages.map(p => `<!-- ${p.name} (${p.slug}) -->\n${p.html}`).join('\n\n')
                const blob = new Blob([allHtml], { type: 'text/html' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-all-pages.html`
                a.click()
                URL.revokeObjectURL(url)
              }}
              style={btnGhost}
            >
              Download All Pages
            </button>
          </div>
        </div>
      )}

      {/* ==================== DEPLOYED STEP ==================== */}
      {step === 'deployed' && deployResult && (
        <div style={{ ...cardStyle, maxWidth: 600, margin: '40px auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>
              {deployResult.error ? '\u26a0' : '\u2713'}
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: deployResult.error ? '#ff4444' : 'var(--accent)' }}>
              {deployResult.error ? 'Deploy Error' : 'Site Deployed!'}
            </h2>
          </div>

          {deployResult.error ? (
            <div style={{
              padding: '12px 16px', borderRadius: 8,
              background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)',
              color: '#ff4444', fontSize: '0.8125rem', wordBreak: 'break-all',
            }}>
              {deployResult.error}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {deployResult.funnelId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Funnel ID</span>
                  <code style={{ fontSize: '0.75rem', color: '#00d4ff' }}>{deployResult.funnelId}</code>
                </div>
              )}
              {deployResult.funnelUrl && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live URL</span>
                  <a href={deployResult.funnelUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                    {deployResult.funnelUrl}
                  </a>
                </div>
              )}
              <div style={{ padding: '8px 0' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Pages Deployed ({deployResult.pages.length})
                </span>
                {deployResult.pages.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <span style={{ color: p.pageId ? 'var(--accent)' : '#ff4444', fontSize: '0.75rem' }}>
                      {p.pageId ? '\u2713' : '\u2717'}
                    </span>
                    <span style={{ fontSize: '0.8125rem' }}>{p.name}</span>
                    {p.pageId && <code style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{p.pageId}</code>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'center' }}>
            <button onClick={() => setStep('preview')} style={btnGhost}>Back to Preview</button>
            <button onClick={() => { setStep('form'); setPages([]); setDeployResult(null) }} style={btnGhost}>New Build</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== Shared Components ====================

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )
}

// ==================== Styles ====================

const cardStyle: React.CSSProperties = {
  padding: '24px',
  borderRadius: 16,
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 800,
  marginBottom: 16,
  color: 'var(--text-primary)',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: 'var(--text-muted)',
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontSize: '0.8125rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const btnPrimary: React.CSSProperties = {
  padding: '12px 24px',
  borderRadius: 10,
  background: 'rgba(126,217,87,0.15)',
  border: '1px solid rgba(126,217,87,0.4)',
  color: 'var(--accent)',
  fontWeight: 800,
  fontSize: '0.875rem',
  cursor: 'pointer',
  width: '100%',
}

const btnGhost: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 8,
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  fontWeight: 600,
  fontSize: '0.75rem',
  cursor: 'pointer',
}
