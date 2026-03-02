'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

const PHRASES = [
  'Send an invoice and notify the team on Slack',
  'Create a contact and start an email sequence',
  'Post to all social channels at once',
  'Schedule a meeting and send a confirmation',
  'Generate a report and email it to the client',
]

type AuthState = 'loading' | 'anonymous' | 'free' | 'subscribed'

export default function ConsoleCTA() {
  const [phrase, setPhrase] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [authState, setAuthState] = useState<AuthState>('loading')
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Auth detection
  useEffect(() => {
    const supabase = createSupabaseBrowser()
    if (!supabase) { setAuthState('anonymous'); return }

    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setAuthState('anonymous'); return }

      supabase
        .from('profiles')
        .select('plan')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          const plan = profile?.plan || 'free'
          setAuthState(plan === 'free' ? 'free' : 'subscribed')
        })
    })
  }, [])

  useEffect(() => {
    const current = PHRASES[phraseIdx]

    if (!deleting && charIdx <= current.length) {
      timeout.current = setTimeout(() => {
        setPhrase(current.slice(0, charIdx))
        setCharIdx(charIdx + 1)
      }, 35)
    } else if (!deleting && charIdx > current.length) {
      timeout.current = setTimeout(() => setDeleting(true), 2200)
    } else if (deleting && charIdx > 0) {
      timeout.current = setTimeout(() => {
        setCharIdx(charIdx - 1)
        setPhrase(current.slice(0, charIdx - 1))
      }, 18)
    } else if (deleting && charIdx === 0) {
      setDeleting(false)
      setPhraseIdx((phraseIdx + 1) % PHRASES.length)
    }

    return () => clearTimeout(timeout.current)
  }, [charIdx, deleting, phraseIdx])

  // Determine CTA based on auth state
  let ctaHref = '/signup'
  let ctaText = 'Sign Up Free'
  let ctaClass = 'console-cta-btn console-cta-btn-signup no-underline'

  if (authState === 'free') {
    ctaHref = '/console?view=upgrade'
    ctaText = 'Start Free Trial \u2014 7 Days'
    ctaClass = 'console-cta-btn console-cta-btn-trial no-underline'
  } else if (authState === 'subscribed') {
    ctaHref = '/console'
    ctaText = 'Open Console'
    ctaClass = 'console-cta-btn console-cta-btn-ghost no-underline'
  } else if (authState === 'loading') {
    ctaHref = '/console'
    ctaText = 'Open Console'
    ctaClass = 'console-cta-btn no-underline'
  }

  return (
    <section className="console-cta">
      {/* Ambient glow */}
      <div className="console-cta-glow" aria-hidden="true" />
      <div className="console-cta-glow console-cta-glow-2" aria-hidden="true" />

      <div className="console-cta-inner">
        {/* Prompt preview */}
        <div className="console-cta-terminal">
          <div className="console-cta-prompt-bar">
            <span className="console-cta-dot console-cta-dot-red" />
            <span className="console-cta-dot console-cta-dot-yellow" />
            <span className="console-cta-dot console-cta-dot-green" />
            <span className="console-cta-prompt-title">0nMCP Console</span>
          </div>
          <div className="console-cta-prompt-body">
            <span className="console-cta-chevron">&gt;</span>
            <span className="console-cta-typed">{phrase}</span>
            <span className="console-cta-cursor" />
          </div>
        </div>

        {/* Copy */}
        <p className="console-cta-headline">
          Describe it. <span className="console-cta-gradient">0nMCP executes it.</span>
        </p>
        <p className="console-cta-sub">
          819 tools. 48 services. One command. Try the Console — your AI command center.
        </p>

        {/* CTA button */}
        <Link href={ctaHref} className={ctaClass}>
          <span className="console-cta-btn-glow" />
          <span className="console-cta-btn-text">
            {ctaText}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>

      <style>{`
        .console-cta-btn-trial .console-cta-btn-glow {
          background: linear-gradient(135deg, rgba(126,217,87,0.3), rgba(0,212,255,0.15));
        }
        .console-cta-btn-trial {
          position: relative;
          overflow: hidden;
        }
        .console-cta-btn-trial::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.06) 45%,
            rgba(255,255,255,0.12) 50%,
            rgba(255,255,255,0.06) 55%,
            transparent 100%
          );
          animation: shimmer 3s infinite;
        }
        .console-cta-btn-ghost {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid var(--border) !important;
        }
        .console-cta-btn-ghost .console-cta-btn-glow {
          display: none;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(100%) rotate(25deg); }
        }
      `}</style>
    </section>
  )
}
