'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const PHRASES = [
  'Send an invoice and notify the team on Slack',
  'Create a contact and start an email sequence',
  'Post to all social channels at once',
  'Schedule a meeting and send a confirmation',
  'Generate a report and email it to the client',
]

export default function ConsoleCTA() {
  const [phrase, setPhrase] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined)

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
        <Link href="/console" className="console-cta-btn no-underline">
          <span className="console-cta-btn-glow" />
          <span className="console-cta-btn-text">
            Open Console
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  )
}
