'use client'

import { useState } from 'react'
import { X, Check, Zap, Users, Loader2 } from 'lucide-react'
import { CONSOLE_PLANS } from '@/lib/stripe'

interface UpgradeModalProps {
  currentPlan: string
  onClose: () => void
}

export function UpgradeModal({ currentPlan, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectPlan = async (tier: string) => {
    if (tier === currentPlan) return
    setLoading(tier)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'console_plan', tier }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setLoading(null)
    }
  }

  const plans = [
    {
      key: 'pro',
      icon: Zap,
      color: '#7ed957',
      bg: 'rgba(126,217,87,0.08)',
      borderActive: 'rgba(126,217,87,0.4)',
    },
    {
      key: 'team',
      icon: Users,
      color: '#00d4ff',
      bg: 'rgba(0,212,255,0.08)',
      borderActive: 'rgba(0,212,255,0.4)',
    },
  ]

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(12px)',
          animation: 'console-fade-in 0.15s ease',
        }}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-2xl mx-4 rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          animation: 'console-scale-in 0.2s ease',
        }}
      >
        {/* Trial banner */}
        <div
          className="w-full py-2.5 text-center text-sm font-semibold"
          style={{
            background: 'linear-gradient(135deg, rgba(126,217,87,0.15) 0%, rgba(0,212,255,0.1) 100%)',
            color: '#7ed957',
            borderBottom: '1px solid rgba(126,217,87,0.2)',
          }}
        >
          Start your 7-day free trial
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Upgrade your Console
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Cancel anytime. No commitment.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg cursor-pointer border-none bg-transparent transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 pb-6">
          {plans.map(({ key, icon: Icon, color, bg, borderActive }) => {
            const plan = CONSOLE_PLANS[key]
            const isCurrent = currentPlan === key
            const isLoading = loading === key

            return (
              <div
                key={key}
                className="rounded-xl p-5 transition-all"
                style={{
                  backgroundColor: bg,
                  border: isCurrent
                    ? `2px solid ${borderActive}`
                    : '1px solid var(--border)',
                }}
              >
                {/* Plan header */}
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} style={{ color }} />
                  <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {plan.name}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    ${plan.amount}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mo</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleSelectPlan(key)}
                  disabled={isCurrent || isLoading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold cursor-pointer border-none transition-all"
                  style={{
                    background: isCurrent
                      ? 'rgba(255,255,255,0.06)'
                      : `linear-gradient(135deg, ${color}, ${key === 'pro' ? '#5cb83a' : '#0099cc'})`,
                    color: isCurrent ? 'var(--text-muted)' : '#0a0a0f',
                    opacity: isCurrent ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin mx-auto" />
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    'Start Free Trial'
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-scale-in {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
