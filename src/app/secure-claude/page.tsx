import type { Metadata } from 'next'
import Link from 'next/link'
import { STATS, STATS_DISPLAY } from '@/data/stats'

export const metadata: Metadata = {
  title: 'Secure Your Claude Desktop in 60 Seconds — Free | 0nMCP',
  description:
    'The March 2026 supply chain attack compromised thousands of developers. Don\'t be next. 0nDefender protects your MCP server with 4 security layers — completely free.',
  openGraph: {
    title: 'Secure Your Claude Desktop in 60 Seconds — Free | 0nMCP',
    description:
      'The axios RAT attack compromised npm packages used by thousands. 0nDefender stops supply chain attacks before they start. 4 security layers. Free. Open source.',
    url: 'https://www.0nmcp.com/secure-claude',
    siteName: '0nMCP',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secure Your Claude Desktop in 60 Seconds — Free',
    description:
      'The March 2026 supply chain attack compromised thousands. 0nDefender stops it. 4 security layers. Free. Open source.',
    creator: '@0nork',
  },
  alternates: { canonical: 'https://www.0nmcp.com/secure-claude' },
}

const FAQ_ITEMS = [
  {
    q: 'Is 0nDefender really free?',
    a: 'Yes, completely free. 0nDefender is MIT licensed and ships as part of 0nMCP. No sign-up required. No credit card. No usage limits. Run npx 0nmcp@latest and you are protected.',
  },
  {
    q: 'Does it slow down npm install?',
    a: 'No. The preinstall hook adds less than 2 seconds to your npm install. It scans only the lockfile and cross-references against a local advisory cache. The dependency scan runs asynchronously and does not block your workflow.',
  },
  {
    q: 'What attacks does 0nDefender protect against?',
    a: 'Supply chain attacks (compromised npm packages), typosquatting attacks (malicious packages with names similar to popular ones), credential theft (stolen API keys and tokens), and compromised dependencies (legitimate packages that have been hijacked). It would have blocked the March 2026 axios RAT attack entirely.',
  },
  {
    q: 'Does it work with other MCP servers?',
    a: 'Yes. 0nDefender protects any Node.js project, not just MCP servers. The preinstall hook works in any package.json. The credential health checker works with any API keys stored in .env files or 0nVault containers.',
  },
  {
    q: 'How does it detect malicious packages?',
    a: 'Three mechanisms: (1) Pattern matching against known malicious package versions from the npm advisory database, (2) Lockfile integrity hash verification to detect tampering between installs, and (3) Behavioral analysis of postinstall scripts that attempt network access, file system writes outside node_modules, or process spawning. The March 2026 axios attack used a postinstall script — 0nSeal would have flagged and blocked it before execution.',
  },
]

