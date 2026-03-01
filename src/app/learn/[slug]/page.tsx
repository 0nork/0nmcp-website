'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface Enrollment {
  id: string
  progress_pct: number
  completed_at: string | null
}

const TIER_COLORS: Record<string, string> = {
  free: '#7ed957',
  supporter: '#ff6b35',
  builder: '#00d4ff',
  enterprise: '#9945ff',
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/courses/${slug}`)
      if (!res.ok) { setError('Course not found'); setLoading(false); return }
      const data = await res.json()
      setCourse(data.course)
      setLessons(data.lessons || [])
      setEnrollment(data.enrollment)
      setProgress(data.progress || {})
      setLoading(false)
    }
    load()
  }, [slug])

  async function handleEnroll() {
    setEnrolling(true)
    setError('')
    const res = await fetch(`/api/courses/${slug}/enroll`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setEnrollment(data)
      // Navigate to first lesson
      if (lessons.length > 0) {
        router.push(`/learn/${slug}/${lessons[0].slug}`)
      }
    } else if (res.status === 401) {
      router.push(`/login?redirect=/learn/${slug}`)
    } else {
      setError(data.error || 'Enrollment failed')
    }
    setEnrolling(false)
  }

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

  const tierColor = TIER_COLORS[course.tier_required] || '#7ed957'
  const completedCount = Object.values(progress).filter(Boolean).length

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

      {/* Enrollment / Progress */}
      {enrollment ? (
        <div
          className="rounded-2xl p-5 mb-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold">Your Progress</span>
            <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
              {enrollment.progress_pct}% complete
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${enrollment.progress_pct}%`, background: 'var(--accent)' }}
            />
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
            {completedCount} of {lessons.length} lessons completed
            {enrollment.completed_at && ' — Course complete!'}
          </p>
        </div>
      ) : (
        <div className="mb-8">
          {error && (
            <div className="text-xs font-semibold mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,61,61,0.1)', color: '#ff3d3d' }}>
              {error}
              {error.includes('tier') && (
                <Link href="/sponsor" className="ml-2 underline">Upgrade</Link>
              )}
            </div>
          )}
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              background: enrolling ? 'var(--bg-card)' : 'var(--accent)',
              color: enrolling ? 'var(--text-muted)' : 'var(--bg-primary)',
              cursor: enrolling ? 'wait' : 'pointer',
            }}
          >
            {enrolling ? 'Enrolling...' : course.tier_required === 'free' ? 'Start Course — Free' : `Enroll (${course.tier_required} tier)`}
          </button>
        </div>
      )}

      {/* Lesson list */}
      <h2 className="text-lg font-bold mb-4">Lessons</h2>
      <div className="flex flex-col gap-2">
        {lessons.map((lesson, i) => {
          const completed = progress[lesson.id]
          const accessible = enrollment || lesson.is_free_preview

          return (
            <div
              key={lesson.id}
              className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${completed ? 'rgba(126,217,87,0.2)' : 'var(--border)'}`,
                opacity: accessible ? 1 : 0.5,
                cursor: accessible ? 'pointer' : 'default',
              }}
              onClick={() => accessible && router.push(`/learn/${slug}/${lesson.slug}`)}
            >
              {/* Number / check */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: completed ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.05)',
                  color: completed ? '#7ed957' : 'var(--text-muted)',
                }}
              >
                {completed ? '✓' : i + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{lesson.title}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {lesson.duration_minutes} min
                  {lesson.is_free_preview && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(126,217,87,0.1)', color: '#7ed957' }}>
                      Free Preview
                    </span>
                  )}
                </div>
              </div>

              {/* Lock icon for non-accessible */}
              {!accessible && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>🔒</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
