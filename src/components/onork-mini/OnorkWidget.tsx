'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const OnorkMini = dynamic(() => import('./OnorkMini'), { ssr: false })

export default function OnorkWidget() {
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState(true)

  // Stop pulsing after first open
  useEffect(() => {
    if (open) setPulse(false)
  }, [open])

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`onork-fab ${pulse ? 'onork-fab-pulse' : ''} ${open ? 'onork-fab-active' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close 0nork Mini' : 'Open 0nork Mini'}
        title="0nork Mini"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="fab-g1" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="1" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
            <path d="M20 8 L28 14 L28 26 L20 32 L12 26 L12 14 Z" fill="none" stroke="url(#fab-g1)" strokeWidth="1.8" opacity=".7" />
            <path d="M20 12 L25 15.5 L25 24.5 L20 28 L15 24.5 L15 15.5 Z" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".9" />
            <circle cx="20" cy="20" r="3.5" fill="#fff" opacity=".95" />
            <circle cx="20" cy="20" r="1.5" fill="#7c3aed" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="onork-backdrop"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`onork-sidebar ${open ? 'onork-sidebar-open' : ''}`}>
        {open && <OnorkMini />}
      </div>
    </>
  )
}
