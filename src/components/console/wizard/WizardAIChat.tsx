'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bot, Send, User } from 'lucide-react'
import { useWizard, useWizardDispatch, type WizardStep, type WizardChatMessage } from './WizardContext'

/* ──────────────────────────────────────────── */
/*  Step Greetings                             */
/* ──────────────────────────────────────────── */

const STEP_GREETINGS: Record<WizardStep, string> = {
  landing:
    "Hey! I'm your workflow wizard. What kind of automation are you looking to build? Pick a template on the right, or tell me what you need.",
  trigger:
    'Great choice! Now let\'s pick what triggers this workflow. What event should kick things off?',
  thinking: '',
  actions:
    "Now let's decide what happens. Select the services you want to connect, or describe your ideal workflow.",
  notifications:
    'Almost there! How do you want to be notified when this runs?',
  frequency:
    'Last configuration step -- how often should this workflow run?',
  building:
    'Building your workflow now... sit tight!',
  credentials:
    "Let's connect the services that need credentials.",
  completion:
    'Your workflow is ready! Choose how you\'d like to save it.',
}

/* ──────────────────────────────────────────── */
/*  Props                                      */
/* ──────────────────────────────────────────── */

interface WizardAIChatProps {
  wizardState?: never // state comes from context
  className?: string
}

/* ──────────────────────────────────────────── */
/*  Main Component                             */
/* ──────────────────────────────────────────── */

export default function WizardAIChat({ className }: WizardAIChatProps) {
  const state = useWizard()
  const dispatch = useWizardDispatch()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastGreetedStepRef = useRef<WizardStep | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.aiMessages])

  // Auto-greet on step change
  useEffect(() => {
    if (state.step === 'thinking') return
    if (lastGreetedStepRef.current === state.step) return

    const greeting = STEP_GREETINGS[state.step]
    if (!greeting) return

    lastGreetedStepRef.current = state.step

    dispatch({
      type: 'ADD_AI_MESSAGE',
      message: {
        role: 'assistant',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    })
  }, [state.step, dispatch])

  // Build wizard state summary for the API
  const getWizardStateSummary = useCallback(() => {
    return {
      step: state.step,
      template: state.template
        ? { name: state.template.name, description: state.template.description }
        : null,
      trigger: state.trigger
        ? { label: state.trigger.label, description: state.trigger.description }
        : null,
      selectedServices: state.actions,
      notifications: state.notifications,
      frequency: state.frequency,
    }
  }, [state.step, state.template, state.trigger, state.actions, state.notifications, state.frequency])

  // Build conversation history for the API
  const getConversationHistory = useCallback(() => {
    return state.aiMessages.slice(-12).map((m) => ({
      role: m.role,
      text: m.text,
    }))
  }, [state.aiMessages])

  // Send a message
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      // Add user message
      dispatch({
        type: 'ADD_AI_MESSAGE',
        message: {
          role: 'user',
          text: trimmed,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      })

      setInput('')
      setLoading(true)

      try {
        const res = await fetch('/api/console/wizard/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            wizardState: getWizardStateSummary(),
            history: getConversationHistory(),
          }),
        })

        const data = await res.json()

        // Add assistant response
        dispatch({
          type: 'ADD_AI_MESSAGE',
          message: {
            role: 'assistant',
            text: data.text || data.error || 'Unable to generate a response.',
            suggestions: data.suggestions && data.suggestions.length > 0
              ? data.suggestions
              : undefined,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        })
      } catch {
        dispatch({
          type: 'ADD_AI_MESSAGE',
          message: {
            role: 'assistant',
            text: 'Connection error. Check your network and try again.',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        })
      } finally {
        setLoading(false)
      }
    },
    [dispatch, getWizardStateSummary, getConversationHistory]
  )

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!loading) {
        sendMessage(input)
      }
    },
    [input, loading, sendMessage]
  )

  // Handle suggestion chip click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (!loading) {
        sendMessage(suggestion)
      }
    },
    [loading, sendMessage]
  )

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <Bot size={20} style={{ color: 'var(--accent)' }} />
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            letterSpacing: '0.02em',
          }}
        >
          0n Wizard
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minHeight: 0,
        }}
      >
        {state.aiMessages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            onSuggestionClick={handleSuggestionClick}
            loading={loading}
          />
        ))}

        {/* Loading indicator -- pulsing dots */}
        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
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
              <span style={{ animation: 'wizardChatDot 1s ease-in-out infinite', animationDelay: '0s', width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
              <span style={{ animation: 'wizardChatDot 1s ease-in-out infinite', animationDelay: '0.2s', width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
              <span style={{ animation: 'wizardChatDot 1s ease-in-out infinite', animationDelay: '0.4s', width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the wizard..."
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
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: 'none',
            backgroundColor:
              loading || !input.trim()
                ? 'rgba(255, 255, 255, 0.04)'
                : 'var(--accent)',
            color:
              loading || !input.trim()
                ? 'var(--text-muted)'
                : 'var(--bg-primary)',
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
        @keyframes wizardChatDot {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Message Bubble Sub-Component               */
/* ──────────────────────────────────────────── */

interface MessageBubbleProps {
  message: WizardChatMessage
  onSuggestionClick: (suggestion: string) => void
  loading: boolean
}

function MessageBubble({ message, onSuggestionClick, loading }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: 6,
        animation: 'wizardMsgIn 0.25s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          maxWidth: '92%',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {/* Avatar */}
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: isUser
              ? 'rgba(255, 107, 53, 0.15)'
              : 'rgba(0, 255, 136, 0.1)',
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

        {/* Bubble -- user: right-aligned muted bg; assistant: left-aligned card bg with accent border-left */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: isUser
              ? '14px 14px 4px 14px'
              : '14px 14px 14px 4px',
            backgroundColor: isUser
              ? 'rgba(255, 107, 53, 0.15)'
              : 'var(--bg-card)',
            border: isUser
              ? '1px solid rgba(255, 107, 53, 0.25)'
              : '1px solid var(--border)',
            borderLeft: isUser
              ? undefined
              : '3px solid var(--accent)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              lineHeight: 1.55,
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

      {/* Suggestion chips below the latest AI message */}
      {!isUser && message.suggestions && message.suggestions.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            paddingLeft: 36,
            maxWidth: '92%',
          }}
        >
          {message.suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => !loading && onSuggestionClick(suggestion)}
              disabled={loading}
              style={{
                padding: '5px 12px',
                borderRadius: 9999,
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--accent)',
                fontSize: '0.6875rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 255, 136, 0.1)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes wizardMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
