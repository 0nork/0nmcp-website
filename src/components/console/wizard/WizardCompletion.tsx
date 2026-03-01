'use client'

import { Sparkles, Download, Blocks, Activity } from 'lucide-react'
import { useWizard, useWizardDispatch } from './WizardContext'
import { GlossyTile } from './GlossyTile'

interface WizardCompletionProps {
  onDownload: (workflow: any, name: string) => void
  onAddToBuilder: (workflow: any) => void
  onAddToOperations: (
    workflow: any,
    name: string,
    trigger: string,
    services: string[],
    notifications: string[],
    frequency: string | null
  ) => void
}

export default function WizardCompletion({
  onDownload,
  onAddToBuilder,
  onAddToOperations,
}: WizardCompletionProps) {
  const state = useWizard()
  const dispatch = useWizardDispatch()

  const workflowName =
    state.generatedWorkflow?.name ?? state.template?.name ?? 'Custom Workflow'
  const triggerLabel = state.trigger?.label ?? 'Manual'
  const triggerType = state.trigger?.id ?? 'manual'
  const servicesCount = state.actions.length
  const stepsCount =
    (state.generatedWorkflow?.steps?.length as number) ??
    state.actions.length + 1
  const frequencyLabel = state.frequency ?? null

  function handleDownload() {
    onDownload(state.generatedWorkflow, workflowName)
  }

  function handleAddToBuilder() {
    onAddToBuilder(state.generatedWorkflow)
  }

  function handleAddToOperations() {
    onAddToOperations(
      state.generatedWorkflow,
      workflowName,
      triggerType,
      state.actions,
      state.notifications,
      frequencyLabel
    )
  }

  function handleReset() {
    dispatch({ type: 'RESET' })
  }

  return (
    <div
      style={{
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      {/* Accent glow background */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(126, 217, 87, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'wizard-glow-pulse 3s ease-in-out infinite',
        }}
      />

      {/* Celebration header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
          animation: 'wizard-celebrate 0.6s ease both',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Sparkles
          size={28}
          style={{
            color: 'var(--accent)',
            filter: 'drop-shadow(0 0 8px var(--accent-glow))',
          }}
        />
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Your workflow is ready!
        </h2>
        <Sparkles
          size={28}
          style={{
            color: 'var(--accent-secondary)',
            filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.3))',
          }}
        />
      </div>

      {/* Workflow name highlight */}
      <p
        style={{
          fontSize: '1rem',
          color: 'var(--accent)',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          marginBottom: '4px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {workflowName}
      </p>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Choose how to save or use your new automation.
      </p>

      {/* Three big action tiles */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Download .0n File */}
        <div
          style={{
            width: '200px',
            animation: 'console-stagger-in 0.4s ease both',
            animationDelay: '100ms',
          }}
        >
          <GlossyTile
            icon={Download}
            label="Download .0n"
            sublabel="Save as a portable SWITCH file"
            onClick={handleDownload}
            size="md"
          />
        </div>

        {/* Add to Builder */}
        <div
          style={{
            width: '200px',
            animation: 'console-stagger-in 0.4s ease both',
            animationDelay: '200ms',
          }}
        >
          <GlossyTile
            icon={Blocks}
            label="Add to Builder"
            sublabel="Open in the visual workflow editor"
            onClick={handleAddToBuilder}
            size="md"
          />
        </div>

        {/* Add to Operations */}
        <div
          style={{
            width: '200px',
            animation: 'console-stagger-in 0.4s ease both',
            animationDelay: '300ms',
          }}
        >
          <GlossyTile
            icon={Activity}
            label="Add to Operations"
            sublabel="Save and manage from Operations"
            onClick={handleAddToOperations}
            size="md"
          />
        </div>
      </div>

      {/* Workflow summary */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px',
          animation: 'console-stagger-in 0.4s ease both',
          animationDelay: '400ms',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <h4
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 12px 0',
          }}
        >
          Workflow Summary
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                margin: '0 0 2px 0',
              }}
            >
              Name
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {workflowName}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                margin: '0 0 2px 0',
              }}
            >
              Trigger
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {triggerLabel}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                margin: '0 0 2px 0',
              }}
            >
              Services
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--accent)',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {servicesCount}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                margin: '0 0 2px 0',
              }}
            >
              Steps
            </p>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--accent-secondary)',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {stepsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Start Over link */}
      <button
        onClick={handleReset}
        style={{
          marginTop: '24px',
          background: 'none',
          border: 'none',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px 0',
          transition: 'color 0.2s ease',
          position: 'relative',
          zIndex: 1,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        Start Over
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
        @keyframes wizard-celebrate {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          60% { transform: scale(1.02) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes wizard-glow-pulse {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.15); }
        }
      `}</style>
    </div>
  )
}
