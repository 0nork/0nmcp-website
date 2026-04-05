'use client'

import { useState, useEffect } from 'react'

/**
 * 0nMCP Data Flow Animation — smooth cycling visualization.
 * Shows data flowing through the 0n ecosystem: trigger → process → deliver.
 * Each cycle fades smoothly to the next plugin's flow.
 */

interface FlowStep {
  label: string
  color: string
  icon: string
}

interface FlowScene {
  title: string
  subtitle: string
  color: string
  steps: FlowStep[]
}

const SCENES: FlowScene[] = [
  {
    title: '0nEngine',
    subtitle: 'AI-powered execution',
    color: '#6EE05A',
    steps: [
      { label: 'Describe outcome', color: '#6EE05A', icon: '⌘' },
      { label: 'Resolve services', color: '#00d4ff', icon: '⚡' },
      { label: 'Execute workflow', color: '#a78bfa', icon: '▶' },
      { label: 'Deliver result', color: '#6EE05A', icon: '✓' },
    ],
  },
  {
    title: 'CRM',
    subtitle: 'Contact intelligence',
    color: '#00d4ff',
    steps: [
      { label: 'New lead arrives', color: '#00d4ff', icon: '◉' },
      { label: 'Enrich profile', color: '#fbbf24', icon: '◈' },
      { label: 'Score + assign', color: '#a78bfa', icon: '◇' },
      { label: 'Auto-nurture', color: '#6EE05A', icon: '↗' },
    ],
  },
  {
    title: 'Social',
    subtitle: 'Cross-platform publishing',
    color: '#f472b6',
    steps: [
      { label: 'Draft content', color: '#f472b6', icon: '✎' },
      { label: 'PACG classify', color: '#a78bfa', icon: '◎' },
      { label: 'Adapt per platform', color: '#00d4ff', icon: '⊕' },
      { label: 'Publish everywhere', color: '#6EE05A', icon: '◈' },
    ],
  },
  {
    title: 'Marketplace',
    subtitle: 'Buy, sell, execute',
    color: '#f97316',
    steps: [
      { label: 'Browse workflows', color: '#f97316', icon: '☰' },
      { label: 'One-click buy', color: '#6EE05A', icon: '⚡' },
      { label: 'Auto-configure', color: '#00d4ff', icon: '⚙' },
      { label: 'Execute instantly', color: '#a78bfa', icon: '▶' },
    ],
  },
]

export default function DataFlowAnimation() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(-1)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const scene = SCENES[sceneIdx]
    const totalSteps = scene.steps.length

    if (stepIdx < totalSteps) {
      const timer = setTimeout(() => setStepIdx(stepIdx + 1), 800)
      return () => clearTimeout(timer)
    } else {
      // Pause at completion, then fade to next scene
      const timer = setTimeout(() => {
        setFading(true)
        setTimeout(() => {
          setSceneIdx((sceneIdx + 1) % SCENES.length)
          setStepIdx(-1)
          setFading(false)
        }, 600)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [sceneIdx, stepIdx])

  const scene = SCENES[sceneIdx]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: '2.5rem',
      opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease',
      padding: '2rem',
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono, monospace)', fontSize: '2rem', fontWeight: 800,
          color: '#6EE05A', letterSpacing: '-0.02em',
        }}>0nMCP</div>
        <div style={{
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
        }}>The Agentic Engine</div>
      </div>

      {/* Scene title */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono, monospace)', fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: scene.color, marginBottom: '0.25rem',
          transition: 'color 0.4s ease',
        }}>{scene.title}</div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{scene.subtitle}</div>
      </div>

      {/* Flow visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', maxWidth: '240px' }}>
        {scene.steps.map((step, i) => {
          const isActive = i <= stepIdx
          const isCurrent = i === stepIdx

          return (
            <div key={`${sceneIdx}-${i}`}>
              {/* Step node */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '10px',
                background: isActive ? `${step.color}12` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? `${step.color}30` : 'var(--bg-card)'}`,
                opacity: isActive ? 1 : 0.3,
                transform: isCurrent ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                {/* Icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: '8px',
                  background: isActive ? `${step.color}20` : 'var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', color: isActive ? step.color : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.5s ease',
                  boxShadow: isCurrent ? `0 0 12px ${step.color}40` : 'none',
                }}>
                  {step.icon}
                </div>
                {/* Label */}
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.5s ease',
                }}>
                  {step.label}
                </span>
                {/* Active dot */}
                {isCurrent && (
                  <div style={{
                    marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                    background: step.color, boxShadow: `0 0 8px ${step.color}`,
                    animation: 'flowPulse 1s ease-in-out infinite',
                  }} />
                )}
              </div>

              {/* Connector line */}
              {i < scene.steps.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', height: '16px' }}>
                  <div style={{
                    width: '1.5px', height: '100%',
                    background: i < stepIdx
                      ? `linear-gradient(to bottom, ${step.color}60, ${scene.steps[i + 1].color}60)`
                      : 'var(--border)',
                    transition: 'background 0.5s ease',
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: '1.5rem', justifyContent: 'center',
      }}>
        {[
          { value: '1,171', label: 'tools' },
          { value: '54', label: 'services' },
          { value: '0', label: 'prompts' },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-mono, monospace)', fontSize: '1.125rem',
              fontWeight: 800, color: '#6EE05A', letterSpacing: '-0.02em',
            }}>{stat.value}</div>
            <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Scene dots */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {SCENES.map((s, i) => (
          <div key={i} style={{
            width: i === sceneIdx ? '20px' : '6px', height: '6px', borderRadius: '3px',
            background: i === sceneIdx ? s.color : 'var(--border)',
            transition: 'all 0.4s ease',
          }} />
        ))}
      </div>

      <style>{`
        @keyframes flowPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
      `}</style>
    </div>
  )
}
