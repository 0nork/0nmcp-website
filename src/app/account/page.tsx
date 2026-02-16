'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface Profile {
  id: string
  email: string
  full_name: string | null
  company: string | null
  plan: string
  mfa_enrolled: boolean
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

type ActiveTab = 'profile' | 'vault' | 'files' | 'licenses'

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

  // Vault add form
  const [newService, setNewService] = useState('')
  const [newApiKey, setNewApiKey] = useState('')
  const [newKeyHint, setNewKeyHint] = useState('')

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const [profileRes, vaultRes, filesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_vaults').select('id, service_name, key_hint, created_at, updated_at').eq('user_id', user.id).order('service_name'),
      supabase.from('workflow_files').select('*').eq('owner_id', user.id).order('updated_at', { ascending: false }),
    ])

    if (profileRes.data) {
      setProfile(profileRes.data)
      setEditName(profileRes.data.full_name || '')
      setEditCompany(profileRes.data.company || '')
    }
    if (vaultRes.data) setVault(vaultRes.data)
    if (filesRes.data) setFiles(filesRes.data)
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

    // Encrypt the API key client-side with Web Crypto
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(user.id),
      'PBKDF2',
      false,
      ['deriveKey']
    )
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const derivedKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    )
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      enc.encode(newApiKey)
    )

    // Store encrypted value + iv + salt as base64
    const encB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    const ivB64 = btoa(String.fromCharCode(...iv))
    const saltB64 = btoa(String.fromCharCode(...salt))

    const { error } = await supabase.from('user_vaults').insert({
      user_id: user.id,
      service_name: newService.trim(),
      encrypted_key: encB64,
      iv: ivB64,
      salt: saltB64,
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
    { key: 'licenses', label: 'Licenses' },
  ]

  return (
    <div className="account-container">
      <div className="account-header">
        <div>
          <h1 className="account-title">{profile?.full_name || profile?.email}</h1>
          <p className="account-plan">
            <span className="account-plan-badge">{profile?.plan || 'free'}</span>
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
