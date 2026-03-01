'use client'

import { useState, useEffect, useCallback } from 'react'

interface Personality {
  tone: string
  verbosity: string
  emoji_usage: string
  asks_followups: boolean
}

interface Persona {
  id: string
  name: string
  slug: string
  avatar_url: string | null
  bio: string | null
  role: string | null
  expertise: string[]
  personality: Personality | null
  knowledge_level: string
  preferred_groups: string[]
  is_active: boolean
  activity_level: string
  last_active_at: string | null
  thread_count: number
  reply_count: number
  created_at: string
}

interface TopicSeed {
  id: string
  topic: string
  category: string | null
  prompt_hint: string | null
  priority: number
  used_count: number
  created_at: string
}

interface ConvoLog {
  id: string
  thread_id: string
  persona_id: string
  action: string
  content_preview: string | null
  created_at: string
  persona_name?: string
}

type Tab = 'personas' | 'generate' | 'seeds' | 'activity'

const ROLE_COLORS: Record<string, string> = {
  developer: '#7ed957',
  founder: '#9945ff',
  agency_owner: '#ff6b35',
  freelancer: '#00d4ff',
  devops: '#FFD700',
  data_engineer: '#ff69b4',
  student: '#84cc16',
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#84cc16',
  intermediate: '#00d4ff',
  expert: '#FFD700',
}

