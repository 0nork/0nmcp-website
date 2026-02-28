'use client'

import { useState, useEffect, useRef } from 'react'
import { HashtagEngine } from './HashtagEngine'

// ─── Platform Definitions ─────────────────────────────────────────

interface PlatformDef {
  id: string
  name: string
  icon: string
  color: string
  charLimit: number
}

const PLATFORMS: PlatformDef[] = [
  { id: 'linkedin', name: 'LinkedIn', icon: 'Li', color: '#0077b5', charLimit: 3000 },
  { id: 'reddit', name: 'Reddit', icon: 'Rd', color: '#ff4500', charLimit: 40000 },
  { id: 'dev_to', name: 'Dev.to', icon: 'Dv', color: '#0a0a0a', charLimit: Infinity },
  { id: 'x_twitter', name: 'X', icon: 'X', color: '#000000', charLimit: 280 },
  { id: 'instagram', name: 'Instagram', icon: 'Ig', color: '#e4405f', charLimit: 2200 },
  { id: 'tiktok', name: 'TikTok', icon: 'Tk', color: '#010101', charLimit: 4000 },
]

// ─── Props ────────────────────────────────────────────────────────

interface PostComposerProps {
  open: boolean
  onClose: () => void
  onPost: (content: string, platforms: string[], hashtags: string[]) => void
  isPosting: boolean
}

export function PostComposer({ open, onClose, onPost, isPosting }: PostComposerProps) {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin'])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagsLoading, setHashtagsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea on open
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setContent('')
      setSelectedPlatforms(['linkedin'])
      setHashtags([])
      setShowPreview(false)
    }
  }, [open])

  if (!open) return null

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleAIEnhance = async () => {
    if (!content.trim()) return
    setHashtagsLoading(true)
    try {
      const res = await fetch('/api/console/social/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.hashtags)) {
          setHashtags(data.hashtags)
        }
      }
    } catch {
      // Silent fail
    } finally {
      setHashtagsLoading(false)
    }
  }

  const handleRemoveHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag))
  }

  const handleAddHashtag = (tag: string) => {
    const clean = tag.replace(/^#/, '').trim().toLowerCase()
    if (clean && !hashtags.includes(clean)) {
      setHashtags((prev) => [...prev, clean])
    }
  }

  const handleSubmit = () => {
    if (!content.trim() || selectedPlatforms.length === 0 || isPosting) return
    onPost(content, selectedPlatforms, hashtags)
  }

  // Build preview content with hashtags
  const previewContent = content + (hashtags.length > 0 ? '\n\n' + hashtags.map((t) => `#${t}`).join(' ') : '')

  // Compute character warnings per platform
  const charWarnings = selectedPlatforms
    .map((id) => {
      const plat = PLATFORMS.find((p) => p.id === id)
      if (!plat || plat.charLimit === Infinity) return null
      const over = previewContent.length - plat.charLimit
      if (over > 0) return { name: plat.name, over, limit: plat.charLimit }
      return null
    })
    .filter(Boolean) as { name: string; over: number; limit: number }[]

  return (
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
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #1a1a25 0%, #111118 100%)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 28,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'console-fade-in 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              margin: 0,
            }}
          >
            Create Post
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              lineHeight: 1,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)')}
            aria-label="Close composer"
          >
            &times;
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Write your post content here..."
          style={{
            width: '100%',
            minHeight: 200,
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--border)',
            backgroundColor: 'rgba(255,255,255,0.03)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />

        {/* AI Enhance + Character count row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 12,
            marginBottom: 16,
          }}
        >
          <button
            onClick={handleAIEnhance}
            disabled={hashtagsLoading || !content.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: '1px solid var(--accent)',
              backgroundColor: 'var(--accent-glow)',
              color: 'var(--accent)',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              cursor: hashtagsLoading || !content.trim() ? 'not-allowed' : 'pointer',
              opacity: hashtagsLoading || !content.trim() ? 0.5 : 1,
              transition: 'opacity 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {hashtagsLoading ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    border: '2px solid var(--accent)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }}
                />
                Generating...
              </>
            ) : (
              <>
                <span style={{ fontSize: 16 }}>&#9733;</span>
                AI Enhance
              </>
            )}
          </button>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {selectedPlatforms.map((id) => {
              const plat = PLATFORMS.find((p) => p.id === id)
              if (!plat) return null
              const len = previewContent.length
              const isOver = plat.charLimit !== Infinity && len > plat.charLimit
              return (
                <span
                  key={id}
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: isOver ? '#ff6b6b' : 'var(--text-muted)',
                  }}
                >
                  {plat.name}: {len}/{plat.charLimit === Infinity ? '\u221E' : plat.charLimit}
                </span>
              )
            })}
          </div>
        </div>

        {/* Hashtag Engine */}
        <HashtagEngine
          hashtags={hashtags}
          onRemove={handleRemoveHashtag}
          onAdd={handleAddHashtag}
          loading={hashtagsLoading}
        />

        {/* Platform Toggles */}
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 10,
              fontFamily: 'var(--font-mono)',
            }}
          >
            Post to
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PLATFORMS.map((plat) => {
              const selected = selectedPlatforms.includes(plat.id)
              return (
                <button
                  key={plat.id}
                  onClick={() => togglePlatform(plat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: selected
                      ? `1px solid ${plat.color}`
                      : '1px solid var(--border)',
                    backgroundColor: selected
                      ? `${plat.color}18`
                      : 'rgba(255,255,255,0.03)',
                    color: selected ? '#fff' : 'var(--text-muted)',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'var(--font-display)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: selected ? plat.color : 'var(--border)',
                      color: selected ? '#fff' : 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {plat.icon}
                  </span>
                  {plat.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Character warnings */}
        {charWarnings.length > 0 && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: 'rgba(255,59,48,0.08)',
              border: '1px solid rgba(255,59,48,0.2)',
              marginBottom: 16,
            }}
          >
            {charWarnings.map((w) => (
              <div
                key={w.name}
                style={{
                  fontSize: 12,
                  color: '#ff6b6b',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {w.name}: {w.over} characters over the {w.limit} limit
              </div>
            ))}
          </div>
        )}

        {/* Preview Toggle */}
        <button
          onClick={() => setShowPreview((p) => !p)}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--accent-secondary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            padding: 0,
            marginBottom: showPreview ? 12 : 0,
          }}
        >
          {showPreview ? '\u25BC Hide Preview' : '\u25B6 Show Preview'}
        </button>

        {/* Preview Pane */}
        {showPreview && (
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: 8,
                fontFamily: 'var(--font-mono)',
              }}
            >
              Preview
            </div>
            <pre
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
              }}
            >
              {previewContent || 'Start typing to see a preview...'}
            </pre>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || selectedPlatforms.length === 0 || isPosting}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 12,
            border: 'none',
            background:
              !content.trim() || selectedPlatforms.length === 0 || isPosting
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            color:
              !content.trim() || selectedPlatforms.length === 0 || isPosting
                ? 'var(--text-muted)'
                : '#0a0a0f',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            cursor:
              !content.trim() || selectedPlatforms.length === 0 || isPosting
                ? 'not-allowed'
                : 'pointer',
            marginTop: 8,
            transition: 'opacity 0.15s ease, transform 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onMouseEnter={(e) => {
            if (content.trim() && selectedPlatforms.length > 0 && !isPosting) {
              e.currentTarget.style.opacity = '0.9'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          {isPosting ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }}
              />
              Posting...
            </>
          ) : (
            <>Post to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}</>
          )}
        </button>
      </div>

      {/* Spin keyframes injected inline */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
