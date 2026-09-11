'use client'

import { useState, useEffect } from 'react'

interface CatalogService {
  id: string
  name: string
  actionCount: number
  baseUrl: string
  authType: string
}

interface CustomService {
  id: string
  service_id: string
  name: string
  base_url: string
  auth_type: string
  category: string
  actions: Array<{ id: string; name: string; method: string; path: string; description: string }>
  action_count: number
  created_at: string
}

interface NewAction {
  id: string
  name: string
  method: string
  path: string
  description: string
}

const C = {
  bg: '#0B0F19',
  card: 'var(--bg-card)',
  border: 'var(--border)',
  borderLight: 'rgba(255,255,255,0.12)',
  accent: '#6EE05A',
  accentDim: 'rgba(126,217,87,0.12)',
  cyan: '#00d4ff',
  orange: '#ff6b35',
  orangeDim: 'rgba(255,107,53,0.12)',
  text: '#e8eaed',
  textSec: '#7A8290',
  textMuted: '#5f6672',
}

const CATEGORIES = [
  'ai', 'crm_sales', 'marketing', 'social', 'notifications',
  'finance', 'database', 'productivity', 'dev_tools', 'ecommerce', 'cloud', 'other',
]

export default function CatalogAdminPage() {
  const [snapshot, setSnapshot] = useState<{ meta: Record<string, unknown>; serviceCount: number; services: CatalogService[] } | null>(null)
  const [customServices, setCustomServices] = useState<CustomService[]>([])
  const [comingSoon, setComingSoon] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // New service form
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [newBaseUrl, setNewBaseUrl] = useState('')
  const [newAuthType, setNewAuthType] = useState('api_key')
  const [newCategory, setNewCategory] = useState('other')
  const [newActions, setNewActions] = useState<NewAction[]>([
    { id: '', name: '', method: 'POST', path: '', description: '' },
  ])

  useEffect(() => {
    fetch('/api/admin/catalog')
      .then(r => r.json())
      .then(d => {
        setSnapshot(d.snapshot)
        setCustomServices(d.customServices || [])
        setComingSoon(d.comingSoon || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const addAction = () => {
    setNewActions([...newActions, { id: '', name: '', method: 'GET', path: '', description: '' }])
  }

  const removeAction = (idx: number) => {
    setNewActions(newActions.filter((_, i) => i !== idx))
  }

  const updateAction = (idx: number, field: keyof NewAction, value: string) => {
    const updated = [...newActions]
    updated[idx] = { ...updated[idx], [field]: value }
    // Auto-generate action ID from name
    if (field === 'name' && !updated[idx].id) {
      updated[idx].id = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    }
    setNewActions(updated)
  }

  const handleSubmit = async () => {
    if (!newId || !newName || !newActions.some(a => a.id && a.name)) {
      setResult({ success: false, message: 'Service ID, name, and at least one action required.' })
      return
    }

    setAdding(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          name: newName,
          base_url: newBaseUrl,
          auth_type: newAuthType,
          category: newCategory,
          actions: newActions.filter(a => a.id && a.name),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, message: data.message })
        // Reset form
        setNewId('')
        setNewName('')
        setNewBaseUrl('')
        setNewAuthType('api_key')
        setNewCategory('other')
        setNewActions([{ id: '', name: '', method: 'POST', path: '', description: '' }])
        // Refresh
        setCustomServices(prev => [data.service, ...prev])
      } else {
        setResult({ success: false, message: data.error })
      }
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : 'Request failed' })
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    const res = await fetch(`/api/admin/catalog?serviceId=${serviceId}`, { method: 'DELETE' })
    if (res.ok) {
      setCustomServices(prev => prev.filter(s => s.service_id !== serviceId))
    }
  }

  const handleQuickAdd = (serviceId: string) => {
    setNewId(serviceId)
    setNewName(serviceId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    setShowAdd(true)
    setResult(null)
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: C.text }}>Catalog Manager</h1>
        <p style={{ color: C.textMuted, fontSize: 13 }}>Loading...</p>
      </div>
    )
  }

  const totalTools = (snapshot?.services.reduce((sum, s) => sum + s.actionCount, 0) || 0) +
    customServices.reduce((sum, s) => sum + s.action_count, 0)

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: C.text, margin: 0, fontFamily: 'var(--font-display)' }}>
            Catalog Manager
          </h1>
          <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
            {snapshot?.serviceCount || 0} snapshot services + {customServices.length} custom = {(snapshot?.serviceCount || 0) + customServices.length} total &middot; {totalTools} actions
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setResult(null) }}
          style={{
            padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none',
            background: showAdd ? C.card : `linear-gradient(135deg, ${C.accent}, #4CAF3D)`,
            color: showAdd ? C.textSec : '#000', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {showAdd ? 'Cancel' : '+ Add Service'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Snapshot Services', value: snapshot?.serviceCount || 0, color: C.accent },
          { label: 'Custom Services', value: customServices.length, color: C.cyan },
          { label: 'Coming Soon', value: comingSoon.length, color: C.orange },
          { label: 'Total Actions', value: totalTools, color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '1rem',
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Service Form */}
      {showAdd && (
        <div style={{
          background: C.card, border: `1px solid ${C.borderLight}`, borderRadius: 12,
          padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: C.text, margin: '0 0 1rem' }}>Add New Service</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: 'block', marginBottom: 4 }}>Service ID *</label>
              <input value={newId} onChange={e => setNewId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="e.g. gemini" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: 'block', marginBottom: 4 }}>Display Name *</label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Google Gemini" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: 'block', marginBottom: 4 }}>Base URL</label>
              <input value={newBaseUrl} onChange={e => setNewBaseUrl(e.target.value)}
                placeholder="https://api.example.com" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: 'block', marginBottom: 4 }}>Auth Type</label>
              <select value={newAuthType} onChange={e => setNewAuthType(e.target.value)} style={inputStyle}>
                <option value="api_key">API Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="oauth">OAuth</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.textMuted, display: 'block', marginBottom: 4 }}>Category</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: 12, color: C.textSec, fontWeight: 600 }}>Actions *</label>
              <button onClick={addAction} style={{
                padding: '4px 12px', borderRadius: 6, border: `1px solid ${C.border}`,
                background: 'transparent', color: C.accent, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>+ Add Action</button>
            </div>

            {newActions.map((action, idx) => (
              <div key={idx} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1.5fr 1.5fr 30px',
                gap: '0.5rem', marginBottom: '0.375rem', alignItems: 'center',
              }}>
                <input value={action.name} onChange={e => updateAction(idx, 'name', e.target.value)}
                  placeholder="Send Email" style={{ ...inputStyle, fontSize: 11, padding: '6px 8px' }} />
                <input value={action.id} onChange={e => updateAction(idx, 'id', e.target.value)}
                  placeholder="send_email" style={{ ...inputStyle, fontSize: 11, padding: '6px 8px', fontFamily: 'var(--font-mono)' }} />
                <select value={action.method} onChange={e => updateAction(idx, 'method', e.target.value)}
                  style={{ ...inputStyle, fontSize: 11, padding: '6px 4px' }}>
                  <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
                </select>
                <input value={action.path} onChange={e => updateAction(idx, 'path', e.target.value)}
                  placeholder="/v1/messages" style={{ ...inputStyle, fontSize: 11, padding: '6px 8px', fontFamily: 'var(--font-mono)' }} />
                <input value={action.description} onChange={e => updateAction(idx, 'description', e.target.value)}
                  placeholder="Send an email message" style={{ ...inputStyle, fontSize: 11, padding: '6px 8px' }} />
                {newActions.length > 1 && (
                  <button onClick={() => removeAction(idx)} style={{
                    width: 24, height: 24, borderRadius: 6, border: 'none',
                    background: 'rgba(255,107,53,0.15)', color: C.orange,
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>×</button>
                )}
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={adding} style={{
            padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none',
            background: adding ? C.card : `linear-gradient(135deg, ${C.accent}, #4CAF3D)`,
            color: adding ? C.textMuted : '#000', fontSize: 13, fontWeight: 700,
            cursor: adding ? 'wait' : 'pointer', fontFamily: 'inherit',
          }}>
            {adding ? 'Adding...' : 'Add Service to Catalog'}
          </button>

          {result && (
            <div style={{
              marginTop: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: 8,
              background: result.success ? 'rgba(126,217,87,0.08)' : 'rgba(255,107,53,0.08)',
              border: `1px solid ${result.success ? 'rgba(126,217,87,0.2)' : 'rgba(255,107,53,0.2)'}`,
              fontSize: 12, color: result.success ? C.accent : C.orange,
            }}>
              {result.message}
            </div>
          )}
        </div>
      )}

      {/* Coming Soon — Quick Add */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '1.25rem', marginBottom: '1rem',
      }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, margin: '0 0 0.75rem' }}>
          Coming Soon — Quick Wire
          <span style={{ fontSize: 10, fontWeight: 600, color: C.orange, marginLeft: 8, padding: '2px 8px', borderRadius: 6, background: C.orangeDim }}>
            {comingSoon.length} pending
          </span>
        </h2>
        <p style={{ fontSize: 11, color: C.textMuted, margin: '0 0 0.75rem', lineHeight: 1.5 }}>
          Click any service to start wiring it. Add its API base URL + actions, and it becomes available in the builder immediately.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {comingSoon.map(svc => (
            <button key={svc} onClick={() => handleQuickAdd(svc)} style={{
              padding: '4px 10px', borderRadius: 6, border: `1px solid ${C.border}`,
              background: 'transparent', color: C.textSec, fontSize: 11, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-mono)',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSec }}
            >
              {svc}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Services */}
      {customServices.length > 0 && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: '1.25rem', marginBottom: '1rem',
        }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, margin: '0 0 0.75rem' }}>
            Custom Services
            <span style={{ fontSize: 10, fontWeight: 600, color: C.cyan, marginLeft: 8, padding: '2px 8px', borderRadius: 6, background: 'rgba(0,212,255,0.12)' }}>
              {customServices.length}
            </span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {customServices.map(svc => (
              <div key={svc.service_id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0.625rem', borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.cyan, fontFamily: 'var(--font-mono)', minWidth: 140 }}>
                  {svc.service_id}
                </span>
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{svc.name}</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>{svc.action_count} actions</span>
                <span style={{ fontSize: 10, color: C.textMuted }}>{svc.category}</span>
                <button onClick={() => handleDelete(svc.service_id)} style={{
                  padding: '3px 8px', borderRadius: 4, border: `1px solid rgba(255,107,53,0.3)`,
                  background: 'transparent', color: C.orange, fontSize: 10, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Snapshot Services */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
        padding: '1.25rem',
      }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, margin: '0 0 0.75rem' }}>
          Catalog Snapshot
          <span style={{ fontSize: 10, fontWeight: 600, color: C.accent, marginLeft: 8, padding: '2px 8px', borderRadius: 6, background: C.accentDim }}>
            {snapshot?.serviceCount} services
          </span>
          <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 8 }}>
            Generated {snapshot?.meta.generated_at ? new Date(snapshot.meta.generated_at as string).toLocaleDateString() : 'unknown'}
          </span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {snapshot?.services.map(svc => (
            <div key={svc.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.375rem 0.5rem', borderRadius: 6, fontSize: 12,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: C.accent, minWidth: 140, fontWeight: 500 }}>
                {svc.id}
              </span>
              <span style={{ color: C.text, flex: 1 }}>{svc.name}</span>
              <span style={{ color: C.textMuted, fontSize: 10 }}>{svc.actionCount} actions</span>
              <span style={{ color: C.textMuted, fontSize: 10 }}>{svc.authType}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
}
