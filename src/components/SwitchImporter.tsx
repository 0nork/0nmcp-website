'use client'

import { useState, useRef, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface SwitchImporterProps {
  userId: string
  onImportComplete?: () => void
}

interface SwitchHeader {
  type: string
  name: string
  version: string
  author?: string
  description?: string
  created?: string
}

interface SwitchIdentity {
  owner?: string
  org?: string
  brand?: string
  tagline?: string
  email?: string
}

interface SwitchProduct {
  name: string
  domain?: string
  description?: string
  services?: string[]
  [key: string]: unknown
}

interface SwitchConnection {
  auth_type?: string
  tools?: number
  [key: string]: unknown
}

interface SwitchData {
  $0n: SwitchHeader
  identity?: SwitchIdentity
  products?: Record<string, SwitchProduct>
  connections?: Record<string, SwitchConnection>
  workflows?: Record<string, unknown>[] | Record<string, unknown>
  [key: string]: unknown
}

export default function SwitchImporter({ userId, onImportComplete }: SwitchImporterProps) {
  const [switchData, setSwitchData] = useState<SwitchData | null>(null)
  const [rawJson, setRawJson] = useState('')
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [jsonExpanded, setJsonExpanded] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseFile = useCallback((text: string, name: string) => {
    setError('')
    setSaveMessage('')
    setSwitchData(null)
    setRawJson('')
    setFileName(name)

    try {
      const parsed = JSON.parse(text)

      // Standard .0n format with $0n header
      if (parsed.$0n && parsed.$0n.type && parsed.$0n.name) {
        setSwitchData(parsed as SwitchData)
        setRawJson(JSON.stringify(parsed, null, 2))
        return
      }

      // Auto-detect: file has connections/workflows/products → wrap as switch
      const hasConnections = parsed.connections || parsed.services
      const hasWorkflows = parsed.workflows || parsed.steps || parsed.actions
      const hasProducts = parsed.products
      const hasName = parsed.name || parsed.title

      if (hasConnections || hasWorkflows || hasProducts) {
        const wrapped: SwitchData = {
          $0n: {
            type: parsed.$0n?.type || (hasWorkflows ? 'workflow' : 'switch'),
            name: parsed.$0n?.name || parsed.name || parsed.title || name.replace(/\.(0n|json)$/gi, ''),
            version: parsed.$0n?.version || parsed.version || '1.0.0',
            description: parsed.$0n?.description || parsed.description,
          },
          identity: parsed.identity,
          connections: typeof parsed.connections === 'object' ? parsed.connections : undefined,
          products: parsed.products,
          workflows: parsed.workflows || parsed.steps,
        }
        setSwitchData(wrapped)
        setRawJson(JSON.stringify(parsed, null, 2))
        return
      }

      // Has a $0n header but missing type or name — fill in defaults
      if (parsed.$0n) {
        const patched = { ...parsed }
        patched.$0n = {
          ...patched.$0n,
          type: patched.$0n.type || 'unknown',
          name: patched.$0n.name || hasName || name.replace(/\.(0n|json)$/gi, ''),
          version: patched.$0n.version || '1.0.0',
        }
        setSwitchData(patched as SwitchData)
        setRawJson(JSON.stringify(parsed, null, 2))
        return
      }

      setError('Could not detect .0n format. File should have a "$0n" header or contain connections/workflows/products.')
    } catch {
      setError('Failed to parse file. Ensure it is valid JSON.')
    }
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      parseFile(ev.target?.result as string, file.name)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      parseFile(ev.target?.result as string, file.name)
    }
    reader.readAsText(file)
  }

  function handleDownload() {
    if (!rawJson || !switchData) return
    const name = switchData.$0n.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const blob = new Blob([rawJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.0n.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleConvertToSkill() {
    if (!switchData) return

    const steps: { id: string; service: string; action: string; params: Record<string, unknown> }[] = []

    // One step per connection to verify
    if (switchData.connections) {
      for (const [service] of Object.entries(switchData.connections)) {
        steps.push({
          id: `verify_${service}`,
          service,
          action: 'verify',
          params: {},
        })
      }
    }

    // One step per product to check
    if (switchData.products) {
      for (const [key, product] of Object.entries(switchData.products)) {
        steps.push({
          id: `check_${key}`,
          service: 'internal',
          action: 'set',
          params: {
            product: key,
            domain: product.domain || '',
          },
        })
      }
    }

    const skillName = switchData.identity?.owner?.toLowerCase().replace(/[^a-z0-9]+/g, '_') || switchData.$0n.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')

    const skill = {
      $0n: { type: 'skill', name: switchData.$0n.name, version: '1.0.0' },
      skill: {
        name: skillName,
        description: switchData.$0n.description || `Skill generated from ${switchData.$0n.name}`,
        trigger: 'manual',
        steps,
      },
      source: { type: 'switch', name: switchData.$0n.name },
    }

    const content = JSON.stringify(skill, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${skillName}-skill.0n.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSaveToCloud() {
    if (!switchData || !rawJson) return
    setSaving(true)
    setSaveMessage('')

    const supabase = createSupabaseBrowser()
    if (!supabase) {
      setSaveMessage('Error: Authentication service unavailable.')
      setSaving(false)
      return
    }

    const connectionNames = switchData.connections ? Object.keys(switchData.connections) : []
    const productNames = switchData.products ? Object.keys(switchData.products) : []
    const stepCount = connectionNames.length + productNames.length

    const fileKey = `switch-${Date.now().toString(36)}`

    const { error: err } = await supabase.from('workflow_files').upsert({
      owner_id: userId,
      file_key: fileKey,
      name: switchData.$0n.name,
      description: switchData.$0n.description || `SWITCH file: ${switchData.$0n.name}`,
      version: switchData.$0n.version || '1.0.0',
      step_count: stepCount,
      services_used: connectionNames,
      tags: ['switch', switchData.$0n.type, ...productNames.slice(0, 5)],
      status: 'active',
      content: JSON.parse(rawJson),
    }, {
      onConflict: 'owner_id,file_key',
    })

    setSaving(false)
    if (err) {
      setSaveMessage(`Error: ${err.message}`)
    } else {
      setSaveMessage('Saved to cloud')
      if (onImportComplete) onImportComplete()
    }
  }

  function handleClear() {
    setSwitchData(null)
    setRawJson('')
    setFileName('')
    setError('')
    setSaveMessage('')
    setJsonExpanded(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const connectionCount = switchData?.connections ? Object.keys(switchData.connections).length : 0
  const productCount = switchData?.products ? Object.keys(switchData.products).length : 0
  const workflowCount = switchData?.workflows
    ? Array.isArray(switchData.workflows)
      ? switchData.workflows.length
      : Object.keys(switchData.workflows).length
    : 0

  return (
    <div>
      {/* Import Section */}
      {!switchData && (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '0.75rem',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background-color 0.2s',
              backgroundColor: dragOver ? 'rgba(126, 217, 87, 0.03)' : 'transparent',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--accent)',
              marginBottom: '0.75rem',
            }}>
              .0n
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Drop a .0n or .json SWITCH file here
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".0n,.json,.0n.json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(255, 80, 80, 0.1)',
              border: '1px solid rgba(255, 80, 80, 0.3)',
              color: '#ff5050',
              fontSize: '0.8125rem',
            }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Preview Section */}
      {switchData && (
        <div>
          {/* Header bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--accent-glow)',
                color: 'var(--accent)',
              }}>
                {switchData.$0n.type}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {fileName}
              </span>
            </div>
            <button
              onClick={handleClear}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              Clear
            </button>
          </div>

          {/* $0n Header */}
          <div className="file-card" style={{ marginBottom: '0.75rem' }}>
            <div className="file-card-header">
              <span className="file-card-name">{switchData.$0n.name}</span>
              <span className="file-card-status active">v{switchData.$0n.version}</span>
            </div>
            {switchData.$0n.description && (
              <p className="file-card-desc">{switchData.$0n.description}</p>
            )}
            <div className="file-card-meta">
              {switchData.$0n.author && <span>by {switchData.$0n.author}</span>}
              {switchData.$0n.created && <span>{new Date(switchData.$0n.created).toLocaleDateString()}</span>}
              <span>{connectionCount} connections</span>
              <span>{productCount} products</span>
              {workflowCount > 0 && <span>{workflowCount} workflows</span>}
            </div>
          </div>

          {/* Identity */}
          {switchData.identity && (
            <div className="file-card" style={{ marginBottom: '0.75rem' }}>
              <div className="file-card-header">
                <span className="file-card-name" style={{ fontSize: '0.875rem' }}>Identity</span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.5rem',
                marginTop: '0.5rem',
              }}>
                {switchData.identity.owner && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Owner</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{switchData.identity.owner}</div>
                  </div>
                )}
                {switchData.identity.org && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Org</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{switchData.identity.org}</div>
                  </div>
                )}
                {switchData.identity.brand && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Brand</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{switchData.identity.brand}</div>
                  </div>
                )}
                {switchData.identity.email && (
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.125rem' }}>Email</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}>{switchData.identity.email}</div>
                  </div>
                )}
              </div>
              {switchData.identity.tagline && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  &ldquo;{switchData.identity.tagline}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Products */}
          {switchData.products && productCount > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Products</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(switchData.products).map(([key, product]) => (
                  <div key={key} className="vault-entry">
                    <div className="vault-entry-info" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="vault-entry-service">{product.name || key}</span>
                        {product.domain && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)' }}>
                            {product.domain}
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{product.description}</span>
                      )}
                      {product.services && product.services.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.125rem' }}>
                          {product.services.map((s: string) => (
                            <span key={s} style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.5625rem',
                              padding: '0.0625rem 0.3125rem',
                              borderRadius: '0.25rem',
                              backgroundColor: 'var(--bg-tertiary)',
                              color: 'var(--text-muted)',
                            }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connections */}
          {switchData.connections && connectionCount > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Connections</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {Object.entries(switchData.connections).map(([service, conn]) => (
                  <div key={service} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)' }}>
                      {service}
                    </span>
                    {conn.auth_type && (
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {conn.auth_type}
                      </span>
                    )}
                    {conn.tools && (
                      <span style={{
                        fontSize: '0.5625rem',
                        padding: '0.0625rem 0.3125rem',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--accent-glow)',
                        color: 'var(--accent)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                      }}>
                        {conn.tools} tools
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workflows summary */}
          {workflowCount > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Workflows</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {workflowCount} workflow{workflowCount !== 1 ? 's' : ''} defined in this SWITCH file.
              </p>
            </div>
          )}

          {/* JSON Preview */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              onClick={() => setJsonExpanded(!jsonExpanded)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                padding: '0.25rem 0',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <span style={{ display: 'inline-block', transform: jsonExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                &#9654;
              </span>
              Raw JSON
            </button>
            {jsonExpanded && (
              <pre style={{
                marginTop: '0.5rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                padding: '1rem',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                overflow: 'auto',
                maxHeight: '20rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all' as const,
              }}>
                {rawJson}
              </pre>
            )}
          </div>

          {/* Export Actions */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
          }}>
            <button className="btn-ghost" onClick={handleDownload} style={{ fontSize: '0.8125rem' }}>
              Download .0n
            </button>
            <button className="btn-ghost" onClick={handleConvertToSkill} style={{ fontSize: '0.8125rem' }}>
              Convert to Skill
            </button>
            <button
              className="btn-accent"
              onClick={handleSaveToCloud}
              disabled={saving}
              style={{ fontSize: '0.8125rem' }}
            >
              {saving ? 'Saving...' : 'Save to Cloud'}
            </button>
          </div>

          {/* Save message */}
          {saveMessage && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              backgroundColor: saveMessage.startsWith('Error') ? 'rgba(255, 80, 80, 0.1)' : 'var(--accent-glow)',
              color: saveMessage.startsWith('Error') ? '#ff5050' : 'var(--accent)',
              border: `1px solid ${saveMessage.startsWith('Error') ? 'rgba(255, 80, 80, 0.3)' : 'rgba(126, 217, 87, 0.3)'}`,
            }}>
              {saveMessage}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
