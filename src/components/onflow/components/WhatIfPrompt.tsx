'use client'

import { useState, useRef, useEffect } from 'react'
import { useOnFlowDispatch } from '../OnFlowContext'
import { importToOnFlow } from '../hooks/useOnFlowImport'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import type { DotOnWorkflow } from '../types'

const SUGGESTION_CHIPS = [
  'New contact signs up?',
  'Someone opens my email?',
  'A payment comes in?',
  'A form gets submitted?',
  'Time to follow up?',
]

function extractWorkflowJSON(text: string): DotOnWorkflow | null {
  const fenceMatch = text.match(/```json\s*\n?([\s\S]*?)```/)
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1])
      if (parsed.steps && Array.isArray(parsed.steps)) return parsed
    } catch { /* ignore */ }
  }
  const jsonMatch = text.match(/\{[\s\S]*"steps"\s*:\s*\[[\s\S]*\][\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.steps && Array.isArray(parsed.steps)) return parsed
    } catch { /* ignore */ }
  }
  return null
}

export default function WhatIfPrompt() {
  const dispatch = useOnFlowDispatch()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  async function handleSubmit(prompt: string) {
    const text = prompt || input
    if (!text.trim()) return

    setLoading(true)
    setError('')

    try {
      const supabase = createSupabaseBrowser()
      if (!supabase) { setError('Not authenticated'); setLoading(false); return }

      const user = (await supabase.auth.getSession()).data.session?.user ?? null
      if (!user) { setError('Please sign in first'); setLoading(false); return }

      // Get encrypted Anthropic key
      const { data: vaultEntry } = await supabase
        .from('user_vaults')
        .select('encrypted_key, iv, salt')
        .eq('user_id', user.id)
        .eq('service_name', 'anthropic')
        .single()

      if (!vaultEntry) {
        setError('Add your Anthropic key in Vault first')
        setLoading(false)
        return
      }

      // Decrypt key client-side
      const enc = new TextEncoder()
      const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(user.id), 'PBKDF2', false, ['deriveBits', 'deriveKey'])
      const salt = Uint8Array.from(atob(vaultEntry.salt), (c) => c.charCodeAt(0))
      const cryptoKey = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      )
      const iv = Uint8Array.from(atob(vaultEntry.iv), (c) => c.charCodeAt(0))
      const encrypted = Uint8Array.from(atob(vaultEntry.encrypted_key), (c) => c.charCodeAt(0))
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, encrypted)
      const apiKey = new TextDecoder().decode(decrypted)

      // Call generate endpoint
      abortRef.current = new AbortController()
      const res = await fetch('/api/builder/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `What if ${text}` }],
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        setError(`AI error: ${res.status}`)
        setLoading(false)
        return
      }

      // Read SSE stream
      const reader = res.body?.getReader()
      if (!reader) { setError('No response stream'); setLoading(false); return }

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // Parse SSE events
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'content_block_delta' && data.delta?.text) {
                fullText += data.delta.text
              }
            } catch {
              // Not JSON, might be raw text
              fullText += line.slice(6)
            }
          }
        }
      }

      // Extract workflow JSON from AI response
      const workflow = extractWorkflowJSON(fullText)
      if (workflow) {
        const result = importToOnFlow(workflow)
        dispatch({
          type: 'IMPORT_WORKFLOW',
          steps: result.steps,
          settings: result.settings,
          stepCounter: result.stepCounter,
        })
      } else {
        setError('Could not parse workflow from AI response')
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Failed to generate workflow')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onflow-whatif">
      <div className="onflow-whatif__sparkle">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
          <path d="M19 15l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2z" opacity="0.6" />
          <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5L5 3z" opacity="0.4" />
        </svg>
      </div>
      <h2 className="onflow-whatif__title">What if...</h2>
      <p className="onflow-whatif__subtitle">Describe what should happen and AI will build your workflow</p>

      <div className="onflow-whatif__input-row">
        <input
          className="onflow-whatif__input"
          placeholder="a new contact signs up and needs a welcome email..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit('')}
          disabled={loading}
        />
        <button
          className="onflow-whatif__send"
          onClick={() => handleSubmit('')}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <span className="onflow-whatif__spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>

      <div className="onflow-whatif__chips">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            className="onflow-whatif__chip"
            onClick={() => handleSubmit(chip)}
            disabled={loading}
          >
            {chip}
          </button>
        ))}
      </div>

      {error && <p className="onflow-whatif__error">{error}</p>}
    </div>
  )
}
