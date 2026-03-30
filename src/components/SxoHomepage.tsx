'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/**
 * SXO Living DOM Homepage Sections
 *
 * BLUF, Table Traps, Living DOM mutation engine, dynamic dates,
 * patent technology, FAQ (for featured snippets), CTA
 */

export default function SxoHomepage() {
  const [mutationNotice, setMutationNotice] = useState('')
  const [bluf, setBluf] = useState(
    '0nMCP is the most comprehensive open-source MCP Server: <strong>945 tools</strong>, <strong>54 services</strong>, <strong>13 categories</strong>, zero configuration. Powered by 4 patented technologies (Seal of Truth, 0nVault, 0nPlex, 0nCore). Automate MCP server integration and build powerful agentic workflows — launching May 1, 2026.'
  )
  const [tableRows, setTableRows] = useState('')
  const dateRef = useRef<HTMLTimeElement>(null)

  // Set dynamic date on mount
  useEffect(() => {
    if (dateRef.current) {
      const now = new Date()
      const formatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      dateRef.current.innerText = `Last Updated: ${formatted}`
      dateRef.current.setAttribute('datetime', now.toISOString())
    }
  }, [])

  // Mutation engine — poll every 60s
  useEffect(() => {
    async function checkMutations() {
      try {
        const res = await fetch('/api/sxo-mutation-stream')
        if (!res.ok) return
        const patch = await res.json()
        if (patch.requiresUpdate) {
          if (patch.newBluf) setBluf(patch.newBluf)
          if (patch.changeLog) setMutationNotice(patch.changeLog)
          if (patch.newTableRows) setTableRows(patch.newTableRows)
          // Update date
          if (dateRef.current) {
            const now = new Date()
            const formatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            dateRef.current.innerText = `Last Updated: ${formatted}`
            dateRef.current.setAttribute('datetime', now.toISOString())
          }
        }
      } catch {}
    }
    checkMutations()
    const i = setInterval(checkMutations, 60000)
    return () => clearInterval(i)
  }, [])

  return (
    <>
      {/* ── BLUF / Executive Summary ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem 0' }}>
        {/* Dynamic freshness indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, fontSize: 13, color: '#888' }}>
          <time ref={dateRef} dateTime="">Last Updated: March 30, 2026</time>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Living DOM Active
          </span>
        </div>

        {/* Mutation notice */}
        {mutationNotice && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 20,
            background: '#f0fdf4', borderLeft: '4px solid #16a34a',
            fontSize: 13, color: '#15803d', fontWeight: 500,
          }}>
            {mutationNotice}
          </div>
        )}

        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 12 }}>
          Executive Summary
        </h2>
        <p style={{ fontSize: 17, color: '#444', lineHeight: 1.8, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: bluf }} />
      </section>

      {/* ── TABLE TRAP: MCP Server Comparison ── */}
      <section id="mcp-servers" style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
          What Makes 0nMCP Different From Every Other MCP Server?
        </h2>
        <p style={{ fontSize: 15, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
          Most MCP servers connect a handful of tools with manual configuration. 0nMCP connects 54 services with zero config and patented security.
        </p>

        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 700 }}>Metric</th>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 700 }}>Typical MCP Server</th>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 700 }}>0nMCP</th>
              </tr>
            </thead>
            <tbody dangerouslySetInnerHTML={tableRows ? { __html: tableRows } : { __html: `
              <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:14px;font-weight:500">Tools</td><td style="padding:14px;color:#888">10-50 typical</td><td style="padding:14px;font-weight:700;color:#16a34a">945 tools</td></tr>
              <tr style="background:#fafafa;border-bottom:1px solid #f0f0f0"><td style="padding:14px;font-weight:500">Services</td><td style="padding:14px;color:#888">1-5 typical</td><td style="padding:14px;font-weight:700;color:#16a34a">54 services</td></tr>
              <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:14px;font-weight:500">Configuration</td><td style="padding:14px;color:#888">Manual YAML/JSON</td><td style="padding:14px;font-weight:700;color:#16a34a">Zero config — npx 0nmcp@latest</td></tr>
              <tr style="background:#fafafa;border-bottom:1px solid #f0f0f0"><td style="padding:14px;font-weight:500">Security</td><td style="padding:14px;color:#888">Plain text keys</td><td style="padding:14px;font-weight:700;color:#16a34a">AES-256-GCM vault (patented)</td></tr>
              <tr><td style="padding:14px;font-weight:500">License</td><td style="padding:14px;color:#888">Varies</td><td style="padding:14px;font-weight:700;color:#16a34a">MIT — free forever</td></tr>
            ` }} />
          </table>
        </div>
      </section>

      {/* ── MCP SERVER INTEGRATION ── */}
      <section id="integration" style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
          MCP Server Integration — 54 Services, One Protocol
        </h2>
        <div style={{ padding: 24, borderRadius: 14, background: '#fff', border: '1px solid #e5e7eb', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 15, color: '#444', lineHeight: 1.8, margin: 0 }}>
            Seamlessly integrate with <strong>CRM (245 tools)</strong>, billing (Stripe, Square, QuickBooks), project management (Linear, Jira, Asana), communication (Slack, Discord, Twilio), and more. 0nMCP handles tool selection, execution, error handling, and retries automatically. Your AI describes what it wants — 0nMCP figures out which service to call and how.
          </p>
        </div>

        {/* Integration Table Trap */}
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#1a1a1a', color: '#fff' }}>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 700 }}>Category</th>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 700 }}>Services</th>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 700 }}>Tools</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cat: 'CRM', services: 'Full CRM suite', tools: '245 (contacts, calendars, invoices, pipelines, social)' },
                { cat: 'Payments', services: 'Stripe, Square, QuickBooks', tools: '40+' },
                { cat: 'Communication', services: 'Slack, Discord, Twilio, WhatsApp', tools: '30+' },
                { cat: 'Development', services: 'GitHub, Linear, Jira, Vercel', tools: '50+' },
                { cat: 'Data & Storage', services: 'Supabase, MongoDB, Airtable, Notion', tools: '40+' },
                { cat: 'Marketing', services: 'SendGrid, Mailchimp, HubSpot', tools: '35+' },
                { cat: 'AI & ML', services: 'OpenAI, Anthropic, Groq, ElevenLabs', tools: '25+' },
                { cat: 'Commerce', services: 'Shopify, WooCommerce, BigCommerce', tools: '30+' },
              ].map((row, i) => (
                <tr key={row.cat} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: 14, fontWeight: 600 }}>{row.cat}</td>
                  <td style={{ padding: 14, color: '#666' }}>{row.services}</td>
                  <td style={{ padding: 14, fontWeight: 700, color: '#16a34a' }}>{row.tools}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── AUTOMATE MCP SERVER WORKFLOWS ── */}
      <section id="automate" style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
          Automate MCP Server Workflows
        </h2>
        <p style={{ fontSize: 15, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
          Describe outcomes in natural language. 0nMCP orchestrates complex agentic workflows using three patented execution models:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { name: 'Pipeline', desc: 'Sequential execution — step A completes before step B starts. Perfect for data transformation chains, approval flows, and ETL processes.', icon: '→' },
            { name: 'Assembly Line', desc: 'Parallel execution with dependencies — independent steps run simultaneously, dependent steps wait. Optimal for multi-service orchestration.', icon: '⇉' },
            { name: 'Radial Burst', desc: 'Fan-out execution — one trigger spawns N parallel operations. Ideal for broadcast messaging, bulk updates, and multi-channel campaigns.', icon: '✦' },
          ].map(model => (
            <div key={model.name} style={{
              padding: 24, borderRadius: 14,
              background: '#fff', border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{model.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>{model.name}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{model.desc}</div>
            </div>
          ))}
        </div>

        {/* .0n SWITCH file example */}
        <div style={{
          marginTop: 20, padding: 20, borderRadius: 14,
          background: '#1a1a1a', color: '#e0e0e0', fontSize: 13,
          fontFamily: 'monospace', lineHeight: 1.8, overflow: 'auto',
        }}>
          <div style={{ color: '#666', marginBottom: 8 }}>// Example .0n SWITCH file — declarative intent</div>
          <div>{`{`}</div>
          <div style={{ paddingLeft: 20 }}><span style={{ color: '#6EE05A' }}>"$0n"</span>: {`{ "type": "workflow", "name": "New Lead Pipeline" }`},</div>
          <div style={{ paddingLeft: 20 }}><span style={{ color: '#6EE05A' }}>"trigger"</span>: <span style={{ color: '#fbbf24' }}>"crm.contact.created"</span>,</div>
          <div style={{ paddingLeft: 20 }}><span style={{ color: '#6EE05A' }}>"steps"</span>: [</div>
          <div style={{ paddingLeft: 40 }}>{`{ "action": "crm.contact.tag", "tag": "new-lead" },`}</div>
          <div style={{ paddingLeft: 40 }}>{`{ "action": "slack.message.send", "channel": "#leads" },`}</div>
          <div style={{ paddingLeft: 40 }}>{`{ "action": "email.sequence.start", "template": "welcome" }`}</div>
          <div style={{ paddingLeft: 20 }}>]</div>
          <div>{`}`}</div>
        </div>
      </section>

      {/* ── PATENTED TECHNOLOGY ── */}
      <section id="patents" style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 20 }}>
          4 Patented Technologies. Zero Competitors.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { name: 'Seal of Truth', desc: 'SHA3-256 content-addressed integrity verification. Tamper-proof provenance for every workflow and credential.', patent: '#63/968,814' },
            { name: '0nVault', desc: 'AES-256-GCM encryption with PBKDF2-SHA512 and hardware fingerprint binding. Credentials never leave your machine.', patent: '#63/990,046' },
            { name: '0nPlex', desc: 'Multi-AI Council — 5 models debate, cross-critique, synthesize, and score against 7 reasoning personas.', patent: 'Pending' },
            { name: '0nCore', desc: 'Voice-adaptive AI generation with real-time context switching across 54 services and 945 tools.', patent: 'Pending' },
          ].map(p => (
            <div key={p.name} style={{
              padding: 20, borderRadius: 12,
              background: '#fff', border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s, transform 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginBottom: 8 }}>US Provisional {p.patent}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ (Featured Snippet Trap) ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 20 }}>
          Frequently Asked Questions
        </h2>
        {[
          { q: 'What is 0nMCP?', a: '0nMCP is the Universal AI API Orchestrator — the most comprehensive MCP Server connecting 945 tools and 54 services with zero configuration. Open source, MIT licensed, and powered by 4 patented technologies.' },
          { q: 'How do I install 0nMCP?', a: 'Run npx 0nmcp@latest in your terminal. That\'s it. Zero config. Works with npm, pnpm, yarn, and bun. Auto-generates configs for Claude, Gemini, Grok, Cursor, and 3 more AI platforms.' },
          { q: 'Is 0nMCP free?', a: 'The core 0nMCP server is MIT licensed and free forever. The marketplace charges $0.01 per workflow execution. The business dashboard (0nCore) starts at $80/mo.' },
          { q: 'How is 0nMCP different from Zapier or Make?', a: '0nMCP runs locally on your machine with zero cloud dependency. It\'s an MCP server, not a cloud workflow builder. Your AI talks directly to 54 services through natural language — no drag-and-drop, no monthly limits, no vendor lock-in.' },
          { q: 'Is 0nMCP secure?', a: 'Yes. 0nVault uses AES-256-GCM encryption with PBKDF2-SHA512 key derivation (100K iterations) and hardware fingerprint binding. 4 US patents filed. Cisco called the competition a "security nightmare" — 0nMCP was built as the secure alternative.' },
        ].map(faq => (
          <div key={faq.q} style={{
            padding: 20, borderRadius: 12, marginBottom: 12,
            background: '#fff', border: '1px solid #e5e7eb',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{faq.q}</h3>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
          </div>
        ))}
      </section>

      {/* ── $8 REWRITE OFFER ── */}
      <section id="offer" style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{
          borderRadius: 16, padding: '3rem 2rem', textAlign: 'center',
          background: 'linear-gradient(135deg, #16a34a, #1a1a1a)',
          color: '#fff',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Get Your Own MCP Server Living DOM Page for $8</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
            Professional SXO-optimized rewrite focused on MCP Servers, integration, or automation. Living DOM included.
          </p>
          <Link href="/get-mcp-rewrite" style={{
            display: 'inline-block', padding: '14px 32px', borderRadius: 12,
            background: '#fff', color: '#16a34a', fontWeight: 800, fontSize: 16,
            textDecoration: 'none', transition: 'transform 0.2s',
          }}>
            Claim My $8 Rewrite Now
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <div style={{
          borderRadius: 16, padding: '3rem 2rem', textAlign: 'center',
          background: 'linear-gradient(135deg, #1a1a1a, #333)',
          color: '#fff',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Ready to Try 0nMCP?</h2>
          <p style={{ fontSize: 15, color: '#aaa', marginBottom: 24 }}>945 tools. 54 services. One command. Free and open source.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              padding: '12px 28px', borderRadius: 10,
              background: '#6EE05A', color: '#1a1a1a', fontWeight: 700, fontSize: 14,
              textDecoration: 'none', transition: 'transform 0.2s',
              display: 'inline-block',
            }}>
              Request Access
            </Link>
            <Link href="https://github.com/0nork/0nMCP" target="_blank" rel="noopener" style={{
              padding: '12px 28px', borderRadius: 10,
              background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: 14,
              textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)',
              display: 'inline-block',
            }}>
              View on GitHub
            </Link>
          </div>
          <div style={{ marginTop: 16 }}>
            <code style={{ fontSize: 13, color: '#6EE05A', background: 'rgba(110,224,90,0.1)', padding: '6px 14px', borderRadius: 6 }}>
              npx 0nmcp@latest
            </code>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  )
}
