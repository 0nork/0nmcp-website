'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react'
import { useWizard, useWizardDispatch } from './WizardContext'
import { SVC } from '@/lib/console/services'

interface VaultHook {
  set: (service: string, key: string, value: string) => void
  get: (service: string, key: string) => string
  isConnected: (service: string) => boolean
  credentials: Record<string, Record<string, string>>
  connectedCount: number
  connectedServices: string[]
  disconnect: (service: string) => void
  clearAll: () => void
}

interface WizardCredentialStepProps {
  vault: VaultHook
}

export default function WizardCredentialStep({ vault }: WizardCredentialStepProps) {
  const state = useWizard()
  const dispatch = useWizardDispatch()
  const { credentialQueue, currentCredIndex } = state

  const currentServiceId = credentialQueue[currentCredIndex] ?? null
  const serviceDef = currentServiceId ? SVC[currentServiceId] : null

  // Determine accent color, avoiding white/near-white for dark theme
  const accentColor = serviceDef
    ? serviceDef.c === '#e2e2e2' || serviceDef.c === '#ffffff'
      ? '#60a5fa'
      : serviceDef.c
    : 'var(--accent)'

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [testing, setTesting] = useState(false)
  const [testDone, setTestDone] = useState(false)

  // Reset field values when service changes
  useEffect(() => {
    if (!serviceDef) return
    const initial: Record<string, string> = {}
    for (const field of serviceDef.f) {
      initial[field.k] = vault.get(currentServiceId!, field.k) || ''
    }
    setFieldValues(initial)
    setTesting(false)
    setTestDone(false)
  }, [currentServiceId, serviceDef, vault])

  function handleFieldChange(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleTestAndContinue() {
    if (!currentServiceId || !serviceDef) return
    setTesting(true)

    // Save all field values to vault
    for (const field of serviceDef.f) {
      const val = fieldValues[field.k]
      if (val) {
        vault.set(currentServiceId, field.k, val)
      }
    }

    // Simulate a brief test period
    setTimeout(() => {
      setTesting(false)
      setTestDone(true)

      // Brief success feedback then advance
      setTimeout(() => {
        dispatch({ type: 'CREDENTIAL_COMPLETE' })
        setTestDone(false)
      }, 500)
    }, 1500)
  }

  function handleSkip() {
    dispatch({ type: 'CREDENTIAL_COMPLETE' })
  }

  if (!currentServiceId || !serviceDef) {
    return null
  }

  return (
    <div
      style={{
        padding: '24px',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      {/* Progress indicator */}
      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginBottom: '16px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        Service {currentCredIndex + 1} of {credentialQueue.length}
      </p>

      {/* Service card */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '24px',
            right: '24px',
            height: '2px',
            borderRadius: '0 0 4px 4px',
            backgroundColor: accentColor,
            opacity: 0.6,
          }}
        />

        {/* Service name + description */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}
          >
            {/* Service letter avatar */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700,
                backgroundColor: accentColor + '18',
                color: accentColor,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {serviceDef.l.slice(0, 2)}
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {serviceDef.l}
              </h3>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  margin: '2px 0 0 0',
                }}
              >
                {serviceDef.d}
              </p>
            </div>
          </div>
        </div>

        {/* Credential fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {serviceDef.f.map((field) => (
            <div key={field.k}>
              {/* Label */}
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                {field.lb}
              </label>

              {/* Input */}
              <input
                type={field.s ? 'password' : 'text'}
                value={fieldValues[field.k] || ''}
                onChange={(e) => handleFieldChange(field.k, e.target.value)}
                placeholder={field.ph}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: field.s ? 'var(--font-mono)' : 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = accentColor)
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = 'var(--border)')
                }
              />

              {/* Help text */}
              {field.h && (
                <p
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                  }}
                >
                  {field.h}
                </p>
              )}

              {/* External link */}
              {field.lk && (
                <a
                  href={field.lk}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.6875rem',
                    color: accentColor,
                    marginTop: '4px',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Where to find this
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Test & Continue button */}
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={handleTestAndContinue}
            disabled={testing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: testing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: testDone ? '#22c55e' : accentColor,
              color:
                accentColor === '#e2e2e2' || accentColor === '#ffffff'
                  ? 'var(--bg-primary)'
                  : '#fff',
            }}
          >
            {testing && (
              <Loader2
                size={14}
                style={{ animation: 'wizard-spin 1s linear infinite' }}
              />
            )}
            {testDone && <CheckCircle2 size={14} />}
            {testing ? 'Testing...' : testDone ? 'Connected' : 'Test & Continue'}
            {!testing && !testDone && <ArrowRight size={14} />}
          </button>
        </div>

        {/* Skip link */}
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={handleSkip}
            disabled={testing}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px 0',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'var(--text-secondary)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'var(--text-muted)')
            }
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Progress bar at bottom */}
      <div
        style={{
          marginTop: '20px',
          height: '4px',
          borderRadius: '2px',
          backgroundColor: 'rgba(255,255,255,0.04)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((currentCredIndex + 1) / credentialQueue.length) * 100}%`,
            backgroundColor: 'var(--accent)',
            borderRadius: '2px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wizard-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
