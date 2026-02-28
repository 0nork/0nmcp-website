'use client'

/* ── Infinite Scrolling Logo Banner ──
   Two rows of service badges with real SVG logos scrolling in opposite directions.
   Pure CSS animation, no JS scroll logic. Pauses on hover.
── */

import { SERVICE_LOGOS } from './ServiceLogos'

const SERVICES = [
  // Current 26
  { name: 'CRM', key: 'crm', color: '#ff6b35' },
  { name: 'Stripe', key: 'stripe', color: '#635bff' },
  { name: 'SendGrid', key: 'sendgrid', color: '#1a82e2' },
  { name: 'Slack', key: 'slack', color: '#4a154b' },
  { name: 'Discord', key: 'discord', color: '#5865f2' },
  { name: 'Twilio', key: 'twilio', color: '#f22f46' },
  { name: 'GitHub', key: 'github', color: '#f0f6fc' },
  { name: 'Shopify', key: 'shopify', color: '#95bf47' },
  { name: 'OpenAI', key: 'openai', color: '#10a37f' },
  { name: 'Anthropic', key: 'anthropic', color: '#d4a574' },
  { name: 'Gmail', key: 'gmail', color: '#ea4335' },
  { name: 'Google Sheets', key: 'google-sheets', color: '#0f9d58' },
  { name: 'Google Drive', key: 'google-drive', color: '#4285f4' },
  { name: 'Airtable', key: 'airtable', color: '#18bfff' },
  { name: 'Notion', key: 'notion', color: '#ffffff' },
  { name: 'MongoDB', key: 'mongodb', color: '#47a248' },
  { name: 'Supabase', key: 'supabase', color: '#3ecf8e' },
  { name: 'Zendesk', key: 'zendesk', color: '#03363d' },
  { name: 'Jira', key: 'jira', color: '#0052cc' },
  { name: 'HubSpot', key: 'hubspot', color: '#ff7a59' },
  { name: 'Mailchimp', key: 'mailchimp', color: '#ffe01b' },
  { name: 'Google Calendar', key: 'google-calendar', color: '#4285f4' },
  { name: 'Calendly', key: 'calendly', color: '#006bff' },
  { name: 'Zoom', key: 'zoom', color: '#2d8cff' },
  { name: 'Linear', key: 'linear', color: '#5e6ad2' },
  { name: 'Microsoft', key: 'microsoft', color: '#00a4ef' },
  // New 22
  { name: 'QuickBooks', key: 'quickbooks', color: '#2ca01c' },
  { name: 'Asana', key: 'asana', color: '#f06a6a' },
  { name: 'Intercom', key: 'intercom', color: '#1f8ded' },
  { name: 'Dropbox', key: 'dropbox', color: '#0061fe' },
  { name: 'WhatsApp', key: 'whatsapp', color: '#25d366' },
  { name: 'Instagram', key: 'instagram', color: '#e1306c' },
  { name: 'X', key: 'x', color: '#f0f6fc' },
  { name: 'TikTok', key: 'tiktok', color: '#ff0050' },
  { name: 'Google Ads', key: 'google-ads', color: '#4285f4' },
  { name: 'Facebook Ads', key: 'facebook-ads', color: '#1877f2' },
  { name: 'Plaid', key: 'plaid', color: '#111111' },
  { name: 'Square', key: 'square', color: '#006aff' },
  { name: 'TikTok Ads', key: 'tiktok-ads', color: '#ff0050' },
  { name: 'X Ads', key: 'x-ads', color: '#f0f6fc' },
  { name: 'LinkedIn Ads', key: 'linkedin-ads', color: '#0a66c2' },
  { name: 'Instagram Ads', key: 'instagram-ads', color: '#e1306c' },
  { name: 'Smartlead', key: 'smartlead', color: '#7c3aed' },
  { name: 'Zapier', key: 'zapier', color: '#ff4a00' },
  { name: 'MuleSoft', key: 'mulesoft', color: '#00a0df' },
  { name: 'Azure', key: 'azure', color: '#0089d6' },
  { name: 'Pipedrive', key: 'pipedrive', color: '#017737' },
  { name: 'LinkedIn', key: 'linkedin', color: '#0a66c2' },
]

// Split into two rows
const ROW_1 = SERVICES.slice(0, 24)
const ROW_2 = SERVICES.slice(24)

function ServiceBadge({ name, color, logoKey }: { name: string; color: string; logoKey: string }) {
  const isDark = color === '#111111' || color === '#03363d'
  const dotColor = isDark ? '#888888' : color
  const Logo = SERVICE_LOGOS[logoKey]

  return (
    <span
      className="logo-badge"
      style={{
        '--badge-color': color,
        '--dot-color': dotColor,
      } as React.CSSProperties}
    >
      {Logo ? (
        <Logo size={18} />
      ) : (
        <span className="logo-badge-dot" />
      )}
      {name}
    </span>
  )
}

export default function LogoBanner() {
  return (
    <section className="logo-banner" aria-label="Supported integrations">
      {/* Heading */}
      <div className="logo-banner-header">
        <span className="logo-banner-count">48</span>
        <span className="logo-banner-label">Integrations &amp; Growing</span>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="logo-banner-track">
        <div className="logo-banner-scroll logo-banner-scroll-left">
          {/* Original set */}
          {ROW_1.map((s, i) => (
            <ServiceBadge key={`a-${i}`} name={s.name} color={s.color} logoKey={s.key} />
          ))}
          {/* Duplicate for seamless loop */}
          {ROW_1.map((s, i) => (
            <ServiceBadge key={`b-${i}`} name={s.name} color={s.color} logoKey={s.key} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="logo-banner-track">
        <div className="logo-banner-scroll logo-banner-scroll-right">
          {/* Original set */}
          {ROW_2.map((s, i) => (
            <ServiceBadge key={`c-${i}`} name={s.name} color={s.color} logoKey={s.key} />
          ))}
          {/* Duplicate for seamless loop */}
          {ROW_2.map((s, i) => (
            <ServiceBadge key={`d-${i}`} name={s.name} color={s.color} logoKey={s.key} />
          ))}
        </div>
      </div>

      {/* Gradient overlays for edge fade */}
      <div className="logo-banner-fade-left" />
      <div className="logo-banner-fade-right" />
    </section>
  )
}
