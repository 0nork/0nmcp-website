'use client'

/**
 * AIFlowWizard — APEX-style multi-step AI workflow builder popup
 *
 * 5-step wizard with AI chat, quick suggestions, and step progress.
 * Floats over the canvas as a glassmorphism modal.
 */

import { useState, useCallback } from 'react'

interface AIFlowWizardProps {
  open: boolean
  onClose: () => void
  onSubmit: (prompt: string) => void
}

const STEPS = [
  { label: 'Describe', description: 'What do you want to automate?' },
  { label: 'Services', description: 'Which services should be involved?' },
  { label: 'Logic', description: 'Define conditions and branching' },
  { label: 'Review', description: 'Review the generated flow' },
  { label: 'Deploy', description: 'Test and deploy your workflow' },
]

const QUICK_SUGGESTIONS = [
  'Send email when payment received',
  'Sync CRM contacts to Google Sheets daily',
  'Monitor social mentions and alert on Slack',
  'Auto-reply to new conversations in CRM',
  'Generate weekly analytics report',
  'Route leads to sales pipeline based on source',
]

export default function AIFlowWizard({ open, onClose, onSubmit }: AIFlowWizardProps) {
  const [step, setStep] = useState(0)
  const [message, setMessage] = useState('')

  const handleSend = useCallback(() => {
    if (!message.trim()) return
    onSubmit(message.trim())
    setMessage('')
    onClose()
  }, [message, onSubmit, onClose])

  const handleSuggestion = useCallback((s: string) => {
    onSubmit(s)
    onClose()
  }, [onSubmit, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'wizardFadeIn 0.2s ease-out',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 520,
          maxHeight: '80vh',
          zIndex: 201,
          background: 'rgba(12, 14, 20, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.03) inset',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'wizardSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '20px 24px 16px',
        }}>
          {/* Icon */}
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(110, 224, 90, 0.3)',
            flexShrink: 0,
          }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#080B0F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#e8eaed', letterSpacing: '-0.02em' }}>
              AI Flow Wizard
            </div>
            <div style={{ fontSize: 12, color: '#7a8290', marginTop: 2 }}>
              Let AI guide you through building the perfect workflow
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent', cursor: 'pointer',
              color: '#5f6672', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#7A8290'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#5f6672'
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1={18} y1={6} x2={6} y2={18} /><line x1={6} y1={6} x2={18} y2={18} />
            </svg>
          </button>
        </div>

        {/* Step progress */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 0, padding: '0 24px 20px',
        }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 32 : 28,
                  height: i === step ? 32 : 28,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  background: i === step
                    ? '#6EE05A'
                    : i < step
                      ? 'rgba(110, 224, 90, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: i === step
                    ? '#080B0F'
                    : i < step
                      ? '#6EE05A'
                      : '#5f6672',
                  boxShadow: i === step ? '0 4px 12px rgba(110, 224, 90, 0.3)' : 'none',
                }}
              >
                {i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 40, height: 2,
                  background: i < step ? 'rgba(110, 224, 90, 0.3)' : 'rgba(255, 255, 255, 0.06)',
                  transition: 'background 0.2s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{
          padding: '0 24px 20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* AI assistant message */}
          <div style={{
            padding: '16px',
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#6EE05A' }}>
                AI Assistant
              </span>
            </div>
            <div style={{ fontSize: 14, color: '#c8ccd2', lineHeight: 1.6 }}>
              {step === 0 && "What would you like to automate? Describe your workflow in plain English and I'll build it for you."}
              {step === 1 && "Which services should be connected? I can integrate any of the 99 services in your 0nMCP installation."}
              {step === 2 && "Do you need any conditional logic? Branches, loops, error handling, or time delays?"}
              {step === 3 && "Here's your workflow. Review the steps and connections, then make any adjustments."}
              {step === 4 && "Ready to deploy! Test the flow first, then save it as a .0n SWITCH file."}
            </div>
          </div>

          {/* Quick suggestions (step 0 only) */}
          {step === 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#5f6672', marginBottom: 8 }}>
                Quick suggestions:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {QUICK_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      color: '#7A8290',
                      fontSize: 13,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(110, 224, 90, 0.3)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#e8eaed'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(110, 224, 90, 0.04)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.06)'
                      ;(e.currentTarget as HTMLButtonElement).style.color = '#7A8290'
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{
          display: 'flex', gap: 8,
          padding: '16px 24px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
            placeholder="Type your message..."
            style={{
              flex: 1, padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#e8eaed', fontSize: 14,
              fontFamily: 'inherit', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(110, 224, 90, 0.3)' }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255, 255, 255, 0.08)' }}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            style={{
              width: 44, height: 44,
              borderRadius: 12,
              border: 'none',
              background: message.trim() ? '#6EE05A' : 'rgba(255, 255, 255, 0.05)',
              color: message.trim() ? '#080B0F' : '#5f6672',
              cursor: message.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes wizardFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wizardSlideIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  )
}
