'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Bot, X } from 'lucide-react'
import {
  WizardProvider,
  useWizard,
  useWizardDispatch,
  type WizardStep,
} from './WizardContext'
import { ProgressBar } from './ProgressBar'
import WizardAIChat from './WizardAIChat'
import WizardLanding from './WizardLanding'
import { WizardThinkingTransition } from './WizardThinkingTransition'
import WizardTriggerStep from './WizardTriggerStep'

/* ──────────────────────────────────────────── */
/*  Lazy-loaded step components                */
/* ──────────────────────────────────────────── */

// These are imported with try/catch so the shell renders
// even if some step components have not been created yet.

let WizardActionsStep: React.ComponentType<Record<string, never>> | null = null
let WizardNotificationsStep: React.ComponentType<Record<string, never>> | null = null
let WizardFrequencyStep: React.ComponentType<Record<string, never>> | null = null
let WizardBuildSequence: React.ComponentType<{
  vault: WizardShellProps['vault']
  onComplete: () => void
}> | null = null
let WizardCredentialStep: React.ComponentType<{
  vault: WizardShellProps['vault']
}> | null = null
let WizardCompletion: React.ComponentType<{
  onDownload: (workflow: any, name: string) => void
  onAddToBuilder: (workflow: any) => void
  onAddToOperations: (workflow: any, name: string, trigger: string, services: string[], notifications: string[], frequency: string | null) => void
}> | null = null

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WizardActionsStep = require('./WizardActionsStep').default
} catch { /* not yet created */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WizardNotificationsStep = require('./WizardNotificationsStep').default
} catch { /* not yet created */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WizardFrequencyStep = require('./WizardFrequencyStep').default
} catch { /* not yet created */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WizardBuildSequence = require('./WizardBuildSequence').default
} catch { /* not yet created */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WizardCredentialStep = require('./WizardCredentialStep').default
} catch { /* not yet created */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WizardCompletion = require('./WizardCompletion').default
} catch { /* not yet created */ }

/* ──────────────────────────────────────────── */
/*  Step labels for progress bar               */
/* ──────────────────────────────────────────── */

// ProgressBar steps: Template, Trigger, Actions, Notify, Frequency, Build, Credentials, Done
// These are defined in ProgressBar.tsx itself.

/* ──────────────────────────────────────────── */
/*  Placeholder for missing step components    */
/* ──────────────────────────────────────────── */

function StepPlaceholder({ step }: { step: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        gap: 16,
        padding: 24,
      }}
    >
      <span
        style={{
          fontSize: '2rem',
          color: 'var(--text-muted)',
        }}
      >
        {step.charAt(0).toUpperCase() + step.slice(1)}
      </span>
      <span
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}
      >
        This step component is coming soon.
      </span>
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Props                                      */
/* ──────────────────────────────────────────── */

export interface WizardShellProps {
  vault: {
    credentials: Record<string, Record<string, string>>
    set: (s: string, k: string, v: string) => void
    isConnected: (s: string) => boolean
    connectedServices: string[]
  }
  historyHook?: {
    entries: Array<Record<string, unknown>>
    add: (entry: Record<string, unknown>) => void
  }
  onDownload: (workflow: any, name: string) => void
  onAddToBuilder: (workflow: any) => void
  onAddToOperations: (
    workflow: Record<string, unknown>,
    name?: string,
    trigger?: string,
    services?: string[],
    notifications?: string[],
    frequency?: string | null
  ) => void
  setView?: (v: string) => void
}

/* ──────────────────────────────────────────── */
/*  Inner Shell (uses wizard context)          */
/* ──────────────────────────────────────────── */

