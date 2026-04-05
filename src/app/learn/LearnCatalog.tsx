'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  tier_required: string
  category: string
  lesson_count: number
  enrollment_count: number
  estimated_minutes: number
  tags: string[]
  author_name: string
}

const TIERS: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: 'Free', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  supporter: { label: 'Supporter', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  builder: { label: 'Builder', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
  enterprise: { label: 'Enterprise', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
}

const FEATURED_COURSES = [
  { title: '0nMCP Mastery', desc: 'From npx install to 945-tool orchestration. The complete guide.', tier: 'free', lessons: 16, mins: 120, slug: '0nmcp-mastery', category: 'getting-started' },
  { title: 'CRM Automation Blueprint', desc: '245 CRM tools. Build lead scoring, booking, invoicing — all AI-driven.', tier: 'supporter', lessons: 12, mins: 90, slug: 'crm-automation', category: 'integrations' },
  { title: '.0n SWITCH Files Deep Dive', desc: 'Declarative workflows that run on any machine, any AI platform.', tier: 'free', lessons: 8, mins: 60, slug: '0n-switch-files', category: 'fundamentals' },
  { title: '0nVault Security', desc: 'AES-256-GCM encryption, hardware fingerprint binding, Seal of Truth.', tier: 'builder', lessons: 6, mins: 45, slug: 'vault-security', category: 'security' },
  { title: 'Multi-AI Council (0nPlex)', desc: '5 AI models debate. Cross-critique. Synthesize. Superintelligence.', tier: 'builder', lessons: 10, mins: 75, slug: 'onplex-council', category: 'advanced' },
  { title: 'Enterprise Deployment', desc: 'White-label, multi-tenant, API-first. Scale 0nMCP for your org.', tier: 'enterprise', lessons: 14, mins: 100, slug: 'enterprise', category: 'enterprise' },
]

export default function LearnCatalog() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams()
      if (filter) params.set('category', filter)
      const res = await fetch(`/api/courses?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCourses(Array.isArray(data) ? data : [])
      }
      setLoading(false)
    }
    load()
  }, [filter])

  const displayCourses = courses.length > 0 ? courses : []

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem' }}>
      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', padding: '3rem 1.5rem 2rem', maxWidth: 700, margin: '0 auto' }}>
        <span style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 20,
          background: '#6EE05A', color: '#0f172a', fontSize: 11,
          fontWeight: 900, letterSpacing: '0.06em', marginBottom: 16,
        }}>
          LEARN 0nMCP
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}>
          Master AI Orchestration
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 24px' }}>
          From first install to enterprise deployment. Free courses, hands-on tutorials, and masterclasses that turn you into an AI automation expert.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Link href="https://grid.0nmcp.com/login" style={{
            padding: '12px 28px', borderRadius: 10,
            background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 700, fontSize: 14,
            textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.2s', display: 'inline-block',
          }}>
            Join the Community
          </Link>
          <Link href="/signup" style={{
            padding: '12px 28px', borderRadius: 10,
            background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 14,
            textDecoration: 'none', border: '1px solid var(--border)',
            transition: 'all 0.2s', display: 'inline-block',
          }}>
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ maxWidth: 600, margin: '0 auto 2rem', display: 'flex', justifyContent: 'center', gap: 32 }}>
        {[
          { val: '6+', label: 'Courses' },
          { val: '66+', label: 'Lessons' },
          { val: 'Free', label: 'Getting Started' },
          { val: 'Live', label: 'Community' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Featured courses ── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Featured Courses</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {FEATURED_COURSES.map(course => {
            const tier = TIERS[course.tier] || TIERS.free
            return (
              <div key={course.slug} style={{
                background: 'var(--bg-card)', borderRadius: 14, padding: 24,
                border: '1px solid var(--border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.25s, transform 0.25s',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Tier badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 10,
                    fontWeight: 800, color: tier.color, background: tier.bg,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {tier.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{course.category.replace(/-/g, ' ')}</span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{course.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{course.desc}</p>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                  <span>{course.lessons} lessons</span>
                  <span>{course.mins} min</span>
                </div>

                {/* CTA */}
                <Link href={`https://grid.0nmcp.com/login`} style={{
                  display: 'block', textAlign: 'center', padding: '10px 16px',
                  borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  fontWeight: 700, fontSize: 13, textDecoration: 'none',
                  border: '1px solid var(--border)', transition: 'all 0.2s',
                }}>
                  {course.tier === 'free' ? 'Start Free' : `Unlock (${tier.label})`}
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Dynamic courses from API ── */}
      {displayCourses.length > 0 && (
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '1rem 1.5rem 2rem' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>All Courses</h2>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {['', 'getting-started', 'fundamentals', 'security', 'advanced', 'integrations', 'enterprise'].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: filter === cat ? '#1a1a1a' : '#fff',
                color: filter === cat ? '#fff' : '#555',
                border: `1px solid ${filter === cat ? 'var(--text-primary)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {cat ? cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All'}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {displayCourses.map(course => {
              const tier = TIERS[course.tier_required] || TIERS.free
              return (
                <div key={course.id} style={{
                  background: 'var(--bg-card)', borderRadius: 12, padding: 20,
                  border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 800, color: tier.color, background: tier.bg, textTransform: 'uppercase' }}>{tier.label}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{course.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{course.description}</p>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>{course.lesson_count} lessons</span>
                    <span>{course.estimated_minutes} min</span>
                    <span>{course.enrollment_count} enrolled</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Community CTA ── */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem 4rem', textAlign: 'center' }}>
        <div style={{
          borderRadius: 20, padding: '3rem 2rem',
          background: 'linear-gradient(135deg, #1a1a1a, #0f172a)',
          color: 'var(--text-primary)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Join the 0nMCP Community</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
            Connect with other builders, get help, share workflows, and learn together.
          </p>
          <Link href="https://grid.0nmcp.com/login" style={{
            display: 'inline-block', padding: '14px 32px', borderRadius: 12,
            background: '#6EE05A', color: '#0f172a', fontWeight: 800, fontSize: 15,
            textDecoration: 'none',
          }}>
            Enter the Grid →
          </Link>
        </div>
      </section>
    </div>
  )
}
