import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Convert OpenClaw Agents to .0n Workflows | 0nMCP',
  description: 'Migrate from OpenClaw to the universal .0n standard. Convert manifests, Claw configs, and MCP bridge setups to portable workflows. Free export guide + instant conversion.',
  keywords: ['convert OpenClaw', 'OpenClaw to .0n', 'OpenClaw MCP migration', 'OpenClaw converter', 'migrate from OpenClaw', 'Claw config export', 'OpenClaw alternative'],
  openGraph: {
    title: 'Convert OpenClaw Agents to .0n Workflows',
    description: 'Migrate from OpenClaw to the universal .0n standard. Free export guide + instant conversion.',
    url: 'https://0nmcp.com/convert/openclaw',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert OpenClaw Agents to .0n Workflows',
    description: 'Migrate from OpenClaw to the universal .0n standard. Free export guide + instant conversion.',
  },
  alternates: { canonical: 'https://0nmcp.com/convert/openclaw' },
}

const PAIN_POINTS = [
  { title: 'Limited Ecosystem', desc: 'OpenClaw\'s tool and service ecosystem is still growing. 0nMCP offers 564 ready-to-use tools across 26 services today.' },
  { title: 'No Standard Format', desc: 'Claw configs use a proprietary format with no interoperability. The .0n standard works across 7 AI platforms.' },
  { title: 'Bridge Complexity', desc: 'MCP bridge configurations require manual setup for each service. 0nMCP handles connections automatically with built-in service adapters.' },
  { title: 'Scale Limitations', desc: 'Running multiple agents with OpenClaw requires complex orchestration. 0nMCP\'s three-level execution handles Pipeline, Assembly Line, and Radial Burst patterns.' },
]

const WHAT_TRANSFERS = [
  { item: 'Agent Manifest', from: 'manifest.*', to: 'workflow.*', status: 'Full' },
  { item: 'MCP Servers', from: 'mcpServers{}', to: 'service connections', status: 'Full' },
  { item: 'Tool Definitions', from: 'tools[]', to: 'steps[].transform', status: 'Full' },
  { item: 'Claw Config', from: 'clawConfig.*', to: 'metadata.clawConfig', status: 'Full' },
  { item: 'Agent Name', from: 'manifest.name', to: 'workflow.name', status: 'Full' },
  { item: 'Runtime State', from: 'In-memory state', to: 'Not transferred', status: 'N/A' },
]

const EXPORT_STEPS = [
  { step: 1, title: 'Open OpenClaw Dashboard', desc: 'Access your OpenClaw dashboard or project directory' },
  { step: 2, title: 'Locate Your Agent', desc: 'Find the agent or manifest you want to export' },
  { step: 3, title: 'Export as JSON', desc: 'Use the export function or click Export → JSON format' },
  { step: 4, title: 'Include MCP Config', desc: 'Make sure your mcpServers config is included in the export' },
  { step: 5, title: 'Save the File', desc: 'Download as .json or .claw file' },
  { step: 6, title: 'Upload to Brain Transplant', desc: 'Sign in to 0nMCP, go to Convert, and upload. We handle everything!' },
]

const COMPARISON = [
  { feature: 'Tool Count', openclaw: 'Varies by setup', on: '564 tools across 26 services' },
  { feature: 'Portability', openclaw: 'OpenClaw runtime only', on: 'Runs anywhere (any AI client)' },
  { feature: 'Format', openclaw: 'Claw / proprietary JSON', on: 'Open .0n Standard' },
  { feature: 'Service Setup', openclaw: 'Manual MCP bridges', on: '26 pre-built connectors' },
  { feature: 'Execution Models', openclaw: 'Sequential', on: 'Pipeline + Assembly Line + Radial Burst' },
  { feature: 'Credential Management', openclaw: 'Manual .env files', on: 'AES-256 Vault + Engine bundles' },
  { feature: 'Community', openclaw: 'Growing', on: 'npm + GitHub + Discord + Marketplace' },
]

