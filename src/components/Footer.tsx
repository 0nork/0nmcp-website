import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'
import Image from 'next/image'

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Integrations', href: '/integrations' },
      { label: 'Turn it 0n', href: '/turn-it-on' },
      { label: 'Security', href: '/security' },
      { label: 'Technology', href: '/technology' },
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Compare', href: '/compare' },
      { label: 'Examples', href: '/examples' },
    ],
  },
  {
    title: '0n Ecosystem',
    links: [
      { label: 'RocketOpp — custom AI development', href: 'https://rocketopp.com', external: true },
      { label: '0nCore — AI command center', href: 'https://0ncore.com', external: true },
      // Points at our own page first so link equity lands here and forwards on,
      // rather than passing straight out to the product domain.
      { label: '0nTask — MCP task manager', href: '/ecosystem/0ntask' },
      { label: 'CRO9 — conversion optimization', href: 'https://www.cro9.com', external: true },
      { label: 'web0n — AI website builder', href: 'https://web0n.com', external: true },
      { label: 'social0n — AI social content', href: 'https://social0n.com', external: true },
      { label: 'SXO — search experience optimization', href: 'https://sxowebsite.com', external: true },
      { label: 'VerifiedSXO — verified agencies', href: 'https://verifiedsxo.com', external: true },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Try Free', href: 'https://0ncore.com', external: true },
      { label: 'npm', href: 'https://www.npmjs.com/package/0nmcp', external: true },
      { label: '.0n Standard', href: '/0n-standard' },
      { label: 'Builder', href: '/builder' },
      { label: 'Convert', href: '/convert' },
      { label: 'Downloads', href: '/downloads' },
      { label: 'Forum', href: 'https://0ncore.com/community', external: true },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Courses', href: '/learn' },
      { label: 'Forum', href: '/forum' },
      { label: 'Glossary', href: '/glossary' },
      { label: 'Demo', href: '/demo' },
      { label: 'Discord', href: 'https://discord.gg/0nork', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'RocketOpp LLC', href: 'https://rocketopp.com', external: true },
      { label: 'Partners', href: '/partners' },
      { label: 'Affiliates', href: '/affiliates' },
      { label: 'Sponsor', href: '/sponsor' },
      { label: 'Contact', href: 'mailto:mike@rocketopp.com', external: true },
      { label: 'Legal', href: '/legal' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
]

export default function Footer() {
  return (
    <footer
      className="relative z-[1]"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="section-container py-16">
        {/* Top section: Logo + columns */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Logo column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image src="/brand/0nmcp-logo-dark.svg" alt="0nMCP" width={130} height={46} style={{ objectFit: 'contain' }} />
            </Link>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              The universal AI API orchestrator. {STATS_DISPLAY.tools} tools, {STATS_DISPLAY.services} services,{' '}
              {STATS_DISPLAY.capabilities} capabilities. Stop building workflows. Start describing
              outcomes.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-6">
              {/* npm */}
              <a
                href="https://www.npmjs.com/package/0nmcp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="npm"
                className="social-icon"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
                </svg>
              </a>

              {/* Discord */}
              <a
                href="https://discord.gg/0nork"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="social-icon"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {column.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="footer-link text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <span>&copy; 2026 RocketOpp LLC. All rights reserved.</span>
            <span>&middot;</span>
            <Link href="/privacy" style={{ color: 'var(--text-muted)' }} className="hover:underline">Privacy Policy</Link>
            <span>&middot;</span>
            <Link href="/legal" style={{ color: 'var(--text-muted)' }} className="hover:underline">Legal</Link>
          </p>
          <p
            className="text-xs"
            style={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Built with the{' '}
            <Link
              href="/0n-standard"
              style={{ color: 'var(--accent)' }}
            >
              .0n Standard
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
