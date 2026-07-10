import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nFAM — VIP Access to 0nMCP | Full Access, Zero Cost',
  description:
    'Join the 0nFAM — the inner circle of 0nMCP. Full console access, CRM sub-account, all add-ons, AI agent, lifetime membership. By invitation only.',
  openGraph: {
    title: '0nFAM — VIP Access',
    description: 'The inner circle of 0nMCP.',
    url: 'https://0nmcp.com/vip',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://0nmcp.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '0nFAM VIP',
          item: 'https://0nmcp.com/vip',
        },
      ],
    },
    {
      '@type': 'Product',
      name: '0nFAM VIP Membership',
      description:
        'Full access to 0nMCP — every tool, every service, every add-on. Lifetime membership for the inner circle.',
      brand: { '@type': 'Brand', name: '0nMCP' },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/LimitedAvailability',
        description: 'By invitation only. Free lifetime access.',
      },
    },
  ],
}

const features = [
  {
    title: 'Full Console Access',
    desc: 'Every tool, every feature, unlimited. No paywalls, no usage caps, no restrictions.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="8" width="32" height="24" rx="3" stroke="#7ed957" strokeWidth="2" fill="none" />
        <line x1="4" y1="14" x2="36" y2="14" stroke="#7ed957" strokeWidth="2" />
        <circle cx="8" cy="11" r="1.5" fill="#FF6B35" />
        <circle cx="13" cy="11" r="1.5" fill="#d977D6" />
        <circle cx="18" cy="11" r="1.5" fill="#7ed957" />
        <rect x="8" y="18" width="10" height="2" rx="1" fill="#7ed957" opacity="0.6" />
        <rect x="8" y="23" width="16" height="2" rx="1" fill="#7ed957" opacity="0.4" />
        <rect x="8" y="28" width="7" height="1" rx="0.5" fill="#14b6a6" opacity="0.5" />
      </svg>
    ),
  },
  {
    title: 'CRM Sub-Account',
    desc: 'Your own CRM with AI agent, knowledge base, custom branding, and full pipeline.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="14" r="6" stroke="#7ed957" strokeWidth="2" fill="none" />
        <path d="M8 34c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#7ed957" strokeWidth="2" fill="none" />
        <circle cx="30" cy="28" r="6" fill="#0d1117" stroke="#14b6a6" strokeWidth="2" />
        <path d="M28 28h4M30 26v4" stroke="#14b6a6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'All Add0ns Included',
    desc: '0nCode, Mail Engine, OnPress, Intel, Security Suite — every add-on, included free.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="6" width="12" height="12" rx="3" stroke="#7ed957" strokeWidth="2" fill="none" />
        <rect x="22" y="6" width="12" height="12" rx="3" stroke="#14b6a6" strokeWidth="2" fill="none" />
        <rect x="6" y="22" width="12" height="12" rx="3" stroke="#a78bfa" strokeWidth="2" fill="none" />
        <rect x="22" y="22" width="12" height="12" rx="3" stroke="#FF6B35" strokeWidth="2" fill="none" />
        <path d="M10 12l2 2 4-4" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 12l2 2 4-4" stroke="#14b6a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 28l2 2 4-4" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 28l2 2 4-4" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Priority AI',
    desc: 'Jaxx responds first, faster, with full tool execution privileges and extended context.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M20 4l4 12h12l-10 7 4 13-10-8-10 8 4-13L4 16h12z" stroke="#FF6B35" strokeWidth="2" fill="none" />
        <circle cx="20" cy="20" r="4" fill="#FF6B35" opacity="0.3" />
      </svg>
    ),
  },
  {
    title: '0nFAM Community',
    desc: 'Private channel, direct access to the team, early feature previews, and governance input.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="14" cy="16" r="5" stroke="#7ed957" strokeWidth="2" fill="none" />
        <circle cx="26" cy="16" r="5" stroke="#14b6a6" strokeWidth="2" fill="none" />
        <path d="M6 34c0-5 3.5-9 8-9s8 4 8 9" stroke="#7ed957" strokeWidth="2" fill="none" />
        <path d="M18 34c0-5 3.5-9 8-9s8 4 8 9" stroke="#14b6a6" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    title: 'Lifetime Access',
    desc: 'No monthly fees. Ever. Once you are in, you are in. No expiration, no renewal.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M20 6c-7.732 0-14 6.268-14 14s6.268 14 14 14 14-6.268 14-14S27.732 6 20 6z" stroke="#7ed957" strokeWidth="2" fill="none" />
        <path d="M20 6c-7.732 0-14 6.268-14 14s6.268 14 14 14" stroke="#14b6a6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M16 20h8M20 16v8" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

const tiers = [
  {
    name: 'FAM',
    tagline: 'Friends & Family',
    desc: 'Full access, free forever. For the people closest to 0nMCP.',
    cta: 'Request Invite',
    href: '/signup',
    accent: '#7ed957',
    glowColor: 'rgba(126, 217, 87, 0.12)',
    borderColor: 'rgba(126, 217, 87, 0.3)',
  },
  {
    name: 'Partner',
    tagline: 'Strategic Partners',
    desc: 'Full access plus revenue share. For agencies, platforms, and builders.',
    cta: 'Apply as Partner',
    href: '/partners',
    accent: '#14b6a6',
    glowColor: 'rgba(20, 182, 166, 0.12)',
    borderColor: 'rgba(20, 182, 166, 0.3)',
    featured: true,
  },
  {
    name: 'Founder',
    tagline: 'Original Builders',
    desc: 'Full access plus governance. Reserved for those who built the foundation.',
    cta: 'Invite Only',
    href: '#',
    accent: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.12)',
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
]

const steps = [
  {
    num: '01',
    title: 'Get Invited',
    desc: 'Receive an invite from an existing 0nFAM member, or apply directly and we will review your request.',
  },
  {
    num: '02',
    title: 'Sign Up',
    desc: 'Create your account. Everything auto-provisions in seconds — console, CRM, AI agent, all add-ons.',
  },
  {
    num: '03',
    title: 'You are In',
    desc: 'Full console, CRM sub-account, AI agent, every add-on, forever. No limits. No invoices.',
  },
]

const faqs = [
  {
    q: 'How do I get invited?',
    a: 'Current 0nFAM members can invite you directly. You can also apply through this page and our team will review your request personally.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. 0nFAM members pay nothing. Ever. No hidden fees, no trial periods, no credit card required.',
  },
  {
    q: 'What is the catch?',
    a: 'There is not one. We want our inner circle to have everything. The 0nFAM exists because the best growth comes from people who genuinely use and believe in what we build.',
  },
  {
    q: 'Can I invite others?',
    a: 'Yes. Every 0nFAM member receives invite codes to share with people they trust. The circle grows through trust.',
  },
]

const stats = [
  { value: '1,640+', label: 'tools' },
  { value: '96', label: 'services' },
  { value: '16', label: 'AI agent workflows' },
  { value: '18', label: 'connected services' },
  { value: 'Unlimited', label: 'executions' },
]

export default function VIPPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0d1117',
          color: '#e6edf3',
          fontFamily: "'Nunito Sans', 'Inter', system-ui, sans-serif",
        }}
      >
        {/* ─── HERO ─── */}
        <section
          style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '120px 24px 80px',
            overflow: 'hidden',
          }}
        >
          {/* Radial glow */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '900px',
              height: '900px',
              background:
                'radial-gradient(circle, rgba(126,217,87,0.08) 0%, rgba(20,182,166,0.04) 40%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          {/* Logo mark */}
          <div style={{ position: 'relative', marginBottom: '48px' }}>
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              style={{ filter: 'drop-shadow(0 0 40px rgba(126,217,87,0.25))' }}
            >
              <circle
                cx="60"
                cy="60"
                r="56"
                stroke="url(#heroGrad)"
                strokeWidth="2.5"
                fill="none"
              />
              <circle cx="60" cy="60" r="48" fill="rgba(126,217,87,0.04)" />
              <text
                x="60"
                y="68"
                textAnchor="middle"
                fontFamily="'Inter', system-ui, sans-serif"
                fontWeight="800"
                fontSize="36"
                fill="#7ed957"
              >
                0n
              </text>
              <defs>
                <linearGradient id="heroGrad" x1="0" y1="0" x2="120" y2="120">
                  <stop offset="0%" stopColor="#7ed957" />
                  <stop offset="50%" stopColor="#14b6a6" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1
            style={{
              position: 'relative',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(56px, 10vw, 96px)',
              fontWeight: 900,
              letterSpacing: '-2px',
              lineHeight: 1,
              margin: '0 0 24px',
              background: 'linear-gradient(135deg, #7ed957 0%, #14b6a6 50%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            0nFAM
          </h1>

          <p
            style={{
              position: 'relative',
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              lineHeight: 1.6,
              color: '#8db61e',
              maxWidth: '640px',
              margin: '0 0 48px',
              fontWeight: 400,
            }}
          >
            The inner circle of 0nMCP. Full access. Zero cost. By invitation only.
          </p>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Link
              href="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 48px',
                fontSize: '18px',
                fontWeight: 700,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: '#0d1117',
                background: 'linear-gradient(135deg, #2d8a1e 0%, #7ed957 100%)',
                borderRadius: '12px',
                textDecoration: 'none',
                letterSpacing: '-0.3px',
                boxShadow:
                  '0 0 30px rgba(126,217,87,0.2), 0 4px 20px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Join the 0nFAM
            </Link>
            <Link
              href="/login"
              style={{
                fontSize: '15px',
                color: '#8db61e',
                textDecoration: 'none',
                opacity: 0.7,
              }}
            >
              Already a member? Login
            </Link>
          </div>

          {/* Decorative line */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '200px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(126,217,87,0.3), transparent)',
            }}
          />
        </section>

        {/* ─── WHAT YOU GET ─── */}
        <section
          style={{
            padding: '100px 24px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 800,
              textAlign: 'center',
              marginBottom: '16px',
              color: '#e6edf3',
              letterSpacing: '-1px',
            }}
          >
            What You Get
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: '#8db61e',
              fontSize: '18px',
              marginBottom: '64px',
              opacity: 0.8,
            }}
          >
            Everything. No exceptions.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  backgroundColor: '#1f2937',
                  border: '1px solid rgba(126,217,87,0.1)',
                  borderRadius: '16px',
                  padding: '36px 32px',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
              >
                <div style={{ marginBottom: '20px' }}>{f.icon}</div>
                <h3
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#e6edf3',
                    marginBottom: '10px',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: '#9ca3af',
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── VIP TIERS ─── */}
        <section
          style={{
            padding: '100px 24px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 800,
              textAlign: 'center',
              marginBottom: '16px',
              color: '#e6edf3',
              letterSpacing: '-1px',
            }}
          >
            VIP Tiers
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: '#8db61e',
              fontSize: '18px',
              marginBottom: '64px',
              opacity: 0.8,
            }}
          >
            Three paths into the inner circle.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              alignItems: 'stretch',
            }}
          >
            {tiers.map((t) => (
              <div
                key={t.name}
                style={{
                  position: 'relative',
                  backgroundColor: '#1f2937',
                  border: `1.5px solid ${t.borderColor}`,
                  borderRadius: '20px',
                  padding: '48px 36px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  boxShadow: t.featured
                    ? `0 0 60px ${t.glowColor}, 0 0 120px ${t.glowColor}`
                    : `0 0 30px ${t.glowColor}`,
                }}
              >
                {t.featured && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      padding: '6px 20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      color: '#0d1117',
                      background: `linear-gradient(135deg, ${t.accent}, #00d4ff)`,
                      borderRadius: '20px',
                    }}
                  >
                    Recommended
                  </div>
                )}

                <h3
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '36px',
                    fontWeight: 900,
                    color: t.accent,
                    marginBottom: '4px',
                    letterSpacing: '-1px',
                  }}
                >
                  {t.name}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: t.accent,
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '20px',
                  }}
                >
                  {t.tagline}
                </p>

                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: 900,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    color: '#e6edf3',
                    marginBottom: '4px',
                  }}
                >
                  $0
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    marginBottom: '24px',
                  }}
                >
                  forever
                </p>

                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: '#9ca3af',
                    marginBottom: '32px',
                    flex: 1,
                  }}
                >
                  {t.desc}
                </p>

                <Link
                  href={t.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: '14px 32px',
                    fontSize: '15px',
                    fontWeight: 700,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    color: t.featured ? '#0d1117' : t.accent,
                    background: t.featured
                      ? `linear-gradient(135deg, ${t.accent}, #00d4ff)`
                      : 'transparent',
                    border: t.featured ? 'none' : `1.5px solid ${t.borderColor}`,
                    borderRadius: '10px',
                    textDecoration: 'none',
                    letterSpacing: '-0.2px',
                    transition: 'transform 0.2s',
                  }}
                >
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section
          style={{
            padding: '100px 24px',
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 800,
              textAlign: 'center',
              marginBottom: '64px',
              color: '#e6edf3',
              letterSpacing: '-1px',
            }}
          >
            How It Works
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '48px',
              position: 'relative',
            }}
          >
            {steps.map((s, i) => (
              <div
                key={s.num}
                style={{
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '64px',
                    fontWeight: 800,
                    color: 'rgba(126,217,87,0.08)',
                    lineHeight: 1,
                    marginBottom: '8px',
                  }}
                >
                  {s.num}
                </div>
                <h3
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#7ed957',
                    marginBottom: '12px',
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: '#9ca3af',
                    maxWidth: '280px',
                    margin: '0 auto',
                  }}
                >
                  {s.desc}
                </p>

                {/* Connector line between steps */}
                {i < steps.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '32px',
                      right: '-24px',
                      width: '48px',
                      height: '2px',
                      background:
                        'linear-gradient(90deg, rgba(126,217,87,0.3), rgba(20,182,166,0.3))',
                      display: 'none', // hidden on mobile, shown via media query would need client
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── THE NUMBERS ─── */}
        <section
          style={{
            padding: '60px 24px',
            borderTop: '1px solid rgba(126,217,87,0.08)',
            borderBottom: '1px solid rgba(126,217,87,0.08)',
            background:
              'linear-gradient(180deg, rgba(126,217,87,0.02) 0%, transparent 100%)',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '48px',
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  textAlign: 'center',
                  minWidth: '140px',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '36px',
                    fontWeight: 900,
                    color: '#7ed957',
                    letterSpacing: '-1px',
                    lineHeight: 1.2,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#8db61e',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 600,
                    marginTop: '4px',
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section
          style={{
            padding: '100px 24px',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 800,
              textAlign: 'center',
              marginBottom: '64px',
              color: '#e6edf3',
              letterSpacing: '-1px',
            }}
          >
            Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {faqs.map((f) => (
              <div
                key={f.q}
                style={{
                  backgroundColor: '#1f2937',
                  border: '1px solid rgba(126,217,87,0.08)',
                  borderRadius: '14px',
                  padding: '32px',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#e6edf3',
                    marginBottom: '12px',
                  }}
                >
                  {f.q}
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.7,
                    color: '#9ca3af',
                    margin: 0,
                  }}
                >
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── BOTTOM CTA ─── */}
        <section
          style={{
            position: 'relative',
            padding: '120px 24px',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '800px',
              height: '400px',
              background:
                'radial-gradient(ellipse, rgba(126,217,87,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <p
            style={{
              position: 'relative',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 800,
              color: '#e6edf3',
              marginBottom: '40px',
              letterSpacing: '-1px',
            }}
          >
            The inner circle is open.
          </p>

          <Link
            href="/signup"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px 56px',
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: '#0d1117',
              background: 'linear-gradient(135deg, #2d8a1e 0%, #7ed957 100%)',
              borderRadius: '12px',
              textDecoration: 'none',
              letterSpacing: '-0.3px',
              boxShadow:
                '0 0 40px rgba(126,217,87,0.25), 0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            Join the 0nFAM
          </Link>

          <p
            style={{
              position: 'relative',
              fontSize: '14px',
              color: '#9ca3af',
              marginTop: '24px',
            }}
          >
            Questions?{' '}
            <a
              href="mailto:mike@rocketopp.com"
              style={{ color: '#8db61e', textDecoration: 'none' }}
            >
              mike@rocketopp.com
            </a>
          </p>
        </section>
      </div>
    </>
  )
}
