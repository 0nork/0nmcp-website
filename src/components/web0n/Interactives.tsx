'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/* ========== SCROLL REVEAL ========== */
export function ScrollReveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: 'opacity, transform',
        width: '100%',
        minWidth: 0,
      }}
    >
      {children}
    </div>
  )
}

/* ========== COUNT UP ========== */
export function CountUp({ end, suffix = '', prefix = '', duration = 2000 }: {
  end: number; suffix?: string; prefix?: string; duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(end); return }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); observer.disconnect() } },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, started])

  useEffect(() => {
    if (!started) return
    const t0 = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * end))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, end, duration])

  return <span ref={ref}>{prefix}{value}{suffix}</span>
}

/* ========== ROTATING TEXT ========== */
export function RotatingText({ words, interval = 2800 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0)
  const [vis, setVis] = useState(true)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => {
      setVis(false)
      setTimeout(() => { setIndex(i => (i + 1) % words.length); setVis(true) }, 350)
    }, interval)
    return () => clearInterval(timer)
  }, [words.length, interval])

  return (
    <span
      aria-live="polite"
      style={{
        display: 'inline-block',
        minWidth: '6ch',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        color: '#6EE05A',
      }}
    >
      {words[index]}
    </span>
  )
}
