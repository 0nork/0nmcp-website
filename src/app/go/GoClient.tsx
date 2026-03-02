'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ─── Data ─────────────────────────────────────────────────── */

const PAIN_POINTS = [
  'Logging into 10+ different apps every single day',
  'Copy-pasting data between tools that should talk to each other',
  'Paying for automations that break every month',
  'Wishing your AI could actually DO things — not just chat',
]

const STEPS = [
  {
    num: '01',
    title: 'Sign up',
    desc: 'Free. 30 seconds. No credit card.',
    color: '#7ed957',
  },
  {
    num: '02',
    title: 'Connect your tools',
    desc: 'Paste your API keys into the encrypted Vault. We can\u2019t see them.',
    color: '#00d4ff',
  },
  {
    num: '03',
    title: 'Tell it what to do',
    desc: 'Type in plain English or drag and drop in the visual builder.',
    color: '#a78bfa',
  },
]

const FEATURES = [
  {
    icon: '\u2728',
    title: 'AI Chat',
    desc: 'Ask it anything. It controls your tools. "Send a follow-up to all leads from this week" \u2014 done.',
  },
  {
    icon: '\u2B50',
    title: 'Visual Builder',
    desc: 'Drag and drop workflows. Connect services visually. No code required.',
  },
  {
    icon: '\uD83D\uDD12',
    title: 'Encrypted Vault',
    desc: 'Your API keys are encrypted with AES-256-GCM before they leave your browser. We literally cannot read them.',
  },
  {
    icon: '\uD83D\uDCE7',
    title: 'Cold Email',
    desc: 'Built-in Smartlead integration. Create campaigns, add leads, track opens and replies \u2014 all from one screen.',
  },
  {
    icon: '\uD83D\uDCF1',
    title: 'Social Media',
    desc: 'Post to LinkedIn, Reddit, and more without leaving the Console. Schedule and track everything.',
  },
  {
    icon: '\uD83D\uDCCA',
    title: 'CRM',
    desc: 'Manage contacts, pipelines, conversations, invoices. 245 CRM tools at your fingertips.',
  },
  {
    icon: '\uD83D\uDED2',
    title: 'Template Store',
    desc: 'Pre-built automations you can import in one click. Sales flows, onboarding, reporting \u2014 ready to go.',
  },
  {
    icon: '\u26A1',
    title: 'Payments',
    desc: 'Stripe integration. Create invoices, track subscriptions, issue refunds. No separate dashboard.',
  },
]

const SERVICES_PREVIEW = [
  'Stripe', 'Gmail', 'Slack', 'HubSpot', 'Shopify', 'Google Sheets',
  'Discord', 'Twilio', 'Notion', 'Airtable', 'Calendly', 'Zoom',
  'Jira', 'Linear', 'Zendesk', 'MongoDB', 'SendGrid', 'Mailchimp',
  'GitHub', 'Supabase', 'Google Drive', 'Google Calendar', 'OpenAI', 'Anthropic',
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Get started. No credit card.',
    color: '#7ed957',
    bg: 'rgba(126,217,87,0.06)',
    border: 'rgba(126,217,87,0.2)',
    cta: 'Start Free',
    href: '/signup?redirect=/console',
    features: [
      'Console access',
      'Encrypted Vault (5 services)',
      'Visual workflow builder',
      'Community access',
      'Local AI fallback',
    ],
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    desc: '7-day free trial. Cancel anytime.',
    color: '#7ed957',
    bg: 'rgba(126,217,87,0.08)',
    border: 'rgba(126,217,87,0.35)',
    cta: 'Start Free Trial',
    href: '/signup?redirect=/console?view=upgrade',
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited executions',
      'AI-powered chat (BYOK)',
      'Full marketplace access',
      'Vault sync across devices',
      'Priority support',
    ],
  },
  {
    name: 'Team',
    price: '$49',
    period: '/month',
    desc: '7-day free trial. Cancel anytime.',
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.06)',
    border: 'rgba(0,212,255,0.3)',
    cta: 'Start Free Trial',
    href: '/signup?redirect=/console?view=upgrade',
    features: [
      'Everything in Pro',
      '5 team seats',
      'Shared workflows & team vault',
      'Full API access',
      'Dedicated support + SLA',
    ],
  },
]

