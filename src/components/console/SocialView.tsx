'use client'

import { useState, useEffect } from 'react'
import { useSocial } from '@/lib/console/useSocial'
import { PlatformCard } from './social/PlatformCard'
import { PostFeed } from './social/PostFeed'
import { PostComposer } from './social/PostComposer'

export function SocialView() {
  const {
    platforms,
    recentPosts,
    isPosting,
    autoPostEnabled,
    toggleAutoPost,
    createPost,
    refreshPosts,
  } = useSocial()

  const [composerOpen, setComposerOpen] = useState(false)

  useEffect(() => {
    refreshPosts()
  }, [refreshPosts])

  const handlePost = async (content: string, selectedPlatforms: string[], hashtags: string[]) => {
    const result = await createPost(content, selectedPlatforms, hashtags)
    if (result) {
      setComposerOpen(false)
    }
  }

  return (
    <div
      style={{
        padding: 24,
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      {/* ── Header Row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Social Hub
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Auto-post toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontSize: 13,
                color: autoPostEnabled ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
              }}
            >
              Auto-post
            </span>
            <button
              onClick={toggleAutoPost}
              style={{
                position: 'relative',
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: autoPostEnabled
                  ? 'var(--accent)'
                  : 'var(--border)',
                transition: 'background-color 0.2s ease',
                padding: 0,
              }}
              aria-label={autoPostEnabled ? 'Disable auto-post' : 'Enable auto-post'}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: autoPostEnabled ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  backgroundColor: autoPostEnabled ? '#0a0a0f' : 'var(--text-muted)',
                  transition: 'left 0.2s ease, background-color 0.2s ease',
                }}
              />
            </button>
          </div>

          {/* Create Post button */}
          <button
            onClick={() => setComposerOpen(true)}
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: '#0a0a0f',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            + Create Post
          </button>
        </div>
      </div>

      {/* ── Connected Platforms Grid ── */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 16,
            fontFamily: 'var(--font-mono)',
          }}
        >
          Platforms
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              name={platform.name}
              icon={platform.icon}
              connected={platform.connected}
              postCount={platform.postCount}
              lastPosted={platform.lastPosted}
              color={platform.color}
              method={'method' in platform ? (platform as { method: 'crm' | 'direct' }).method : undefined}
            />
          ))}
        </div>
      </div>

      {/* ── Recent Posts Feed ── */}
      <div>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 16,
            fontFamily: 'var(--font-mono)',
          }}
        >
          Recent Posts
        </h2>
        <PostFeed posts={recentPosts} />
      </div>

      {/* ── Composer Modal ── */}
      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPost={handlePost}
        isPosting={isPosting}
      />
    </div>
  )
}
