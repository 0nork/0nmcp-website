import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Convert Google Gemini Gems & ADK Agents to .0n | 0nMCP',
  description: 'Migrate from Google Gemini, AI Studio, and ADK agents to the universal .0n standard. Free step-by-step export guide + instant conversion to portable workflows.',
  keywords: ['convert Gemini Gem', 'Google AI Studio export', 'migrate from Gemini', 'Google ADK conversion', 'Gemini to MCP', 'Gemini to .0n', 'Google AI migration', 'Vertex AI convert'],
  openGraph: {
    title: 'Convert Google Gemini Gems & ADK Agents to .0n',
    description: 'Migrate from Gemini to the universal .0n standard. Free export guide + instant conversion.',
    url: 'https://0nmcp.com/convert/gemini',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert Google Gemini Gems & ADK Agents to .0n',
    description: 'Migrate from Gemini to the universal .0n standard. Free export guide + instant conversion.',
  },
  alternates: { canonical: 'https://0nmcp.com/convert/gemini' },
}

const PAIN_POINTS = [
  { title: 'Google Ecosystem Lock', desc: 'Gems and AI Studio configs only work inside Google\'s ecosystem. Switch providers? Start over from scratch.' },
  { title: 'Frequent Deprecations', desc: 'Google regularly deprecates APIs and services. PaLM to Gemini, Bard to Gems — your configs break with every rebrand.' },
  { title: 'Complex ADK Setup', desc: 'Google\'s Agent Development Kit requires deep GCP integration. With .0n, your agents are portable config files.' },
  { title: 'Limited Tool Access', desc: 'Gemini\'s built-in tools are limited to Google services. 0nMCP gives you 819 tools across 48 services from any AI.' },
]

const WHAT_TRANSFERS = [
  { item: 'System Instructions', from: 'systemInstruction', to: 'system.prompt', status: 'Full' },
  { item: 'Generation Config', from: 'generationConfig.*', to: 'system.config', status: 'Full' },
  { item: 'Safety Settings', from: 'safetySettings[]', to: 'system.safety.*', status: 'Full' },
  { item: 'Tools/Functions', from: 'tools[].functionDeclarations', to: 'steps[].transform', status: 'Full' },
  { item: 'Model Selection', from: 'model (gemini-pro, etc)', to: 'source.model', status: 'Full' },
  { item: 'ADK Agent Config', from: 'agent.json', to: 'Full workflow', status: 'Full' },
  { item: 'Conversation History', from: 'contents[]', to: 'Not transferred', status: 'N/A' },
]

const EXPORT_STEPS = [
  { step: 1, title: 'Open Google AI Studio', desc: 'Go to aistudio.google.com and sign in with your Google account' },
  { step: 2, title: 'Find Your Gem', desc: 'Navigate to "My Gems" or "My Prompts" to see your saved configurations' },
  { step: 3, title: 'Open Gem Settings', desc: 'Click the Gem to open it, then click the settings or edit button' },
  { step: 4, title: 'Get the JSON', desc: 'Click "Get code" or the JSON export option to see the full configuration' },
  { step: 5, title: 'ADK Agents', desc: 'For ADK agents, locate your agent.json in the project directory' },
  { step: 6, title: 'Save the Config', desc: 'Copy the full JSON and save as a .json file' },
  { step: 7, title: 'Upload to Brain Transplant', desc: 'Sign in to 0nMCP, go to Convert, upload your file. Instant conversion!' },
]

const COMPARISON = [
  { feature: 'Tool Count', gemini: '~10 built-in (Google only)', on: '819 tools across 48 services' },
  { feature: 'Portability', gemini: 'Locked to Google ecosystem', on: 'Runs anywhere (any AI client)' },
  { feature: 'Format', gemini: 'Google-proprietary JSON', on: 'Open .0n Standard' },
  { feature: 'Pricing', gemini: 'Per-character, per-API-call', on: 'Free core, $0.10/execution' },
  { feature: 'Dependencies', gemini: 'GCP, ADK, Google Cloud SDK', on: 'Zero dependencies (Node.js only)' },
  { feature: 'Version Control', gemini: 'Managed by Google', on: 'Git-friendly text files' },
  { feature: 'Multi-AI', gemini: 'Gemini models only', on: 'Works with any LLM' },
]

const FAQ = [
  { q: 'Can I convert Gems created in the free tier?', a: 'Yes! Brain Transplant works with any Gemini configuration regardless of your Google plan. Free tier Gems, paid AI Studio configs, and enterprise Vertex AI setups all convert the same way.' },
  { q: 'What about ADK agents with custom tools?', a: 'ADK agent configs convert fully — custom function declarations become .0n steps, and any MCP server references transfer as service connections. Your agent logic is preserved in the workflow.' },
  { q: 'Are safety settings preserved?', a: 'Yes. Gemini\'s safety settings (harassment, hate speech, dangerous content, etc.) are mapped to .0n system.safety fields. You can keep, modify, or remove them in the converted workflow.' },
  { q: 'Does Google Vertex AI config work too?', a: 'Yes — Vertex AI uses the same Gemini API schema under the hood. Export your model config as JSON and upload it. The converter handles both AI Studio and Vertex AI formats.' },
  { q: 'Is the conversion free?', a: 'Yes — Brain Transplant conversion is completely free. You only pay for workflow execution if you use the 0nMCP marketplace ($0.10/run).' },
]

export default function ConvertGemini() {
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
            name: 'Brain Transplant — Gemini Converter',
            description: 'Convert Google Gemini Gems and ADK agents to the universal .0n workflow standard',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            url: 'https://0nmcp.com/convert/gemini',
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
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: 'rgba(66,133,244,0.15)', color: '#4285f4', fontFamily: 'var(--font-mono)' }}>
              G
            </div>
            <span className="text-3xl" style={{ color: 'var(--text-muted)' }}>&rarr;</span>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: 'rgba(126,217,87,0.1)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              .0n
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Convert <span style={{ color: '#4285f4' }}>Gemini</span> to <span className="glow-text" style={{ color: 'var(--accent)' }}>.0n</span>
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Export your Gems, AI Studio configs, and ADK agents. Convert them to portable .0n workflows. Break free from Google lock-in.
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
          <h2 className="section-heading">The Problem with Google Lock-in</h2>
          <p className="section-desc">Google AI products change fast. Your workflows should survive every rebrand and deprecation.</p>

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
          <p className="section-desc">See exactly what transfers from Gemini to .0n — including ADK agent configs.</p>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Component</th>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Gemini Field</th>
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
                        backgroundColor: w.status === 'Full' ? 'rgba(126,217,87,0.1)' : 'rgba(255,255,255,0.05)',
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
          <h2 className="section-heading">How to Export from Gemini</h2>
          <p className="section-desc">Follow these steps to extract your AI config. Works with AI Studio and ADK.</p>

          <div className="mt-12 space-y-4">
            {EXPORT_STEPS.map((s) => (
              <div key={s.step} className="glow-box flex items-start gap-4">
                <span className="text-lg font-bold shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(126,217,87,0.1)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
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
          <h2 className="section-heading">Gemini vs .0n Standard</h2>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Feature</th>
                  <th className="py-3 px-4" style={{ color: '#4285f4' }}>Gemini</th>
                  <th className="py-3 px-4" style={{ color: 'var(--accent)' }}>.0n Standard</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((c) => (
                  <tr key={c.feature} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{c.feature}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{c.gemini}</td>
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
            Free Your <span style={{ color: '#4285f4' }}>Gems</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            Convert your Gemini workflows to .0n in seconds. No Google lock-in. 819 tools ready to go.
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
