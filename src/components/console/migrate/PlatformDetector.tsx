'use client'

import type { MigrationResult } from '@/lib/console/migrate'
import { PLATFORM_INFO } from '@/lib/console/migrate'

interface PlatformDetectorProps {
  result: MigrationResult
}

const SERVICE_COLORS: Record<string, string> = {
  crm: '#ff6b35',
  stripe: '#635bff',
  sendgrid: '#1a82e2',
  slack: '#e01e5a',
  discord: '#5865f2',
  twilio: '#f22f46',
  github: '#f0f6fc',
  shopify: '#96bf48',
  openai: '#10a37f',
  anthropic: '#d4a574',
  gmail: '#ea4335',
  google_sheets: '#0f9d58',
  google_drive: '#4285f4',
  airtable: '#18bfff',
  notion: '#ffffff',
  mongodb: '#00ed64',
  supabase: '#3ecf8e',
  zendesk: '#03363d',
  jira: '#0052cc',
  hubspot: '#ff7a59',
  mailchimp: '#ffe01b',
  google_calendar: '#4285f4',
  calendly: '#006bff',
  zoom: '#2d8cff',
  linear: '#5e6ad2',
  microsoft: '#00a4ef',
}

export default function PlatformDetector({ result }: PlatformDetectorProps) {
  const platformInfo = PLATFORM_INFO[result.platform] ?? PLATFORM_INFO.unknown

  const confidenceColor =
    result.confidence >= 75
      ? 'var(--accent, #7ed957)'
      : result.confidence >= 50
        ? '#ffaa00'
        : '#ff4444'

  return (
    <div
      style={{
        background: 'var(--bg-card, #1a1a25)',
        border: '1px solid var(--border, #2a2a3a)',
        borderRadius: 12,
        padding: 24,
        width: '100%',
      }}
    >
      {/* Detected Platform Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: platformInfo.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {platformInfo.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted, #55556a)',
              marginBottom: 4,
            }}
          >
            Detected Platform
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-primary, #e8e8ef)',
            }}
          >
            {platformInfo.name}
          </div>
        </div>
      </div>

      {/* Confidence Bar */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-secondary, #8888a0)',
              fontWeight: 500,
            }}
          >
            Confidence
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: confidenceColor,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {result.confidence}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: 'var(--bg-primary, #0a0a0f)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${result.confidence}%`,
              borderRadius: 3,
              background: confidenceColor,
              transition: 'width 0.8s ease-out',
              boxShadow: `0 0 8px ${confidenceColor}40`,
            }}
          />
        </div>
      </div>

      {/* Steps Found */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
          padding: '10px 14px',
          background: 'var(--bg-primary, #0a0a0f)',
          borderRadius: 8,
          border: '1px solid var(--border, #2a2a3a)',
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--accent-secondary, #00d4ff)',
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          {result.stepsFound}
        </span>
        <span
          style={{
            fontSize: 13,
            color: 'var(--text-secondary, #8888a0)',
          }}
        >
          steps detected in workflow
        </span>
      </div>

      {/* Services Detected */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted, #55556a)',
            marginBottom: 8,
          }}
        >
          Services Detected
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {result.servicesDetected.map((service) => (
            <span
              key={service}
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-mono, monospace)',
                color: '#fff',
                background: `${SERVICE_COLORS[service] ?? '#555'}30`,
                border: `1px solid ${SERVICE_COLORS[service] ?? '#555'}60`,
              }}
            >
              {service.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Credential Queue */}
      {result.credentialQueue.length > 0 && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 8,
            background: 'var(--accent-glow, rgba(126,217,87,0.05))',
            border: '1px solid var(--accent, #7ed957)20',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--accent, #7ed957)',
              marginBottom: 6,
            }}
          >
            You will need to connect:
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-secondary, #8888a0)',
              lineHeight: 1.5,
            }}
          >
            {result.credentialQueue.map((s) => s.replace(/_/g, ' ')).join(', ')}
          </div>
        </div>
      )}
    </div>
  )
}
