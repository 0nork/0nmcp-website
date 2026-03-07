import type { Metadata } from 'next'
import Link from 'next/link'
import QRCode from '@/components/QRCode'

export const metadata: Metadata = {
  title: 'Downloads — 0nMCP',
  description:
    'Get 0nMCP everywhere — Chrome Extension, Mobile App, and Tablet App with visual builder. Install the universal AI API orchestrator on any device.',
  openGraph: {
    title: 'Downloads — 0nMCP',
    description:
      'Get 0nMCP everywhere — Chrome Extension, Mobile App, and Tablet App.',
    url: 'https://0nmcp.com/downloads',
    siteName: '0nMCP',
    type: 'website',
  },
}

export default function DownloadsPage() {
  return (
    <div className="section-container" style={{ paddingTop: 80, paddingBottom: 80 }}>
      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Get{' '}
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            0nMCP
          </span>{' '}
          everywhere
        </h1>
        <p
          className="text-lg max-w-2xl mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          Chrome Extension, Mobile App, and Tablet App with visual builder.
          819 tools across 48 services — on any device.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {/* 0nSpark — Local-First */}
        <section className="glow-box" style={{ padding: 32, borderColor: 'rgba(126,217,87,0.3)' }}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'rgba(126, 217, 87, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  0nSpark — Run Everything Free, Locally
                </h2>
              </div>

              <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--accent)' }}>Claude Code MAX</strong> = unlimited AI brain.{' '}
                <strong style={{ color: 'var(--accent)' }}>0nMCP</strong> = 850-tool orchestration layer.
                Together = <strong style={{ color: 'var(--text-primary)' }}>0nSpark</strong> — zero-cost
                workflow execution from your terminal. No API keys for Claude, no per-call charges.
              </p>

              <ul className="flex flex-col gap-2 mb-6" style={{ color: 'var(--text-secondary)' }}>
                {[
                  '850 tools across 53 services — runs locally on your machine',
                  'Claude Code provides the AI brain (unlimited with MAX subscription)',
                  '0nMCP provides the tool layer (local server, free forever)',
                  'Console auto-switches to Local Mode when 0nmcp serve is running',
                  'Works on desktop (terminal), tablet (PWA), and phone (PWA)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>&#x2713;</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4">
                <a
                  href="https://www.npmjs.com/package/0nmcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent inline-flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  npm install -g 0nmcp
                </a>
                <Link href="/console" className="btn-ghost inline-flex items-center gap-2">
                  Open Console
                </Link>
              </div>
            </div>

            <div
              className="flex-shrink-0"
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 12,
                padding: 20,
                border: '1px solid var(--border)',
                maxWidth: 340,
              }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                GET STARTED
              </h3>
              <div
                className="flex flex-col gap-3"
                style={{ color: 'var(--text-secondary)', fontSize: 13 }}
              >
                <div className="flex gap-2">
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>1.</span>
                  <div>
                    <code
                      style={{
                        background: 'var(--bg-card)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: '#7ed957',
                      }}
                    >
                      npm install -g 0nmcp
                    </code>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>2.</span>
                  <div>
                    <code
                      style={{
                        background: 'var(--bg-card)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: '#7ed957',
                      }}
                    >
                      0nmcp engine import
                    </code>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Import your API credentials</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>3.</span>
                  <div>
                    <code
                      style={{
                        background: 'var(--bg-card)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: '#7ed957',
                      }}
                    >
                      0nmcp serve --port 3001
                    </code>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Start local server</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>4.</span>
                  <span>Open the <strong>Console</strong> — it auto-detects local mode</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(126,217,87,0.06)',
                  border: '1px solid rgba(126,217,87,0.15)',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                0nmcp run publish-blog --input title=&quot;My Post&quot; content=&quot;$(cat post.md)&quot;
              </div>
            </div>
          </div>
        </section>

        {/* Chrome Extension */}
        <section className="glow-box" style={{ padding: 32 }}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'rgba(126, 217, 87, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="21.17" y1="8" x2="12" y2="8" />
                    <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                    <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Chrome Extension
                </h2>
              </div>

              <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Mini-terminal in your browser toolbar. Run 0nMCP commands without
                leaving the page. Supports both Anthropic API (streaming) and local
                server modes.
              </p>

              <ul className="flex flex-col gap-2 mb-6" style={{ color: 'var(--text-secondary)' }}>
                {[
                  '400x500px popup terminal with streaming responses',
                  'Two modes: Anthropic API direct or local 0nMCP server',
                  'Dark theme matching 0nMCP design system',
                  'Settings sync across Chrome devices',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>&#x2713;</span>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="/downloads/0nmcp-chrome-extension.zip"
                download
                className="btn-accent inline-flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Extension
              </a>
            </div>

            <div
              className="flex-shrink-0"
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 12,
                padding: 20,
                border: '1px solid var(--border)',
                maxWidth: 320,
              }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                INSTALL STEPS
              </h3>
              <ol
                className="flex flex-col gap-3"
                style={{ color: 'var(--text-secondary)', fontSize: 13 }}
              >
                <li className="flex gap-2">
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>1.</span>
                  Download the .zip file above
                </li>
                <li className="flex gap-2">
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>2.</span>
                  Unzip the downloaded file
                </li>
                <li className="flex gap-2">
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>3.</span>
                  <span>
                    Go to{' '}
                    <code
                      style={{
                        background: 'var(--bg-card)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                      }}
                    >
                      chrome://extensions
                    </code>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>4.</span>
                  Enable &quot;Developer mode&quot; (top right)
                </li>
                <li className="flex gap-2">
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>5.</span>
                  Click &quot;Load unpacked&quot; and select the unzipped folder
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Mobile App */}
        <section className="glow-box" style={{ padding: 32 }}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'rgba(126, 217, 87, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Mobile App
                </h2>
              </div>

              <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Installable PWA for managing your .0n files (add0ns) and executing
                tasks on the go. Terminal interface with streaming AI responses,
                file manager, and connection settings.
              </p>

              <ul className="flex flex-col gap-2 mb-6" style={{ color: 'var(--text-secondary)' }}>
                {[
                  'Chat-style terminal with Anthropic API streaming',
                  'Import, view, and manage .0n workflow files',
                  'Offline-capable with service worker caching',
                  'Works on iOS and Android — install from browser',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>&#x2713;</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4">
                <Link href="/app" className="btn-accent inline-flex items-center gap-2">
                  Open App
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              <QRCode />
              <p className="text-xs" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                Scan to open on your phone
              </p>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 10,
                  padding: 16,
                  border: '1px solid var(--border)',
                  maxWidth: 200,
                }}
              >
                <h4
                  className="text-xs font-semibold mb-2"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  TO INSTALL
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5 }}>
                  <strong>iOS:</strong> Tap Share &#x2192; &quot;Add to Home Screen&quot;
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>
                  <strong>Android:</strong> Tap menu &#x2192; &quot;Install app&quot;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tablet App */}
        <section className="glow-box" style={{ padding: 32 }}>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'rgba(126, 217, 87, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Tablet App
                </h2>
              </div>

              <p className="mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Everything in the mobile app plus a full drag-and-drop visual workflow
                builder. Design .0n workflows on iPad or Android tablets with the same
                builder available on the desktop site.
              </p>

              <ul className="flex flex-col gap-2 mb-6" style={{ color: 'var(--text-secondary)' }}>
                {[
                  'All mobile features: terminal, add0ns, settings',
                  'Visual builder tab appears on screens 768px+',
                  'Drag-and-drop workflow design with React Flow',
                  'Import/export .0n files directly from builder',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>&#x2713;</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4">
                <Link href="/app" className="btn-accent inline-flex items-center gap-2">
                  Open App
                </Link>
                <Link
                  href="/builder"
                  className="btn-ghost inline-flex items-center gap-2"
                >
                  Desktop Builder
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              <QRCode />
              <p className="text-xs" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                Same app — builder unlocks on tablet
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
