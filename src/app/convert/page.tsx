import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Brain Transplant — Convert Any AI to .0n | 0nMCP',
  description: 'Migrate your AI workflows from OpenAI, Gemini, OpenClaw, and Claude Code to the universal .0n standard. Free extraction guides + instant conversion.',
  keywords: ['convert AI workflows', 'AI migration tool', 'brain transplant AI', '.0n converter', 'migrate AI assistant', 'OpenAI to MCP', 'Gemini to MCP', 'AI workflow converter'],
  openGraph: {
    title: 'Brain Transplant — Convert Any AI to .0n',
    description: 'Migrate your AI workflows from OpenAI, Gemini, OpenClaw, and Claude Code to the universal .0n standard.',
    url: 'https://0nmcp.com/convert',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brain Transplant — Convert Any AI to .0n',
    description: 'Migrate your AI workflows from OpenAI, Gemini, OpenClaw, and Claude Code to the universal .0n standard.',
  },
  alternates: { canonical: 'https://0nmcp.com/convert' },
}

const PLATFORMS = [
  {
    name: 'OpenAI',
    slug: 'openai',
    icon: 'O',
    color: '#10a37f',
    desc: 'Convert GPTs, Assistants, and Actions to portable .0n workflows',
    formats: ['GPT Config JSON', 'Assistant Export', 'Custom GPT Schema', 'Actions JSON'],
  },
  {
    name: 'Google Gemini',
    slug: 'gemini',
    icon: 'G',
    color: '#4285f4',
    desc: 'Migrate Gems, AI Studio configs, and ADK agents to .0n',
    formats: ['Gem Config', 'AI Studio Export', 'ADK Agent Config', 'Vertex AI Config'],
  },
  {
    name: 'OpenClaw',
    slug: 'openclaw',
    icon: 'C',
    color: '#ff6b35',
    desc: 'Convert OpenClaw manifests and MCP bridge configs to .0n',
    formats: ['OpenClaw Manifest', 'Claw Config', 'MCP Bridge Export'],
  },
  {
    name: 'Claude Code',
    slug: 'claude-code',
    icon: 'CC',
    color: '#d4a574',
    desc: 'Transform claude_desktop_config.json and CLAUDE.md to .0n workflows',
    formats: ['claude_desktop_config.json', 'CLAUDE.md', 'MCP Server Config'],
    comingSoon: true,
  },
]

const STEPS = [
  { num: '01', title: 'Export', desc: 'Follow our free guide to extract your AI config from the source platform' },
  { num: '02', title: 'Upload', desc: 'Drop your config file into Brain Transplant — we auto-detect the format' },
  { num: '03', title: 'Run', desc: 'Get a portable .0n workflow file — works with 0nMCP and 564 tools instantly' },
]

const VALUE_PROPS = [
  { title: 'Platform Independent', desc: 'Your workflows run anywhere — no vendor lock-in, ever' },
  { title: '564 Tools Built In', desc: '26 services, 13 categories — everything connected from day one' },
  { title: 'Open Standard', desc: 'The .0n format is human-readable, version-controllable, and shareable' },
  { title: 'Instant Migration', desc: 'Upload your config, get a working .0n workflow in seconds' },
]

const SUPPORTED_FORMATS = [
  { format: 'JSON', platforms: 'All platforms', desc: 'Standard JSON config files' },
  { format: 'YAML', platforms: 'Gemini, ADK', desc: 'YAML configuration files' },
  { format: 'Markdown', platforms: 'Claude Code', desc: 'CLAUDE.md instruction files' },
  { format: '.claw', platforms: 'OpenClaw', desc: 'Native OpenClaw format' },
]

export default function ConvertHub() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Brain Transplant by 0nMCP',
            description: 'Convert AI workflows from OpenAI, Gemini, OpenClaw, and Claude Code to the universal .0n standard',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            url: 'https://0nmcp.com/convert',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            author: { '@type': 'Organization', name: 'RocketOpp LLC', url: 'https://rocketopp.com' },
          }),
        }}
      />

      {/* Hero */}
      <section className="py-32 px-8 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ border: '1px solid var(--accent)', backgroundColor: 'rgba(0,255,136,0.05)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)' }}>
            Brain Transplant v2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Migrate <span className="glow-text" style={{ color: 'var(--accent)' }}>Any AI</span> to .0n
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Convert your AI workflows from OpenAI, Gemini, OpenClaw, and Claude Code to the universal .0n standard. Free extraction guides. Instant conversion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-accent no-underline text-base px-8 py-3">
              Start Converting Free
            </Link>
            <Link href="/0n-standard" className="btn-ghost no-underline text-base px-8 py-3">
              Learn about .0n
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Cards */}
      <section className="py-24 px-8" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">Supported Platforms</span>
          <h2 className="section-heading">Choose Your Source Platform</h2>
          <p className="section-desc">Select the platform you want to migrate from. Each page includes a free step-by-step extraction guide.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {PLATFORMS.map((p) => (
              <Link
                key={p.slug}
                href={p.comingSoon ? '#' : `/convert/${p.slug}`}
                className="glow-box no-underline group relative"
                style={{ '--glow-accent': p.color } as React.CSSProperties}
              >
                {p.comingSoon && (
                  <span className="absolute top-4 right-4 text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Coming Soon
                  </span>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${p.color}20`, color: p.color, fontFamily: 'var(--font-mono)' }}>
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                    <span className="text-sm" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                      {p.name} &rarr; .0n
                    </span>
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.formats.map((f) => (
                    <span key={f} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">How It Works</span>
          <h2 className="section-heading">3 Steps to Freedom</h2>
          <p className="section-desc">No complex migration process. No consultants. Just upload and go.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {STEPS.map((step) => (
              <div key={step.num} className="glow-box text-center">
                <span className="text-4xl font-bold mb-4 block" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
                  {step.num}
                </span>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why .0n */}
      <section className="py-24 px-8" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">Why .0n Standard</span>
          <h2 className="section-heading">Own Your AI Workflows</h2>
          <p className="section-desc">The .0n standard is the universal format for AI automation. Portable, open, and powerful.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {VALUE_PROPS.map((v) => (
              <div key={v.title} className="glow-box">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Formats */}
      <section className="py-24 px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">Compatibility</span>
          <h2 className="section-heading">Supported Formats</h2>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Format</th>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Platforms</th>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {SUPPORTED_FORMATS.map((f) => (
                  <tr key={f.format} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-4" style={{ color: 'var(--accent)' }}>{f.format}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{f.platforms}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8 text-center" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to <span style={{ color: 'var(--accent)' }}>Break Free</span>?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            Stop being locked into one AI platform. Convert your workflows to the .0n standard and run them anywhere with 0nMCP.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-accent no-underline text-base px-8 py-3">
              Create Free Account
            </Link>
            <Link href="/demo" className="btn-ghost no-underline text-base px-8 py-3">
              Try Interactive Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
