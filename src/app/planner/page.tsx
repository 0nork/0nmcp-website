'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export default function PlannerPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const sb = createSupabaseBrowser()
    if (!sb) { router.push('/login?redirect=/planner'); return }
    sb.auth.getUser().then(({ data }) => {
      if (data.user) setAuthed(true)
      else router.push('/login?redirect=/planner')
    })
  }, [router])

  if (!authed) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
      Loading...
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        height: '3.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/" style={{ display: 'flex', textDecoration: 'none' }}>
            <img src="/brand/icon-green.png" alt="0n" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          </a>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Planner
          </span>
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '9999px',
            background: 'rgba(126,217,87,0.1)',
            border: '1px solid rgba(126,217,87,0.25)',
            color: '#7ed957',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.05em',
          }}>
            BETA
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a href="/console" style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            padding: '0.375rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
          }}>
            Console
          </a>
          <a href="/builder" style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            padding: '0.375rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
          }}>
            Builder
          </a>
        </div>
      </header>

      {/* Canvas area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(126,217,87,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(126,217,87,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        {/* Coming soon */}
        <div style={{
          textAlign: 'center',
          maxWidth: '560px',
          padding: '2rem',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '1rem',
            background: 'rgba(126,217,87,0.08)',
            border: '1px solid rgba(126,217,87,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            margin: '0 0 0.75rem',
            letterSpacing: '-0.02em',
          }}>
            0n Planner
          </h1>

          <p style={{
            fontSize: '1.0625rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 1.5rem',
          }}>
            A blank canvas that connects to all your data. Build custom dashboards, sales pipelines,
            project trackers, and live data modules — all powered by your credentials and saved as .0n files.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            marginBottom: '2rem',
          }}>
            {[
              'Drag & Drop Modules',
              'Live Data Feeds',
              'Sales Pipelines',
              'Project Boards',
              'Custom Dashboards',
              '.0n File Export',
              'Dynamic Variables',
              'Pre-built Templates',
            ].map(tag => (
              <span key={tag} style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}>
                {tag}
              </span>
            ))}
          </div>

          <div style={{
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--accent)' }}>Coming soon.</strong>{' '}
            The Planner is being built with customizable modules — drag-and-drop data widgets with both
            dynamic credential-fed fields and static fields. Every layout saves as a .0n SWITCH file
            for portability across the 0n ecosystem.
          </div>
        </div>
      </div>
    </div>
  )
}
