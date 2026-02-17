'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ServiceIcon, { ALL_SERVICES } from '@/components/ServiceLogos'

/* ── Step definitions ── */
const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'business', label: 'Your Business' },
  { id: 'services', label: 'Services' },
  { id: 'goal', label: 'Your Goal' },
  { id: 'build', label: 'Build RUN' },
  { id: 'switch', label: 'Your SWITCH' },
]

const INDUSTRIES = [
  { id: 'agency', label: 'Marketing Agency', icon: '📢' },
  { id: 'saas', label: 'SaaS / Software', icon: '💻' },
  { id: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
  { id: 'consulting', label: 'Consulting / Services', icon: '🤝' },
  { id: 'realestate', label: 'Real Estate', icon: '🏠' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'other', label: 'Other', icon: '⚡' },
]

const TEAM_SIZES = ['Just me', '2-5', '6-20', '21-100', '100+']

const GOALS = [
  {
    id: 'lead-nurture',
    label: 'Lead Nurturing',
    desc: 'Auto-follow-up with new leads across email, SMS, and CRM',
    services: ['gmail', 'twilio', 'hubspot', 'slack'],
    steps: [
      { action: 'watch', service: 'hubspot', detail: 'Watch for new contact in CRM' },
      { action: 'send', service: 'gmail', detail: 'Send personalized welcome email' },
      { action: 'send', service: 'twilio', detail: 'Send intro SMS with booking link' },
      { action: 'notify', service: 'slack', detail: 'Notify sales team in #leads channel' },
      { action: 'update', service: 'hubspot', detail: 'Update contact stage to "Nurturing"' },
    ],
  },
  {
    id: 'onboarding',
    label: 'Client Onboarding',
    desc: 'Automate new client setup across all your tools',
    services: ['stripe', 'notion', 'google-calendar', 'slack', 'gmail'],
    steps: [
      { action: 'watch', service: 'stripe', detail: 'Watch for new payment in Stripe' },
      { action: 'create', service: 'notion', detail: 'Create client workspace in Notion' },
      { action: 'schedule', service: 'google-calendar', detail: 'Schedule kickoff meeting' },
      { action: 'send', service: 'gmail', detail: 'Send onboarding email with docs' },
      { action: 'notify', service: 'slack', detail: 'Post welcome in #clients channel' },
    ],
  },
  {
    id: 'social-content',
    label: 'Content Pipeline',
    desc: 'Generate, schedule, and track content across channels',
    services: ['openai', 'airtable', 'slack', 'google-sheets'],
    steps: [
      { action: 'generate', service: 'openai', detail: 'Generate content ideas with AI' },
      { action: 'create', service: 'airtable', detail: 'Add to content calendar in Airtable' },
      { action: 'review', service: 'slack', detail: 'Send for team approval in Slack' },
      { action: 'track', service: 'google-sheets', detail: 'Log performance metrics' },
    ],
  },
  {
    id: 'support-ops',
    label: 'Support Operations',
    desc: 'Route tickets, escalate issues, and track resolution',
    services: ['zendesk', 'slack', 'jira', 'gmail'],
    steps: [
      { action: 'watch', service: 'zendesk', detail: 'Watch for new support ticket' },
      { action: 'analyze', service: 'openai', detail: 'AI classify priority & category' },
      { action: 'route', service: 'slack', detail: 'Route to correct team channel' },
      { action: 'create', service: 'jira', detail: 'Create linked Jira issue if bug' },
      { action: 'send', service: 'gmail', detail: 'Send acknowledgment to customer' },
    ],
  },
  {
    id: 'invoice-flow',
    label: 'Invoice Automation',
    desc: 'Generate invoices, track payments, notify on status',
    services: ['stripe', 'gmail', 'slack', 'google-sheets'],
    steps: [
      { action: 'create', service: 'stripe', detail: 'Create invoice in Stripe' },
      { action: 'send', service: 'gmail', detail: 'Email invoice to client' },
      { action: 'track', service: 'google-sheets', detail: 'Log to revenue tracker' },
      { action: 'watch', service: 'stripe', detail: 'Watch for payment status change' },
      { action: 'notify', service: 'slack', detail: 'Alert team on payment received' },
    ],
  },
  {
    id: 'custom',
    label: 'Custom RUN',
    desc: "Describe what you need — we'll build it",
    services: [],
    steps: [],
  },
]

/* ── Main component ── */
export default function DemoBuilder() {
  const [step, setStep] = useState(0)
  const [industry, setIndustry] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [businessName, setBusiness] = useState('')
  const [email, setEmail] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedGoal, setSelectedGoal] = useState('')
  const [buildProgress, setBuildProgress] = useState(0)
  const [buildComplete, setBuildComplete] = useState(false)
  const [customGoal, setCustomGoal] = useState('')

  const goal = GOALS.find((g) => g.id === selectedGoal)

  /* Simulate build animation */
  useEffect(() => {
    if (step !== 4) return
    setBuildProgress(0)
    setBuildComplete(false)
    let i = 0
    const total = goal?.steps.length || 4
    const id = setInterval(() => {
      i++
      setBuildProgress(i)
      if (i >= total) {
        clearInterval(id)
        setTimeout(() => setBuildComplete(true), 600)
      }
    }, 800)
    return () => clearInterval(id)
  }, [step, goal])

  const canAdvance = () => {
    if (step === 1) return industry && teamSize
    if (step === 2) return selectedServices.length >= 2
    if (step === 3) return selectedGoal !== ''
    if (step === 4) return buildComplete
    return true
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
  }
  const prev = () => {
    if (step > 0) setStep(step - 1)
  }

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  /* Generate .0n SWITCH file content */
  const generateSwitchFile = () => {
    const switchData = {
      '0n': '1.0',
      name: `${businessName || 'My'} ${goal?.label || 'Custom'} RUN`,
      description: goal?.desc || customGoal || 'Custom automation',
      version: '1.0.0',
      trigger: { type: 'webhook', event: goal?.steps[0]?.action || 'manual' },
      services: (goal?.services || selectedServices).reduce(
        (acc, s) => ({ ...acc, [s]: { connected: false, api_key: '{{vault.' + s + '}}' } }),
        {}
      ),
      pipeline: [
        {
          phase: 'execute',
          assembly: (goal?.steps || []).map((s, i) => ({
            step: i + 1,
            service: s.service,
            action: s.action,
            detail: s.detail,
          })),
        },
      ],
      metadata: {
        industry,
        team_size: teamSize,
        business: businessName,
        created: new Date().toISOString(),
        source: 'demo-builder',
      },
    }
    return JSON.stringify(switchData, null, 2)
  }

  const downloadSwitch = () => {
    const content = generateSwitchFile()
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(businessName || 'my-first').toLowerCase().replace(/\s+/g, '-')}-run.0n`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="demo-page">
      {/* Progress bar */}
      <div className="demo-progress">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`demo-progress-step${i <= step ? ' active' : ''}${i < step ? ' done' : ''}`}
          >
            <div className="demo-progress-dot">
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="demo-progress-label">{s.label}</span>
          </div>
        ))}
        <div
          className="demo-progress-fill"
          style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Step content */}
      <div className="demo-content">
        {/* ── STEP 0: Welcome ── */}
        {step === 0 && (
          <div className="demo-step demo-step-welcome">
            <div className="demo-step-badge">Interactive Demo</div>
            <h1 className="demo-step-title">
              Build Your First{' '}
              <span style={{ color: 'var(--accent)' }}>RUN</span>
            </h1>
            <p className="demo-step-desc">
              In 60 seconds, we&apos;ll learn about your business, connect your
              services, and generate a custom automation &mdash; saved as your
              very own <strong style={{ color: 'var(--accent)' }}>SWITCH file</strong>.
              Import it to Turn it 0n.
            </p>
            <div className="demo-step-features">
              {[
                { icon: '⚡', text: 'No signup required' },
                { icon: '🔒', text: 'Nothing stored' },
                { icon: '📦', text: 'Download your .0n file' },
              ].map((f) => (
                <div key={f.text} className="demo-feature">
                  <span>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Business ── */}
        {step === 1 && (
          <div className="demo-step">
            <h2 className="demo-step-title">Tell us about your business</h2>
            <p className="demo-step-desc">
              This helps us recommend the perfect RUN for you.
            </p>

            <div className="demo-field">
              <label>Business name (optional)</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="Acme Corp"
                className="demo-input"
              />
            </div>

            <div className="demo-field">
              <label>Industry</label>
              <div className="demo-option-grid">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.id}
                    className={`demo-option${industry === ind.id ? ' selected' : ''}`}
                    onClick={() => setIndustry(ind.id)}
                  >
                    <span className="demo-option-icon">{ind.icon}</span>
                    <span>{ind.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="demo-field">
              <label>Team size</label>
              <div className="demo-chip-row">
                {TEAM_SIZES.map((t) => (
                  <button
                    key={t}
                    className={`demo-chip${teamSize === t ? ' selected' : ''}`}
                    onClick={() => setTeamSize(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="demo-field">
              <label>Email (optional &mdash; we&apos;ll send your SWITCH file)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="demo-input"
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Services ── */}
        {step === 2 && (
          <div className="demo-step">
            <h2 className="demo-step-title">
              Which services do you use?
            </h2>
            <p className="demo-step-desc">
              Select at least 2. These will be connected in your RUN.
            </p>
            <div className="demo-service-grid">
              {ALL_SERVICES.map((s) => (
                <button
                  key={s.id}
                  className={`demo-service-card${selectedServices.includes(s.id) ? ' selected' : ''}`}
                  onClick={() => toggleService(s.id)}
                >
                  <ServiceIcon id={s.id} size={24} />
                  <span className="demo-service-name">{s.name}</span>
                  <span className="demo-service-cat">{s.category}</span>
                  {selectedServices.includes(s.id) && (
                    <div className="demo-service-check">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="demo-hint">
              {selectedServices.length} selected
              {selectedServices.length < 2 && ' — select at least 2'}
            </p>
          </div>
        )}

        {/* ── STEP 3: Goal ── */}
        {step === 3 && (
          <div className="demo-step">
            <h2 className="demo-step-title">
              What do you want to automate?
            </h2>
            <p className="demo-step-desc">
              Pick a template or describe your own.
            </p>
            <div className="demo-goal-grid">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  className={`demo-goal-card${selectedGoal === g.id ? ' selected' : ''}`}
                  onClick={() => setSelectedGoal(g.id)}
                >
                  <span className="demo-goal-label">{g.label}</span>
                  <span className="demo-goal-desc">{g.desc}</span>
                  {g.services.length > 0 && (
                    <div className="demo-goal-services">
                      {g.services.map((sid) => (
                        <ServiceIcon key={sid} id={sid} size={16} />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedGoal === 'custom' && (
              <div className="demo-field" style={{ marginTop: '1rem' }}>
                <label>Describe your automation</label>
                <textarea
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g., When a customer fills out a form, create a deal in my CRM, send them a welcome email, and schedule a follow-up call..."
                  className="demo-input demo-textarea"
                  rows={3}
                />
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Building ── */}
        {step === 4 && goal && (
          <div className="demo-step">
            <h2 className="demo-step-title">
              {buildComplete ? (
                <>
                  Your RUN is <span style={{ color: 'var(--accent)' }}>ready</span>
                </>
              ) : (
                <>
                  Building your <span style={{ color: 'var(--accent)' }}>RUN</span>...
                </>
              )}
            </h2>

            <div className="demo-build-visual">
              <div className="demo-build-pipeline">
                {(goal.steps.length > 0 ? goal.steps : [
                  { action: 'configure', service: selectedServices[0] || 'openai', detail: 'Configure trigger' },
                  { action: 'connect', service: selectedServices[1] || 'slack', detail: 'Connect services' },
                  { action: 'build', service: selectedServices[2] || 'github', detail: 'Build pipeline' },
                  { action: 'verify', service: selectedServices[0] || 'openai', detail: 'Verify connections' },
                ]).map((s, i) => (
                  <div
                    key={i}
                    className={`demo-build-step${i < buildProgress ? ' done' : ''}${i === buildProgress ? ' active' : ''}`}
                  >
                    <div className="demo-build-step-icon">
                      {i < buildProgress ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12l5 5L19 7" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <ServiceIcon id={s.service} size={18} />
                      )}
                    </div>
                    <div className="demo-build-step-info">
                      <span className="demo-build-step-action">{s.action}</span>
                      <span className="demo-build-step-detail">{s.detail}</span>
                    </div>
                    {i === buildProgress && !buildComplete && (
                      <div className="demo-build-spinner" />
                    )}
                  </div>
                ))}
              </div>

              {buildComplete && (
                <div className="demo-build-done">
                  <div className="demo-build-done-icon">✓</div>
                  <p>
                    <strong>{goal.steps.length || 4} steps</strong> configured across{' '}
                    <strong>{(goal.services.length || selectedServices.length)} services</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 5: SWITCH file ── */}
        {step === 5 && (
          <div className="demo-step demo-step-switch">
            <div className="demo-switch-glow" />
            <h2 className="demo-step-title">
              Your <span style={{ color: 'var(--accent)' }}>SWITCH</span> file
              is ready
            </h2>
            <p className="demo-step-desc">
              This is your portable automation &mdash; a <code>.0n</code> file.
              Download it, then import it into 0nMCP to{' '}
              <strong style={{ color: 'var(--accent)' }}>Turn it 0n</strong>.
            </p>

            {/* File preview */}
            <div className="demo-switch-preview">
              <div className="demo-switch-header">
                <span className="demo-switch-filename">
                  {(businessName || 'my-first').toLowerCase().replace(/\s+/g, '-')}-run.0n
                </span>
                <span className="demo-switch-badge">SWITCH FILE</span>
              </div>
              <pre className="demo-switch-code">
                <code>{generateSwitchFile()}</code>
              </pre>
            </div>

            {/* Actions */}
            <div className="demo-switch-actions">
              <button onClick={downloadSwitch} className="demo-switch-download">
                Download SWITCH File
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <Link href="/turn-it-on" className="demo-switch-cta no-underline">
                Turn it 0n →
              </Link>
            </div>

            {/* Next steps */}
            <div className="demo-next-steps">
              <h3>What&apos;s next?</h3>
              <div className="demo-next-grid">
                <div className="demo-next-card">
                  <span className="demo-next-num">01</span>
                  <span>Install 0nMCP: <code>npm i 0nmcp</code></span>
                </div>
                <div className="demo-next-card">
                  <span className="demo-next-num">02</span>
                  <span>Import your SWITCH: <code>0nmcp engine import</code></span>
                </div>
                <div className="demo-next-card">
                  <span className="demo-next-num">03</span>
                  <span>Add API keys for your services</span>
                </div>
                <div className="demo-next-card">
                  <span className="demo-next-num">04</span>
                  <span>Turn it 0n and watch it run</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="demo-nav">
        {step > 0 && (
          <button onClick={prev} className="demo-nav-back">
            ← Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={next}
          disabled={!canAdvance()}
          className={`demo-nav-next${step === STEPS.length - 1 ? ' hidden' : ''}`}
        >
          {step === 0 ? "Let's Go" : step === 4 ? 'See Your SWITCH' : 'Continue'} →
        </button>
      </div>
    </div>
  )
}
