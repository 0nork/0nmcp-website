'use client'

import { useState } from 'react'

interface HowToData {
  selections: string[]
  triggers: string[]
  actions: string[]
  outcomes: string[]
  frequency: string[]
  notifications: string[]
}

interface ToolFlowDocProps {
  serviceName: string
  serviceIcon?: string
  howTo: HowToData
}

const STEPS = [
  { key: 'selections' as const, label: 'Select', color: '#6EE05A', desc: 'What tools are available' },
  { key: 'triggers' as const, label: 'Trigger', color: '#00d4ff', desc: 'What events start a flow' },
  { key: 'actions' as const, label: 'Actions', color: '#ff6b35', desc: 'What this service can do' },
  { key: 'outcomes' as const, label: 'Outcomes', color: '#a78bfa', desc: 'Common results' },
  { key: 'frequency' as const, label: 'Frequency', color: '#f59e0b', desc: 'How often it runs' },
  { key: 'notifications' as const, label: 'Notify', color: '#ec4899', desc: 'Output channels' },
]

export function ToolFlowDoc({ serviceName, serviceIcon, howTo }: ToolFlowDocProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
          How to use {serviceName}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Every automation follows the same 6-step flow. Click each step to see what&apos;s available for {serviceName}.
        </div>
      </div>

      {/* Flow visualization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
        {STEPS.map((step, i) => {
          const items = howTo[step.key] || []
          const isExpanded = expandedStep === step.key

          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setExpandedStep(isExpanded ? null : step.key)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: isExpanded ? `2px solid ${step.color}` : '1px solid var(--border)',
                  backgroundColor: isExpanded ? `${step.color}15` : 'var(--bg-card)',
                  cursor: 'pointer',
                  minWidth: 90,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isExpanded) {
                    e.currentTarget.style.borderColor = step.color
                    e.currentTarget.style.backgroundColor = `${step.color}08`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)'
                  }
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, color: step.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Step {i + 1}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {items.length} option{items.length !== 1 ? 's' : ''}
                </div>
              </button>

              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 24,
                  height: 2,
                  backgroundColor: 'var(--border)',
                  position: 'relative',
                  flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute',
                    right: -1,
                    top: -3,
                    width: 0,
                    height: 0,
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderLeft: '6px solid var(--border)',
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Expanded step detail */}
      {expandedStep && (() => {
        const step = STEPS.find(s => s.key === expandedStep)
        if (!step) return null
        const items = howTo[step.key] || []

        return (
          <div
            style={{
              padding: 20,
              borderRadius: 12,
              border: `1px solid ${step.color}30`,
              backgroundColor: `${step.color}08`,
              marginBottom: 24,
              animation: 'console-fade-in 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              {serviceIcon && <span style={{ fontSize: 18 }}>{serviceIcon}</span>}
              <h3 style={{ fontSize: 15, fontWeight: 700, color: step.color, margin: 0 }}>
                {step.label}
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— {step.desc}</span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {items.map((item) => (
                <span
                  key={item}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--border)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )
      })()}

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
