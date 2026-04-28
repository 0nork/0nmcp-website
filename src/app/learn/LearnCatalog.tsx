'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AnimatedGrid from '@/components/AnimatedGrid'

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
    <div style={{ minHeight: '100vh' }}>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <AnimatedGrid />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#6EE05A]/[0.06] blur-[140px]"
        />
        <div className="relative mx-auto max-w-3xl px-4 pt-28 pb-12 text-center sm:px-6 lg:px-8 lg:pt-36 lg:pb-16">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#6EE05A]/25 bg-[#6EE05A]/8 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#6EE05A]">
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#6EE05A]" />
            Learn 0nMCP
          </span>
          <h1 className="text-balance text-5xl font-black tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-br from-[#6EE05A] via-[#14b8a6] to-[#a78bfa] bg-clip-text text-transparent">
              Master AI orchestration.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/75">
            From first install to enterprise deployment. Free courses, hands-on tutorials, and
            masterclasses that turn you into an AI automation expert.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-[#6EE05A] px-7 py-3 text-base font-bold text-black shadow-[0_0_28px_rgba(110,224,90,0.35)] transition-transform hover:scale-[1.02]"
            >
              Create Free Account
            </Link>
            <Link
              href="https://grid.0nmcp.com/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-7 py-3 text-base font-semibold text-white backdrop-blur transition-colors hover:border-[#6EE05A]/40 hover:text-[#6EE05A]"
            >
              Join the Community
            </Link>
          </div>
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
