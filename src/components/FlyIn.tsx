'use client'

/**
 * Directional entrance/exit animation — the page's whole motion vocabulary.
 *
 * WHY NOT Reveal. Reveal fades up once and unobserves itself. That is the right
 * primitive for a document and the wrong one for this page: the brief is
 * object-by-object fly-ins that come IN and go OUT, so an element that has
 * scrolled away has to be able to leave and arrive again. This observes
 * continuously and animates both directions.
 *
 * TRANSFORM AND OPACITY ONLY. Every variant below composites on the GPU — no
 * width, height, top or margin is ever animated. Twenty elements flying at once
 * is only "bold" if it holds 60fps; at 30fps it is a broken page.
 *
 * NO INLINE STYLES. Delays ride in as Tailwind arbitrary values
 * (`[transition-delay:120ms]`) from the caller, which keeps the house rule and
 * keeps the delay visible in the markup where someone tuning the stagger will
 * actually find it.
 *
 * REDUCED MOTION IS A HARD STOP, not a softer animation. `motion-reduce`
 * neutralises the transform and the transition together — someone who asked the
 * OS for no motion should get a static page, not a gentler carousel.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'

export type FlyDirection =
  | 'up' | 'down' | 'left' | 'right'
  | 'in' | 'out'
  /** Enters on an angle with a slight rotation — for cards in a grid. */
  | 'tilt-left' | 'tilt-right'
  /** Rises and unblurs, for headline words. */
  | 'lift'

/** The resting (hidden) transform for each direction. */
const FROM: Record<FlyDirection, string> = {
  up: 'translate-y-16 opacity-0',
  down: '-translate-y-16 opacity-0',
  left: '-translate-x-20 opacity-0',
  right: 'translate-x-20 opacity-0',
  in: 'scale-90 opacity-0',
  out: 'scale-110 opacity-0',
  'tilt-left': '-translate-x-12 translate-y-10 -rotate-6 scale-95 opacity-0',
  'tilt-right': 'translate-x-12 translate-y-10 rotate-6 scale-95 opacity-0',
  lift: 'translate-y-8 blur-sm opacity-0',
}

const TO = 'translate-x-0 translate-y-0 rotate-0 scale-100 blur-0 opacity-100'

interface Props {
  children: ReactNode
  direction?: FlyDirection
  /** Tailwind delay class, e.g. `[transition-delay:120ms]`. */
  delayClass?: string
  /** Tailwind duration class. Defaults to a 700ms ease-out-back-ish curve. */
  durationClass?: string
  /** Keep the element visible once it has arrived — for content that must not
   *  flicker on scroll-back, like a form someone is mid-way through. */
  once?: boolean
  className?: string
  as?: 'div' | 'li' | 'span' | 'section'
}

export default function FlyIn({
  children,
  direction = 'up',
  delayClass = '',
  durationClass = 'duration-700',
  once = false,
  className = '',
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          if (once) io.unobserve(el)
        } else if (!once) {
          // The "out" half. Only once the element is genuinely clear of the
          // viewport — retriggering at the edge makes the page twitch while
          // someone is simply reading.
          setShown(false)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  return (
    <Tag
      ref={ref as never}
      className={[
        'will-change-transform transition-all ease-[cubic-bezier(.16,1,.3,1)]',
        durationClass,
        delayClass,
        shown ? TO : FROM[direction],
        // A stated preference for no motion is answered with no motion.
        'motion-reduce:transition-none motion-reduce:translate-x-0 motion-reduce:translate-y-0',
        'motion-reduce:rotate-0 motion-reduce:scale-100 motion-reduce:blur-0 motion-reduce:opacity-100',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}

/* STEP and TILT moved to ./fly-steps — a plain array exported from a 'use
   client' module reads as undefined in a server component, which silently
   removed every stagger delay on the homepage. See fly-steps.ts. */
