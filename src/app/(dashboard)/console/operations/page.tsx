'use client'

import { useState, useEffect } from 'react'

interface Execution {
  id: string
  type: string
  detail: string
  ts: string
  status: 'success' | 'error' | 'pending'
}

export default function OperationsPage() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, success: 0, errors: 0 })

  useEffect(() => {
    // Load execution history from localStorage
    try {
      const saved = localStorage.getItem('0n-console-history')
      if (saved) {
        const items = JSON.parse(saved) as Execution[]
        setExecutions(items)
        setStats({
          total: items.length,
          success: items.filter(i => i.status !== 'error').length,
          errors: items.filter(i => i.status === 'error').length,
        })
      }
    } catch { /* empty */ }
    setLoading(false)
  }, [])

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
        Operations
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.5rem 0' }}>
        Active automations, workflow runs, and execution history
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Runs', value: stats.total, color: '#22d3ee' },
          { label: 'Successful', value: stats.success, color: '#7ed957' },
          { label: 'Errors', value: stats.errors, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem',
            padding: '1.25rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* History */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Execution History</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '0.375rem', background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }}>
            LIVE
          </span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading...</div>
        ) : executions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No operations yet. Run a workflow from the Builder or use AI Chat to execute automations.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {executions.slice(0, 20).map(entry => (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: entry.status === 'error' ? '#ef4444' : entry.type === 'workflow' ? '#22d3ee' : '#7ed957',
                }} />
                <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{entry.detail}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(entry.ts).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
