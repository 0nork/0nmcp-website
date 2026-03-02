'use client'

import { useState, useEffect, useCallback } from 'react'

interface ThreatResult {
  repo: string
  score: number
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAN'
  evidence?: string[]
  recommendation?: string
}

interface ScanState {
  timestamp: string
  results: ThreatResult[]
  stats?: {
    totalScanned: number
    newThreats: number
    escalatedThreats: number
    durationMs: number
  }
}

const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
  CLEAN: '#22c55e',
}

const LEVEL_EMOJI: Record<string, string> = {
  CRITICAL: '🔴',
  HIGH: '🟠',
  MEDIUM: '🟡',
  LOW: '🔵',
  CLEAN: '🟢',
}

export function AdminDefender() {
  const [scan, setScan] = useState<ScanState | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [message, setMessage] = useState('')

  const fetchScan = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/defender')
      const data = await res.json()
      if (data.scan) setScan(data.scan)
    } catch {
      setMessage('Failed to load scan data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchScan() }, [fetchScan])

  const triggerScan = async () => {
    setScanning(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/defender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' }),
      })
      const data = await res.json()
      setMessage(data.message || 'Scan triggered')
      // Refresh after a delay
      setTimeout(fetchScan, 5000)
    } catch {
      setMessage('Failed to trigger scan')
    } finally {
      setScanning(false)
    }
  }

  const emailReport = async () => {
    setEmailing(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/defender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'email' }),
      })
      const data = await res.json()
      setMessage(data.message || 'Report emailed')
    } catch {
      setMessage('Failed to send email')
    } finally {
      setEmailing(false)
    }
  }

  const threats = scan?.results?.filter(r => r.level !== 'CLEAN') || []
  const criticalCount = scan?.results?.filter(r => r.level === 'CRITICAL').length || 0
  const highCount = scan?.results?.filter(r => r.level === 'HIGH').length || 0
  const mediumCount = scan?.results?.filter(r => r.level === 'MEDIUM').length || 0

  return (
    <div>
      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Last Scan', value: scan?.timestamp ? new Date(scan.timestamp).toLocaleDateString() : '—', color: 'var(--text-primary)' },
          { label: 'Total Scanned', value: scan?.results?.length ?? '—', color: '#00d4ff' },
          { label: 'Critical', value: criticalCount, color: '#ef4444' },
          { label: 'High', value: highCount, color: '#f97316' },
          { label: 'Medium', value: mediumCount, color: '#eab308' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', borderRadius: '0.625rem', padding: '0.875rem',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: s.color, fontFamily: 'var(--font-mono)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={triggerScan}
          disabled={scanning}
          style={{
            padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none',
            background: scanning ? 'rgba(126,217,87,0.1)' : 'linear-gradient(135deg, #7ed957, #5cb83a)',
            color: scanning ? '#7ed957' : '#000', fontSize: '0.8rem', fontWeight: 600,
            cursor: scanning ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          {scanning ? '⏳ Scanning...' : '🛡️ Run Scan'}
        </button>
        <button
          onClick={emailReport}
          disabled={emailing || !scan}
          style={{
            padding: '0.5rem 1.25rem', borderRadius: '0.625rem',
            border: '1px solid var(--border)', cursor: emailing ? 'not-allowed' : 'pointer',
            background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)',
            fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          {emailing ? '⏳ Sending...' : '📧 Email Report'}
        </button>
        <a
          href="https://github.com/Crypto-Goatz/0nDefender/actions"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.5rem 1.25rem', borderRadius: '0.625rem',
            border: '1px solid var(--border)', textDecoration: 'none',
            background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)',
            fontSize: '0.8rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          ⚙️ GitHub Actions
        </a>
      </div>

      {message && (
        <div style={{
          padding: '0.625rem 1rem', borderRadius: '0.625rem', marginBottom: '1rem',
          background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.2)',
          fontSize: '0.8rem', color: '#7ed957',
        }}>
          {message}
        </div>
      )}

      {/* Threats */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Loading scan data...
        </div>
      ) : threats.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          background: 'var(--bg-card)', borderRadius: '0.75rem',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No active threats detected</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {scan ? `Last scan: ${new Date(scan.timestamp).toLocaleString()}` : 'No scans yet — click Run Scan'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {threats.map((t, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)', borderRadius: '0.75rem', padding: '1rem',
                border: `1px solid ${LEVEL_COLORS[t.level]}25`,
                borderLeft: `3px solid ${LEVEL_COLORS[t.level]}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{LEVEL_EMOJI[t.level]}</span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                    borderRadius: '9999px', background: `${LEVEL_COLORS[t.level]}15`,
                    color: LEVEL_COLORS[t.level], letterSpacing: '0.05em',
                  }}>
                    {t.level}
                  </span>
                  <a
                    href={`https://github.com/${t.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                  >
                    {t.repo}
                  </a>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: LEVEL_COLORS[t.level], fontFamily: 'var(--font-mono)' }}>
                  {t.score}/100
                </span>
              </div>

              {t.evidence && t.evidence.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {t.evidence.map((e, j) => (
                    <div key={j} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1.5rem' }}>
                      • {e}
                    </div>
                  ))}
                </div>
              )}

              {t.recommendation && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#f97316', fontWeight: 500 }}>
                  → {t.recommendation}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <a
                  href={`https://github.com/contact/dmca-takedown`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.7rem', padding: '0.25rem 0.625rem', borderRadius: '0.375rem',
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#ef4444', textDecoration: 'none', fontWeight: 600,
                  }}
                >
                  File DMCA
                </a>
                <a
                  href={`https://github.com/contact/report-content`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.7rem', padding: '0.25rem 0.625rem', borderRadius: '0.375rem',
                    background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                    color: '#f97316', textDecoration: 'none', fontWeight: 600,
                  }}
                >
                  Report Abuse
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
