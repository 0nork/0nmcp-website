'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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

interface Lesson {
  id: string
  title: string
  slug: string
  order_index: number
  duration_minutes: number
  is_free_preview: boolean
}

const TIER_COLORS: Record<string, string> = {
  free: '#6EE05A',
  supporter: '#ff6b35',
  builder: '#00d4ff',
  enterprise: '#9945ff',
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/courses/${slug}`)
      if (!res.ok) { setError('Course not found'); setLoading(false); return }
      const data = await res.json()
      setCourse(data.course)
      setLessons(data.lessons || [])
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="pt-40 pb-16 px-8 text-center">
        <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Loading course...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="pt-40 pb-16 px-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
        <Link href="/learn" className="text-sm" style={{ color: 'var(--accent)' }}>Back to courses</Link>
      </div>
    )
  }

  const tierColor = TIER_COLORS[course.tier_required] || '#6EE05A'

  return (
    <div className="pt-32 pb-24 px-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
        <Link href="/learn" className="hover:underline">Learn</Link>
        <span className="mx-2">/</span>
        <span>{course.title}</span>
      </div>

      {/* Course header */}
      <div className="flex items-start gap-3 mb-2">
        <span
          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-1"
          style={{ background: tierColor + '18', color: tierColor }}
        >
          {course.tier_required}
        </span>
        <span className="text-[10px] font-medium uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
          {course.category.replace(/-/g, ' ')}
        </span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{course.title}</h1>
      <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{course.description}</p>

      {/* Stats bar */}
      <div className="flex gap-6 text-xs font-medium mb-8" style={{ color: 'var(--text-muted)' }}>
        <span>{course.lesson_count} lessons</span>
        <span>{course.estimated_minutes} min</span>
        <span>{course.enrollment_count} enrolled</span>
        <span>By {course.author_name || '0nORK Team'}</span>
      </div>

      {/* CTA — Sign in to access */}
      <div
        className="rounded-2xl p-6 mb-8 text-center"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h3 className="text-lg font-bold mb-2">Ready to learn?</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Create a free account to access courses, track progress, and earn completions.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href={`/login?redirect=/console/learn/${slug}`}
            className="inline-block px-6 py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'var(--accent)', color: 'var(--bg-primary)', textDecoration: 'none' }}
          >
            Sign In to Enroll
          </Link>
          <Link
            href={`/signup?redirect=/console/learn/${slug}`}
            className="inline-block px-6 py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', textDecoration: 'none' }}
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Lesson list (locked preview) */}
      <h2 className="text-lg font-bold mb-4">Course Outline</h2>
      <div className="flex flex-col gap-2">
        {lessons.map((lesson, i) => (
          <div
            key={lesson.id}
            className="flex items-center gap-4 rounded-xl px-4 py-3"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              opacity: 0.7,
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-muted)',
              }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{lesson.title}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {lesson.duration_minutes} min
                {lesson.is_free_preview && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(126,217,87,0.1)', color: '#6EE05A' }}>
                    Free Preview
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
