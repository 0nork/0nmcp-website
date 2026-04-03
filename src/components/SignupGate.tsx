'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

/**
 * 0n Sign-Up Gate — Soft conversion modal
 * Appears after 30s on page OR after scrolling 60% of page
 * Dismissing stores a cookie for 24h
 * Does NOT block content — overlays with dismiss option
 */

const COOKIE_NAME = '0n_gate_dismissed'
const DISMISS_HOURS = 24

function isGateDismissed(): boolean {
  if (typeof document === 'undefined') return true
  return document.cookie.split(';').some(c => c.trim().startsWith(`${COOKIE_NAME}=`))
}

function dismissGate() {
  const expires = new Date(Date.now() + DISMISS_HOURS * 60 * 60 * 1000).toUTCString()
  document.cookie = `${COOKIE_NAME}=1; path=/; expires=${expires}; SameSite=Lax`
}

export default function SignupGate() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isGateDismissed()) return

    // Don't show on auth pages
    const path = window.location.pathname
    if (['/login', '/signup', '/0nboarding', '/reset-password'].some(p => path.startsWith(p))) return

    let shown = false
    function show() {
      if (shown || isGateDismissed()) return
      shown = true
      setVisible(true)
    }

    // Show after 30s
    const timer = setTimeout(show, 30000)

    // Show after 60% scroll
    function onScroll() {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      if (scrollPercent > 0.6) show()
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  function handleDismiss() {
    setVisible(false)
    dismissGate()
  }

  if (!mounted || !visible) return null

  return (
    <>
      <style>{`
        .gate-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: gate-fade-in 0.3s ease;
        }
        @keyframes gate-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .gate-card {
          background: #fff;
          border-radius: 20px;
          max-width: 440px;
          width: 100%;
          padding: 2.5rem 2rem;
          text-align: center;
          box-shadow: 0 24px 80px rgba(0,0,0,0.2);
          position: relative;
          animation: gate-slide-up 0.3s ease;
        }
        @keyframes gate-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gate-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: all 0.15s;
        }
        .gate-close:hover {
          border-color: #ef4444;
          color: #ef4444;
        }
        .gate-logo {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(110,224,90,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
        }
        .gate-title {
          font-size: 1.375rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
        }
        .gate-subtitle {
          font-size: 0.9375rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 1.5rem;
        }
        .gate-google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          height: 50px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #1a1a1a;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .gate-google-btn:hover {
          border-color: #4285F4;
          box-shadow: 0 4px 12px rgba(66,133,244,0.15);
        }
        .gate-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1rem 0;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .gate-divider::before, .gate-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }
        .gate-email-btn {
          display: block;
          width: 100%;
          padding: 0.75rem;
          border-radius: 12px;
          background: #6EE05A;
          color: #000;
          font-size: 0.875rem;
          font-weight: 700;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .gate-email-btn:hover {
          box-shadow: 0 4px 16px rgba(110,224,90,0.3);
          transform: translateY(-1px);
        }
        .gate-skip {
          display: block;
          margin-top: 1rem;
          font-size: 0.75rem;
          color: #9ca3af;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
          transition: color 0.15s;
        }
        .gate-skip:hover {
          color: #6b7280;
        }
        .gate-stats {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }
        .gate-stat-value {
          font-size: 1rem;
          font-weight: 800;
          color: #1a1a1a;
          font-family: 'JetBrains Mono', monospace;
        }
        .gate-stat-label {
          font-size: 0.5625rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }
      `}</style>

      <div className="gate-overlay" onClick={handleDismiss}>
        <div className="gate-card" onClick={e => e.stopPropagation()}>
          <button className="gate-close" onClick={handleDismiss} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>

          <div className="gate-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>

          <h2 className="gate-title">Get {STATS_DISPLAY.tools} AI Tools Free</h2>
          <p className="gate-subtitle">
            Create a free account to access {STATS_DISPLAY.services} services,
            encrypted vault, and the full 0nMCP platform.
          </p>

          <a href="/api/auth/google" className="gate-google-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <div className="gate-divider">or</div>

          <Link href="/signup" className="gate-email-btn" onClick={handleDismiss}>
            Create Free Account
          </Link>

          <button className="gate-skip" onClick={handleDismiss}>
            Maybe later
          </button>

          <div className="gate-stats">
            <div>
              <div className="gate-stat-value">{STATS_DISPLAY.tools}</div>
              <div className="gate-stat-label">Tools</div>
            </div>
            <div>
              <div className="gate-stat-value">{STATS_DISPLAY.services}</div>
              <div className="gate-stat-label">Services</div>
            </div>
            <div>
              <div className="gate-stat-value">Free</div>
              <div className="gate-stat-label">Forever</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
