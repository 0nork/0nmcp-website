'use client'

import type { WizardStep } from './WizardContext'

/* ─── Internal step list used for mapping WizardStep ─ */

const INTERNAL_STEPS: { key: WizardStep; label: string }[] = [
  { key: 'landing', label: 'Template' },
  { key: 'trigger', label: 'Trigger' },
  { key: 'actions', label: 'Actions' },
  { key: 'notifications', label: 'Notify' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'building', label: 'Build' },
  { key: 'credentials', label: 'Creds' },
  { key: 'completion', label: 'Done' },
]

/* ─── Prop interfaces ───────────────────────────── */

interface ProgressBarProps {
  /** Step label strings for each dot. Falls back to internal list when absent. */
  steps?: string[]
  /** Zero-based index of the currently active step. */
  currentIndex?: number
  /** Indexes that are completed (filled accent). */
  completedIndexes?: number[]
  /** Alternatively, pass the WizardStep key (backward compat with WizardShell). */
  currentStep?: WizardStep
  /** If using the thinking transition, the step that will be entered next. */
  thinkingNextStep?: WizardStep | null
  className?: string
}

/* ─── Helpers ───────────────────────────────────── */

function stepIndexFromKey(
  step: WizardStep | undefined,
  thinkingNext: WizardStep | null | undefined
): number {
  if (!step) return 0
  // "thinking" is a transient step; map it to the next real step
  if ((step as string) === 'thinking' && thinkingNext) {
    const idx = INTERNAL_STEPS.findIndex((s) => s.key === thinkingNext)
    return idx >= 0 ? idx : 0
  }
  const idx = INTERNAL_STEPS.findIndex((s) => s.key === step)
  return idx >= 0 ? idx : 0
}

/* ─── Component ─────────────────────────────────── */

export function ProgressBar({
  steps,
  currentIndex,
  completedIndexes,
  currentStep,
  thinkingNextStep,
  className,
}: ProgressBarProps) {
  /* Resolve the active index — either from explicit prop or from WizardStep key */
  const resolvedActiveIndex =
    currentIndex !== undefined
      ? currentIndex
      : stepIndexFromKey(currentStep, thinkingNextStep)

  /* Resolve step labels */
  const labels = steps ?? INTERNAL_STEPS.map((s) => s.label)

  /* Resolve completed set */
  const completedSet = new Set(
    completedIndexes ??
      Array.from({ length: resolvedActiveIndex }, (_, i) => i)
  )

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 0,
        width: '100%',
        padding: '0 8px',
      }}
    >
      {labels.map((label, i) => {
        const isCompleted = completedSet.has(i)
        const isActive = i === resolvedActiveIndex
        const isUpcoming = !isCompleted && !isActive
        const isLast = i === labels.length - 1

        return (
          <div
            key={`${label}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              flex: isLast ? '0 0 auto' : '1 1 0',
            }}
          >
            {/* Dot + label column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                minWidth: 10,
              }}
            >
              {/* Dot */}
              <span
                style={{
                  position: 'relative',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor:
                    isCompleted || isActive ? 'var(--accent)' : 'transparent',
                  border: isUpcoming
                    ? '1px solid var(--text-muted)'
                    : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      inset: -3,
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                      opacity: 0.3,
                      animation: 'wizardPulse 2s ease-in-out infinite',
                    }}
                  />
                )}
              </span>

              {/* Label — visible on md+ */}
              <span
                className="progress-bar-label"
                style={{
                  fontSize: '0.5625rem',
                  lineHeight: 1,
                  color: isActive
                    ? 'var(--text-primary)'
                    : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </span>
            </div>

            {/* Connecting line (2px visual, 1px actual for crispness) */}
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginTop: 4,
                  marginLeft: 4,
                  marginRight: 4,
                  backgroundColor: isCompleted
                    ? 'var(--accent)'
                    : 'var(--border)',
                  transition: 'background-color 300ms ease',
                }}
              />
            )}
          </div>
        )
      })}

      {/* Animations + responsive label visibility */}
      <style>{`
        @keyframes wizardPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.6); opacity: 0; }
        }

        @media (max-width: 639px) {
          .progress-bar-label {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
