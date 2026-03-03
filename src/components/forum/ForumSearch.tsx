'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface ThreadResult {
  type: 'thread'
  id: string
  title: string
  slug: string
  body_preview: string
  author_name: string
  created_at: string
  group_slug: string | null
  group_name: string | null
  reply_count: number
  score: number
}

interface CommentResult {
  type: 'comment'
  id: string
  body_preview: string
  author_name: string
  created_at: string
  thread_title: string
  thread_slug: string
}

type SearchResult = ThreadResult | CommentResult

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 2592000)}mo ago`
}

export default function ForumSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/community/search?q=${encodeURIComponent(q)}&limit=20`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data.results || [])
      setOpen(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => search(query), 300)
    } else {
      setResults([])
      setOpen(false)
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleResultClick(result: SearchResult) {
    setOpen(false)
    setQuery('')
    if (result.type === 'thread') {
      router.push(`/forum/${result.slug}`)
    } else {
      router.push(`/forum/${result.thread_slug}#post-${result.id}`)
    }
  }

  const showDropdown = open && (loading || results.length > 0 || query.length >= 2)

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input wrapper */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#111118',
          border: `1px solid ${focused ? '#3a3a50' : '#2a2a3a'}`,
          borderRadius: '0.75rem',
          padding: '0.4rem 0.625rem',
          transition: 'border-color 0.2s ease',
        }}
      >
        {/* Magnifying glass SVG */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={focused ? '#7ed957' : '#55556a'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, transition: 'stroke 0.2s ease' }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true)
            if (results.length > 0) setOpen(true)
          }}
          onBlur={() => setFocused(false)}
          placeholder="Search forum..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#e8e8ef',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-display)',
            minWidth: 0,
          }}
        />

        {/* Loading spinner */}
        {loading && (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#55556a"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ flexShrink: 0, animation: 'spin 0.8s linear infinite' }}
          >
            <path d="M12 2a10 10 0 0 1 10 10" />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </svg>
        )}

        {/* Clear button */}
        {query && !loading && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus() }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#55556a',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#0a0a0f',
            border: '1px solid #2a2a3a',
            borderRadius: '0.875rem',
            overflow: 'hidden',
            zIndex: 9999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          {loading && results.length === 0 ? (
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              color: '#55556a',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-display)',
            }}>
              Searching...
            </div>
          ) : results.length === 0 && query.length >= 2 ? (
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              color: '#55556a',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-display)',
            }}>
              No results found
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: '0.375rem', maxHeight: '22rem', overflowY: 'auto' }}>
              {results.map((result) => (
                <ResultItem
                  key={`${result.type}-${result.id}`}
                  result={result}
                  onClick={() => handleResultClick(result)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function ResultItem({
  result,
  onClick,
}: {
  result: SearchResult
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <li>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          textAlign: 'left',
          background: hovered ? 'rgba(126, 217, 87, 0.08)' : 'transparent',
          border: 'none',
          borderRadius: '0.625rem',
          padding: '0.5rem 0.625rem',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
        }}
      >
        {result.type === 'thread' ? (
          <ThreadResultContent result={result} />
        ) : (
          <CommentResultContent result={result} />
        )}
      </button>
    </li>
  )
}

function ThreadResultContent({ result }: { result: ThreadResult }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
        {/* Thread type badge */}
        <span style={{
          fontSize: '0.5625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#7ed957',
          background: 'rgba(126, 217, 87, 0.12)',
          padding: '1px 5px',
          borderRadius: '4px',
          flexShrink: 0,
        }}>
          Thread
        </span>
        {/* Group badge */}
        {result.group_name && (
          <span style={{
            fontSize: '0.5625rem',
            fontWeight: 600,
            color: '#8888a0',
            background: 'rgba(255,255,255,0.05)',
            padding: '1px 5px',
            borderRadius: '4px',
            flexShrink: 0,
          }}>
            {result.group_name}
          </span>
        )}
      </div>
      <span style={{
        fontSize: '0.8125rem',
        fontWeight: 700,
        color: '#e8e8ef',
        fontFamily: 'var(--font-display)',
        lineHeight: 1.3,
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {result.title}
      </span>
      <span style={{
        fontSize: '0.75rem',
        color: '#8888a0',
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
      }}>
        {result.body_preview}
      </span>
      <span style={{
        fontSize: '0.6875rem',
        color: '#55556a',
        marginTop: '0.1rem',
      }}>
        {result.author_name} · {timeAgo(result.created_at)} · {result.reply_count} replies
      </span>
    </>
  )
}

function CommentResultContent({ result }: { result: CommentResult }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <span style={{
          fontSize: '0.5625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#00d4ff',
          background: 'rgba(0, 212, 255, 0.1)',
          padding: '1px 5px',
          borderRadius: '4px',
          flexShrink: 0,
        }}>
          Comment
        </span>
      </div>
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#8888a0',
        fontFamily: 'var(--font-display)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
      }}>
        In: {result.thread_title}
      </span>
      <span style={{
        fontSize: '0.75rem',
        color: '#8888a0',
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden',
      }}>
        {result.body_preview}
      </span>
      <span style={{
        fontSize: '0.6875rem',
        color: '#55556a',
        marginTop: '0.1rem',
      }}>
        {result.author_name} · {timeAgo(result.created_at)}
      </span>
    </>
  )
}
