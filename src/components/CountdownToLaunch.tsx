'use client'

import { useEffect, useState } from 'react'

const LAUNCH_ISO = '2026-05-01T00:00:00-04:00' // May 1, 2026 — ET

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

function compute(target: number): TimeLeft {
  const now = Date.now()
  const diff = Math.max(0, target - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds, done: diff === 0 }
}

interface CountdownToLaunchProps {
  /** Compact 1-row layout for hero strips. */
  compact?: boolean
  className?: string
}

export default function CountdownToLaunch({ compact, className = '' }: CountdownToLaunchProps) {
  const target = new Date(LAUNCH_ISO).getTime()
  const [t, setT] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setT(compute(target))
    const id = setInterval(() => setT(compute(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (!t) {
    // SSR placeholder — keep DOM stable
    return <div className={`min-h-[68px] ${className}`} aria-hidden />
  }

  if (t.done) {
    return (
      <div className={`text-center ${className}`}>
        <p className="font-mono text-xs uppercase tracking-widest text-[#6EE05A]">Launched</p>
        <p className="mt-1 text-2xl font-black text-white">We&rsquo;re live.</p>
      </div>
    )
  }

  const cells: { v: number; l: string }[] = [
    { v: t.days, l: 'Days' },
    { v: t.hours, l: 'Hrs' },
    { v: t.minutes, l: 'Min' },
    { v: t.seconds, l: 'Sec' },
  ]

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        {cells.map((c, i) => (
          <span key={c.l} className="inline-flex items-baseline gap-1">
            <span className="font-mono text-base font-black text-[#6EE05A] tabular-nums">
              {String(c.v).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {c.l}
            </span>
            {i < cells.length - 1 && <span className="ml-1 text-muted-foreground">·</span>}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-4 gap-2 sm:gap-4 ${className}`}>
      {cells.map((c) => (
        <div
          key={c.l}
          className="rounded-xl border border-[#6EE05A]/25 bg-[#0d1117]/60 px-2 py-3 text-center backdrop-blur sm:px-4 sm:py-5"
        >
          <div className="font-mono text-3xl font-black text-[#6EE05A] tabular-nums sm:text-5xl">
            {String(c.v).padStart(2, '0')}
          </div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground sm:text-[10px]">
            {c.l}
          </div>
        </div>
      ))}
    </div>
  )
}
