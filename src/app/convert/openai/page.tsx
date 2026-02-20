import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Convert OpenAI GPTs & Assistants to .0n Workflows | 0nMCP',
  description: 'Migrate from OpenAI ChatGPT, GPTs, and Assistants to the universal .0n standard. Free step-by-step export guide + instant conversion. No vendor lock-in.',
  keywords: ['convert OpenAI GPT', 'export OpenAI assistant', 'migrate from ChatGPT', 'OpenAI to MCP', 'GPT to .0n', 'OpenAI migration', 'export custom GPT', 'ChatGPT alternative'],
  openGraph: {
    title: 'Convert OpenAI GPTs & Assistants to .0n',
    description: 'Migrate from OpenAI to the universal .0n standard. Free export guide + instant conversion.',
    url: 'https://0nmcp.com/convert/openai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert OpenAI GPTs & Assistants to .0n',
    description: 'Migrate from OpenAI to the universal .0n standard. Free export guide + instant conversion.',
  },
  alternates: { canonical: 'https://0nmcp.com/convert/openai' },
}

const PAIN_POINTS = [
  { title: 'Vendor Lock-in', desc: 'Your GPT configs, prompts, and actions are trapped inside OpenAI. If they change pricing, deprecate models, or limit API access — you lose everything.' },
  { title: 'No Portability', desc: 'Custom GPTs can\'t run outside ChatGPT. Your carefully crafted assistants are stuck in one ecosystem with no export button.' },
  { title: 'Limited Integrations', desc: 'OpenAI Actions connect to a handful of services. 0nMCP gives you 545 tools across 26 services — instantly.' },
  { title: 'Pricing Uncertainty', desc: 'API costs fluctuate. Token pricing changes quarterly. With .0n, you own the workflow and choose your execution platform.' },
]

const WHAT_TRANSFERS = [
  { item: 'System Prompts', from: 'instructions / system', to: 'system.prompt', status: 'Full' },
  { item: 'Model Config', from: 'model, temperature, top_p', to: 'system.config', status: 'Full' },
  { item: 'Functions/Tools', from: 'tools[].function', to: 'steps[].action', status: 'Full' },
  { item: 'Actions (APIs)', from: 'actions[].openapi', to: 'steps[].transform', status: 'Full' },
  { item: 'Knowledge Files', from: 'file_ids[]', to: 'metadata.files', status: 'Reference' },
  { item: 'Conversation History', from: 'threads / messages', to: 'Not transferred', status: 'N/A' },
]

const EXPORT_STEPS = [
  { step: 1, title: 'Open ChatGPT', desc: 'Go to chat.openai.com and sign in to your account' },
  { step: 2, title: 'Find Your GPT', desc: 'Click "Explore GPTs" → "My GPTs" to see your custom GPTs' },
  { step: 3, title: 'Edit the GPT', desc: 'Click the GPT name → "Edit GPT" to access the configuration' },
  { step: 4, title: 'Copy the Config', desc: 'Copy the Instructions, Actions schema, and any function definitions' },
  { step: 5, title: 'API Method (Optional)', desc: 'Use the Assistants API: GET /v1/assistants/{id} to get the full JSON config' },
  { step: 6, title: 'Save as JSON', desc: 'Paste everything into a JSON file and save it' },
  { step: 7, title: 'Upload to Brain Transplant', desc: 'Sign in to 0nMCP, go to Convert, and upload your file. Done!' },
]

const COMPARISON = [
  { feature: 'Tool Count', openai: '~20 built-in tools', on: '545 tools across 26 services' },
  { feature: 'Portability', openai: 'Locked to ChatGPT / API', on: 'Runs anywhere (any AI client)' },
  { feature: 'Format', openai: 'Proprietary JSON', on: 'Open .0n Standard' },
  { feature: 'Pricing', openai: 'Per-token, per-API-call', on: 'Free core, $0.10/execution' },
  { feature: 'Integrations', openai: 'Manual Actions setup', on: '26 pre-built service connectors' },
  { feature: 'Version Control', openai: 'No native support', on: 'Git-friendly text files' },
  { feature: 'Multi-AI', openai: 'OpenAI models only', on: 'Works with any LLM' },
]

const FAQ = [
  { q: 'Can I convert a Custom GPT without API access?', a: 'Yes! You can manually copy the Instructions and Actions from the ChatGPT editor. Our converter accepts both the full API export JSON and manually assembled configs.' },
  { q: 'Will my converted workflow work exactly the same?', a: 'The .0n workflow preserves all transferable configuration — prompts, tools, functions, and settings. The actual AI responses depend on which model you run with, but the workflow structure is identical.' },
  { q: 'What about my knowledge files?', a: 'File references are preserved in the workflow metadata. The actual files need to be uploaded separately to your 0nMCP instance. We convert the references so you know exactly which files to add.' },
  { q: 'Is the conversion reversible?', a: 'Yes — .0n files are human-readable JSON. You can always extract the original prompts and configs, or convert back to OpenAI format.' },
  { q: 'Do I need to pay for conversion?', a: 'No — Brain Transplant conversion is free. You only pay when you execute workflows through 0nMCP ($0.10 per execution on the marketplace, or free if self-hosted).' },
]

export default function ConvertOpenAI() {
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
            name: 'Brain Transplant — OpenAI Converter',
            description: 'Convert OpenAI GPTs and Assistants to the universal .0n workflow standard',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            url: 'https://0nmcp.com/convert/openai',
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
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: 'rgba(16,163,127,0.15)', color: '#10a37f', fontFamily: 'var(--font-mono)' }}>
              O
            </div>
            <span className="text-3xl" style={{ color: 'var(--text-muted)' }}>&rarr;</span>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: 'rgba(0,255,136,0.1)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              .0n
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Convert <span style={{ color: '#10a37f' }}>OpenAI</span> to <span className="glow-text" style={{ color: 'var(--accent)' }}>.0n</span>
          </h1>
          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Export your Custom GPTs, Assistants, and Actions. Convert them to portable .0n workflows. Run anywhere with 545 tools.
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
          <h2 className="section-heading">The Problem with OpenAI Lock-in</h2>
          <p className="section-desc">Your AI workflows deserve to be portable. Here is why developers are migrating away from OpenAI-only setups.</p>

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
          <p className="section-desc">See exactly what transfers from OpenAI to .0n — and how each field maps.</p>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Component</th>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>OpenAI Field</th>
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
          <h2 className="section-heading">How to Export from OpenAI</h2>
          <p className="section-desc">Follow these steps to extract your AI config. No special tools required.</p>

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
          <h2 className="section-heading">OpenAI vs .0n Standard</h2>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>Feature</th>
                  <th className="py-3 px-4" style={{ color: '#10a37f' }}>OpenAI</th>
                  <th className="py-3 px-4" style={{ color: 'var(--accent)' }}>.0n Standard</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((c) => (
                  <tr key={c.feature} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>{c.feature}</td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>{c.openai}</td>
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
            Free Your <span style={{ color: '#10a37f' }}>GPTs</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            Convert your OpenAI workflows to .0n in seconds. No lock-in. No limits. 545 tools ready to go.
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
