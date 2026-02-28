'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  MessageSquare,
  Webhook,
  Phone,
  MessageCircle,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useWizard, useWizardDispatch } from './WizardContext'
import { GlossyTile } from './GlossyTile'

interface NotificationOption {
  id: string
  label: string
  icon: LucideIcon
  description: string
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  { id: 'email', label: 'Email', icon: Mail, description: 'Email notifications' },
  { id: 'slack', label: 'Slack', icon: MessageSquare, description: 'Slack channel alerts' },
  { id: 'webhook', label: 'Webhook', icon: Webhook, description: 'Custom HTTP callback' },
  { id: 'sms', label: 'SMS', icon: Phone, description: 'Text message alerts' },
  { id: 'discord', label: 'Discord', icon: MessageCircle, description: 'Discord server alerts' },
  { id: 'none', label: 'None', icon: X, description: 'No notifications' },
]

export default function WizardNotificationsStep() {
  const state = useWizard()
  const dispatch = useWizardDispatch()
  const [selected, setSelected] = useState<string[]>(
    state.template?.defaultNotifications ?? state.notifications ?? []
  )

  function toggleNotification(id: string) {
    if (id === 'none') {
      // "None" deselects everything else
      setSelected(['none'])
      return
    }
    // Any real selection removes "none"
    setSelected((prev) => {
      const without = prev.filter((s) => s !== 'none')
      if (without.includes(id)) {
        return without.filter((s) => s !== id)
      }
      return [...without, id]
    })
  }

  function handleContinue() {
    const finalSelection = selected.filter((s) => s !== 'none')
    dispatch({ type: 'SET_NOTIFICATIONS', notifications: finalSelection })

    // If the trigger already defines its own frequency (event-driven),
    // skip the frequency step and go straight to building.
    const triggerDefinesFrequency = state.trigger?.definesFrequency ?? false
    if (triggerDefinesFrequency) {
      dispatch({ type: 'START_THINKING', nextStep: 'building' })
    } else {
      dispatch({ type: 'START_THINKING', nextStep: 'frequency' })
    }
  }

  function handleBack() {
    dispatch({ type: 'GO_BACK' })
  }

  const canContinue = selected.length > 0

  return (
    <div
      style={{
        padding: '24px',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      {/* Back button */}
      <button
        onClick={handleBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          cursor: 'pointer',
          padding: '4px 0',
          marginBottom: '16px',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Header */}
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        How should you be notified?
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: '6px 0 20px 0',
        }}
      >
        Choose notification channels for when this workflow runs.
      </p>

      {/* Notification grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {NOTIFICATION_OPTIONS.map((option, index) => {
          const isSelected = selected.includes(option.id)
          return (
            <div
              key={option.id}
              style={{
                animation: 'console-stagger-in 0.4s ease both',
                animationDelay: `${index * 40}ms`,
              }}
            >
              <GlossyTile
                icon={option.icon}
                label={option.label}
                sublabel={option.description}
                onClick={() => toggleNotification(option.id)}
                selected={isSelected}
              />
            </div>
          )
        })}
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!canContinue}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 24px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: canContinue ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          backgroundColor: canContinue ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
          color: canContinue ? 'var(--bg-primary)' : 'var(--text-muted)',
          opacity: canContinue ? 1 : 0.5,
        }}
      >
        Continue
        <ArrowRight size={14} />
      </button>

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-stagger-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
