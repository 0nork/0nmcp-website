'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Finding {
  id: string
  scan_id: string
  scan_type: string
  title: string
  summary: string
  source_url: string | null
  source_name: string | null
  published_date: string | null
  threat_level: string
  category: string
  company_name: string | null
  company_domain: string | null
  patent_number: string | null
  filing_date: string | null
  overlapping_patents: string[] | null
  overlap_summary: string | null
  reviewed: boolean
  review_status: string | null
  review_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

const THREAT_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#9ca3af', opportunity: '#6EE05A',
}

const REVIEW_ACTIONS = [
  { key: 'watching', label: '👁 Watching', color: '#3b82f6' },
  { key: 'action_required', label: '⚡ Action Required', color: '#ef4444' },
  { key: 'no_action', label: '✓ No Action', color: '#9ca3af' },
  { key: 'escalate_attorney', label: '⚖️ Escalate to Attorney', color: '#f59e0b' },
]

export default function FindingDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [finding, setFinding] = useState<Finding | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/patent-intel/findings/${id}`)
      .then(r => r.json())
      .then(data => {
        setFinding(data)
        setNotes(data.review_notes || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  async function saveReview(status: string) {
    setSaving(true)
    const res = await fetch(`/api/admin/patent-intel/findings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_status: status, review_notes: notes }),
    }).then(r => r.json())
    setFinding(res)
    setSaving(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#556880', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
  if (!finding) return <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Finding not found</div>

  const tc = THREAT_COLORS[finding.threat_level] || '#9ca3af'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8eaed', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/admin/patent-intel" style={{ fontSize: 12, color: '#6EE05A', textDecoration: 'none' }}>← Back to Dashboard</Link>

        <div style={{ marginTop: 16, background: '#111827', borderRadius: 16, padding: 28, border: '1px solid #1e293b' }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, background: `${tc}18`, color: tc, textTransform: 'uppercase' }}>
              {finding.threat_level}
            </span>
            <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#1c2b42', color: '#8b9ab5', textTransform: 'uppercase' }}>
              {finding.category.replace(/_/g, ' ')}
            </span>
            <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: '#1c2b42', color: '#8b9ab5' }}>
              {finding.scan_type.replace(/_/g, ' ')}
            </span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{finding.title}</h1>
          <p style={{ fontSize: 15, color: '#8b9ab5', lineHeight: 1.7, marginBottom: 20 }}>{finding.summary}</p>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Company', value: finding.company_name },
              { label: 'Domain', value: finding.company_domain },
              { label: 'Patent #', value: finding.patent_number },
              { label: 'Filing Date', value: finding.filing_date },
              { label: 'Source', value: finding.source_name },
              { label: 'Published', value: finding.published_date },
            ].filter(d => d.value).map(d => (
              <div key={d.label} style={{ padding: 12, borderRadius: 8, background: '#0a0a0f', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: 10, color: '#556880', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{d.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{d.value}</div>
              </div>
            ))}
          </div>

          {/* Overlap analysis */}
          {finding.overlapping_patents?.length ? (
            <div style={{ padding: 16, borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>PATENT OVERLAP DETECTED</div>
              <div style={{ fontSize: 13, color: '#e8eaed', marginBottom: 4 }}>Affected applications: {finding.overlapping_patents.join(', ')}</div>
              {finding.overlap_summary && <p style={{ fontSize: 13, color: '#f59e0b', margin: 0, fontStyle: 'italic' }}>{finding.overlap_summary}</p>}
            </div>
          ) : null}

          {finding.source_url && (
            <a href={finding.source_url} target="_blank" rel="noopener" style={{
              display: 'inline-block', marginBottom: 20, padding: '8px 16px', borderRadius: 8,
              background: '#1c2b42', color: '#6EE05A', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
              View Source →
            </a>
          )}

          {/* Review section */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#556880', textTransform: 'uppercase', marginBottom: 12 }}>Review</h3>

            {finding.reviewed && finding.review_status && (
              <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: '#0a0a0f', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: 12, color: '#556880' }}>
                  Current status: <strong style={{ color: REVIEW_ACTIONS.find(a => a.key === finding.review_status)?.color }}>
                    {REVIEW_ACTIONS.find(a => a.key === finding.review_status)?.label}
                  </strong>
                  {finding.reviewed_at && ` · ${new Date(finding.reviewed_at).toLocaleDateString()}`}
                </div>
              </div>
            )}

            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Review notes, attorney instructions, action items..."
              rows={4}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1px solid #1e293b', background: '#0a0a0f', color: '#e8eaed',
                fontSize: 14, resize: 'vertical', marginBottom: 12, boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {REVIEW_ACTIONS.map(action => (
                <button key={action.key} onClick={() => saveReview(action.key)} disabled={saving} style={{
                  padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  background: `${action.color}15`, color: action.color,
                  border: `1px solid ${action.color}33`, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                }}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 11, color: '#556880', marginTop: 16, textAlign: 'center' }}>
          Finding ID: {finding.id} · Created {new Date(finding.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
