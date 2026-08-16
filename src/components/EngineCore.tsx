'use client'

/**
 * The engine, drawn.
 *
 * The page argues that 0nMCP is the thing every other product runs on. A stack
 * of feature cards cannot make that argument — a core with everything else
 * orbiting it can, in the half second before anyone reads a word.
 *
 * CANVAS, NOT SVG. Sixty-odd nodes with per-frame trails is a lot of DOM to
 * mutate; on canvas it is one element and a draw call. The rule against
 * hand-authoring long path data points the same way.
 *
 * IT RUNS ON ITS OWN CLOCK, not on scroll, so the machine looks alive while
 * someone is reading rather than only while they move. It stops entirely when
 * scrolled out of view and when the tab is hidden — an idle background tab
 * burning a core is the reason people distrust animated sites.
 */
import { useEffect, useRef } from 'react'

const NEON = '110, 224, 90'
const TEAL = '0, 194, 199'

interface Node {
  /** Orbit radius as a fraction of the canvas half-height. */
  r: number
  angle: number
  speed: number
  size: number
  teal: boolean
  /** 0..1 — how far a packet has travelled inward on this spoke. */
  packet: number
  packetSpeed: number
}

export default function EngineCore({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Deterministic layout — a hero that reshuffles on every reload reads as
    // noise rather than as a system.
    let seed = 20260816
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    const RINGS = [0.42, 0.62, 0.84, 1.02]
    const nodes: Node[] = []
    RINGS.forEach((r, ring) => {
      const count = 6 + ring * 4
      for (let i = 0; i < count; i++) {
        nodes.push({
          r,
          angle: (i / count) * Math.PI * 2 + rand() * 0.4,
          speed: (0.00016 + rand() * 0.00014) * (ring % 2 ? -1 : 1),
          size: 1.4 + rand() * 2.2,
          teal: rand() > 0.68,
          packet: rand(),
          packetSpeed: 0.0022 + rand() * 0.0034,
        })
      }
    })

    let raf = 0
    let running = false
    let w = 0, h = 0, cx = 0, cy = 0, unit = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cx = w / 2; cy = h / 2
      unit = Math.min(w, h) / 2.35
    }

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)

      // Orbit rings — faint, so the nodes read as the content and the rings as
      // the structure holding them.
      ctx.lineWidth = 1
      for (const r of RINGS) {
        ctx.strokeStyle = `rgba(${NEON}, 0.055)`
        ctx.beginPath()
        ctx.arc(cx, cy, r * unit, 0, Math.PI * 2)
        ctx.stroke()
      }

      for (const n of nodes) {
        if (!reduced) n.angle += n.speed * 16
        const x = cx + Math.cos(n.angle) * n.r * unit
        const y = cy + Math.sin(n.angle) * n.r * unit * 0.62 // flattened: an ellipse reads as depth
        const rgb = n.teal ? TEAL : NEON

        // Spoke to the core.
        ctx.strokeStyle = `rgba(${rgb}, 0.08)`
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(cx, cy)
        ctx.stroke()

        // The packet travelling in — this is the actual claim of the graphic:
        // everything flows toward one engine.
        if (!reduced) {
          n.packet += n.packetSpeed * 16
          if (n.packet > 1) n.packet -= 1
        }
        const p = 1 - n.packet
        const px = cx + (x - cx) * p
        const py = cy + (y - cy) * p
        ctx.fillStyle = `rgba(${rgb}, ${0.5 * n.packet})`
        ctx.beginPath()
        ctx.arc(px, py, 1.6, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(${rgb}, 0.85)`
        ctx.beginPath()
        ctx.arc(x, y, n.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // The core. Breathing, because a still centre in a moving field looks
      // switched off.
      const pulse = reduced ? 1 : 1 + Math.sin(t / 900) * 0.06
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, unit * 0.42 * pulse)
      glow.addColorStop(0, `rgba(${NEON}, 0.55)`)
      glow.addColorStop(0.45, `rgba(${NEON}, 0.12)`)
      glow.addColorStop(1, `rgba(${NEON}, 0)`)
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, unit * 0.42 * pulse, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(${NEON}, 0.95)`
      ctx.beginPath()
      ctx.arc(cx, cy, 5.5 * pulse, 0, Math.PI * 2)
      ctx.fill()

      if (running) raf = requestAnimationFrame(draw)
    }

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(draw) } }
    const stop = () => { running = false; cancelAnimationFrame(raf) }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Off-screen and hidden-tab both stop the loop.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 })
    io.observe(canvas)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)

    if (reduced) { resize(); draw(0) } // one static frame, then nothing

    return () => {
      stop(); ro.disconnect(); io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className={className} />
}
