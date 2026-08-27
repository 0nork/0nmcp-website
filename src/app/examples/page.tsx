import type { Metadata } from 'next'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'
import { STATS_DISPLAY } from '@/data/stats'
import domainCheck from '@/data/examples/domain-check.json'
import clientOnboard from '@/data/examples/client-onboard.json'
import websiteFactory from '@/data/examples/website-factory.json'

export const metadata: Metadata = {
  title: 'Examples — Real .0n Workflow Files | 0nMCP',
  description:
    'Production-ready .0n workflow examples: client onboarding pipelines, domain availability checks, and full website factory automation. Copy, customize, and run with 0nMCP.',
  openGraph: {
    title: 'Examples — Real .0n Workflow Files | 0nMCP',
    description:
      'Production-ready .0n workflow examples you can copy and run. Client onboarding, domain checks, website factories.',
    url: 'https://www.0nmcp.com/examples',
  },
  alternates: { canonical: 'https://www.0nmcp.com/examples' },
}

/**
 * The workflow JSON is the single source: the page renders it, the visitor copies it,
 * and tools/examples-validate.mjs runs the same files against the live WorkflowRunner.
 * Step counts and service chips are DERIVED — the previous hand-maintained copies
 * advertised Vercel, Gamma and ZoomInfo, none of which the orchestrator can run.
 */
const SERVICE_LABELS: Record<string, string> = {
  godaddy: 'GoDaddy',
  stripe: 'Stripe',
  netlify: 'Netlify',
  notion: 'Notion',
  hubspot: 'HubSpot',
  slack: 'Slack',
  n8n: 'n8n',
}

type Workflow = { steps: { id: string; service: string; action: string }[] }

function describe(wf: Workflow) {
  const services = [...new Set(wf.steps.map((s) => s.service).filter((s) => s !== 'internal'))]
  return {
    steps: wf.steps.length,
    services: services.map((s) => SERVICE_LABELS[s] ?? s),
    code: JSON.stringify(wf, null, 2),
  }
}

const examples = [
  {
    id: 'domain-check',
    name: 'Domain Check',
    file: 'domain-check.0n',
    description:
      'Quick domain availability check, with alternatives generated only when the domain is taken.',
    tags: ['domain', 'quick-check'],
    tier: 'starter',
    time: '~5 seconds',
    ...describe(domainCheck as Workflow),
  },
  {
    id: 'client-onboard',
    name: 'Client Onboarding',
    file: 'client-onboard.0n',
    description:
      'Client onboarding pipeline: verify the live site, set up Stripe billing, publish a welcome doc, then hand off to the CRM.',
    tags: ['onboarding', 'billing', 'crm'],
    tier: 'pro',
    time: '~2 minutes',
    ...describe(clientOnboard as Workflow),
  },
  {
    id: 'website-factory',
    name: 'Website Factory',
    file: 'website-factory.0n',
    description:
      'Full website factory: domain check, CRM enrichment, site deploy, Stripe billing, client deck, CRM handoff, team notification.',
    tags: ['client-site', 'full-pipeline', 'auto-billing'],
    tier: 'burst',
    time: '~4 minutes',
    ...describe(websiteFactory as Workflow),
  },
]

const tierColors: Record<string, { color: string; bg: string; border: string }> = {
  starter: { color: '#6EE05A', bg: 'rgba(110, 224, 90, 0.1)', border: 'rgba(110, 224, 90, 0.2)' },
  pro: { color: '#00d4ff', bg: 'rgba(0, 212, 255, 0.1)', border: 'rgba(0, 212, 255, 0.2)' },
  burst: { color: '#ff6b35', bg: 'rgba(255, 107, 53, 0.1)', border: 'rgba(255, 107, 53, 0.2)' },
}

