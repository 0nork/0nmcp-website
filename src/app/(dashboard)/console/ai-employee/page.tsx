'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'

// ── Types ──

interface AiEmployeeConfig {
  name: string
  personality: string
  businessDescription: string
  services: string
  greetingMessage: string
  channels: {
    chatWidget: boolean
    sms: boolean
    email: boolean
    whatsapp: boolean
  }
  autoBookAppointments: boolean
  selectedCalendar: string
  leadQualification: boolean
  escalationThreshold: number
  workingHoursStart: string
  workingHoursEnd: string
  afterHoursMessage: string
  enabled: boolean
}

interface Stats {
  conversations: number
  appointments: number
  contacts: number
}

// ── Defaults ──

const DEFAULT_CONFIG: AiEmployeeConfig = {
  name: '0n Assistant',
  personality: 'Professional',
  businessDescription: '',
  services: '',
  greetingMessage: 'Hi there! How can I help you today?',
  channels: { chatWidget: true, sms: false, email: false, whatsapp: false },
  autoBookAppointments: false,
  selectedCalendar: '',
  leadQualification: true,
  escalationThreshold: 3,
  workingHoursStart: '09:00',
  workingHoursEnd: '17:00',
  afterHoursMessage: "Thanks for reaching out! We're currently outside business hours. We'll get back to you first thing in the morning.",
  enabled: false,
}

const PERSONALITIES = ['Professional', 'Friendly', 'Casual', 'Sales-focused']

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, '0')
  return `${h}:00`
})

// ── Colors ──

const C = {
  bg: '#0f1419',
  card: 'rgba(255,255,255,0.03)',
  cardHover: 'rgba(255,255,255,0.055)',
  border: 'rgba(255,255,255,0.06)',
  borderFocus: 'rgba(126,217,87,0.4)',
  accent: '#7ed957',
  accentDim: 'rgba(126,217,87,0.12)',
  accentGlow: 'rgba(126,217,87,0.15)',
  cyan: '#00d4ff',
  cyanDim: 'rgba(0,212,255,0.08)',
  textPrimary: '#e8eaed',
  textSecondary: '#9aa0a8',
  textMuted: '#5f6672',
  heroGradient: 'linear-gradient(135deg, rgba(126,217,87,0.08), rgba(0,212,255,0.04))',
  inputBg: 'rgba(255,255,255,0.04)',
  toggleOff: 'rgba(255,255,255,0.1)',
  toggleOn: '#7ed957',
  red: '#ef4444',
}

// ── Helpers ──

function personalityToTone(p: string): string {
  switch (p) {
    case 'Friendly': return 'warm and approachable'
    case 'Casual': return 'relaxed and conversational'
    case 'Sales-focused': return 'persuasive and value-driven'
    default: return 'professional and courteous'
  }
}

// ── Component ──

