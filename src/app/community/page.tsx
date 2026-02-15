import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community -- Join the AI Orchestration Movement',
  description:
    'Join the 0nMCP community. Contribute to the most comprehensive MCP server available. 59 services, 1,385+ capabilities, open source forever. GitHub Discussions, contribution guides, and unlock roadmap.',
  openGraph: {
    title: 'Community -- 0nMCP | Join the AI Orchestration Movement',
    description:
      'Join the 0nMCP community. 59 services, 1,385+ capabilities, open source forever. Help shape the future of AI orchestration.',
    url: 'https://0nmcp.com/community',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community -- 0nMCP',
    description:
      '59 services. 1,385+ capabilities. Open source forever. Join the movement.',
  },
  alternates: { canonical: 'https://0nmcp.com/community' },
}

const phases = [
  { num: 0, name: 'Foundation', trigger: 'Live Now', active: true },
  { num: 1, name: 'Essential Expansion', trigger: '100 Stars / $500 MRR', active: false },
  { num: 2, name: 'Full Stack', trigger: '500 Stars / $2K MRR', active: false },
  { num: 3, name: 'Platform', trigger: '1K Stars / $5K MRR', active: false },
  { num: 4, name: 'Industry Packs', trigger: '5K Stars / $15K MRR', active: false },
  { num: 5, name: 'Ecosystem Dominance', trigger: '10K Stars / $50K MRR', active: false },
  { num: 6, name: 'The Singularity', trigger: '25K+ Stars / $100K+ MRR', active: false },
]

