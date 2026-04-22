'use client'

import { useState, useEffect, useCallback } from 'react'

interface Personality {
  tone: string
  verbosity: string
  emoji_usage: string
  asks_followups: boolean
  writing_style?: string
  quirks?: string[]
  sentence_structure?: string
  vocabulary_level?: string
  punctuation_style?: string
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

interface QueueItem {
  id: string
  persona_slug: string
  content_type: string
  title: string | null
  status: string
  scheduled_at: string
  created_at: string
}

type Tab = 'personas' | 'generate' | 'seeds' | 'activity' | 'workflows' | 'queue'

const ROLE_COLORS: Record<string, string> = {
  developer: '#6EE05A',
  founder: '#9945ff',
  agency_owner: '#ff6b35',
  freelancer: '#00d4ff',
  devops: '#FFD700',
  data_engineer: '#ff69b4',
  student: '#84cc16',
  designer: '#e879f9',
  pm: '#fb923c',
  moderator: '#FFD700',
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

  // Queue state
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [queueLoading, setQueueLoading] = useState(false)

  // Workflow state
  const [workflowPersonas, setWorkflowPersonas] = useState<Array<{
    id: string; name: string; slug: string; role: string | null; is_active: boolean;
    activity_level: string; preferred_groups: string[];
    thread_count: number; reply_count: number;
    weekly_threads: number; weekly_replies: number;
    workflow_config: {
      enabled: boolean; threads_per_week: number; replies_per_week: number;
      preferred_groups: string[]; topics: string[];
    } | null;
  }>>([])
  const [workflowLoading, setWorkflowLoading] = useState(false)
  const [runningPersona, setRunningPersona] = useState<string | null>(null)
  const [runningAll, setRunningAll] = useState(false)

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

  const loadWorkflows = useCallback(async () => {
    setWorkflowLoading(true)
    try {
      const res = await fetch('/api/personas/workflows')
      if (res.ok) {
        const data = await res.json()
        setWorkflowPersonas(data.personas || [])
      }
    } catch {}
    setWorkflowLoading(false)
  }, [])

  useEffect(() => { loadPersonas() }, [loadPersonas])

  const loadQueue = useCallback(async () => {
    setQueueLoading(true)
    try {
      const res = await fetch('/api/personas?queue=true')
      if (res.ok) {
        const data = await res.json()
        if (data.queue) setQueue(data.queue)
      }
    } catch {}
    setQueueLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'seeds') loadSeeds()
    if (tab === 'activity') loadActivity()
    if (tab === 'workflows') loadWorkflows()
    if (tab === 'queue') loadQueue()
  }, [tab, loadSeeds, loadActivity, loadWorkflows, loadQueue])

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

