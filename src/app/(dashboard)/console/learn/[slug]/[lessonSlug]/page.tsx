'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  slug: string
  order_index: number
  content_markdown: string | null
  video_url: string | null
  duration_minutes: number
  is_free_preview: boolean
}

interface CourseRef {
  id: string
  title: string
  slug: string
  tier_required: string
}

interface LessonNav {
  id: string
  title: string
  slug: string
  completed: boolean
}

export default function ConsoleLessonPage() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug: string }>()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<CourseRef | null>(null)
  const [access, setAccess] = useState('')
  const [completed, setCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [allLessons, setAllLessons] = useState<LessonNav[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [lessonRes, courseRes] = await Promise.all([
          fetch(`/api/courses/${slug}/lessons/${lessonSlug}`),
          fetch(`/api/courses/${slug}`),
        ])
        if (lessonRes.ok) {
          const data = await lessonRes.json()
          setLesson(data.lesson)
          setCourse(data.course)
          setAccess(data.access || '')
          setCompleted(data.completed || false)
        }
        if (courseRes.ok) {
          const courseData = await courseRes.json()
          const progress: Record<string, boolean> = courseData.progress || {}
          setAllLessons(
            (courseData.lessons || []).map((l: { id: string; title: string; slug: string }) => ({
              ...l,
              completed: progress[l.id] || false,
            }))
          )
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [slug, lessonSlug])

  async function markComplete() {
    setCompleting(true)
    try {
      const res = await fetch(`/api/courses/${slug}/lessons/${lessonSlug}/complete`, { method: 'POST' })
      if (res.ok) {
        setCompleted(true)
        setAllLessons(prev => prev.map(l => l.slug === lessonSlug ? { ...l, completed: true } : l))
      }
    } catch { /* ignore */ }
    setCompleting(false)
  }

  const currentIndex = allLessons.findIndex(l => l.slug === lessonSlug)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl font-black" style={{ color: 'var(--jp-green)', fontFamily: 'var(--font-mono)' }}>0n</div>
        <p className="text-xs mt-2" style={{ color: 'var(--jp-text-muted)' }}>Loading lesson...</p>
      </div>
    )
  }

  if (!lesson || !course) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--jp-text)' }}>Lesson Not Found</h1>
        <Link href="/console/learn" className="text-sm" style={{ color: 'var(--jp-green)' }}>Back to courses</Link>
      </div>
    )
  }

  // Access gating
  if (access === 'login_required') {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <svg className="mx-auto mb-3" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--jp-text-muted)' }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--jp-text)' }}>{lesson.title}</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--jp-text-secondary)' }}>Log in to access this lesson.</p>
        <Link
          href={`/login?redirect=/console/learn/${slug}/${lessonSlug}`}
          className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs"
          style={{ background: 'var(--jp-green)', color: 'var(--jp-bg)', textDecoration: 'none' }}
        >
          Log In
        </Link>
      </div>
    )
  }

  if (access === 'enroll_required') {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <svg className="mx-auto mb-3" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: 'var(--jp-text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--jp-text)' }}>{lesson.title}</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--jp-text-secondary)' }}>
          Enroll in &quot;{course.title}&quot; to access this lesson.
        </p>
        <Link
          href={`/console/learn/${slug}`}
          className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs"
          style={{ background: 'var(--jp-green)', color: 'var(--jp-bg)', textDecoration: 'none' }}
        >
          View Course
        </Link>
      </div>
    )
  }

  const completedCount = allLessons.filter(l => l.completed).length

  return (
    <div className="flex h-full">
      {/* Progress Sidebar */}
      <div
        className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto"
        style={{
          width: 260,
          background: 'var(--jp-bg)',
          borderRight: '1px solid var(--jp-border)',
        }}
      >
        <div className="p-4">
          <Link href={`/console/learn/${slug}`} className="text-[11px] font-semibold hover:underline" style={{ color: 'var(--jp-green)', textDecoration: 'none' }}>
            {course.title}
          </Link>
          <div className="text-[10px] mt-1" style={{ color: 'var(--jp-text-muted)' }}>
            {completedCount} of {allLessons.length} complete
          </div>
          <div className="w-full h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${allLessons.length ? (completedCount / allLessons.length) * 100 : 0}%`,
                background: 'var(--jp-green)',
              }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {allLessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => router.push(`/console/learn/${slug}/${l.slug}`)}
              className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-0.5 transition-all cursor-pointer"
              style={{
                background: l.slug === lessonSlug ? 'var(--jp-bg-card-hover)' : 'transparent',
                border: 'none',
                color: 'inherit',
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                style={{
                  background: l.completed ? 'rgba(126,217,87,0.15)' : l.slug === lessonSlug ? 'var(--jp-green-glow)' : 'var(--bg-card)',
                  color: l.completed ? '#6EE05A' : l.slug === lessonSlug ? 'var(--jp-green)' : 'var(--jp-text-muted)',
                }}
              >
                {l.completed ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span
                className="text-[11px] font-medium truncate"
                style={{
                  color: l.slug === lessonSlug ? 'var(--jp-text)' : l.completed ? 'var(--jp-text-secondary)' : 'var(--jp-text-muted)',
                }}
              >
                {l.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'var(--jp-green)',
          color: 'var(--jp-bg)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="lg:hidden fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
            style={{
              width: 260,
              background: 'var(--jp-bg-elevated)',
              borderLeft: '1px solid var(--jp-border)',
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold" style={{ color: 'var(--jp-text)' }}>Lessons</span>
                <button onClick={() => setSidebarOpen(false)} className="cursor-pointer" style={{ background: 'none', border: 'none', color: 'var(--jp-text-muted)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {allLessons.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => { router.push(`/console/learn/${slug}/${l.slug}`); setSidebarOpen(false) }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg mb-0.5 cursor-pointer"
                  style={{
                    background: l.slug === lessonSlug ? 'var(--jp-bg-card-hover)' : 'transparent',
                    border: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{
                      background: l.completed ? 'rgba(126,217,87,0.15)' : 'var(--bg-card)',
                      color: l.completed ? '#6EE05A' : 'var(--jp-text-muted)',
                    }}
                  >
                    {l.completed ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className="text-[11px] font-medium truncate" style={{ color: l.slug === lessonSlug ? 'var(--jp-text)' : 'var(--jp-text-muted)' }}>
                    {l.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main lesson content */}
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl">
        {/* Breadcrumb */}
        <div className="text-[11px] mb-6" style={{ color: 'var(--jp-text-muted)', fontFamily: 'var(--font-mono)' }}>
          <Link href="/console/learn" className="hover:underline" style={{ color: 'var(--jp-text-muted)', textDecoration: 'none' }}>Learn</Link>
          <span className="mx-2">/</span>
          <Link href={`/console/learn/${slug}`} className="hover:underline" style={{ color: 'var(--jp-text-muted)', textDecoration: 'none' }}>{course.title}</Link>
          <span className="mx-2">/</span>
          <span style={{ color: 'var(--jp-text-secondary)' }}>{lesson.title}</span>
        </div>

        {/* Video */}
        {lesson.video_url && (
          <div className="mb-6 rounded-xl overflow-hidden" style={{ background: '#000', aspectRatio: '16/9' }}>
            <iframe
              src={lesson.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Lesson title */}
        <h1 className="text-xl font-bold tracking-tight mb-1" style={{ color: 'var(--jp-text)' }}>{lesson.title}</h1>
        <div className="flex items-center gap-3 text-[11px] mb-6" style={{ color: 'var(--jp-text-muted)' }}>
          <span>{lesson.duration_minutes} min</span>
          {lesson.is_free_preview && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(126,217,87,0.1)', color: '#6EE05A' }}>
              Free Preview
            </span>
          )}
          {completed && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(126,217,87,0.1)', color: '#6EE05A' }}>
              Completed
            </span>
          )}
        </div>

        {/* Content */}
        {lesson.content_markdown ? (
          <div
            className="mb-8"
            style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--jp-text)' }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(lesson.content_markdown) }}
          />
        ) : (
          <div className="py-8 text-center" style={{ color: 'var(--jp-text-muted)' }}>
            <p className="text-xs">Content coming soon.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-5 mb-6" style={{ borderTop: '1px solid var(--jp-border)' }}>
          {access === 'enrolled' && !completed && (
            <button
              onClick={markComplete}
              disabled={completing}
              className="px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer"
              style={{
                background: completing ? 'var(--jp-bg-card)' : 'var(--jp-green)',
                color: completing ? 'var(--jp-text-muted)' : 'var(--jp-bg)',
                border: 'none',
              }}
            >
              {completing ? 'Saving...' : 'Mark Complete'}
            </button>
          )}
          {completed && (
            <span className="text-xs font-bold" style={{ color: '#6EE05A' }}>Lesson complete</span>
          )}
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between gap-3">
          {prevLesson ? (
            <Link
              href={`/console/learn/${slug}/${prevLesson.slug}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
              style={{
                background: 'var(--jp-bg-card)',
                border: '1px solid var(--jp-border)',
                color: 'var(--jp-text-secondary)',
                textDecoration: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {prevLesson.title}
            </Link>
          ) : <div />}
          {nextLesson ? (
            <Link
              href={`/console/learn/${slug}/${nextLesson.slug}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
              style={{
                background: 'var(--jp-bg-card)',
                border: '1px solid var(--jp-border)',
                color: 'var(--jp-text-secondary)',
                textDecoration: 'none',
              }}
            >
              {nextLesson.title}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <Link
              href={`/console/learn/${slug}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
              style={{
                background: 'var(--jp-green)',
                color: 'var(--jp-bg)',
                textDecoration: 'none',
                border: 'none',
              }}
            >
              Back to Course
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function markdownToHtml(md: string): string {
  let html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:var(--jp-bg);border:1px solid var(--jp-border);border-radius:8px;padding:12px;overflow-x:auto;font-family:var(--font-mono);font-size:12px;line-height:1.5;margin:12px 0"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--border);padding:2px 5px;border-radius:3px;font-family:var(--font-mono);font-size:12px">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;margin:20px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:24px 0 10px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:700;margin:28px 0 12px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--jp-green)">$1</a>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:20px;margin-bottom:4px">$1</li>')
    .replace(/\n\n/g, '</p><p style="margin-bottom:12px">')

  html = html.replace(/(<li[\s\S]*?<\/li>)/g, '<ul style="margin:8px 0">$1</ul>')
  html = html.replace(/<\/ul>\s*<ul[^>]*>/g, '')
  return `<p style="margin-bottom:12px">${html}</p>`
}
