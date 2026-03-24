'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

/**
 * Maintenance Page — Stunning animated radial burst visualization
 * Shows for logged-out users when maintenance mode is active
 */

export default function MaintenancePage() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0c10',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Instrument Sans', system-ui, sans-serif",
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '800px', height: '800px',
        background: 'radial-gradient(circle, rgba(126,217,87,0.06) 0%, rgba(0,212,255,0.03) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '2rem' }}>
        <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={160} height={56} style={{ objectFit: 'contain' }} priority />
      </div>

      {/* Radial Burst SVG — The Centerpiece */}
      <div style={{ position: 'relative', zIndex: 1, width: '400px', height: '400px', maxWidth: '90vw', maxHeight: '90vw' }}>
        <svg viewBox="0 0 400 400" width="100%" height="100%">
          <defs>
            <filter id="glow-g">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-soft">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="grad-gc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6EE05A" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
            <linearGradient id="grad-gp" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6EE05A" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>

          {/* Outer ring — slow rotation */}
          <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(126,217,87,0.04)" strokeWidth="0.5">
            <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="120s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="0.5">
            <animateTransform attributeName="transform" type="rotate" from="360 200 200" to="0 200 200" dur="90s" repeatCount="indefinite" />
          </circle>

          {/* Phase 1: Pipeline — sequential dots flowing */}
          {phase === 0 && Array.from({ length: 8 }, (_, i) => {
            const angle = -Math.PI / 2
            const startX = 200 + Math.cos(angle) * 30
            const startY = 200 + Math.sin(angle) * 30
            const endX = 200 + Math.cos(angle) * 160
            const endY = 200 + Math.sin(angle) * 160
            const delay = i * 0.3
            return (
              <g key={`p-${i}`}>
                <circle r="3" fill="#6EE05A" filter="url(#glow-g)">
                  <animate attributeName="cx" values={`${startX};${endX}`} dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animate attributeName="cy" values={`${startY};${endY}`} dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;0" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animate attributeName="r" values="2;4;1" dur="2s" begin={`${delay}s`} repeatCount="indefinite" />
                </circle>
              </g>
            )
          })}

          {/* Phase 2: Assembly — parallel streams */}
          {phase === 1 && Array.from({ length: 5 }, (_, row) => {
            const angle = (-Math.PI / 3) + (row * Math.PI / 6)
            return Array.from({ length: 4 }, (_, i) => {
              const r = 40 + i * 35
              const x = 200 + Math.cos(angle) * r
              const y = 200 + Math.sin(angle) * r
              return (
                <circle key={`a-${row}-${i}`} cx={x} cy={y} r="3" fill="#00d4ff" filter="url(#glow-g)">
                  <animate attributeName="opacity" values="0.1;0.8;0.1" dur="1.5s" begin={`${i * 0.15 + row * 0.1}s`} repeatCount="indefinite" />
                  <animate attributeName="r" values="2;5;2" dur="1.5s" begin={`${i * 0.15 + row * 0.1}s`} repeatCount="indefinite" />
                </circle>
              )
            })
          })}

          {/* Phase 3: Radial Burst — the showstopper */}
          {phase === 2 && (
            <>
              {/* Expanding rings */}
              {[0, 0.8, 1.6].map((delay, i) => (
                <circle key={`ring-${i}`} cx="200" cy="200" fill="none" stroke="url(#grad-gp)" strokeWidth="1">
                  <animate attributeName="r" values="10;180" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
                </circle>
              ))}

              {/* Burst particles */}
              {Array.from({ length: 24 }, (_, i) => {
                const angle = (i / 24) * Math.PI * 2
                const endX = 200 + Math.cos(angle) * 170
                const endY = 200 + Math.sin(angle) * 170
                const color = i % 3 === 0 ? '#6EE05A' : i % 3 === 1 ? '#00d4ff' : '#a78bfa'
                return (
                  <g key={`b-${i}`}>
                    <line x1="200" y1="200" x2={endX} y2={endY} stroke={color} strokeWidth="0.5" opacity="0">
                      <animate attributeName="opacity" values="0;0.3;0" dur="2.5s" begin={`${i * 0.05}s`} repeatCount="indefinite" />
                    </line>
                    <circle r="2" fill={color} filter="url(#glow-g)">
                      <animate attributeName="cx" values={`200;${endX}`} dur="2.5s" begin={`${i * 0.05}s`} repeatCount="indefinite" />
                      <animate attributeName="cy" values={`200;${endY}`} dur="2.5s" begin={`${i * 0.05}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0;1;0" dur="2.5s" begin={`${i * 0.05}s`} repeatCount="indefinite" />
                      <animate attributeName="r" values="1;4;0" dur="2.5s" begin={`${i * 0.05}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                )
              })}
            </>
          )}

          {/* Center core — always visible, breathing */}
          <circle cx="200" cy="200" r="20" fill="url(#grad-gc)" opacity="0.15" filter="url(#glow-soft)">
            <animate attributeName="r" values="15;25;15" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.1;0.2;0.1" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="200" r="8" fill="url(#grad-gc)" opacity="0.6" filter="url(#glow-g)">
            <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="200" r="3" fill="#ffffff" opacity="0.9">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Phase labels */}
          <text x="200" y="360" textAnchor="middle" fill={phase === 0 ? '#6EE05A' : phase === 1 ? '#00d4ff' : '#a78bfa'}
            fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="700" letterSpacing="3" opacity="0.5"
          >
            {phase === 0 ? 'PIPELINE' : phase === 1 ? 'ASSEMBLY' : 'RADIAL BURST'}
          </text>
        </svg>

        {/* Phase dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '-1rem' }}>
          {['#6EE05A', '#00d4ff', '#a78bfa'].map((color, i) => (
            <div key={i} style={{
              width: i === phase ? '24px' : '8px', height: '8px', borderRadius: '4px',
              background: i === phase ? color : 'rgba(255,255,255,0.1)',
              transition: 'all 0.5s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Message */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: '2.5rem', padding: '0 2rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.25rem, 4vw, 2rem)', fontWeight: 800,
          color: '#ffffff', margin: '0 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.3,
        }}>
          We&apos;re doing some quick re-wiring.
        </h1>
        <p style={{
          fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
          color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6,
        }}>
          We&apos;ll be back <span style={{ color: '#6EE05A', fontWeight: 700 }}>0n</span> in a few minutes!
        </p>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: '2rem', color: 'rgba(255,255,255,0.15)',
        fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace",
      }}>
        0nMCP — The Agentic Engine
      </div>
    </div>
  )
}
