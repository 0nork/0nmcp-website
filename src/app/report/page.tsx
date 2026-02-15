import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Report Infringement -- Brand Impersonation & IP Violation Reporting',
  description:
    'Report unauthorized use of the 0nMCP, 0nORK, or 0n brand. Impersonation, trademark infringement, patent violations, and brand abuse are actively investigated and prosecuted.',
  openGraph: {
    title: 'Report Infringement -- 0nMCP IP Violation Reporting',
    description:
      'Report impersonators, trademark infringement, and IP violations against 0nMCP and the 0n ecosystem.',
    url: 'https://0nmcp.com/report',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Report Infringement -- 0nMCP',
    description:
      'Report brand impersonation and IP violations against the 0n ecosystem.',
  },
  alternates: { canonical: 'https://0nmcp.com/report' },
  robots: { index: true, follow: true },
}

const infringementTypes = [
  {
    title: 'Brand Impersonation',
    desc: 'Creating accounts, profiles, or websites that claim to be 0nMCP, 0nORK, or any 0n-affiliated entity.',
    example: 'A Twitter/X account named "@0nmcp_official" not operated by RocketOpp',
  },
  {
    title: 'Package Squatting',
    desc: 'Publishing packages on npm, PyPI, or other registries using names identical or confusingly similar to 0n marks.',
    example: 'An npm package named "0nmcp-pro" or "onmcp" not published by 0nork',
  },
  {
    title: 'Domain Cybersquatting',
    desc: 'Registering domain names containing "0nmcp", "0nork", or variations to profit from brand confusion.',
    example: 'Domains like "0nmcp.io", "0nork.app", "0nmcp-download.com"',
  },
  {
    title: 'Code Rebranding',
    desc: 'Forking open-source code and redistributing it under a confusingly similar name or with 0n branding intact.',
    example: 'A GitHub repo called "0nMCP-Enhanced" used commercially',
  },
  {
    title: 'Patent Infringement',
    desc: 'Implementing the patented Three-Level Execution Hierarchy or MCP Federation architecture without license.',
    example: 'A competing product using Pipeline, Assembly Line, Radial Burst terminology',
  },
  {
    title: 'Unauthorized Commercial Use',
    desc: 'Using 0n marks, technology, or branding to promote, sell, or market products without written consent.',
    example: 'An agency advertising "Powered by 0nMCP" without a partnership agreement',
  },
]

const protectedMarks = [
  { mark: '0nMCP', type: 'Software' },
  { mark: '0nORK', type: 'Parent Brand' },
  { mark: '0n-spec', type: 'Config Standard' },
  { mark: '.0n Standard', type: 'File Format' },
  { mark: '0nData', type: 'CRM Backend' },
  { mark: '0n Apps', type: 'Marketplace' },
  { mark: '0nork', type: 'Namespace' },
  { mark: '0n [prefix]', type: 'Trade Dress' },
]

const processSteps = [
  { step: '1', title: 'Report Received & Triaged', desc: 'Your report is logged and assigned to an investigator. You receive a confirmation email.', time: 'Within 24 hours' },
  { step: '2', title: 'Investigation & Documentation', desc: 'We capture evidence including screenshots, WHOIS records, and archived pages. All evidence is preserved.', time: '24 - 48 hours' },
  { step: '3', title: 'Cease-and-Desist Issued', desc: 'A formal cease-and-desist letter is sent demanding immediate removal of infringing content.', time: '48 - 72 hours' },
  { step: '4', title: 'Platform Takedown Requests', desc: 'DMCA notices filed with GitHub, npm, hosting providers, and domain registrars.', time: '72 hours - 1 week' },
  { step: '5', title: 'Legal Escalation', desc: 'If unresolved, the matter is referred to legal counsel for federal court filing or UDRP proceedings.', time: '1 - 2 weeks' },
]

