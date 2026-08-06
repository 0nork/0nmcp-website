'use client'

/**
 * 0nEngine — Agentic AI Builder
 *
 * Not a workflow builder. An intelligent agent factory.
 * Each agent connects to Knowledge Bases + 0nMCP's 1,598+ tools.
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

  const engineNav: AppNavItem[] = [
    { key: 'agents', label: 'My Agents', icon: <Bot size={16} />, count: agents.length },
    { key: 'create', label: 'Create Agent', icon: <Plus size={16} /> },
    { key: 'knowledge', label: 'Knowledge Bases', icon: <BookOpen size={16} />, count: knowledgeBases.length },
    { key: 'execute', label: 'Test Agent', icon: <Play size={16} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ]

  const engineLogo = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6EE05A] to-[#00d4ff] flex items-center justify-center">
        <Cpu size={18} color="#0B0F19" />
      </div>
      <span className="text-base font-extrabold text-[var(--text-primary)]">0nEngine</span>
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
        <div className="mx-6 mt-3 py-2.5 px-3.5 bg-[rgba(255,80,80,0.1)] border border-[rgba(255,80,80,0.2)] rounded-lg text-[#ff8080] text-xs flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-auto py-5 px-6">

        {/* ── Agents List ──────────────────────────────── */}
        {tab === 'agents' && (
          <div>
            {agents.length === 0 ? (
              <div className="text-center py-[60px] px-5 text-[var(--text-muted)]">
                <Cpu size={40} className="opacity-30 mb-4 mx-auto" />
                <p className="text-[15px] font-semibold text-[var(--text-muted)] mb-1">No agents yet</p>
                <p className="text-xs text-[var(--text-muted)]">Create your first agentic AI — it connects to your Knowledge Base and 1,598+ tools.</p>
                <button
                  onClick={() => setTab('create')}
                  className="mt-4 py-2.5 px-5 rounded-[10px] border-none text-[13px] font-bold cursor-pointer font-[inherit] transition-all duration-150 bg-[#6EE05A] text-[#0B0F19]"
                >
                  <span className="flex items-center gap-1.5"><Plus size={14} /> Create Agent</span>
                </button>
              </div>
            ) : (
              agents.map(agent => (
                <div key={agent.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Bot size={16} className="text-[#6EE05A]" />
                        <span className="text-sm font-bold text-[var(--text-primary)]">{agent.name}</span>
                        <span
                          className="inline-flex items-center gap-1 py-0.5 px-2 rounded-md text-[10px] font-bold uppercase tracking-[0.05em]"
                          style={{
                            background: `${agent.status === 'active' ? '#6EE05A' : '#f59e0b'}22`,
                            color: agent.status === 'active' ? '#6EE05A' : '#f59e0b',
                            border: `1px solid ${agent.status === 'active' ? '#6EE05A' : '#f59e0b'}44`,
                          }}
                        >
                          {agent.status}
                        </span>
                      </div>
                      {agent.description && <p className="text-xs text-[var(--text-muted)] mt-1 mb-0">{agent.description}</p>}
                    </div>
                    <button
                      onClick={() => { setSelectedAgent(agent); setChatMessages([]); setExecutionId(null); setTab('execute') }}
                      className="py-1.5 px-3 rounded-[10px] border-none text-[11px] font-bold cursor-pointer font-[inherit] transition-all duration-150 bg-[var(--border)] text-[#aaa]"
                    >
                      <span className="flex items-center gap-1"><Play size={12} /> Test</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Create Agent ─────────────────────────────── */}
        {tab === 'create' && (
          <div className="max-w-[560px]">
            <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-4">Create a New Agent</h3>
            <div className="mb-3">
              <label className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-[0.05em] block mb-1.5">Agent Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g., Sales Assistant, Support Agent, Lead Qualifier"
                className="w-full py-2.5 px-3.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[13px] outline-none font-[inherit]"
              />
            </div>
            <div className="mb-4">
              <label className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-[0.05em] block mb-1.5">Description</label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Describe what this agent does — what it knows, how it thinks, what actions it can take..."
                rows={4}
                className="w-full py-2.5 px-3.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[13px] outline-none font-[inherit] resize-y"
              />
            </div>

            <div className="bg-[rgba(126,217,87,0.05)] border border-[rgba(126,217,87,0.15)] rounded-xl p-4 mb-3">
              <p className="text-xs text-[#6EE05A] font-semibold mt-0 mb-1.5">What happens when you create an agent:</p>
              <div className="text-[11px] text-[var(--text-muted)] leading-[1.8]">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#6EE05A]" /> Agent created in your CRM sub-location</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#6EE05A]" /> Connected to 0nMCP&apos;s 1,598+ tools via MCP Server</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#6EE05A]" /> Attach Knowledge Bases for business-specific intelligence</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#6EE05A]" /> Deploy to production when ready</div>
              </div>
            </div>

            <button
              onClick={createAgent}
              disabled={creating || !newName.trim()}
              className={[
                'py-2.5 px-5 rounded-[10px] border-none text-[13px] font-bold cursor-pointer font-[inherit] transition-all duration-150 bg-[#6EE05A] text-[#0B0F19] mt-3 w-full',
                creating || !newName.trim() ? 'opacity-50' : 'opacity-100',
              ].join(' ')}
            >
              {creating ? <><Loader2 size={14} className="animate-spin inline mr-1" /> Creating...</> : <><Cpu size={14} className="inline mr-1" /> Create Agent</>}
            </button>
          </div>
        )}

        {/* ── Knowledge Bases ──────────────────────────── */}
        {tab === 'knowledge' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-[var(--text-primary)] m-0">Knowledge Bases</h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 mb-0">Your agent&apos;s brain — trained on your business data (max 15)</p>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">{knowledgeBases.length}/15</span>
            </div>

            {knowledgeBases.map(kb => (
              <div key={kb.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[#00d4ff]" />
                  <span className="text-[13px] font-semibold text-[var(--text-primary)]">{kb.name}</span>
                </div>
                {kb.description && <p className="text-[11px] text-[var(--text-muted)] mt-1 mb-0 ml-6">{kb.description}</p>}
              </div>
            ))}

            <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border)] rounded-xl p-4">
              <p className="text-xs text-[var(--text-muted)] font-semibold mt-0 mb-2.5">Create Knowledge Base</p>
              <input
                value={newKBName}
                onChange={e => setNewKBName(e.target.value)}
                placeholder="Knowledge base name (e.g., Product FAQ)"
                className="w-full py-2.5 px-3.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[13px] outline-none font-[inherit] mb-2"
              />
              <input
                value={newKBDesc}
                onChange={e => setNewKBDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full py-2.5 px-3.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[13px] outline-none font-[inherit] mb-2.5"
              />
              <button
                onClick={createKB}
                disabled={creating || !newKBName.trim()}
                className={[
                  'py-2.5 px-5 rounded-[10px] border-none text-[13px] font-bold cursor-pointer font-[inherit] transition-all duration-150 bg-[#6EE05A] text-[#0B0F19]',
                  creating || !newKBName.trim() ? 'opacity-50' : 'opacity-100',
                ].join(' ')}
              >
                <span className="flex items-center gap-1.5"><Plus size={12} /> Create KB</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Execute / Test Agent ──────────────────────── */}
        {tab === 'execute' && (
          <div className="flex flex-col h-full">
            {/* Agent selector */}
            {!selectedAgent ? (
              <div>
                <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-3">Select an agent to test</h3>
                {agents.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAgent(a); setChatMessages([]); setExecutionId(null) }}
                    className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-3 cursor-pointer flex items-center gap-2.5 w-full text-left"
                  >
                    <Bot size={18} className="text-[#6EE05A]" />
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--text-primary)]">{a.name}</div>
                      {a.description && <div className="text-[11px] text-[var(--text-muted)]">{a.description}</div>}
                    </div>
                    <ChevronRight size={14} className="ml-auto text-[#444]" />
                  </button>
                ))}
                {agents.length === 0 && (
                  <p className="text-[var(--text-muted)] text-[13px]">
                    No agents created yet.{' '}
                    <button
                      onClick={() => setTab('create')}
                      className="text-[#6EE05A] bg-none border-none cursor-pointer font-[inherit] underline"
                    >
                      Create one first
                    </button>.
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border)]">
                  <Bot size={20} className="text-[#6EE05A]" />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{selectedAgent.name}</span>
                    {executionId && <span className="text-[10px] text-[var(--text-muted)] ml-2 font-mono">session: {executionId.slice(0, 12)}...</span>}
                  </div>
                  <button
                    onClick={() => { setSelectedAgent(null); setChatMessages([]); setExecutionId(null) }}
                    className="py-1 px-2.5 rounded-[10px] border-none text-[11px] font-bold cursor-pointer font-[inherit] transition-all duration-150 bg-[var(--border)] text-[#aaa]"
                  >
                    Switch
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto mb-3">
                  {chatMessages.length === 0 && (
                    <div className="text-center p-10 text-[#444]">
                      <MessageSquare size={28} className="opacity-30 mb-2 mx-auto" />
                      <p className="text-[13px]">Send a message to test your agent</p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex mb-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={[
                          'max-w-[80%] py-2.5 px-3.5 text-[13px] leading-relaxed whitespace-pre-wrap',
                          msg.role === 'user'
                            ? 'bg-[rgba(126,217,87,0.15)] text-[#c8e8b8] rounded-xl rounded-br-sm'
                            : 'bg-[var(--bg-card)] text-[#ccc] rounded-xl rounded-bl-sm',
                        ].join(' ')}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {executing && (
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs p-2">
                      <Loader2 size={14} className="animate-spin" /> Agent is thinking...
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); executeAgent() } }}
                    placeholder="Send a message to your agent..."
                    className="flex-1 py-2.5 px-3.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-[13px] outline-none font-[inherit]"
                    disabled={executing}
                  />
                  <button
                    onClick={executeAgent}
                    disabled={executing || !chatInput.trim()}
                    className={[
                      'py-2.5 px-5 rounded-[10px] border-none text-[13px] font-bold cursor-pointer font-[inherit] transition-all duration-150 bg-[#6EE05A] text-[#0B0F19]',
                      executing || !chatInput.trim() ? 'opacity-50' : 'opacity-100',
                    ].join(' ')}
                  >
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
