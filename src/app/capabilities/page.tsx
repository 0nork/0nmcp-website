import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Universal Capability Routing — 0nMCP',
  description:
    'One command. Any service. 60 capabilities across 30 categories with 222 provider options. Say "send an email" and 0nMCP picks the right service for you.',
  keywords: [
    '0nMCP',
    'capability routing',
    'universal API',
    'AI orchestration',
    'service abstraction',
    'MCP server',
  ],
  openGraph: {
    title: 'Universal Capability Routing — 0nMCP',
    description:
      'Say "send an email" — 0nMCP figures out which service you have and uses it. 60 capabilities, 222 providers, zero configuration.',
    url: 'https://www.0nmcp.com/capabilities',
    siteName: '0nMCP',
    type: 'website',
  },
  alternates: { canonical: 'https://www.0nmcp.com/capabilities' },
}

/* ── Capability routing examples (animated demos) ── */
const routingExamples = [
  {
    capability: '{{email.send}}',
    label: 'Send an email',
    providers: ['SendGrid', 'Gmail', 'Postmark', 'CRM', 'Resend', 'Mailchimp'],
    color: '#6EE05A',
  },
  {
    capability: '{{payment.create_invoice}}',
    label: 'Create an invoice',
    providers: ['Stripe', 'Square', 'QuickBooks', 'Xero', 'PayPal'],
    color: '#00d4ff',
  },
  {
    capability: '{{social.post}}',
    label: 'Post to social media',
    providers: ['LinkedIn', 'Twitter/X', 'Instagram', 'TikTok', 'Reddit', 'Facebook'],
    color: '#a78bfa',
  },
  {
    capability: '{{project.create_task}}',
    label: 'Create a task',
    providers: ['Asana', 'Trello', 'Monday', 'Jira', 'Linear', 'Notion'],
    color: '#fbbf24',
  },
  {
    capability: '{{ai.generate_text}}',
    label: 'Generate text with AI',
    providers: ['Groq', 'OpenAI', 'Claude', 'Mistral', 'Ollama', 'Gemini'],
    color: '#f472b6',
  },
]

