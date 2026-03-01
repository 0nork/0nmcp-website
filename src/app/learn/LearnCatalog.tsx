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

const CATEGORIES = [
  { value: '', label: 'All Courses' },
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'fundamentals', label: 'Fundamentals' },
  { value: 'security', label: 'Security' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'enterprise', label: 'Enterprise' },
]

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: '#7ed957' },
  supporter: { label: 'Supporter', color: '#ff6b35' },
  builder: { label: 'Builder', color: '#00d4ff' },
  enterprise: { label: 'Enterprise', color: '#9945ff' },
}

export default function LearnCatalog() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      const res = await fetch(`/api/courses?${params}`)
      if (res.ok) setCourses(await res.json())
      setLoading(false)
    }
    load()
  }, [category])

  return (
    <>
      {/* Hero */}
      <section className="pt-40 pb-16 px-8 text-center relative">
        <div
          className="absolute w-[500px] h-[500px] top-[5%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)' }}
        />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 relative z-[2]">
          Learn{' '}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' }}>
            0nMCP
          </span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto relative z-[2]">
          From first install to enterprise deployment. Free courses, hands-on tutorials, tier-gated masterclasses.
        </p>
      </section>

      {/* Filters */}
      <section className="px-8 max-w-6xl mx-auto mb-8">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: category === cat.value ? 'var(--accent)' : 'var(--bg-card)',
                color: category === cat.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: `1px solid ${category === cat.value ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Course Grid */}
      <section className="px-8 max-w-6xl mx-auto pb-24">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm font-semibold">No courses in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => {
              const tier = TIER_BADGE[course.tier_required] || TIER_BADGE.free
              return (
                <Link
                  key={course.id}
                  href={`/learn/${course.slug}`}
                  className="block rounded-2xl p-5 transition-all hover:scale-[1.01]"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                      style={{ background: tier.color + '18', color: tier.color }}
                    >
                      {tier.label}
                    </span>
                    <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>
                      {course.category.replace(/-/g, ' ')}
                    </span>
                  </div>

                  {/* Title + description */}
                  <h3 className="text-base font-bold mb-1">{course.title}</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{course.lesson_count} lesson{course.lesson_count !== 1 ? 's' : ''}</span>
                    <span>{course.estimated_minutes} min</span>
                    <span>{course.enrollment_count} enrolled</span>
                  </div>

                  {/* Tags */}
                  {course.tags?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-3">
                      {course.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
