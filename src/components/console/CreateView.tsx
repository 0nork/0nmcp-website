'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Send, User, Download, Blocks, Sparkles, Play, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react'

/* ──────────────────────────────────────────── */
/*  Types                                      */
/* ──────────────────────────────────────────── */

interface ExecutionResult {
  success: boolean
  action: string
  service: string
  data?: unknown
  error?: string
  executedAt: string
}

interface ToolCallExecution {
  toolName: string
  toolInput: Record<string, unknown>
  result: ExecutionResult
}

interface WorkflowStepResult {
  stepId: string
  action: string
  result: ExecutionResult
}

interface Message {
  role: 'user' | 'assistant'
  text: string
  timestamp: string
  workflow?: Record<string, unknown> | null
  savedWorkflowId?: string | null
  executions?: ToolCallExecution[] | null
  workflowExecutions?: WorkflowStepResult[] | null
}

interface CreateViewProps {
  onAddToBuilder?: (workflow: Record<string, unknown>) => void
}

/* ──────────────────────────────────────────── */
/*  CreateView                                 */
/* ──────────────────────────────────────────── */

export function CreateView({ onAddToBuilder }: CreateViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const greetedRef = useRef(false)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Initial greeting
  useEffect(() => {
    if (greetedRef.current) return
    greetedRef.current = true
    setMessages([
      {
        role: 'assistant',
        text: "Hey! I'm the 0n Create Agent. I'll help you build the perfect SWITCH file (.0n workflow) step by step — and I can execute actions in real-time too.\n\nWhat would you like to do?\n\n1. Build a workflow (lead capture, social posting, onboarding, data sync)\n2. Run a live action (\"how many contacts do I have?\", \"check my Stripe revenue\")\n3. Build AND run — create a workflow, then test it live\n4. Something else — just describe it!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }, [])

  // Build conversation history for API
  const getHistory = useCallback(() => {
    return messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.text,
    }))
  }, [messages])

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const userMsg: Message = {
        role: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setLoading(true)

      try {
        const res = await fetch('/api/console/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            history: getHistory(),
          }),
        })

        const data = await res.json()

        const assistantMsg: Message = {
          role: 'assistant',
          text: data.text || 'Something went wrong. Try again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          workflow: data.workflow || null,
          savedWorkflowId: data.savedWorkflowId || null,
          executions: data.executions || null,
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Connection error. Check your network and try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [getHistory]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loading && input.trim()) sendMessage(input)
  }

  const handleDownload = (workflow: Record<string, unknown>) => {
    const header = (workflow.$0n || workflow['0n']) as Record<string, string> | undefined
    const name = header?.name || 'workflow'
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}.0n`
    a.click()
    URL.revokeObjectURL(url)
  }

  const [runningWorkflow, setRunningWorkflow] = useState(false)

  const handleRunWorkflow = useCallback(async (workflow: Record<string, unknown>) => {
    if (runningWorkflow) return
    const steps = workflow.steps as Array<{ id: string; service: string; action: string; params: Record<string, unknown>; description?: string }> | undefined
    if (!steps || steps.length === 0) return

    setRunningWorkflow(true)

    // Add a "running" message
    const runMsg: Message = {
      role: 'assistant',
      text: `Running ${steps.length} step(s)...`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, runMsg])

    try {
      const res = await fetch('/api/console/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'execute workflow',
          history: getHistory(),
          executeWorkflow: { steps },
        }),
      })

      const data = await res.json()

      const resultMsg: Message = {
        role: 'assistant',
        text: data.text || 'Workflow execution complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        workflowExecutions: data.executions || null,
      }
      setMessages((prev) => [...prev, resultMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Failed to execute workflow. Check your connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setRunningWorkflow(false)
    }
  }, [runningWorkflow, getHistory])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <Sparkles size={20} style={{ color: 'var(--accent)' }} />
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            letterSpacing: '0.02em',
          }}
        >
          0n Create
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Build + Execute SWITCH files
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          minHeight: 0,
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>
            <MessageBubble message={msg} />
            {/* Workflow action buttons */}
            {msg.workflow && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  paddingLeft: 36,
                  marginTop: 10,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={() => handleRunWorkflow(msg.workflow!)}
                  disabled={runningWorkflow}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '1px solid #ff6b35',
                    backgroundColor: runningWorkflow ? 'rgba(255, 107, 53, 0.05)' : 'rgba(255, 107, 53, 0.15)',
                    color: '#ff6b35',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: runningWorkflow ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    opacity: runningWorkflow ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!runningWorkflow) e.currentTarget.style.backgroundColor = 'rgba(255, 107, 53, 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    if (!runningWorkflow) e.currentTarget.style.backgroundColor = 'rgba(255, 107, 53, 0.15)'
                  }}
                >
                  {runningWorkflow ? <Loader2 size={14} className="spin" /> : <Play size={14} />}
                  {runningWorkflow ? 'Running...' : 'Run This Workflow'}
                </button>
                <button
                  onClick={() => onAddToBuilder?.(msg.workflow!)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--accent)',
                    backgroundColor: 'rgba(110, 224, 90, 0.1)',
                    color: 'var(--accent)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(110, 224, 90, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(110, 224, 90, 0.1)'
                  }}
                >
                  <Blocks size={14} />
                  Open in Builder
                </button>
                <button
                  onClick={() => handleDownload(msg.workflow!)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
                  }}
                >
                  <Download size={14} />
                  Download .0n
                </button>
              </div>
            )}

            {/* Inline execution results (from AI tool calling) */}
            {msg.executions && msg.executions.length > 0 && (
              <div style={{ paddingLeft: 36, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {msg.executions.map((exec: ToolCallExecution, ei: number) => (
                  <ExecutionBadge key={ei} execution={exec} />
                ))}
              </div>
            )}

            {/* Workflow step execution results (from Run Workflow) */}
            {msg.workflowExecutions && msg.workflowExecutions.length > 0 && (
              <div style={{ paddingLeft: 36, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {msg.workflowExecutions.map((step: WorkflowStepResult, si: number) => (
                  <ExecutionBadge
                    key={si}
                    execution={{
                      toolName: step.action,
                      toolInput: {},
                      result: step.result,
                    }}
                    stepId={step.stepId}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(110, 224, 90, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={14} style={{ color: 'var(--accent)' }} />
            </span>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '14px 14px 14px 4px',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span className="create-dot" style={{ animationDelay: '0s' }} />
              <span className="create-dot" style={{ animationDelay: '0.2s' }} />
              <span className="create-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe what you want to automate..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: 'none',
            backgroundColor: loading || !input.trim() ? 'rgba(255, 255, 255, 0.04)' : 'var(--accent)',
            color: loading || !input.trim() ? 'var(--text-muted)' : 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <Send size={16} />
        </button>
      </form>

      <style>{`
        .create-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--text-muted);
          animation: createDotPulse 1s ease-in-out infinite;
        }
        @keyframes createDotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes createMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spin {
          animation: createSpin 1s linear infinite;
        }
        @keyframes createSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Message Bubble                             */
