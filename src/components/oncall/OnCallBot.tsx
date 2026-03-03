'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useVault } from '@/lib/console/hooks'
import { OnCallIcon, type FocusArea } from './OnCallIcon'
import { OnCallChat, type OnCallMessage } from './OnCallChat'
import { OnCallSuggestions, type Suggestion } from './OnCallSuggestions'
import { OnCallVaultPrompt } from './OnCallVaultPrompt'
import { useOnCallSuggestions } from './useOnCallSuggestions'
import { useOnCallBrain } from './useOnCallBrain'

export default function OnCallBot() {
  const [authed, setAuthed] = useState(false)
  const [open, setOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [messages, setMessages] = useState<OnCallMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [focus, setFocus] = useState<FocusArea>('idle')
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [vaultPromptService, setVaultPromptService] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const pathname = usePathname()
  const router = useRouter()
  const vault = useVault()
  const brain = useOnCallBrain()
  const clickCountRef = useRef(0)

  // Auth check
  useEffect(() => {
    const sb = createSupabaseBrowser()
    if (!sb) return
    sb.auth.getUser().then(({ data: { user } }) => {
      setAuthed(!!user)
    })
  }, [])

  // Load dismissed suggestions from brain
  useEffect(() => {
    if (brain.loaded) {
      const dismissed = brain.get('vault.dismissed') as { ids?: string[] } | undefined
      if (dismissed?.ids) setDismissedIds(dismissed.ids)
    }
  }, [brain.loaded, brain.get])

  const suggestions = useOnCallSuggestions({
    pathname,
    connectedServices: vault.connectedServices,
    dismissedIds,
    messageCount: messages.length,
  })

  // Handle icon click
  const handleIconClick = useCallback(() => {
    clickCountRef.current++
    if (open) return // Already open
    if (suggestions.length > 0 && !showSuggestions && clickCountRef.current === 1) {
      // First click shows suggestions
      setShowSuggestions(true)
      setFocus('suggesting')
    } else {
      // Second click or no suggestions — open chat
      setShowSuggestions(false)
      setOpen(true)
      setFocus('idle')
    }
  }, [open, suggestions.length, showSuggestions])

  const handleClose = useCallback(() => {
    setOpen(false)
    setShowSuggestions(false)
    setFocus('idle')
    clickCountRef.current = 0
    setVaultPromptService(null)

    // Save conversation
    if (messages.length > 0 && conversationId) {
      const lastSource = [...messages].reverse().find(m => m.source)?.source
      fetch('/api/oncall/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: conversationId,
          messages,
          page_context: pathname,
          provider_used: lastSource,
          message_count: messages.length,
        }),
      }).catch(() => {})
    }
  }, [messages, conversationId, pathname])

  const handleSuggestionSelect = useCallback((suggestion: Suggestion) => {
    setShowSuggestions(false)
    if (suggestion.action === 'navigate' && suggestion.payload) {
      router.push(suggestion.payload)
    } else if (suggestion.action === 'vault_prompt' && suggestion.payload) {
      setOpen(true)
      setVaultPromptService(suggestion.payload)
      setFocus('vault')
    } else if (suggestion.action === 'chat') {
      setOpen(true)
      if (suggestion.payload) {
        handleSend(suggestion.payload)
      }
    }
  }, [router])

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds(prev => {
      const next = [...prev, id]
      brain.set('vault.dismissed', { ids: next })
      return next
    })
  }, [brain])

  const handleSuggestionsAutoClose = useCallback(() => {
    setShowSuggestions(false)
    setFocus('idle')
    clickCountRef.current = 0
  }, [])

  // Send message to chat API
  const handleSend = useCallback(async (text: string) => {
    const userMsg: OnCallMessage = {
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setFocus('thinking')

    try {
      // Build brain context
      const brainSummary = brain.get('history.summary') as { text?: string } | undefined
      const preferences = brain.get('preferences') as Record<string, unknown> | undefined
      const learningTopics = brain.get('learning.topics') as { list?: string[] } | undefined

      const res = await fetch('/api/console/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            currentPage: pathname,
            brainSummary: brainSummary?.text,
            preferences,
            learningTopics: learningTopics?.list,
            missingServices: Object.keys(
              Object.fromEntries(
                Object.entries(
                  Object.fromEntries(
                    ['anthropic', 'openai', 'gemini', 'stripe', 'supabase']
                      .filter(k => !vault.connectedServices.includes(k))
                      .map(k => [k, true])
                  )
                )
              )
            ),
            source: 'oncall' as const,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Request failed')
      }

      const botMsg: OnCallMessage = {
        role: 'assistant',
        text: data.text,
        source: data.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, botMsg])

      // Set focus based on provider
      if (data.source && ['claude-byok', 'openai-byok', 'gemini-byok'].includes(data.source)) {
        setFocus('federation')
        setTimeout(() => setFocus('idle'), 3000)
      } else {
        setFocus('idle')
      }

      // Save conversation on first message
      if (!conversationId) {
        fetch('/api/oncall/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg, botMsg],
            page_context: pathname,
            provider_used: data.source,
            message_count: messages.length + 2,
          }),
        })
          .then(r => r.json())
          .then(d => { if (d.id) setConversationId(d.id) })
          .catch(() => {})
      }

      // Track learning
      brain.merge('learning', {
        lastTopic: text.slice(0, 100),
        messageCount: (brain.get('learning') as { messageCount?: number } | undefined)?.messageCount || 0 + 1,
        lastActive: new Date().toISOString(),
      })
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Something went wrong. Try again or check your connection.',
          source: 'local',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setFocus('idle')
    } finally {
      setLoading(false)
    }
  }, [pathname, vault.connectedServices, messages, conversationId, brain])

  // Vault save handler
  const handleVaultSave = useCallback((service: string, fields: Record<string, string>) => {
    for (const [key, value] of Object.entries(fields)) {
      vault.set(service, key, value)
    }
    setFocus('vault')
    setTimeout(() => {
      setFocus('idle')
      setVaultPromptService(null)
    }, 2000)
  }, [vault])

  // Don't render for unauthenticated users
  if (!authed) return null

  return (
    <div className="fixed bottom-5 right-5 z-[9500] flex flex-col items-end">
      {/* Chat panel */}
      {open && (
        <div className="mb-3">
          <OnCallChat
            messages={messages}
            loading={loading}
            onSend={handleSend}
            onClose={handleClose}
            focus={focus}
          />
          {/* Inline vault prompt */}
          {vaultPromptService && (
            <div className="px-3 -mt-1">
              <OnCallVaultPrompt
                serviceKey={vaultPromptService}
                onSave={handleVaultSave}
                onDismiss={() => setVaultPromptService(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* Suggestion cards */}
      {showSuggestions && !open && (
        <OnCallSuggestions
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          onDismiss={handleDismiss}
          onAutoClose={handleSuggestionsAutoClose}
        />
      )}

      {/* Icon */}
      <OnCallIcon
        focus={focus}
        onClick={handleIconClick}
        hasNotification={!open && suggestions.length > 0}
      />
    </div>
  )
}
