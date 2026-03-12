'use client'

import { useRef, useState, useCallback, useEffect, type ReactNode, type CSSProperties } from 'react'

interface GlassTiltCardProps {
  children: ReactNode
  g1: string
  g2: string
  className?: string
  style?: CSSProperties
}

export default function GlassTiltCard({ children, g1, g2, className, style }: GlassTiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      const el = ref.current
      if (!el) { rafRef.current = 0; return }
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      setTilt({ x: y * -8, y: x * 8 })
      rafRef.current = 0
    })
  }, [reducedMotion])

  const handleEnter = useCallback(() => setHovering(true), [])

  const handleLeave = useCallback(() => {
    setHovering(false)
    setTilt({ x: 0, y: 0 })
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [])

  const glowColor1 = g1 + '40'
  const glowColor2 = g2 + '30'

  const defaultBg = (style?.background as string) || 'linear-gradient(135deg, rgba(17,17,25,0.95) 0%, rgba(10,10,15,0.95) 100%)'

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        ...style,
        transform: hovering && !reducedMotion
          ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px) scale(1.02)`
          : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)',
        background: hovering
          ? 'linear-gradient(135deg, rgba(6,6,12,0.98) 0%, rgba(2,2,8,0.98) 100%)'
          : defaultBg,
        boxShadow: hovering
          ? `0 24px 64px ${glowColor1}, 0 12px 36px ${glowColor2}, 0 0 100px ${g1}12, inset 0 1px 0 rgba(255,255,255,0.05)`
          : (style?.boxShadow as string) || '0 4px 24px rgba(0,0,0,0.25)',
        borderColor: hovering ? `${g1}50` : undefined,
        transition: reducedMotion
          ? 'none'
          : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s ease, box-shadow 0.45s ease, border-color 0.4s ease',
        willChange: hovering ? 'transform' : 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glass specular highlight — follows cursor position */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: hovering
            ? `radial-gradient(ellipse at ${50 + tilt.y * 6}% ${50 + tilt.x * 6}%, rgba(255,255,255,0.05) 0%, transparent 65%)`
            : 'none',
          pointerEvents: 'none',
          transition: reducedMotion ? 'none' : 'background 0.2s ease',
        }}
      />

      {/* Gradient border glow — intensifies on hover */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 'inherit',
          padding: 1,
          background: `linear-gradient(135deg, ${g1}, ${g2})`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude' as CSSProperties['maskComposite'],
          opacity: hovering ? 0.85 : 0.25,
          transition: reducedMotion ? 'none' : 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
