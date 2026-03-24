'use client'

import { useState, useCallback, useRef } from 'react'
import { SVC } from '@/lib/console/services'
import {
  createBundle,
  inspectBundle,
  openBundle,
  type Bundle,
} from '@/lib/console/bundle-crypto'

// ─── Types ────────────────────────────────────────────────────

interface BundleManagerProps {
  connectedServices: string[]
  vault: Record<string, Record<string, string>>
  onImport: (service: string, key: string, value: string) => void
  onSwitchToCredentials: () => void
}

type Step = 'home' | 'create-select' | 'create-passphrase' | 'create-done' | 'import-upload' | 'import-preview' | 'import-passphrase' | 'import-done'

// ─── Logo Helper ──────────────────────────────────────────────

function ServiceLogo({ service, size = 20 }: { service: string; size?: number }) {
  const cfg = SVC[service]
  const logoId = cfg?.logo ?? service
  return (
    <img
      src={`https://cdn.simpleicons.org/${logoId}`}
      alt=""
      width={size}
      height={size}
      style={{ borderRadius: 4, flexShrink: 0 }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}

// ─── Main Component ───────────────────────────────────────────

export function BundleManager({ connectedServices, vault, onImport, onSwitchToCredentials }: BundleManagerProps) {
  const [step, setStep] = useState<Step>('home')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [passphrase, setPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')
  const [bundleName, setBundleName] = useState('My 0n Bundle')
  const [createdBundle, setCreatedBundle] = useState<Bundle | null>(null)
  const [importedBundle, setImportedBundle] = useState<Bundle | null>(null)
  const [importPassphrase, setImportPassphrase] = useState('')
  const [importing, setImporting] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [importResults, setImportResults] = useState<{ service: string; name: string }[]>([])
  const [showPassphrase, setShowPassphrase] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Create Flow ──────────────────────────────────────────

  function startCreate() {
    setSelected(new Set(connectedServices))
    setPassphrase('')
    setConfirmPassphrase('')
    setBundleName('My 0n Bundle')
    setError('')
    setStep('create-select')
  }

  function toggleService(svc: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(svc)) next.delete(svc)
      else next.add(svc)
      return next
    })
  }

  async function handleCreate() {
    if (!passphrase) { setError('Passphrase is required'); return }
    if (passphrase.length < 8) { setError('Passphrase must be at least 8 characters'); return }
    if (passphrase !== confirmPassphrase) { setError('Passphrases do not match'); return }
    if (selected.size === 0) { setError('Select at least one service'); return }

    setCreating(true)
    setError('')

    try {
      const connections = Array.from(selected).map(svc => {
        const cfg = SVC[svc]
        const creds = vault[svc] ?? {}
        // Determine auth type from service config
        let authType = 'api_key'
        if (svc === 'crm' || svc.startsWith('crm-')) authType = 'pit'
        else if (svc === 'github') authType = 'token'
        else if (svc === 'google') authType = 'oauth2'
        else if (svc === 'sanity') authType = 'bearer'
        return {
          service: svc,
          name: cfg?.l ?? svc,
          authType,
          credentials: creds,
        }
      })

      const bundle = await createBundle(
        connections,
        passphrase,
        bundleName,
        `Sealed credential bundle with ${connections.length} services. Created on 0nmcp.com.`,
      )

      setCreatedBundle(bundle)
      setStep('create-done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bundle')
    } finally {
      setCreating(false)
    }
  }

  function downloadBundle() {
    if (!createdBundle) return
    const json = JSON.stringify(createdBundle, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${bundleName.replace(/\s+/g, '-').toLowerCase()}.0n`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ─── Import Flow ──────────────────────────────────────────

  function startImport() {
    setImportedBundle(null)
    setImportPassphrase('')
    setError('')
    setImportResults([])
    setStep('import-upload')
  }

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function processFile(file: File) {
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const bundle = JSON.parse(reader.result as string) as Bundle
        if (!bundle.$0n || bundle.$0n.type !== 'bundle') {
          setError('Not a valid .0n bundle file')
          return
        }
        setImportedBundle(bundle)
        setStep('import-preview')
      } catch {
        setError('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    if (!importedBundle) return
    if (!importPassphrase && importedBundle.manifest.encryption.method !== 'none') {
      setError('Passphrase is required for sealed bundles')
      return
    }

    setImporting(true)
    setError('')

    try {
      const results = await openBundle(importedBundle, importPassphrase)

      // Install each connection into the vault
      for (const conn of results) {
        for (const [key, value] of Object.entries(conn.credentials)) {
          onImport(conn.service, key, value)
        }
      }

      setImportResults(results.map(r => ({ service: r.service, name: r.name })))
      setStep('import-done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decrypt bundle')
    } finally {
      setImporting(false)
    }
  }

  // ─── Shared Styles ────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '1.25rem',
  }

  const btnPrimary: React.CSSProperties = {
    background: 'var(--accent)',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    padding: '0.625rem 1.25rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  const btnGhost: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--text-primary)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '0.625rem 1.25rem',
    fontWeight: 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'var(--font-mono)',
  }

  // ─── Render ───────────────────────────────────────────────

  // Home
  if (step === 'home') {
    return (
      <div style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Credential Bundles
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Package your vault credentials into portable, encrypted .0n files. Import on any machine with <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>0nmcp engine open</code>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: 640 }}>
          {/* Create Bundle */}
          <button
            onClick={startCreate}
            style={{
              ...cardStyle,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.background = 'rgba(126,217,87,0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: 4 }}>
              Create Bundle
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Select services, set a passphrase, download an encrypted .0n file
            </div>
            {connectedServices.length > 0 && (
              <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500 }}>
                {connectedServices.length} service{connectedServices.length !== 1 ? 's' : ''} ready
              </div>
            )}
          </button>

          {/* Import Bundle */}
          <button
            onClick={startImport}
            style={{
              ...cardStyle,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#00d4ff'
              e.currentTarget.style.background = 'rgba(0,212,255,0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: 4 }}>
              Import Bundle
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Upload a .0n bundle file and decrypt credentials into your vault
            </div>
          </button>
        </div>

        {/* Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem 1.25rem',
          background: 'rgba(126,217,87,0.04)',
          border: '1px solid rgba(126,217,87,0.12)',
          borderRadius: 10,
          maxWidth: 640,
        }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent)' }}>How it works:</strong> Bundles are encrypted with AES-256-GCM using a passphrase you choose. Your credentials never leave your browser unencrypted. The .0n bundle file is compatible with the 0nMCP CLI — run <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>0nmcp engine open bundle.0n</code> to install credentials on any machine.
          </div>
        </div>
      </div>
    )
  }

  // Create — Select Services
  if (step === 'create-select') {
    return (
      <div style={{ padding: '1rem' }}>
        <button onClick={() => setStep('home')} style={{ ...btnGhost, marginBottom: '1rem', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Select Services
        </h2>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Choose which credentials to include in your bundle. {selected.size} selected.
        </p>

        {connectedServices.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>No services connected yet</p>
            <button onClick={onSwitchToCredentials} style={btnPrimary}>Connect Services</button>
          </div>
        ) : (
          <>
            {/* Select all / none */}
            <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem' }}>
              <button
                onClick={() => setSelected(new Set(connectedServices))}
                style={{ ...btnGhost, padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
              >
                Select All
              </button>
              <button
                onClick={() => setSelected(new Set())}
                style={{ ...btnGhost, padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
              >
                Clear
              </button>
            </div>

            {/* Service grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: '1.5rem' }}>
              {connectedServices.map(svc => {
                const cfg = SVC[svc]
                const isSelected = selected.has(svc)
                const credCount = Object.keys(vault[svc] ?? {}).length
                return (
                  <button
                    key={svc}
                    onClick={() => toggleService(svc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '0.625rem 0.875rem',
                      background: isSelected ? 'rgba(126,217,87,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.15)'}`,
                      background: isSelected ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <ServiceLogo service={svc} size={18} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cfg?.l ?? svc}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {credCount} key{credCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => { setError(''); setStep('create-passphrase') }}
              disabled={selected.size === 0}
              style={{
                ...btnPrimary,
                opacity: selected.size === 0 ? 0.5 : 1,
                cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Continue with {selected.size} service{selected.size !== 1 ? 's' : ''}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </div>
    )
  }

  // Create — Passphrase
  if (step === 'create-passphrase') {
    return (
      <div style={{ padding: '1rem', maxWidth: 480 }}>
        <button onClick={() => setStep('create-select')} style={{ ...btnGhost, marginBottom: '1rem', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Seal Your Bundle
        </h2>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Choose a passphrase to encrypt {selected.size} service{selected.size !== 1 ? 's' : ''} with AES-256-GCM.
          You&apos;ll need this passphrase to open the bundle later.
        </p>

        {/* Bundle name */}
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Bundle Name</span>
          <input
            type="text"
            value={bundleName}
            onChange={e => setBundleName(e.target.value)}
            style={inputStyle}
            placeholder="My 0n Bundle"
          />
        </label>

        {/* Passphrase */}
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Passphrase</span>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassphrase ? 'text' : 'password'}
              value={passphrase}
              onChange={e => { setPassphrase(e.target.value); setError('') }}
              style={inputStyle}
              placeholder="At least 8 characters"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              {showPassphrase ? 'Hide' : 'Show'}
            </button>
          </div>
          {/* Strength indicator */}
          {passphrase.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', gap: 3 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{
                  height: 3, flex: 1, borderRadius: 2,
                  background: passphrase.length >= i * 4
                    ? passphrase.length >= 16 ? '#6EE05A' : passphrase.length >= 12 ? '#fbbf24' : '#f97316'
                    : 'rgba(255,255,255,0.06)',
                }} />
              ))}
            </div>
          )}
        </label>

        {/* Confirm */}
        <label style={{ display: 'block', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Confirm Passphrase</span>
          <input
            type={showPassphrase ? 'text' : 'password'}
            value={confirmPassphrase}
            onChange={e => { setConfirmPassphrase(e.target.value); setError('') }}
            style={inputStyle}
            placeholder="Re-enter passphrase"
          />
        </label>

        {error && (
          <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={creating || !passphrase || !confirmPassphrase}
          style={{
            ...btnPrimary,
            opacity: creating || !passphrase || !confirmPassphrase ? 0.5 : 1,
            cursor: creating ? 'wait' : 'pointer',
          }}
        >
          {creating ? (
            <>
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              Encrypting...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Seal &amp; Create Bundle
            </>
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // Create — Done
  if (step === 'create-done' && createdBundle) {
    const info = inspectBundle(createdBundle)
    return (
      <div style={{ padding: '1rem', maxWidth: 520 }}>
        {/* Success header */}
        <div style={{
          textAlign: 'center', padding: '2rem 1rem',
          background: 'rgba(126,217,87,0.06)',
          border: '1px solid rgba(126,217,87,0.15)',
          borderRadius: 12, marginBottom: '1.5rem',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" style={{ marginBottom: 12 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Bundle Sealed
          </h2>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {info.connectionCount} service{info.connectionCount !== 1 ? 's' : ''} encrypted with AES-256-GCM
          </p>
        </div>

        {/* Service list */}
        <div style={{ ...cardStyle, marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Included Services
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {info.services.map(s => (
              <div key={s.service} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', background: 'rgba(255,255,255,0.04)',
                borderRadius: 6, fontSize: '0.8125rem', color: 'var(--text-primary)',
              }}>
                <ServiceLogo service={s.service} size={14} />
                {s.name}
              </div>
            ))}
          </div>
        </div>

        {/* Download */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={downloadBundle} style={btnPrimary}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Bundle
          </button>
          <button onClick={() => setStep('home')} style={btnGhost}>
            Done
          </button>
        </div>

        {/* CLI instructions */}
        <div style={{
          marginTop: '1.5rem', padding: '0.875rem 1rem',
          background: 'rgba(0,0,0,0.3)', borderRadius: 8,
          fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
          color: 'var(--text-secondary)', lineHeight: 1.6,
        }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}># Import on any machine:</div>
          <div style={{ color: 'var(--accent)' }}>0nmcp engine open {bundleName.replace(/\s+/g, '-').toLowerCase()}.0n</div>
        </div>
      </div>
    )
  }

  // Import — Upload
  if (step === 'import-upload') {
    return (
      <div style={{ padding: '1rem', maxWidth: 520 }}>
        <button onClick={() => setStep('home')} style={{ ...btnGhost, marginBottom: '1rem', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Import Bundle
        </h2>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Upload a .0n bundle file to decrypt and install credentials into your vault.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#00d4ff' }}
          onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s',
            background: 'rgba(255,255,255,0.01)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: 12 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Drop .0n bundle here
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            or click to browse
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".0n,.json"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {error && (
          <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: '0.8125rem' }}>
            {error}
          </div>
        )}
      </div>
    )
  }

  // Import — Preview (inspect without passphrase)
  if (step === 'import-preview' && importedBundle) {
    const info = inspectBundle(importedBundle)
    const isSealed = info.encryption !== 'none'
    return (
      <div style={{ padding: '1rem', maxWidth: 520 }}>
        <button onClick={() => setStep('import-upload')} style={{ ...btnGhost, marginBottom: '1rem', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Bundle Preview
        </h2>

        {/* Bundle info card */}
        <div style={{ ...cardStyle, marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 4 }}>{info.name}</div>
          {info.description && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{info.description}</div>}
          <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>{info.connectionCount} service{info.connectionCount !== 1 ? 's' : ''}</span>
            <span>{isSealed ? 'Encrypted' : 'Unsealed'}</span>
            <span>{new Date(info.created).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Services list */}
        <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Services in this bundle
          </div>
          {info.services.map(s => (
            <div key={s.service} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.5rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <ServiceLogo service={s.service} size={18} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {s.credential_keys.join(', ')}
                </div>
              </div>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: s.sealed ? '#fbbf24' : '#6EE05A',
              }} />
            </div>
          ))}
        </div>

        {isSealed ? (
          <button onClick={() => { setError(''); setStep('import-passphrase') }} style={btnPrimary}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Enter Passphrase to Import
          </button>
        ) : (
          <button onClick={handleImport} disabled={importing} style={btnPrimary}>
            {importing ? 'Importing...' : 'Import to Vault'}
          </button>
        )}
      </div>
    )
  }

  // Import — Passphrase
  if (step === 'import-passphrase') {
    return (
      <div style={{ padding: '1rem', maxWidth: 480 }}>
        <button onClick={() => setStep('import-preview')} style={{ ...btnGhost, marginBottom: '1rem', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Unseal Bundle
        </h2>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Enter the passphrase that was used to seal this bundle.
        </p>

        <label style={{ display: 'block', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Passphrase</span>
          <input
            type="password"
            value={importPassphrase}
            onChange={e => { setImportPassphrase(e.target.value); setError('') }}
            style={inputStyle}
            placeholder="Enter bundle passphrase"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && importPassphrase) handleImport() }}
          />
        </label>

        {error && (
          <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: '0.8125rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={importing || !importPassphrase}
          style={{
            ...btnPrimary,
            opacity: importing || !importPassphrase ? 0.5 : 1,
            cursor: importing ? 'wait' : 'pointer',
          }}
        >
          {importing ? (
            <>
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              Decrypting...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
              Unseal &amp; Import
            </>
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // Import — Done
  if (step === 'import-done') {
    return (
      <div style={{ padding: '1rem', maxWidth: 520 }}>
        <div style={{
          textAlign: 'center', padding: '2rem 1rem',
          background: 'rgba(126,217,87,0.06)',
          border: '1px solid rgba(126,217,87,0.15)',
          borderRadius: 12, marginBottom: '1.5rem',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" style={{ marginBottom: 12 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Credentials Imported
          </h2>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {importResults.length} service{importResults.length !== 1 ? 's' : ''} installed to your vault
          </p>
        </div>

        {/* Imported services */}
        <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
          {importResults.map(r => (
            <div key={r.service} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.5rem 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <ServiceLogo service={r.service} size={18} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{r.name}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSwitchToCredentials} style={btnPrimary}>
            View Vault
          </button>
          <button onClick={() => setStep('home')} style={btnGhost}>
            Done
          </button>
        </div>
      </div>
    )
  }

  return null
}