const SECURITY_LAYERS = [
  {
    name: '0nWatch',
    tagline: 'Supply Chain Monitor',
    description:
      'Continuously scans your npm dependency tree against the npm advisory database, GitHub Security Advisories, and known-malicious package registries. Runs every 6 hours automatically. Catches compromised packages before they reach production.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    name: '0nVaultGuard',
    tagline: 'Key Health Verification',
    description:
      'Checks every API key in your environment to verify it is still valid, has not been revoked, and has not been exposed in known breach databases. Runs every 12 hours. Uses zero-knowledge probing — your keys never leave your machine.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: '0nSeal',
    tagline: 'Lockfile Integrity',
    description:
      'A preinstall hook that validates your package-lock.json against known-safe hashes before npm touches a single file. Blocks malicious packages BEFORE npm install runs. This single layer would have stopped the March 2026 axios attack.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    name: '0nAlert',
    tagline: 'Threat Notifications',
    description:
      'Real-time alerts via email, Slack, or Discord when a vulnerability is detected in your dependency tree, when an API key fails a health check, or when a lockfile integrity mismatch is found. You know the moment something is wrong.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
]

const COMPARISON_ROWS = [
  {
    attack: 'Malicious npm package',
    unprotected: 'Installs silently',
    protected: 'BLOCKED before install',
  },
  {
    attack: 'Compromised dependency',
    unprotected: 'Runs undetected',
    protected: 'Scanned every 6 hours',
  },
  {
    attack: 'Stolen API keys',
    unprotected: 'Discovered after breach',
    protected: 'Health-checked every 12 hours',
  },
  {
    attack: 'Typosquatting attack',
    unprotected: 'No detection',
    protected: 'Pattern-matched and warned',
  },
]

export default function SecureClaudePage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Secure Your Claude Desktop in 60 Seconds — Free',
    description:
      'The March 2026 supply chain attack compromised thousands of developers. 0nDefender protects your MCP server with 4 security layers.',
    author: {
      '@type': 'Person',
      name: 'Mike Mento',
      jobTitle: 'Founder',
      worksFor: { '@type': 'Organization', name: 'RocketOpp LLC' },
    },
    publisher: {
      '@type': 'Organization',
      name: '0nMCP',
      url: 'https://www.0nmcp.com',
    },
    datePublished: '2026-04-02',
    dateModified: '2026-04-02',
    url: 'https://www.0nmcp.com/secure-claude',
    mainEntityOfPage: 'https://www.0nmcp.com/secure-claude',
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '0nDefender',
    description:
      'Free supply chain security tool for Claude Desktop and MCP servers. 4 security layers: supply chain monitoring, key health verification, lockfile integrity, and threat notifications.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Windows, macOS, Linux',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'RocketOpp LLC',
      url: 'https://rocketopp.com',
    },
    url: 'https://www.0nmcp.com/secure-claude',
    downloadUrl: 'https://www.npmjs.com/package/0nmcp',
    softwareVersion: '2.9.0',
    license: 'https://opensource.org/licenses/MIT',
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Security', item: 'https://www.0nmcp.com/security' },
      { '@type': 'ListItem', position: 3, name: 'Secure Claude Desktop', item: 'https://www.0nmcp.com/secure-claude' },
    ],
  }

  return (
    <div className="min-h-screen" style={{ background: '#fafafa', color: '#1a1a1a' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ─── HERO ─── */}
      <section
        className="pt-32 pb-20 px-4 md:px-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a0000 0%, #2d0a00 30%, #1a1200 60%, #0a1a0a 100%)',
        }}
      >
        {/* Animated pulse ring */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #ff4444 0%, transparent 70%)',
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-8"
            style={{
              background: 'rgba(255, 68, 68, 0.15)',
              color: '#ff6b6b',
              border: '1px solid rgba(255, 68, 68, 0.3)',
            }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ff4444' }} />
            FREE SECURITY TOOL
          </div>

          {/* H1 */}
          <h1
            className="text-4xl md:text-6xl font-black leading-tight mb-6"
            style={{ color: '#ffffff' }}
          >
            Secure Your Claude Desktop
            <br />
            <span style={{ color: '#6EE05A' }}>in 60 Seconds</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#b0b8c4' }}>
            The March 31, 2026 supply chain attack compromised npm packages used by thousands of developers.{' '}
            <strong style={{ color: '#ff6b6b' }}>0nDefender</strong> stops it before it starts.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#install"
              className="px-8 py-3.5 rounded-lg font-bold text-base transition-all hover:scale-105"
              style={{
                background: '#6EE05A',
                color: '#0a0a0a',
              }}
            >
              Get Protected Now
            </a>
            <Link
              href="/blog/secure-claude-desktop"
              className="px-8 py-3.5 rounded-lg font-bold text-base transition-all hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              What Happened?
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BLUF / WHAT HAPPENED ─── */}
      <section className="py-20 px-4 md:px-8" style={{ background: '#ffffff' }}>
        <div className="max-w-4xl mx-auto">
          <nav className="text-xs mb-8 flex items-center gap-1.5" style={{ color: '#888' }} aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/security" className="hover:underline">Security</Link>
            <span>/</span>
            <span style={{ color: '#6EE05A' }}>Secure Claude Desktop</span>
          </nav>

          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#1a1a1a' }}>
            What Happened on March 31, 2026
          </h2>
          <p className="text-lg mb-4 leading-relaxed" style={{ color: '#444' }}>
            Attackers published compromised versions of <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: '#f0f0f0' }}>axios@1.14.1</code> and{' '}
            <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: '#f0f0f0' }}>axios@0.30.4</code> to npm.
            The packages contained a Remote Access Trojan (RAT) payload hidden inside a transitive dependency called{' '}
            <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: '#f0f0f0' }}>plain-crypto-js</code>.
            The payload executed via a <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: '#f0f0f0' }}>postinstall</code> script, exfiltrating environment variables, SSH keys, and API credentials to an external server.
          </p>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: '#444' }}>
            Any developer who ran <code className="px-1.5 py-0.5 rounded text-sm font-mono" style={{ background: '#f0f0f0' }}>npm install</code> in a project using those axios versions was compromised.
            MCP server operators were particularly vulnerable because their environments contain API keys for dozens of connected services.
          </p>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #e0e0e0' }}>
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: '#f5f5f7' }}>
                  <th className="px-6 py-4 text-sm font-bold" style={{ color: '#666', borderBottom: '1px solid #e0e0e0' }}>Attack Vector</th>
                  <th className="px-6 py-4 text-sm font-bold" style={{ color: '#cc0000', borderBottom: '1px solid #e0e0e0' }}>Unprotected</th>
                  <th className="px-6 py-4 text-sm font-bold" style={{ color: '#1a8c1a', borderBottom: '1px solid #e0e0e0' }}>With 0nDefender</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid #eee' : undefined }}>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: '#333' }}>{row.attack}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#cc0000' }}>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#cc0000' }} />
                        {row.unprotected}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#1a8c1a' }}>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#1a8c1a' }} />
                        {row.protected}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── THE 4 SECURITY LAYERS ─── */}
      <section className="py-20 px-4 md:px-8" style={{ background: '#f5f5f7' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#1a1a1a' }}>
              4 Security Layers. Zero Cost.
            </h2>
            <p className="text-lg" style={{ color: '#666' }}>
              Every layer ships free with 0nMCP. MIT licensed. No sign-up required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {SECURITY_LAYERS.map((layer) => (
              <div
                key={layer.name}
                className="rounded-xl p-8 transition-all hover:scale-[1.02]"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="p-3 rounded-lg shrink-0"
                    style={{ background: 'rgba(110, 224, 90, 0.1)', color: '#3d9c2e' }}
                  >
                    {layer.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black" style={{ color: '#1a1a1a' }}>{layer.name}</h3>
                    <p className="text-sm font-medium" style={{ color: '#6EE05A' }}>{layer.tagline}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#555' }}>
                  {layer.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INSTALL SECTION ─── */}
      <section id="install" className="py-20 px-4 md:px-8 scroll-mt-20" style={{ background: '#ffffff' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#1a1a1a' }}>
              Install in 60 Seconds
            </h2>
            <p className="text-lg" style={{ color: '#666' }}>
              Three steps. Copy, paste, protected.
            </p>
          </div>

          {/* Step 1 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                style={{ background: '#6EE05A', color: '#0a0a0a' }}
              >
                1
              </span>
              <h3 className="text-xl font-bold" style={{ color: '#1a1a1a' }}>Install 0nMCP globally</h3>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a2e', border: '1px solid #2a2a4e' }}>
              <div className="flex items-center justify-between px-4 py-2" style={{ background: '#12122a', borderBottom: '1px solid #2a2a4e' }}>
                <span className="text-xs font-mono" style={{ color: '#888' }}>Terminal</span>
              </div>
              <pre className="p-6 text-sm font-mono overflow-x-auto" style={{ color: '#e0e0e0' }}>
{`npm install -g 0nmcp
0nmcp engine verify`}
              </pre>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                style={{ background: '#6EE05A', color: '#0a0a0a' }}
              >
                2
              </span>
              <h3 className="text-xl font-bold" style={{ color: '#1a1a1a' }}>Add to your Claude Desktop MCP config</h3>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a2e', border: '1px solid #2a2a4e' }}>
              <div className="flex items-center justify-between px-4 py-2" style={{ background: '#12122a', borderBottom: '1px solid #2a2a4e' }}>
                <span className="text-xs font-mono" style={{ color: '#888' }}>claude_desktop_config.json</span>
              </div>
              <pre className="p-6 text-sm font-mono overflow-x-auto" style={{ color: '#e0e0e0' }}>
{`{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`}
              </pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                style={{ background: '#6EE05A', color: '#0a0a0a' }}
              >
                3
              </span>
              <h3 className="text-xl font-bold" style={{ color: '#1a1a1a' }}>Add the preinstall hook to any project</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#666' }}>
              Add this to any project&apos;s <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: '#f0f0f0' }}>package.json</code> to block malicious packages before they install:
            </p>
            <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a2e', border: '1px solid #2a2a4e' }}>
              <div className="flex items-center justify-between px-4 py-2" style={{ background: '#12122a', borderBottom: '1px solid #2a2a4e' }}>
                <span className="text-xs font-mono" style={{ color: '#888' }}>package.json</span>
              </div>
              <pre className="p-6 text-sm font-mono overflow-x-auto" style={{ color: '#e0e0e0' }}>
{`{
  "scripts": {
    "preinstall": "npx 0nmcp@latest defender scan --lockfile"
  }
}`}
              </pre>
            </div>
          </div>

          {/* Done callout */}
          <div
            className="rounded-xl p-6 text-center"
            style={{
              background: 'rgba(110, 224, 90, 0.08)',
              border: '1px solid rgba(110, 224, 90, 0.2)',
            }}
          >
            <p className="text-lg font-bold" style={{ color: '#1a8c1a' }}>
              Done. Your MCP server and every project with the preinstall hook are now protected by 4 security layers.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 px-4 md:px-8" style={{ background: '#f5f5f7' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-10 text-center" style={{ color: '#1a1a1a' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl overflow-hidden"
                style={{ background: '#ffffff', border: '1px solid #e0e0e0' }}
              >
                <summary
                  className="px-6 py-5 cursor-pointer font-bold text-base flex items-center justify-between"
                  style={{ color: '#1a1a1a' }}
                >
                  {faq.q}
                  <span
                    className="text-xl transition-transform group-open:rotate-45 shrink-0 ml-4"
                    style={{ color: '#6EE05A' }}
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: '#555' }}>
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF / STATS ─── */}
      <section className="py-20 px-4 md:px-8" style={{ background: '#ffffff' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: STATS_DISPLAY.tools, label: 'Tools Protected' },
              { value: STATS_DISPLAY.services, label: 'Services Monitored' },
              { value: '4', label: 'Patent-Pending Security Layers' },
              { value: '$0', label: 'Cost' },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-xl p-6"
                style={{ background: '#f5f5f7', border: '1px solid #e0e0e0' }}
              >
                <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: '#6EE05A' }}>
                  {stat.value}
                </div>
                <div className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section
        className="py-20 px-4 md:px-8"
        style={{
          background: 'linear-gradient(135deg, #0a1a0a 0%, #0B0F19 50%, #0a1a0a 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#ffffff' }}>
            Want the Full Platform?
          </h2>
          <p className="text-lg mb-8" style={{ color: '#b0b8c4' }}>
            0nDefender is free and always will be. The full 0nMCP platform gives you{' '}
            {STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services with AI orchestration, encrypted vault storage, and metered execution.
          </p>

          <div className="mb-8">
            <div
              className="inline-block rounded-xl overflow-hidden"
              style={{ background: '#1a1a2e', border: '1px solid #2a2a4e' }}
            >
              <pre className="px-8 py-4 text-base font-mono" style={{ color: '#6EE05A' }}>
                npx 0nmcp@latest
              </pre>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/start"
              className="px-8 py-3.5 rounded-lg font-bold text-base transition-all hover:scale-105"
              style={{
                background: '#6EE05A',
                color: '#0a0a0a',
              }}
            >
              Get Full Access
            </Link>
            <a
              href="https://github.com/0nork/0nMCP"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-lg font-bold text-base transition-all hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              Star on GitHub
            </a>
          </div>

          <p className="text-xs mt-8" style={{ color: '#555' }}>
            0nMCP is open source (MIT). 0nDefender is included. Patent Pending: #63/968,814, #63/990,046.
            <br />
            RocketOpp LLC &middot; {new Date().getFullYear()}
          </p>
        </div>
      </section>

      {/* Pulse animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.05; }
        }
      `}} />
    </div>
  )
}
