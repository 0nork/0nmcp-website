'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'

// ──────────────────────────── Types ────────────────────────────

interface Inputs {
  totalClients: number
  newClientsPerMonth: number
  hourlyRate: number
  workingDays: number
  onboardingHours: number
  reportingHours: number
  leadFollowUpHours: number
  socialMediaHours: number
  emailCampaignHours: number
  invoicingHours: number
}

interface Results {
  onboardingCost: number
  reportingCost: number
  leadFollowUpCost: number
  socialMediaCost: number
  emailCampaignCost: number
  invoicingCost: number
  totalMonthlyCost: number
  totalAnnualCost: number
  totalMonthlyHours: number
  roiPaybackDays: number
  ftesReplaced: number
}

// ──────────────────────────── Defaults ────────────────────────────

const DEFAULTS: Inputs = {
  totalClients: 15,
  newClientsPerMonth: 3,
  hourlyRate: 75,
  workingDays: 20,
  onboardingHours: 2.5,
  reportingHours: 4,
  leadFollowUpHours: 1,
  socialMediaHours: 0.5,
  emailCampaignHours: 3,
  invoicingHours: 4,
}

// ──────────────────────────── Calculator ────────────────────────────

function calculateROI(i: Inputs): Results {
  const onboardingCost = i.onboardingHours * i.hourlyRate * i.newClientsPerMonth
  const reportingCost = i.reportingHours * i.hourlyRate * i.totalClients
  const leadFollowUpCost = i.leadFollowUpHours * i.hourlyRate * i.workingDays
  const socialMediaCost = i.socialMediaHours * i.hourlyRate * i.workingDays
  const emailCampaignCost = i.emailCampaignHours * i.hourlyRate * 4
  const invoicingCost = i.invoicingHours * i.hourlyRate

  const totalMonthlyCost = onboardingCost + reportingCost + leadFollowUpCost
    + socialMediaCost + emailCampaignCost + invoicingCost
  const totalAnnualCost = totalMonthlyCost * 12

  const totalMonthlyHours =
    (i.onboardingHours * i.newClientsPerMonth)
    + (i.reportingHours * i.totalClients)
    + (i.leadFollowUpHours * i.workingDays)
    + (i.socialMediaHours * i.workingDays)
    + (i.emailCampaignHours * 4)
    + i.invoicingHours

  // Free tier = $0/mo. Payback = instant if savings > 0
  const dailySavings = totalMonthlyCost / 30
  const roiPaybackDays = dailySavings > 0 ? Math.max(1, Math.ceil(0 / dailySavings)) : 0

  const ftesReplaced = totalMonthlyHours / (i.workingDays * 8)

  return {
    onboardingCost, reportingCost, leadFollowUpCost,
    socialMediaCost, emailCampaignCost, invoicingCost,
    totalMonthlyCost, totalAnnualCost, totalMonthlyHours,
    roiPaybackDays, ftesReplaced,
  }
}

// ──────────────────────────── Animated Counter ────────────────────────────

function Counter({ value, prefix = '', suffix = '', decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number
}) {
  const [displayed, setDisplayed] = useState(value)
  const prevRef = useRef(value)
  const frameRef = useRef(0)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    prevRef.current = value

    if (from === to) return

    const duration = 600
    const start = performance.now()

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3) // easeOutCubic
      setDisplayed(from + (to - from) * ease)
      if (p < 1) frameRef.current = requestAnimationFrame(tick)
    }

    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameRef.current)
  }, [value])

  const formatted = decimals > 0
    ? displayed.toFixed(decimals)
    : Math.floor(displayed).toLocaleString()

  return <>{prefix}{formatted}{suffix}</>
}

// ──────────────────────────── Slider ────────────────────────────

