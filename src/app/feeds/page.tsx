import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RSS Feeds — 0nMCP',
  description:
    'Subscribe to 0nMCP RSS feeds for blog updates, changelogs, and white-label SXO content you can drop into your own blog.',
  openGraph: {
    title: 'RSS Feeds — 0nMCP',
    description: 'Blog, changelog, and white-label SXO content feeds.',
    url: 'https://0nmcp.com/feeds',
  },
  alternates: { canonical: 'https://0nmcp.com/feeds' },
}

const FEEDS = [
  {
    name: 'Blog',
    description: 'Release notes, tutorials, and deep-dives from the 0nMCP team.',
    url: '/api/feed/blog',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2',
    color: '#7ed957',
    formats: ['rss', 'atom', 'json'],
  },
  {
    name: 'Changelog',
    description: 'Version history and release notes for the 0nMCP platform.',
    url: '/api/feed/changelog',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    color: '#00d4ff',
    formats: ['rss', 'atom', 'json'],
  },
  {
    name: 'SXO White-Label',
    description: 'SEO-optimized content you can white-label and drop into your own blog. Personalized to your brand, industry, and location.',
    url: '/api/feed/sxo',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    color: '#a78bfa',
    formats: ['rss', 'atom', 'json'],
    parameterized: true,
  },
]

export default function FeedsPage() {
  return (
    <main
      className="min-h-screen px-4 py-16 md:px-8"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            RSS Feeds
          </h1>
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            Subscribe to 0nMCP feeds in your favorite reader, blog platform, or automation tool.
            All feeds support RSS 2.0, Atom 1.0, and JSON Feed.
          </p>
        </div>

        {/* Feed Cards */}
        <div className="space-y-4 mb-12">
          {FEEDS.map(feed => (
            <div
              key={feed.name}
              className="rounded-xl p-5"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: feed.color + '15' }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={feed.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={feed.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {feed.name}
                  </h2>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                    {feed.description}
                  </p>

                  {/* Format buttons */}
                  <div className="flex flex-wrap gap-2">
                    {feed.formats.map(fmt => (
                      <a
                        key={fmt}
                        href={`${feed.url}${fmt !== 'rss' ? `?format=${fmt}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all no-underline"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--border)',
                          color: feed.color,
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 11a9 9 0 019 9" />
                          <path d="M4 4a16 16 0 0116 16" />
                          <circle cx="5" cy="19" r="1" />
                        </svg>
                        {fmt.toUpperCase()}
                      </a>
                    ))}
                    <a
                      href={feed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium no-underline transition-all"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      View Feed
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SXO White-Label Section */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            White-Label SXO Content
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Generate SEO-optimized blog content personalized to your brand. Subscribe to the feed
            from WordPress, Ghost, or any blog platform — fresh content appears automatically.
          </p>

          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            How it works
          </h3>
          <ol className="text-sm space-y-2 mb-4" style={{ color: 'var(--text-secondary)', paddingLeft: '1.2rem' }}>
            <li>Build your feed URL with your brand details</li>
            <li>Subscribe in your blog platform&apos;s RSS import</li>
            <li>Content auto-publishes to your blog, branded as yours</li>
            <li>Each article is SEO-optimized using the SXO formula</li>
          </ol>

          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Parameters
          </h3>
          <div
            className="rounded-lg p-4 text-xs overflow-x-auto mb-4"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
            }}
          >
            <pre style={{ margin: 0 }}>{`/api/feed/sxo?brand=Wallwork+Hardscape
  &industry=contractor
  &services=paving,retaining+walls,landscaping
  &location=Pittsburgh+PA
  &domain=wallworkhardscape.com
  &format=rss`}</pre>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-2 pr-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Param</th>
                  <th className="text-left py-2 pr-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Required</th>
                  <th className="text-left py-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Description</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-secondary)' }}>
                {[
                  ['brand', 'Yes', 'Your business name'],
                  ['industry', 'No', 'Vertical: contractor, saas, agency, etc.'],
                  ['services', 'No', 'Comma-separated services you offer'],
                  ['location', 'No', 'Primary service area'],
                  ['cta', 'No', 'Custom call-to-action text'],
                  ['domain', 'No', 'Your domain for canonical links'],
                  ['format', 'No', 'rss (default), atom, or json'],
                ].map(([param, req, desc]) => (
                  <tr key={param} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-2 pr-3 font-mono" style={{ color: '#a78bfa' }}>{param}</td>
                    <td className="py-2 pr-3">{req}</td>
                    <td className="py-2">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Automation section */}
        <div className="mt-8 mb-6">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Use feeds in automations
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            0nMCP feeds work with any RSS-compatible tool — Zapier, Make, n8n, WordPress,
            Ghost, IFTTT, or your own code. Subscribe, transform, and republish.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'Auto-post to blog', desc: 'WordPress/Ghost RSS import → auto-publish SXO content' },
              { label: 'Slack notifications', desc: 'New blog post → Slack channel alert' },
              { label: 'Email digest', desc: 'Weekly changelog → email to subscribers' },
              { label: 'Social syndication', desc: 'New post → auto-share on LinkedIn, X, Reddit' },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-lg p-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}
              >
                <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {item.label}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
