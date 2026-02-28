'use client'

import { useState, useEffect } from 'react'
import { Send, CheckCircle, Clock, ExternalLink } from 'lucide-react'

interface IntegrationRequest {
  id: string
  name: string
  website: string | null
  category: string | null
  status: string
  created_at: string
}

const CATEGORIES = [
  'CRM / Sales',
  'Marketing / Email',
  'Social Media',
  'Payments / Billing',
  'Project Management',
  'Communication',
  'Analytics / Data',
  'E-Commerce',
  'Developer Tools',
  'AI / ML',
  'Storage / Files',
  'Other',
]

export function RequestIntegrationView() {
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [useCase, setUseCase] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [requests, setRequests] = useState<IntegrationRequest[]>([])

  useEffect(() => {
    fetch('/api/console/request-integration')
      .then(r => r.json())
      .then(d => { if (d.requests) setRequests(d.requests) })
      .catch(() => {})
  }, [submitted])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/console/request-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), website: website.trim() || undefined, category: category || undefined, description: description.trim() || undefined, use_case: useCase.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      setSubmitted(true)
      setName('')
      setWebsite('')
      setCategory('')
      setDescription('')
      setUseCase('')
      setTimeout(() => setSubmitted(false), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '48rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Request an Integration
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Want 0nMCP to support a service we don&apos;t have yet? Submit a request and we&apos;ll review it for inclusion in a future release. Popular requests get prioritized.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Service Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Notion, QuickBooks, WhatsApp..."
              required
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Website / API Docs
            </label>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://api.example.com/docs"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Category
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              color: category ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              appearance: 'none',
            }}
          >
            <option value="">Select a category...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            What does this service do?
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description of the service and its API..."
            rows={2}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your use case
          </label>
          <textarea
            value={useCase}
            onChange={e => setUseCase(e.target.value)}
            placeholder="How would you use this integration with 0nMCP?"
            rows={2}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {error && (
          <p style={{ fontSize: '0.8125rem', color: '#ef4444' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: submitted ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting || !name.trim() ? 0.6 : 1,
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
        >
          {submitted ? <><CheckCircle size={16} /> Submitted!</> : submitting ? 'Submitting...' : <><Send size={16} /> Submit Request</>}
        </button>
      </form>

      {/* Previous Requests */}
      {requests.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Requests
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {requests.map((req) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{req.name}</span>
                  {req.category && (
                    <span style={{ fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(255,107,53,0.1)', color: 'var(--accent)', fontWeight: 500 }}>
                      {req.category}
                    </span>
                  )}
                  {req.website && (
                    <a href={req.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  {req.status === 'approved' ? (
                    <CheckCircle size={14} style={{ color: '#22c55e' }} />
                  ) : (
                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                  )}
                  <span style={{ fontSize: '0.75rem', color: req.status === 'approved' ? '#22c55e' : 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
