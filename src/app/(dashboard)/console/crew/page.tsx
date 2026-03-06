'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Plus,
  X,
  Play,
  Pause,
  Trash2,
  Settings,
  FileCode2,
  Clock,
  ChevronDown,
  CheckCircle2,
  Download,
} from 'lucide-react'
import {
  type CrewAgent,
  type CrewConfig,
  AGENT_TEMPLATES,
  ABILITY_GROUPS,
  TRIGGER_TYPES,
  generateAgentWorkflow,
  loadCrewConfig,
  saveCrewConfig,
} from '@/lib/console/crew'

type ConfigTab = 'configure' | 'workflow' | 'history'

export default function CrewPage() {
  const [config, setConfig] = useState<CrewConfig>(() => loadCrewConfig())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [configTab, setConfigTab] = useState<ConfigTab>('configure')
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState<'template' | 'customize'>('template')
  const [wizardAgent, setWizardAgent] = useState<Partial<CrewAgent>>({})

  const agents = config.agents
  const selected = agents.find(a => a.id === selectedId) ?? null

  // Persist changes
  useEffect(() => {
    saveCrewConfig(config)
  }, [config])

  const updateAgent = useCallback((id: string, patch: Partial<CrewAgent>) => {
    setConfig(prev => ({
      ...prev,
      agents: prev.agents.map(a => a.id === id ? { ...a, ...patch } : a),
    }))
  }, [])

  const removeAgent = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      agents: prev.agents.filter(a => a.id !== id),
    }))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  const addAgent = useCallback((agent: CrewAgent) => {
    setConfig(prev => ({
      ...prev,
      agents: [...prev.agents, agent],
    }))
    setSelectedId(agent.id)
    setShowWizard(false)
    setWizardStep('template')
    setWizardAgent({})
  }, [])

  const toggleStatus = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      agents: prev.agents.map(a => {
        if (a.id !== id) return a
        return { ...a, status: a.status === 'active' ? 'idle' : 'active' }
      }),
    }))
  }, [])

  const activeCount = agents.filter(a => a.status === 'active').length

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full" style={{ animation: 'crew-fadein 0.3s ease' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            0nCrew
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {agents.length} agent{agents.length !== 1 ? 's' : ''} &middot; {activeCount} active
          </p>
        </div>
        <button
          onClick={() => { setShowWizard(true); setWizardStep('template'); setWizardAgent({}) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            color: 'var(--bg-primary)',
          }}
        >
          <Plus size={16} />
          Add Agent
        </button>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isSelected={selectedId === agent.id}
            onSelect={() => setSelectedId(selectedId === agent.id ? null : agent.id)}
            onToggle={() => toggleStatus(agent.id)}
          />
        ))}

        {/* Add placeholder card */}
        <button
          onClick={() => { setShowWizard(true); setWizardStep('template'); setWizardAgent({}) }}
          className="glow-box rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all border-none min-h-[140px]"
          style={{ borderStyle: 'dashed', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '' }}
        >
          <Plus size={24} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Add Agent</span>
        </button>
      </div>

      {/* Config Panel */}
      {selected && (
        <div className="glow-box rounded-xl overflow-hidden" style={{ animation: 'crew-slidein 0.2s ease' }}>
          {/* Config header */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{selected.avatar}</span>
              <div>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {selected.name}
                </span>
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                  {selected.role}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => removeAgent(selected.id)}
                className="p-1.5 rounded-lg cursor-pointer bg-transparent border-none transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
                title="Remove agent"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1.5 rounded-lg cursor-pointer bg-transparent border-none transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Config tabs */}
          <div className="flex gap-0" style={{ borderBottom: '1px solid var(--border)' }}>
            {([
              { key: 'configure' as const, label: 'Configure', icon: Settings },
              { key: 'workflow' as const, label: 'Workflow', icon: FileCode2 },
              { key: 'history' as const, label: 'History', icon: Clock },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setConfigTab(key)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold cursor-pointer bg-transparent border-none transition-all"
                style={{
                  color: configTab === key ? 'var(--accent)' : 'var(--text-muted)',
                  borderBottom: configTab === key ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5">
            {configTab === 'configure' && (
              <ConfigurePanel agent={selected} onUpdate={updateAgent} />
            )}
            {configTab === 'workflow' && (
              <WorkflowPanel agent={selected} />
            )}
            {configTab === 'history' && (
              <HistoryPanel />
            )}
          </div>
        </div>
      )}

      {/* Add Agent Wizard Modal */}
      {showWizard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowWizard(false) }}
        >
          <div
            className="glow-box rounded-2xl w-full max-w-lg overflow-hidden"
            style={{ animation: 'crew-fadein 0.2s ease', backgroundColor: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {wizardStep === 'template' ? 'Choose a Template' : 'Customize Agent'}
              </h3>
              <button
                onClick={() => setShowWizard(false)}
                className="p-1 cursor-pointer bg-transparent border-none"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              {wizardStep === 'template' && (
                <div className="space-y-2">
                  {AGENT_TEMPLATES.filter(t => !agents.some(a => a.id === t.id)).map(tmpl => (
                    <button
                      key={tmpl.id}
                      onClick={() => {
                        setWizardAgent({ ...tmpl, id: `${tmpl.id}_${Date.now()}` })
                        setWizardStep('customize')
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer bg-transparent transition-all"
                      style={{ border: '1px solid var(--border)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = tmpl.color }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <span className="text-2xl">{tmpl.avatar}</span>
                      <div className="flex-1">
                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{tmpl.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{tmpl.role}</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: tmpl.color + '18', color: tmpl.color }}>
                        {tmpl.abilities.length} tools
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setWizardAgent({
                        id: `custom_${Date.now()}`,
                        name: '',
                        role: '',
                        avatar: '\u{1F916}',
                        color: '#7ed957',
                        abilities: [],
                        status: 'idle',
                        triggers: [],
                        createdAt: new Date().toISOString(),
                      })
                      setWizardStep('customize')
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer bg-transparent transition-all"
                    style={{ border: '1px dashed var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <span className="text-2xl">{'\u{1F916}'}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Start from Scratch</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Build a custom agent</div>
                    </div>
                  </button>
                </div>
              )}

              {wizardStep === 'customize' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Name</label>
                    <input
                      type="text"
                      value={wizardAgent.name ?? ''}
                      onChange={e => setWizardAgent(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Scout, Closer, Publisher"
                      className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Role</label>
                    <input
                      type="text"
                      value={wizardAgent.role ?? ''}
                      onChange={e => setWizardAgent(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="What does this agent do?"
                      className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setWizardStep('template')}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all"
                      style={{ backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!wizardAgent.name) return
                        addAgent({
                          id: wizardAgent.id || `agent_${Date.now()}`,
                          name: wizardAgent.name,
                          role: wizardAgent.role || 'Custom agent',
                          avatar: wizardAgent.avatar || '\u{1F916}',
                          color: wizardAgent.color || '#7ed957',
                          abilities: wizardAgent.abilities || [],
                          status: 'idle',
                          triggers: wizardAgent.triggers || [],
                          createdAt: new Date().toISOString(),
                        })
                      }}
                      disabled={!wizardAgent.name}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                        color: 'var(--bg-primary)',
                        opacity: wizardAgent.name ? 1 : 0.4,
                      }}
                    >
                      Create Agent
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes crew-fadein {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes crew-slidein {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

/* ═══════════ Agent Card ═══════════ */

function AgentCard({
  agent,
  isSelected,
  onSelect,
  onToggle,
}: {
  agent: CrewAgent
  isSelected: boolean
  onSelect: () => void
  onToggle: () => void
}) {
  const isActive = agent.status === 'active'

  return (
    <div
      className="glow-box rounded-xl p-4 cursor-pointer transition-all"
      style={{
        borderColor: isSelected ? agent.color + '50' : undefined,
        boxShadow: isSelected ? `0 0 20px ${agent.color}15` : undefined,
      }}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{agent.avatar}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          className="p-1 rounded-md cursor-pointer bg-transparent border-none transition-colors"
          style={{ color: isActive ? agent.color : 'var(--text-muted)' }}
          title={isActive ? 'Pause' : 'Activate'}
        >
          {isActive ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>

      <div className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
        {agent.name}
      </div>
      <div className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)', minHeight: '2rem' }}>
        {agent.role}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: isActive ? agent.color : 'var(--text-muted)' }}
          />
          <span className="text-xs" style={{ color: isActive ? agent.color : 'var(--text-muted)' }}>
            {isActive ? 'Active' : agent.status === 'disabled' ? 'Disabled' : 'Idle'}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {agent.abilities.length} tool{agent.abilities.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

/* ═══════════ Configure Panel ═══════════ */

function ConfigurePanel({
  agent,
  onUpdate,
}: {
  agent: CrewAgent
  onUpdate: (id: string, patch: Partial<CrewAgent>) => void
}) {
  const [showAbilities, setShowAbilities] = useState(false)

  return (
    <div className="space-y-4">
      {/* Name + Role */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Name</label>
          <input
            type="text"
            value={agent.name}
            onChange={e => onUpdate(agent.id, { name: e.target.value })}
            className="w-full h-9 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Avatar</label>
          <input
            type="text"
            value={agent.avatar}
            onChange={e => onUpdate(agent.id, { avatar: e.target.value })}
            className="w-full h-9 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Role</label>
        <input
          type="text"
          value={agent.role}
          onChange={e => onUpdate(agent.id, { role: e.target.value })}
          className="w-full h-9 px-3 rounded-lg text-sm outline-none"
          style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Status toggle */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Status</label>
        <button
          onClick={() => onUpdate(agent.id, { status: agent.status === 'active' ? 'idle' : 'active' })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border-none transition-all"
          style={{
            backgroundColor: agent.status === 'active' ? agent.color + '18' : 'rgba(255,255,255,0.05)',
            color: agent.status === 'active' ? agent.color : 'var(--text-muted)',
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.status === 'active' ? agent.color : 'var(--text-muted)' }} />
          {agent.status === 'active' ? 'Active' : 'Idle'}
        </button>
      </div>

      {/* Abilities */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Abilities ({agent.abilities.length})
          </label>
          <button
            onClick={() => setShowAbilities(!showAbilities)}
            className="flex items-center gap-1 text-xs cursor-pointer bg-transparent border-none transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            {showAbilities ? 'Close' : 'Edit'}
            <ChevronDown size={12} style={{ transform: showAbilities ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {agent.abilities.map(a => (
            <span
              key={a}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: agent.color + '14', color: agent.color, border: `1px solid ${agent.color}25` }}
            >
              {a.replace(/_/g, ' ')}
            </span>
          ))}
          {agent.abilities.length === 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No abilities assigned</span>
          )}
        </div>

        {showAbilities && (
          <div className="mt-3 space-y-3" style={{ animation: 'crew-slidein 0.2s ease' }}>
            {Object.entries(ABILITY_GROUPS).map(([groupKey, group]) => (
              <div key={groupKey}>
                <div className="text-xs font-semibold mb-1.5" style={{ color: group.color }}>{group.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {group.tools.map(tool => {
                    const isActive = agent.abilities.includes(tool.id)
                    return (
                      <button
                        key={tool.id}
                        onClick={() => {
                          const newAbilities = isActive
                            ? agent.abilities.filter(a => a !== tool.id)
                            : [...agent.abilities, tool.id]
                          onUpdate(agent.id, { abilities: newAbilities })
                        }}
                        className="text-xs px-2 py-1 rounded-full cursor-pointer border-none transition-all font-medium"
                        style={{
                          background: isActive ? group.color + '20' : 'rgba(255,255,255,0.03)',
                          color: isActive ? group.color : 'var(--text-muted)',
                          border: `1px solid ${isActive ? group.color + '40' : 'var(--border)'}`,
                        }}
                      >
                        {isActive && <CheckCircle2 size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'text-top' }} />}
                        {tool.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Triggers */}
      <div>
        <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>Triggers</label>
        <div className="flex flex-wrap gap-1.5">
          {TRIGGER_TYPES.map(tr => {
            const isActive = agent.triggers.includes(tr.value)
            return (
              <button
                key={tr.value}
                onClick={() => {
                  const newTriggers = isActive
                    ? agent.triggers.filter(t => t !== tr.value)
                    : [...agent.triggers, tr.value]
                  onUpdate(agent.id, { triggers: newTriggers })
                }}
                className="text-xs px-2.5 py-1 rounded-full cursor-pointer border-none transition-all font-medium"
                style={{
                  background: isActive ? 'var(--accent)' + '18' : 'rgba(255,255,255,0.03)',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  border: `1px solid ${isActive ? 'var(--accent)' + '40' : 'var(--border)'}`,
                }}
              >
                {tr.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════ Workflow Panel ═══════════ */

function WorkflowPanel({ agent }: { agent: CrewAgent }) {
  const [generated, setGenerated] = useState(false)
  const workflow = generateAgentWorkflow(agent)
  const workflowJson = JSON.stringify(workflow, null, 2)

  const handleDownload = () => {
    const blob = new Blob([workflowJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agent.id}.0n`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {agent.abilities.length === 0 ? (
        <div className="text-center py-8">
          <FileCode2 size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Add abilities to this agent first, then generate a workflow.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              {agent.id}.0n
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(workflowJson); setGenerated(true); setTimeout(() => setGenerated(false), 2000) }}
                className="text-xs px-3 py-1.5 rounded-lg cursor-pointer border-none transition-all font-medium"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
              >
                {generated ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg cursor-pointer border-none transition-all font-medium"
                style={{ background: 'var(--accent)' + '18', color: 'var(--accent)' }}
              >
                <Download size={11} />
                Download .0n
              </button>
            </div>
          </div>
          <pre
            className="text-xs leading-relaxed p-4 rounded-xl overflow-auto max-h-64"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {workflowJson}
          </pre>
        </>
      )}
    </div>
  )
}

/* ═══════════ History Panel ═══════════ */

function HistoryPanel() {
  return (
    <div className="text-center py-8">
      <Clock size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
      <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
        No execution history yet
      </p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Agent runs will appear here once triggered.
      </p>
    </div>
  )
}
