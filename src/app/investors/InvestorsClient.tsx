'use client'

import { useState } from 'react'

const NDA_URL = 'https://api.rocketclients.com/documents/doc-form/69b85d24c27b02728989d309?locale=en-US'

const HIGHLIGHTS = [
  { label: 'Tools', value: '870+', desc: 'API integrations across 54 services' },
  { label: 'Patents', value: '5', desc: 'Provisional patents filed (MCPFed, Vault, Plex, Core, Knowledge Layers)' },
  { label: 'Categories', value: '23', desc: 'Service categories from CRM to AI' },
  { label: 'Open Source', value: 'MIT', desc: 'Core orchestrator freely available' },
]

export default function InvestorsClient() {
  const [ndaOpen, setNdaOpen] = useState(false)

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 120px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
            Investment Opportunities
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
            The universal AI
            <br />
            <span style={{ color: 'var(--accent)' }}>orchestration layer</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            0nMCP connects every API to every AI platform with a single command.
            We&apos;re building the infrastructure that makes AI agents actually useful.
          </p>
          <button
            onClick={() => setNdaOpen(true)}
            style={{
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              padding: '16px 40px',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            Sign NDA to View Pitch Deck
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 20,
          marginBottom: 80,
        }}>
          {HIGHLIGHTS.map(h => (
            <div key={h.label} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: 28,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                {h.value}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{h.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{h.desc}</div>
            </div>
          ))}
        </div>

        {/* Why 0nMCP */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 28, marginBottom: 32, textAlign: 'center' }}>Why 0nMCP</h2>
          <div style={{ display: 'grid', gap: 24 }}>
            {[
              {
                title: 'First-mover in MCP orchestration',
                body: 'The Model Context Protocol is becoming the standard for AI-to-tool communication. 0nMCP is the first universal orchestrator — connecting 54 services through a single interface.',
              },
              {
                title: 'Patent-pending security layer',
                body: '0nVault Container System (US #63/990,046) — AES-256, Argon2id, Ed25519 signatures, multi-party escrow. The first encryption standard purpose-built for AI agent credentials.',
              },
              {
                title: 'Revenue-ready SaaS platform',
                body: 'The 0n Marketplace enables pay-per-execution workflow sales. Stripe-metered billing, AI-powered workflow generation, and a growing catalog of automation templates.',
              },
              {
                title: 'Open source distribution',
                body: 'MIT-licensed core drives adoption. Premium features, enterprise support, and hosted services generate revenue. Classic open-core model proven by MongoDB, Redis, Elastic, and others.',
              },
            ].map(item => (
              <div key={item.title} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 32,
              }}>
                <h3 style={{ fontSize: 18, marginBottom: 10, color: 'var(--accent)' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(126,217,87,0.08), rgba(0,212,255,0.05))',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 48,
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Ready to learn more?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Sign our NDA to receive the full pitch deck, financial projections, and technical architecture deep-dive.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setNdaOpen(true)}
              style={{
                background: 'var(--accent)',
                color: '#000',
                border: 'none',
                padding: '14px 32px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
              }}
            >
              Sign NDA
            </button>
            <a
              href="mailto:mike@rocketopp.com?subject=0nMCP%20Investment%20Inquiry"
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                padding: '14px 32px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Contact Mike
            </a>
          </div>
        </div>
      </div>

      {/* NDA Modal */}
      {ndaOpen && (
        <div
          onClick={() => setNdaOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            animation: 'modalFadeIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              animation: 'modalSlideIn 0.25s ease',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>Non-Disclosure Agreement</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                  0nMCP — RocketOpp LLC
                </p>
              </div>
              <button
                onClick={() => setNdaOpen(false)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                &times;
              </button>
            </div>

            {/* Iframe */}
            <div style={{ flex: 1, minHeight: 500 }}>
              <iframe
                src={NDA_URL}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 500,
                  border: 'none',
                  background: '#fff',
                }}
                title="0nMCP NDA"
                allow="clipboard-write"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
