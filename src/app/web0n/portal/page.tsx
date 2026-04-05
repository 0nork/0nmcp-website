'use client'

import { useState, useEffect, useCallback } from 'react'

interface Project {
  id: string
  status: string
  business_name: string
  business_type?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  brand_colors?: { primary: string; secondary: string; accent: string }
  tagline?: string
  services?: string[]
  site_url?: string
  deposit_paid_at?: string
  final_paid_at?: string
  coupon_code?: string
  discount_amount?: number
  created_at: string
}

interface Revision {
  id: string
  message: string
  status: string
  admin_response?: string
  created_at: string
}

const STAGES = ['intake', 'deposit_paid', 'in_build', 'review', 'final_paid', 'launched']
const STAGE_LABELS: Record<string, string> = {
  intake: 'Submitted',
  deposit_paid: 'Deposit Paid',
  in_build: 'Building',
  review: 'In Review',
  final_paid: 'Final Paid',
  launched: 'Launched',
}

export default function Web0nPortal() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<Project | null>(null)
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [newRevision, setNewRevision] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/web0n/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects || [])
        if (data.projects?.length && !selected) {
          setSelected(data.projects[0])
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [selected])

  const loadRevisions = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/web0n/projects/${projectId}/revisions`)
      if (res.ok) {
        const data = await res.json()
        setRevisions(data.revisions || [])
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])
  useEffect(() => {
    if (selected) loadRevisions(selected.id)
  }, [selected, loadRevisions])

  async function submitRevision() {
    if (!selected || !newRevision.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/web0n/projects/${selected.id}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newRevision }),
      })
      if (res.ok) {
        setNewRevision('')
        loadRevisions(selected.id)
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading your projects...</p>
      </div>
    )
  }

  if (!projects.length) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>No Projects Yet</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          You haven&apos;t started a web0n project yet. Get started and we&apos;ll build your website.
        </p>
        <a
          href="/onboard"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Get Started
        </a>
      </div>
    )
  }

  const stageIndex = selected ? STAGES.indexOf(selected.status) : -1

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Your Projects</h1>

      {/* Project selector if multiple */}
      {projects.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${selected?.id === p.id ? '#ff6b35' : 'var(--border)'}`,
                background: selected?.id === p.id ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                color: selected?.id === p.id ? '#ff6b35' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                fontSize: '0.85rem',
              }}
            >
              {p.business_name}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <>
          {/* Status Pipeline */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Project Status</h2>
            <div style={{ display: 'flex', gap: '0.25rem', overflow: 'auto' }}>
              {STAGES.map((stage, i) => (
                <div
                  key={stage}
                  style={{
                    flex: 1,
                    minWidth: 80,
                    textAlign: 'center',
                    padding: '0.5rem 0.25rem',
                    borderRadius: '6px',
                    background: i <= stageIndex
                      ? i === stageIndex ? 'linear-gradient(135deg, #ff6b35, #e55a2b)' : 'rgba(255, 107, 53, 0.15)'
                      : 'var(--bg-tertiary)',
                    color: i <= stageIndex ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: i === stageIndex ? 600 : 400,
                  }}
                >
                  {STAGE_LABELS[stage]}
                </div>
              ))}
            </div>
          </div>

          {/* Business Info */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Business Info</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> {selected.business_name}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Type:</span> {selected.business_type || '—'}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {selected.email || '—'}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {selected.phone || '—'}</div>
            </div>
            {selected.site_url && (
              <div style={{ marginTop: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Live Site: </span>
                <a href={selected.site_url} target="_blank" rel="noopener" style={{ color: '#ff6b35', fontSize: '0.9rem' }}>{selected.site_url}</a>
              </div>
            )}
          </div>

          {/* Invoices */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Payments</h2>
            {(() => {
              const discount = selected.discount_amount || 0
              const isFree = discount >= 998.50
              const depositDue = Math.max(0, 998.50 - discount)
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                  {selected.coupon_code && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.08)' }}>
                      <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>Coupon: {selected.coupon_code}</span>
                      <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 600 }}>
                        {isFree ? 'FREE' : `-$${discount.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Deposit {isFree ? '(waived)' : `($${depositDue.toFixed(2)})`}</span>
                    <span style={{ color: selected.deposit_paid_at || isFree ? '#22c55e' : '#eab308', fontWeight: 500 }}>
                      {selected.deposit_paid_at ? (isFree ? 'Covered' : 'Paid') : 'Pending'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Final {isFree ? '(waived)' : '($998.50)'}</span>
                    <span style={{ color: selected.final_paid_at || isFree ? '#22c55e' : '#eab308', fontWeight: 500 }}>
                      {isFree ? 'Covered' : (selected.final_paid_at ? 'Paid' : 'Pending')}
                    </span>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Revisions */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Revision Requests</h2>

            {revisions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {revisions.map(rev => (
                  <div key={rev.id} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        background: rev.status === 'resolved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                        color: rev.status === 'resolved' ? '#22c55e' : '#eab308',
                      }}>
                        {rev.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', marginBottom: rev.admin_response ? '0.5rem' : 0 }}>{rev.message}</p>
                    {rev.admin_response && (
                      <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(255, 107, 53, 0.05)', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#ff6b35', fontWeight: 500 }}>Response: </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{rev.admin_response}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                No revision requests yet. Submit one below when you&apos;re ready.
              </p>
            )}

            {/* Only show revision form when in review stage */}
            {['in_build', 'review'].includes(selected.status) && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={newRevision}
                  onChange={e => setNewRevision(e.target.value)}
                  placeholder="Describe the change you'd like..."
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-display)',
                  }}
                />
                <button
                  onClick={submitRevision}
                  disabled={submitting || !newRevision.trim()}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    background: newRevision.trim() ? 'linear-gradient(135deg, #ff6b35, #e55a2b)' : 'var(--bg-tertiary)',
                    color: newRevision.trim() ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    cursor: newRevision.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.85rem',
                  }}
                >
                  {submitting ? '...' : 'Submit'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