export default function ExamplesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="section-container text-center">
          <div className="inline-block mb-6">
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                backgroundColor: 'rgba(110, 224, 90, 0.1)',
                border: '1px solid rgba(110, 224, 90, 0.2)',
              }}
            >
              .0n Files
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ letterSpacing: '-0.03em' }}
          >
            Real{' '}
            <span style={{ color: 'var(--accent)' }}>Workflow Examples</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Production-ready .0n files you can copy, customize, and run.
            Each one orchestrates multiple services through a single config.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8">
            <StatBlock value="3" label="Examples" />
            <StatBlock value="18" label="Steps" />
            <StatBlock value="6" label="Services" />
          </div>
        </div>
      </section>

      {/* Schema Reference */}
      <section
        className="py-12"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <span
                className="font-mono text-xs uppercase tracking-[0.15em] block mb-2"
                style={{ color: 'var(--accent)' }}
              >
                .0n Schema v1.0
              </span>
              <h2 className="text-xl font-bold">File Anatomy</h2>
            </div>
            <Link
              href="/0n-standard"
              className="text-sm"
              style={{ color: 'var(--accent)' }}
            >
              Full specification &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { field: '$0n', desc: 'Envelope: type + version' },
              { field: 'inputs', desc: 'Declared runtime inputs' },
              { field: 'steps[]', desc: 'Runs in array order' },
              { field: 'service / action', desc: 'What to call' },
              { field: 'params', desc: 'Arguments for the call' },
              { field: 'conditions', desc: 'Bare {{ref}} gate' },
              { field: 'error_handling', desc: 'stop | continue | retry' },
              { field: 'outputs', desc: 'Workflow return map' },
            ].map((item) => (
              <div
                key={item.field}
                className="px-4 py-3 rounded-lg text-center"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <code
                  className="text-xs font-bold block mb-1"
                  style={{
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {item.field}
                </code>
                <span
                  className="text-[10px] block"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples */}
      {examples.map((example, index) => {
        const tier = tierColors[example.tier]
        return (
          <section
            key={example.id}
            className="py-16"
            id={example.id}
            style={
              index % 2 === 0
                ? {}
                : {
                    backgroundColor: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                  }
            }
          >
            <div className="section-container">
              {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2
                      className="text-2xl md:text-3xl font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {example.name}
                    </h2>
                    <span
                      className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: tier.color,
                        backgroundColor: tier.bg,
                        border: `1px solid ${tier.border}`,
                      }}
                    >
                      {example.tier}
                    </span>
                  </div>
                  <p
                    className="text-sm max-w-xl"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {example.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: tier.color,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {example.steps}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Steps
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: tier.color,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {example.services.length}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Services
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-sm font-bold"
                      style={{
                        color: tier.color,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {example.time}
                    </div>
                    <div
                      className="text-[10px] uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Runtime
                    </div>
                  </div>
                </div>
              </div>

              {/* Service badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {example.services.map((svc) => (
                  <span
                    key={svc}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {svc}
                  </span>
                ))}
                {example.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: tier.bg,
                      border: `1px solid ${tier.border}`,
                      color: tier.color,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Code block */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Header bar */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#ff5f57' }}
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#febc2e' }}
                      />
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#28c840' }}
                      />
                    </div>
                    <span
                      className="text-xs ml-3"
                      style={{
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {example.file}
                    </span>
                  </div>
                  <CopyButton text={example.code} display="Copy" />
                </div>

                {/* Code */}
                <pre
                  className="p-6 overflow-x-auto text-sm leading-relaxed max-h-[500px] overflow-y-auto"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <code>{example.code}</code>
                </pre>
              </div>
            </div>
          </section>
        )
      })}

      {/* Bottom CTA */}
      <section className="py-20">
        <div className="section-container text-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Build your own
          </h2>
          <p
            className="text-lg mb-8 max-w-lg mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Create .0n files that orchestrate any of our {STATS_DISPLAY.services} services.
            Describe outcomes, not steps.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div
              className="inline-flex items-center gap-3 px-6 py-4 rounded-xl"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--accent)',
                boxShadow: '0 0 30px rgba(110, 224, 90, 0.1)',
              }}
            >
              <span
                className="text-lg font-bold"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent)',
                }}
              >
                npx 0nmcp
              </span>
            </div>
            <Link href="/0n-standard" className="btn-ghost">
              Read the .0n spec &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="text-3xl md:text-4xl font-bold glow-text"
        style={{
          color: 'var(--accent)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {value}
      </div>
      <div
        className="text-xs uppercase tracking-widest mt-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </div>
    </div>
  )
}
