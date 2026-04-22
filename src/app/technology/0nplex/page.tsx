import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nPlex — 7 AI Experts Debate Every Answer | 0nMCP Patent #64/006,268',
  description: '0nPlex sends every question to 7 AI personalities with different perspectives. They debate, challenge, and refine responses until you get the best possible answer. US Patent Application #64/006,268.',
  openGraph: {
    title: '0nPlex — 7 AI Experts Debate Every Answer',
    description: 'Instead of one AI opinion, get seven. 0nPlex assembles a panel of AI personalities that compete to give you the most accurate, well-rounded answer.',
    url: 'https://www.0nmcp.com/technology/0nplex',
  },
  alternates: { canonical: 'https://www.0nmcp.com/technology/0nplex' },
}

const PERSONAS = [
  { name: 'The Empiricist', desc: 'Only trusts hard data. Demands evidence, statistics, and proven research before accepting any claim.', colorClass: 'text-[#6EE05A]', bgClass: 'bg-[rgba(110,224,90,0.08)]', borderClass: 'border-[rgba(110,224,90,0.19)]' },
  { name: 'The Behavioralist', desc: 'Focuses on human behavior. Asks "how will real people actually react to this?" instead of assuming rational decisions.', colorClass: 'text-[#00d4ff]', bgClass: 'bg-[rgba(0,212,255,0.08)]', borderClass: 'border-[rgba(0,212,255,0.19)]' },
  { name: 'The Systems Architect', desc: 'Sees the big picture. Maps out how all the pieces connect and identifies hidden dependencies.', colorClass: 'text-violet-400', bgClass: 'bg-violet-400/[0.08]', borderClass: 'border-violet-400/[0.19]' },
  { name: 'The Ethicist', desc: 'The moral compass. Considers fairness, bias, unintended consequences, and long-term impact.', colorClass: 'text-[#ff6b35]', bgClass: 'bg-[rgba(255,107,53,0.08)]', borderClass: 'border-[rgba(255,107,53,0.19)]' },
  { name: 'The Pragmatist', desc: 'Cuts through theory to focus on what actually works. Prioritizes practical, implementable solutions.', colorClass: 'text-[#ffd700]', bgClass: 'bg-[rgba(255,215,0,0.08)]', borderClass: 'border-[rgba(255,215,0,0.19)]' },
  { name: 'The Adversary', desc: "The devil's advocate. Actively tries to break every argument, find every flaw, and expose every weakness.", colorClass: 'text-red-400', bgClass: 'bg-red-400/[0.08]', borderClass: 'border-red-400/[0.19]' },
  { name: 'The Visionary', desc: 'Thinks beyond current constraints. Proposes creative, unconventional approaches others miss.', colorClass: 'text-pink-400', bgClass: 'bg-pink-400/[0.08]', borderClass: 'border-pink-400/[0.19]' },
]

