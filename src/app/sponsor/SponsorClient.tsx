'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const tiers = [
  {
    key: 'supporter',
    name: 'Supporter',
    amount: 5,
    desc: 'Help keep the lights on.',
    perks: [
      'Name in README sponsors',
      'Sponsor badge on GitHub',
      'Access to sponsor-only discussions',
    ],
    featured: false,
  },
  {
    key: 'builder',
    name: 'Builder',
    amount: 25,
    desc: 'Directly fund new service integrations.',
    perks: [
      'Everything in Supporter',
      'Logo on 0nmcp.com',
      'Vote on next service to add',
      'Early access to beta features',
      'Direct Discord channel',
    ],
    featured: true,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    amount: 100,
    desc: 'Priority support and custom integrations.',
    perks: [
      'Everything in Builder',
      'Priority issue response',
      'Custom service integration request',
      '1:1 monthly call with maintainer',
      'Featured logo placement',
    ],
    featured: false,
  },
]

const missingServices = [
  { name: 'Google Workspace', desc: 'Gmail, Sheets, Drive, Docs. Everyone uses it.', priority: 'Critical' },
  { name: 'Jira / Atlassian', desc: 'Enterprise project management. Required for B2B.', priority: 'Critical' },
  { name: 'Zendesk', desc: 'Customer support is the #1 automation use case.', priority: 'Critical' },
  { name: 'Mailchimp', desc: 'Email marketing powers the entire CRM-to-revenue pipeline.', priority: 'Critical' },
  { name: 'Zoom', desc: 'Meeting scheduling, recording, and management.', priority: 'High' },
  { name: 'AWS (S3, SES, Lambda)', desc: 'File storage, email delivery, serverless functions.', priority: 'High' },
  { name: 'Microsoft 365', desc: 'Outlook, Teams, OneDrive. The enterprise world runs on Microsoft.', priority: 'High' },
  { name: 'MongoDB', desc: 'NoSQL database alongside Supabase for data-heavy workflows.', priority: 'High' },
  { name: 'Vercel', desc: 'Deployment platform. Our own stack, plus a massive developer community.', priority: 'Medium' },
  { name: 'Cloudflare', desc: 'DNS, CDN, Workers. The infrastructure layer every project needs.', priority: 'Medium' },
  { name: 'Figma', desc: 'Design handoff and asset management. Dev workflow essential.', priority: 'Medium' },
  { name: 'Firebase', desc: 'Auth, Firestore, Cloud Messaging. Google\'s full app platform.', priority: 'Medium' },
]