const FAQ = [
  { q: 'Can I convert .claw files directly?', a: 'Yes! Brain Transplant supports both standard JSON exports and native .claw format files. Upload either format and we auto-detect and convert.' },
  { q: 'What happens to my MCP server configs?', a: 'MCP server configurations are mapped to 0nMCP service connections. If the service is one of our 26 built-in connectors, it maps automatically. Custom MCP servers are preserved as external service references.' },
  { q: 'Do I need to reconfigure my tools after conversion?', a: 'Most tools map directly to 0nMCP equivalents. If your OpenClaw setup used custom MCP servers, you may need to add those as external services. Built-in tools work immediately.' },
  { q: 'Is there a size limit for conversion?', a: 'Brain Transplant handles manifests up to 10MB. For larger multi-agent setups, you can split them into individual agent files and convert each one separately.' },
  { q: 'Can I convert back to OpenClaw format?', a: 'Yes — .0n files are human-readable and the conversion is non-destructive. You can always extract the original configuration data from the workflow metadata.' },
]

export default function ConvertOpenClaw() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Brain Transplant — OpenClaw Converter',
            description: 'Convert OpenClaw agents and manifests to the universal .0n workflow standard',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            url: 'https://0nmcp.com/convert/openclaw',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        }}
      />

      {/* Hero */}
      <section className="py-32 px-8 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-[900px] mx-auto">
          <Link href="/convert" className="inline-flex items-center gap-2 text-sm mb-6 no-underline" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            &larr; All Converters
          </Link>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: 'rgba(255,107,53,0.15)', color: '#ff6b35', fontFamily: 'var(--font-mono)' }}>
              C
            </div>
            <span className="text-3xl" style={{ color: 'var(--text-muted)' }}>&rarr;</span>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: 'rgba(0,255,136,0.1)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              .0n
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Convert <span style={{ color: '#ff6b35' }}>OpenClaw</span> to <span className="glow-text" style={{ color: 'var(--accent)' }}>.0n</span>
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Export your OpenClaw manifests, Claw configs, and MCP bridges. Convert to portable .0n workflows with 564 tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-accent no-underline text-base px-8 py-3">
              Convert Now — Free
            </Link>
            <a href="#export-guide" className="btn-ghost no-underline text-base px-8 py-3">
              Export Guide
            </a>
          </div>
        </div>
      </section>

      {/* Why Migrate */}
      <section className="py-24 px-8" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">Why Migrate</span>
          <h2 className="section-heading">Level Up from OpenClaw</h2>
          <p className="section-desc">OpenClaw got you started. Now take your agents to the next level with the .0n ecosystem.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {PAIN_POINTS.map((p) => (
              <div key={p.title} className="glow-box">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Transfers */}
      <section className="py-24 px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">What Converts</span>
          <h2 className="section-heading">Full Conversion Map</h2>
          <p className="section-desc">See exactly what transfers from OpenClaw to .0n — manifests, tools, and MCP configs.</p>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Component</th>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>OpenClaw Field</th>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>.0n Target</th>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {WHAT_TRANSFERS.map((w) => (
                  <tr key={w.item} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{w.item}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{w.from}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--accent)' }}>{w.to}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 rounded" style={{
                        backgroundColor: w.status === 'Full' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)',
                        color: w.status === 'Full' ? 'var(--accent)' : 'var(--text-muted)',
                      }}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Export Guide */}
      <section id="export-guide" className="py-24 px-8" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">Free Migration Kit</span>
          <h2 className="section-heading">How to Export from OpenClaw</h2>
          <p className="section-desc">Quick steps to extract your agent config and MCP setup.</p>

          <div className="mt-12 space-y-4">
            {EXPORT_STEPS.map((s) => (
              <div key={s.step} className="glow-box flex items-start gap-4">
                <span className="text-lg font-bold shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0,255,136,0.1)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {s.step}
                </span>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">Comparison</span>
          <h2 className="section-heading">OpenClaw vs .0n Standard</h2>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Feature</th>
                  <th className="py-3 px-4" style={{ color: '#ff6b35' }}>OpenClaw</th>
                  <th className="py-3 px-4" style={{ color: 'var(--accent)' }}>.0n Standard</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((c) => (
                  <tr key={c.feature} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{c.feature}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{c.openclaw}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--accent)' }}>{c.on}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-8" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="section-accent-line" />
          <span className="section-label">FAQ</span>
          <h2 className="section-heading">Frequently Asked Questions</h2>

          <div className="mt-12 space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="glow-box">
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{f.q}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8 text-center" style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Upgrade Your <span style={{ color: '#ff6b35' }}>Agents</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            Convert your OpenClaw agents to .0n and unlock 564 tools, 26 services, and the full 0nMCP ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-accent no-underline text-base px-8 py-3">
              Start Converting Free
            </Link>
            <Link href="/convert" className="btn-ghost no-underline text-base px-8 py-3">
              View All Platforms
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
