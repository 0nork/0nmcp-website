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
      className="rounded shrink-0"
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

  // ─── Shared class helpers ─────────────────────────────────

  const cardCls = 'bg-white/[0.02] border border-[var(--border)] rounded-xl p-5'
  const btnPrimary = 'flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-black border-none rounded-lg font-semibold text-sm cursor-pointer'
  const btnGhost = 'flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg font-medium text-sm cursor-pointer'
  const inputCls = 'w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm outline-none font-mono'
  const labelSpan = 'block text-[0.8125rem] font-semibold text-[var(--text-secondary)] mb-1'
  const errorCls = 'px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[0.8125rem]'

  // ─── Render ───────────────────────────────────────────────

  // Home
  if (step === 'home') {
    return (
      <div className="p-4">
        <div className="mb-6">
          <h2 className="m-0 text-xl font-bold text-[var(--text-primary)]">Credential Bundles</h2>
          <p className="mt-1 mb-0 text-[0.8125rem] text-[var(--text-secondary)]">
            Package your vault credentials into portable, encrypted .0n files. Import on any machine with{' '}
            <code className="font-mono text-xs bg-[var(--border)] px-1.5 py-0.5 rounded">0nmcp engine open</code>
          </p>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: 640 }}>
          {/* Create Bundle */}
          <button
            onClick={startCreate}
            className={`${cardCls} cursor-pointer text-left transition-colors duration-200 hover:border-[var(--accent)] hover:bg-[#7ed95704]`}
          >
            <div className="mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <div className="font-semibold text-[var(--text-primary)] text-[0.9375rem] mb-1">Create Bundle</div>
            <div className="text-[0.8125rem] text-[var(--text-secondary)] leading-snug">
              Select services, set a passphrase, download an encrypted .0n file
            </div>
            {connectedServices.length > 0 && (
              <div className="mt-3 text-xs text-[var(--accent)] font-medium">
                {connectedServices.length} service{connectedServices.length !== 1 ? 's' : ''} ready
              </div>
            )}
          </button>

          {/* Import Bundle */}
          <button
            onClick={startImport}
            className={`${cardCls} cursor-pointer text-left transition-colors duration-200 hover:border-[#00d4ff] hover:bg-[#00d4ff04]`}
          >
            <div className="mb-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="font-semibold text-[var(--text-primary)] text-[0.9375rem] mb-1">Import Bundle</div>
            <div className="text-[0.8125rem] text-[var(--text-secondary)] leading-snug">
              Upload a .0n bundle file and decrypt credentials into your vault
            </div>
          </button>
        </div>

        <div
          className="mt-8 p-4 rounded-[10px] border"
          style={{
            maxWidth: 640,
            background: 'rgba(126,217,87,0.04)',
            borderColor: 'rgba(126,217,87,0.12)',
          }}
        >
          <div className="text-[0.8125rem] text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--accent)]">How it works:</strong> Bundles are encrypted with AES-256-GCM using a passphrase you choose. Your credentials never leave your browser unencrypted. The .0n bundle file is compatible with the 0nMCP CLI — run{' '}
            <code className="font-mono text-xs bg-[var(--border)] px-1.5 py-0.5 rounded">0nmcp engine open bundle.0n</code> to install credentials on any machine.
          </div>
        </div>
      </div>
    )
  }

  // Create — Select Services
  if (step === 'create-select') {
    return (
      <div className="p-4">
        <button onClick={() => setStep('home')} className={`${btnGhost} mb-4 !px-3 !py-1.5 !text-[0.8125rem]`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 className="mt-0 mb-1 text-lg font-bold text-[var(--text-primary)]">Select Services</h2>
        <p className="mt-0 mb-4 text-[0.8125rem] text-[var(--text-secondary)]">
          Choose which credentials to include in your bundle. {selected.size} selected.
        </p>

        {connectedServices.length === 0 ? (
          <div className={`${cardCls} text-center py-8`}>
            <p className="text-[var(--text-secondary)] mt-0 mb-4">No services connected yet</p>
            <button onClick={onSwitchToCredentials} className={btnPrimary}>Connect Services</button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSelected(new Set(connectedServices))}
                className={`${btnGhost} !px-2.5 !py-1 !text-xs`}
              >
                Select All
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className={`${btnGhost} !px-2.5 !py-1 !text-xs`}
              >
                Clear
              </button>
            </div>

            <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {connectedServices.map(svc => {
                const cfg = SVC[svc]
                const isSelected = selected.has(svc)
                const credCount = Object.keys(vault[svc] ?? {}).length
                return (
                  <button
                    key={svc}
                    onClick={() => toggleService(svc)}
                    className="flex items-center gap-2.5 rounded-lg cursor-pointer text-left transition-all duration-150"
                    style={{
                      padding: '0.625rem 0.875rem',
                      background: isSelected ? 'rgba(126,217,87,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0 rounded"
                      style={{
                        width: 18,
                        height: 18,
                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-hover)'}`,
                        background: isSelected ? 'var(--accent)' : 'transparent',
                      }}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <ServiceLogo service={svc} size={18} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.8125rem] font-semibold truncate">{cfg?.l ?? svc}</div>
                      <div className="text-[0.6875rem] text-[var(--text-muted)]">
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
              className={`${btnPrimary}`}
              style={{ opacity: selected.size === 0 ? 0.5 : 1, cursor: selected.size === 0 ? 'not-allowed' : 'pointer' }}
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
      <div className="p-4" style={{ maxWidth: 480 }}>
        <button onClick={() => setStep('create-select')} className={`${btnGhost} mb-4 !px-3 !py-1.5 !text-[0.8125rem]`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 className="mt-0 mb-1 text-lg font-bold text-[var(--text-primary)]">Seal Your Bundle</h2>
        <p className="mt-0 mb-6 text-[0.8125rem] text-[var(--text-secondary)]">
          Choose a passphrase to encrypt {selected.size} service{selected.size !== 1 ? 's' : ''} with AES-256-GCM.
          You&apos;ll need this passphrase to open the bundle later.
        </p>

        <label className="block mb-4">
          <span className={labelSpan}>Bundle Name</span>
          <input
            type="text"
            value={bundleName}
            onChange={e => setBundleName(e.target.value)}
            className={inputCls}
            placeholder="My 0n Bundle"
          />
        </label>

        <label className="block mb-4">
          <span className={labelSpan}>Passphrase</span>
          <div className="relative">
            <input
              type={showPassphrase ? 'text' : 'password'}
              value={passphrase}
              onChange={e => { setPassphrase(e.target.value); setError('') }}
              className={inputCls}
              placeholder="At least 8 characters"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-none border-none text-[var(--text-muted)] cursor-pointer text-xs"
            >
              {showPassphrase ? 'Hide' : 'Show'}
            </button>
          </div>
          {passphrase.length > 0 && (
            <div className="mt-1.5 flex gap-0.5">
              {[1,2,3,4].map(i => (
                <div
                  key={i}
                  className="h-[3px] flex-1 rounded-sm"
                  style={{
                    background: passphrase.length >= i * 4
                      ? passphrase.length >= 16 ? '#6EE05A' : passphrase.length >= 12 ? '#fbbf24' : '#f97316'
                      : 'var(--border)',
                  }}
                />
              ))}
            </div>
          )}
        </label>

        <label className="block mb-6">
          <span className={labelSpan}>Confirm Passphrase</span>
          <input
            type={showPassphrase ? 'text' : 'password'}
            value={confirmPassphrase}
            onChange={e => { setConfirmPassphrase(e.target.value); setError('') }}
            className={inputCls}
            placeholder="Re-enter passphrase"
          />
        </label>

        {error && <div className={`${errorCls} mb-4`}>{error}</div>}

        <button
          onClick={handleCreate}
          disabled={creating || !passphrase || !confirmPassphrase}
          className={btnPrimary}
          style={{
            opacity: creating || !passphrase || !confirmPassphrase ? 0.5 : 1,
            cursor: creating ? 'wait' : 'pointer',
          }}
        >
          {creating ? (
            <>
              <span
                className="inline-block rounded-full animate-spin"
                style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000' }}
              />
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
      </div>
    )
  }

  // Create — Done
  if (step === 'create-done' && createdBundle) {
    const info = inspectBundle(createdBundle)
    return (
      <div className="p-4" style={{ maxWidth: 520 }}>
        <div
          className="text-center py-8 px-4 rounded-xl mb-6"
          style={{
            background: 'rgba(126,217,87,0.06)',
            border: '1px solid rgba(126,217,87,0.15)',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="mb-3 mx-auto">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h2 className="mt-0 mb-1 text-xl font-bold text-[var(--text-primary)]">Bundle Sealed</h2>
          <p className="m-0 text-[0.8125rem] text-[var(--text-secondary)]">
            {info.connectionCount} service{info.connectionCount !== 1 ? 's' : ''} encrypted with AES-256-GCM
          </p>
        </div>

        <div className={`${cardCls} mb-4`}>
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-2">
            Included Services
          </div>
          <div className="flex flex-wrap gap-1.5">
            {info.services.map(s => (
              <div
                key={s.service}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-card)] rounded text-[0.8125rem] text-[var(--text-primary)]"
              >
                <ServiceLogo service={s.service} size={14} />
                {s.name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={downloadBundle} className={btnPrimary}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Bundle
          </button>
          <button onClick={() => setStep('home')} className={btnGhost}>Done</button>
        </div>

        <div
          className="mt-6 p-3.5 rounded-lg font-mono text-xs text-[var(--text-secondary)] leading-relaxed"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <div className="text-[var(--text-muted)] mb-1"># Import on any machine:</div>
          <div className="text-[var(--accent)]">0nmcp engine open {bundleName.replace(/\s+/g, '-').toLowerCase()}.0n</div>
        </div>
      </div>
    )
  }

  // Import — Upload
  if (step === 'import-upload') {
    return (
      <div className="p-4" style={{ maxWidth: 520 }}>
        <button onClick={() => setStep('home')} className={`${btnGhost} mb-4 !px-3 !py-1.5 !text-[0.8125rem]`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 className="mt-0 mb-1 text-lg font-bold text-[var(--text-primary)]">Import Bundle</h2>
        <p className="mt-0 mb-6 text-[0.8125rem] text-[var(--text-secondary)]">
          Upload a .0n bundle file to decrypt and install credentials into your vault.
        </p>

        <div
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#00d4ff' }}
          onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[var(--border)] rounded-xl py-12 px-8 text-center cursor-pointer transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.02]"
          style={{ background: 'rgba(255,255,255,0.01)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="mb-3 mx-auto">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div className="text-[0.9375rem] font-semibold text-[var(--text-primary)] mb-1">Drop .0n bundle here</div>
          <div className="text-[0.8125rem] text-[var(--text-muted)]">or click to browse</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".0n,.json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {error && <div className={`${errorCls} mt-4`}>{error}</div>}
      </div>
    )
  }

  // Import — Preview
  if (step === 'import-preview' && importedBundle) {
    const info = inspectBundle(importedBundle)
    const isSealed = info.encryption !== 'none'
    return (
      <div className="p-4" style={{ maxWidth: 520 }}>
        <button onClick={() => setStep('import-upload')} className={`${btnGhost} mb-4 !px-3 !py-1.5 !text-[0.8125rem]`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 className="mt-0 mb-1 text-lg font-bold text-[var(--text-primary)]">Bundle Preview</h2>

        <div className={`${cardCls} mb-4`}>
          <div className="font-semibold text-[0.9375rem] text-[var(--text-primary)] mb-1">{info.name}</div>
          {info.description && (
            <div className="text-[0.8125rem] text-[var(--text-secondary)] mb-3">{info.description}</div>
          )}
          <div className="flex gap-4 text-xs text-[var(--text-muted)]">
            <span>{info.connectionCount} service{info.connectionCount !== 1 ? 's' : ''}</span>
            <span>{isSealed ? 'Encrypted' : 'Unsealed'}</span>
            <span>{new Date(info.created).toLocaleDateString()}</span>
          </div>
        </div>

        <div className={`${cardCls} mb-6`}>
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-2">
            Services in this bundle
          </div>
          {info.services.map(s => (
            <div
              key={s.service}
              className="flex items-center gap-2.5 py-2 border-b border-[var(--bg-card)]"
            >
              <ServiceLogo service={s.service} size={18} />
              <div className="flex-1">
                <div className="text-[0.8125rem] font-semibold text-[var(--text-primary)]">{s.name}</div>
                <div className="text-[0.6875rem] text-[var(--text-muted)]">{s.credential_keys.join(', ')}</div>
              </div>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: s.sealed ? '#fbbf24' : '#6EE05A' }}
              />
            </div>
          ))}
        </div>

        {isSealed ? (
          <button onClick={() => { setError(''); setStep('import-passphrase') }} className={btnPrimary}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Enter Passphrase to Import
          </button>
        ) : (
          <button onClick={handleImport} disabled={importing} className={btnPrimary}>
            {importing ? 'Importing...' : 'Import to Vault'}
          </button>
        )}
      </div>
    )
  }

  // Import — Passphrase
  if (step === 'import-passphrase') {
    return (
      <div className="p-4" style={{ maxWidth: 480 }}>
        <button onClick={() => setStep('import-preview')} className={`${btnGhost} mb-4 !px-3 !py-1.5 !text-[0.8125rem]`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>

        <h2 className="mt-0 mb-1 text-lg font-bold text-[var(--text-primary)]">Unseal Bundle</h2>
        <p className="mt-0 mb-6 text-[0.8125rem] text-[var(--text-secondary)]">
          Enter the passphrase that was used to seal this bundle.
        </p>

        <label className="block mb-6">
          <span className={labelSpan}>Passphrase</span>
          <input
            type="password"
            value={importPassphrase}
            onChange={e => { setImportPassphrase(e.target.value); setError('') }}
            className={inputCls}
            placeholder="Enter bundle passphrase"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && importPassphrase) handleImport() }}
          />
        </label>

        {error && <div className={`${errorCls} mb-4`}>{error}</div>}

        <button
          onClick={handleImport}
          disabled={importing || !importPassphrase}
          className={btnPrimary}
          style={{
            opacity: importing || !importPassphrase ? 0.5 : 1,
            cursor: importing ? 'wait' : 'pointer',
          }}
        >
          {importing ? (
            <>
              <span
                className="inline-block rounded-full animate-spin"
                style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000' }}
              />
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
      </div>
    )
  }

  // Import — Done
  if (step === 'import-done') {
    return (
      <div className="p-4" style={{ maxWidth: 520 }}>
        <div
          className="text-center py-8 px-4 rounded-xl mb-6"
          style={{
            background: 'rgba(126,217,87,0.06)',
            border: '1px solid rgba(126,217,87,0.15)',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="mb-3 mx-auto">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h2 className="mt-0 mb-1 text-xl font-bold text-[var(--text-primary)]">Credentials Imported</h2>
          <p className="m-0 text-[0.8125rem] text-[var(--text-secondary)]">
            {importResults.length} service{importResults.length !== 1 ? 's' : ''} installed to your vault
          </p>
        </div>

        <div className={`${cardCls} mb-6`}>
          {importResults.map(r => (
            <div key={r.service} className="flex items-center gap-2.5 py-2 border-b border-[var(--bg-card)]">
              <ServiceLogo service={r.service} size={18} />
              <span className="text-[0.8125rem] font-semibold text-[var(--text-primary)] flex-1">{r.name}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onSwitchToCredentials} className={btnPrimary}>View Vault</button>
          <button onClick={() => setStep('home')} className={btnGhost}>Done</button>
        </div>
      </div>
    )
  }

  return null
}