/* ──────────────────────────────────────────── */

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        flexDirection: 'column',
        gap: 4,
        animation: 'createMsgIn 0.25s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          maxWidth: '85%',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {/* Avatar */}
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: isUser ? 'rgba(255, 107, 53, 0.15)' : 'rgba(110, 224, 90, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isUser ? (
            <User size={14} style={{ color: '#ff6b35' }} />
          ) : (
            <Bot size={14} style={{ color: 'var(--accent)' }} />
          )}
        </span>

        {/* Bubble */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
            backgroundColor: isUser ? 'rgba(255, 107, 53, 0.15)' : 'var(--bg-card)',
            border: isUser ? '1px solid rgba(255, 107, 53, 0.25)' : '1px solid var(--border)',
            borderLeft: isUser ? undefined : '3px solid var(--accent)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.text}
          </p>
          <span
            style={{
              display: 'block',
              fontSize: '0.625rem',
              color: 'var(--text-muted)',
              marginTop: 4,
              textAlign: isUser ? 'right' : 'left',
            }}
          >
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Execution Badge                            */
/* ──────────────────────────────────────────── */

function ExecutionBadge({ execution, stepId }: { execution: ToolCallExecution; stepId?: string }) {
  const [expanded, setExpanded] = useState(false)
  const { result } = execution
  const isSuccess = result.success

  // Format the result data for display
  const resultPreview = result.data
    ? JSON.stringify(result.data, null, 2).slice(0, 500)
    : result.error || 'No data'

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${isSuccess ? 'rgba(110, 224, 90, 0.3)' : 'rgba(255, 80, 80, 0.3)'}`,
        backgroundColor: isSuccess ? 'rgba(110, 224, 90, 0.06)' : 'rgba(255, 80, 80, 0.06)',
        overflow: 'hidden',
        animation: 'createMsgIn 0.25s ease',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {isSuccess ? (
          <CheckCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        ) : (
          <XCircle size={14} style={{ color: '#ff5050', flexShrink: 0 }} />
        )}
        <Zap size={12} style={{ color: isSuccess ? 'var(--accent)' : '#ff5050', flexShrink: 0 }} />
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: isSuccess ? 'var(--accent)' : '#ff5050',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.02em',
          }}
        >
          {isSuccess ? 'EXECUTED' : 'FAILED'}
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {stepId ? `[${stepId}] ` : ''}{execution.toolName}
        </span>
        <span
          style={{
            fontSize: '0.625rem',
            color: 'var(--text-muted)',
            marginLeft: 'auto',
          }}
        >
          {result.service} {expanded ? '[-]' : '[+]'}
        </span>
      </button>

      {expanded && (
        <div
          style={{
            padding: '8px 12px',
            borderTop: `1px solid ${isSuccess ? 'rgba(110, 224, 90, 0.15)' : 'rgba(255, 80, 80, 0.15)'}`,
          }}
        >
          <pre
            style={{
              margin: 0,
              fontSize: '0.6875rem',
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {resultPreview}
            {resultPreview.length >= 500 && '...'}
          </pre>
        </div>
      )}
    </div>
  )
}
