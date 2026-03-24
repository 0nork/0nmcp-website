'use client'

import { useState } from 'react'
import { Store, CreditCard, Package, ArrowRight, Loader2, Check } from 'lucide-react'

interface VendorOnboardingProps {
  onComplete: () => void
  onSkip: () => void
}

type Step = 'welcome' | 'connect' | 'listing'

export function VendorOnboarding({ onComplete, onSkip }: VendorOnboardingProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('individual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInitConnect = async () => {
    if (!businessName.trim()) {
      setError('Business name is required')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/vendor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init', businessName, businessType }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        setError(data.error)
      }
    } catch {
      setError('Failed to start onboarding. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshLink = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/vendor/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        setError(data.error)
      }
    } catch {
      setError('Failed to get onboarding link.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { key: 'welcome' as Step, label: 'Welcome', icon: Store },
    { key: 'connect' as Step, label: 'Payouts', icon: CreditCard },
    { key: 'listing' as Step, label: 'First Listing', icon: Package },
  ]

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: 32,
    maxWidth: 560,
    margin: '0 auto',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  }

  return (
    <div style={{ padding: 24, animation: 'console-fade-in 0.3s ease' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
        {steps.map(({ key, label, icon: Icon }, i) => {
          const isActive = step === key
          const isDone = steps.findIndex(s => s.key === step) > i
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isDone ? 'rgba(126,217,87,0.15)' : isActive ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isDone ? 'rgba(126,217,87,0.3)' : isActive ? 'rgba(255,107,53,0.3)' : 'var(--border)'}`,
              }}>
                {isDone ? (
                  <Check size={14} style={{ color: '#6EE05A' }} />
                ) : (
                  <Icon size={14} style={{ color: isActive ? '#ff6b35' : 'var(--text-muted)' }} />
                )}
              </div>
              <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {label}
              </span>
              {i < steps.length - 1 && (
                <ArrowRight size={12} style={{ color: 'var(--text-muted)', marginLeft: 4 }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step: Welcome */}
      {step === 'welcome' && (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,107,53,0.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,107,53,0.2)',
            }}>
              <Store size={24} style={{ color: '#ff6b35' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Your Contributor plan is active!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Let&apos;s set up your seller account so you can start earning on the marketplace.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Business / Display Name
              </label>
              <input
                style={inputStyle}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your business or display name"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Business Type
              </label>
              <select
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const }}
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, backgroundColor: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: '1px solid rgba(255,59,48,0.3)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={() => setStep('connect')}
            disabled={!businessName.trim()}
            style={{
              width: '100%', padding: '12px 24px', borderRadius: 12, border: 'none',
              background: businessName.trim() ? 'linear-gradient(135deg, #ff6b35, #cc5529)' : 'var(--border)',
              color: businessName.trim() ? '#fff' : 'var(--text-muted)',
              fontSize: 14, fontWeight: 600, cursor: businessName.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-display)',
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Step: Connect */}
      {step === 'connect' && (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(0,212,255,0.2)',
            }}>
              <CreditCard size={24} style={{ color: '#00d4ff' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Set up your payouts
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Complete your payment setup with Stripe. They handle identity verification, banking details, and KYC — we never see your sensitive info.
            </p>
          </div>

          <div style={{ padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              What happens next
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'disc' }}>
              <li style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Stripe verifies your identity</li>
              <li style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Connect your bank account for payouts</li>
              <li style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>You keep 85% of every sale (15% platform fee)</li>
              <li style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Payouts are automatic to your bank</li>
            </ul>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, backgroundColor: 'rgba(255,59,48,0.1)', color: '#ff3b30', border: '1px solid rgba(255,59,48,0.3)', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setStep('welcome')}
              style={{
                padding: '12px 20px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={handleInitConnect}
              disabled={loading}
              style={{
                flex: 1, padding: '12px 24px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                color: '#0B0F19', fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'var(--font-display)', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Set Up Payouts'}
            </button>
          </div>

          <button
            onClick={handleRefreshLink}
            style={{
              display: 'block', width: '100%', marginTop: 12, padding: '8px', borderRadius: 8,
              background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Already started? Resume onboarding
          </button>
        </div>
      )}

      {/* Step: First Listing */}
      {step === 'listing' && (
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, rgba(126,217,87,0.2), rgba(126,217,87,0.05))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(126,217,87,0.2)',
            }}>
              <Package size={24} style={{ color: '#6EE05A' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              You&apos;re all set!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Your seller account is ready. Create your first listing to start earning on the marketplace.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onSkip}
              style={{
                padding: '12px 20px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Skip for now
            </button>
            <button
              onClick={onComplete}
              style={{
                flex: 1, padding: '12px 24px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
                color: '#0B0F19', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-display)',
              }}
            >
              Create First Listing
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
