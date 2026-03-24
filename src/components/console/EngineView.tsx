'use client'

/**
 * 0nEngine — Agentic AI Builder
 *
 * Not a workflow builder. An intelligent agent factory.
 * Each agent connects to Knowledge Bases + 0nMCP's 1,229 tools.
 *
 * Flow: Create → Configure KB → Define Actions → Set Personality → Deploy
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Cpu, Plus, Play, Trash2, ChevronRight,
  Zap, CheckCircle2, AlertCircle,
  MessageSquare, Loader2,
  BookOpen, Bot, LayoutDashboard, Settings, Layers,
} from 'lucide-react'
import { AppShell, type AppNavItem } from './AppShell'

interface Agent {
  id: string
  name: string
  description?: string
  status: string
  locationId?: string
  versions?: Array<{ id: string; status: string }>
  createdAt?: string
}

interface KnowledgeBase {
  id: string
  name: string
  description?: string
}

type Tab = 'agents' | 'create' | 'knowledge' | 'execute'

export function EngineView() {
  const [tab, setTab] = useState<Tab>('agents')
  const [agents, setAgents] = useState<Agent[]>([])
  const [knowledgeBases, setKBs] = useState<KnowledgeBase[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create agent form
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newKBName, setNewKBName] = useState('')
  const [newKBDesc, setNewKBDesc] = useState('')
  const [creating, setCreating] = useState(false)

  // Execute
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([])
  const [executionId, setExecutionId] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/console/agent-studio/agents')
      if (res.ok) {
        const data = await res.json()
        setAgents(data.agents || data || [])
      }
    } catch { /* silent */ }
  }, [])

  const fetchKBs = useCallback(async () => {
    try {
      const res = await fetch('/api/console/crm/knowledge-bases')
      if (res.ok) {
        const data = await res.json()
        setKBs(data.knowledgeBases || data || [])
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchAgents()
    fetchKBs()
  }, [fetchAgents, fetchKBs])

  const createAgent = async () => {
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/console/agent-studio/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDesc }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setNewName('')
      setNewDesc('')
      setTab('agents')
      fetchAgents()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create agent')
    } finally {
      setCreating(false)
    }
  }

  const createKB = async () => {
    if (!newKBName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/console/crm/knowledge-bases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKBName, description: newKBDesc }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      setNewKBName('')
      setNewKBDesc('')
      fetchKBs()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create KB')
    } finally {
      setCreating(false)
    }
  }

  const executeAgent = async () => {
    if (!selectedAgent || !chatInput.trim()) return
    setExecuting(true)
    const userMsg = chatInput
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatInput('')

    try {
      const res = await fetch('/api/console/agent-studio/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          message: userMsg,
          executionId: executionId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Execution failed')

      if (data.executionId) setExecutionId(data.executionId)
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.message || data.output || JSON.stringify(data),
      }])
    } catch (err: unknown) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }])
    } finally {
      setExecuting(false)
    }
  }

  const S = {
    body: { flex: 1, overflow: 'auto', padding: '20px 24px' },
    card: {
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px', padding: '16px', marginBottom: '12px',
    },
    input: {
      width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
      color: '#e8e8ef', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
    },
    btn: (primary?: boolean) => ({
      padding: '10px 20px', borderRadius: '10px', border: 'none', fontSize: '13px',
      fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
      background: primary ? '#6EE05A' : 'rgba(255,255,255,0.08)',
      color: primary ? '#0B0F19' : '#aaa',
    }),
    badge: (color: string) => ({
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
      textTransform: 'uppercase' as const, letterSpacing: '0.05em',
      background: `${color}22`, color, border: `1px solid ${color}44`,
    }),
  }

  const engineNav: AppNavItem[] = [
    { key: 'agents', label: 'My Agents', icon: <Bot size={16} />, count: agents.length },
    { key: 'create', label: 'Create Agent', icon: <Plus size={16} /> },
    { key: 'knowledge', label: 'Knowledge Bases', icon: <BookOpen size={16} />, count: knowledgeBases.length },
    { key: 'execute', label: 'Test Agent', icon: <Play size={16} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ]

  const engineLogo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6EE05A, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Cpu size={18} color="#0B0F19" />
      </div>
      <span style={{ fontSize: '16px', fontWeight: 800, color: '#e8e8ef' }}>0nEngine</span>
    </div>
  )

  return (
    <AppShell config={{
      appName: '0nEngine',
      logo: engineLogo,
      ctaLabel: '+ Create Agent',
      onCta: () => setTab('create'),
      breadcrumb: `/ ${tab === 'agents' ? 'My Agents' : tab === 'create' ? 'Create' : tab === 'knowledge' ? 'Knowledge Bases' : tab === 'execute' ? 'Test' : tab}`,
      sectionLabel: 'MODULES',
      navItems: engineNav,
      activeNav: tab,
      onNav: (key) => setTab(key as Tab),
    }}>

      {/* Error */}
      {error && (
        <div style={{ margin: '12px 24px 0', padding: '10px 14px', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '8px', color: '#ff8080', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Body */}
      <div style={S.body}>

        {/* ── Agents List ──────────────────────────────── */}
        {tab === 'agents' && (
          <div>
            {agents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
                <Cpu size={40} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#888', marginBottom: '4px' }}>No agents yet</p>
                <p style={{ fontSize: '12px', color: '#555' }}>Create your first agentic AI — it connects to your Knowledge Base and 1,229 tools.</p>
                <button onClick={() => setTab('create')} style={{ ...S.btn(true), marginTop: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={14} /> Create Agent</span>
                </button>
              </div>
            ) : (
              agents.map(agent => (
                <div key={agent.id} style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Bot size={16} style={{ color: '#6EE05A' }} />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ef' }}>{agent.name}</span>
                        <span style={S.badge(agent.status === 'active' ? '#6EE05A' : '#f59e0b')}>
                          {agent.status}
                        </span>
                      </div>
                      {agent.description && <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>{agent.description}</p>}
                    </div>
                    <button
                      onClick={() => { setSelectedAgent(agent); setChatMessages([]); setExecutionId(null); setTab('execute') }}
                      style={{ ...S.btn(), padding: '6px 12px', fontSize: '11px' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Play size={12} /> Test</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Create Agent ─────────────────────────────── */}
        {tab === 'create' && (
          <div style={{ maxWidth: '560px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e8e8ef', marginBottom: '16px' }}>Create a New Agent</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Agent Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., Sales Assistant, Support Agent, Lead Qualifier" style={S.input} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describe what this agent does — what it knows, how it thinks, what actions it can take..." rows={4} style={{ ...S.input, resize: 'vertical' as const }} />
            </div>

            <div style={{ ...S.card, background: 'rgba(126,217,87,0.05)', borderColor: 'rgba(126,217,87,0.15)' }}>
              <p style={{ fontSize: '12px', color: '#6EE05A', fontWeight: 600, margin: '0 0 6px' }}>What happens when you create an agent:</p>
              <div style={{ fontSize: '11px', color: '#888', lineHeight: 1.8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={12} style={{ color: '#6EE05A' }} /> Agent created in your CRM sub-location</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={12} style={{ color: '#6EE05A' }} /> Connected to 0nMCP&apos;s 1,229 tools via MCP Server</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={12} style={{ color: '#6EE05A' }} /> Attach Knowledge Bases for business-specific intelligence</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={12} style={{ color: '#6EE05A' }} /> Deploy to production when ready</div>
              </div>
            </div>

            <button onClick={createAgent} disabled={creating || !newName.trim()} style={{ ...S.btn(true), opacity: creating || !newName.trim() ? 0.5 : 1, marginTop: '12px', width: '100%' }}>
              {creating ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</> : <><Cpu size={14} /> Create Agent</>}
            </button>
          </div>
        )}

        {/* ── Knowledge Bases ──────────────────────────── */}
        {tab === 'knowledge' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e8e8ef', margin: 0 }}>Knowledge Bases</h3>
                <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0' }}>Your agent&apos;s brain — trained on your business data (max 15)</p>
              </div>
              <span style={{ fontSize: '11px', color: '#555' }}>{knowledgeBases.length}/15</span>
            </div>

            {knowledgeBases.map(kb => (
              <div key={kb.id} style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} style={{ color: '#00d4ff' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e8e8ef' }}>{kb.name}</span>
                </div>
                {kb.description && <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0 24px' }}>{kb.description}</p>}
              </div>
            ))}

            <div style={{ ...S.card, borderStyle: 'dashed' }}>
              <p style={{ fontSize: '12px', color: '#888', fontWeight: 600, margin: '0 0 10px' }}>Create Knowledge Base</p>
              <input value={newKBName} onChange={e => setNewKBName(e.target.value)} placeholder="Knowledge base name (e.g., Product FAQ)" style={{ ...S.input, marginBottom: '8px' }} />
              <input value={newKBDesc} onChange={e => setNewKBDesc(e.target.value)} placeholder="Description (optional)" style={{ ...S.input, marginBottom: '10px' }} />
              <button onClick={createKB} disabled={creating || !newKBName.trim()} style={{ ...S.btn(true), opacity: creating || !newKBName.trim() ? 0.5 : 1 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={12} /> Create KB</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Execute / Test Agent ──────────────────────── */}
        {tab === 'execute' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Agent selector */}
            {!selectedAgent ? (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#e8e8ef', marginBottom: '12px' }}>Select an agent to test</h3>
                {agents.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAgent(a); setChatMessages([]); setExecutionId(null) }}
                    style={{ ...S.card, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left' as const }}
                  >
                    <Bot size={18} style={{ color: '#6EE05A' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#e8e8ef' }}>{a.name}</div>
                      {a.description && <div style={{ fontSize: '11px', color: '#666' }}>{a.description}</div>}
                    </div>
                    <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#444' }} />
                  </button>
                ))}
                {agents.length === 0 && (
                  <p style={{ color: '#555', fontSize: '13px' }}>No agents created yet. <button onClick={() => setTab('create')} style={{ color: '#6EE05A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>Create one first</button>.</p>
                )}
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Bot size={20} style={{ color: '#6EE05A' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ef' }}>{selectedAgent.name}</span>
                    {executionId && <span style={{ fontSize: '10px', color: '#555', marginLeft: '8px', fontFamily: 'monospace' }}>session: {executionId.slice(0, 12)}...</span>}
                  </div>
                  <button onClick={() => { setSelectedAgent(null); setChatMessages([]); setExecutionId(null) }} style={{ ...S.btn(), padding: '4px 10px', fontSize: '11px' }}>
                    Switch
                  </button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflow: 'auto', marginBottom: '12px' }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>
                      <MessageSquare size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
                      <p style={{ fontSize: '13px' }}>Send a message to test your agent</p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
                      <div style={{
                        maxWidth: '80%', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const,
                        background: msg.role === 'user' ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.05)',
                        color: msg.role === 'user' ? '#c8e8b8' : '#ccc',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                        borderBottomLeftRadius: msg.role === 'user' ? '12px' : '4px',
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {executing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '12px', padding: '8px' }}>
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Agent is thinking...
                    </div>
                  )}
                </div>

                {/* Input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); executeAgent() } }}
                    placeholder="Send a message to your agent..."
                    style={{ ...S.input, flex: 1 }}
                    disabled={executing}
                  />
                  <button onClick={executeAgent} disabled={executing || !chatInput.trim()} style={{ ...S.btn(true), opacity: executing || !chatInput.trim() ? 0.5 : 1 }}>
                    <Zap size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
