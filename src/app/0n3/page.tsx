import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0n3 — every app you own, one sign-in, AI that executes',
  description: '0nMCP is now 0n3: the universal hub. One SSO connects hundreds of applications and opens every endpoint to the AI you trust. Not workflows, not Zapier. AI that executes, with a receipt for every call. Patent pending.',
  alternates: { canonical: 'https://www.0nmcp.com/0n3' },
  openGraph: { title: '0n3 — every app you own. One sign-in. AI that executes.', description: 'The last app you will ever use to build your automated business.', url: 'https://www.0nmcp.com/0n3', type: 'website' },
}

const ROWS: [string, string][] = [
  ['One sign-in', 'Your 0n account works on every 0n app and inside every AI you install 0n3 into. One hub, not one more login.'],
  ['Hundreds of applications, every endpoint', 'Stripe, your CRM, Google, Slack, Shopify, GitHub, eBay, Hostinger and 110 more. 122 services, 1,804 endpoints, 868 CRM tools, all open to your AI with your own connections.'],
  ['Not workflows', 'No canvas of triggers to babysit. You say what you want; the AI decides which calls to make inside the apps and scopes you allow.'],
  ['AI that executes', 'Every call is real, in your accounts, and lands on a receipt: ok, skipped with why, or failed in the provider’s own words. "I think it worked" is gone.'],
  ['A front-facing URL and user login', 'Build a page your customers sign in to on a visual board. Live at 0n3.app/w/yourname or on your own domain in a minute.'],
  ['Payments', 'Prices, subscriptions, invoices and checkouts created by your AI in your own Stripe, settled to you.'],
  ['The Desk', 'An assistant that runs on your own computer with your own coding agent, asks you on your phone before anything leaves the machine, and replies with what it did.'],
  ['Patent pending', 'The MCP integration behind all of it is patent pending.'],
]

export default function On3Page() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#6EE05A' }}>0nMCP is now 0n3</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">Every app you own.<br />One sign-in. AI that executes.</h1>
      <p className="mt-5 max-w-3xl text-lg opacity-80">0n3 is the universal hub: one SSO that connects hundreds of applications and opens every one of their endpoints to the AI you trust. These are not workflows. This is not Zapier. 0n3 makes AI execute the ideas and plans you already have, in your accounts, with a receipt for every call.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="https://0n3.app/register" className="rounded-full px-6 py-3 text-sm font-bold" style={{ background: '#6EE05A', color: '#171717' }}>Jump into 0n3</a>
        <a href="https://0n3.app/install" className="rounded-full border px-6 py-3 text-sm font-semibold" style={{ borderColor: 'rgba(110,224,90,.5)' }}>Install into your AI</a>
        <a href="https://0n3.app/welcome" className="rounded-full border px-6 py-3 text-sm font-semibold" style={{ borderColor: 'rgba(255,255,255,.2)' }}>Watch it work</a>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {ROWS.map(([t, b]) => (
          <div key={t} className="rounded-2xl border p-6" style={{ borderColor: 'rgba(255,255,255,.1)', background: 'rgba(255,255,255,.03)' }}>
            <h2 className="text-lg font-bold">{t}</h2>
            <p className="mt-2 text-sm opacity-75">{b}</p>
          </div>
        ))}
      </div>
      <div className="mt-14 rounded-2xl border p-6" style={{ borderColor: 'rgba(110,224,90,.35)' }}>
        <h2 className="text-xl font-bold">Already using 0nMCP?</h2>
        <p className="mt-2 text-sm opacity-80">Your <code>0n_</code> token works on 0n3 unchanged, and the old endpoints carry it there for you. Local installs: <code>npx 0nmcp@5 stdio</code>. The 4.x package stays on npm as <code>0nmcp@4</code>.</p>
        <pre className="mt-4 overflow-auto rounded-xl p-4 text-xs" style={{ background: '#0a0a0a' }}>{`{ "mcpServers": { "0n3": { "url": "https://0n3.app/mcp", "headers": { "Authorization": "Bearer 0n_…" } } } }`}</pre>
        <p className="mt-4 text-sm"><Link href="/blog/0nmcp-is-now-0n3" className="underline">Read the announcement</Link></p>
      </div>
    </div>
  )
}