/* ── Full capability table data ── */
const capabilityCategories = [
  {
    category: 'Email',
    capabilities: [
      { name: 'email.send', desc: 'Send an email', providers: 'SendGrid, Gmail, Postmark, CRM, Resend, Mailchimp' },
      { name: 'email.send_template', desc: 'Send a template email', providers: 'SendGrid, Mailchimp, CRM, Resend' },
    ],
  },
  {
    category: 'Messaging',
    capabilities: [
      { name: 'message.send_sms', desc: 'Send a text message', providers: 'Twilio, CRM, Vonage' },
      { name: 'message.send_chat', desc: 'Send a chat message', providers: 'Slack, Discord, Teams, WhatsApp' },
      { name: 'message.send_dm', desc: 'Send a direct message', providers: 'Slack, Discord, Twitter/X, Instagram' },
    ],
  },
  {
    category: 'Payments',
    capabilities: [
      { name: 'payment.create_invoice', desc: 'Create an invoice', providers: 'Stripe, Square, QuickBooks, Xero' },
      { name: 'payment.charge', desc: 'Charge a payment', providers: 'Stripe, Square, PayPal, Plaid' },
      { name: 'payment.refund', desc: 'Process a refund', providers: 'Stripe, Square, PayPal' },
      { name: 'payment.create_subscription', desc: 'Start a subscription', providers: 'Stripe, Square, PayPal' },
    ],
  },
  {
    category: 'Social Media',
    capabilities: [
      { name: 'social.post', desc: 'Post to social media', providers: 'LinkedIn, Twitter/X, Instagram, TikTok, Reddit, Facebook' },
      { name: 'social.schedule_post', desc: 'Schedule a post', providers: 'LinkedIn, Twitter/X, Instagram, TikTok, CRM' },
      { name: 'social.get_analytics', desc: 'Get post analytics', providers: 'LinkedIn, Twitter/X, Instagram, TikTok, Facebook' },
    ],
  },
  {
    category: 'AI / Language',
    capabilities: [
      { name: 'ai.generate_text', desc: 'Generate text', providers: 'OpenAI, Claude, Groq, Mistral, Ollama, Gemini' },
      { name: 'ai.summarize', desc: 'Summarize content', providers: 'OpenAI, Claude, Groq, Mistral' },
      { name: 'ai.translate', desc: 'Translate text', providers: 'OpenAI, Claude, Google, DeepL' },
      { name: 'ai.classify', desc: 'Classify / tag content', providers: 'OpenAI, Claude, Groq, Mistral' },
    ],
  },
  {
    category: 'CRM / Contacts',
    capabilities: [
      { name: 'contact.create', desc: 'Create a contact', providers: 'CRM, HubSpot, Salesforce, Pipedrive' },
      { name: 'contact.update', desc: 'Update a contact', providers: 'CRM, HubSpot, Salesforce, Pipedrive' },
      { name: 'contact.find', desc: 'Find a contact', providers: 'CRM, HubSpot, Salesforce, Pipedrive' },
    ],
  },
  {
    category: 'Project Management',
    capabilities: [
      { name: 'project.create_task', desc: 'Create a task', providers: 'Asana, Trello, Monday, Jira, Linear, Notion' },
      { name: 'project.update_task', desc: 'Update a task', providers: 'Asana, Trello, Monday, Jira, Linear' },
      { name: 'project.assign_task', desc: 'Assign a task', providers: 'Asana, Trello, Monday, Jira, Linear' },
      { name: 'project.create_project', desc: 'Create a project', providers: 'Asana, Monday, Jira, Linear, Notion' },
    ],
  },
  {
    category: 'Calendar',
    capabilities: [
      { name: 'calendar.create_event', desc: 'Create an event', providers: 'Google Calendar, CRM, Calendly, Zoom' },
      { name: 'calendar.list_events', desc: 'List upcoming events', providers: 'Google Calendar, CRM, Calendly, Outlook' },
      { name: 'calendar.book_meeting', desc: 'Book a meeting', providers: 'Calendly, CRM, Google Calendar, Zoom' },
    ],
  },
  {
    category: 'File Storage',
    capabilities: [
      { name: 'file.upload', desc: 'Upload a file', providers: 'Google Drive, Dropbox, S3, Supabase' },
      { name: 'file.download', desc: 'Download a file', providers: 'Google Drive, Dropbox, S3, Supabase' },
      { name: 'file.share', desc: 'Share a file', providers: 'Google Drive, Dropbox, Notion' },
    ],
  },
  {
    category: 'Database',
    capabilities: [
      { name: 'db.query', desc: 'Run a database query', providers: 'Supabase, MongoDB, Airtable, Notion' },
      { name: 'db.insert', desc: 'Insert a record', providers: 'Supabase, MongoDB, Airtable, Notion, Google Sheets' },
      { name: 'db.update', desc: 'Update a record', providers: 'Supabase, MongoDB, Airtable, Notion, Google Sheets' },
    ],
  },
  {
    category: 'E-Commerce',
    capabilities: [
      { name: 'store.create_product', desc: 'Create a product', providers: 'Shopify, Square, Stripe, WooCommerce' },
      { name: 'store.create_order', desc: 'Create an order', providers: 'Shopify, Square, Stripe' },
      { name: 'store.update_inventory', desc: 'Update inventory', providers: 'Shopify, Square, WooCommerce' },
    ],
  },
  {
    category: 'Code / DevOps',
    capabilities: [
      { name: 'code.create_issue', desc: 'Create an issue', providers: 'GitHub, Jira, Linear, GitLab' },
      { name: 'code.create_pr', desc: 'Create a pull request', providers: 'GitHub, GitLab, Bitbucket' },
      { name: 'code.deploy', desc: 'Deploy a project', providers: 'Vercel, Cloudflare, Netlify, AWS' },
    ],
  },
  {
    category: 'Analytics',
    capabilities: [
      { name: 'analytics.track_event', desc: 'Track an event', providers: 'Google Analytics, Mixpanel, Amplitude, Segment' },
      { name: 'analytics.get_report', desc: 'Get a report', providers: 'Google Analytics, Mixpanel, Amplitude' },
    ],
  },
  {
    category: 'Notifications',
    capabilities: [
      { name: 'notify.send_push', desc: 'Send a push notification', providers: 'OneSignal, Firebase, Expo' },
      { name: 'notify.send_webhook', desc: 'Send a webhook', providers: 'Any URL, Zapier, Make, n8n' },
    ],
  },
  {
    category: 'Documents',
    capabilities: [
      { name: 'doc.create', desc: 'Create a document', providers: 'Google Docs, Notion, Airtable' },
      { name: 'doc.create_spreadsheet', desc: 'Create a spreadsheet', providers: 'Google Sheets, Airtable, Excel' },
      { name: 'doc.create_form', desc: 'Create a form', providers: 'Google Forms, Typeform, CRM' },
    ],
  },
  {
    category: 'Ads / Marketing',
    capabilities: [
      { name: 'ads.create_campaign', desc: 'Create an ad campaign', providers: 'Google Ads, Facebook Ads, LinkedIn Ads, TikTok Ads' },
      { name: 'ads.get_performance', desc: 'Get ad performance', providers: 'Google Ads, Facebook Ads, LinkedIn Ads, TikTok Ads' },
    ],
  },
  {
    category: 'Voice / Phone',
    capabilities: [
      { name: 'voice.make_call', desc: 'Make a phone call', providers: 'Twilio, CRM, Vonage' },
      { name: 'voice.send_voicemail', desc: 'Send a voicemail', providers: 'Twilio, CRM' },
    ],
  },
  {
    category: 'Scheduling',
    capabilities: [
      { name: 'schedule.create_appointment', desc: 'Create an appointment', providers: 'Calendly, CRM, Google Calendar, Zoom' },
      { name: 'schedule.send_reminder', desc: 'Send a reminder', providers: 'CRM, Twilio, Gmail, Slack' },
    ],
  },
  {
    category: 'Surveys',
    capabilities: [
      { name: 'survey.create', desc: 'Create a survey', providers: 'Typeform, Google Forms, CRM' },
      { name: 'survey.get_responses', desc: 'Get survey responses', providers: 'Typeform, Google Forms, CRM' },
    ],
  },
  {
    category: 'Support',
    capabilities: [
      { name: 'support.create_ticket', desc: 'Create a support ticket', providers: 'Zendesk, Intercom, Jira, CRM' },
      { name: 'support.reply_ticket', desc: 'Reply to a ticket', providers: 'Zendesk, Intercom, Jira' },
    ],
  },
]

