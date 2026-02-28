'use client'

import { useState } from 'react'
import { ExternalLink, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'

const COMMUNITY_URL = 'https://0n.app.clientclub.net/communities/groups/the-0nboard/home'

export function CommunityView() {
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className={`flex flex-col h-full ${fullscreen ? 'fixed inset-0 z-[60]' : ''}`}>
      {/* Toolbar */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-2"
        style={{
          backgroundColor: fullscreen ? 'var(--bg-primary)' : 'transparent',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] font-bold"
            style={{ color: 'var(--accent)' }}
          >
            The 0nBoard
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Community Hub
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => {
              setLoading(true)
              const iframe = document.getElementById('community-frame') as HTMLIFrameElement
              if (iframe) iframe.src = iframe.src
            }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Open in new tab */}
          <a
            href={COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Iframe container */}
      <div className="flex-1 relative min-h-0">
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                }}
              >
                <span className="text-xs font-black" style={{ color: 'var(--bg-primary)' }}>
                  0n
                </span>
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Loading community...
              </span>
            </div>
          </div>
        )}

        <iframe
          id="community-frame"
          src={COMMUNITY_URL}
          className="w-full h-full border-0"
          style={{
            backgroundColor: '#0a0a0f',
            colorScheme: 'dark',
          }}
          onLoad={() => setLoading(false)}
          allow="clipboard-write"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  )
}
