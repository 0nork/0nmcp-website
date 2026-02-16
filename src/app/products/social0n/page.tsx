import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Social0n — AI-Powered Social Media Automation | 0n Network',
  description: 'Automate your social media presence with AI. Schedule, generate, and publish content across every platform from one command.',
  openGraph: {
    title: 'Social0n — AI-Powered Social Media Automation',
    description: 'Automate your social media presence with AI.',
    url: 'https://0nmcp.com/products/social0n',
    siteName: '0nMCP',
  },
}

const FEATURES = [
  { title: 'AI Content Generation', desc: 'Generate platform-optimized posts, captions, and hashtags with Claude and GPT.' },
  { title: 'Multi-Platform Publishing', desc: 'Post to Instagram, X, LinkedIn, Facebook, TikTok, and more from one workflow.' },
  { title: 'Smart Scheduling', desc: 'AI picks optimal posting times based on your audience engagement patterns.' },
  { title: 'Content Calendar', desc: 'Visual drag-and-drop calendar with .0n workflow integration.' },
  { title: 'Analytics Dashboard', desc: 'Track engagement, reach, and growth across all platforms in one view.' },
  { title: 'Brand Voice AI', desc: 'Train the AI on your brand tone, style, and messaging guidelines.' },
]

export default function Social0nPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      <section className="store-hero">
        <div className="store-badge" style={{ borderColor: 'rgba(0, 255, 136, 0.3)', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}>
          Coming Soon
        </div>
        <h1 style={{ background: 'linear-gradient(135deg, #00ff88, #00cc6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Social0n
        </h1>
        <p className="store-subtitle">
          AI-powered social media automation. Generate content, schedule posts,
          and grow your audience across every platform — all orchestrated through
          .0n workflows.
        </p>
      </section>

      <section className="store-capabilities">
        <h3>Core Features</h3>
        <div className="store-cap-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="store-cap-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: '#00ff88', fontWeight: 600, fontSize: '0.95rem' }}>{f.title}</span>
              <span style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', padding: '3rem 0' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Social0n is currently in development. Join the waitlist to get early access.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" className="store-cta" style={{ maxWidth: 240 }}>
            Join Waitlist
          </Link>
          <Link href="/" className="store-cta secondary" style={{ maxWidth: 240 }}>
            Back to 0nMCP
          </Link>
        </div>
      </section>
    </div>
  )
}