export default function AiEmployeePage(): ReactNode {
  const [config, setConfig] = useState<AiEmployeeConfig>(DEFAULT_CONFIG)
  const [stats, setStats] = useState<Stats>({ conversations: 0, appointments: 0, contacts: 0 })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // ── Fetch config + stats ──

  useEffect(() => {
    async function load() {
      try {
        const [configRes, convoRes, calRes, contactRes] = await Promise.all([
          fetch('/api/console/ai-employee/config'),
          fetch('/api/console/crm/conversations').catch(() => null),
          fetch('/api/console/crm/calendar').catch(() => null),
          fetch('/api/console/crm/contacts').catch(() => null),
        ])

        if (configRes.ok) {
          const d = await configRes.json()
          if (d.config) setConfig({ ...DEFAULT_CONFIG, ...d.config })
        }

        const convoData = convoRes?.ok ? await convoRes.json() : null
        const calData = calRes?.ok ? await calRes.json() : null
        const contactData = contactRes?.ok ? await contactRes.json() : null

        setStats({
          conversations: convoData?.conversations?.length ?? convoData?.total ?? 0,
          appointments: calData?.appointments?.length ?? calData?.total ?? 0,
          contacts: contactData?.contacts?.length ?? contactData?.total ?? 0,
        })
      } catch {
        // silently fail — defaults are fine
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Save ──

  const save = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/console/ai-employee/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        setToast('AI Employee configuration saved successfully')
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        setToast(`Error: ${err.error || 'Failed to save'}`)
      }
    } catch {
      setToast('Network error — please try again')
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3500)
    }
  }, [config])

  // ── Update helpers ──

  function set<K extends keyof AiEmployeeConfig>(key: K, value: AiEmployeeConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  function toggleChannel(ch: keyof AiEmployeeConfig['channels']) {
    setConfig(prev => ({
      ...prev,
      channels: { ...prev.channels, [ch]: !prev.channels[ch] },
    }))
  }

  // ── Shared inline styles ──

  const cardStyle: React.CSSProperties = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 28,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: C.inputBg,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: '12px 16px',
    color: C.textPrimary,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: C.textSecondary,
    marginBottom: 8,
    letterSpacing: '0.02em',
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239aa0a8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: 36,
    cursor: 'pointer',
  }

  // ── Render: Loading ──

  if (loading) {
    return (
      <div style={{ padding: 40, color: C.textMuted, textAlign: 'center', fontSize: 15 }}>
        Loading AI Employee...
      </div>
    )
  }

  // ── Preview messages ──

  const greeting = config.greetingMessage || 'Hi there! How can I help you today?'
  const tone = personalityToTone(config.personality)
  const serviceSample = config.services
    ? config.services.split(',')[0]?.trim() || 'our services'
    : 'our services'

  const previewMessages = [
    { role: 'ai', text: greeting },
    { role: 'user', text: `Do you offer ${serviceSample}?` },
    {
      role: 'ai',
      text: config.services
        ? `Absolutely! We specialize in ${serviceSample}. I'd love to tell you more about how we can help. Would you like to schedule a quick call?`
        : `Great question! I'd be happy to help you learn more about what we offer. Would you like to schedule a quick call to discuss your needs?`,
    },
  ]

  // ── Render ──

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          background: toast.startsWith('Error') ? 'rgba(239,68,68,0.15)' : 'rgba(126,217,87,0.15)',
          border: `1px solid ${toast.startsWith('Error') ? 'rgba(239,68,68,0.3)' : 'rgba(126,217,87,0.3)'}`,
          borderRadius: 12,
          padding: '14px 24px',
          color: toast.startsWith('Error') ? C.red : C.accent,
          fontSize: 14,
          fontWeight: 500,
          backdropFilter: 'blur(20px)',
          animation: 'fadeIn 0.25s ease',
        }}>
          {toast}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          SECTION 1: STATUS HERO
          ══════════════════════════════════════════════ */}
      <div style={{
        background: C.heroGradient,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: '36px 40px',
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>

          {/* Left: Title + Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: C.accentDim,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                  <path d="M16 14H8a5 5 0 0 0-5 5v1a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1a5 5 0 0 0-5-5z" />
                  <circle cx="12" cy="6" r="1" fill={C.accent} />
                </svg>
              </div>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.02em' }}>
                AI Employee
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: C.textSecondary }}>
                Your always-on assistant that handles conversations, books appointments, and qualifies leads.
              </p>
            </div>

            {/* Status toggle */}
            <button
              onClick={() => set('enabled', !config.enabled)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 18px',
                borderRadius: 40,
                border: `1px solid ${config.enabled ? 'rgba(126,217,87,0.3)' : C.border}`,
                background: config.enabled ? 'rgba(126,217,87,0.1)' : 'rgba(255,255,255,0.04)',
                color: config.enabled ? C.accent : C.textMuted,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.25s',
                letterSpacing: '0.04em',
              }}
            >
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: config.enabled ? C.accent : C.textMuted,
                boxShadow: config.enabled ? `0 0 8px ${C.accentGlow}` : 'none',
              }} />
              {config.enabled ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>

          {/* Right: Mini Stats */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Conversations', value: stats.conversations.toLocaleString(), color: C.accent },
              { label: 'Appointments', value: stats.appointments.toLocaleString(), color: C.cyan },
              { label: 'Contacts', value: stats.contacts.toLocaleString(), color: '#a78bfa' },
              { label: 'Avg Response', value: '< 30s', color: '#fbbf24' },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '14px 20px',
                minWidth: 130,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: '-0.02em' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 2: CONFIGURATION (2-column)
          ══════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

        {/* ── Left Column: Personality & Knowledge ── */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 24px', fontSize: 17, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>
            Personality & Knowledge
          </h2>

          {/* Employee Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Employee Name</label>
            <input
              style={inputStyle}
              value={config.name}
              onChange={e => set('name', e.target.value)}
              placeholder="0n Assistant"
              onFocus={e => { e.currentTarget.style.borderColor = C.borderFocus }}
              onBlur={e => { e.currentTarget.style.borderColor = C.border }}
            />
          </div>

          {/* Personality */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Personality</label>
            <select
              style={selectStyle}
              value={config.personality}
              onChange={e => set('personality', e.target.value)}
            >
              {PERSONALITIES.map(p => (
                <option key={p} value={p} style={{ background: '#1a1a24', color: C.textPrimary }}>{p}</option>
              ))}
            </select>
          </div>

          {/* Business Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Business Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: 88, resize: 'vertical' }}
              value={config.businessDescription}
              onChange={e => set('businessDescription', e.target.value)}
              placeholder="Describe what your business does..."
              onFocus={e => { e.currentTarget.style.borderColor = C.borderFocus }}
              onBlur={e => { e.currentTarget.style.borderColor = C.border }}
            />
          </div>

          {/* Services Offered */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Services Offered</label>
            <textarea
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              value={config.services}
              onChange={e => set('services', e.target.value)}
              placeholder="Web design, SEO, Content marketing, Social media management"
              onFocus={e => { e.currentTarget.style.borderColor = C.borderFocus }}
              onBlur={e => { e.currentTarget.style.borderColor = C.border }}
            />
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>Comma-separated list</div>
          </div>

          {/* Greeting Message */}
          <div>
            <label style={labelStyle}>Greeting Message</label>
            <textarea
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              value={config.greetingMessage}
              onChange={e => set('greetingMessage', e.target.value)}
              placeholder="Hi there! How can I help you today?"
              onFocus={e => { e.currentTarget.style.borderColor = C.borderFocus }}
              onBlur={e => { e.currentTarget.style.borderColor = C.border }}
            />
          </div>
        </div>

        {/* ── Right Column: Channels & Automation ── */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 24px', fontSize: 17, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>
            Channels & Automation
          </h2>

          {/* Channel Toggles */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ ...labelStyle, marginBottom: 14 }}>Active Channels</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {([
                ['chatWidget', 'Chat Widget'] as const,
                ['sms', 'SMS'] as const,
                ['email', 'Email'] as const,
                ['whatsapp', 'WhatsApp'] as const,
              ]).map(([key, label]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, color: C.textPrimary }}>{label}</span>
                  <button
                    onClick={() => toggleChannel(key)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      border: 'none',
                      background: config.channels[key] ? C.toggleOn : C.toggleOff,
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.25s',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: 3,
                      left: config.channels[key] ? 23 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.25s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: C.border, margin: '0 0 24px' }} />

          {/* Auto-book Appointments */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: C.textPrimary }}>Auto-book appointments</span>
              <button
                onClick={() => set('autoBookAppointments', !config.autoBookAppointments)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  border: 'none',
                  background: config.autoBookAppointments ? C.toggleOn : C.toggleOff,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.25s',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: 3,
                  left: config.autoBookAppointments ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.25s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>
            {config.autoBookAppointments && (
              <input
                style={inputStyle}
                value={config.selectedCalendar}
                onChange={e => set('selectedCalendar', e.target.value)}
                placeholder="Calendar name or ID"
                onFocus={e => { e.currentTarget.style.borderColor = C.borderFocus }}
                onBlur={e => { e.currentTarget.style.borderColor = C.border }}
              />
            )}
          </div>

          {/* Lead Qualification */}
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 14, color: C.textPrimary, display: 'block' }}>Lead qualification</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>Auto-tag hot / warm / cold</span>
            </div>
            <button
              onClick={() => set('leadQualification', !config.leadQualification)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                background: config.leadQualification ? C.toggleOn : C.toggleOff,
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.25s',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: 3,
                left: config.leadQualification ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.25s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>

          {/* Escalation Threshold */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Escalate to human after</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="number"
                min={1}
                max={20}
                style={{ ...inputStyle, width: 80, textAlign: 'center' }}
                value={config.escalationThreshold}
                onChange={e => set('escalationThreshold', parseInt(e.target.value) || 3)}
                onFocus={e => { e.currentTarget.style.borderColor = C.borderFocus }}
                onBlur={e => { e.currentTarget.style.borderColor = C.border }}
              />
              <span style={{ fontSize: 13, color: C.textMuted }}>unanswered questions</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: C.border, margin: '0 0 24px' }} />

          {/* Working Hours */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Working Hours</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select
                style={{ ...selectStyle, flex: 1 }}
                value={config.workingHoursStart}
                onChange={e => set('workingHoursStart', e.target.value)}
              >
                {HOURS.map(h => (
                  <option key={h} value={h} style={{ background: '#1a1a24', color: C.textPrimary }}>{h}</option>
                ))}
              </select>
              <span style={{ color: C.textMuted, fontSize: 13 }}>to</span>
              <select
                style={{ ...selectStyle, flex: 1 }}
                value={config.workingHoursEnd}
                onChange={e => set('workingHoursEnd', e.target.value)}
              >
                {HOURS.map(h => (
                  <option key={h} value={h} style={{ background: '#1a1a24', color: C.textPrimary }}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* After-hours Message */}
          <div>
            <label style={labelStyle}>After-hours Message</label>
            <textarea
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              value={config.afterHoursMessage}
              onChange={e => set('afterHoursMessage', e.target.value)}
              placeholder="We're currently outside business hours..."
              onFocus={e => { e.currentTarget.style.borderColor = C.borderFocus }}
              onBlur={e => { e.currentTarget.style.borderColor = C.border }}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SECTION 3: CONVERSATION PREVIEW
          ══════════════════════════════════════════════ */}
      <div style={{
        ...cardStyle,
        background: 'rgba(0,0,0,0.3)',
        border: `1px solid ${C.border}`,
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>
              Conversation Preview
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textMuted }}>
              Live preview based on your personality and greeting settings ({tone})
            </p>
          </div>
          <button
            onClick={() => {
              // Open the console chat with a test prompt
              window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { test: true } }))
            }}
            style={{
              padding: '10px 22px',
              borderRadius: 10,
              border: `1px solid rgba(0,212,255,0.3)`,
              background: 'rgba(0,212,255,0.08)',
              color: C.cyan,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0,212,255,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0,212,255,0.08)'
            }}
          >
            Test Employee
          </button>
        </div>

        {/* Chat simulation */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 14,
          padding: 24,
          border: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {previewMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 10,
              }}
            >
              {msg.role === 'ai' && (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: C.accentDim,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
                  </svg>
                </div>
              )}
              <div style={{
                maxWidth: '70%',
                padding: '12px 18px',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'rgba(126,217,87,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(126,217,87,0.2)' : C.border}`,
                color: C.textPrimary,
                fontSize: 14,
                lineHeight: 1.55,
              }}>
                {msg.role === 'ai' && (
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 4, letterSpacing: '0.04em' }}>
                    {config.name || '0n Assistant'}
                  </div>
                )}
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                  fontSize: 13,
                  color: C.textMuted,
                  fontWeight: 600,
                }}>
                  U
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SAVE BUTTON
          ══════════════════════════════════════════════ */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: '14px 40px',
            borderRadius: 12,
            border: 'none',
            background: saving
              ? 'rgba(126,217,87,0.2)'
              : `linear-gradient(135deg, ${C.accent}, #5cb83a)`,
            color: saving ? C.textMuted : '#0f1419',
            fontSize: 15,
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s',
            letterSpacing: '0.02em',
            boxShadow: saving ? 'none' : `0 4px 20px ${C.accentGlow}`,
          }}
          onMouseEnter={e => {
            if (!saving) e.currentTarget.style.boxShadow = `0 6px 30px rgba(126,217,87,0.3)`
          }}
          onMouseLeave={e => {
            if (!saving) e.currentTarget.style.boxShadow = `0 4px 20px ${C.accentGlow}`
          }}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* ── Keyframe animation for toast ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
