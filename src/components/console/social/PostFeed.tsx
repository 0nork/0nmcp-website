'use client'

// ─── Types ───────────────────────────────────────────────────────

interface PostResult {
  platform: string
  success: boolean
  url?: string
}

interface FeedPost {
  id: string
  content: string
  platforms: string[]
  hashtags: string[]
  status: 'posted' | 'failed' | 'scheduled' | 'pending'
  createdAt: string
  results?: PostResult[]
}

interface PostFeedProps {
  posts: FeedPost[]
}

// ─── Helpers ─────────────────────────────────────────────────────

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: '#0077b5',
  facebook: '#1877f2',
  instagram: '#e4405f',
  x_twitter: '#000000',
  google: '#4285f4',
  reddit: '#ff4500',
  dev_to: '#0a0a0a',
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
  x_twitter: 'X',
  google: 'Google',
  reddit: 'Reddit',
  dev_to: 'Dev.to',
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  posted: { color: '#7ed957', bg: 'rgba(126,217,87,0.1)', label: 'Posted' },
  failed: { color: '#ff6b6b', bg: 'rgba(255,59,48,0.1)', label: 'Failed' },
  scheduled: { color: '#ffbb33', bg: 'rgba(255,187,51,0.1)', label: 'Scheduled' },
  pending: { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.04)', label: 'Pending' },
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str
  return str.slice(0, len).trimEnd() + '...'
}

// ─── Component ───────────────────────────────────────────────────

export function PostFeed({ posts }: PostFeedProps) {
  if (posts.length === 0) {
    return (
      <div
        style={{
          padding: 48,
          textAlign: 'center',
          borderRadius: 16,
          border: '1px dashed var(--border)',
          backgroundColor: 'rgba(255,255,255,0.01)',
        }}
      >
        <div
          style={{
            fontSize: 32,
            marginBottom: 12,
            opacity: 0.3,
          }}
        >
          &#128172;
        </div>
        <div
          style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
          }}
        >
          No posts yet
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            marginTop: 4,
          }}
        >
          Create your first post above.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {posts.map((post) => {
        const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.pending

        return (
          <div
            key={post.id}
            style={{
              padding: 20,
              borderRadius: 16,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {/* Content preview */}
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                marginBottom: 12,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            >
              {truncate(post.content, 120)}
            </div>

            {/* Hashtags */}
            {post.hashtags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {post.hashtags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)',
                      padding: '2px 8px',
                      borderRadius: 6,
                      backgroundColor: 'var(--accent-glow)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom row: platform pills + status + timestamp */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {/* Platform pills with live post links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {post.platforms.map((plat) => {
                  const bgColor = PLATFORM_COLORS[plat] || '#333'
                  const label = PLATFORM_LABELS[plat] || plat
                  const isDark = bgColor === '#0a0a0a' || bgColor === '#000000' || bgColor === '#010101'
                  // Find the result for this platform to get the live URL
                  const result = post.results?.find((r) => r.platform === plat)
                  const liveUrl = result?.url

                  const pillStyle = {
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 10px',
                    borderRadius: 8,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : `${bgColor}20`,
                    color: isDark ? 'var(--text-secondary)' : bgColor,
                    border: `1px solid ${isDark ? 'var(--border)' : `${bgColor}30`}`,
                    textDecoration: 'none' as const,
                    display: 'inline-flex' as const,
                    alignItems: 'center' as const,
                    gap: 4,
                    transition: 'opacity 0.15s ease',
                    cursor: liveUrl ? 'pointer' : 'default',
                  }

                  if (liveUrl) {
                    return (
                      <a
                        key={plat}
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={pillStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        title={`View live on ${label}`}
                      >
                        {label}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )
                  }

                  return (
                    <span key={plat} style={pillStyle}>
                      {label}
                      {result && !result.success && (
                        <span title={result.url || 'Failed'} style={{ color: '#ff6b6b', marginLeft: 2 }}>!</span>
                      )}
                    </span>
                  )
                })}
              </div>

              {/* Status + timestamp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 10px',
                    borderRadius: 8,
                    backgroundColor: statusCfg.bg,
                    color: statusCfg.color,
                  }}
                >
                  {statusCfg.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {formatTimestamp(post.createdAt)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
