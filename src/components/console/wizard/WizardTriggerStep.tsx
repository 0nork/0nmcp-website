'use client'

import {
  ArrowLeft,
  Webhook,
  Clock,
  FileText,
  UserPlus,
  CreditCard,
  Mail,
  MessageSquare,
  Play,
  Database,
  type LucideIcon,
} from 'lucide-react'
import { GitBranch } from 'lucide-react'
import { useWizard, useWizardDispatch } from './WizardContext'
import { GlossyTile } from './GlossyTile'
import { WIZARD_TRIGGERS, type TriggerDefinition } from '@/data/wizard-triggers'

/** Map trigger icon strings to Lucide components */
const TRIGGER_ICON_MAP: Record<string, LucideIcon> = {
  Globe: Webhook,
  Webhook,
  Clock,
  FileInput: FileText,
  FileText,
  UserPlus,
  CreditCard,
  Mail,
  MessageSquare,
  Play,
  GitBranch,
  Github: GitBranch,
  Database,
}

export default function WizardTriggerStep() {
  const state = useWizard()
  const dispatch = useWizardDispatch()

  const defaultTriggerId = state.template?.defaultTrigger ?? null

  function handleSelectTrigger(trigger: TriggerDefinition) {
    dispatch({ type: 'SELECT_TRIGGER', trigger })
    dispatch({ type: 'START_THINKING', nextStep: 'actions' })
  }

  function handleBack() {
    dispatch({ type: 'GO_BACK' })
  }

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
        What should start this workflow?
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: '6px 0 20px 0',
        }}
      >
        Select what kicks off the automation.
      </p>

      {/* Trigger grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
          gap: '16px',
        }}
      >
        {WIZARD_TRIGGERS.map((trigger, index) => {
          const isPreSelected = defaultTriggerId === trigger.id
          const IconComponent = TRIGGER_ICON_MAP[trigger.icon]

          return (
            <div
              key={trigger.id}
              style={{
                animation: 'console-stagger-in 0.4s ease both',
                animationDelay: `${index * 40}ms`,
              }}
            >
              <GlossyTile
                icon={IconComponent || trigger.icon}
                label={trigger.label}
                sublabel={trigger.description}
                onClick={() => handleSelectTrigger(trigger)}
                highlighted={isPreSelected}
              />
            </div>
          )
        })}
      </div>

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
