'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface WatchEntry {
  id: string
  name: string
  domain: string | null
  category: string
  reason: string | null
  alert_on_any_mention: boolean
  last_hit_at: string | null
  created_at: string
}

const CATEGORIES = [
  { key: 'competitor', label: 'Competitor', color: '#ef4444' },
  { key: 'potential_acquirer', label: 'Potential Acquirer', color: '#6EE05A' },
  { key: 'mcp_ecosystem', label: 'MCP Ecosystem', color: '#3b82f6' },
  { key: 'law_firm', label: 'Law Firm', color: '#f59e0b' },
]

export default function WatchlistPage() {
  const [entries, setEntries] = useState<WatchEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', domain: '', category: 'competitor', reason: '' })

  async function fetchWatchlist() {
    const res = await fetch('/api/admin/patent-intel/watchlist').then(r => r.json()).catch(() => ({ watchlist: [] }))
    setEntries(res.watchlist || [])
    setLoading(false)
  }

  useEffect(() => { fetchWatchlist() }, [])

  async function addEntry() {
    if (!form.name.trim()) return
    await fetch('/api/admin/patent-intel/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ name: '', domain: '', category: 'competitor', reason: '' })
    setShowAdd(false)
    fetchWatchlist()
  }

  async function removeEntry(id: string) {
    await fetch(`/api/admin/patent-intel/watchlist?id=${id}`, { method: 'DELETE' })
    fetchWatchlist()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Link href="/admin/patent-intel" style={{ fontSize: 12, color: '#6EE05A', textDecoration: 'none' }}>← Back to Dashboard</Link>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: '8px 0 0' }}>
              <span style={{ color: '#6EE05A' }}>0n</span>DEFENDER Watchlist
            </h1>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} style={{
            padding: '8px 20px', borderRadius: 8,
            background: showAdd ? '#1c2b42' : '#6EE05A',
            color: showAdd ? '#8b9ab5' : '#0a0a0f',
            fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer',
          }}>
            {showAdd ? 'Cancel' : '+ Add Company'}
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border)', marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Company name"
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
              <input value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))} placeholder="Domain (optional)"
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12 }}>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Why are we watching them?"
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
            </div>
            <button onClick={addEntry} style={{
              padding: '10px 24px', borderRadius: 8, background: '#6EE05A', color: '#0a0a0f',
              fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer',
            }}>Add to Watchlist</button>
          </div>
        )}

        {/* Entries */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>Loading watchlist...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(entry => {
              const cat = CATEGORIES.find(c => c.key === entry.category)
              return (
                <div key={entry.id} style={{
                  background: 'var(--bg-card)', borderRadius: 12, padding: 16,
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{entry.name}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                        background: `${cat?.color}18`, color: cat?.color,
                        textTransform: 'uppercase',
                      }}>
                        {cat?.label || entry.category}
                      </span>
                      {entry.domain && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{entry.domain}</span>}
                    </div>
                    {entry.reason && <p style={{ fontSize: 13, color: '#8b9ab5', margin: 0 }}>{entry.reason}</p>}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Added {new Date(entry.created_at).toLocaleDateString()}
                      {entry.last_hit_at && ` · Last hit: ${new Date(entry.last_hit_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <button onClick={() => removeEntry(entry.id)} style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 11,
                    background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                    border: 'none', cursor: 'pointer', fontWeight: 600,
                  }}>
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
