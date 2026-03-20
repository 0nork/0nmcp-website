'use client'

/**
 * /0nengine — The Agentic AI Builder
 * This is what the entire project comes down to. Make it amazing.
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function OnEnginePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e8e8ef', fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>

      {/* ── Header ──────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={120} height={42} style={{ objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/login" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 600 }}>
            Login
          </Link>
          <Link href="/signup" style={{
            padding: '0.5rem 1.25rem', fontSize: '0.8125rem', fontWeight: 700,
            background: '#7ed957', color: '#0a0a0f', borderRadius: '8px', textDecoration: 'none',
          }}>
            Get Started Free
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '6rem 2rem 4rem', textAlign: 'center' }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(126,217,87,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* 0n Logo */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <Image src="/brand/0n.svg" alt="0n" width={200} height={70} style={{ objectFit: 'contain', margin: '0 auto' }} priority />
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900,
          lineHeight: 1.05, letterSpacing: '-0.03em',
          margin: '0 auto 1.5rem', maxWidth: '700px', position: 'relative',
        }}>
          <span style={{ color: '#7ed957' }}>Agentic AI</span>
          <br />
          <span style={{ color: '#ffffff' }}>That Actually Executes</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.5)',
          maxWidth: '560px', margin: '0 auto 2.5rem', lineHeight: 1.7, position: 'relative',
        }}>
          Build AI agents that think, decide, and take action across 1,229 tools
          and 54 services. Not workflows. Not chatbots. <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Real execution.</strong>
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', position: 'relative' }}>
          <Link href="/signup" style={{
            padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 700,
            background: '#7ed957', color: '#0a0a0f', borderRadius: '12px',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 24px rgba(126,217,87,0.3)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}>
            Start Building Free →
          </Link>
          <Link href="/builder" style={{
            padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 600,
            background: 'transparent', color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            textDecoration: 'none',
          }}>
            See it in action
          </Link>
        </div>
      </section>

      {/* ── Three-Level Execution ───────────────────── */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7ed957', marginBottom: '3rem' }}>
          Three-Level Execution System
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <ExecutionCard
            level="01"
            name="Pipeline"
            color="#7ed957"
            desc="Sequential. Step-by-step. Each action feeds the next. Perfect for linear processes — onboarding flows, data enrichment, lead qualification."
            visual={<PipelineVisual />}
          />
          <ExecutionCard
            level="02"
            name="Assembly Line"
            color="#00d4ff"
            desc="Parallel tracks. Multiple processes run simultaneously on the same data. Process faster. Scale wider. Think factory floor."
            visual={<AssemblyVisual />}
          />
          <ExecutionCard
            level="03"
            name="Radial Burst"
            color="#a78bfa"
            desc="Simultaneous deployment. One trigger, every direction at once. Post to 12 platforms. Notify 50 contacts. Update 8 systems. Instantly."
            visual={<BurstVisual />}
          />
        </div>
      </section>

      {/* ── What You Get ────────────────────────────── */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {[
            { num: '1,229', label: 'Tools Ready', desc: 'Every API call pre-built and tested' },
            { num: '54', label: 'Services Connected', desc: 'CRM, Stripe, Slack, GitHub, and 50 more' },
            { num: '303', label: 'CRM Tools', desc: 'The deepest CRM integration anywhere' },
            { num: '< 3s', label: 'Deploy Time', desc: 'Describe it. Jaxx builds it. Done.' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '1.5rem', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#7ed957', fontFamily: "'JetBrains Mono', monospace" }}>{s.num}</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e8e8ef', marginTop: '0.25rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          Stop building workflows.
          <br />
          <span style={{ color: '#7ed957' }}>Start describing outcomes.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Free forever. No credit card. Your agents. Your data. Your rules.
        </p>
        <Link href="/signup" style={{
          padding: '1rem 2.5rem', fontSize: '1.125rem', fontWeight: 800,
          background: '#7ed957', color: '#0a0a0f', borderRadius: '14px',
          textDecoration: 'none', display: 'inline-block',
          boxShadow: '0 4px 30px rgba(126,217,87,0.35)',
        }}>
          Create Your First Agent
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
        © 2026 RocketOpp LLC — Powered by Jaxx
      </footer>
    </div>
  )
}

/* ── Execution Card ──────────────────────────── */

function ExecutionCard({ level, name, color, desc, visual }: {
  level: string; name: string; color: string; desc: string; visual: React.ReactNode
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}44`
        e.currentTarget.style.boxShadow = `0 0 30px ${color}11`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ marginBottom: '1rem', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {visual}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color, fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
        LEVEL {level}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e8e8ef', marginBottom: '0.5rem' }}>
        {name}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, flex: 1 }}>
        {desc}
      </div>
    </div>
  )
}

/* ── SVG Visuals ─────────────────────────────── */

function PipelineVisual() {
  return (
    <svg viewBox="0 0 200 100" width="200" height="100">
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          {i < 4 && <line x1={25 + i * 40} y1="50" x2={55 + i * 40} y2="50" stroke="#7ed957" strokeWidth="2" opacity="0.3">
            <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </line>}
          <circle cx={20 + i * 40} cy="50" r="8" fill="#7ed957" opacity="0.15">
            <animate attributeName="opacity" values="0.1;0.6;0.1" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={20 + i * 40} cy="50" r="4" fill="#7ed957">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  )
}

function AssemblyVisual() {
  return (
    <svg viewBox="0 0 200 100" width="200" height="100">
      {[-25, 0, 25].map((yOff, row) => (
        <g key={row}>
          {[0, 1, 2, 3].map(i => (
            <g key={i}>
              <circle cx={30 + i * 50} cy={50 + yOff} r="6" fill="#00d4ff" opacity="0.15">
                <animate attributeName="opacity" values="0.1;0.5;0.1" dur="1.5s" begin={`${i * 0.2 + row * 0.1}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={30 + i * 50} cy={50 + yOff} r="3" fill="#00d4ff">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" begin={`${i * 0.2 + row * 0.1}s`} repeatCount="indefinite" />
              </circle>
              {i < 3 && <line x1={36 + i * 50} y1={50 + yOff} x2={74 + i * 50} y2={50 + yOff} stroke="#00d4ff" strokeWidth="1" opacity="0.15" />}
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
}

function BurstVisual() {
  return (
    <svg viewBox="0 0 200 100" width="200" height="100">
      <circle cx="100" cy="50" r="8" fill="#a78bfa" opacity="0.8">
        <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
      </circle>
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2
        const x = 100 + Math.cos(angle) * 40
        const y = 50 + Math.sin(angle) * 35
        return (
          <g key={i}>
            <line x1="100" y1="50" x2={x} y2={y} stroke="#a78bfa" strokeWidth="1" opacity="0">
              <animate attributeName="opacity" values="0;0.4;0" dur="2.5s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
            </line>
            <circle cx={x} cy={y} r="3" fill="#a78bfa" opacity="0">
              <animate attributeName="opacity" values="0;0.7;0" dur="2.5s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
              <animate attributeName="r" values="2;5;2" dur="2.5s" begin={`${i * 0.1}s`} repeatCount="indefinite" />
            </circle>
          </g>
        )
      })}
      <circle cx="100" cy="50" r="20" fill="none" stroke="#a78bfa" strokeWidth="0.5" opacity="0">
        <animate attributeName="r" values="10;45" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
