'use client'

import { useEffect, useRef } from 'react'

interface WizardThinkingTransitionProps {
  /** Text shown below the spinner. Defaults to "AI is thinking..." */
  message?: string
  /** Called after the 2-second minimum display time elapses. */
  onComplete: () => void
}

export function WizardThinkingTransition({
  message = 'AI is thinking...',
  onComplete,
}: WizardThinkingTransitionProps) {
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    const timer = setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true
        onComplete()
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        gap: 24,
      }}
    >
      {/* Spinner ring + dots container */}
      <div
        style={{
          position: 'relative',
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Rotating accent ring */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'var(--accent)',
            borderRightColor: 'rgba(0, 255, 136, 0.3)',
            animation: 'wizardSpin 1.2s linear infinite',
          }}
        />

        {/* Three pulsing dots */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {[0, 0.15, 0.3].map((delay, i) => (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                animation: 'wizardDotPulse 1.2s ease-in-out infinite',
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Message text */}
      <span
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.01em',
        }}
      >
        {message}
      </span>

      {/* Keyframe animations */}
      <style>{`
        @keyframes wizardSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes wizardDotPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
