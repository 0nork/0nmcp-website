'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { encryptVaultData } from '@/lib/vault-crypto'
import SwitchImporter from '@/components/SwitchImporter'

interface Profile {
  id: string
  email: string
  full_name: string | null
  company: string | null
  plan: string
  mfa_enrolled: boolean
  sponsor_tier: string | null
  stripe_customer_id: string | null
  created_at: string
}

interface VaultEntry {
  id: string
  service_name: string
  key_hint: string | null
  created_at: string
  updated_at: string
}

interface WorkflowFile {
  id: string
  file_key: string
  name: string
  description: string | null
  version: string
  step_count: number
  services_used: string[]
  tags: string[]
  status: string
  execution_count: number
  last_executed_at: string | null
  created_at: string
  updated_at: string
}

interface ConvertedWorkflow {
  id: string
  name: string
  source_platform: string
  source_format: string | null
  workflow: Record<string, unknown>
  stats: Record<string, unknown>
  created_at: string
}

type ActiveTab = 'profile' | 'vault' | 'files' | 'import' | 'convert' | 'licenses'

export default function AccountPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowser()!  // Protected route — middleware guarantees auth

  const [profile, setProfile] = useState<Profile | null>(null)
  const [vault, setVault] = useState<VaultEntry[]>([])
  const [files, setFiles] = useState<WorkflowFile[]>([])
  const [tab, setTab] = useState<ActiveTab>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Editable profile fields
  const [editName, setEditName] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)

  // Vault add form
  const [newService, setNewService] = useState('')
  const [newApiKey, setNewApiKey] = useState('')
  const [newKeyHint, setNewKeyHint] = useState('')

  // Convert state
  const [convertedWorkflows, setConvertedWorkflows] = useState<ConvertedWorkflow[]>([])
  const [convertText, setConvertText] = useState('')
  const [convertFilename, setConvertFilename] = useState('')
  const [convertLoading, setConvertLoading] = useState(false)
  const [convertError, setConvertError] = useState('')
  const [convertResult, setConvertResult] = useState<{ workflow: Record<string, unknown>; platform: string; format: string; stats: { tools: number; prompts: number; settings: number } } | null>(null)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const [profileRes, vaultRes, filesRes, convertRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_vaults').select('id, service_name, key_hint, created_at, updated_at').eq('user_id', user.id).order('service_name'),
      supabase.from('workflow_files').select('*').eq('owner_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('user_workflows').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])

    if (profileRes.data) {
      setProfile(profileRes.data)
      setEditName(profileRes.data.full_name || '')
      setEditCompany(profileRes.data.company || '')
    }
    if (vaultRes.data) setVault(vaultRes.data)
    if (filesRes.data) setFiles(filesRes.data)
    if (convertRes.data) setConvertedWorkflows(convertRes.data)
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleSaveProfile() {
    if (!profile) return
    setSaving(true)
    setMessage('')

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName || null, company: editCompany || null })
      .eq('id', profile.id)

    setSaving(false)
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Profile saved')
      setProfile({ ...profile, full_name: editName || null, company: editCompany || null })
    }
  }

  async function handleAddCredential(e: React.FormEvent) {
    e.preventDefault()
    if (!newService.trim() || !newApiKey.trim()) return
    setSaving(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { encrypted, iv, salt } = await encryptVaultData(user.id, newApiKey)

      const { error } = await supabase.from('user_vaults').insert({
        user_id: user.id,
        service_name: newService.trim(),
        encrypted_key: encrypted,
        iv,
        salt,
        key_hint: newKeyHint.trim() || null,
      })

      setSaving(false)
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setNewService('')
        setNewApiKey('')
        setNewKeyHint('')
        setMessage('Credential saved')
        loadData()
      }
    } catch {
      setSaving(false)
      setMessage('Error: Encryption failed')
    }
  }

  async function handleDeleteCredential(id: string, name: string) {
    if (!confirm(`Delete credential for "${name}"?`)) return
    const { error } = await supabase.from('user_vaults').delete().eq('id', id)
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setVault(vault.filter((v) => v.id !== id))
      setMessage('Credential deleted')
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setMessage(data.error || 'Failed to open billing portal')
      }
    } catch {
      setMessage('Network error')
    }
    setPortalLoading(false)
  }

  function handleConvertFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setConvertFilename(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setConvertText(text)
      setConvertError('')
      setConvertResult(null)
    }
    reader.readAsText(file)
  }

  async function handleConvert() {
    if (!convertText.trim()) return
    setConvertLoading(true)
    setConvertError('')
    setConvertResult(null)

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: convertText, filename: convertFilename || 'upload.json' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setConvertError(data.error || 'Conversion failed')
      } else {
        setConvertResult(data)
        loadData() // Refresh the converted workflows list
      }
    } catch {
      setConvertError('Network error — please try again')
    } finally {
      setConvertLoading(false)
    }
  }

  function handleConvertDownload() {
    if (!convertResult) return
    const content = JSON.stringify(convertResult.workflow, null, 2)
    const name = ((convertResult.workflow.name as string) || 'converted').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.0n.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo">0n</div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading account...</p>
        </div>
      </div>
    )
  }

  const tabs: { key: ActiveTab; label: string; count?: number }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'vault', label: 'Credentials', count: vault.length },
    { key: 'files', label: '.0n Files', count: files.length },
    { key: 'import', label: 'Import' },
    { key: 'convert', label: 'Convert', count: convertedWorkflows.length },
    { key: 'licenses', label: 'Licenses' },
  ]

  return (
    <div className="account-container">
      <div className="account-header">
        <div>
          <h1 className="account-title">{profile?.full_name || profile?.email}</h1>
          <p className="account-plan">
            <span className="account-plan-badge">{profile?.plan || 'free'}</span>
            {profile?.sponsor_tier && (
              <span className="account-plan-badge" style={{ backgroundColor: 'rgba(0,255,136,0.15)', color: 'var(--accent)', borderColor: 'rgba(0,255,136,0.3)' }}>
                {profile.sponsor_tier} sponsor
              </span>
            )}
            {profile?.mfa_enrolled && <span className="account-mfa-badge">2FA</span>}
          </p>
        </div>
        <button className="btn-ghost" onClick={handleSignOut} style={{ fontSize: '0.8125rem' }}>
          Sign out
        </button>
      </div>

      {message && (
        <div className={`account-message ${message.startsWith('Error') ? 'error' : 'success'}`}>
          {message}
          <button onClick={() => setMessage('')}>&times;</button>
        </div>
      )}

      <div className="account-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`account-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.count !== undefined && <span className="account-tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="account-content">
        {tab === 'profile' && (
          <div className="account-section">
            <h2 className="account-section-title">Profile</h2>
            <div className="auth-form" style={{ maxWidth: '480px' }}>
              <div className="auth-field">
                <label>Email</label>
                <input value={profile?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="auth-field">
                <label>Full name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="auth-field">
                <label>Company</label>
                <input
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <button
                className="auth-btn primary"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '0.5rem' }}>Account details</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
              </p>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '0.5rem' }}>Sponsorship</h3>
              {profile?.sponsor_tier ? (
                <div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    You are a <strong style={{ color: 'var(--accent)' }}>{profile.sponsor_tier}</strong> sponsor. Thank you for supporting 0nMCP!
                  </p>
                  <button
                    className="btn-ghost"
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    {portalLoading ? 'Loading...' : 'Manage subscription'}
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Not currently sponsoring. Your support keeps 0nMCP free and open source.
                  </p>
                  <a href="/sponsor" className="btn-ghost no-underline" style={{ fontSize: '0.8125rem' }}>
                    Become a sponsor
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'vault' && (
          <div className="account-section">
            <h2 className="account-section-title">Credential Vault</h2>
            <p className="account-section-desc">
              API keys are encrypted client-side with AES-256-GCM before storage. We never see your keys in plaintext.
            </p>

            {vault.length > 0 && (
              <div className="vault-list">
                {vault.map((v) => (
                  <div key={v.id} className="vault-entry">
                    <div className="vault-entry-info">
                      <span className="vault-entry-service">{v.service_name}</span>
                      {v.key_hint && (
                        <span className="vault-entry-hint">...{v.key_hint}</span>
                      )}
                      <span className="vault-entry-date">
                        Added {new Date(v.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      className="vault-entry-delete"
                      onClick={() => handleDeleteCredential(v.id, v.service_name)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddCredential} className="vault-add-form">
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem' }}>Add credential</h3>
              <div className="vault-add-fields">
                <div className="auth-field">
                  <label>Service</label>
                  <input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="e.g. anthropic, openai, stripe"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>API key</label>
                  <input
                    type="password"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="sk-..."
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Hint (optional, last 4 chars)</label>
                  <input
                    value={newKeyHint}
                    onChange={(e) => setNewKeyHint(e.target.value)}
                    placeholder="e.g. x7Qm"
                    maxLength={8}
                  />
                </div>
              </div>
              <button type="submit" className="auth-btn primary" disabled={saving} style={{ maxWidth: '200px' }}>
                {saving ? 'Encrypting...' : 'Save credential'}
              </button>
            </form>
          </div>
        )}

        {tab === 'files' && (
          <div className="account-section">
            <h2 className="account-section-title">.0n Files</h2>
            <p className="account-section-desc">
              Your encrypted workflow files. Each file has a unique key and requires authentication to access.
            </p>

            {files.length === 0 ? (
              <div className="files-empty">
                <p>No .0n files yet</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  Create workflows in the Builder or upload .0n files to store them securely.
                </p>
              </div>
            ) : (
              <div className="files-list">
                {files.map((f) => (
                  <div key={f.id} className="file-card">
                    <div className="file-card-header">
                      <span className="file-card-name">{f.name}</span>
                      <span className={`file-card-status ${f.status}`}>{f.status}</span>
                    </div>
                    {f.description && (
                      <p className="file-card-desc">{f.description}</p>
                    )}
                    <div className="file-card-meta">
                      <span className="file-card-key" title={f.file_key}>{f.file_key}</span>
                      <span>{f.step_count} steps</span>
                      <span>{f.execution_count} runs</span>
                      <span>v{f.version}</span>
                    </div>
                    {f.services_used.length > 0 && (
                      <div className="file-card-services">
                        {f.services_used.map((s) => (
                          <span key={s} className="file-card-service-tag">{s}</span>
                        ))}
                      </div>
                    )}
                    {f.tags.length > 0 && (
                      <div className="file-card-tags">
                        {f.tags.map((t) => (
                          <span key={t} className="file-card-tag">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'import' && profile && (
          <div className="account-section">
            <h2 className="account-section-title">Import .0n SWITCH File</h2>
            <p className="account-section-desc">
              Import a .0n SWITCH file to preview connections, products, and workflows. Convert it to a Claude Code skill or save to your cloud vault.
            </p>
            <SwitchImporter userId={profile.id} onImportComplete={loadData} />
          </div>
        )}

        {tab === 'convert' && (
          <div className="account-section">
            <h2 className="account-section-title">Brain Transplant</h2>
            <p className="account-section-desc">
              Convert AI configs from OpenAI, Gemini, OpenClaw, or Claude Code into portable .0n workflows.
            </p>

            {/* Upload area */}
            <div style={{ maxWidth: '560px', marginTop: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  width: '100%',
                  cursor: 'pointer',
                  borderRadius: '0.75rem',
                  border: '2px dashed var(--border)',
                  padding: '2rem',
                  textAlign: 'center',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>0n</div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {convertFilename || 'Click to upload AI config file (.json, .md, .claw)'}
                </span>
                <input
                  type="file"
                  accept=".json,.md,.claw,.yaml,.yml"
                  onChange={handleConvertFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <div style={{ margin: '1rem 0', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                or paste config below
              </div>

              <textarea
                value={convertText}
                onChange={(e) => { setConvertText(e.target.value); setConvertError(''); setConvertResult(null) }}
                placeholder='Paste your OpenAI, Gemini, OpenClaw, or Claude config here...'
                style={{
                  width: '100%',
                  height: '12rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                }}
              />

              {convertError && (
                <p style={{ color: '#f87171', fontSize: '0.8125rem', marginTop: '0.5rem' }}>{convertError}</p>
              )}

              <button
                className="auth-btn primary"
                onClick={handleConvert}
                disabled={convertLoading || !convertText.trim()}
                style={{ marginTop: '1rem', maxWidth: '240px' }}
              >
                {convertLoading ? 'Converting...' : 'Convert to .0n'}
              </button>
            </div>

            {/* Result */}
            {convertResult && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Conversion Complete</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {convertResult.platform} &middot; {convertResult.format} &middot; {convertResult.stats.tools} tools &middot; {convertResult.stats.prompts} prompts &middot; {convertResult.stats.settings} settings
                    </p>
                  </div>
                  <button className="btn-accent" onClick={handleConvertDownload} style={{ fontSize: '0.8125rem' }}>
                    Download .0n
                  </button>
                </div>
                <pre style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  overflow: 'auto',
                  maxHeight: '24rem',
                  whiteSpace: 'pre-wrap',
                }}>
                  {JSON.stringify(convertResult.workflow, null, 2)}
                </pre>
              </div>
            )}

            {/* Previous conversions */}
            {convertedWorkflows.length > 0 && (
              <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Previous Conversions</h3>
                <div className="files-list">
                  {convertedWorkflows.map((cw) => (
                    <div key={cw.id} className="file-card">
                      <div className="file-card-header">
                        <span className="file-card-name">{cw.name}</span>
                        <span className="file-card-status active" style={{ backgroundColor: 'rgba(0,255,136,0.1)', color: 'var(--accent)' }}>
                          {cw.source_platform}
                        </span>
                      </div>
                      <div className="file-card-meta">
                        <span>{cw.source_format || 'Auto-detected'}</span>
                        <span>{new Date(cw.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'licenses' && (
          <div className="account-section">
            <h2 className="account-section-title">Licenses</h2>
            <p className="account-section-desc">
              License keys authorize .0n file execution on specific domains. Each execution is tracked and logged.
            </p>
            <div className="files-empty">
              <p>No licenses yet</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Licenses are issued when you purchase a plan or subscribe to enterprise access.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