export default function PersonasAdmin() {
  const [tab, setTab] = useState<Tab>('personas')
  const [personas, setPersonas] = useState<Persona[]>([])
  const [seeds, setSeeds] = useState<TopicSeed[]>([])
  const [activity, setActivity] = useState<ConvoLog[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Generate tab state
  const [genPrompt, setGenPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState<Partial<Persona> | null>(null)
  const [saving, setSaving] = useState(false)

  // Seed form state
  const [seedTopic, setSeedTopic] = useState('')
  const [seedCategory, setSeedCategory] = useState('')
  const [seedHint, setSeedHint] = useState('')
  const [seedPriority, setSeedPriority] = useState(5)

  // Converse state
  const [conversing, setConversing] = useState(false)

  const loadPersonas = useCallback(async () => {
    const res = await fetch('/api/personas')
    if (res.ok) {
      const data = await res.json()
      setPersonas(data.personas || [])
    } else {
      setMessage('Failed to load personas — check admin access')
    }
    setLoading(false)
  }, [])

  const loadSeeds = useCallback(async () => {
    // We'll load seeds from the personas library via a simple fetch
    // For now using the admin supabase client pattern
    const res = await fetch('/api/personas?seeds=true')
    if (res.ok) {
      const data = await res.json()
      if (data.seeds) setSeeds(data.seeds)
    }
  }, [])

  const loadActivity = useCallback(async () => {
    const res = await fetch('/api/personas?activity=true')
    if (res.ok) {
      const data = await res.json()
      if (data.activity) setActivity(data.activity)
    }
  }, [])

  useEffect(() => {
    loadPersonas()
  }, [loadPersonas])

  useEffect(() => {
    if (tab === 'seeds') loadSeeds()
    if (tab === 'activity') loadActivity()
  }, [tab, loadSeeds, loadActivity])

  async function handleGenerate() {
    if (!genPrompt.trim()) return
    setGenerating(true)
    setMessage('')
    setPreview(null)
    try {
      const res = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: genPrompt.trim() }),
      })
      const data = await res.json()
      if (data.persona) {
        setPreview(data.persona)
        setMessage('Persona generated — review and save below')
      } else {
        setMessage(data.error || 'Generation failed')
      }
    } catch {
      setMessage('Network error')
    }
    setGenerating(false)
  }

  async function handleSavePersona() {
    if (!preview) return
    setSaving(true)
    try {
      const res = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: genPrompt.trim(), save: true }),
      })
      const data = await res.json()
      if (data.persona && data.saved) {
        setMessage(`Saved: ${data.persona.name}`)
        setPreview(null)
        setGenPrompt('')
        loadPersonas()
      } else {
        setMessage(data.error || 'Save failed')
      }
    } catch {
      setMessage('Network error')
    }
    setSaving(false)
  }

  async function toggleActive(persona: Persona) {
    const res = await fetch(`/api/personas/${persona.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !persona.is_active }),
    })
    if (res.ok) {
      setPersonas(prev => prev.map(p => p.id === persona.id ? { ...p, is_active: !p.is_active } : p))
    }
  }

  async function deletePersona(id: string) {
    if (!confirm('Delete this persona and its profile?')) return
    const res = await fetch(`/api/personas/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPersonas(prev => prev.filter(p => p.id !== id))
      setMessage('Persona deleted')
    }
  }

  async function triggerConverse(action: 'seed_thread' | 'reply', personaId?: string, threadId?: string) {
    setConversing(true)
    setMessage('')
    try {
      const res = await fetch('/api/personas/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, persona_id: personaId, thread_id: threadId }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`${data.action}: ${data.persona} — ${data.thread?.title || data.preview?.slice(0, 60) || 'done'}`)
        loadPersonas()
      } else {
        setMessage(data.error || 'Action failed')
      }
    } catch {
      setMessage('Network error')
    }
    setConversing(false)
  }

  async function addSeed() {
    if (!seedTopic.trim()) return
    // Direct insert via personas route with seed data
    const res = await fetch('/api/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _action: 'add_seed',
        topic: seedTopic.trim(),
        category: seedCategory || null,
        prompt_hint: seedHint || null,
        priority: seedPriority,
      }),
    })
    if (res.ok) {
      setMessage('Topic seed added')
      setSeedTopic('')
      setSeedHint('')
      loadSeeds()
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>0n</div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Loading personas...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em' }}>AI Personas</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Forum agents — generate characters, seed discussions, build community.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => triggerConverse('seed_thread')}
            disabled={conversing}
            style={btnStyle('#9945ff')}
          >
            {conversing ? 'Working...' : 'Seed Thread'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            marginBottom: 16,
            fontSize: '0.8125rem',
            fontWeight: 600,
            background: message.includes('fail') || message.includes('error') ? 'rgba(255,61,61,0.1)' : 'rgba(126,217,87,0.1)',
            color: message.includes('fail') || message.includes('error') ? '#ff3d3d' : 'var(--accent)',
            border: `1px solid ${message.includes('fail') || message.includes('error') ? 'rgba(255,61,61,0.2)' : 'rgba(126,217,87,0.2)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {message}
          <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {(['personas', 'generate', 'seeds', 'activity'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: tab === t ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.15s',
            }}
          >
            {t === 'seeds' ? 'Topic Seeds' : t === 'activity' ? 'Activity Log' : t}
          </button>
        ))}
      </div>

      {/* ==================== Personas Tab ==================== */}
      {tab === 'personas' && (
        <div>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <StatBox label="Total" value={personas.length} color="var(--text)" />
            <StatBox label="Active" value={personas.filter(p => p.is_active).length} color="#7ed957" />
            <StatBox label="Threads" value={personas.reduce((s, p) => s + p.thread_count, 0)} color="#9945ff" />
            <StatBox label="Replies" value={personas.reduce((s, p) => s + p.reply_count, 0)} color="#00d4ff" />
          </div>

          {/* Persona grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {personas.map(p => (
              <div
                key={p.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: 16,
                  background: 'var(--bg-card)',
                  border: `1px solid ${p.is_active ? 'var(--border)' : 'rgba(255,61,61,0.2)'}`,
                  opacity: p.is_active ? 1 : 0.6,
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${ROLE_COLORS[p.role || ''] || '#484e78'}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 900,
                    color: ROLE_COLORS[p.role || ''] || '#fff',
                  }}>
                    {p.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: ROLE_COLORS[p.role || ''] || 'var(--text-muted)' }}>{p.role}</span>
                      {' '}&middot;{' '}
                      <span style={{ color: LEVEL_COLORS[p.knowledge_level] || 'var(--text-muted)' }}>{p.knowledge_level}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(p)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: p.is_active ? 'rgba(126,217,87,0.1)' : 'rgba(255,61,61,0.1)',
                      color: p.is_active ? '#7ed957' : '#ff3d3d',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.625rem',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {p.is_active ? 'Active' : 'Off'}
                  </button>
                </div>

                {/* Bio */}
                {p.bio && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>
                    {p.bio}
                  </p>
                )}

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {(p.expertise || []).slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.5625rem',
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats + personality */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                    {p.thread_count} threads &middot; {p.reply_count} replies
                    {p.personality && <> &middot; {p.personality.tone}</>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => triggerConverse('seed_thread', p.id)}
                      disabled={conversing || !p.is_active}
                      style={{ ...btnStyleSmall('#9945ff'), opacity: p.is_active ? 1 : 0.5 }}
                    >
                      Post
                    </button>
                    <button
                      onClick={() => deletePersona(p.id)}
                      style={btnStyleSmall('#ff3d3d')}
                    >
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {personas.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>No personas yet</p>
                <p style={{ fontSize: '0.75rem' }}>Go to the Generate tab to create your first one</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== Generate Tab ==================== */}
      {tab === 'generate' && (
        <div>
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 4 }}>Generate Persona</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Describe the kind of person you want. Example: &quot;A junior developer from Brazil who just discovered 0nMCP and is excited about automating their freelance client onboarding.&quot;
            </p>

            <textarea
              value={genPrompt}
              onChange={e => setGenPrompt(e.target.value)}
              placeholder="Describe the persona you want to create..."
              rows={4}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
                color: 'var(--text)',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: 12,
              }}
            />

            <button
              onClick={handleGenerate}
              disabled={generating || !genPrompt.trim()}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                background: generating ? 'var(--bg-card)' : 'var(--accent)',
                color: generating ? 'var(--text-muted)' : 'var(--bg-primary)',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: generating ? 'wait' : 'pointer',
              }}
            >
              {generating ? 'Generating with Claude...' : 'Generate Persona'}
            </button>
          </div>

          {/* Preview */}
          {preview && (
            <div
              style={{
                padding: 24,
                borderRadius: 16,
                background: 'var(--bg-card)',
                border: '1px solid var(--accent)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)' }}>Preview</h3>
                <button
                  onClick={handleSavePersona}
                  disabled={saving}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 10,
                    background: saving ? 'var(--bg-card)' : '#7ed957',
                    color: saving ? 'var(--text-muted)' : '#000',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: saving ? 'wait' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Persona'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Name" value={preview.name || ''} />
                <Field label="Slug" value={preview.slug || ''} />
                <Field label="Role" value={preview.role || ''} color={ROLE_COLORS[preview.role || '']} />
                <Field label="Level" value={preview.knowledge_level || ''} color={LEVEL_COLORS[preview.knowledge_level || '']} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Bio" value={preview.bio || ''} />
                </div>
                <Field label="Expertise" value={(preview.expertise || []).join(', ')} />
                <Field label="Groups" value={(preview.preferred_groups || []).join(', ')} />
                <Field label="Tone" value={preview.personality?.tone || ''} />
                <Field label="Verbosity" value={preview.personality?.verbosity || ''} />
                <Field label="Activity" value={preview.activity_level || ''} />
                <Field label="Followups" value={preview.personality?.asks_followups ? 'Yes' : 'No'} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== Topic Seeds Tab ==================== */}
      {tab === 'seeds' && (
        <div>
          {/* Add seed form */}
          <div
            style={{
              padding: 20,
              borderRadius: 16,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: 12 }}>Add Topic Seed</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Topic</label>
                <input
                  value={seedTopic}
                  onChange={e => setSeedTopic(e.target.value)}
                  placeholder="e.g. How to connect Stripe webhooks with 0nMCP"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Group</label>
                <select value={seedCategory} onChange={e => setSeedCategory(e.target.value)} style={selectStyle}>
                  <option value="">Any</option>
                  <option value="general">General</option>
                  <option value="help">Help</option>
                  <option value="tutorials">Tutorials</option>
                  <option value="workflows">Workflows</option>
                  <option value="integrations">Integrations</option>
                  <option value="showcase">Showcase</option>
                  <option value="feature-requests">Feature Requests</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <select value={seedPriority} onChange={e => setSeedPriority(Number(e.target.value))} style={selectStyle}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <button onClick={addSeed} style={btnStyle('#7ed957')}>Add</button>
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={labelStyle}>Prompt Hint (optional)</label>
              <input
                value={seedHint}
                onChange={e => setSeedHint(e.target.value)}
                placeholder="Extra context for AI generation..."
                style={inputStyle}
              />
            </div>
          </div>

          {/* Seeds list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {seeds.map(s => (
              <div
                key={s.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{
                  minWidth: 28, height: 28, borderRadius: 8,
                  background: `rgba(153,69,255,${Math.min(s.priority / 10, 1) * 0.3})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 900, color: '#9945ff',
                }}>
                  {s.priority}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{s.topic}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                    {s.category || 'any group'} &middot; used {s.used_count}x
                    {s.prompt_hint && <> &middot; hint: {s.prompt_hint.slice(0, 40)}...</>}
                  </div>
                </div>
              </div>
            ))}

            {seeds.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>No topic seeds yet</p>
                <p style={{ fontSize: '0.75rem' }}>Add seeds above to guide persona conversations</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== Activity Log Tab ==================== */}
      {tab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {activity.map(a => (
            <div
              key={a.id}
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: a.action === 'created_thread' ? 'rgba(153,69,255,0.15)' : 'rgba(0,212,255,0.15)',
                    color: a.action === 'created_thread' ? '#9945ff' : '#00d4ff',
                  }}
                >
                  {a.action === 'created_thread' ? 'New Thread' : 'Reply'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {a.persona_name || a.persona_id.slice(0, 8)}
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </div>
              {a.content_preview && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {a.content_preview}
                </p>
              )}
            </div>
          ))}

          {activity.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>No activity yet</p>
              <p style={{ fontSize: '0.75rem' }}>Persona conversations will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ==================== Shared Styles ====================

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: color || 'var(--text)' }}>{value || '—'}</div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      padding: '12px 20px',
      borderRadius: 12,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      textAlign: 'center',
      flex: 1,
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '7px 12px',
  borderRadius: 8,
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: '0.75rem',
  fontWeight: 600,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 12px',
  borderRadius: 8,
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: '0.75rem',
  fontWeight: 600,
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: 4,
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '8px 16px',
    borderRadius: 8,
    background: color + '18',
    color,
    border: 'none',
    fontWeight: 700,
    fontSize: '0.75rem',
    cursor: 'pointer',
  }
}

function btnStyleSmall(color: string): React.CSSProperties {
  return {
    padding: '3px 8px',
    borderRadius: 5,
    background: color + '15',
    color,
    border: 'none',
    fontWeight: 700,
    fontSize: '0.5625rem',
    cursor: 'pointer',
  }
}
