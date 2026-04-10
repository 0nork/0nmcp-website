'use client'

import { useState, useEffect } from 'react'

export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query, onSearch])

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
      >
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search commands..."
        style={{
          width: '100%',
          padding: '0.625rem 0.75rem 0.625rem 2.25rem',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
          color: 'var(--text-primary, #fff)',
          fontSize: '0.875rem',
          fontFamily: "var(--font-display, 'Instrument Sans', system-ui, sans-serif)",
          outline: 'none',
        }}
      />
    </div>
  )
}
