'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Scroll-triggered entrance wrapper. When the element enters the viewport,
 * it fades + slides into place using tw-animate-css utilities.
 *
 * Each Reveal uses IntersectionObserver once and unobserves itself —
 * cheap on the main thread, no re-trigger on scroll-back.
 */
type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

interface RevealProps {
  children: ReactNode
  delay?: number
  direction?: Direction
  className?: string
  /** When true, treat `delay` as ms relative to element entry (default 0). */
  immediate?: boolean
}

const directionClass: Record<Direction, string> = {
  up: 'translate-y-8',
  down: '-translate-y-8',
  left: 'translate-x-8',
  right: '-translate-x-8',
  none: '',
}

export default function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true)
            obs.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={[
        'transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none',
        shown ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${directionClass[direction]}`,
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