export default function ReportPage() {
  return (
    <>
      {/* ============================================
          HERO
          ============================================ */}
      <section className="pt-40 pb-16 px-8 text-center relative z-[1]">
        <div
          className="absolute w-[500px] h-[500px] top-[5%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)',
          }}
        />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 relative z-[2]">
          Report Brand Impersonation
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #ff6b35, #ef4444)',
            }}
          >
            &amp; Intellectual Property Violations
          </span>
        </h1>
        <p
          className="text-lg max-w-[680px] mx-auto leading-relaxed relative z-[2]"
          style={{ color: 'var(--text-secondary)' }}
        >
          If you have encountered any person, organization, repository, package,
          domain, or service impersonating 0nMCP&trade;, 0nORK&trade;, or any
          component of the 0n ecosystem, report it here. We investigate every
          report and respond within 24 hours.
        </p>
      </section>

      <div className="max-w-[900px] mx-auto px-8 py-12 relative z-[1]">
        {/* ALERT BANNER */}
        <div
          className="rounded-xl p-8 mb-12 text-center"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '2px solid rgba(239,68,68,0.3)',
          }}
        >
          <h2
            className="text-xl font-bold mb-3"
            style={{ color: '#ef4444' }}
          >
            We Are Aware of Active Impersonators
          </h2>
          <p
            className="text-[0.95rem] leading-relaxed max-w-[600px] mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            RocketOpp, LLC has identified unauthorized use of our brand and
            technology. Enforcement actions are underway. If you have
            information about impersonators, your report directly supports our
            legal proceedings. All reporters are kept confidential.
          </p>
        </div>

        {/* INFRINGEMENT TYPES */}
        <span
          className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
          style={{ color: '#ff6b35' }}
        >
          What to Report
        </span>
        <h2 className="text-2xl font-bold mb-2">Types of Infringement</h2>
        <p
          className="text-base leading-relaxed mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          The following activities violate our intellectual property rights. If
          you see any of these, please report it immediately.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {infringementTypes.map((type) => (
            <div
              key={type.title}
              className="p-6 rounded-xl transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className="text-base font-semibold mb-2">{type.title}</h3>
              <p
                className="text-sm leading-relaxed mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                {type.desc}
              </p>
              <div
                className="font-mono text-xs pt-3"
                style={{
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <strong style={{ color: '#ef4444' }}>Example:</strong>{' '}
                {type.example}
              </div>
            </div>
          ))}
        </div>

        {/* PROTECTED MARKS */}
        <span
          className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
          style={{ color: '#ff6b35' }}
        >
          Protected Marks
        </span>
        <h2 className="text-2xl font-bold mb-2">
          Marks Owned by RocketOpp, LLC
        </h2>
        <p
          className="text-base leading-relaxed mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          These marks are claimed as trademarks under US common law. Any
          unauthorized use may constitute infringement.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
          {protectedMarks.map((m) => (
            <div
              key={m.mark}
              className="text-center p-4 rounded-lg font-mono text-sm font-semibold"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              {m.mark}&trade;
              <span
                className="block text-[0.7rem] font-normal mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {m.type}
              </span>
            </div>
          ))}
        </div>

        {/* REPORT FORM */}
        <div
          className="rounded-2xl p-10 mb-12"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          <h2 className="text-xl font-bold mb-2">
            Submit an Infringement Report
          </h2>
          <p
            className="text-sm mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            All reports are investigated by our legal team. You will receive a
            confirmation within 24 hours. Your identity will be kept
            confidential unless disclosure is required by law.
          </p>

          <form
            action="https://formspree.io/f/xwpkjvwq"
            method="POST"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label
                  htmlFor="reporter-name"
                  className="block font-mono text-xs uppercase tracking-wide mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="reporter-name"
                  name="name"
                  placeholder="Full name"
                  required
                  className="w-full px-4 py-3 rounded-lg font-sans text-[0.95rem] outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="reporter-email"
                  className="block font-mono text-xs uppercase tracking-wide mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Your Email
                </label>
                <input
                  type="email"
                  id="reporter-email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-lg font-sans text-[0.95rem] outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <div className="mb-5">
              <label
                htmlFor="infr-type"
                className="block font-mono text-xs uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Type of Infringement
              </label>
              <select
                id="infr-type"
                name="type"
                required
                className="w-full px-4 py-3 rounded-lg font-sans text-[0.95rem] outline-none cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Select a category...</option>
                <option value="impersonation">Brand Impersonation</option>
                <option value="package-squatting">
                  Package Squatting (npm, PyPI, etc.)
                </option>
                <option value="domain-squatting">Domain Cybersquatting</option>
                <option value="code-rebranding">
                  Code Rebranding / Unauthorized Fork
                </option>
                <option value="patent">Patent Infringement</option>
                <option value="commercial">
                  Unauthorized Commercial Use
                </option>
                <option value="social-media">
                  Social Media Impersonation
                </option>
                <option value="other">Other / Multiple Violations</option>
              </select>
            </div>

            <div className="mb-5">
              <label
                htmlFor="infr-url"
                className="block font-mono text-xs uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                URL of Infringing Content
              </label>
              <input
                type="url"
                id="infr-url"
                name="url"
                placeholder="https://..."
                required
                className="w-full px-4 py-3 rounded-lg font-sans text-[0.95rem] outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              <span
                className="text-xs mt-1 block"
                style={{ color: 'var(--text-muted)' }}
              >
                GitHub repo, npm package, domain, social profile, etc.
              </span>
            </div>

            <div className="mb-5">
              <label
                htmlFor="infr-desc"
                className="block font-mono text-xs uppercase tracking-wide mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Description of Infringement
              </label>
              <textarea
                id="infr-desc"
                name="description"
                placeholder="Describe what you found, when you found it, and how it infringes on 0n IP."
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg font-sans text-[0.95rem] outline-none transition-colors resize-y"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <input
              type="hidden"
              name="_subject"
              value="[0nMCP INFRINGEMENT REPORT] New report submitted"
            />

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-mono font-bold text-sm border-none cursor-pointer transition-all"
              style={{
                backgroundColor: '#ff6b35',
                color: 'var(--bg-primary)',
              }}
            >
              Submit Infringement Report
            </button>
          </form>
        </div>

        {/* PROCESS TIMELINE */}
        <span
          className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
          style={{ color: '#ff6b35' }}
        >
          What Happens Next
        </span>
        <h2 className="text-2xl font-bold mb-2">Our Enforcement Process</h2>
        <p
          className="text-base leading-relaxed mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          Every report is taken seriously. Here is our standard enforcement
          timeline after receiving a valid report.
        </p>

        <div className="flex flex-col gap-0 mb-12">
          {processSteps.map((step, i) => (
            <div key={step.step} className="flex gap-6 relative pb-8">
              {i < processSteps.length - 1 && (
                <div
                  className="absolute left-[23px] top-[48px] w-0.5 bottom-0"
                  style={{ backgroundColor: 'var(--border)' }}
                />
              )}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-mono font-bold text-sm relative z-[2]"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                {step.step}
              </div>
              <div className="pt-2">
                <h3 className="text-base font-semibold mb-1">{step.title}</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {step.desc}
                </p>
                <span
                  className="font-mono text-xs mt-1 block"
                  style={{ color: 'var(--accent)' }}
                >
                  {step.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ALTERNATIVE CONTACT */}
        <span
          className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
          style={{ color: '#ff6b35' }}
        >
          Other Ways to Report
        </span>
        <h2 className="text-2xl font-bold mb-2">Contact Us Directly</h2>
        <p
          className="text-base leading-relaxed mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          If you prefer not to use the form above, you can report infringement
          through any of these channels.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: 'Email',
              desc: 'Send details to our legal team for fastest response.',
              link: 'mailto:legal@rocketopp.com',
              cta: 'legal@rocketopp.com',
            },
            {
              title: 'GitHub',
              desc: 'Open an issue in our main repository for public reports.',
              link: 'https://github.com/0nork/0nMCP/issues',
              cta: '0nork/0nMCP Issues',
            },
            {
              title: 'General Contact',
              desc: 'Reach the founder directly for urgent matters.',
              link: 'mailto:mike@rocketopp.com',
              cta: 'mike@rocketopp.com',
            },
          ].map((method) => (
            <div
              key={method.title}
              className="text-center p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <h3 className="text-[0.95rem] font-semibold mb-2">
                {method.title}
              </h3>
              <p
                className="text-xs leading-relaxed mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                {method.desc}
              </p>
              <a
                href={method.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium no-underline hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                {method.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