/* ── How-it-works steps ── */
const howSteps = [
  {
    num: '01',
    title: 'Write Your Workflow',
    desc: 'Use simple commands like {{email.send}} in your .0n file. No need to pick a specific service.',
    code: '{{email.send}} to: user@email.com',
  },
  {
    num: '02',
    title: 'Connect Your Services',
    desc: 'Each person connects the services they already use. You use Gmail? Great. Your friend uses SendGrid? Also great.',
    code: '0nmcp engine import',
  },
  {
    num: '03',
    title: '0nMCP Routes Automatically',
    desc: '0nMCP looks at what you have connected and picks the right one. Same workflow, different services, everyone wins.',
    code: '{{email.send}} → Gmail (for you) → SendGrid (for them)',
  },
]

/* ── FAQ ── */
const faqItems = [
  {
    q: 'What is capability routing?',
    a: 'Instead of telling your AI exactly which service to use (like "send via SendGrid"), you just say what you want to do (like "send an email"). 0nMCP looks at which services you have connected and picks the right one automatically.',
  },
  {
    q: 'What happens if I have two email services connected?',
    a: '0nMCP uses a priority system. You can set which service you prefer for each capability, or let 0nMCP pick the best one based on your connection order. You are always in control.',
  },
  {
    q: 'Can I share workflows with people who use different services?',
    a: 'Yes! That is the whole point. A workflow that uses {{email.send}} works for someone with Gmail, someone with SendGrid, someone with Postmark — anyone. The workflow stays the same, only the service changes.',
  },
  {
    q: 'Do I have to learn a new language?',
    a: 'Nope. Capabilities use simple names like email.send, payment.charge, or social.post. If you can read English, you can read a capability.',
  },
  {
    q: 'How is this different from Zapier or Make?',
    a: 'Zapier and Make require you to pick specific services when you build a workflow. If you switch from Mailchimp to SendGrid, you have to rebuild everything. With 0nMCP, your workflows are service-agnostic — they work no matter what tools you use.',
  },
  {
    q: 'Is this free?',
    a: 'Yes. The capability routing system is part of the open-source 0nMCP core. Install it with npx 0nmcp@latest and you get all 60 capabilities across 222 providers for free.',
  },
]