export default function SponsorClient() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'success' | 'canceled'; msg: string } | null>(null)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setBanner({ type: 'success', msg: 'Thank you for sponsoring 0nMCP! Your support means everything.' })
    } else if (searchParams.get('canceled') === 'true') {
      setBanner({ type: 'canceled', msg: 'Checkout was canceled. No charge was made.' })
    }
  }, [searchParams])

  async function handleCheckout(tier: string, mode: 'subscription' | 'payment' = 'subscription') {
    setLoading(tier)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, mode }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start checkout')
        setLoading(null)
      }
    } catch {
      alert('Network error — please try again')
      setLoading(null)
    }
  }

  return (
    <>
      {/* Success / Cancel Banner */}
      {banner && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl text-sm font-medium max-w-[500px] text-center"
          style={{
            backgroundColor: banner.type === 'success' ? 'rgba(0,255,136,0.15)' : 'rgba(255,107,53,0.15)',
            border: `1px solid ${banner.type === 'success' ? 'rgba(0,255,136,0.3)' : 'rgba(255,107,53,0.3)'}`,
            color: banner.type === 'success' ? 'var(--accent)' : '#ff6b35',
          }}
        >
          {banner.msg}
          <button
            onClick={() => setBanner(null)}
            className="ml-3 opacity-60 hover:opacity-100"
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* HERO */}
      <section className="pt-40 pb-16 px-8 text-center relative">
        <div
          className="absolute w-[500px] h-[500px] top-[5%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          }}
        />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 relative z-[2]">
          Fund the Future of
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            }}
          >
            AI Orchestration
          </span>
        </h1>
        <p
          className="text-lg max-w-[640px] mx-auto leading-relaxed relative z-[2]"
          style={{ color: 'var(--text-secondary)' }}
        >
          0nMCP is free and open source. 819 tools across 48 services and 21 categories.
          Your sponsorship keeps it that way while funding new integrations,
          better documentation, and a growing community. Every dollar goes
          directly to development.
        </p>
      </section>

      {/* SPONSOR TIERS */}
      <section className="py-20 px-8">
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Monthly Sponsorship
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Choose Your Level
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            All sponsors get recognized in the README and on this page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="glow-box text-center relative"
                style={
                  tier.featured
                    ? { borderColor: 'var(--accent)' }
                    : undefined
                }
              >
                {tier.featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-mono text-[0.65rem] font-bold tracking-wide"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--bg-primary)',
                    }}
                  >
                    MOST IMPACT
                  </span>
                )}
                <span
                  className="font-mono text-xs uppercase tracking-wide block mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {tier.name}
                </span>
                <div className="text-5xl font-bold mb-2">
                  <span
                    className="text-xl align-super"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    $
                  </span>
                  {tier.amount}
                  <span
                    className="text-base font-normal"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    /mo
                  </span>
                </div>
                <p
                  className="text-sm mb-6"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {tier.desc}
                </p>
                <ul className="flex flex-col gap-2 list-none text-left mb-8">
                  {tier.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span
                        className="font-bold flex-shrink-0"
                        style={{ color: 'var(--accent)' }}
                      >
                        +
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(tier.key)}
                  disabled={loading === tier.key}
                  className={`${tier.featured ? 'btn-accent' : 'btn-ghost'} w-full text-center justify-center`}
                  style={{ cursor: loading === tier.key ? 'wait' : 'pointer' }}
                >
                  {loading === tier.key ? 'Redirecting...' : `Sponsor $${tier.amount}/mo`}
                </button>
              </div>
            ))}
          </div>

          {/* One-time donations */}
          <div
            className="mt-8 text-center p-10 rounded-xl"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <h3 className="text-xl font-bold mb-2">
              Prefer a one-time donation?
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Every contribution helps, no matter the size.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {[10, 25, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleCheckout(String(amount), 'payment')}
                  disabled={loading === String(amount)}
                  className="btn-ghost"
                  style={{ cursor: loading === String(amount) ? 'wait' : 'pointer' }}
                >
                  {loading === String(amount) ? '...' : `$${amount}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY SPONSOR */}
      <section
        className="py-20 px-8"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Why Sponsor
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
            Where Your Money Goes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'New Service Integrations',
                desc: 'Every month we add new services to the catalog. Sponsors vote on what gets built next. Currently: 48 services, 819 tools, 21 categories.',
              },
              {
                title: 'Documentation & Guides',
                desc: 'Comprehensive docs, tutorials, video walkthroughs, and example workflows so anyone can get started with MCP orchestration.',
              },
              {
                title: 'Infrastructure & Hosting',
                desc: 'NPM publishing, CI/CD, the 0n Marketplace, this website, and the MCP Registry listing all cost money to maintain.',
              },
              {
                title: 'Community Building',
                desc: 'Discord server, GitHub Discussions, community events, and outreach to grow the MCP ecosystem and bring more developers in.',
              },
            ].map((card) => (
              <div key={card.title} className="glow-box">
                <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSING SERVICES */}
      <section className="py-20 px-8">
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Gap Analysis
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            What We Need to Win
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            These are the services we need to add immediately to become the
            undisputed standard. Your sponsorship directly funds their
            development.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missingServices.map((svc) => (
              <div
                key={svc.name}
                className="flex gap-3 items-start p-5 rounded-xl"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <span
                  className="font-mono text-[0.55rem] uppercase tracking-wide px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                  style={
                    svc.priority === 'Critical'
                      ? {
                          color: '#ff6b35',
                          backgroundColor: 'rgba(255,107,53,0.15)',
                          border: '1px solid rgba(255,107,53,0.3)',
                        }
                      : svc.priority === 'High'
                        ? {
                            color: 'var(--accent)',
                            backgroundColor: 'rgba(0,255,136,0.08)',
                            border: '1px solid rgba(0,255,136,0.2)',
                          }
                        : {
                            color: 'var(--accent-secondary)',
                            backgroundColor: 'rgba(0,212,255,0.08)',
                            border: '1px solid rgba(0,212,255,0.2)',
                          }
                  }
                >
                  {svc.priority}
                </span>
                <div>
                  <h4 className="text-sm font-bold mb-1">{svc.name}</h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {svc.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-8">
        <div className="max-w-[1000px] mx-auto">
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,212,255,0.05))',
              border: '1px solid rgba(0,255,136,0.1)',
            }}
          >
            <h3 className="text-xl font-bold mb-3">
              Every star, every sponsor, every share accelerates the timeline.
            </h3>
            <p
              className="text-base mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              We are at Phase 0. Help us get to Phase 1. Then nothing stops us.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => handleCheckout('builder')}
                disabled={loading === 'builder-cta'}
                className="btn-accent"
              >
                Become a Sponsor
              </button>
              <a
                href="https://github.com/0nork/0nMCP"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost no-underline"
              >
                Star on GitHub
              </a>
              <a
                href="https://github.com/0nork/0nMCP/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost no-underline"
              >
                Join Discussions
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
