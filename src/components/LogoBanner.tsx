'use client'

/* ── Infinite Scrolling Logo Banner ──
   Two rows of service badges scrolling in opposite directions.
   Pure CSS animation, no JS scroll logic. Pauses on hover.
── */

const SERVICES = [
  // Current 26
  { name: 'CRM', color: '#ff6b35' },
  { name: 'Stripe', color: '#635bff' },
  { name: 'SendGrid', color: '#1a82e2' },
  { name: 'Slack', color: '#4a154b' },
  { name: 'Discord', color: '#5865f2' },
  { name: 'Twilio', color: '#f22f46' },
  { name: 'GitHub', color: '#f0f6fc' },
  { name: 'Shopify', color: '#95bf47' },
  { name: 'OpenAI', color: '#10a37f' },
  { name: 'Anthropic', color: '#d4a574' },
  { name: 'Gmail', color: '#ea4335' },
  { name: 'Google Sheets', color: '#0f9d58' },
  { name: 'Google Drive', color: '#4285f4' },
  { name: 'Airtable', color: '#18bfff' },
  { name: 'Notion', color: '#ffffff' },
  { name: 'MongoDB', color: '#47a248' },
  { name: 'Supabase', color: '#3ecf8e' },
  { name: 'Zendesk', color: '#03363d' },
  { name: 'Jira', color: '#0052cc' },
  { name: 'HubSpot', color: '#ff7a59' },
  { name: 'Mailchimp', color: '#ffe01b' },
  { name: 'Google Calendar', color: '#4285f4' },
  { name: 'Calendly', color: '#006bff' },
  { name: 'Zoom', color: '#2d8cff' },
  { name: 'Linear', color: '#5e6ad2' },
  { name: 'Microsoft', color: '#00a4ef' },
  // New 22
  { name: 'QuickBooks', color: '#2ca01c' },
  { name: 'Asana', color: '#f06a6a' },
  { name: 'Intercom', color: '#1f8ded' },
  { name: 'Dropbox', color: '#0061fe' },
  { name: 'WhatsApp', color: '#25d366' },
  { name: 'Instagram', color: '#e1306c' },
  { name: 'X', color: '#f0f6fc' },
  { name: 'TikTok', color: '#ff0050' },
  { name: 'Google Ads', color: '#4285f4' },
  { name: 'Facebook Ads', color: '#1877f2' },
  { name: 'Plaid', color: '#111111' },
  { name: 'Square', color: '#006aff' },
  { name: 'TikTok Ads', color: '#ff0050' },
  { name: 'X Ads', color: '#f0f6fc' },
  { name: 'LinkedIn Ads', color: '#0a66c2' },
  { name: 'Instagram Ads', color: '#e1306c' },
  { name: 'Smartlead', color: '#7c3aed' },
  { name: 'Zapier', color: '#ff4a00' },
  { name: 'MuleSoft', color: '#00a0df' },
  { name: 'Azure', color: '#0089d6' },
  { name: 'Pipedrive', color: '#017737' },
  { name: 'LinkedIn', color: '#0a66c2' },
]

// Split into two rows
const ROW_1 = SERVICES.slice(0, 24)
const ROW_2 = SERVICES.slice(24)

function ServiceBadge({ name, color }: { name: string; color: string }) {
  // For very dark colors or white-ish colors, adjust the dot visibility
  const isDark = color === '#111111' || color === '#03363d'
  const dotColor = isDark ? '#888888' : color

  return (
    <span
      className="logo-badge"
      style={{
        '--badge-color': color,
        '--dot-color': dotColor,
      } as React.CSSProperties}
    >
      <span className="logo-badge-dot" />
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
            <ServiceBadge key={`a-${i}`} name={s.name} color={s.color} />
          ))}
          {/* Duplicate for seamless loop */}
          {ROW_1.map((s, i) => (
            <ServiceBadge key={`b-${i}`} name={s.name} color={s.color} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="logo-banner-track">
        <div className="logo-banner-scroll logo-banner-scroll-right">
          {/* Original set */}
          {ROW_2.map((s, i) => (
            <ServiceBadge key={`c-${i}`} name={s.name} color={s.color} />
          ))}
          {/* Duplicate for seamless loop */}
          {ROW_2.map((s, i) => (
            <ServiceBadge key={`d-${i}`} name={s.name} color={s.color} />
          ))}
        </div>
      </div>

      {/* Gradient overlays for edge fade */}
      <div className="logo-banner-fade-left" />
      <div className="logo-banner-fade-right" />
    </section>
  )
}
