import type { Metadata } from 'next'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'

export const metadata: Metadata = {
  title: 'Examples — Real .0n Workflow Files | 0nMCP',
  description:
    'Production-ready .0n workflow examples: client onboarding pipelines, domain availability checks, and full website factory automation. Copy, customize, and run with 0nMCP.',
  openGraph: {
    title: 'Examples — Real .0n Workflow Files | 0nMCP',
    description:
      'Production-ready .0n workflow examples you can copy and run. Client onboarding, domain checks, website factories.',
    url: 'https://0nmcp.com/examples',
  },
  alternates: { canonical: 'https://0nmcp.com/examples' },
}

const examples = [
  {
    id: 'domain-check',
    name: 'Domain Check',
    file: 'domain-check.0n',
    description:
      'Quick domain availability check with auto-suggestions if unavailable.',
    steps: 2,
    services: ['GoDaddy'],
    tags: ['domain', 'quick-check'],
    tier: 'starter',
    time: '~5 seconds',
    code: `{
  "version": "0.2",
  "name": "domain-check",
  "description": "Quick domain availability check with auto-suggestions if unavailable",
  "author": "mike@rocketopp.com",

  "variables": {
    "client_domain": "",
    "client_name": ""
  },

  "steps": [
    {
      "id": "step_001",
      "name": "Check Primary Domain",
      "mcp_server": "godaddy",
      "tool": "domains_check_availability",
      "inputs": {
        "domains": "{{variables.client_domain}}"
      },
      "outputs": {
        "domain_available": "$.available",
        "domain_price": "$.price"
      },
      "on_fail": "halt",
      "timeout_seconds": 30
    },
    {
      "id": "step_002",
      "name": "Suggest Alternatives",
      "mcp_server": "godaddy",
      "tool": "domains_suggest",
      "condition": "{{step_001.outputs.domain_available}} == false",
      "inputs": {
        "query": "{{variables.client_name}}",
        "limit": 20
      },
      "outputs": {
        "suggestions": "$.domains"
      },
      "on_fail": "skip",
      "timeout_seconds": 30
    }
  ],

  "metadata": {
    "pipeline": "website-factory",
    "environment": "production",
    "tags": ["domain", "quick-check"]
  }
}`,
  },
  {
    id: 'client-onboard',
    name: 'Client Onboarding',
    file: 'client-onboard.0n',
    description:
      'Client onboarding pipeline: Stripe billing setup + Vercel deployment check + welcome deck + CRM workflow.',
    steps: 7,
    services: ['Vercel', 'Stripe', 'Gamma', 'n8n'],
    tags: ['onboarding', 'billing', 'crm'],
    tier: 'pro',
    time: '~2 minutes',
    code: `{
  "version": "0.2",
  "name": "client-onboard",
  "description": "Client onboarding pipeline: Stripe billing setup + Vercel deployment check + welcome deck + n8n CRM workflow",
  "author": "mike@rocketopp.com",

  "env": {
    "VERCEL_TEAM_ID": "$env.VERCEL_TEAM_ID",
    "N8N_WEBHOOK_BASE": "$env.N8N_WEBHOOK_BASE"
  },

  "variables": {
    "client_name": "",
    "client_email": "",
    "client_domain": "",
    "vercel_project_id": "",
    "monthly_price": 299,
    "industry": "",
    "service_area": ""
  },

  "steps": [
    {
      "id": "step_001",
      "name": "Verify Vercel Deployment",
      "mcp_server": "vercel",
      "tool": "get_project",
      "inputs": {
        "projectId": "{{variables.vercel_project_id}}",
        "teamId": "{{env.VERCEL_TEAM_ID}}"
      },
      "outputs": {
        "project_name": "$.name",
        "production_url": "$.targets.production.url",
        "framework": "$.framework"
      },
      "on_fail": "halt",
      "timeout_seconds": 30
    },
    {
      "id": "step_002",
      "name": "Create Stripe Customer",
      "mcp_server": "stripe",
      "tool": "create_customer",
      "inputs": {
        "name": "{{variables.client_name}}",
        "email": "{{variables.client_email}}",
        "metadata": {
          "domain": "{{variables.client_domain}}",
          "pipeline": "client-onboard"
        }
      },
      "outputs": { "customer_id": "$.id" },
      "on_fail": "halt",
      "parallel_group": "setup"
    },
    {
      "id": "step_003",
      "name": "Create Subscription Product",
      "mcp_server": "stripe",
      "tool": "create_product",
      "inputs": {
        "name": "{{variables.client_name}} - Website Package",
        "description": "Monthly website hosting, management, and optimization"
      },
      "outputs": { "product_id": "$.id" },
      "on_fail": "halt",
      "parallel_group": "setup"
    },
    {
      "id": "step_004",
      "name": "Create Monthly Price",
      "mcp_server": "stripe",
      "tool": "create_price",
      "depends_on": ["step_003"],
      "inputs": {
        "product": "{{step_003.outputs.product_id}}",
        "unit_amount": "{{variables.monthly_price}}00",
        "currency": "usd",
        "recurring": { "interval": "month" }
      },
      "outputs": { "price_id": "$.id" }
    },
    {
      "id": "step_005",
      "name": "Create Subscription",
      "mcp_server": "stripe",
      "tool": "create_subscription",
      "depends_on": ["step_002", "step_004"],
      "inputs": {
        "customer": "{{step_002.outputs.customer_id}}",
        "items": [{ "price": "{{step_004.outputs.price_id}}" }],
        "collection_method": "send_invoice",
        "days_until_due": 30
      },
      "outputs": {
        "subscription_id": "$.id",
        "subscription_status": "$.status"
      }
    },
    {
      "id": "step_006",
      "name": "Generate Welcome Presentation",
      "mcp_server": "gamma",
      "tool": "generate",
      "depends_on": ["step_001"],
      "inputs": {
        "inputText": "Welcome aboard {{variables.client_name}}! Your site at {{step_001.outputs.production_url}} is live.",
        "format": "presentation",
        "numCards": 6
      },
      "outputs": { "deck_url": "$.url" },
      "on_fail": "skip"
    },
    {
      "id": "step_007",
      "name": "Trigger CRM Onboarding",
      "mcp_server": "n8n",
      "tool": "execute_workflow",
      "depends_on": ["step_005", "step_006"],
      "inputs": {
        "workflowId": "client-onboarding-crm",
        "inputs": {
          "type": "webhook",
          "webhookData": {
            "method": "POST",
            "body": {
              "client_name": "{{variables.client_name}}",
              "stripe_customer_id": "{{step_002.outputs.customer_id}}",
              "welcome_deck": "{{step_006.outputs.deck_url}}"
            }
          }
        }
      },
      "on_fail": "retry:2"
    }
  ],

  "on_complete": {
    "notify": "slack:#client-onboarding",
    "log": true
  },

  "metadata": {
    "pipeline": "client-onboard",
    "cro9_analytics": true,
    "sxo_optimized": true,
    "tags": ["onboarding", "billing", "crm"]
  }
}`,
  },
  {
    id: 'website-factory',
    name: 'Website Factory',
    file: 'website-factory.0n',
    description:
      'Full website factory pipeline: domain check, site deploy, DNS config, Stripe billing, analytics setup, client deck generation.',
    steps: 9,
    services: ['GoDaddy', 'ZoomInfo', 'Vercel', 'Stripe', 'Gamma', 'n8n'],
    tags: ['client-site', 'full-pipeline', 'auto-billing'],
    tier: 'burst',
    time: '~4 minutes',
    code: `{
  "version": "0.2",
  "name": "website-factory-full",
  "description": "Full RocketOpp website factory pipeline: domain check > site deploy > DNS config > Stripe billing > analytics setup > client deck generation",
  "author": "mike@rocketopp.com",

  "env": {
    "VERCEL_TEAM_ID": "$env.VERCEL_TEAM_ID",
    "SUPABASE_PROJECT_URL": "$env.SUPABASE_PROJECT_URL",
    "ANALYTICS_ENDPOINT": "$env.ANALYTICS_ENDPOINT",
    "N8N_WEBHOOK_BASE": "$env.N8N_WEBHOOK_BASE"
  },

  "variables": {
    "client_name": "",
    "client_domain": "",
    "client_email": "",
    "brand_primary_color": "#1a1a2e",
    "brand_accent_color": "#0f3460",
    "template_id": "nextjs-rocketopp-starter",
    "industry": "",
    "service_area": "",
    "monthly_price": 299
  },

  "steps": [
    {
      "id": "step_001",
      "name": "Check Domain Availability",
      "mcp_server": "godaddy",
      "tool": "domains_check_availability",
      "inputs": { "domains": "{{variables.client_domain}}" },
      "outputs": {
        "domain_available": "$.available",
        "domain_price": "$.price"
      },
      "on_fail": "halt"
    },
    {
      "id": "step_002",
      "name": "Generate Domain Alternatives",
      "mcp_server": "godaddy",
      "tool": "domains_suggest",
      "condition": "{{step_001.outputs.domain_available}} == false",
      "inputs": {
        "query": "{{variables.client_name}} {{variables.industry}}",
        "limit": 10
      },
      "on_fail": "skip"
    },
    {
      "id": "step_003",
      "name": "Enrich Client Data",
      "mcp_server": "zoominfo",
      "tool": "search_company",
      "inputs": {
        "company_name": "{{variables.client_name}}",
        "location": "{{variables.service_area}}"
      },
      "on_fail": "skip",
      "parallel_group": "research"
    },
    {
      "id": "step_004",
      "name": "Deploy Next.js Site to Vercel",
      "mcp_server": "vercel",
      "tool": "deploy_to_vercel",
      "depends_on": ["step_001"],
      "condition": "{{step_001.outputs.domain_available}} == true",
      "outputs": {
        "deployment_url": "$.url",
        "project_id": "$.projectId"
      },
      "on_fail": "retry:3",
      "timeout_seconds": 180
    },
    {
      "id": "step_005",
      "name": "Configure Environment Variables",
      "mcp_server": "n8n",
      "tool": "execute_workflow",
      "depends_on": ["step_004"],
      "inputs": {
        "workflowId": "vercel-env-setup",
        "inputs": {
          "type": "webhook",
          "webhookData": {
            "body": {
              "project_id": "{{step_004.outputs.project_id}}",
              "env_vars": {
                "NEXT_PUBLIC_CRO9_ENABLED": "true",
                "NEXT_PUBLIC_BRAND_PRIMARY": "{{variables.brand_primary_color}}",
                "NEXT_PUBLIC_BRAND_ACCENT": "{{variables.brand_accent_color}}"
              }
            }
          }
        }
      },
      "on_fail": "retry:2"
    },
    {
      "id": "step_006",
      "name": "Create Stripe Product",
      "mcp_server": "stripe",
      "tool": "create_product",
      "depends_on": ["step_004"],
      "inputs": {
        "name": "{{variables.client_name}} - Website Management",
        "metadata": {
          "client_domain": "{{variables.client_domain}}",
          "pipeline": "website-factory"
        }
      },
      "outputs": { "product_id": "$.id" },
      "parallel_group": "billing"
    },
    {
      "id": "step_007",
      "name": "Create Stripe Price",
      "mcp_server": "stripe",
      "tool": "create_price",
      "depends_on": ["step_006"],
      "inputs": {
        "product": "{{step_006.outputs.product_id}}",
        "unit_amount": "{{variables.monthly_price}}00",
        "currency": "usd",
        "recurring": { "interval": "month" }
      },
      "outputs": { "price_id": "$.id" }
    },
    {
      "id": "step_008",
      "name": "Generate Client Welcome Deck",
      "mcp_server": "gamma",
      "tool": "generate",
      "depends_on": ["step_004", "step_006"],
      "inputs": {
        "inputText": "Client welcome presentation for {{variables.client_name}}. Site: {{step_004.outputs.deployment_url}}. Features: CRO9 analytics, SXO optimization, monthly reports.",
        "format": "presentation",
        "numCards": 8
      },
      "outputs": { "deck_url": "$.url" },
      "on_fail": "skip"
    },
    {
      "id": "step_009",
      "name": "Trigger Client Onboarding",
      "mcp_server": "n8n",
      "tool": "execute_workflow",
      "depends_on": ["step_004", "step_007", "step_008"],
      "inputs": {
        "workflowId": "client-onboarding-master",
        "inputs": {
          "type": "webhook",
          "webhookData": {
            "body": {
              "client_name": "{{variables.client_name}}",
              "deployment_url": "{{step_004.outputs.deployment_url}}",
              "stripe_price_id": "{{step_007.outputs.price_id}}",
              "welcome_deck_url": "{{step_008.outputs.deck_url}}"
            }
          }
        }
      },
      "on_fail": "retry:2"
    }
  ],

  "on_complete": {
    "notify": "slack:#website-factory-deployments",
    "log": true
  },

  "metadata": {
    "pipeline": "website-factory",
    "cro9_analytics": true,
    "sxo_optimized": true,
    "tags": ["client-site", "full-pipeline", "auto-billing"]
  }
}`,
  },
]

const tierColors: Record<string, { color: string; bg: string; border: string }> = {
  starter: { color: '#00ff88', bg: 'rgba(0, 255, 136, 0.1)', border: 'rgba(0, 255, 136, 0.2)' },
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
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.2)',
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
                .0n Schema v0.2
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { field: 'version', desc: 'Schema version' },
              { field: 'variables', desc: 'Runtime inputs' },
              { field: 'steps[]', desc: 'Execution steps' },
              { field: 'depends_on', desc: 'Step dependencies' },
              { field: 'on_fail', desc: 'Error strategy' },
              { field: 'metadata', desc: 'Pipeline tags' },
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
            Create .0n files that orchestrate any of our 48 services.
            Describe outcomes, not steps.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div
              className="inline-flex items-center gap-3 px-6 py-4 rounded-xl"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--accent)',
                boxShadow: '0 0 30px rgba(0, 255, 136, 0.1)',
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
