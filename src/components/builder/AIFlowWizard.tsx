'use client'

/**
 * AIFlowWizard — APEX-style multi-step AI workflow builder popup
 *
 * 5-step wizard with AI chat, quick suggestions, step progress,
 * and execution engine integration. After generating a workflow,
 * users can run it directly and see per-step results inline.
 */

import { useState, useCallback } from 'react'

interface AIFlowWizardProps {
  open: boolean
  onClose: () => void
  onSubmit: (prompt: string) => void
}

interface WorkflowStep {
  id: string
  service: string
  action: string
  label: string
  params: Record<string, unknown>
}

interface StepResult {
  status: 'idle' | 'running' | 'success' | 'error'
  data?: unknown
  error?: string
}

const STEPS = [
  { label: 'Describe', description: 'What do you want to automate?' },
  { label: 'Services', description: 'Which services should be involved?' },
  { label: 'Logic', description: 'Define conditions and branching' },
  { label: 'Review', description: 'Review the generated flow' },
  { label: 'Deploy', description: 'Test and deploy your workflow' },
]

const QUICK_SUGGESTIONS = [
  'Send email when payment received',
  'Sync CRM contacts to Google Sheets daily',
  'Monitor social mentions and alert on Slack',
  'Auto-reply to new conversations in CRM',
  'Generate weekly analytics report',
  'Route leads to sales pipeline based on source',
]

/* ── Step-to-tool mapper (mirrors /api/console/create pattern) ── */

const KNOWN_TOOLS = [
  'search_crm_contacts', 'create_crm_contact', 'get_crm_contact',
  'send_email', 'get_crm_pipelines', 'create_crm_opportunity',
  'list_crm_contacts', 'update_crm_contact',
  'get_stripe_revenue', 'list_stripe_customers', 'list_stripe_subscriptions',
  'create_stripe_invoice', 'get_stripe_balance',
  'post_to_slack', 'list_slack_channels', 'get_slack_messages',
  'query_data',
]

function mapStepToTool(service: string, action: string): string | null {
  // Direct match
  if (KNOWN_TOOLS.includes(action)) return action

  // service_action combo
  const combo = `${service}_${action}`.toLowerCase()
  const mapped = KNOWN_TOOLS.find(t => t === combo)
  if (mapped) return mapped

  // Fuzzy by service
  const candidates = KNOWN_TOOLS.filter(t => t.includes(service.toLowerCase()))
  if (candidates.length === 0) return null

  const actionLower = action.toLowerCase()
  return candidates.find(c => {
    const parts = c.split('_')
    return parts.some(p => actionLower.includes(p))
  }) || null
}

/* ── Parse AI response into workflow steps ── */

function parseWorkflowSteps(text: string): WorkflowStep[] {
  const steps: WorkflowStep[] = []

  // Try JSON block first
  const jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1])
      if (Array.isArray(parsed)) {
        return parsed.map((s: Record<string, unknown>, i: number) => ({
          id: `step_${i + 1}`,
          service: String(s.service || 'unknown'),
          action: String(s.action || ''),
          label: String(s.label || s.name || s.description || `Step ${i + 1}`),
          params: (s.params as Record<string, unknown>) || {},
        }))
      }
    } catch { /* fall through to pattern matching */ }
  }

  // Pattern matching: numbered lines like "1. CRM: search contacts"
  const lines = text.split('\n')
  let idx = 0
  for (const line of lines) {
    const m = line.match(/^\d+\.\s*\*?\*?(\w+)\*?\*?\s*[:—-]\s*(.+)/i)
    if (m) {
      idx++
      const service = m[1].toLowerCase()
      const desc = m[2].trim()
      const tool = mapStepToTool(service, desc.split(/\s/)[0].toLowerCase())
      steps.push({
        id: `step_${idx}`,
        service,
        action: tool || desc.split(/\s/)[0].toLowerCase(),
        label: desc,
        params: {},
      })
    }
  }

  return steps
}