export default function CapabilitiesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Universal Capability Routing — 0nMCP',
    description: 'One command. Any service. 60 capabilities across 30 categories with 222 provider options.',
    url: 'https://www.0nmcp.com/capabilities',
    isPartOf: { '@type': 'WebSite', name: '0nMCP', url: 'https://www.0nmcp.com' },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="homepage">

        {/* ── HERO ── */}
        <section className="hero-section" style={{ minHeight: '70vh' }}>
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-glow-secondary" aria-hidden="true" />

          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>Universal Capability Routing</span>
            </div>

            <h1 className="hero-title">
              One Command.<br />
              <span className="hero-title-accent">Any Service.</span><br />
              Your Choice.
            </h1>

            <p className="hero-subtitle">
              Stop telling your AI <em>which</em> service to use. Just say <strong>what you want to do</strong>.
              0nMCP figures out the rest.
            </p>

            <p className="hero-subtitle" style={{ marginTop: '-1rem', fontSize: '1rem' }}>
              Think of it like a universal remote. One button turns on <strong>ANY TV</strong>, no matter the brand.
            </p>

            <div className="hero-ctas">
              <Link href="/signup" className="hero-cta-primary">
                Request Early Access
              </Link>
              <Link href="https://github.com/0nork/0nMCP" className="hero-cta-secondary" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                View on GitHub
              </Link>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="stats-bar">
          <div className="stats-bar-inner">
            <div className="stat-item">
              <span className="stat-value">60</span>
              <span className="stat-label">Capabilities</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">222</span>
              <span className="stat-label">Providers</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">95</span>
              <span className="stat-label">Services</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-value">30</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </section>

        {/* ── BEFORE / AFTER ── */}
        <section className="comparison-section section-container">
          <h2 className="section-label">The Problem</h2>
          <p className="section-desc">Why do you have to pick a service before you can do anything?</p>

          <div className="before-after">
            <div className="before-card">
              <div className="before-after-header">
                <span className="before-after-icon">&#10007;</span>
                <span className="before-after-title">Without Capability Routing</span>
              </div>
              <div className="before-after-body">
                <p>&quot;Send email via SendGrid&quot;</p>
                <p>&quot;Send email via Gmail&quot;</p>
                <p>&quot;Send email via Postmark&quot;</p>
                <p className="before-after-calc">3 different workflows for the <strong>exact same thing</strong></p>
                <p className="before-after-bottom">Switch services? Rebuild everything. Share with a friend? They need the same tools you have.</p>
              </div>
            </div>

            <div className="after-card">
              <div className="before-after-header">
                <span className="before-after-icon after-icon">&#10003;</span>
                <span className="before-after-title">With Capability Routing</span>
              </div>
              <div className="before-after-body">
                <div className="after-code">
                  <code>{'{{email.send}}'}</code>
                </div>
                <p className="after-result">One workflow. Works with ANY email provider.</p>
                <p className="after-detail">You use Gmail? It sends through Gmail.</p>
                <p className="after-detail">Your friend uses SendGrid? It sends through SendGrid.</p>
                <p className="after-detail">Same workflow. Different services. Everyone wins.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── ANIMATED ROUTING EXAMPLES ── */}
        <section className="features-section section-container">
          <h2 className="section-label">See It In Action</h2>
          <p className="section-desc">One capability. Many services. Automatic routing.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '700px', margin: '0 auto' }}>
            {routingExamples.map((ex) => (
              <div key={ex.capability} className="feature-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Capability badge */}
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: ex.color,
                    background: `${ex.color}12`,
                    border: `1px solid ${ex.color}30`,
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {ex.capability}
                  </div>

                  {/* Arrow */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M5 12h14m-6-6 6 6-6 6" stroke={ex.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  {/* Provider chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {ex.providers.map((p) => (
                      <span key={p} className="service-chip" style={{ borderColor: `${ex.color}25` }}>
                        <span className="service-chip-dot" style={{ background: ex.color }} />
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Say &quot;{ex.label}&quot; and 0nMCP picks whichever one you have connected.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FULL CAPABILITY TABLE ── */}
        <section className="table-section section-container">
          <h2 className="section-label">All 60 Capabilities</h2>
          <p className="section-desc">Grouped by category. Every capability works with multiple services.</p>

          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {capabilityCategories.map((cat) => (
              <div key={cat.category}>
                <h3 style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.1em',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border)',
                }}>
                  {cat.category}
                </h3>
                <div className="compare-table-wrap" style={{ maxWidth: '100%' }}>
                  <table className="compare-table">
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>Capability</th>
                        <th style={{ width: '22%' }}>What It Does</th>
                        <th>Providers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.capabilities.map((cap) => (
                        <tr key={cap.name}>
                          <td className="compare-us-val" style={{ fontSize: '0.75rem' }}>{cap.name}</td>
                          <td className="compare-feature">{cap.desc}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{cap.providers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="steps-section section-container">
          <h2 className="section-label">How It Works</h2>
          <p className="section-desc">Three steps. No computer science degree needed.</p>

          <div className="steps-grid">
            {howSteps.map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-num">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
                <div className="step-code">
                  <code>{step.code}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY THIS MATTERS (features) ── */}
        <section className="features-section section-container">
          <h2 className="section-label">Why This Matters</h2>
          <p className="section-desc">Four big wins for you and your team.</p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#6EE05A15', borderColor: '#6EE05A30' }}>
                <span>&#9889;</span>
              </div>
              <h3 className="feature-title">Write Once, Run Anywhere</h3>
              <p className="feature-desc">Build a workflow one time. It works for everyone on your team, even if they use completely different services.</p>
              <div className="feature-accent-line" style={{ background: '#6EE05A' }} />
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#00d4ff15', borderColor: '#00d4ff30' }}>
                <span>&#128260;</span>
              </div>
              <h3 className="feature-title">Switch Services Easily</h3>
              <p className="feature-desc">Move from Mailchimp to SendGrid? Just reconnect. All your workflows keep working. Zero rebuilding.</p>
              <div className="feature-accent-line" style={{ background: 'var(--bg-primary)' }} />
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#a78bfa15', borderColor: '#a78bfa30' }}>
                <span>&#129309;</span>
              </div>
              <h3 className="feature-title">Share Without Headaches</h3>
              <p className="feature-desc">Share a workflow with a client or friend. They do not need the same tools you have. The workflow adapts to their services.</p>
              <div className="feature-accent-line" style={{ background: '#a78bfa' }} />
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: '#fbbf2415', borderColor: '#fbbf2430' }}>
                <span>&#128218;</span>
              </div>
              <h3 className="feature-title">Simple Language</h3>
              <p className="feature-desc">No API codes. No service IDs. Just plain names like email.send and payment.charge. If you can read it, you can use it.</p>
              <div className="feature-accent-line" style={{ background: '#fbbf24' }} />
            </div>
          </div>
        </section>

        {/* ── ANALOGY SECTION ── */}
        <section className="comparison-section section-container">
          <h2 className="section-label">Think Of It This Way</h2>
          <p className="section-desc" style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
            When you plug in a toaster, you do not care which power plant made the electricity. You just plug it in and it works.
          </p>

          <div className="before-after" style={{ maxWidth: '700px' }}>
            <div className="before-card">
              <div className="before-after-header">
                <span className="before-after-icon">&#10007;</span>
                <span className="before-after-title">Old Way</span>
              </div>
              <div className="before-after-body">
                <p>&quot;Connect to Power Plant #7 on Grid B, use transformer 4, route through substation 12...&quot;</p>
                <p className="before-after-bottom">You had to know every detail about the system behind the scenes.</p>
              </div>
            </div>

            <div className="after-card">
              <div className="before-after-header">
                <span className="before-after-icon after-icon">&#10003;</span>
                <span className="before-after-title">0nMCP Way</span>
              </div>
              <div className="before-after-body">
                <div className="after-code">
                  <code>Plug it in.</code>
                </div>
                <p className="after-result">It just works.</p>
                <p className="after-detail">0nMCP is the outlet. Your services are the power plants. You do not need to know which one is running.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="faq-section section-container">
          <h2 className="section-label">FAQ</h2>
          <div className="faq-grid">
            {faqItems.map((item) => (
              <details key={item.q} className="faq-item">
                <summary className="faq-question">{item.q}</summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="final-cta-section">
          <div className="final-cta-glow" aria-hidden="true" />
          <h2 className="final-cta-title">
            Stop picking services.<br />
            <span className="hero-title-accent">Start describing outcomes.</span>
          </h2>
          <p className="final-cta-subtitle">
            60 capabilities. 222 providers. One install.
          </p>
          <div className="hero-ctas" style={{ justifyContent: 'center' }}>
            <Link href="/signup" className="hero-cta-primary">
              Request Early Access
            </Link>
            <Link href="https://github.com/0nork/0nMCP" className="hero-cta-secondary" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              Star on GitHub
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
