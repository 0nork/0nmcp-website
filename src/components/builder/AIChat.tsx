'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useBuilderDispatch } from './BuilderContext'
import { importWorkflow } from './importWorkflow'
import type { DotOnWorkflow } from './types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function extractWorkflowJSON(text: string): DotOnWorkflow | null {
  // Find JSON inside ```json ... ``` code fence
  const fenceMatch = text.match(/```json\s*\n?([\s\S]*?)```/)
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1])
      if (parsed.steps && Array.isArray(parsed.steps)) return parsed
    } catch {}
  }

  // Fallback: find any JSON object with "steps" array
  const jsonMatch = text.match(/\{[\s\S]*"steps"\s*:\s*\[[\s\S]*\][\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.steps && Array.isArray(parsed.steps)) return parsed
    } catch {}
  }

  return null
}

const ENTERPRISE_KEY_STORAGE = '0nmcp-enterprise-key'

export default function AIChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useBuilderDispatch()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [enterpriseKey, setEnterpriseKey] = useState('')
  const [keyError, setKeyError] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(ENTERPRISE_KEY_STORAGE)
    if (stored) {
      setEnterpriseKey(stored)
      setAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleAuth = useCallback(() => {
    if (!enterpriseKey.trim()) {
      setKeyError('Enter your enterprise key')
      return
    }
    localStorage.setItem(ENTERPRISE_KEY_STORAGE, enterpriseKey.trim())
    setAuthenticated(true)
    setKeyError('')
  }, [enterpriseKey])

  const handleImport = useCallback(
    (workflow: DotOnWorkflow) => {
      const result = importWorkflow(workflow)
      dispatch({ type: 'IMPORT_WORKFLOW', ...result })
      onClose()
    },
    [dispatch, onClose]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || streaming) return

    setInput('')
    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setStreaming(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMsg])

    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/builder/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-enterprise-key': enterpriseKey,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      })

      if (response.status === 403) {
        assistantMsg.content = 'Invalid enterprise key. Check your key in settings or contact support.'
        setMessages((prev) => [...prev.slice(0, -1), { ...assistantMsg }])
        setAuthenticated(false)
        localStorage.removeItem(ENTERPRISE_KEY_STORAGE)
        return
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }))
        assistantMsg.content = `Error: ${err.error || response.statusText}`
        setMessages((prev) => [...prev.slice(0, -1), { ...assistantMsg }])
        return
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const event = JSON.parse(data)
            if (event.text) {
              assistantMsg.content += event.text
              setMessages((prev) => [...prev.slice(0, -1), { ...assistantMsg }])
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        assistantMsg.content = `Error: ${err.message}`
        setMessages((prev) => [...prev.slice(0, -1), { ...assistantMsg }])
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  if (!open) return null

  return (
    <div className="ai-chat-panel">
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <span className="ai-chat-icon">0n</span>
          AI Builder
        </div>
        <button className="ai-chat-close" onClick={onClose}>
          &times;
        </button>
      </div>

      {!authenticated ? (
        <div className="ai-chat-auth">
          <div className="ai-chat-auth-icon">0n</div>
          <h3>Enterprise Access</h3>
          <p>Enter your enterprise key to use the AI workflow builder.</p>
          <input
            type="password"
            className="ai-chat-auth-input"
            value={enterpriseKey}
            onChange={(e) => setEnterpriseKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            placeholder="Enter enterprise key..."
            autoFocus
          />
          {keyError && <p className="ai-chat-auth-error">{keyError}</p>}
          <button className="ai-chat-auth-btn" onClick={handleAuth}>
            Unlock
          </button>
        </div>
      ) : (
        <>
          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-chat-empty">
                <p className="ai-chat-empty-title">Describe a workflow</p>
                <p className="ai-chat-empty-sub">
                  I&apos;ll generate a valid .0n file and import it directly into the canvas.
                </p>
                <div className="ai-chat-suggestions">
                  {[
                    'Build a lead nurture sequence with email and SMS follow-ups',
                    'Create an onboarding workflow for new clients',
                    'Design a content publishing pipeline across social channels',
                  ].map((s) => (
                    <button
                      key={s}
                      className="ai-chat-suggestion"
                      onClick={() => setInput(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const workflow =
                msg.role === 'assistant' && !streaming
                  ? extractWorkflowJSON(msg.content)
                  : i === messages.length - 1 && msg.role === 'assistant' && !streaming
                    ? extractWorkflowJSON(msg.content)
                    : null

              return (
                <div key={i} className={`ai-chat-msg ${msg.role}`}>
                  <div className="ai-chat-msg-content">
                    {msg.content || (streaming && i === messages.length - 1 ? '...' : '')}
                  </div>
                  {workflow && (
                    <button
                      className="ai-chat-import-btn"
                      onClick={() => handleImport(workflow)}
                    >
                      Import &quot;{workflow.name}&quot; to Canvas ({workflow.steps.length} steps)
                    </button>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chat-input-bar" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe a workflow..."
              disabled={streaming}
              autoFocus
            />
            <button type="submit" disabled={streaming || !input.trim()}>
              {streaming ? '...' : 'Go'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
