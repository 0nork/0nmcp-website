'use client'

/**
 * /console/admin-setup/feed — CRM Changelog RSS Feed
 * Pulls from https://ideas.gohighlevel.com/api/changelog/feed.rss
 */

import { useState, useEffect } from 'react'

interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: string
  category?: string
}

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/console/feed')
      .then(r => r.json())
      .then(data => {
        setItems(data.items || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          CRM Changelog
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
          Latest updates from the CRM platform — {items.length} items
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.2)', color: '#ef4444', fontSize: '0.8125rem', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '16px', borderRadius: 12, textDecoration: 'none',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              transition: 'border-color 0.15s',
              display: 'block',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-dim, rgba(126,217,87,0.3))' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              {item.category && (
                <span style={{
                  fontSize: '0.5625rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                  background: 'var(--accent-glow)', color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {item.category}
                </span>
              )}
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                {new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {item.title}
            </div>
            <div
              style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', maxHeight: 60 }}
              dangerouslySetInnerHTML={{ __html: item.description?.slice(0, 200) || '' }}
            />
          </a>
        ))}
      </div>

      {items.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No feed items found
        </div>
      )}
    </div>
  )
}
