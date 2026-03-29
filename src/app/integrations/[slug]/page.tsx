import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import servicesData from '@/data/services.json'
import capabilitiesData from '@/data/capabilities.json'
import ServiceIcon from '@/components/ServiceLogos'
import { STATS_DISPLAY } from '@/data/stats'

type Service = (typeof servicesData.services)[number]
type Capability = (typeof capabilitiesData.capabilities)[number]
type Tool = { id: string; name: string; description: string }

const logicServices = ['delay', 'schedule', 'condition', 'loop', 'transform', 'trigger', 'error_handling']

function findService(slug: string): Service | undefined {
  return servicesData.services.find((s) => s.slug === slug && !logicServices.includes(s.id))
}

function getCapabilities(serviceId: string): { asTrigger: Capability[]; asAction: Capability[] } {
  const all = capabilitiesData.capabilities
  return {
    asTrigger: all.filter((c) => c.trigger_service === serviceId),
    asAction: all.filter((c) => c.action_service === serviceId),
  }
}

function getConnectedServices(serviceId: string): Service[] {
  const caps = capabilitiesData.capabilities
  const connectedIds = new Set<string>()
  caps.forEach((c) => {
    if (c.trigger_service === serviceId && c.action_service) connectedIds.add(c.action_service)
    if (c.action_service === serviceId && c.trigger_service) connectedIds.add(c.trigger_service)
  })
  connectedIds.delete(serviceId)
  return servicesData.services.filter((s) => connectedIds.has(s.id) && !logicServices.includes(s.id))
}

function serviceName(id: string | undefined): string {
  if (!id) return 'Unknown'
  return servicesData.services.find((s) => s.id === id)?.name || id
}

// CRM workflow examples per service category
const CRM_WORKFLOWS: Record<string, { trigger: string; action: string; result: string }[]> = {
  stripe: [
    { trigger: 'Payment received in Stripe', action: 'Create CRM contact + move to "Paid" pipeline stage', result: 'Automatic lead-to-customer conversion' },
    { trigger: 'Subscription canceled in Stripe', action: 'Tag CRM contact "churned" + trigger win-back workflow', result: 'Automated retention campaigns' },
    { trigger: 'New CRM opportunity created', action: 'Generate Stripe invoice + send payment link', result: 'Sales pipeline to revenue in seconds' },
  ],
  slack: [
    { trigger: 'New CRM lead submitted', action: 'Post to #leads channel with action buttons', result: 'Team sees and responds to leads in real-time' },
    { trigger: '/0n command in Slack', action: 'Score lead, book appointment, or send SMS via CRM', result: 'Run your CRM from Slack' },
    { trigger: 'CRM deal stage changed', action: 'Notify #sales channel with deal details', result: 'Revenue pipeline visible to entire team' },
  ],
  sendgrid: [
    { trigger: 'CRM tag added "newsletter"', action: 'Add to SendGrid contact list + trigger welcome series', result: 'Automatic email list management' },
    { trigger: 'SendGrid email opened', action: 'Update CRM contact engagement score', result: 'AI-powered lead scoring from email behavior' },
    { trigger: 'CRM form submitted', action: 'Send branded confirmation via SendGrid', result: 'Professional transactional emails' },
  ],
  supabase: [
    { trigger: 'New CRM contact created', action: 'Create Supabase user profile + app access', result: 'Automatic customer portal provisioning' },
    { trigger: 'Supabase user action logged', action: 'Update CRM contact timeline + engagement score', result: 'Product usage drives CRM intelligence' },
    { trigger: 'CRM opportunity won', action: 'Provision Supabase database for customer', result: 'Automated SaaS onboarding' },
  ],
  github: [
    { trigger: 'GitHub issue created', action: 'Create CRM task + notify support team', result: 'Bug reports become trackable CRM tasks' },
    { trigger: 'PR merged to main', action: 'Post to CRM timeline + trigger deployment notification', result: 'Development milestones tracked in CRM' },
    { trigger: 'CRM feature request tagged', action: 'Create GitHub issue + assign team', result: 'Customer feedback to dev pipeline' },
  ],
  default: [
    { trigger: 'Event in this service', action: 'Create or update CRM contact + log activity', result: 'Every touchpoint tracked in your CRM' },
    { trigger: 'CRM workflow triggers', action: 'Execute action in this service', result: 'CRM becomes the orchestration hub' },
    { trigger: 'Data changes in either system', action: 'Bidirectional sync keeps both systems current', result: 'Single source of truth across your stack' },
  ],
}