function WizardShellInner({
  vault,
  historyHook,
  onDownload,
  onAddToBuilder,
  onAddToOperations,
  setView,
}: WizardShellProps) {
  const state = useWizard()
  const dispatch = useWizardDispatch()
  const [chatOpen, setChatOpen] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const prevStepRef = useRef<WizardStep>(state.step)

  // Handle step transition with thinking animation
  // When the step changes forward, show WizardThinkingTransition for 2 seconds.
  // Going BACK skips the transition.
  useEffect(() => {
    const prev = prevStepRef.current
    const current = state.step

    // Update ref
    prevStepRef.current = current

    // The 'thinking' step is already an intermediate step handled by WizardContext.
    // We don't need additional transition logic for it since the context handles
    // START_THINKING -> FINISH_THINKING flow.
  }, [state.step])

  const handleThinkingComplete = useCallback(() => {
    dispatch({ type: 'FINISH_THINKING' })
  }, [dispatch])

  const handleBuildComplete = useCallback(() => {
    // The build sequence component calls this when all build steps are done.
    // SET_GENERATED_WORKFLOW advances state to credentials or completion.
  }, [])

  /* -- Render the current step ────────────────── */
  const renderStep = () => {
    switch (state.step) {
      case 'landing':
        return <WizardLanding />

      case 'thinking':
        return <WizardThinkingTransition onComplete={handleThinkingComplete} />

      case 'trigger':
        return <WizardTriggerStep />

      case 'actions':
        return WizardActionsStep ? (
          <WizardActionsStep />
        ) : (
          <StepPlaceholder step="actions" />
        )

      case 'notifications':
        return WizardNotificationsStep ? (
          <WizardNotificationsStep />
        ) : (
          <StepPlaceholder step="notifications" />
        )

      case 'frequency':
        return WizardFrequencyStep ? (
          <WizardFrequencyStep />
        ) : (
          <StepPlaceholder step="frequency" />
        )

      case 'building':
        return WizardBuildSequence ? (
          <WizardBuildSequence vault={vault} onComplete={handleBuildComplete} />
        ) : (
          <StepPlaceholder step="building" />
        )

      case 'credentials':
        return WizardCredentialStep ? (
          <WizardCredentialStep vault={vault} />
        ) : (
          <StepPlaceholder step="credentials" />
        )

      case 'completion':
        return WizardCompletion ? (
          <WizardCompletion
            onDownload={onDownload}
            onAddToBuilder={onAddToBuilder}
            onAddToOperations={(workflow, name, trigger, services, notifications, frequency) => {
              onAddToOperations(workflow, name, trigger, services, notifications, frequency)
              // Record in history if available
              if (historyHook) {
                historyHook.add({
                  type: 'wizard-workflow',
                  name,
                  trigger,
                  services,
                  createdAt: new Date().toISOString(),
                })
              }
            }}
          />
        ) : (
          <StepPlaceholder step="completion" />
        )

      default:
        return <StepPlaceholder step={state.step} />
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        position: 'relative',
      }}
    >
      {/* Main grid layout: grid-cols-1 lg:grid-cols-[380px_1fr] */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          minHeight: 0,
          overflow: 'hidden',
        }}
        className="wizard-shell-grid"
      >
        {/* Left column: AI Chat -- hidden on mobile, shown on lg+ */}
        <div
          className="wizard-chat-panel"
          style={{
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <WizardAIChat />
        </div>

        {/* Right column: ProgressBar at top + current step component */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Progress bar at top */}
          <div
            style={{
              padding: '12px 16px 8px',
              flexShrink: 0,
            }}
          >
            <ProgressBar
              currentStep={state.step}
              thinkingNextStep={state.thinkingNextStep}
            />
          </div>

          {/* Step content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            <div
              key={state.step}
              style={{
                animation: 'wizard-step-enter 0.3s ease',
              }}
            >
              {renderStep()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: floating button to toggle chat as a slide-over panel */}
      <button
        onClick={() => setChatOpen(true)}
        className="wizard-mobile-toggle"
        style={{
          position: 'absolute',
          bottom: 20,
          left: 16,
          width: 48,
          height: 48,
          borderRadius: 16,
          border: '1px solid var(--accent)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--accent)',
          display: 'none', // shown via media query
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 255, 136, 0.2)',
          zIndex: 30,
          transition: 'transform 0.2s ease',
        }}
      >
        <Bot size={22} />
      </button>

      {/* Mobile chat slide-over overlay */}
      {chatOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setChatOpen(false)}
            className="wizard-mobile-overlay-backdrop"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(10, 10, 15, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 40,
              display: 'none', // shown via media query
            }}
          />

          {/* Slide-up panel */}
          <div
            className="wizard-mobile-overlay-panel"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '75%',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border)',
              borderRadius: '20px 20px 0 0',
              zIndex: 50,
              display: 'none', // shown via media query
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'wizard-slide-up 0.3s ease',
            }}
          >
            {/* Close button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '8px 12px 0',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat inside overlay */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <WizardAIChat />
            </div>
          </div>
        </>
      )}

      {/* Responsive styles and animations */}
      <style>{`
        @keyframes wizard-step-enter {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes wizard-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        /* Desktop: two-column grid -- grid-cols-[380px_1fr] */
        .wizard-shell-grid {
          grid-template-columns: 380px 1fr;
        }

        .wizard-chat-panel {
          display: flex !important;
          flex-direction: column;
        }

        .wizard-mobile-toggle {
          display: none !important;
        }

        .wizard-mobile-overlay-backdrop {
          display: none !important;
        }

        .wizard-mobile-overlay-panel {
          display: none !important;
        }

        /* Mobile: single column, show toggle + overlay */
        @media (max-width: 1023px) {
          .wizard-shell-grid {
            grid-template-columns: 1fr;
          }

          .wizard-chat-panel {
            display: none !important;
          }

          .wizard-mobile-toggle {
            display: flex !important;
          }

          .wizard-mobile-overlay-backdrop {
            display: block !important;
          }

          .wizard-mobile-overlay-panel {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Exported Shell (wraps with WizardProvider) */
/* ──────────────────────────────────────────── */

export default function WizardShell(props: WizardShellProps) {
  return (
    <WizardProvider>
      <WizardShellInner {...props} />
    </WizardProvider>
  )
}
