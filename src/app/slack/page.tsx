/**
 * /slack — Add to Slack landing page
 *
 * Features:
 * - App description
 * - "Add to Slack" button
 * - Feature list
 * - Success/error states from OAuth callback
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '0nMCP for Slack -- Universal AI Orchestrator in Your Workspace',
  description:
    'Install 0nMCP in your Slack workspace. Run AI workflows, manage integrations, and orchestrate APIs -- all from Slack.',
}

function SuccessBanner({ team }: { team: string }) {
  return (
    <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 mb-8">
      <p className="text-green-400 font-medium">
        0nMCP has been installed to {team ? `the "${team}" workspace` : 'your workspace'}.
      </p>
      <p className="text-[var(--text-muted)] text-sm mt-1">
        Try typing <code className="bg-[var(--bg-card)] px-1 py-0.5 rounded text-[var(--text-secondary)]">/0n</code> in any channel to get started.
      </p>
    </div>
  )
}

function ErrorBanner({ error }: { error: string }) {
  const messages: Record<string, string> = {
    access_denied: 'Installation was cancelled.',
    no_code: 'No authorization code received.',
    token_exchange_failed: 'Could not complete the OAuth flow. Please try again.',
    oauth_failed: 'Slack returned an error during authorization.',
    missing_data: 'Incomplete installation data received.',
  }
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 mb-8">
      <p className="text-red-400 font-medium">
        Installation failed: {messages[error] || error}
      </p>
    </div>
  )
}

export default async function SlackPage({
  searchParams,
}: {
  searchParams: Promise<{ installed?: string; team?: string; error?: string }>
}) {
  const params = await searchParams
  const installed = params.installed === 'true'
  const team = params.team || ''
  const error = params.error || ''

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        {installed && <SuccessBanner team={team} />}
        {error && <ErrorBanner error={error} />}

        <h1 className="text-4xl font-bold mb-4">0nMCP for Slack</h1>
        <p className="text-[var(--text-secondary)] text-lg mb-10">
          Universal AI API Orchestrator -- right in your workspace.
          Run workflows, query services, and manage integrations without leaving Slack.
        </p>

        {/* Add to Slack Button */}
        <a
          href="/api/slack/install"
          className="inline-flex items-center gap-3 rounded-lg px-6 py-3 font-medium text-white transition-colors mb-12"
          style={{ backgroundColor: '#4A154B' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 122.8 122.8"
            width="22"
            height="22"
          >
            <path
              d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
              fill="#E01E5A"
            />
            <path
              d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
              fill="#36C5F0"
            />
            <path
              d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
              fill="#2EB67D"
            />
            <path
              d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
              fill="#ECB22E"
            />
          </svg>
          Add to Slack
        </a>

        {/* Features */}
        <h2 className="text-2xl font-semibold mb-6">What You Can Do</h2>
        <div className="grid gap-4 sm:grid-cols-2 mb-12">
          {[
            {
              title: 'Slash Commands',
              desc: 'Type /0n to run workflows, check status, and manage connections.',
            },
            {
              title: 'Mention the Bot',
              desc: '@0nMCP in any channel to ask questions or trigger actions.',
            },
            {
              title: 'Direct Messages',
              desc: 'DM the bot for private conversations and workflow execution.',
            },
            {
              title: 'AI-Powered Execution',
              desc: 'Describe tasks in plain English. 0nMCP maps them to the right tools.',
            },
            {
              title: 'Multi-Service',
              desc: 'Stripe, CRM, SendGrid, GitHub, Shopify, and 97 more services.',
            },
            {
              title: 'Secure',
              desc: 'All requests verified with HMAC-SHA256. Credentials never leave your vault.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4"
            >
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Example */}
        <h2 className="text-2xl font-semibold mb-4">Example</h2>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5 mb-12 font-mono text-sm">
          <p className="text-[var(--text-muted)] mb-2">/0n run Send an invoice to john@acme.com for $500 on Stripe</p>
          <div className="border-t border-[var(--border)] pt-3 mt-3">
            <p className="text-[var(--text-secondary)] font-semibold mb-1">0nMCP</p>
            <p className="text-[var(--text-primary)]">
              *Task:* Send Stripe invoice for $500 to john@acme.com
            </p>
            <p className="text-[var(--text-muted)] mt-2">
              1. *stripe_customer_search* -- Look up john@acme.com<br />
              2. *stripe_invoice_create* -- Create invoice for $500<br />
              3. *stripe_invoice_send* -- Send to customer email<br />
              <br />
              Invoice sent. Link: https://invoice.stripe.com/i/...
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-[var(--text-muted)]">
          0nMCP is Source-available. 5 patents pending.{' '}
          <a href="https://www.0nmcp.com" className="text-[var(--accent)] hover:underline">
            Learn more
          </a>
        </p>
      </div>
    </main>
  )
}
