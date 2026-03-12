'use client'

import { useState, useEffect, useCallback } from 'react'

interface Project {
  id: string
  user_id: string
  status: string
  business_name: string
  business_type?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  website_url?: string
  brand_colors?: { primary: string; secondary: string; accent: string }
  logo_url?: string
  tagline?: string
  services?: string[]
  special_requests?: string
  crm_contact_id?: string
  crm_opportunity_id?: string
  deposit_paid_at?: string
  final_paid_at?: string
  build_brief?: Record<string, unknown>
  generated_site?: Record<string, string>
  site_url?: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

interface Revision {
  id: string
  project_id: string
  message: string
  status: string
  admin_response?: string
  created_at: string
}

const STAGES = ['intake', 'deposit_paid', 'in_build', 'review', 'final_paid', 'launched'] as const
const STAGE_LABELS: Record<string, string> = {
  intake: 'Intake',
  deposit_paid: 'Deposit Paid',
  in_build: 'In Build',
  review: 'Review',
  final_paid: 'Final Paid',
  launched: 'Launched',
}
const STAGE_COLORS: Record<string, string> = {
  intake: '#8888a0',
  deposit_paid: '#eab308',
  in_build: '#3b82f6',
  review: '#a78bfa',
  final_paid: '#22c55e',
  launched: '#ff6b35',
}

export default function Web0nAdmin() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<Project | null>(null)
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingBrief, setGeneratingBrief] = useState(false)
  const [buildingSite, setBuildingSite] = useState(false)
  const [previewPage, setPreviewPage] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [siteUrl, setSiteUrl] = useState('')

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/web0n/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects || [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

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
    if (selected) {
      loadRevisions(selected.id)
      setAdminNotes(selected.admin_notes || '')
      setSiteUrl(selected.site_url || '')
    }
  }, [selected, loadRevisions])

  async function updateProject(updates: Record<string, unknown>) {
    if (!selected) return
    try {
      const res = await fetch(`/api/web0n/projects/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        loadProjects()
        const data = await res.json()
        setSelected(data.project || selected)
      }
    } catch {
      // silent
    }
  }

  async function generateBrief() {
    if (!selected) return
    setGeneratingBrief(true)
    try {
      const res = await fetch('/api/web0n/admin/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selected.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setSelected(prev => prev ? { ...prev, build_brief: data.brief } : null)
        loadProjects()
      }
    } catch {
      // silent
    } finally {
      setGeneratingBrief(false)
    }
  }

  async function buildSite() {
    if (!selected) return
    setBuildingSite(true)
    try {
      const res = await fetch('/api/web0n/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selected.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setSelected(prev => prev ? { ...prev, generated_site: { _pages: data.pages } } : null)
        setPreviewPage('index.html')
        loadProjects()
      }
    } catch {
      // silent
    } finally {
      setBuildingSite(false)
    }
  }

  async function respondToRevision(revisionId: string, response: string) {
    if (!selected) return
    try {
      await fetch(`/api/web0n/projects/${selected.id}/revisions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId, adminResponse: response, status: 'resolved' }),
      })
      loadRevisions(selected.id)
    } catch {
      // silent
    }
  }

  const projectsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = projects.filter(p => p.status === stage)
    return acc
  }, {} as Record<string, Project[]>)

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading projects...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>web0n Admin</h1>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{projects.length} projects</span>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {/* Kanban Board */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: '0.75rem', minWidth: 'max-content' }}>
            {STAGES.map(stage => (
              <div key={stage} style={{ width: 200, flexShrink: 0 }}>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px 8px 0 0',
                  background: 'var(--bg-card)',
                  borderBottom: `2px solid ${STAGE_COLORS[stage]}`,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <span>{STAGE_LABELS[stage]}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{projectsByStage[stage]?.length || 0}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
                  {projectsByStage[stage]?.map(project => (
                    <button
                      key={project.id}
                      onClick={() => setSelected(project)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${selected?.id === project.id ? '#ff6b35' : 'var(--border)'}`,
                        background: selected?.id === project.id ? 'rgba(255, 107, 53, 0.05)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {project.business_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{
            width: 420,
            flexShrink: 0,
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            padding: '1.5rem',
            maxHeight: 'calc(100vh - 160px)',
            overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selected.business_name}</h2>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                &times;
              </button>
            </div>

            {/* Stage Actions */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Stage</label>
              <select
                value={selected.status}
                onChange={e => updateProject({ status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                }}
              >
                {STAGES.map(s => (
                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {/* Info */}
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Type:</span> {selected.business_type || '—'}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {selected.email || '—'}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {selected.phone || '—'}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Address:</span> {[selected.address, selected.city, selected.state, selected.zip].filter(Boolean).join(', ') || '—'}</div>
              {selected.website_url && <div><span style={{ color: 'var(--text-muted)' }}>Existing site:</span> <a href={selected.website_url} target="_blank" rel="noopener" style={{ color: '#ff6b35' }}>{selected.website_url}</a></div>}
              {selected.tagline && <div><span style={{ color: 'var(--text-muted)' }}>Tagline:</span> {selected.tagline}</div>}
              {selected.services?.length ? <div><span style={{ color: 'var(--text-muted)' }}>Services:</span> {selected.services.join(', ')}</div> : null}
              {selected.special_requests && <div><span style={{ color: 'var(--text-muted)' }}>Requests:</span> {selected.special_requests}</div>}
              {selected.crm_contact_id && <div><span style={{ color: 'var(--text-muted)' }}>CRM Contact:</span> <code style={{ fontSize: '0.75rem' }}>{selected.crm_contact_id}</code></div>}
            </div>

            {/* Brand Colors */}
            {selected.brand_colors && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {Object.entries(selected.brand_colors).map(([key, color]) => (
                  <div key={key} style={{ textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: color, border: '1px solid var(--border)' }} />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{key}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Brief Generator */}
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={generateBrief}
                disabled={generatingBrief}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
                  color: '#fff',
                  border: 'none',
                  cursor: generatingBrief ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  opacity: generatingBrief ? 0.7 : 1,
                }}
              >
                {generatingBrief ? 'Generating...' : selected.build_brief ? 'Regenerate Brief' : 'Generate AutoBuild Brief'}
              </button>
              {selected.build_brief && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#ff6b35' }}>View Brief JSON</summary>
                  <pre style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    background: 'var(--bg-secondary)',
                    fontSize: '0.7rem',
                    overflow: 'auto',
                    maxHeight: 300,
                    color: 'var(--text-secondary)',
                  }}>
                    {JSON.stringify(selected.build_brief, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            {/* Site Builder */}
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={buildSite}
                disabled={buildingSite}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff',
                  border: 'none',
                  cursor: buildingSite ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  opacity: buildingSite ? 0.7 : 1,
                }}
              >
                {buildingSite ? 'Building...' : selected.generated_site ? 'Rebuild Site' : 'Build Site'}
              </button>
              {(selected.generated_site || previewPage) && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    {['index.html', 'services.html', 'contact.html', 'booking.html', 'pricing.html'].map(page => (
                      <button
                        key={page}
                        onClick={() => setPreviewPage(page)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          border: `1px solid ${previewPage === page ? '#3b82f6' : 'var(--border)'}`,
                          background: previewPage === page ? 'rgba(59,130,246,0.1)' : 'transparent',
                          color: previewPage === page ? '#3b82f6' : 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {page.replace('.html', '')}
                      </button>
                    ))}
                  </div>
                  {previewPage && (
                    <a
                      href={`/api/web0n/builder/assets/${selected.id}/${previewPage}`}
                      target="_blank"
                      rel="noopener"
                      style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 500 }}
                    >
                      Open {previewPage.replace('.html', '')} in new tab &#8599;
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Site URL */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Live Site URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={siteUrl}
                  onChange={e => setSiteUrl(e.target.value)}
                  placeholder="https://"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-display)',
                  }}
                />
                <button
                  onClick={() => updateProject({ site_url: siteUrl })}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Save
                </button>
              </div>
            </div>

            {/* Admin Notes */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                onBlur={() => updateProject({ admin_notes: adminNotes })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-display)',
                  minHeight: 80,
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Pending Revisions */}
            {revisions.filter(r => r.status === 'pending').length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#eab308' }}>
                  Pending Revisions ({revisions.filter(r => r.status === 'pending').length})
                </h3>
                {revisions.filter(r => r.status === 'pending').map(rev => (
                  <div key={rev.id} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{rev.message}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          const response = prompt('Your response to this revision:')
                          if (response) respondToRevision(rev.id, response)
                        }}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        Respond & Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
