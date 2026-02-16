'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useBuilderDispatch } from './BuilderContext'
import { importWorkflow } from './importWorkflow'
import { createSupabaseBrowser } from '@/lib/supabase/client'
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

type AuthState = 'loading' | 'unauthenticated' | 'no-key' | 'ready'

export default function AIChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useBuilderDispatch()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const supabase = createSupabaseBrowser()
    if (!supabase) { setAuthState('unauthenticated'); return }
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setAuthState('unauthenticated')
      return
    }

    // Check for Anthropic vault entry
    const { data: vaultEntry } = await supabase
      .from('user_vaults')
      .select('encrypted_key, iv, salt')
      .eq('user_id', user.id)
      .eq('service_name', 'anthropic')
      .single()

    if (!vaultEntry) {
      setAuthState('no-key')
      return
    }

    // Decrypt the key client-side
    try {
      const enc = new TextEncoder()
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(user.id),
        'PBKDF2',
        false,
        ['deriveKey']
      )

      const salt = Uint8Array.from(atob(vaultEntry.salt), (c) => c.charCodeAt(0))
      const iv = Uint8Array.from(atob(vaultEntry.iv), (c) => c.charCodeAt(0))
      const encrypted = Uint8Array.from(atob(vaultEntry.encrypted_key), (c) => c.charCodeAt(0))

      const derivedKey = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      )

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        encrypted
      )

      const apiKey = new TextDecoder().decode(decrypted)
      setDecryptedKey(apiKey)
      setAuthState('ready')
    } catch {
      setAuthState('no-key')
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    if (!text || streaming || !decryptedKey) return

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
          'x-api-key': decryptedKey,
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: abortRef.current.signal,
      })

      if (response.status === 401) {
        assistantMsg.content = 'Your Anthropic API key is invalid or expired. Update it in Account > Credentials.'
        setMessages((prev) => [...prev.slice(0, -1), { ...assistantMsg }])
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

      {authState === 'loading' && (
        <div className="ai-chat-auth">
          <div className="ai-chat-auth-icon">0n</div>
          <p>Checking authentication...</p>
        </div>
      )}

      {authState === 'unauthenticated' && (
        <div className="ai-chat-auth">
          <div className="ai-chat-auth-icon">0n</div>
          <h3>Sign in required</h3>
          <p>The AI Builder uses your own Anthropic API key from your credential vault.</p>
          <button
            className="ai-chat-auth-btn"
            onClick={() => router.push('/login?redirect=/builder')}
          >
            Sign in
          </button>
          <button
            className="ai-chat-auth-btn"
            style={{ marginTop: '0.5rem', background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            onClick={() => router.push('/signup?redirect=/builder')}
          >
            Create account
          </button>
        </div>
      )}

      {authState === 'no-key' && (
        <div className="ai-chat-auth">
          <div className="ai-chat-auth-icon">0n</div>
          <h3>Anthropic key required</h3>
          <p>
            Add your Anthropic API key to your credential vault with service name
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}> anthropic</strong>.
          </p>
          <button
            className="ai-chat-auth-btn"
            onClick={() => router.push('/account')}
          >
            Go to Account
          </button>
        </div>
      )}

      {authState === 'ready' && (
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
