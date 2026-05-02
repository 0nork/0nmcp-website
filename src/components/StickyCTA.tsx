'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Sparkles, X } from 'lucide-react'

/**
 * Sticky lead-capture bar. Appears after the user scrolls 30% of the
 * page (past the hero), can be dismissed for the session, and links
 * straight to the lead-capture section.
 *
 * Persists nothing across reloads — keeps a fresh visitor seeing it on
 * every visit until they engage. Hidden during scroll-down, visible on
 * scroll-up to avoid hijacking attention while reading.
 */
export default function StickyCTA() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    let lastY = window.scrollY
    let direction: 'up' | 'down' = 'down'

    function onScroll() {
      const y = window.scrollY
      direction = y > lastY ? 'down' : 'up'
      const threshold = window.innerHeight * 0.6 // appears after first viewport
      const visible = y > threshold && (direction === 'up' || y > threshold * 2)
      setShow(visible)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [dismissed])

  if (dismissed || !show) return null

  return (
    <div
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-[#6EE05A]/30 bg-[#0d1117]/95 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-md sm:px-5"
      role="region"
      aria-label="Reserve your launch-cohort spot"
    >
      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6EE05A]/10 ring-1 ring-[#6EE05A]/25 sm:flex">
        <Sparkles className="h-4 w-4 text-[#6EE05A]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-bold text-white">0nCore is live.</p>
        <p className="truncate text-xs text-white/65">
          Free tier · 1,640+ tools · Start building in 10 minutes.
        </p>
      </div>
      <a
        href="/signup"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#6EE05A] px-4 py-2 text-xs font-bold text-black shadow-[0_0_18px_rgba(110,224,90,0.35)] transition-transform hover:scale-[1.04]"
      >
        Start free <ArrowRight className="h-3 w-3" />
      </a>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
