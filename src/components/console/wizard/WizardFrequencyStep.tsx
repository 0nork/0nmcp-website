'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Clock,
  Sun,
  Calendar,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { useWizard, useWizardDispatch } from './WizardContext'
import { GlossyTile } from './GlossyTile'

interface FrequencyOption {
  id: string
  label: string
  icon: LucideIcon
  description: string
  type: string
  cron?: string
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    id: 'realtime',
    label: 'Real-time',
    icon: Zap,
    description: 'Instant execution',
    type: 'realtime',
  },
  {
    id: 'hourly',
    label: 'Every Hour',
    icon: Clock,
    description: 'Runs each hour',
    type: 'cron',
    cron: '0 * * * *',
  },
  {
    id: 'daily',
    label: 'Daily',
    icon: Sun,
    description: 'Once per day at midnight',
    type: 'cron',
    cron: '0 0 * * *',
  },
  {
    id: 'weekly',
    label: 'Weekly',
    icon: Calendar,
    description: 'Every Monday at 9am',
    type: 'cron',
    cron: '0 9 * * 1',
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: Settings,
    description: 'Set your own schedule',
    type: 'custom',
  },
]

export default function WizardFrequencyStep() {
  const state = useWizard()
  const dispatch = useWizardDispatch()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [customCron, setCustomCron] = useState('0 */4 * * *')

  const selectedOption = FREQUENCY_OPTIONS.find((o) => o.id === selectedId)

  function handleSelect(option: FrequencyOption) {
    setSelectedId(option.id)
  }

  function handleContinue() {
    if (!selectedOption) return
    const frequency: { type: string; cron?: string } = {
      type: selectedOption.type,
    }
    if (selectedOption.type === 'cron' && selectedOption.cron) {
      frequency.cron = selectedOption.cron
    }
    if (selectedOption.type === 'custom') {
      frequency.type = 'cron'
      frequency.cron = customCron
    }
    dispatch({ type: 'SET_FREQUENCY', frequency })
    dispatch({ type: 'START_THINKING', nextStep: 'building' })
  }

  function handleBack() {
    dispatch({ type: 'GO_BACK' })
  }

  const canContinue =
    selectedId !== null &&
    (selectedId !== 'custom' || customCron.trim().length > 0)

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
        How often should this run?
      </h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: '6px 0 20px 0',
        }}
      >
        Set the execution frequency for your workflow.
      </p>

      {/* Frequency grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {FREQUENCY_OPTIONS.map((option, index) => (
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
              onClick={() => handleSelect(option)}
              selected={selectedId === option.id}
            />
          </div>
        ))}
      </div>

      {/* Custom cron input */}
      {selectedId === 'custom' && (
        <div
          style={{
            marginBottom: '24px',
            animation: 'console-fade-in 0.3s ease',
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}
          >
            Cron Expression
          </label>
          <input
            type="text"
            value={customCron}
            onChange={(e) => setCustomCron(e.target.value)}
            placeholder="0 */4 * * *"
            style={{
              width: '100%',
              maxWidth: '320px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = 'var(--accent)')
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = 'var(--border)')
            }
          />
          <p
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              marginTop: '6px',
            }}
          >
            Format: minute hour day month weekday (e.g. &quot;0 */4 * * *&quot; = every 4 hours)
          </p>
        </div>
      )}

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
