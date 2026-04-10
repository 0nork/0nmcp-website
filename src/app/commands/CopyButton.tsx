'use client'

import { useState } from 'react'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '5px 10px',
        borderRadius: 5,
        border: copied ? '1px solid rgba(110,224,90,0.4)' : '1px solid rgba(255,255,255,0.1)',
        background: copied ? 'rgba(110,224,90,0.1)' : 'rgba(255,255,255,0.03)',
        color: copied ? '#6EE05A' : 'rgba(255,255,255,0.5)',
        fontSize: '0.6875rem',
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
        cursor: 'pointer',
        transition: 'all 0.15s',
        letterSpacing: '0.02em',
      }}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
          {label}
        </>
      )}
    </button>
  )
}
