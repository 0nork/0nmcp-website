'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createSupabaseBrowser } from '@/lib/supabase/client'

/* ============================================
   0nMCP — Maintenance / Pre-Launch Page
   Split layout: animated logo left | login + CTAs right
   May 1st public launch countdown
   ============================================ */

type ModalType = 'account' | 'investor' | 'preorder' | null

export default function MaintenancePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [modal, setModal] = useState<ModalType>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '', affiliate: false })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Countdown to May 1, 2026
  useEffect(() => {
    const target = new Date('2026-05-01T00:00:00-04:00').getTime()
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, target - now)
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [])

  // Theme
  const t = darkMode
    ? { bg: '#0a0a0a', bg2: '#141414', card: '#1a1a1a', border: '#222', text: '#f0f0f0', text2: '#999', text3: '#555', accent: '#6EE05A', shadow: 'rgba(0,0,0,0.4)' }
    : { bg: '#f5f5f5', bg2: '#fff', card: '#fff', border: '#e0e0e0', text: '#1a1a1a', text2: '#666', text3: '#aaa', accent: '#6EE05A', shadow: 'rgba(0,0,0,0.08)' }

  const shadow = {
    sm: `0 1px 3px ${t.shadow}`,
    md: `0 4px 12px ${t.shadow}`,
    lg: `0 8px 30px ${t.shadow}`,
    xl: `0 16px 50px ${t.shadow}`,
    pop: `0 20px 60px ${t.shadow}, 0 0 0 1px ${t.border}`,
    inset: `inset 0 2px 8px ${t.shadow}`,
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    const supabase = createSupabaseBrowser()
    if (!supabase) { setLoginError('Auth unavailable'); setLoginLoading(false); return }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setLoginError(error.message); setLoginLoading(false); return }
    window.location.href = '/dashboard'
  }

  async function handleOAuth(provider: 'google' | 'linkedin_oidc') {
    const supabase = createSupabaseBrowser()
    if (!supabase) return
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/api/auth/callback` } })
  }

  async function handleModalSubmit(type: ModalType) {
    setFormLoading(true)
    try {
      await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type, affiliate: formData.affiliate }),
      })
    } catch {}
    setFormSubmitted(true)
    setFormLoading(false)
  }

  function resetModal() {
    setModal(null)
    setFormSubmitted(false)
    setFormData({ name: '', email: '', company: '', message: '', affiliate: false })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg, transition: 'background 0.3s' }}>
      {/* ═══════ LEFT SIDE — Animated Logo + Process ═══════ */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '3rem 2rem', position: 'relative', overflow: 'hidden',
        background: darkMode
          ? 'radial-gradient(ellipse at 30% 40%, rgba(110,224,90,0.06) 0%, transparent 60%), #0a0a0a'
          : 'radial-gradient(ellipse at 30% 40%, rgba(110,224,90,0.08) 0%, transparent 60%), #f0f0f0',
      }}>
        {/* Animated process rings behind logo */}
        <div style={{ position: 'relative', width: 320, height: 320, marginBottom: 32 }}>
          {/* Outer ring — services orbit */}
          <svg width="320" height="320" viewBox="0 0 320 320" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="ring1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6EE05A" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#00d4ff" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#6EE05A" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="ring2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Outer orbit */}
            <circle cx="160" cy="160" r="150" fill="none" stroke="url(#ring1)" strokeWidth="1" strokeDasharray="8 12">
              <animateTransform attributeName="transform" type="rotate" from="0 160 160" to="360 160 160" dur="40s" repeatCount="indefinite" />
            </circle>
            {/* Middle orbit */}
            <circle cx="160" cy="160" r="115" fill="none" stroke="url(#ring2)" strokeWidth="1" strokeDasharray="6 10">
              <animateTransform attributeName="transform" type="rotate" from="360 160 160" to="0 160 160" dur="28s" repeatCount="indefinite" />
            </circle>
            {/* Inner orbit */}
            <circle cx="160" cy="160" r="80" fill="none" stroke={t.accent} strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3">
              <animateTransform attributeName="transform" type="rotate" from="0 160 160" to="360 160 160" dur="18s" repeatCount="indefinite" />
            </circle>

            {/* Orbiting service dots */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <circle key={i} cx="160" cy="10" r={i % 2 === 0 ? 4 : 3} fill={i % 3 === 0 ? '#6EE05A' : i % 3 === 1 ? '#00d4ff' : '#a78bfa'} opacity="0.7">
                <animateTransform attributeName="transform" type="rotate" from={`${angle} 160 160`} to={`${angle + 360} 160 160`} dur={`${20 + i * 3}s`} repeatCount="indefinite" />
              </circle>
            ))}

            {/* Data pulses moving along paths */}
            <circle r="3" fill="#6EE05A" opacity="0.9">
              <animateMotion dur="6s" repeatCount="indefinite">
                <mpath href="#pulse-path-1" />
              </animateMotion>
            </circle>
            <path id="pulse-path-1" d="M160,10 A150,150 0 0,1 310,160 A150,150 0 0,1 160,310" fill="none" />

            <circle r="2.5" fill="#00d4ff" opacity="0.8">
              <animateMotion dur="5s" repeatCount="indefinite">
                <mpath href="#pulse-path-2" />
              </animateMotion>
            </circle>
            <path id="pulse-path-2" d="M160,45 A115,115 0 0,0 45,160 A115,115 0 0,0 160,275" fill="none" />
          </svg>

          {/* Center logo */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 140, height: 140, borderRadius: '50%',
            background: t.card,
            boxShadow: shadow.xl,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${t.border}`,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
                <span style={{ color: t.text3 }}>0n</span>
                <span style={{ color: t.accent }}>MCP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline + Countdown */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: t.text, textAlign: 'center', margin: 0, letterSpacing: '-0.02em' }}>
          Building Something Extraordinary
        </h2>
        <p style={{ fontSize: 14, color: t.text2, textAlign: 'center', marginTop: 8, maxWidth: 380, lineHeight: 1.6 }}>
          1,183 AI tools. 99 services. One platform. We're putting the final touches on the most powerful AI orchestrator ever built.
        </p>

        {/* Countdown */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {[
            { val: countdown.days, label: 'Days' },
            { val: countdown.hours, label: 'Hours' },
            { val: countdown.minutes, label: 'Min' },
            { val: countdown.seconds, label: 'Sec' },
          ].map(({ val, label }) => (
            <div key={label} style={{
              width: 64, padding: '12px 0', borderRadius: 12, textAlign: 'center',
              background: t.card, border: `1px solid ${t.border}`,
              boxShadow: shadow.md,
              transition: 'box-shadow 0.3s, transform 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = shadow.lg; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = shadow.md; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: t.accent, fontVariantNumeric: 'tabular-nums' }}>{String(val).padStart(2, '0')}</div>
              <div style={{ fontSize: 10, color: t.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, color: t.text3, marginTop: 16, textAlign: 'center' }}>
          Official Public Launch: <strong style={{ color: t.accent }}>May 1, 2026</strong>
        </p>

        {/* Dark/Light toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            position: 'absolute', top: 24, left: 24,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 20,
            background: t.card, border: `1px solid ${t.border}`,
            boxShadow: shadow.sm, cursor: 'pointer',
            fontSize: 12, color: t.text2, fontWeight: 500,
            transition: 'all 0.3s',
          }}
        >
          <span style={{ fontSize: 16 }}>{darkMode ? '☀️' : '🌙'}</span>
          {darkMode ? 'Light' : 'Dark'}
        </button>
      </div>

      {/* ═══════ RIGHT SIDE — Login + 3 CTAs ═══════ */}
      <div style={{
        width: 480, flexShrink: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '3rem 2.5rem',
        background: t.bg2, borderLeft: `1px solid ${t.border}`,
        boxShadow: darkMode ? '-8px 0 40px rgba(0,0,0,0.3)' : '-4px 0 30px rgba(0,0,0,0.04)',
        transition: 'background 0.3s',
      }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: t.text3, marginBottom: 24 }}>
          <span>Home</span> <span style={{ margin: '0 6px' }}>/</span> <span style={{ color: t.text2 }}>Sign In</span>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: t.text, letterSpacing: '-0.02em', margin: 0 }}>Sign In</h1>
        <p style={{ fontSize: 13, color: t.text2, marginTop: 6, marginBottom: 24 }}>Enter your credentials or create an account</p>

        {/* OAuth buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
          <button onClick={() => handleOAuth('google')} style={{
            width: 44, height: 44, borderRadius: '50%', border: `1px solid ${t.border}`,
            background: t.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: shadow.sm, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = shadow.md; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = shadow.sm; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          </button>
          <button onClick={() => handleOAuth('linkedin_oidc')} style={{
            width: 44, height: 44, borderRadius: '50%', border: `1px solid ${t.border}`,
            background: t.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: shadow.sm, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = shadow.md; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = shadow.sm; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: t.border }} />
          <span style={{ fontSize: 12, color: t.text3 }}>or</span>
          <div style={{ flex: 1, height: 1, background: t.border }} />
        </div>

        {/* Login form */}
        {loginError && (
          <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{loginError}</div>
        )}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 6 }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: `1px solid ${t.border}`, background: t.bg,
                color: t.text, fontSize: 14, outline: 'none',
                boxShadow: shadow.inset, transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = t.accent; e.target.style.boxShadow = `0 0 0 3px rgba(110,224,90,0.1)` }}
              onBlur={e => { e.target.style.borderColor = t.border; e.target.style.boxShadow = shadow.inset }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: `1px solid ${t.border}`, background: t.bg,
                color: t.text, fontSize: 14, outline: 'none',
                boxShadow: shadow.inset, transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = t.accent; e.target.style.boxShadow = `0 0 0 3px rgba(110,224,90,0.1)` }}
              onBlur={e => { e.target.style.borderColor = t.border; e.target.style.boxShadow = shadow.inset }}
            />
          </div>
          <button type="submit" disabled={loginLoading} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: loginLoading ? 'not-allowed' : 'pointer',
            boxShadow: shadow.md, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { if (!loginLoading) { e.currentTarget.style.boxShadow = shadow.lg; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = shadow.md; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loginLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* ── 3 CTA Buttons ── */}
        <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
          {([
            { key: 'account' as const, label: 'Request Account', icon: '👤' },
            { key: 'investor' as const, label: 'Investor NDA', icon: '🤝' },
            { key: 'preorder' as const, label: 'Pre-Order', icon: '🚀' },
          ]).map(btn => (
            <button key={btn.key} onClick={() => setModal(btn.key)} style={{
              flex: 1, padding: '10px 8px', borderRadius: 10,
              border: `1px solid ${t.border}`, background: t.card,
              cursor: 'pointer', fontSize: 11, fontWeight: 600, color: t.text,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              boxShadow: shadow.sm, transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = shadow.lg; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = shadow.sm; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <span style={{ fontSize: 18 }}>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, color: t.text3, textAlign: 'center', marginTop: 20 }}>
          Need help? <a href="mailto:mike@rocketopp.com" style={{ color: t.accent, textDecoration: 'none' }}>mike@rocketopp.com</a>
        </p>
      </div>

      {/* ═══════ MODAL OVERLAY ═══════ */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          animation: 'fadeIn 0.2s ease-out',
        }} onClick={() => !formSubmitted && resetModal()}>
          <div style={{
            width: '100%', maxWidth: 440, background: t.card,
            borderRadius: 20, padding: 32,
            boxShadow: shadow.pop, border: `1px solid ${t.border}`,
            animation: 'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
          }} onClick={e => e.stopPropagation()}>
            {/* Close */}
            <button onClick={resetModal} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'none', border: 'none', fontSize: 20, color: t.text3, cursor: 'pointer',
            }}>x</button>

            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: t.accent, marginBottom: 8 }}>Request Received</h2>
                <p style={{ fontSize: 13, color: t.text2, lineHeight: 1.6 }}>
                  We'll be in touch shortly. {modal === 'preorder' && 'Your Founders Badge will be ready at launch.'}
                </p>
                <button onClick={resetModal} style={{
                  marginTop: 20, padding: '10px 28px', borderRadius: 10,
                  background: '#1a1a1a', color: '#fff', fontWeight: 700, fontSize: 13,
                  border: 'none', cursor: 'pointer', boxShadow: shadow.md,
                }}>Done</button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 4 }}>
                  {modal === 'account' && 'Request an Account'}
                  {modal === 'investor' && 'Investor Inquiry (NDA)'}
                  {modal === 'preorder' && 'Pre-Order — Founders Access'}
                </h2>
                <p style={{ fontSize: 12, color: t.text2, marginBottom: 20, lineHeight: 1.6 }}>
                  {modal === 'account' && 'Join the waitlist. We\'re sending access in batches.'}
                  {modal === 'investor' && 'Schedule a call. NDA will be provided before any proprietary information is shared.'}
                  {modal === 'preorder' && 'Lock in Founders pricing. Your account will be generated while we finish building. Get a lifetime Founders Badge, exclusive rewards, and early access before May 1st.'}
                </p>

                {modal === 'preorder' && (
                  <div style={{
                    padding: 14, borderRadius: 12, marginBottom: 16,
                    background: darkMode ? 'rgba(110,224,90,0.06)' : 'rgba(110,224,90,0.06)',
                    border: '1px solid rgba(110,224,90,0.15)',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Founders Get</div>
                    {['Lifetime Founders Badge on your profile', 'Early access — use the platform before public launch', 'Exclusive rewards & priority support forever', 'Locked-in pricing — never pay more'].map(item => (
                      <div key={item} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '3px 0' }}>
                        <span style={{ color: t.accent, fontSize: 11 }}>+</span>
                        <span style={{ fontSize: 12, color: t.text2 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input placeholder="Full name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required
                    style={{ ...modalInput(t), boxShadow: shadow.inset }} />
                  <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required
                    style={{ ...modalInput(t), boxShadow: shadow.inset }} />
                  <input placeholder="Company" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                    style={{ ...modalInput(t), boxShadow: shadow.inset }} />
                  {modal === 'investor' && (
                    <textarea placeholder="Brief message or availability for a call" value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} rows={3}
                      style={{ ...modalInput(t), boxShadow: shadow.inset, resize: 'vertical' } as React.CSSProperties} />
                  )}

                  {/* Affiliate checkbox */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: t.text2, marginTop: 4 }}>
                    <input type="checkbox" checked={formData.affiliate} onChange={e => setFormData(p => ({ ...p, affiliate: e.target.checked }))}
                      style={{ accentColor: t.accent, width: 16, height: 16 }} />
                    I'm interested in the <strong style={{ color: t.accent }}>Affiliate Program</strong> (earn 20% recurring)
                  </label>

                  <button onClick={() => handleModalSubmit(modal)} disabled={formLoading || !formData.name || !formData.email} style={{
                    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                    background: '#1a1a1a', color: '#fff', fontSize: 14, fontWeight: 700,
                    cursor: formLoading ? 'not-allowed' : 'pointer',
                    boxShadow: shadow.md, transition: 'all 0.2s', marginTop: 4,
                    opacity: (!formData.name || !formData.email) ? 0.5 : 1,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = shadow.lg; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = shadow.md; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    {formLoading ? 'Submitting...' : modal === 'preorder' ? 'Pre-Order Now' : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Global keyframe animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @media (max-width: 900px) {
          div:first-child > div:first-child { display: none !important; }
          div:first-child { flex-direction: column !important; }
          div:first-child > div:last-child { width: 100% !important; border-left: none !important; }
        }
      `}</style>
    </div>
  )
}

function modalInput(t: { bg: string; border: string; text: string }): React.CSSProperties {
  return {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1px solid ${t.border}`, background: t.bg,
    color: t.text, fontSize: 13, outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }
}
