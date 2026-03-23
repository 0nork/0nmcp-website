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

interface EnrollmentInfo {
  course_id: string
  progress_pct: number
  completed_at: string | null
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

const TIER_BADGE: Record<string, { label: string; color: string; price: string }> = {
  free: { label: 'Free', color: '#7ed957', price: '' },
  supporter: { label: 'Supporter', color: '#ff6b35', price: '$9/mo' },
  builder: { label: 'Builder', color: '#00d4ff', price: '$29/mo' },
  enterprise: { label: 'Enterprise', color: '#9945ff', price: '$99/mo' },
}

export default function ConsoleLearnPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<EnrollmentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      try {
        const [coursesRes, enrollRes] = await Promise.all([
          fetch(`/api/courses?${params}`),
          fetch('/api/courses/enrollments'),
        ])
        if (coursesRes.ok) setCourses(await coursesRes.json())
        if (enrollRes.ok) {
          const data = await enrollRes.json()
          setEnrollments(data.enrollments || [])
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [category])

  const enrollmentMap = Object.fromEntries(
    enrollments.map(e => [e.course_id, e])
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--jp-text)' }}>
          Learning Center
        </h1>
        <p className="text-sm" style={{ color: 'var(--jp-text-secondary)' }}>
          Master AI orchestration with 0nMCP. Free courses, hands-on tutorials, and tier-gated masterclasses.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            style={{
              background: category === cat.value ? 'var(--jp-green)' : 'var(--jp-bg-card)',
              color: category === cat.value ? 'var(--jp-bg)' : 'var(--jp-text-secondary)',
              border: `1px solid ${category === cat.value ? 'var(--jp-green)' : 'var(--jp-border)'}`,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="text-2xl font-black" style={{ color: 'var(--jp-green)', fontFamily: 'var(--font-mono)' }}>0n</div>
          <p className="text-xs mt-2" style={{ color: 'var(--jp-text-muted)' }}>Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--jp-text-muted)' }}>
          <svg className="mx-auto mb-3 opacity-40" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-sm font-semibold">No courses in this category yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(course => {
            const tier = TIER_BADGE[course.tier_required] || TIER_BADGE.free
            const enrollment = enrollmentMap[course.id]
            const isCompleted = enrollment?.completed_at
            const isInProgress = enrollment && !isCompleted && enrollment.progress_pct > 0
            const isEnrolled = !!enrollment

            return (
              <Link
                key={course.id}
                href={`/console/learn/${course.slug}`}
                className="block rounded-xl p-5 transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--jp-bg-card)',
                  border: `1px solid ${isCompleted ? 'rgba(126,217,87,0.3)' : 'var(--jp-border)'}`,
                  textDecoration: 'none',
                  color: 'inherit',
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
                  <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--jp-text-muted)' }}>
                    {course.category.replace(/-/g, ' ')}
                  </span>
                  {isCompleted && (
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(126,217,87,0.12)', color: '#7ed957' }}>
                      Completed
                    </span>
                  )}
                </div>

                {/* Title + description */}
                <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--jp-text)' }}>{course.title}</h3>
                <p className="text-[11px] leading-relaxed mb-4" style={{ color: 'var(--jp-text-secondary)' }}>
                  {course.description}
                </p>

                {/* Progress bar */}
                {isEnrolled && (
                  <div className="mb-3">
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${enrollment.progress_pct}%`, background: 'var(--jp-green)' }}
                      />
                    </div>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--jp-text-muted)' }}>
                      {enrollment.progress_pct}% complete
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--jp-text-muted)' }}>
                  <span>{course.lesson_count} lesson{course.lesson_count !== 1 ? 's' : ''}</span>
                  <span>{course.estimated_minutes} min</span>
                  <span>{course.enrollment_count} enrolled</span>
                </div>

                {/* Action hint */}
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--jp-border)' }}>
                  {isCompleted ? (
                    <span className="text-[11px] font-bold" style={{ color: '#7ed957' }}>Review Course</span>
                  ) : isInProgress ? (
                    <span className="text-[11px] font-bold" style={{ color: 'var(--jp-cyan)' }}>Continue Learning</span>
                  ) : isEnrolled ? (
                    <span className="text-[11px] font-bold" style={{ color: 'var(--jp-green)' }}>Start Course</span>
                  ) : (
                    <span className="text-[11px] font-bold" style={{ color: 'var(--jp-green)' }}>
                      {course.tier_required === 'free' ? 'Start Free' : `Requires ${tier.label} — ${tier.price}`}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {course.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-3">
                    {course.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--jp-text-muted)' }}>
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
    </div>
  )
}