  async function handleCreateModerator() {
    setGenerating(true)
    setMessage('')
    try {
      const res = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'moderator' }),
      })
      const data = await res.json()
      if (data.persona) {
        setMessage(`Moderator created: ${data.persona.name}`)
        loadPersonas()
      } else {
        setMessage(data.error || 'Failed to create moderator')
      }
    } catch {
      setMessage('Network error')
    }
    setGenerating(false)
  }

  async function handleGenerateCohort() {
    setGenerating(true)
    setMessage('Generating cohort — this takes a minute...')
    try {
      const res = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cohort', count: 6 }),
      })
      const data = await res.json()
      if (data.count > 0) {
        setMessage(`Cohort generated: ${data.count} personas created`)
        loadPersonas()
      } else {
        setMessage(data.error || 'Cohort generation failed')
      }
    } catch {
      setMessage('Network error')
    }
    setGenerating(false)
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

  async function updateWorkflowConfig(personaId: string, config: Record<string, unknown>) {
    try {
      const res = await fetch('/api/personas/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_config', persona_id: personaId, config }),
      })
      if (res.ok) {
        setMessage('Workflow config updated')
        loadWorkflows()
      } else {
        const data = await res.json()
        setMessage(data.error || 'Update failed')
      }
    } catch {
      setMessage('Network error')
    }
  }

  async function runPersonaWorkflow(personaId: string) {
    setRunningPersona(personaId)
    setMessage('')
    try {
      const res = await fetch('/api/personas/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_persona', persona_id: personaId }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`${data.persona}: Created ${data.results?.length || 0} items`)
        loadWorkflows()
        loadPersonas()
      } else {
        setMessage(data.error || 'Run failed')
      }
    } catch {
      setMessage('Network error')
    }
    setRunningPersona(null)
  }

  async function runAllWorkflows() {
    setRunningAll(true)
    setMessage('Running all persona workflows...')
    try {
      const res = await fetch('/api/personas/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_all' }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`Batch complete: ${data.ran} succeeded, ${data.failed} failed`)
        loadWorkflows()
        loadPersonas()
      } else {
        setMessage(data.error || 'Batch run failed')
      }
    } catch {
      setMessage('Network error')
    }
    setRunningAll(false)
  }

  if (loading) {
    return (
      <div className="px-8 pt-[120px] pb-16 text-center">
        <div className="font-mono text-[var(--accent)] text-[2rem] font-black">0n</div>
        <p className="text-[var(--text-secondary)] mt-2">Loading personas...</p>
      </div>
    )
  }

  return (
    <div className="px-8 pt-[100px] pb-16 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.75rem] font-black tracking-tight">AI Personas</h1>
          <p className="text-[var(--text-secondary)] text-[0.875rem]">
            Forum agents — generate characters, seed discussions, build community.
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleCreateModerator} disabled={generating} className="px-4 py-2 rounded-lg border-none font-bold text-[0.75rem] cursor-pointer text-[#FFD700] bg-[#FFD700]/10">
            Create Moderator
          </button>
          <button onClick={handleGenerateCohort} disabled={generating} className="px-4 py-2 rounded-lg border-none font-bold text-[0.75rem] cursor-pointer text-[#00d4ff] bg-[#00d4ff]/10">
            {generating ? 'Generating...' : 'Generate Cohort (6)'}
          </button>
          <button onClick={() => triggerConverse('seed_thread')} disabled={conversing} className="px-4 py-2 rounded-lg border-none font-bold text-[0.75rem] cursor-pointer text-[#9945ff] bg-[#9945ff]/10">
            {conversing ? 'Working...' : 'Seed Thread'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex justify-between items-center px-4 py-2.5 rounded-xl mb-4 text-[0.8125rem] font-semibold border ${
          message.includes('fail') || message.includes('error')
            ? 'bg-red-500/10 text-[#ff3d3d] border-red-500/20'
            : 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
        }`}>
          {message}
          <button onClick={() => setMessage('')} className="bg-transparent border-none text-inherit cursor-pointer">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border)]">
        {(['personas', 'generate', 'seeds', 'activity', 'workflows', 'queue'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 bg-transparent border-none border-b-2 font-[0.8125rem] cursor-pointer capitalize transition-all duration-150 ${
              tab === t
                ? 'border-[var(--accent)] text-[var(--accent)] font-bold border-solid'
                : 'border-transparent text-[var(--text-secondary)] font-medium'
            }`}
            style={{ borderBottomStyle: 'solid', fontSize: '0.8125rem' }}
          >
            {t === 'seeds' ? 'Topic Seeds' : t === 'activity' ? 'Activity Log' : t}
          </button>
        ))}
      </div>

      {/* ==================== Personas Tab ==================== */}
      {tab === 'personas' && (
        <div>
          {/* Stats row */}
          <div className="flex gap-3 mb-5">
            <StatBox label="Total" value={personas.length} color="var(--text-primary)" />
            <StatBox label="Active" value={personas.filter(p => p.is_active).length} color="#6EE05A" />
            <StatBox label="Threads" value={personas.reduce((s, p) => s + p.thread_count, 0)} color="#9945ff" />
            <StatBox label="Replies" value={personas.reduce((s, p) => s + p.reply_count, 0)} color="#00d4ff" />
          </div>

          {/* Persona grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
            {personas.map(p => (
              <div
                key={p.id}
                className={`px-5 py-4 rounded-2xl bg-[var(--bg-card)] border transition-opacity ${p.is_active ? 'opacity-100 border-[var(--border)]' : 'opacity-60 border-red-500/20'}`}
              >
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[0.875rem] font-black shrink-0"
                    style={{
                      background: `${ROLE_COLORS[p.role || ''] || '#484e78'}20`,
                      color: ROLE_COLORS[p.role || ''] || '#fff',
                    }}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[0.875rem]">{p.name}</div>
                    <div className="text-[0.6875rem] text-[var(--text-muted)]">
                      <span style={{ color: ROLE_COLORS[p.role || ''] || 'var(--text-muted)' }}>{p.role}</span>
                      {' '}&middot;{' '}
                      <span style={{ color: LEVEL_COLORS[p.knowledge_level] || 'var(--text-muted)' }}>{p.knowledge_level}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActive(p)}
                    className={`px-2.5 py-1 rounded font-bold text-[0.625rem] cursor-pointer border-none uppercase ${p.is_active ? 'bg-[#6EE05A]/10 text-[#6EE05A]' : 'bg-red-500/10 text-[#ff3d3d]'}`}
                  >
                    {p.is_active ? 'Active' : 'Off'}
                  </button>
                </div>

                {/* Bio */}
                {p.bio && (
                  <p className="text-[0.75rem] text-[var(--text-secondary)] my-2 leading-relaxed">
                    {p.bio}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {(p.expertise || []).slice(0, 4).map(tag => (
                    <span key={tag} className="text-[0.5625rem] px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-secondary)]">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Writing style badge */}
                {p.personality?.writing_style && (
                  <div className="text-[0.5625rem] px-1.5 py-0.5 rounded bg-[#9945ff]/10 text-[#9945ff] mb-2 inline-block">
                    {p.personality.writing_style}
                  </div>
                )}

                {/* Stats + personality */}
                <div className="flex justify-between items-center">
                  <div className="text-[0.625rem] text-[var(--text-muted)]">
                    {p.thread_count} threads &middot; {p.reply_count} replies
                    {p.personality && <> &middot; {p.personality.tone}</>}
                    {p.role === 'moderator' && <> &middot; <span className="text-[#FFD700] font-bold">MOD</span></>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => triggerConverse('seed_thread', p.id)}
                      disabled={conversing || !p.is_active}
                      className={`px-2 py-0.5 rounded font-bold text-[0.5625rem] cursor-pointer border-none bg-[#9945ff]/15 text-[#9945ff] ${!p.is_active ? 'opacity-50' : ''}`}
                    >
                      Post
                    </button>
                    <button
                      onClick={() => deletePersona(p.id)}
                      className="px-2 py-0.5 rounded font-bold text-[0.5625rem] cursor-pointer border-none bg-[#ff3d3d]/15 text-[#ff3d3d]"
                    >
                      Del
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {personas.length === 0 && (
              <div className="col-span-full p-10 text-center text-[var(--text-muted)]">
                <p className="text-[0.875rem] font-semibold">No personas yet</p>
                <p className="text-[0.75rem]">Go to the Generate tab to create your first one</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== Generate Tab ==================== */}
      {tab === 'generate' && (
        <div>
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] mb-5">
            <h3 className="text-[0.875rem] font-bold mb-1">Generate Persona</h3>
            <p className="text-[0.75rem] text-[var(--text-muted)] mb-4">
              Describe the kind of person you want. Example: &quot;A junior developer from Brazil who just discovered 0nMCP and is excited about automating their freelance client onboarding.&quot;
            </p>

            <textarea
              value={genPrompt}
              onChange={e => setGenPrompt(e.target.value)}
              placeholder="Describe the persona you want to create..."
              rows={4}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] text-[0.8125rem] leading-relaxed resize-y font-[inherit] mb-3 outline-none box-border"
            />

            <button
              onClick={handleGenerate}
              disabled={generating || !genPrompt.trim()}
              className={`px-6 py-2.5 rounded-xl border-none font-bold text-[0.875rem] cursor-pointer ${generating ? 'bg-[var(--bg-card)] text-[var(--text-muted)]' : 'bg-[var(--accent)] text-[var(--bg-primary)]'}`}
            >
              {generating ? 'Generating with Claude...' : 'Generate Persona'}
            </button>
          </div>

          {/* Preview */}
          {preview && (
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--accent)]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[0.875rem] font-bold text-[var(--accent)]">Preview</h3>
                <button
                  onClick={handleSavePersona}
                  disabled={saving}
                  className={`px-5 py-2 rounded-xl border-none font-bold text-[0.8125rem] cursor-pointer ${saving ? 'bg-[var(--bg-card)] text-[var(--text-muted)]' : 'bg-[#6EE05A] text-black'}`}
                >
                  {saving ? 'Saving...' : 'Save Persona'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Name" value={preview.name || ''} />
                <Field label="Slug" value={preview.slug || ''} />
                <Field label="Role" value={preview.role || ''} color={ROLE_COLORS[preview.role || '']} />
                <Field label="Level" value={preview.knowledge_level || ''} color={LEVEL_COLORS[preview.knowledge_level || '']} />
                <div className="col-span-2">
                  <Field label="Bio" value={preview.bio || ''} />
                </div>
                <Field label="Expertise" value={(preview.expertise || []).join(', ')} />
                <Field label="Groups" value={(preview.preferred_groups || []).join(', ')} />
                <Field label="Tone" value={preview.personality?.tone || ''} />
                <Field label="Verbosity" value={preview.personality?.verbosity || ''} />
                <Field label="Activity" value={preview.activity_level || ''} />
                <Field label="Followups" value={preview.personality?.asks_followups ? 'Yes' : 'No'} />
                <Field label="Writing Style" value={preview.personality?.writing_style || ''} color="#9945ff" />
                <Field label="Sentences" value={preview.personality?.sentence_structure || ''} />
                <Field label="Vocabulary" value={preview.personality?.vocabulary_level || ''} />
                <Field label="Punctuation" value={preview.personality?.punctuation_style || ''} />
                <div className="col-span-2">
                  <Field label="Quirks" value={(preview.personality?.quirks || []).join(' / ')} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== Topic Seeds Tab ==================== */}
      {tab === 'seeds' && (
        <div>
          {/* Add seed form */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] mb-5">
            <h3 className="text-[0.8125rem] font-bold mb-3">Add Topic Seed</h3>
            <div className="flex gap-2 flex-wrap items-end">
              <div className="flex-[2_2_0%]">
                <label className="block text-[0.6875rem] text-[var(--text-muted)] mb-1">Topic</label>
                <input
                  value={seedTopic}
                  onChange={e => setSeedTopic(e.target.value)}
                  placeholder="e.g. How to connect Stripe webhooks with 0nMCP"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-[0.75rem] font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-[0.6875rem] text-[var(--text-muted)] mb-1">Group</label>
                <select value={seedCategory} onChange={e => setSeedCategory(e.target.value)} className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-[0.75rem] font-semibold">
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
                <label className="block text-[0.6875rem] text-[var(--text-muted)] mb-1">Priority</label>
                <select value={seedPriority} onChange={e => setSeedPriority(Number(e.target.value))} className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-[0.75rem] font-semibold">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <button onClick={addSeed} className="px-4 py-2 rounded-lg border-none font-bold text-[0.75rem] cursor-pointer text-[#6EE05A] bg-[#6EE05A]/10">Add</button>
            </div>
            <div className="mt-2">
              <label className="block text-[0.6875rem] text-[var(--text-muted)] mb-1">Prompt Hint (optional)</label>
              <input
                value={seedHint}
                onChange={e => setSeedHint(e.target.value)}
                placeholder="Extra context for AI generation..."
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-[0.75rem] font-semibold outline-none"
              />
            </div>
          </div>

          {/* Seeds list */}
          <div className="flex flex-col gap-1.5">
            {seeds.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                <div
                  className="min-w-[28px] h-7 rounded-lg flex items-center justify-center text-[0.75rem] font-black text-[#9945ff] shrink-0"
                  style={{ background: `rgba(153,69,255,${Math.min(s.priority / 10, 1) * 0.3})` }}
                >
                  {s.priority}
                </div>
                <div className="flex-1">
                  <div className="text-[0.8125rem] font-semibold">{s.topic}</div>
                  <div className="text-[0.625rem] text-[var(--text-muted)]">
                    {s.category || 'any group'} &middot; used {s.used_count}x
                    {s.prompt_hint && <> &middot; hint: {s.prompt_hint.slice(0, 40)}...</>}
                  </div>
                </div>
              </div>
            ))}

            {seeds.length === 0 && (
              <div className="p-10 text-center text-[var(--text-muted)]">
                <p className="text-[0.875rem] font-semibold">No topic seeds yet</p>
                <p className="text-[0.75rem]">Add seeds above to guide persona conversations</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== Activity Log Tab ==================== */}
      {tab === 'activity' && (
        <div className="flex flex-col gap-1.5">
          {activity.map(a => (
            <div key={a.id} className="px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[0.5625rem] font-bold uppercase px-1.5 py-0.5 rounded ${
                    a.action === 'created_thread'
                      ? 'bg-[#9945ff]/15 text-[#9945ff]'
                      : 'bg-[#00d4ff]/15 text-[#00d4ff]'
                  }`}
                >
                  {a.action === 'created_thread' ? 'New Thread' : 'Reply'}
                </span>
                <span className="text-[0.75rem] font-semibold">
                  {a.persona_name || a.persona_id.slice(0, 8)}
                </span>
                <span className="text-[0.625rem] text-[var(--text-muted)] ml-auto">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </div>
              {a.content_preview && (
                <p className="text-[0.75rem] text-[var(--text-secondary)] m-0">
                  {a.content_preview}
                </p>
              )}
            </div>
          ))}

          {activity.length === 0 && (
            <div className="p-10 text-center text-[var(--text-muted)]">
              <p className="text-[0.875rem] font-semibold">No activity yet</p>
              <p className="text-[0.75rem]">Persona conversations will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== Workflows Tab ==================== */}
      {tab === 'workflows' && (
        <div>
          {/* Batch actions bar */}
          <div className="flex items-center gap-2 mb-5 px-5 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)]">
            <div className="flex-1">
              <div className="text-[0.875rem] font-bold">Persona Workflows</div>
              <div className="text-[0.6875rem] text-[var(--text-muted)]">
                Configure posting schedules per persona. Run individually or batch.
              </div>
            </div>
            <button onClick={runAllWorkflows} disabled={runningAll} className="px-4 py-2 rounded-lg border-none font-bold text-[0.75rem] cursor-pointer text-[#6EE05A] bg-[#6EE05A]/10">
              {runningAll ? 'Running...' : 'Run All Enabled'}
            </button>
            <button
              onClick={() => {
                const enabled = workflowPersonas.filter(p => p.workflow_config?.enabled && p.is_active)
                if (enabled.length === 0) { setMessage('No enabled workflows'); return }
                fetch('/api/personas/workflows', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'batch_threads', persona_ids: enabled.map(p => p.id), count: 1 }),
                }).then(r => r.json()).then(data => {
                  setMessage(`Batch threads: ${data.created || 0} created`)
                  loadWorkflows()
                  loadPersonas()
                }).catch(() => setMessage('Batch failed'))
              }}
              disabled={runningAll}
              className="px-4 py-2 rounded-lg border-none font-bold text-[0.75rem] cursor-pointer text-[#9945ff] bg-[#9945ff]/10"
            >
              Batch Threads
            </button>
          </div>

          {workflowLoading ? (
            <div className="text-center p-10 text-[var(--text-muted)]">Loading workflows...</div>
          ) : (
            <div className="flex flex-col gap-2">
              {workflowPersonas.filter(p => p.is_active).map(p => {
                const config = p.workflow_config || { enabled: false, threads_per_week: 2, replies_per_week: 5, preferred_groups: p.preferred_groups || [], topics: [] }
                const isRunning = runningPersona === p.id
                return (
                  <div
                    key={p.id}
                    className={`px-5 py-4 rounded-[14px] bg-[var(--bg-card)] border transition-opacity ${config.enabled ? 'border-[#6EE05A]/20 opacity-100' : 'border-[var(--border)] opacity-70'}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar initial */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[0.875rem] font-black shrink-0"
                        style={{
                          background: `${ROLE_COLORS[p.role || ''] || '#484e78'}20`,
                          color: ROLE_COLORS[p.role || ''] || '#fff',
                        }}
                      >
                        {p.name.charAt(0)}
                      </div>

                      {/* Name + role */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[0.8125rem]">{p.name}</div>
                        <div className="text-[0.625rem] text-[var(--text-muted)]">
                          <span style={{ color: ROLE_COLORS[p.role || ''] || 'var(--text-muted)' }}>{p.role}</span>
                          {' '}&middot; {p.activity_level}
                        </div>
                      </div>

                      {/* Weekly stats */}
                      <div className="text-center px-3">
                        <div className="text-[0.875rem] font-black text-[#9945ff]">{p.weekly_threads}</div>
                        <div className="text-[0.5rem] text-[var(--text-muted)] uppercase">threads/wk</div>
                      </div>
                      <div className="text-center px-3">
                        <div className="text-[0.875rem] font-black text-[#00d4ff]">{p.weekly_replies}</div>
                        <div className="text-[0.5rem] text-[var(--text-muted)] uppercase">replies/wk</div>
                      </div>

                      {/* Schedule controls */}
                      <div className="flex items-center gap-1.5">
                        <label className="text-[0.5625rem] text-[var(--text-muted)]">T/wk</label>
                        <select
                          value={config.threads_per_week}
                          onChange={e => updateWorkflowConfig(p.id, { ...config, threads_per_week: Number(e.target.value) })}
                          className="w-[52px] px-1.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-[0.75rem]"
                        >
                          {[0, 1, 2, 3, 5, 7, 10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <label className="text-[0.5625rem] text-[var(--text-muted)]">R/wk</label>
                        <select
                          value={config.replies_per_week}
                          onChange={e => updateWorkflowConfig(p.id, { ...config, replies_per_week: Number(e.target.value) })}
                          className="w-[52px] px-1.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-[0.75rem]"
                        >
                          {[0, 1, 2, 3, 5, 7, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>

                      {/* Enable toggle */}
                      <button
                        onClick={() => updateWorkflowConfig(p.id, { ...config, enabled: !config.enabled })}
                        className={`px-2.5 py-1 rounded font-bold text-[0.5625rem] cursor-pointer border-none uppercase min-w-[48px] ${config.enabled ? 'bg-[#6EE05A]/15 text-[#6EE05A]' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}
                      >
                        {config.enabled ? 'ON' : 'OFF'}
                      </button>

                      {/* Run now */}
                      <button
                        onClick={() => runPersonaWorkflow(p.id)}
                        disabled={isRunning || runningAll}
                        className={`px-2 py-0.5 rounded font-bold text-[0.5625rem] cursor-pointer border-none bg-[#ff6b35]/15 text-[#ff6b35] ${isRunning || runningAll ? 'opacity-50' : ''}`}
                      >
                        {isRunning ? '...' : 'Run'}
                      </button>
                    </div>

                    {/* Groups row */}
                    <div className="flex flex-wrap gap-0.5 mt-2">
                      {(p.preferred_groups || []).map(g => (
                        <span key={g} className="text-[0.5rem] px-1.5 py-px rounded bg-[var(--bg-card)] text-[var(--text-muted)]">
                          {g}
                        </span>
                      ))}
                      <span className="text-[0.5rem] text-[var(--text-muted)] ml-1">
                        Total: {p.thread_count}t / {p.reply_count}r
                      </span>
                    </div>
                  </div>
                )
              })}

              {workflowPersonas.filter(p => p.is_active).length === 0 && (
                <div className="p-10 text-center text-[var(--text-muted)]">
                  <p className="text-[0.875rem] font-semibold">No active personas</p>
                  <p className="text-[0.75rem]">Create and activate personas first</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== Queue Tab ==================== */}
      {tab === 'queue' && (
        <div>
          {/* Stats */}
          <div className="flex gap-3 mb-5">
            <StatBox label="Queued" value={queue.filter(q => q.status === 'queued').length} color="#9945ff" />
            <StatBox label="Posted" value={queue.filter(q => q.status === 'posted').length} color="#6EE05A" />
            <StatBox label="Failed" value={queue.filter(q => q.status === 'failed').length} color="#ff3d3d" />
          </div>

          {queueLoading ? (
            <div className="text-center p-10 text-[var(--text-muted)]">Loading queue...</div>
          ) : queue.length === 0 ? (
            <div className="p-10 text-center text-[var(--text-muted)]">
              <p className="text-[0.875rem] font-semibold">Content queue is empty</p>
              <p className="text-[0.75rem]">Scheduled persona content will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {queue.map(item => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
                  {/* Status badge */}
                  <span
                    className={`text-[0.5625rem] font-bold uppercase px-1.5 py-0.5 rounded min-w-[48px] text-center ${
                      item.status === 'queued'
                        ? 'bg-[#9945ff]/15 text-[#9945ff]'
                        : item.status === 'posted'
                        ? 'bg-[#6EE05A]/15 text-[#6EE05A]'
                        : 'bg-red-500/15 text-[#ff3d3d]'
                    }`}
                  >
                    {item.status}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.8125rem] font-semibold truncate">
                      {item.title || 'Untitled'}
                    </div>
                    <div className="text-[0.625rem] text-[var(--text-muted)]">
                      {item.persona_slug} &middot; {item.content_type} &middot; {new Date(item.scheduled_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Actions */}
                  {item.status === 'queued' && (
                    <button
                      onClick={async () => {
                        await fetch('/api/personas', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ _action: 'cancel_queue', id: item.id }),
                        })
                        loadQueue()
                      }}
                      className="px-2 py-0.5 rounded font-bold text-[0.5625rem] cursor-pointer border-none bg-[#ff3d3d]/15 text-[#ff3d3d]"
                    >
                      Cancel
                    </button>
                  )}
                  {item.status === 'failed' && (
                    <button
                      onClick={async () => {
                        await fetch('/api/personas', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ _action: 'retry_queue', id: item.id }),
                        })
                        loadQueue()
                      }}
                      className="px-2 py-0.5 rounded font-bold text-[0.5625rem] cursor-pointer border-none bg-[#ff6b35]/15 text-[#ff6b35]"
                    >
                      Retry
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ==================== Shared Components ====================

function Field({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[0.625rem] text-[var(--text-muted)] uppercase tracking-[0.05em] mb-0.5">{label}</div>
      <div className="text-[0.8125rem] font-semibold" style={{ color: color || 'var(--text-primary)' }}>{value || '—'}</div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="px-5 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center flex-1">
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
      <div className="text-[0.625rem] text-[var(--text-muted)] uppercase tracking-[0.1em]">{label}</div>
    </div>
  )
}
