'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gift, Copy, Check, RefreshCw, ExternalLink, Users, DollarSign, Clock } from 'lucide-react'

interface Referral {
  id: string
  referred_email: string | null
  status: string
  commission_cents: number
  converted_at: string | null
  created_at: string
}

interface AffiliateData {
  referralCode: string
  referralLink: string
  stats: {
    totalReferrals: number
    converted: number
    pending: number
    earningsCents: number
  }
  referrals: Referral[]
}

const G = '#6EE05A'
const P = '#a78bfa'
const C = '#00d4ff'

export function AffiliateView() {
  const [data, setData] = useState<AffiliateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/console/affiliate')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCopy = useCallback(async () => {
    if (!data?.referralLink) return
    try {
      await navigator.clipboard.writeText(data.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }, [data])

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true)
    try {
      const res = await fetch('/api/console/affiliate', { method: 'POST' })
      if (res.ok) {
        const json = await res.json()
        setData(prev => prev ? { ...prev, referralCode: json.referralCode, referralLink: json.referralLink } : prev)
      }
    } catch { /* ignore */ }
    finally { setRegenerating(false) }
  }, [])

  const shareTwitter = useCallback(() => {
    if (!data) return
    const text = encodeURIComponent(`I'm using 0nMCP to orchestrate AI across 111 services. Join me and get started:\n\n${data.referralLink}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }, [data])

  const shareLinkedIn = useCallback(() => {
    if (!data) return
    const url = encodeURIComponent(data.referralLink)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }, [data])

  const shareEmail = useCallback(() => {
    if (!data) return
    const subject = encodeURIComponent('Check out 0nMCP - Universal AI Orchestrator')
    const body = encodeURIComponent(`I've been using 0nMCP to connect AI to everything. You should check it out:\n\n${data.referralLink}`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self')
  }, [data])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `3px solid ${G}20`, borderTopColor: G,
          animation: 'aff-spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes aff-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <Gift size={32} style={{ color: '#4a4a5a', margin: '0 auto 1rem' }} />
          <p style={{ color: '#808090', fontSize: '0.875rem' }}>Failed to load affiliate data. Please try again.</p>
        </div>
      </div>
    )
  }

  const stats = data.stats

  return (
    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', maxWidth: 800, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Gift size={20} style={{ color: G }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Affiliate Program</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#808090', margin: 0 }}>
          Earn commissions by referring new users to 0nMCP. Share your unique link and track conversions.
        </p>
      </div>

      {/* Referral Link Card */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.25rem',
        marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#808090', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Your Referral Link
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            flex: 1,
            padding: '10px 14px',
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${G}20`,
            borderRadius: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: G,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {data.referralLink}
          </div>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 8,
              background: copied ? `${G}15` : 'var(--bg-card)',
              border: `1px solid ${copied ? `${G}30` : 'var(--border)'}`,
              color: copied ? G : '#e8eaed',
              fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: '0.7rem', color: '#4a4a5a' }}>
            Code: <span style={{ color: '#808090', fontFamily: 'var(--font-mono)' }}>{data.referralCode}</span>
          </span>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 6,
              background: 'none', border: '1px solid var(--border)',
              color: '#4a4a5a', fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <RefreshCw size={10} style={{ animation: regenerating ? 'aff-spin 0.8s linear infinite' : 'none' }} />
            Regenerate
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1rem' }}>
        {[
          { label: 'Total Referrals', value: stats.totalReferrals, icon: <Users size={16} />, color: G },
          { label: 'Converted', value: stats.converted, icon: <Check size={16} />, color: C },
          { label: 'Pending', value: stats.pending, icon: <Clock size={16} />, color: P },
          { label: 'Earnings', value: `$${(stats.earningsCents / 100).toFixed(2)}`, icon: <DollarSign size={16} />, color: G },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '1rem',
            textAlign: 'center',
          }}>
            <div style={{ color: s.color, marginBottom: 8, opacity: 0.7 }}>{s.icon}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: '0.65rem', color: '#4a4a5a', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Share Buttons */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.25rem',
        marginBottom: '1rem',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#808090', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Share
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ShareButton label="Twitter / X" color="#1da1f2" onClick={shareTwitter} />
          <ShareButton label="LinkedIn" color="#0a66c2" onClick={shareLinkedIn} />
          <ShareButton label="Email" color="#808090" onClick={shareEmail} />
        </div>
      </div>

      {/* Referrals List */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.25rem',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#808090', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Referral History
        </div>
        {data.referrals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <Users size={24} style={{ color: '#2a2a3a', margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: '0.8rem', color: '#4a4a5a', margin: 0 }}>
              No referrals yet. Share your link to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.referrals.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: 8,
                border: '1px solid var(--bg-card)',
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {r.referred_email || 'Pending signup'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#4a4a5a', marginTop: 2 }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.commission_cents > 0 && (
                    <span style={{ fontSize: '0.7rem', color: G, fontWeight: 600 }}>
                      ${(r.commission_cents / 100).toFixed(2)}
                    </span>
                  )}
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes aff-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function ShareButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 8,
        background: `${color}10`,
        border: `1px solid ${color}25`,
        color,
        fontSize: '0.75rem', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      <ExternalLink size={12} />
      {label}
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    converted: { bg: 'rgba(126,217,87,0.1)', text: '#6EE05A' },
    pending: { bg: 'rgba(167,139,250,0.1)', text: '#a78bfa' },
    expired: { bg: 'var(--bg-card)', text: '#4a4a5a' },
  }
  const c = colors[status] || colors.pending

  return (
    <span style={{
      padding: '3px 10px', borderRadius: 6,
      background: c.bg,
      color: c.text,
      fontSize: '0.65rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {status}
    </span>
  )
}
