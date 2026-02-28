'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useWizard, useWizardDispatch } from './WizardContext'
import { GlossyTile } from './GlossyTile'
import { SVC, SERVICE_KEYS } from '@/lib/console/services'

/** Recommendations based on trigger ID */
const TRIGGER_RECOMMENDATIONS: Record<string, { service: string; pct: string }> = {
  webhook: { service: 'slack', pct: '72%' },
  schedule: { service: 'anthropic', pct: '84%' },
  form_submission: { service: 'crm', pct: '78%' },
  new_contact: { service: 'sendgrid', pct: '69%' },
  payment_received: { service: 'slack', pct: '81%' },
  email_received: { service: 'anthropic', pct: '76%' },
  message_received: { service: 'anthropic', pct: '72%' },
  manual: { service: 'anthropic', pct: '88%' },
  github_event: { service: 'slack', pct: '85%' },
  database_change: { service: 'slack', pct: '74%' },
}

/** Get a first-letter icon fallback for services without a mapped Lucide icon */
function ServiceLetterIcon({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        backgroundColor: color + '22',
        color,
      }}
    >
      {label.slice(0, 2)}
    </span>
  )
}

export default function WizardActionsStep() {
  const state = useWizard()
  const dispatch = useWizardDispatch()
  const [selected, setSelected] = useState<string[]>(
    state.template?.defaultActions ?? state.actions ?? []
  )
  const [description, setDescription] = useState(state.actionDescription || '')

  const triggerId = state.trigger?.id ?? ''
  const recommendation = TRIGGER_RECOMMENDATIONS[triggerId]

  function toggleService(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function handleContinue() {
    if (description.trim().length > 0) {
      dispatch({ type: 'SET_ACTION_DESCRIPTION', description })
    }
    if (selected.length > 0) {
      dispatch({ type: 'SET_ACTIONS', actions: selected })
    }
    dispatch({ type: 'START_THINKING', nextStep: 'notifications' })
  }

  function handleBack() {
    dispatch({ type: 'GO_BACK' })
  }

  const canContinue = selected.length > 0 || description.trim().length > 0

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
        What should happen next?
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: '6px 0 20px 0',
        }}
      >
        Describe your workflow or pick the services it should use.
      </p>

      {/* Description textarea */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you want this workflow to do in plain language..."
          rows={4}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = 'var(--accent)')
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = 'var(--border)')
          }
        />
      </div>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'var(--border)',
          }}
        />
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          Or pick services
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'var(--border)',
          }}
        />
      </div>

      {/* Recommendation banner */}
      {recommendation && !selected.includes(recommendation.service) && SVC[recommendation.service] && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 255, 136, 0.06)',
            border: '1px solid rgba(0, 255, 136, 0.15)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'console-fade-in 0.3s ease',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            {recommendation.pct} of users also add{' '}
            <span
              style={{
                color: 'var(--accent)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => toggleService(recommendation.service)}
            >
              {SVC[recommendation.service].l}
            </span>
          </span>
        </div>
      )}

      {/* Selected count */}
      {selected.length > 0 && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}
        >
          {selected.length} service{selected.length !== 1 ? 's' : ''} selected
        </p>
      )}

      {/* Service grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {SERVICE_KEYS.map((svcKey, index) => {
          const service = SVC[svcKey]
          const isSelected = selected.includes(svcKey)

          return (
            <div
              key={svcKey}
              style={{
                animation: 'console-stagger-in 0.4s ease both',
                animationDelay: `${index * 30}ms`,
              }}
            >
              <GlossyTile
                icon={() => (
                  <ServiceLetterIcon label={service.l} color={service.c} />
                )}
                label={service.l}
                onClick={() => toggleService(svcKey)}
                selected={isSelected}
                brandColor={service.c}
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
