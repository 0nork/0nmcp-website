'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Circle, Loader2, CheckCircle2 } from 'lucide-react'
import { useWizard, useWizardDispatch } from './WizardContext'

type StepStatus = 'pending' | 'building' | 'complete'

interface BuildStep {
  label: string
  status: StepStatus
}

interface WizardBuildSequenceProps {
  onComplete: () => void
  vault: Record<string, Record<string, string>>
}

const DEFAULT_BUILD_STEPS: BuildStep[] = [
  { label: 'Analyzing requirements', status: 'pending' },
  { label: 'Selecting optimal services', status: 'pending' },
  { label: 'Generating workflow logic', status: 'pending' },
  { label: 'Building .0n SWITCH file', status: 'pending' },
  { label: 'Configuring triggers', status: 'pending' },
  { label: 'Setting up notifications', status: 'pending' },
  { label: 'Finalizing deployment', status: 'pending' },
]

export default function WizardBuildSequence({
  onComplete,
  vault,
}: WizardBuildSequenceProps) {
  const state = useWizard()
  const dispatch = useWizardDispatch()
  const [steps, setSteps] = useState<BuildStep[]>(
    () => DEFAULT_BUILD_STEPS.map((s) => ({ ...s }))
  )
  const [progress, setProgress] = useState(0)
  const [apiDone, setApiDone] = useState(false)
  const [animationDone, setAnimationDone] = useState(false)
  const apiResultRef = useRef<{ workflow: any; credentialQueue: string[] } | null>(null)
  const animationStartedRef = useRef(false)

  const totalSteps = steps.length
  const STEP_BUILD_DELAY = 400
  const STEP_COMPLETE_DELAY = 300
  const MIN_TOTAL_MS = 3000

  // Animate through the steps sequentially
  const runAnimation = useCallback(() => {
    if (animationStartedRef.current) return
    animationStartedRef.current = true

    const startTime = Date.now()
    let currentIdx = 0

    function advanceStep() {
      if (currentIdx >= totalSteps) {
        // Ensure minimum total time
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, MIN_TOTAL_MS - elapsed)
        setTimeout(() => {
          setProgress(100)
          setAnimationDone(true)
        }, remaining)
        return
      }

      // Set current step to building
      setSteps((prev) =>
        prev.map((s, i) => (i === currentIdx ? { ...s, status: 'building' } : s))
      )
      setProgress(Math.round(((currentIdx + 0.5) / totalSteps) * 100))

      // After delay, mark complete and advance
      setTimeout(() => {
        setSteps((prev) =>
          prev.map((s, i) =>
            i === currentIdx ? { ...s, status: 'complete' } : s
          )
        )
        setProgress(Math.round(((currentIdx + 1) / totalSteps) * 100))
        currentIdx++

        setTimeout(advanceStep, STEP_BUILD_DELAY)
      }, STEP_COMPLETE_DELAY)
    }

    // Start after brief initial pause
    setTimeout(advanceStep, 200)
  }, [totalSteps])

  // Fire the API call and start the animation on mount
  useEffect(() => {
    runAnimation()

    const body = {
      template: state.template,
      trigger: state.trigger,
      actions: state.actions,
      actionDescription: state.actionDescription,
      notifications: state.notifications,
      frequency: state.frequency,
    }

    fetch('/api/console/wizard/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Build failed')
        return res.json()
      })
      .then((data) => {
        apiResultRef.current = {
          workflow: data.workflow ?? data,
          credentialQueue: data.credentialQueue ?? [],
        }
        setApiDone(true)
      })
      .catch((err) => {
        console.error('Wizard build error:', err)
        // Build a fallback workflow from the current state
        const fallbackWorkflow = {
          name: state.template?.name ?? 'Custom Workflow',
          version: '1.0.0',
          trigger: state.trigger?.id ?? 'manual',
          actions: state.actions,
          notifications: state.notifications,
          frequency: state.frequency,
        }
        apiResultRef.current = {
          workflow: fallbackWorkflow,
          credentialQueue: state.actions.filter(
            (svc) => !vault[svc] || Object.keys(vault[svc]).length === 0
          ),
        }
        setApiDone(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When both the API and animation are done, dispatch and advance
  useEffect(() => {
    if (!apiDone || !animationDone) return
    if (!apiResultRef.current) return

    const { workflow, credentialQueue } = apiResultRef.current

    // Brief pause for the user to see 100%, then dispatch
    // SET_GENERATED_WORKFLOW handles the step transition internally
    // (to 'credentials' if credentialQueue has items, else 'completion')
    setTimeout(() => {
      dispatch({ type: 'SET_GENERATED_WORKFLOW', workflow, credentialQueue })
      onComplete()
    }, 400)
  }, [apiDone, animationDone, dispatch, onComplete])

  return (
    <div
      style={{
        padding: '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '360px',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      {/* Build step checklist */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {steps.map((step, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'console-stagger-in 0.4s ease both',
              animationDelay: `${index * 60}ms`,
            }}
          >
            {/* Status icon */}
            <div style={{ flexShrink: 0, width: '20px', height: '20px' }}>
              {step.status === 'pending' && (
                <Circle
                  size={20}
                  style={{ color: 'var(--text-muted)', opacity: 0.4 }}
                />
              )}
              {step.status === 'building' && (
                <Loader2
                  size={20}
                  style={{
                    color: 'var(--accent)',
                    animation: 'wizard-spin 1s linear infinite',
                  }}
                />
              )}
              {step.status === 'complete' && (
                <CheckCircle2
                  size={20}
                  style={{ color: '#22c55e' }}
                />
              )}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: '0.875rem',
                color:
                  step.status === 'complete'
                    ? 'var(--text-primary)'
                    : step.status === 'building'
                      ? 'var(--accent)'
                      : 'var(--text-muted)',
                transition: 'color 0.3s ease',
                fontWeight: step.status === 'building' ? 600 : 400,
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress percentage */}
      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '28px',
          fontFamily: 'var(--font-mono)',
          transition: 'opacity 0.3s ease',
        }}
      >
        {progress}% complete
      </p>

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-stagger-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wizard-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