export default function AIFlowWizard({ open, onClose, onSubmit }: AIFlowWizardProps) {
  const [step, setStep] = useState(0)
  const [message, setMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [stepResults, setStepResults] = useState<Record<string, StepResult>>({})
  const [isRunning, setIsRunning] = useState(false)

  /* ── Generate workflow from prompt via /api/chat ── */
  const generateWorkflow = useCallback(async (prompt: string) => {
    setGenerating(true)
    setWorkflowSteps([])
    setStepResults({})

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate a workflow for: "${prompt}"\n\nRespond with ONLY a JSON array of steps. Each step has: service (crm/stripe/slack), action (the execution engine tool name like search_crm_contacts, list_stripe_customers, post_to_slack, etc.), label (human-readable description), params (object with parameters).\n\nAvailable tools: ${KNOWN_TOOLS.join(', ')}\n\nExample:\n\`\`\`json\n[{"service":"crm","action":"list_crm_contacts","label":"List recent CRM contacts","params":{"limit":10}},{"service":"slack","action":"post_to_slack","label":"Post results to Slack","params":{"channel":"general","text":"Synced contacts"}}]\n\`\`\``,
            },
          ],
        }),
      })

      if (!res.ok) throw new Error('Failed to generate workflow')

      const data = await res.json()
      const reply = data.reply || data.content || data.message || ''
      const steps = parseWorkflowSteps(typeof reply === 'string' ? reply : JSON.stringify(reply))

      if (steps.length > 0) {
        setWorkflowSteps(steps)
        const initial: Record<string, StepResult> = {}
        steps.forEach(s => { initial[s.id] = { status: 'idle' } })
        setStepResults(initial)
        setStep(3) // Jump to Review
      } else {
        // Fallback: pass to AIChat
        onSubmit(prompt)
      }
    } catch {
      // On error, fall through to AIChat
      onSubmit(prompt)
    } finally {
      setGenerating(false)
    }
  }, [onSubmit])

  const handleSend = useCallback(() => {
    if (!message.trim()) return
    const prompt = message.trim()
    setMessage('')

    if (step <= 2) {
      // Generate workflow from the prompt
      generateWorkflow(prompt)
    } else {
      // On Review/Deploy, pass to AIChat
      onSubmit(prompt)
      onClose()
    }
  }, [message, step, generateWorkflow, onSubmit, onClose])

  const handleSuggestion = useCallback((s: string) => {
    generateWorkflow(s)
  }, [generateWorkflow])

  /* ── Execute workflow steps sequentially ── */
  const runWorkflow = useCallback(async () => {
    if (workflowSteps.length === 0) return
    setIsRunning(true)
    setStep(4) // Switch to Deploy step

    for (const ws of workflowSteps) {
      const toolName = mapStepToTool(ws.service, ws.action) || ws.action

      // Mark as running
      setStepResults(prev => ({
        ...prev,
        [ws.id]: { status: 'running' },
      }))

      try {
        const res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: toolName,
            params: ws.params,
          }),
        })

        const result = await res.json()

        setStepResults(prev => ({
          ...prev,
          [ws.id]: result.success
            ? { status: 'success', data: result.data }
            : { status: 'error', error: result.error || 'Execution failed' },
        }))
      } catch (err) {
        setStepResults(prev => ({
          ...prev,
          [ws.id]: {
            status: 'error',
            error: err instanceof Error ? err.message : 'Network error',
          },
        }))
      }
    }

    setIsRunning(false)
  }, [workflowSteps])

  /* ── Reset on close ── */
  const handleClose = useCallback(() => {
    setStep(0)
    setMessage('')
    setWorkflowSteps([])
    setStepResults({})
    setIsRunning(false)
    setGenerating(false)
    onClose()
  }, [onClose])

  if (!open) return null

  const allDone = workflowSteps.length > 0 &&
    workflowSteps.every(ws => stepResults[ws.id]?.status === 'success' || stepResults[ws.id]?.status === 'error')
  const successCount = workflowSteps.filter(ws => stepResults[ws.id]?.status === 'success').length
  const errorCount = workflowSteps.filter(ws => stepResults[ws.id]?.status === 'error').length

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'wizardFadeIn 0.2s ease-out',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 520,
          maxHeight: '80vh',
          zIndex: 201,
          background: 'rgba(12, 14, 20, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--bg-card) inset',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'wizardSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '20px 24px 16px',
        }}>
          {/* Icon */}
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(110, 224, 90, 0.3)',
            flexShrink: 0,
          }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#080B0F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              AI Flow Wizard
            </div>
            <div style={{ fontSize: 12, color: '#7a8290', marginTop: 2 }}>
              Let AI guide you through building the perfect workflow
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#7A8290'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#5f6672'
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </button>
        </div>

        {/* Step progress */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 0, padding: '0 24px 20px',
        }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 32 : 28,
                  height: i === step ? 32 : 28,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  background: i === step
                    ? '#6EE05A'
                    : i < step
                      ? 'rgba(110, 224, 90, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: i === step
                    ? '#080B0F'
                    : i < step
                      ? '#6EE05A'
                      : '#5f6672',
                  boxShadow: i === step ? '0 4px 12px rgba(110, 224, 90, 0.3)' : 'none',
                }}
              >
                {i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 40, height: 2,
                  background: i < step ? 'rgba(110, 224, 90, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                  transition: 'background 0.2s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Content — scrollable */}
        <div style={{
          padding: '0 24px 20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflowY: 'auto',
          maxHeight: 'calc(80vh - 240px)',
        }}>
          {/* AI assistant message */}
          <div style={{
            padding: '16px',
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#6EE05A' }}>
                AI Assistant
              </span>
            </div>
            <div style={{ fontSize: 14, color: '#c8ccd2', lineHeight: 1.6 }}>
              {generating && 'Generating your workflow...'}
              {!generating && step === 0 && "What would you like to automate? Describe your workflow in plain English and I'll build it for you."}
              {!generating && step === 1 && "Which services should be connected? I can integrate any of the 99 services in your 0nMCP installation."}
              {!generating && step === 2 && "Do you need any conditional logic? Branches, loops, error handling, or time delays?"}
              {!generating && step === 3 && workflowSteps.length > 0 && `Generated ${workflowSteps.length} step${workflowSteps.length > 1 ? 's' : ''}. Review below, then hit Run Workflow to execute.`}
              {!generating && step === 3 && workflowSteps.length === 0 && "Here's your workflow. Review the steps and connections, then make any adjustments."}
              {!generating && step === 4 && !isRunning && !allDone && "Ready to deploy! Hit Run Workflow to execute each step against your live services."}
              {!generating && step === 4 && isRunning && 'Executing workflow steps...'}
              {!generating && step === 4 && allDone && `Execution complete: ${successCount} succeeded, ${errorCount} failed.`}
            </div>
          </div>

          {/* Quick suggestions (step 0 only, no workflow yet) */}
          {step === 0 && workflowSteps.length === 0 && !generating && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                Quick suggestions:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {QUICK_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      color: '#7A8290',
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(110, 224, 90, 0.3)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#e8eaed'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(110, 224, 90, 0.04)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.06)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#7A8290'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {generating && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24, gap: 10,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: '2px solid rgba(110, 224, 90, 0.2)',
                borderTopColor: '#6EE05A',
                animation: 'wizardSpin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: 13, color: '#7a8290' }}>Building workflow...</span>
            </div>
          )}

          {/* Workflow steps list (Review + Deploy) */}
          {(step === 3 || step === 4) && workflowSteps.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                Workflow Steps:
              </div>
              {workflowSteps.map((ws, i) => {
                const result = stepResults[ws.id]
                const statusColor = result?.status === 'success' ? '#6EE05A'
                  : result?.status === 'error' ? '#ef4444'
                  : result?.status === 'running' ? '#f59e0b'
                  : '#5f6672'

                return (
                  <div key={ws.id} style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${result?.status === 'success' ? 'rgba(110, 224, 90, 0.2)' : result?.status === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Step number */}
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: result?.status === 'success' ? 'rgba(110, 224, 90, 0.15)'
                          : result?.status === 'error' ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {result?.status === 'running' ? (
                          <div style={{
                            width: 12, height: 12, borderRadius: '50%',
                            border: '2px solid rgba(245, 158, 11, 0.3)',
                            borderTopColor: '#f59e0b',
                            animation: 'wizardSpin 0.8s linear infinite',
                          }} />
                        ) : result?.status === 'success' ? (
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : result?.status === 'error' ? (
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
                          </svg>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#5f6672' }}>{i + 1}</span>
                        )}
                      </div>

                      {/* Step info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ws.label}
                        </div>
                        <div style={{ fontSize: 11, color: statusColor, marginTop: 2 }}>
                          {ws.service} / {ws.action}
                          {result?.status === 'running' && ' — executing...'}
                          {result?.status === 'success' && ' — completed'}
                          {result?.status === 'error' && ` — ${result.error?.slice(0, 60) || 'failed'}`}
                        </div>
                      </div>
                    </div>

                    {/* Expanded result for completed steps */}
                    {result?.status === 'success' && !!result.data && (
                      <div style={{
                        marginTop: 8, padding: '8px 10px',
                        borderRadius: 8,
                        background: 'rgba(110, 224, 90, 0.05)',
                        fontSize: 11, color: '#7a8290',
                        fontFamily: 'JetBrains Mono, monospace',
                        maxHeight: 80, overflowY: 'auto',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                      }}>
                        {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2).slice(0, 300)}
                      </div>
                    )}
                    {result?.status === 'error' && result.error && (
                      <div style={{
                        marginTop: 8, padding: '8px 10px',
                        borderRadius: 8,
                        background: 'rgba(239, 68, 68, 0.05)',
                        fontSize: 11, color: '#ef4444',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {result.error.slice(0, 200)}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Run Workflow button */}
              <button
                onClick={runWorkflow}
                disabled={isRunning}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px',
                  borderRadius: 12,
                  border: 'none',
                  background: isRunning ? 'rgba(245, 158, 11, 0.15)' : allDone ? 'rgba(110, 224, 90, 0.1)' : '#6EE05A',
                  color: isRunning ? '#f59e0b' : allDone ? '#6EE05A' : '#080B0F',
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: isRunning ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  marginTop: 4,
                }}
              >
                {isRunning ? (
                  <>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: '2px solid rgba(245, 158, 11, 0.3)',
                      borderTopColor: '#f59e0b',
                      animation: 'wizardSpin 0.8s linear infinite',
                    }} />
                    Running...
                  </>
                ) : allDone ? (
                  <>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <polyline points="9 12 11.5 14.5 15 9.5" />
                    </svg>
                    Re-run Workflow
                  </>
                ) : (
                  <>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Run Workflow
                  </>
                )}
              </button>

              {/* Summary after completion */}
              {allDone && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: errorCount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(110, 224, 90, 0.05)',
                  border: `1px solid ${errorCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(110, 224, 90, 0.15)'}`,
                }}>
                  <span style={{ fontSize: 12, color: '#7a8290' }}>
                    {successCount}/{workflowSteps.length} steps succeeded
                    {errorCount > 0 && ` / ${errorCount} failed`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{
          display: 'flex', gap: 8,
          padding: '16px 24px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
            placeholder={generating ? 'Generating...' : step >= 3 && workflowSteps.length > 0 ? 'Describe changes or type a new workflow...' : 'Type your message...'}
            disabled={generating}
            style={{
              flex: 1, padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-primary)', fontSize: 14,
              fontFamily: 'inherit', outline: 'none',
              transition: 'border-color 0.2s',
              opacity: generating ? 0.5 : 1,
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(110, 224, 90, 0.3)' }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255, 255, 255, 0.08)' }}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || generating}
            style={{
              width: 44, height: 44,
              borderRadius: 12,
              border: 'none',
              background: message.trim() && !generating ? '#6EE05A' : 'rgba(255, 255, 255, 0.05)',
              color: message.trim() && !generating ? '#080B0F' : '#5f6672',
              cursor: message.trim() && !generating ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes wizardFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wizardSlideIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes wizardSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
