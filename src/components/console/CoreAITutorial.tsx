'use client'

import { useState } from 'react'
import { Shield, Zap, PartyPopper, ChevronRight, X } from 'lucide-react'
import { getLogoSrc } from './logo-map'

const AI_PROVIDERS = [
  { key: 'anthropic', label: 'Claude', color: '#a78bfa' },
  { key: 'openai', label: 'GPT-4o', color: '#10a37f' },
  { key: 'gemini', label: 'Gemini', color: '#4285f4' },
  { key: 'groq', label: 'Groq', color: '#f55036' },
  { key: 'openrouter', label: 'OpenRouter', color: '#f97316' },
  { key: 'perplexity', label: 'Perplexity', color: '#22d3ee' },
]

interface CoreAITutorialProps {
  provider: string
  onClose: () => void
}

export function CoreAITutorial({ provider, onClose }: CoreAITutorialProps) {
  const [step, setStep] = useState(0)

  const activeProvider = AI_PROVIDERS.find(p => p.key === provider) || AI_PROVIDERS[0]

  const steps = [
    {
      icon: <Zap size={32} style={{ color: '#6EE05A' }} />,
      title: 'Your AI, Your Console',
      body: (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            Your Core AI powers <strong style={{ color: 'var(--text-primary)' }}>everything</strong> — Chat, Create, Builder, Spark Runner, and all console features.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            {AI_PROVIDERS.map(p => {
              const logo = getLogoSrc(p.key)
              return (
                <div
                  key={p.key}
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: p.key === provider ? `${p.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${p.key === provider ? `${p.color}40` : 'rgba(255,255,255,0.06)'}`,
                    opacity: p.key === provider ? 1 : 0.4,
                    transition: 'all 0.2s',
                  }}
                >
                  {logo ? (
                    <img src={logo} alt={p.label} width={22} height={22} style={{ borderRadius: 4 }} />
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.label.slice(0, 2)}</span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ),
    },
    {
      icon: <Shield size={32} style={{ color: '#6EE05A' }} />,
      title: 'Your Key Is Safe',
      body: (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            Your API key is encrypted with <strong style={{ color: 'var(--text-primary)' }}>AES-256-GCM</strong> before it leaves your browser. We never see your key.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(126,217,87,0.06)',
            border: '1px solid rgba(126,217,87,0.15)',
            margin: '0 auto', maxWidth: 280,
          }}>
            <Shield size={18} style={{ color: '#6EE05A', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6EE05A' }}>BYOK Encrypted</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stored in your personal vault</div>
            </div>
          </div>
        </>
      ),
    },
    {
      icon: <PartyPopper size={32} style={{ color: '#6EE05A' }} />,
      title: "You're Ready",
      body: (
        <>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            <strong style={{ color: activeProvider.color }}>{activeProvider.label}</strong> is now your Core AI. Start chatting, building, or exploring the console.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(126,217,87,0.06)',
            border: '1px solid rgba(126,217,87,0.15)',
            margin: '0 auto', maxWidth: 280,
          }}>
            <Zap size={18} style={{ color: '#6EE05A', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6EE05A' }}>Console Unlocked</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>All AI features are now active</div>
            </div>
          </div>
        </>
      ),
    },
  ]

  const current = steps[step]
  const isLast = step === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('0n_tutorial_seen', 'true')
      onClose()
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        animation: 'tutorialFadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleNext() }}
    >
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#0d0d14',
        border: '1px solid rgba(126,217,87,0.2)',
        borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(126,217,87,0.06)',
        overflow: 'hidden',
        animation: 'tutorialSlideUp 0.3s ease',
      }}>
        {/* Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
          <button
            onClick={() => { localStorage.setItem('0n_tutorial_seen', 'true'); onClose() }}
            style={{ background: 'none', border: 'none', color: '#4a4a5a', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 32px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'rgba(126,217,87,0.08)',
            border: '1px solid rgba(126,217,87,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            {current.icon}
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            {current.title}
          </h2>

          {current.body}

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '24px 0 20px' }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === step ? '#6EE05A' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>

          {/* Action */}
          <button
            onClick={handleNext}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 32px', borderRadius: 12,
              background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
              border: 'none', color: '#0B0F19',
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(126,217,87,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            {isLast ? 'Start Exploring' : 'Next'}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tutorialFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes tutorialSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