const FAQS = [
  {
    q: 'Do I need to know how to code?',
    a: 'No. Type what you want in plain English. The AI figures out the rest. Or use the drag-and-drop visual builder.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your API keys are encrypted with AES-256-GCM before they ever leave your browser. We literally cannot read them. Our security system has a pending U.S. patent.',
  },
  {
    q: 'What tools does it connect to?',
    a: '48 services including Stripe, Gmail, Slack, HubSpot, Shopify, Google Sheets, Discord, Twilio, Notion, Airtable, and many more.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts, no hidden fees. Cancel from your account page in one click. Your data stays yours.',
  },
  {
    q: 'What happens after I sign up?',
    a: 'You get instant access to the Console. Connect your first tool in under 60 seconds. Start automating immediately.',
  },
  {
    q: 'What is BYOK?',
    a: 'Bring Your Own Key. You connect your own AI API key (like Anthropic or OpenAI) through the encrypted Vault. Your key powers the AI chat \u2014 unlimited, on your own account.',
  },
]

/* ─── Shared CTA Button ───────────────────────────────────── */

function CtaButton({ children, href, size = 'lg', variant = 'primary' }: {
  children: React.ReactNode
  href: string
  size?: 'lg' | 'md'
  variant?: 'primary' | 'secondary'
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center font-semibold rounded-xl transition-all no-underline"
      style={{
        padding: size === 'lg' ? '16px 40px' : '12px 28px',
        fontSize: size === 'lg' ? '16px' : '14px',
        background: variant === 'primary'
          ? 'linear-gradient(135deg, #7ed957, #5cb83a)'
          : 'rgba(255,255,255,0.06)',
        color: variant === 'primary' ? '#0a0a0f' : '#e8e8ef',
        border: variant === 'primary'
          ? 'none'
          : '1px solid rgba(255,255,255,0.1)',
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  )
}

/* ─── FAQ Item ─────────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '20px 0',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '16px',
          fontWeight: 600,
          fontFamily: 'var(--font-display)',
          padding: 0,
        }}
      >
        <span>{q}</span>
        <span
          style={{
            color: 'var(--accent)',
            fontSize: '20px',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(45deg)' : 'none',
            flexShrink: 0,
            marginLeft: '16px',
          }}
        >
          +
        </span>
      </button>
      {open && (
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
            lineHeight: 1.7,
            marginTop: '12px',
            marginBottom: 0,
          }}
        >
          {a}
        </p>
      )}
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────── */

export default function GoClient() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ── Sticky mini-header ─────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/brand/icon-green.png"
            alt="0n"
            style={{ width: 28, height: 28, objectFit: 'contain' }}
          />
          <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            0n Console
          </span>
        </div>
        <Link
          href="/signup?redirect=/console"
          className="no-underline"
          style={{
            padding: '8px 24px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
            color: '#0a0a0f',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
            border: 'none',
          }}
        >
          Start Free
        </Link>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px 60px',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '100px',
            background: 'rgba(126,217,87,0.1)',
            border: '1px solid rgba(126,217,87,0.2)',
            color: '#7ed957',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '24px',
            letterSpacing: '0.03em',
          }}
        >
          819 tools &middot; 48 services &middot; One dashboard
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '24px',
          }}
        >
          Stop switching between{' '}
          <span style={{ color: '#7ed957' }}>15 apps.</span>
          <br />
          Control everything from{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #7ed957, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            one screen.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 40px',
          }}
        >
          0n Console connects your CRM, email, payments, social media, and 44 other
          business tools into one AI-powered dashboard. Type what you want done. It does it.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <CtaButton href="/signup?redirect=/console">Start Free &mdash; No Credit Card</CtaButton>
          <CtaButton href="#how-it-works" variant="secondary" size="md">See how it works</CtaButton>
        </div>

        {/* Trust bar */}
        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { v: '819', l: 'Tools' },
            { v: '48', l: 'Services' },
            { v: 'AES-256', l: 'Encryption' },
            { v: 'Patent', l: 'Pending' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{s.v}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────────────── */}
      <section
        style={{
          padding: '60px 24px',
          maxWidth: '700px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '12px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Sound familiar?
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '15px' }}>
          Every business owner deals with this. You&apos;re not alone.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {PAIN_POINTS.map((p, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '18px 24px',
                borderRadius: '14px',
                background: 'rgba(255,80,80,0.04)',
                border: '1px solid rgba(255,80,80,0.12)',
              }}
            >
              <span style={{ color: '#ff5050', fontSize: '18px', flexShrink: 0 }}>&times;</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.5 }}>{p}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTION ───────────────────────────────────────── */}
      <section
        style={{
          padding: '60px 24px',
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            marginBottom: '16px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Now imagine{' '}
          <span style={{ color: '#7ed957' }}>this</span>
        </h2>
        <p
          style={{
            fontSize: '18px',
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            margin: '0 auto 24px',
          }}
        >
          You open one dashboard. You type: <em style={{ color: '#7ed957' }}>&ldquo;Send a follow-up email to all leads who opened but didn&apos;t reply this week.&rdquo;</em>
        </p>
        <p
          style={{
            fontSize: '18px',
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            margin: '0 auto 24px',
          }}
        >
          It checks your CRM. Pulls the leads. Writes the email. Sends it through your email account. Logs everything.
        </p>
        <p
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          That&apos;s 0n Console.
        </p>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: '80px 24px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '48px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Three steps. Five minutes.
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}
        >
          {STEPS.map(s => (
            <div
              key={s.num}
              style={{
                padding: '32px 28px',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontSize: '40px',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: s.color,
                  opacity: 0.3,
                  lineHeight: 1,
                  marginBottom: '16px',
                }}
              >
                {s.num}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section
        style={{
          padding: '60px 24px',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '12px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          What&apos;s inside
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '48px', fontSize: '15px' }}>
          Everything you need to run your business from one screen.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {FEATURES.map(f => (
            <div
              key={f.title}
              style={{
                padding: '28px 24px',
                borderRadius: '14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONNECTED SERVICES ─────────────────────────────── */}
      <section
        style={{
          padding: '60px 24px',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 700,
            marginBottom: '24px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          48 services. One connection each.
        </h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          {SERVICES_PREVIEW.map(s => (
            <span
              key={s}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {s}
            </span>
          ))}
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(126,217,87,0.08)',
              border: '1px solid rgba(126,217,87,0.2)',
              color: '#7ed957',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            + 24 more
          </span>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          padding: '80px 24px',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '12px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Simple pricing. No surprises.
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '48px', fontSize: '15px' }}>
          Start free. Upgrade when you&apos;re ready. Cancel anytime.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {PLANS.map(plan => (
            <div
              key={plan.name}
              style={{
                padding: '32px 28px',
                borderRadius: '16px',
                background: plan.bg,
                border: plan.popular
                  ? `2px solid ${plan.border}`
                  : `1px solid ${plan.border}`,
                position: 'relative',
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 16px',
                    borderRadius: '100px',
                    background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
                    color: '#0a0a0f',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Most Popular
                </div>
              )}

              <h3 style={{ fontSize: '20px', fontWeight: 700, color: plan.color, marginBottom: '4px' }}>
                {plan.name}
              </h3>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontSize: '40px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                {plan.desc}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'start', gap: '10px', fontSize: '14px' }}>
                    <span style={{ color: plan.color, fontSize: '14px', lineHeight: '20px', flexShrink: 0 }}>&check;</span>
                    <span style={{ color: 'var(--text-secondary)', lineHeight: '20px' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className="no-underline"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '15px',
                  textDecoration: 'none',
                  background: plan.popular
                    ? `linear-gradient(135deg, ${plan.color}, ${plan.color === '#7ed957' ? '#5cb83a' : '#0099cc'})`
                    : 'rgba(255,255,255,0.06)',
                  color: plan.popular ? '#0a0a0f' : 'var(--text-primary)',
                  border: plan.popular ? 'none' : '1px solid var(--border)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section
        style={{
          padding: '60px 24px',
          maxWidth: '700px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '40px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Questions? Answers.
        </h2>
        <div>
          {FAQS.map(f => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '16px',
            lineHeight: 1.15,
          }}
        >
          Ready?{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #7ed957, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Let&apos;s go.
          </span>
        </h2>
        <p
          style={{
            fontSize: '17px',
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            lineHeight: 1.6,
          }}
        >
          Free account. No credit card. Start automating in 5 minutes.
        </p>
        <CtaButton href="/signup?redirect=/console">
          Create Your Free Account &rarr;
        </CtaButton>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          &copy; {new Date().getFullYear()} RocketOpp LLC &middot; Patent Pending &middot;{' '}
          <Link href="/legal" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Legal</Link>
        </p>
      </footer>
    </div>
  )
}