export default function PlexPage() {
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: '0nPlex Multi-Persona AI Reasoning Engine',
    description: '7 AI personalities with different perspectives debate every question to produce superior answers. Includes autonomous self-improvement and competitive scoring.',
    url: 'https://www.0nmcp.com/technology/0nplex',
    brand: { '@type': 'Organization', name: '0nMCP' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Included free with 0nMCP' },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is 0nPlex?', acceptedAnswer: { '@type': 'Answer', text: '0nPlex is a multi-persona AI reasoning engine. Instead of asking one AI model for an answer, it distributes your question across 7 distinct AI personalities — each with a different analytical perspective. They debate, score each other, and synthesize the best ideas into a single superior response.' } },
      { '@type': 'Question', name: 'What are the 7 AI personas in 0nPlex?', acceptedAnswer: { '@type': 'Answer', text: 'The 7 personas are: (1) The Empiricist — demands data and evidence, (2) The Behavioralist — focuses on human behavior, (3) The Systems Architect — sees the big picture, (4) The Ethicist — considers fairness and impact, (5) The Pragmatist — focuses on what actually works, (6) The Adversary — finds flaws, (7) The Visionary — thinks beyond constraints.' } },
      { '@type': 'Question', name: 'How does 0nPlex improve over time?', acceptedAnswer: { '@type': 'Answer', text: 'The Confidence-Gated Autonomous Compounding Knowledge Loop (CGACKL) generates 12 new training items per hour. All 7 personas evaluate each item, and only entries that score above an 82% confidence threshold get added to the knowledge base. This creates a self-improving cycle with no human supervision needed.' } },
      { '@type': 'Question', name: 'Does 0nPlex use multiple AI models?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. 0nPlex distributes the 7 personas across different AI models (Claude, GPT-4, Gemini, etc.) so no single model\'s biases dominate. The personas are randomly reassigned each session for fairness, and an anti-cheat protocol ensures genuine independent reasoning.' } },
    ],
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Technology', item: 'https://www.0nmcp.com/technology' },
      { '@type': 'ListItem', position: 3, name: '0nPlex', item: 'https://www.0nmcp.com/technology/0nplex' },
    ],
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <nav className="text-xs mb-4 flex items-center gap-1.5 text-[var(--text-muted)]" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/technology" className="hover:underline">Technology</Link>
          <span>/</span>
          <span className="text-[#00d4ff]">0nPlex</span>
        </nav>

        {/* Hero */}
        <div className="heading-glow">
          <span className="text-xs font-mono uppercase tracking-widest mb-3 block text-[#00d4ff]">
            US Patent Application #64/006,268
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4 text-[var(--text-primary)]">
            0nPlex
          </h1>
        </div>
        <p className="text-xl md:text-2xl font-medium mb-3 text-[var(--text-secondary)]">
          7 AI experts debate every answer — so you get the best one.
        </p>
        <p className="text-base mb-8 text-[var(--text-muted)]">
          Filed March 15, 2026 &middot; Inventor: Michael A. Mento Jr. &middot; Assigned to RocketOpp LLC
        </p>

        {/* Plain English */}
        <section className="rounded-2xl p-6 md:p-8 mb-10 bg-[var(--bg-card)] border border-[var(--border)]">
          <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
            What it does — in plain English
          </h2>
          <p className="text-sm leading-relaxed mb-4 text-[var(--text-secondary)]">
            When you ask a normal AI a question, you get one opinion from one brain. Sometimes it&apos;s great. Sometimes it misses something important.
          </p>
          <p className="text-sm leading-relaxed mb-4 text-[var(--text-secondary)]">
            0nPlex works differently. It sends your question to <strong className="text-[var(--text-primary)]">7 different AI personalities</strong>, each looking at your question from a completely different angle. A data scientist, a psychologist, an engineer, an ethicist, a pragmatist, a critic, and a visionary — all analyzing the same question.
          </p>
          <p className="text-sm leading-relaxed mb-4 text-[var(--text-secondary)]">
            Then they <strong className="text-[var(--text-primary)]">debate</strong>. They challenge each other&apos;s answers. They score each other. And the best ideas from all 7 are combined into one response that&apos;s better than any single AI could produce alone.
          </p>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            Think of it like having a board of advisors for every decision — except they&apos;re available 24/7 and they never get tired.
          </p>
        </section>

        {/* The 7 Personas */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">
            Meet the 7 personas
          </h2>
          <div className="space-y-3">
            {PERSONAS.map((p, i) => (
              <div key={p.name} className="flex items-start gap-4 rounded-xl p-5 bg-[var(--bg-card)] border border-[var(--border)]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${p.bgClass} ${p.colorClass} border ${p.borderClass}`}>
                  {i + 1}
                </div>
                <div>
                  <h3 className={`font-bold text-sm mb-1 ${p.colorClass}`}>{p.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 Key Innovations */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">
            4 innovations that make it work
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-xl p-5 bg-[var(--bg-card)] border border-[var(--border)]">
              <h3 className="font-bold text-sm mb-2 text-[#00d4ff]">1. Multi-Model Distribution</h3>
              <p className="text-sm mb-2 text-[var(--text-secondary)]">
                The 7 personas are spread across different AI models — Claude, GPT-4, Gemini, and more. This prevents any single model&apos;s biases from dominating the answer.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Personas are randomly reassigned each session for fairness.
              </p>
            </div>
            <div className="rounded-xl p-5 bg-[var(--bg-card)] border border-[var(--border)]">
              <h3 className="font-bold text-sm mb-2 text-[#00d4ff]">2. Dual-Track Scoring</h3>
              <p className="text-sm mb-2 text-[var(--text-secondary)]">
                Two independent scoreboards run simultaneously: one tracks which persona gives the best answers, and another tracks which AI model performs best. Both improve over time.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Scores are locked once recorded — no retroactive changes.
              </p>
            </div>
            <div className="rounded-xl p-5 bg-[var(--bg-card)] border border-[var(--border)]">
              <h3 className="font-bold text-sm mb-2 text-[#00d4ff]">3. Self-Improving Knowledge</h3>
              <p className="text-sm mb-2 text-[var(--text-secondary)]">
                The system automatically generates 12 new training items every hour. All 7 personas evaluate each one. Only high-confidence entries (82%+) make it into the knowledge base.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                No human supervision needed — the system improves on its own.
              </p>
            </div>
            <div className="rounded-xl p-5 bg-[var(--bg-card)] border border-[var(--border)]">
              <h3 className="font-bold text-sm mb-2 text-[#00d4ff]">4. Anonymous Learning Network</h3>
              <p className="text-sm mb-2 text-[var(--text-secondary)]">
                Opt-in every 10 sessions to anonymously contribute your AI&apos;s learnings to the network. In return, you benefit from insights gathered across all participating users.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                All personal information is stripped before contribution.
              </p>
            </div>
          </div>
        </section>

        {/* Why it matters */}
        <section className="rounded-2xl p-6 md:p-8 mb-10 bg-[linear-gradient(135deg,rgba(0,212,255,0.06),rgba(167,139,250,0.04))] border border-[rgba(0,212,255,0.15)]">
          <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
            Why this is a game changer
          </h2>
          <div className="space-y-4">
            {[
              { point: 'Better answers', detail: "When 7 perspectives analyze a problem, blind spots get caught. The Adversary finds flaws the Visionary misses. The Ethicist catches risks the Pragmatist overlooks." },
              { point: 'Less bias', detail: "Using multiple AI models prevents any single provider's training biases from controlling the output. You get a more balanced, well-rounded perspective." },
              { point: 'Gets smarter over time', detail: "The self-improving knowledge loop means every answer today is better than yesterday's. The system compounds its own intelligence without human intervention." },
              { point: 'Your privacy is protected', detail: "The anonymous learning network strips all personal data. You benefit from collective intelligence without exposing your information." },
            ].map((item) => (
              <div key={item.point} className="flex gap-3">
                <span className="shrink-0 text-[#00d4ff]">&#9679;</span>
                <div>
                  <strong className="text-sm text-[var(--text-primary)]">{item.point}:</strong>{' '}
                  <span className="text-sm text-[var(--text-secondary)]">{item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
            Related technology
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/technology/0ncore" className="rounded-xl p-5 no-underline group bg-[var(--bg-card)] border border-[var(--border)]">
              <h3 className="font-bold text-sm mb-1 group-hover:underline text-[#ff6b35]">0nCore</h3>
              <p className="text-xs text-[var(--text-muted)]">AI that writes in your voice — adaptive content generation</p>
            </Link>
            <Link href="/integrations" className="rounded-xl p-5 no-underline group bg-[var(--bg-card)] border border-[var(--border)]">
              <h3 className="font-bold text-sm mb-1 group-hover:underline text-[var(--accent)]">Integrations</h3>
              <p className="text-xs text-[var(--text-muted)]">See all 54 services that 0nPlex can orchestrate</p>
            </Link>
          </div>
        </section>

        {/* Nav */}
        <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
          <Link href="/technology/0nvault" className="text-sm font-bold no-underline text-violet-400">
            &larr; 0nVault
          </Link>
          <Link href="/technology/0ncore" className="text-sm font-bold no-underline text-[#ff6b35]">
            0nCore &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
