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
    connectDevTo,
    disconnect,
  } = useSocial()

  const [composerOpen, setComposerOpen] = useState(false)
  const [devtoModalOpen, setDevtoModalOpen] = useState(false)
  const [devtoKey, setDevtoKey] = useState('')
  const [devtoConnecting, setDevtoConnecting] = useState(false)
  const [devtoError, setDevtoError] = useState('')

  useEffect(() => {
    refreshPosts()
  }, [refreshPosts])

  const handlePost = async (content: string, selectedPlatforms: string[], hashtags: string[]) => {
    const result = await createPost(content, selectedPlatforms, hashtags)
    if (result) {
      setComposerOpen(false)
    }
  }

  const handleDevToConnect = async () => {
    if (!devtoKey.trim()) return
    setDevtoConnecting(true)
    setDevtoError('')
    const result = await connectDevTo(devtoKey.trim())
    if (result.success) {
      setDevtoModalOpen(false)
      setDevtoKey('')
    } else {
      setDevtoError(result.error || 'Connection failed')
    }
    setDevtoConnecting(false)
  }

  const handlePlatformConnect = (platformId: string) => {
    if (platformId === 'dev_to') {
      setDevtoModalOpen(true)
    }
    // OAuth platforms handled by PlatformCard via connectUrl redirect
  }

  const handlePlatformDisconnect = async (platformId: string) => {
    await disconnect(platformId)
  }

  const connectedCount = platforms.filter((p) => p.connected).length

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
      {/* Header Row */}
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
        <div>
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
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            {connectedCount} platform{connectedCount !== 1 ? 's' : ''} connected
          </div>
        </div>

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
                backgroundColor: autoPostEnabled ? 'var(--accent)' : 'var(--border)',
                transition: 'background-color 0.2s ease',
                padding: 0,
              }}
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
            disabled={connectedCount === 0}
            style={{
              padding: '10px 24px',
              borderRadius: 12,
              border: 'none',
              background: connectedCount > 0
                ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))'
                : 'rgba(255,255,255,0.06)',
              color: connectedCount > 0 ? '#0a0a0f' : 'var(--text-muted)',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              cursor: connectedCount > 0 ? 'pointer' : 'not-allowed',
              transition: 'opacity 0.2s ease, transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (connectedCount > 0) {
                e.currentTarget.style.opacity = '0.9'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
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

      {/* Connected Platforms Grid */}
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              name={platform.name}
              icon={platform.icon}
              connected={platform.connected}
              expired={platform.expired}
              postCount={platform.postCount}
              lastPosted={platform.lastPosted}
              color={platform.color}
              method={platform.method}
              username={platform.username}
              avatar={platform.avatar}
              connectUrl={platform.connectUrl}
              comingSoon={platform.comingSoon}
              onConnect={() => handlePlatformConnect(platform.id)}
              onDisconnect={() => handlePlatformDisconnect(platform.id)}
            />
          ))}
        </div>
      </div>

      {/* Recent Posts Feed */}
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

      {/* Composer Modal */}
      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPost={handlePost}
        isPosting={isPosting}
        connectedPlatformIds={platforms.filter((p) => p.connected && !p.comingSoon).map((p) => p.id)}
      />

      {/* Dev.to API Key Modal */}
      {devtoModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={() => { setDevtoModalOpen(false); setDevtoError('') }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 420,
              background: 'linear-gradient(180deg, #1a1a25 0%, #111118 100%)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              animation: 'console-fade-in 0.2s ease',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: '0 0 8px 0' }}>
              Connect Dev.to
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Get your API key from{' '}
              <a href="https://dev.to/settings/extensions" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
                dev.to/settings/extensions
              </a>
            </p>

            <input
              type="password"
              value={devtoKey}
              onChange={(e) => setDevtoKey(e.target.value)}
              placeholder="Paste your Dev.to API key"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                backgroundColor: 'rgba(255,255,255,0.03)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDevToConnect() }}
            />

            {devtoError && (
              <div style={{ fontSize: 12, color: '#ff6b6b', fontFamily: 'var(--font-mono)', marginTop: 8 }}>
                {devtoError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => { setDevtoModalOpen(false); setDevtoError('') }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDevToConnect}
                disabled={!devtoKey.trim() || devtoConnecting}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: devtoKey.trim() && !devtoConnecting
                    ? 'linear-gradient(135deg, var(--accent), var(--accent-secondary))'
                    : 'rgba(255,255,255,0.06)',
                  color: devtoKey.trim() && !devtoConnecting ? '#0a0a0f' : 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  cursor: devtoKey.trim() && !devtoConnecting ? 'pointer' : 'not-allowed',
                }}
              >
                {devtoConnecting ? 'Verifying...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