export default function CommunityPage() {
  return (
    <>
      {/* ============================================
          HERO
          ============================================ */}
      <section className="pt-40 pb-16 px-8 text-center relative">
        <div
          className="absolute w-[500px] h-[500px] top-[5%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          }}
        />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 relative z-[2]">
          Build the Future of
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            }}
          >
            AI Orchestration
          </span>
        </h1>
        <p
          className="text-lg max-w-[640px] mx-auto leading-relaxed relative z-[2]"
          style={{ color: 'var(--text-secondary)' }}
        >
          0nMCP is built in the open by developers who believe AI orchestration
          should be free, composable, and community-owned. Every contribution
          makes the platform more powerful for everyone.
        </p>
      </section>

      {/* ============================================
          COMMUNITY STATS
          ============================================ */}
      <section className="py-20 px-8">
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            By the Numbers
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
            Community Stats
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '59', label: 'Services integrated' },
              { num: '1,385+', label: 'Capabilities' },
              { num: '13', label: 'Categories' },
              { num: '3', label: 'npm packages' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glow-box text-center py-8"
              >
                <div
                  className="font-mono text-4xl font-bold mb-2"
                  style={{ color: 'var(--accent)' }}
                >
                  {stat.num}
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          WAYS TO CONTRIBUTE
          ============================================ */}
      <section
        className="py-20 px-8"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Get Involved
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Ways to Contribute
          </h2>
          <p
            className="text-base mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Whether you are adding services, fixing bugs, improving docs, or
            just spreading the word -- every contribution matters.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'GitHub Discussions',
                desc: 'Ask questions, share ideas, show off what you have built, and connect with other developers.',
                link: 'https://github.com/0nork/0nMCP/discussions',
                cta: 'Join the conversation',
              },
              {
                title: 'Add a Service',
                desc: 'Drop a definition into catalog.js. Every service makes 0nMCP more useful for the entire community.',
                link: 'https://github.com/0nork/0nMCP/blob/main/CONTRIBUTING.md',
                cta: 'Read the guide',
              },
              {
                title: 'Report Bugs',
                desc: 'Found something broken? Open an issue. We triage fast and fix faster.',
                link: 'https://github.com/0nork/0nMCP/issues',
                cta: 'Open an issue',
              },
              {
                title: 'Star the Repo',
                desc: 'It takes 2 seconds and helps more than you think. Stars unlock new capabilities on the roadmap.',
                link: 'https://github.com/0nork/0nMCP',
                cta: 'Star on GitHub',
              },
              {
                title: 'Sponsor',
                desc: 'Fund the next unlock. Your sponsorship keeps 0nMCP free and open source.',
                link: 'https://github.com/sponsors/0nork',
                cta: 'Become a sponsor',
              },
              {
                title: 'Spread the Word',
                desc: 'Tell a developer friend. Post on X/Twitter. Write a blog post. Every mention grows the community.',
                link: 'https://twitter.com/intent/tweet?text=0nMCP%20-%2059%20services,%201385%20capabilities,%20zero%20config.%20The%20universal%20AI%20API%20orchestrator.&url=https://0nmcp.com',
                cta: 'Share on X',
              },
            ].map((card) => (
              <div key={card.title} className="glow-box">
                <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {card.desc}
                </p>
                <a
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs font-semibold tracking-wide no-underline hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  {card.cta} &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          QUICK START
          ============================================ */}
      <section className="py-20 px-8">
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Quick Start
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
            Your First Contribution
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                step: '1',
                title: 'Fork & Clone',
                desc: 'Fork the repo on GitHub, then clone it locally.',
                code: 'git clone https://github.com/YOUR_USERNAME/0nMCP.git',
              },
              {
                step: '2',
                title: 'Install Dependencies',
                desc: 'Just one dependency. Minimal by design.',
                code: 'cd 0nMCP && npm install',
              },
              {
                step: '3',
                title: 'Make Your Change',
                desc: 'Add a service to catalog.js, fix a bug, improve docs. Every tool is config-driven -- no boilerplate needed.',
                code: null,
              },
              {
                step: '4',
                title: 'Submit a PR',
                desc: 'Push your branch and open a pull request. We review PRs quickly and merge contributions that match quality standards.',
                code: null,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-5 p-6 rounded-xl"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <span
                  className="font-mono text-2xl font-bold flex-shrink-0"
                  style={{ color: 'var(--accent)' }}
                >
                  {item.step}
                </span>
                <div>
                  <h3 className="text-base font-bold mb-1">{item.title}</h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {item.desc}
                  </p>
                  {item.code && (
                    <code
                      className="font-mono text-xs mt-2 inline-block px-3 py-1 rounded"
                      style={{
                        color: 'var(--accent)',
                        backgroundColor: 'rgba(0,255,136,0.08)',
                      }}
                    >
                      {item.code}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          UNLOCK ROADMAP PREVIEW
          ============================================ */}
      <section
        className="py-20 px-8"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1000px] mx-auto">
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,212,255,0.05))',
              border: '1px solid rgba(0,255,136,0.1)',
            }}
          >
            <h3 className="text-xl font-bold mb-3">
              The Community Unlock Roadmap
            </h3>
            <p
              className="text-base max-w-[600px] mx-auto mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              0nMCP grows with its community. Every milestone unlocks new
              capabilities -- the more developers who join, the more powerful
              the platform becomes. Every unlock is permanent and free forever.
            </p>

            <div className="flex justify-center gap-3 flex-wrap mb-8">
              {phases.map((phase) => (
                <span
                  key={phase.num}
                  className="font-mono text-[0.7rem] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full"
                  style={
                    phase.active
                      ? {
                          backgroundColor: 'var(--accent)',
                          color: 'var(--bg-primary)',
                        }
                      : {
                          border: '1px solid var(--border)',
                          color: 'var(--text-muted)',
                        }
                  }
                >
                  Phase {phase.num} -- {phase.trigger}
                </span>
              ))}
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <a href="/sponsor" className="btn-accent no-underline">
                See Full Unlock Schedule
              </a>
              <a
                href="https://github.com/0nork/0nMCP"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost no-underline"
              >
                Star the Repo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          VALUES
          ============================================ */}
      <section className="py-20 px-8">
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Our Values
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
            What We Believe
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Free and Open Source Forever',
                desc: 'AI orchestration is infrastructure. It should be accessible to every developer, not locked behind enterprise paywalls or monthly subscriptions. MIT licensed, always.',
              },
              {
                title: 'Ship Weekly',
                desc: 'The codebase is active. We push updates constantly. This is not a side project -- it is infrastructure being built at startup speed by people who use it every day.',
              },
              {
                title: 'Community Owned',
                desc: 'Every unlock milestone is hit by the community, not by a sales team. The more developers who join, the more powerful the platform becomes for everyone.',
              },
              {
                title: 'Config, Not Code',
                desc: 'Adding services takes minutes, not hours. Every tool is defined as configuration. Drop it in the catalog and it works. Zero boilerplate, zero ceremony.',
              },
            ].map((value) => (
              <div key={value.title} className="glow-box">
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section className="py-24 px-8 text-center">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Ready to Join?
          </h2>
          <p
            className="text-base max-w-[550px] mx-auto leading-relaxed mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            The best orchestration platform is the one built by the people who
            use it. Start contributing today.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="https://github.com/0nork/0nMCP/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent no-underline"
            >
              Join GitHub Discussions
            </a>
            <a
              href="https://github.com/0nork/0nMCP"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost no-underline"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
