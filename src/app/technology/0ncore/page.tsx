import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nCore — AI That Writes in YOUR Voice | 0nMCP Patent #64/006,282',
  description: '0nCore learns your industry, your style, and your language — then generates content that sounds authentically like you. Adaptive content generation with conversion optimization. US Patent Application #64/006,282.',
  openGraph: {
    title: '0nCore — AI That Writes in YOUR Voice',
    description: 'AI that learns your brand voice, your industry language, and what converts — then generates content that sounds authentically like you.',
    url: 'https://www.0nmcp.com/technology/0ncore',
  },
  alternates: { canonical: 'https://www.0nmcp.com/technology/0ncore' },
}

export default function CorePage() {
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: '0nCore Adaptive Content Generation',
    description: 'AI that learns your brand voice, industry language, and communication style to generate authentic content. Includes conversion optimization and cross-user intelligence.',
    url: 'https://www.0nmcp.com/technology/0ncore',
    brand: { '@type': 'Organization', name: '0nMCP' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Included free with 0nMCP' },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is 0nCore?', acceptedAnswer: { '@type': 'Answer', text: '0nCore is an adaptive content generation system that learns your brand voice, industry language, and communication style. It generates content — emails, follow-ups, social posts — that sounds authentically like you, not like a robot. It also optimizes language for conversions and learns from anonymous patterns across similar businesses.' } },
      { '@type': 'Question', name: 'How does 0nCore learn my voice?', acceptedAnswer: { '@type': 'Answer', text: 'When you connect your business profile (via OAuth), 0nCore analyzes your industry vocabulary, seniority level, communication patterns, and past content. It builds a voice profile with an authenticity score — content only generates if it scores above 75% authenticity to your real voice.' } },
      { '@type': 'Question', name: 'What is language optimization?', acceptedAnswer: { '@type': 'Answer', text: 'After generating content, 0nCore tests different word choices and phrasings to find what converts best. It uses a statistical method called Thompson Sampling to continuously improve which language variants perform best for your specific audience and industry.' } },
      { '@type': 'Question', name: 'Does 0nCore share my data with other users?', acceptedAnswer: { '@type': 'Answer', text: 'Never directly. The Cross-User Intelligence system only shares anonymous, aggregated patterns — like "businesses in your industry that say X tend to convert better than those that say Y." Your specific data stays private. A minimum of 20 users must be in a cohort before any patterns are shared.' } },
      { '@type': 'Question', name: 'How is 0nCore different from ChatGPT or other AI writers?', acceptedAnswer: { '@type': 'Answer', text: '0nCore doesn\'t just write generic AI content. It builds a profile of YOUR voice, tests what language converts best for YOUR audience, and learns from patterns in YOUR industry. The result is content that sounds like you wrote it — not like an AI wrote it.' } },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Technology', item: 'https://www.0nmcp.com/technology' },
      { '@type': 'ListItem', position: 3, name: '0nCore', item: 'https://www.0nmcp.com/technology/0ncore' },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/technology" className="hover:underline">Technology</Link>
          <span>/</span>
          <span style={{ color: '#ff6b35' }}>0nCore</span>
        </nav>

        {/* Hero */}
        <div className="heading-glow">
          <span className="text-xs font-mono uppercase tracking-widest mb-3 block" style={{ color: '#ff6b35' }}>
            US Patent Application #64/006,282
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
            0nCore
          </h1>
        </div>
        <p className="text-xl md:text-2xl font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          AI that writes in YOUR voice — not a robot&apos;s.
        </p>
        <p className="text-base mb-8" style={{ color: 'var(--text-muted)' }}>
          Filed March 15, 2026 &middot; Inventor: Michael A. Mento Jr. &middot; Assigned to RocketOpp LLC
        </p>

        {/* Plain English */}
        <section className="rounded-2xl p-6 md:p-8 mb-10" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            What it does — in plain English
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            Every business has its own voice. A law firm writes differently than a surf shop. A CEO communicates differently than a developer. When AI generates content, it usually sounds... like AI. Generic, bland, and obviously not you.
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>0nCore changes that.</strong> It learns your industry, your style, your vocabulary — then generates content that sounds like you actually wrote it. Emails, follow-ups, social posts, proposals — all in your authentic voice.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            It even gets smarter over time. It tests different ways of saying things to find what works best for your audience. And it learns from anonymous patterns across businesses similar to yours — so even on day one, it has a head start.
          </p>
        </section>

        {/* 3 Systems */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            3 systems working together
          </h2>
          <div className="space-y-6">
            {/* PACG */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black" style={{ backgroundColor: 'rgba(255,107,53,0.15)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)' }}>
                  1
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: '#ff6b35' }}>Voice Learning</h3>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Profile-Adaptive Content Generation</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                When you connect your account, 0nCore analyzes how you communicate. What words you use. What industry you&apos;re in. How formal or casual your tone is. It builds a <strong style={{ color: 'var(--text-primary)' }}>voice profile</strong> unique to you.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'Industry vocabulary', desc: 'Learns the specific terms and phrases your industry uses' },
                  { label: 'Tone calibration', desc: 'Matches your formality level — CEO vs developer vs marketer' },
                  { label: 'Authenticity gate', desc: 'Content only generates if it scores 75%+ similarity to your voice' },
                ].map((f) => (
                  <div key={f.label} className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.1)' }}>
                    <h4 className="text-xs font-bold mb-1" style={{ color: '#ff6b35' }}>{f.label}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* LVOS */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black" style={{ backgroundColor: 'rgba(255,107,53,0.15)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)' }}>
                  2
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: '#ff6b35' }}>Language Optimization</h3>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Language Variation Optimization System</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                After generating content, 0nCore doesn&apos;t just stop. It tests different ways of saying the same thing to find what your audience responds to best. Should it say &ldquo;Get started today&rdquo; or &ldquo;Let&apos;s make it happen&rdquo;? It tests, measures, and learns.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'A/B testing built in', desc: 'Automatically tests different word choices and phrasings' },
                  { label: 'Conversion tracking', desc: 'Measures which language variants actually lead to results' },
                  { label: 'Continuous learning', desc: 'Gets better with every interaction — the more you use it, the sharper it gets' },
                ].map((f) => (
                  <div key={f.label} className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.1)' }}>
                    <h4 className="text-xs font-bold mb-1" style={{ color: '#ff6b35' }}>{f.label}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CUCIA */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black" style={{ backgroundColor: 'rgba(255,107,53,0.15)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)' }}>
                  3
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: '#ff6b35' }}>Cross-User Intelligence</h3>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Conversion Intelligence Aggregator</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                Here&apos;s the secret weapon. 0nCore anonymously learns what language works best across businesses similar to yours. If law firms that say &ldquo;schedule a consultation&rdquo; convert better than those that say &ldquo;book a call&rdquo; — you&apos;ll benefit from that insight on day one.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { label: 'Privacy-first', desc: 'Only anonymous, aggregated patterns are shared — never your data' },
                  { label: 'Industry cohorts', desc: 'Grouped by industry, seniority, and business size for relevance' },
                  { label: 'Cold-start solution', desc: 'New users benefit immediately from collective intelligence' },
                ].map((f) => (
                  <div key={f.label} className="rounded-lg p-3" style={{ backgroundColor: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.1)' }}>
                    <h4 className="text-xs font-bold mb-1" style={{ color: '#ff6b35' }}>{f.label}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Before vs After */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            The difference
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.15)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: '#ff4444' }}>Without 0nCore</h3>
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                &ldquo;Dear valued customer, we wanted to reach out to inform you about our exciting new services. Please don&apos;t hesitate to contact us at your earliest convenience.&rdquo;
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Generic. Sounds like every other AI email.</p>
            </div>
            <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(126,217,87,0.05)', border: '1px solid rgba(126,217,87,0.15)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: '#6EE05A' }}>With 0nCore</h3>
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                &ldquo;Hey Sarah — quick heads up. We just launched the automation tools I mentioned in our last call. Figured you&apos;d want first crack at them. Worth a 10-minute look?&rdquo;
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Sounds like you. Because it learned from you.</p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="rounded-2xl p-6 md:p-8 mb-10" style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.06), rgba(167,139,250,0.04))', border: '1px solid rgba(255,107,53,0.15)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Your privacy is built in
          </h2>
          <div className="space-y-3">
            {[
              'Your personal data never leaves your account',
              'Cross-user intelligence uses anonymous, aggregated patterns only',
              'Minimum 20 users in any cohort before patterns are shared',
              'Patterns expire after 90 days — only fresh data informs recommendations',
              'You can opt out of cross-user learning at any time',
            ].map((point) => (
              <div key={point} className="flex gap-3">
                <span style={{ color: '#6EE05A' }}>&#10003;</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{point}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Related technology
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/technology/0nplex" className="rounded-xl p-5 no-underline group" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold text-sm mb-1 group-hover:underline" style={{ color: '#00d4ff' }}>0nPlex</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>7 AI personas for multi-perspective reasoning</p>
            </Link>
            <Link href="/turn-it-on" className="rounded-xl p-5 no-underline group" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold text-sm mb-1 group-hover:underline" style={{ color: 'var(--accent)' }}>Turn it 0n</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Browse all capabilities powered by 0nCore</p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center rounded-2xl p-8 md:p-12 mb-10" style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(126,217,87,0.06))', border: '1px solid rgba(255,107,53,0.15)' }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Ready to sound like you — at scale?
          </h2>
          <p className="text-sm mb-6 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Stop sending generic AI content. Let 0nCore learn your voice and generate content that converts.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/signup" className="btn-accent no-underline px-6 py-2.5 rounded-xl font-bold text-sm">
              Request Early Access
            </Link>
            <Link href="/technology" className="no-underline px-6 py-2.5 rounded-xl font-bold text-sm" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              Explore All Technology
            </Link>
          </div>
        </section>

        {/* Nav */}
        <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/technology/0nplex" className="text-sm font-bold no-underline" style={{ color: '#00d4ff' }}>
            &larr; 0nPlex
          </Link>
          <Link href="/technology" className="text-sm font-bold no-underline" style={{ color: 'var(--text-muted)' }}>
            All Technology &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
