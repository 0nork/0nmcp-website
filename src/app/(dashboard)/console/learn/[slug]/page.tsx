'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
  free: '#6EE05A',
  supporter: '#ff6b35',
  builder: '#00d4ff',
  enterprise: '#9945ff',
}

const TIER_PRICES: Record<string, string> = {
  supporter: '$9/mo',
  builder: '$29/mo',
  enterprise: '$99/mo',
}

export default function ConsoleCoursePage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [userTier, setUserTier] = useState('free')
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [courseRes, profileRes] = await Promise.all([
          fetch(`/api/courses/${slug}`),
          fetch('/api/console/account'),
        ])

        if (!courseRes.ok) { setError('Course not found'); setLoading(false); return }
        const data = await courseRes.json()
        setCourse(data.course)
        setLessons(data.lessons || [])
        setEnrollment(data.enrollment)
        setProgress(data.progress || {})

        if (profileRes.ok) {
          const profile = await profileRes.json()
          setUserTier(profile.sponsor_tier || 'free')
        }
      } catch {
        setError('Failed to load course')
      }
      setLoading(false)
    }
    load()
  }, [slug])

  // Auto-enroll after successful Stripe checkout
  useEffect(() => {
    if (searchParams.get('enrolled') === 'true' && course && !enrollment) {
      handleEnroll()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, course])

  async function handleEnroll() {
    setEnrolling(true)
    setError('')
    try {
      const res = await fetch(`/api/courses/${slug}/enroll`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setEnrollment(data)
        if (lessons.length > 0) {
          router.push(`/console/learn/${slug}/${lessons[0].slug}`)
        }
      } else {
        setError(data.error || 'Enrollment failed')
      }
    } catch {
      setError('Network error')
    }
    setEnrolling(false)
  }

  async function handleCheckout() {
    setCheckingOut(true)
    setError('')
    try {
      const res = await fetch(`/api/courses/${slug}/checkout`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Checkout failed')
        setCheckingOut(false)
      }
    } catch {
      setError('Network error')
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl font-black" style={{ color: 'var(--jp-green)', fontFamily: 'var(--font-mono)' }}>0n</div>
        <p className="text-xs mt-2" style={{ color: 'var(--jp-text-muted)' }}>Loading course...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--jp-text)' }}>Course Not Found</h1>
        <Link href="/console/learn" className="text-sm" style={{ color: 'var(--jp-green)' }}>Back to courses</Link>
      </div>
    )
  }

  const tierColor = TIER_COLORS[course.tier_required] || '#6EE05A'
  const completedCount = Object.values(progress).filter(Boolean).length
  const tierHierarchy: Record<string, number> = { free: 0, supporter: 1, builder: 2, enterprise: 3 }
  const userHasTier = (tierHierarchy[userTier] || 0) >= (tierHierarchy[course.tier_required] || 0)
  const isFree = course.tier_required === 'free'
  const canEnrollDirectly = isFree || userHasTier

  return (
    <div className="p-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="text-[11px] mb-6" style={{ color: 'var(--jp-text-muted)', fontFamily: 'var(--font-mono)' }}>
        <Link href="/console/learn" className="hover:underline" style={{ color: 'var(--jp-text-muted)' }}>Learn</Link>
        <span className="mx-2">/</span>
        <span style={{ color: 'var(--jp-text-secondary)' }}>{course.title}</span>
      </div>

      {/* Course header */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
          style={{ background: tierColor + '18', color: tierColor }}
        >
          {course.tier_required}
        </span>
        <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--jp-text-muted)' }}>
          {course.category.replace(/-/g, ' ')}
        </span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--jp-text)' }}>{course.title}</h1>
      <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--jp-text-secondary)' }}>{course.description}</p>

      <div className="flex gap-5 text-[11px] font-medium mb-6" style={{ color: 'var(--jp-text-muted)' }}>
        <span>{course.lesson_count} lessons</span>
        <span>{course.estimated_minutes} min</span>
        <span>{course.enrollment_count} enrolled</span>
        <span>By {course.author_name || '0nORK Team'}</span>
      </div>

      {/* Enrollment / Progress / Checkout */}
      {enrollment ? (
        <div
          className="rounded-xl p-5 mb-8"
          style={{ background: 'var(--jp-bg-card)', border: '1px solid var(--jp-border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: 'var(--jp-text)' }}>Your Progress</span>
            <span className="text-xs font-bold" style={{ color: 'var(--jp-green)' }}>
              {enrollment.progress_pct}% complete
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${enrollment.progress_pct}%`, background: 'var(--jp-green)' }}
            />
          </div>
          <p className="text-[10px] mt-2" style={{ color: 'var(--jp-text-muted)' }}>
            {completedCount} of {lessons.length} lessons completed
            {enrollment.completed_at && ' — Course complete!'}
          </p>
          {lessons.length > 0 && (
            <Link
              href={`/console/learn/${slug}/${getNextLesson(lessons, progress)?.slug || lessons[0].slug}`}
              className="inline-block mt-3 px-5 py-2.5 rounded-xl font-bold text-xs transition-all"
              style={{
                background: 'var(--jp-green)',
                color: 'var(--jp-bg)',
                textDecoration: 'none',
              }}
            >
              {enrollment.completed_at ? 'Review Lessons' : completedCount > 0 ? 'Continue Learning' : 'Start Learning'}
            </Link>
          )}
        </div>
      ) : (
        <div className="mb-8">
          {error && (
            <div className="text-xs font-semibold mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,61,61,0.1)', color: '#ff3d3d' }}>
              {error}
            </div>
          )}
          {canEnrollDirectly ? (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
              style={{
                background: enrolling ? 'var(--jp-bg-card)' : 'var(--jp-green)',
                color: enrolling ? 'var(--jp-text-muted)' : 'var(--jp-bg)',
                border: 'none',
                cursor: enrolling ? 'wait' : 'pointer',
              }}
            >
              {enrolling ? 'Enrolling...' : isFree ? 'Start Course — Free' : 'Enroll Free (Your Tier Covers This)'}
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
              style={{
                background: checkingOut ? 'var(--jp-bg-card)' : tierColor,
                color: checkingOut ? 'var(--jp-text-muted)' : 'var(--jp-bg)',
                border: 'none',
                cursor: checkingOut ? 'wait' : 'pointer',
              }}
            >
              {checkingOut
                ? 'Redirecting to checkout...'
                : `Upgrade to ${course.tier_required.charAt(0).toUpperCase() + course.tier_required.slice(1)} — ${TIER_PRICES[course.tier_required]}`
              }
            </button>
          )}
        </div>
      )}

      {/* Lesson list */}
      <h2 className="text-base font-bold mb-4" style={{ color: 'var(--jp-text)' }}>Lessons</h2>
      <div className="flex flex-col gap-2">
        {lessons.map((lesson, i) => {
          const completed = progress[lesson.id]
          const accessible = enrollment || lesson.is_free_preview

          return (
            <div
              key={lesson.id}
              className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all"
              style={{
                background: 'var(--jp-bg-card)',
                border: `1px solid ${completed ? 'rgba(126,217,87,0.2)' : 'var(--jp-border)'}`,
                opacity: accessible ? 1 : 0.5,
                cursor: accessible ? 'pointer' : 'default',
              }}
              onClick={() => accessible && router.push(`/console/learn/${slug}/${lesson.slug}`)}
            >
              {/* Number / check */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{
                  background: completed ? 'rgba(126,217,87,0.15)' : 'var(--bg-card)',
                  color: completed ? '#6EE05A' : 'var(--jp-text-muted)',
                }}
              >
                {completed ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold" style={{ color: 'var(--jp-text)' }}>{lesson.title}</div>
                <div className="text-[10px]" style={{ color: 'var(--jp-text-muted)' }}>
                  {lesson.duration_minutes} min
                  {lesson.is_free_preview && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(126,217,87,0.1)', color: '#6EE05A' }}>
                      Free Preview
                    </span>
                  )}
                </div>
              </div>

              {/* Lock / Play icon */}
              {!accessible ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--jp-text-muted)' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              ) : !completed ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--jp-green)' }}>
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getNextLesson(lessons: { id: string; slug: string }[], progress: Record<string, boolean>) {
  return lessons.find(l => !progress[l.id]) || lessons[0]
}
