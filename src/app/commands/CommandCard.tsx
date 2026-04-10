'use client'

import { useState } from 'react'
import type { Command } from './commands'
import { CopyButton } from './CopyButton'

const SERVICE_COLORS: Record<string, string> = {
  ZoomInfo: '#6366f1', LinkedIn: '#0A66C2', Clearbit: '#3b82f6', Hunter: '#f59e0b',
  HubSpot: '#FF7A59', Pipedrive: '#1a1a1a', Salesforce: '#00A1E0',
  Stripe: '#635bff', Square: '#006aff', QuickBooks: '#2CA01C',
  GitHub: '#f0f6fc', Vercel: '#fff', Supabase: '#3ecf8e', Linear: '#5E6AD2',
  Jira: '#0052CC', Sentry: '#362D59', Gmail: '#EA4335', Slack: '#4A154B',
  Notion: '#fff', 'Google Calendar': '#4285F4', 'Google Drive': '#34A853',
  Asana: '#F06A6A', Trello: '#0079BF', Monday: '#ff3d57',
  Shopify: '#96BF48', WooCommerce: '#96588A', Webflow: '#4353ff',
  Twilio: '#F22F46', SendGrid: '#1A82E2', Mailchimp: '#FFE01B',
  Figma: '#F24E1E', Canva: '#00C4CC', AWS: '#FF9900', Cloudflare: '#F48120',
  Shodan: '#c00', npm: '#CB3837', n8n: '#ea4b71', Zapier: '#FF4A00',
  '0nmcp': '#6EE05A',
}

export function CommandCard({ command, featured }: { command: Command; featured?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        background: featured ? 'rgba(110,224,90,0.03)' : 'rgba(255,255,255,0.02)',
        border: featured ? '1px solid rgba(110,224,90,0.15)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '1.25rem',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(110,224,90,0.3)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = featured ? 'rgba(110,224,90,0.15)' : 'rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: '0.625rem',
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.05em',
            }}>
              {command.id}
            </span>
            {command.isPower && (
              <span style={{
                fontSize: '0.5625rem',
                padding: '1px 6px',
                borderRadius: 3,
                background: 'rgba(110,224,90,0.12)',
                border: '1px solid rgba(110,224,90,0.25)',
                color: '#6EE05A',
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                POWER
              </span>
            )}
            {command.isFree && (
              <span style={{
                fontSize: '0.5625rem',
                padding: '1px 6px',
                borderRadius: 3,
                background: 'rgba(96,165,250,0.1)',
                border: '1px solid rgba(96,165,250,0.2)',
                color: '#60a5fa',
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                FREE
              </span>
            )}
          </div>
          <h3 style={{
            fontSize: featured ? '1.125rem' : '0.9375rem',
            fontWeight: 700,
            color: 'var(--text-primary, #fff)',
            margin: 0,
            lineHeight: 1.3,
          }}>
            {command.title}
          </h3>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, marginTop: 4, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <p style={{
        fontSize: '0.8125rem',
        color: 'var(--text-secondary, rgba(255,255,255,0.5))',
        margin: '0 0 10px',
        lineHeight: 1.5,
      }}>
        {command.description}
      </p>

      {/* Service badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: expanded ? 12 : 0 }}>
        {command.services.map(svc => (
          <span key={svc} style={{
            fontSize: '0.625rem',
            padding: '2px 7px',
            borderRadius: 4,
            background: `${SERVICE_COLORS[svc] || '#666'}12`,
            border: `1px solid ${SERVICE_COLORS[svc] || '#666'}30`,
            color: SERVICE_COLORS[svc] || '#888',
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            fontWeight: 500,
          }}>
            {svc}
          </span>
        ))}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          {/* Claude prompt */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontSize: '0.625rem',
                color: '#6EE05A',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Claude Desktop / Claude Code
              </span>
              <CopyButton text={command.claudePrompt} label="Copy" />
            </div>
            <pre style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: '0.75rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.7)',
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              maxHeight: 200,
              overflowY: 'auto',
            }}>
              {command.claudePrompt}
            </pre>
          </div>

          {/* Slack prompt */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontSize: '0.625rem',
                color: '#a78bfa',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Slack Command
              </span>
              <CopyButton text={`/0n ${command.slackPrompt}`} label="Copy" />
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            }}>
              /0n {command.slackPrompt}
            </div>
          </div>

          {/* Output example */}
          {command.outputExample && (
            <div style={{ marginTop: 12 }}>
              <span style={{
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontSize: '0.625rem',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 6,
              }}>
                Example Output
              </span>
              <div style={{
                background: 'rgba(110,224,90,0.04)',
                border: '1px solid rgba(110,224,90,0.1)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.6)',
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                whiteSpace: 'pre-wrap',
              }}>
                {command.outputExample}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
