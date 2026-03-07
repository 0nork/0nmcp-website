'use client'

import { useState, useEffect } from 'react'

export default function ReportingPage() {
  const [stats, setStats] = useState({ actions: 0, messages: 0, services: 0 })

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('0n-console-history') || '[]')
      const messages = JSON.parse(localStorage.getItem('0n-console-messages') || '[]')
      const vaultKeys = JSON.parse(localStorage.getItem('0n-vault-keys') || '[]')
      setStats({ actions: history.length, messages: messages.length, services: vaultKeys.length })
    } catch { /* empty */ }
  }, [])

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
        Reporting
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1.5rem 0' }}>
        Analytics, usage metrics, and insights
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Actions', value: stats.actions, color: '#7ed957' },
          { label: 'Messages', value: stats.messages, color: '#00d4ff' },
          { label: 'Services', value: stats.services, color: '#ff6b35' },
          { label: 'Uptime', value: '99.9%', color: '#a78bfa' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>API Usage</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Detailed API usage tracking shows calls per service, success rates, and latency. Available with active service connections.
          </p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.875rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>Cost Analysis</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Track Sparks usage, API costs per provider, and execution costs across all workflows.
          </p>
        </div>
      </div>
    </div>
  )
}