function Slider({ label, value, min, max, step, unit, onChange, desc, cost }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
  desc: string
  cost: number
}) {
  return (
    <div className="float-card" style={{ padding: '1.25rem 1.5rem' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
        <span className="text-sm font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
          ${cost.toLocaleString()}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
        </span>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      <div className="flex items-center gap-3">
        <input
          type="range"
          className="roi-slider"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <span
          className="text-sm font-bold shrink-0"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', minWidth: '4rem', textAlign: 'right' }}
        >
          {value} {unit}
        </span>
      </div>
    </div>
  )
}

// ──────────────────────────── Task config ────────────────────────────

const TASKS = [
  { key: 'onboardingHours' as const, label: 'Client Onboarding', desc: 'Setup calls, account creation, welcome sequences', unit: 'hrs/client', min: 0, max: 8, step: 0.5 },
  { key: 'reportingHours' as const, label: 'Monthly Reporting', desc: 'Compiling analytics, building reports, client updates', unit: 'hrs/client', min: 0, max: 10, step: 0.5 },
  { key: 'leadFollowUpHours' as const, label: 'Lead Follow-up', desc: 'Responding to inquiries, qualifying leads, booking calls', unit: 'hrs/day', min: 0, max: 4, step: 0.25 },
  { key: 'socialMediaHours' as const, label: 'Social Media Management', desc: 'Creating posts, scheduling, engagement monitoring', unit: 'hrs/day', min: 0, max: 4, step: 0.25 },
  { key: 'emailCampaignHours' as const, label: 'Email Campaigns', desc: 'Writing sequences, list management, A/B testing', unit: 'hrs/week', min: 0, max: 10, step: 0.5 },
  { key: 'invoicingHours' as const, label: 'Invoice & Billing', desc: 'Generating invoices, payment follow-ups, reconciliation', unit: 'hrs/month', min: 0, max: 15, step: 0.5 },
] as const

// ──────────────────────────── Main Component ────────────────────────────

export default function ROICalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({ name: '', email: '', company: '' })

  const results = useMemo(() => calculateROI(inputs), [inputs])

  const update = (key: keyof Inputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const getTaskCost = (key: string): number => {
    switch (key) {
      case 'onboardingHours': return results.onboardingCost
      case 'reportingHours': return results.reportingCost
      case 'leadFollowUpHours': return results.leadFollowUpCost
      case 'socialMediaHours': return results.socialMediaCost
      case 'emailCampaignHours': return results.emailCampaignCost
      case 'invoicingHours': return results.invoicingCost
      default: return 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    setFormState('submitting')
    try {
      const res = await fetch('/api/roi-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          agencySize: inputs.totalClients,
          inputs,
          results,
        }),
      })
      if (res.ok) setFormState('success')
      else setFormState('error')
    } catch {
      setFormState('error')
    }
  }

  return (
    <>
      <style>{`
        .roi-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .roi-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(110, 224, 90, 0.3);
          transition: box-shadow 0.2s ease;
        }
        .roi-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 24px rgba(110, 224, 90, 0.5);
        }
        .roi-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 12px rgba(110, 224, 90, 0.3);
        }
        .roi-metric-card {
          padding: 1.5rem;
          border-radius: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          text-align: center;
          transition: border-color 0.2s ease;
        }
        .roi-metric-card:hover {
          border-color: var(--border-hover);
        }
        .roi-metric-value {
          font-size: 2.25rem;
          font-weight: 800;
          font-family: var(--font-mono);
          line-height: 1.2;
        }
        .roi-metric-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        @media (max-width: 768px) {
          .roi-metric-value { font-size: 1.5rem; }
        }
      `}</style>

      {/* ── Section: Agency Profile ── */}
      <section className="section-recessed" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div className="section-accent-line" />
          <span className="section-label">Your Agency</span>
          <h2 className="section-heading" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Tell us about your operation</h2>
          <p className="section-desc" style={{ marginBottom: '2rem' }}>Adjust the numbers to match your agency. We&apos;ll calculate your savings in real-time.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'totalClients' as const, label: 'Total Clients', min: 1, max: 100, step: 1, suffix: '' },
              { key: 'newClientsPerMonth' as const, label: 'New Clients/Mo', min: 0, max: 20, step: 1, suffix: '' },
              { key: 'hourlyRate' as const, label: 'Hourly Rate', min: 25, max: 300, step: 5, suffix: '$' },
              { key: 'workingDays' as const, label: 'Working Days/Mo', min: 15, max: 25, step: 1, suffix: '' },
            ].map(({ key, label, min, max, step, suffix }) => (
              <div key={key} className="float-card" style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                <label className="block text-xs mb-2" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </label>
                <div className="flex items-center justify-center gap-1">
                  {suffix === '$' && <span style={{ color: 'var(--text-muted)' }}>$</span>}
                  <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={inputs[key]}
                    onChange={(e) => update(key, Math.max(min, Math.min(max, parseFloat(e.target.value) || min)))}
                    className="text-center text-xl font-bold"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent)',
                      fontFamily: 'var(--font-mono)',
                      width: '5rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <input
                  type="range"
                  className="roi-slider mt-2"
                  min={min}
                  max={max}
                  step={step}
                  value={inputs[key]}
                  onChange={(e) => update(key, parseFloat(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: Task Sliders ── */}
      <section className="section-elevated" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div className="section-accent-line" />
          <span className="section-label">Time Spent on Manual Tasks</span>
          <h2 className="section-heading" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Where is your time going?</h2>
          <p className="section-desc" style={{ marginBottom: '2rem' }}>Drag the sliders to match how long each task takes you. Watch the costs add up.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TASKS.map((task) => (
              <Slider
                key={task.key}
                label={task.label}
                desc={task.desc}
                unit={task.unit}
                min={task.min}
                max={task.max}
                step={task.step}
                value={inputs[task.key]}
                onChange={(v) => update(task.key, v)}
                cost={getTaskCost(task.key)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: Results Dashboard ── */}
      <section className="section-recessed" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div className="section-accent-line" />
          <span className="section-label">Your Savings</span>
          <h2 className="section-heading" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Here&apos;s what automation saves you</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="roi-metric-card">
              <div className="roi-metric-value" style={{ color: 'var(--accent)' }}>
                <Counter value={results.totalMonthlyCost} prefix="$" />
              </div>
              <div className="roi-metric-label">Monthly Savings</div>
            </div>
            <div className="roi-metric-card">
              <div className="roi-metric-value" style={{ color: 'var(--accent)' }}>
                <Counter value={results.totalAnnualCost} prefix="$" />
              </div>
              <div className="roi-metric-label">Annual Savings</div>
            </div>
            <div className="roi-metric-card">
              <div className="roi-metric-value" style={{ color: '#00d4ff' }}>
                <Counter value={results.totalMonthlyHours} decimals={1} />
              </div>
              <div className="roi-metric-label">Hours Saved / Month</div>
            </div>
            <div className="roi-metric-card">
              <div className="roi-metric-value" style={{ color: '#a78bfa' }}>
                <Counter value={results.ftesReplaced} decimals={1} />
              </div>
              <div className="roi-metric-label">FTEs Replaced</div>
            </div>
          </div>

          <div className="roi-metric-card" style={{ maxWidth: '24rem', margin: '0 auto', borderColor: '#ff6b35' }}>
            <div className="roi-metric-value" style={{ color: '#ff6b35' }}>
              {results.totalMonthlyCost > 0 ? 'Instant' : '0 days'}
            </div>
            <div className="roi-metric-label">ROI Payback Period</div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              0nMCP&apos;s free tier includes 20 executions/month — $0 to start
            </p>
          </div>

          {/* Urgency line */}
          {results.totalMonthlyCost > 0 && (
            <p className="text-center mt-6 text-sm" style={{ color: '#ff6b35' }}>
              Every month you wait costs you{' '}
              <strong style={{ fontFamily: 'var(--font-mono)' }}>${results.totalMonthlyCost.toLocaleString()}</strong>
            </p>
          )}
        </div>
      </section>

      {/* ── Section: Before / After ── */}
      <section className="section-elevated" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div className="section-accent-line" />
          <span className="section-label">The Transformation</span>
          <h2 className="section-heading" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Before vs. After Automation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BEFORE */}
            <div className="float-card" style={{ padding: '1.5rem', borderColor: '#ff4444' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#ff4444' }}>
                Before 0nMCP
              </h3>
              {TASKS.map((task) => (
                <div key={task.key} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{task.label}</span>
                  <span className="text-sm font-mono font-bold" style={{ color: '#ff4444' }}>
                    ${getTaskCost(task.key).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-1">
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Total Monthly Cost</span>
                <span className="text-lg font-mono font-bold" style={{ color: '#ff4444' }}>
                  ${results.totalMonthlyCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* AFTER */}
            <div className="float-card" style={{ padding: '1.5rem', borderColor: 'var(--accent)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--accent)' }}>
                After 0nMCP
              </h3>
              {TASKS.map((task) => (
                <div key={task.key} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{task.label}</span>
                  <span className="text-sm font-mono font-bold" style={{ color: 'var(--accent)' }}>
                    $0 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>automated</span>
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-1">
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Total Monthly Cost</span>
                <span className="text-lg font-mono font-bold" style={{ color: 'var(--accent)' }}>
                  $0<span className="text-sm" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/mo with free tier</span>
                </span>
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--accent)', textAlign: 'center' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>You save </span>
                <span className="text-lg font-mono font-bold" style={{ color: 'var(--accent)' }}>
                  ${results.totalMonthlyCost.toLocaleString()}/month
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: FAQ ── */}
      <section className="section-recessed" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div className="section-accent-line" />
          <span className="section-label">FAQ</span>
          <h2 className="section-heading" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Common questions</h2>

          {[
            {
              q: 'How accurate is this calculator?',
              a: 'The calculator uses industry-average task durations as defaults, but you can adjust every slider to match your actual numbers. The savings are based on fully automating each task with 0nMCP workflows — real agencies report 90-100% time reduction on these tasks.',
            },
            {
              q: 'What exactly does 0nMCP automate?',
              a: 'Client onboarding sequences, automated reporting pipelines, lead scoring and follow-up workflows, social media scheduling, email campaign triggers, and invoice generation. All powered by 1,155+ tools across 91 services — CRM, Stripe, email, social, databases, and more.',
            },
            {
              q: 'How long does it take to set up?',
              a: 'Most agencies are running their first automation within 30 minutes. Install 0nMCP with one command (npm i 0nmcp), connect your services, and start describing what you want automated. The AI handles the rest.',
            },
            {
              q: 'Is it really free?',
              a: 'Yes — the free tier includes 20 workflow executions per month, which covers most small agency needs. For higher volume, the metered plan charges $0.01 per execution with no monthly fees.',
            },
          ].map(({ q, a }) => (
            <details key={q} className="mb-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <summary
                className="cursor-pointer py-3 text-sm font-semibold"
                style={{ color: 'var(--text-primary)', listStyle: 'none' }}
              >
                <span className="flex items-center justify-between">
                  {q}
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>+</span>
                </span>
              </summary>
              <p className="pb-3 text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Section: Email Capture ── */}
      <section className="section-elevated" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '32rem', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-accent-line" />
          <span className="section-label">Get Your Report</span>
          <h2 className="section-heading" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Get Your Custom ROI Report</h2>
          <p className="section-desc" style={{ marginBottom: '2rem' }}>
            We&apos;ll send you a detailed breakdown with next steps to automate your agency.
          </p>

          {formState === 'success' ? (
            <div className="float-card" style={{ padding: '2rem', borderColor: 'var(--accent)' }}>
              <div className="text-2xl mb-2" style={{ color: 'var(--accent)' }}>Sent!</div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Check your inbox for your custom ROI report. Ready to start saving ${results.totalMonthlyCost.toLocaleString()}/month?
              </p>
              <Link href="/turn-it-on" className="btn-accent inline-flex items-center gap-2 mt-4">
                Turn it 0n <span>&#8594;</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                required
                className="auth-field"
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
              <input
                type="email"
                placeholder="you@agency.com"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                required
                className="auth-field"
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
              <input
                type="text"
                placeholder="Company name (optional)"
                value={formData.company}
                onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))}
                className="auth-field"
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
              <button
                type="submit"
                disabled={formState === 'submitting'}
                className="btn-accent"
                style={{
                  padding: '0.875rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  opacity: formState === 'submitting' ? 0.6 : 1,
                }}
              >
                {formState === 'submitting' ? 'Sending...' : 'Get My ROI Report'}
              </button>
              {formState === 'error' && (
                <p className="text-xs" style={{ color: '#ff4444' }}>Something went wrong. Please try again.</p>
              )}
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No spam. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
