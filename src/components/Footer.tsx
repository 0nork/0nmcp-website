import Link from 'next/link'

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Turn it 0n', href: '/turn-it-on' },
      { label: 'Console', href: '/console' },
      { label: 'Builder', href: '/builder' },
      { label: 'Examples', href: '/examples' },
      { label: 'Downloads', href: '/downloads' },
      { label: 'Convert', href: '/convert' },
      { label: 'Demo', href: '/demo' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: 'https://github.com/0nork/0nMCP#readme', external: true },
      { label: 'GitHub', href: 'https://github.com/0nork/0nMCP', external: true },
      { label: 'npm', href: 'https://www.npmjs.com/package/0nmcp', external: true },
      { label: 'Discussions', href: 'https://github.com/0nork/0nMCP/discussions', external: true },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Forum', href: '/forum' },
      { label: 'Learn', href: '/learn' },
      { label: 'Glossary', href: '/glossary' },
      { label: 'Compare', href: '/compare' },
      { label: 'Discord', href: 'https://discord.gg/0nork', external: true },
      { label: 'Sponsor', href: '/sponsor' },
      { label: 'Report', href: '/report' },
      { label: 'Legal', href: '/legal' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { label: 'Integrations', href: '/integrations' },
      { label: 'Security', href: '/security' },
      { label: 'Partners', href: '/partners' },
      { label: 'MCPFED', href: 'https://mcpfed.com', external: true },
      { label: 'Marketplace', href: 'https://marketplace.rocketclients.com', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'RocketOpp LLC', href: 'https://rocketopp.com', external: true },
      { label: 'mike@rocketopp.com', href: 'mailto:mike@rocketopp.com', external: true },
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
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight inline-block mb-4"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
              }}
            >
              0nMCP
            </Link>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              The universal AI API orchestrator. 819 tools, 48 services,
              1,078 capabilities. Stop building workflows. Start describing
              outcomes.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-6">
              {/* GitHub */}
              <a
                href="https://github.com/0nork/0nMCP"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="social-icon"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

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
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            &copy; 2026 RocketOpp LLC. All rights reserved.
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