function getCRMWorkflows(serviceId: string) {
  return CRM_WORKFLOWS[serviceId] || CRM_WORKFLOWS.default
}

export async function generateStaticParams() {
  return servicesData.services
    .filter((s) => !logicServices.includes(s.id))
    .map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = findService(slug)
  if (!service) return { title: 'Integration Not Found — 0nMCP' }

  const caps = getCapabilities(service.id)
  const total = caps.asTrigger.length + caps.asAction.length
  const title = `${service.name} + CRM + AI — Connect Everything | 0nMCP`
  const description = `Connect ${service.name} to your CRM and ${total > 0 ? total + ' automations across ' : ''}55 services. ${service.tool_count} tools. AI-powered. No code required.`

  return {
    title,
    description: description.slice(0, 155),
    openGraph: { title, description: description.slice(0, 155), url: `https://www.0nmcp.com/integrations/${service.slug}` },
    alternates: { canonical: `https://www.0nmcp.com/integrations/${service.slug}` },
  }
}

export default async function IntegrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = findService(slug)
  if (!service) notFound()

  const caps = getCapabilities(service.id)
  const connected = getConnectedServices(service.id)
  const totalCaps = caps.asTrigger.length + caps.asAction.length
  const tools = (service as unknown as { tools?: Tool[] }).tools || []
  const crmWorkflows = getCRMWorkflows(service.id)

  const howToJsonLd = {
    '@context': 'https://schema.org', '@type': 'HowTo',
    name: `How to connect ${service.name} with 0nMCP`,
    description: `Set up ${service.name} integration with AI-powered orchestration in minutes.`,
    step: [
      { '@type': 'HowToStep', name: 'Install', text: 'npx 0nmcp@latest' },
      { '@type': 'HowToStep', name: 'Connect', text: `Import your ${service.name} API key with 0nmcp engine import` },
      { '@type': 'HowToStep', name: 'Automate', text: `Describe what you want in natural language — 0nMCP handles the rest` },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Integrations', item: 'https://www.0nmcp.com/integrations' },
      { '@type': 'ListItem', position: 3, name: service.name, item: `https://www.0nmcp.com/integrations/${service.slug}` },
    ],
  }

  return (
    <div className="homepage">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── HERO ── */}
      <section className="hero-section" style={{ minHeight: '50vh', paddingTop: '7rem' }}>
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-content">
          <nav className="text-xs mb-6 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
            <Link href="/" className="hover:underline" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <span>/</span>
            <Link href="/integrations" className="hover:underline" style={{ color: 'var(--text-muted)' }}>Integrations</Link>
            <span>/</span>
            <span style={{ color: 'var(--accent)' }}>{service.name}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ServiceIcon id={service.id} size={32} />
            </div>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 300 }}>+</span>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(110,224,90,0.06)', border: '1px solid rgba(110,224,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              CRM
            </div>
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 300 }}>+</span>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#00d4ff', fontFamily: 'var(--font-mono)' }}>
              54+
            </div>
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            <span className="hero-title-accent">{service.name}</span> + CRM<br />
            + Everything Else
          </h1>

          <p className="hero-subtitle">
            {service.tool_count} tools. {totalCaps} automations. Connect {service.name} to your CRM and {STATS_DISPLAY.services} other services through one AI orchestrator.
          </p>

          <div className="hero-install">
            <code>npx 0nmcp@latest</code>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-bar">
        <div className="stats-bar-inner">
          <div className="stat-item">
            <span className="stat-value">{service.tool_count}</span>
            <span className="stat-label">{service.name} Tools</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{totalCaps}</span>
            <span className="stat-label">Automations</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{connected.length}</span>
            <span className="stat-label">Connected Services</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">245</span>
            <span className="stat-label">CRM Tools</span>
          </div>
        </div>
      </section>

      {/* ── CRM BRIDGE — THE MONEY SECTION ── */}
      <section className="section-container" style={{ padding: '5rem 1.5rem' }}>
        <h2 className="section-label">The CRM Bridge</h2>
        <p className="section-desc">{service.name} + CRM = Fully automated business</p>

        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Visual bridge diagram */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            marginBottom: '2.5rem', padding: '1.5rem', borderRadius: 16,
            background: 'rgba(110,224,90,0.03)', border: '1px solid rgba(110,224,90,0.1)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.375rem' }}>
                <ServiceIcon id={service.id} size={24} />
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{service.name}</span>
            </div>
            <div style={{ flex: 1, maxWidth: 120, height: 2, background: 'linear-gradient(to right, var(--border), var(--accent), var(--border))' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, rgba(110,224,90,0.1), rgba(0,212,255,0.1))', border: '1px solid rgba(110,224,90,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.375rem', fontWeight: 900, fontSize: '0.6875rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                0nMCP
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--accent)', fontWeight: 600 }}>Orchestrator</span>
            </div>
            <div style={{ flex: 1, maxWidth: 120, height: 2, background: 'linear-gradient(to right, var(--border), var(--accent), var(--border))' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.375rem', fontWeight: 800, fontSize: '0.6875rem', color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>
                CRM
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>245 tools</span>
            </div>
          </div>

          {/* CRM workflow examples */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {crmWorkflows.map((wf, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '1.25rem', transition: 'border-color 0.3s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00d4ff', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>Trigger</div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>{wf.trigger}</p>
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--accent)', alignSelf: 'center' }}>→</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>Action</div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>{wf.action}</p>
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--accent)', alignSelf: 'center' }}>=</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>Result</div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>{wf.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOLS LIST ── */}
      {tools.length > 0 && (
        <section className="section-container" style={{ padding: '5rem 1.5rem' }}>
          <h2 className="section-label">{service.name} Tools</h2>
          <p className="section-desc">{service.tool_count} tools available through 0nMCP</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem', maxWidth: 900, margin: '0 auto' }}>
            {tools.map((tool) => (
              <div key={tool.id} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '1rem',
              }}>
                <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>{tool.name}</h3>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{tool.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── AUTOMATIONS ── */}
      {(caps.asTrigger.length > 0 || caps.asAction.length > 0) && (
        <section className="section-container" style={{ padding: '5rem 1.5rem' }}>
          <h2 className="section-label">Pre-Built Automations</h2>
          <p className="section-desc">{totalCaps} ready-to-use workflows</p>

          <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: caps.asTrigger.length > 0 && caps.asAction.length > 0 ? '1fr 1fr' : '1fr', gap: '2rem' }}>
            {caps.asTrigger.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00d4ff', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
                  When {service.name} triggers...
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {caps.asTrigger.slice(0, 8).map((cap) => (
                    <Link key={cap.slug} href={`/turn-it-on/${cap.slug}`} style={{
                      display: 'block', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '0.75rem 1rem', textDecoration: 'none', transition: 'border-color 0.2s',
                    }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{cap.name}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{service.name} → {serviceName(cap.action_service)}</span>
                    </Link>
                  ))}
                  {caps.asTrigger.length > 8 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>+{caps.asTrigger.length - 8} more</span>
                  )}
                </div>
              </div>
            )}

            {caps.asAction.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a78bfa', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>
                  ...sends to {service.name}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {caps.asAction.slice(0, 8).map((cap) => (
                    <Link key={cap.slug} href={`/turn-it-on/${cap.slug}`} style={{
                      display: 'block', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '0.75rem 1rem', textDecoration: 'none', transition: 'border-color 0.2s',
                    }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{cap.name}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{serviceName(cap.trigger_service)} → {service.name}</span>
                    </Link>
                  ))}
                  {caps.asAction.length > 8 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>+{caps.asAction.length - 8} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CONNECTED SERVICES ── */}
      {connected.length > 0 && (
        <section className="section-container" style={{ padding: '3rem 1.5rem' }}>
          <h2 className="section-label">Connected Services</h2>
          <p className="section-desc">{service.name} works with {connected.length} other services</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: 800, margin: '0 auto' }}>
            {connected.map((s) => (
              <Link key={s.slug} href={`/integrations/${s.slug}`} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem', borderRadius: 9999, background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)', textDecoration: 'none', fontSize: '0.75rem',
                color: 'var(--text-secondary)', fontWeight: 600, transition: 'border-color 0.2s, color 0.2s',
              }}>
                <ServiceIcon id={s.id} size={14} />
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── SETUP ── */}
      <section className="steps-section section-container">
        <h2 className="section-label">Setup</h2>
        <p className="section-desc">Three steps. Under two minutes.</p>

        <div className="steps-grid">
          {[
            { num: '01', title: 'Install', desc: 'One command installs 900+ tools across 55 services.', code: 'npx 0nmcp@latest' },
            { num: '02', title: 'Connect', desc: `Import your ${service.name} API key. Auto-detected from .env files.`, code: '0nmcp engine import' },
            { num: '03', title: 'Automate', desc: 'Tell your AI what you want. 0nMCP handles the API calls.', code: `"When ${service.name} fires, update my CRM and notify Slack"` },
          ].map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-num">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
              <div className="step-code"><code>{step.code}</code></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AFFILIATE CTA ── */}
      <section className="section-container" style={{ padding: '3rem 1.5rem' }}>
        <div className="affiliate-banner">
          <div className="affiliate-content">
            <h3>Don&apos;t have {service.name} yet?</h3>
            <p>Sign up for {service.name} and connect it to 0nMCP in minutes.</p>
          </div>
          <a href={`https://0nmcp.com/go/${service.slug}`} className="affiliate-cta" target="_blank" rel="noopener noreferrer">
            Get {service.name} →
          </a>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section section-container">
        <h2 className="section-label">FAQ</h2>
        <div className="faq-grid">
          {[
            { q: `How do I connect ${service.name} to my CRM?`, a: `Install 0nMCP (npx 0nmcp@latest), import your ${service.name} API key, and import your CRM credentials. 0nMCP bridges them — ${service.name} events trigger CRM actions and vice versa. 245 CRM tools + ${service.tool_count} ${service.name} tools = unlimited automations.` },
            { q: `What can I automate with ${service.name}?`, a: `0nMCP provides ${service.tool_count} ${service.name} tools and ${totalCaps} pre-built automations. Connect to ${connected.length} other services including CRM, Stripe, Slack, and more. Describe what you want in natural language — 0nMCP handles the API calls.` },
            { q: 'Is this free?', a: '0nMCP is open source (MIT). Local use is completely free. The managed 0nCore platform starts at $80/mo with CRM integration, AI assistant, and web dashboard.' },
            { q: `Does this replace Zapier for ${service.name}?`, a: `Yes. Zapier connects apps to apps with predefined triggers. 0nMCP connects apps to AI — describe any workflow in natural language and it executes. No "zap" templates needed. Plus, 0nMCP is free for local use vs Zapier's $20+/mo.` },
          ].map((item) => (
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
          Connect {service.name}.<br />
          <span className="hero-title-accent">Automate everything.</span>
        </h2>
        <p className="final-cta-subtitle">
          {service.tool_count} tools. {STATS_DISPLAY.services} services. One install.
        </p>
        <div className="hero-ctas" style={{ justifyContent: 'center' }}>
          <Link href="/signup" className="hero-cta-primary">
            Get Started Free
          </Link>
          <Link href="/integrations" className="hero-cta-secondary">
            ← All Integrations
          </Link>
        </div>
      </section>
    </div>
  )
}
