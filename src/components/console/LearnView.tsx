'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, BookOpen, Users, Clock, CheckCircle, Lock, Play, GraduationCap } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────

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
  content_markdown?: string | null
  video_url?: string | null
}

interface Enrollment {
  id: string
  progress_pct: number
  completed_at: string | null
}

interface CommunityMember {
  id: string
  name: string
  email?: string
  tags?: string[]
  enrolled_courses?: number
  completed_courses?: number
  last_active?: string
}

// ─── Constants ───────────────────────────────────────────────────

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

type Tab = 'courses' | 'community'
type SubView = 'catalog' | 'course' | 'lesson'

// ─── Markdown Renderer ──────────────────────────────────────────

function markdownToHtml(md: string): string {
  let html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:var(--bg-primary);border:1px solid var(--border);border-radius:8px;padding:12px;overflow-x:auto;font-family:var(--font-mono);font-size:12px;line-height:1.5;margin:12px 0"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.06);padding:2px 5px;border-radius:3px;font-family:var(--font-mono);font-size:12px">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;margin:20px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:24px 0 10px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:700;margin:28px 0 12px">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--accent)">$1</a>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:20px;margin-bottom:4px">$1</li>')
    .replace(/\n\n/g, '</p><p style="margin-bottom:12px">')

  html = html.replace(/(<li[\s\S]*?<\/li>)/g, '<ul style="margin:8px 0">$1</ul>')
  html = html.replace(/<\/ul>\s*<ul[^>]*>/g, '')
  return `<p style="margin-bottom:12px">${html}</p>`
}

// ─── Main Component ─────────────────────────────────────────────

export function LearnView() {
  const [tab, setTab] = useState<Tab>('courses')
  const [subView, setSubView] = useState<SubView>('catalog')

  // Catalog state
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')

  // Course detail state
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [courseLoading, setCourseLoading] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [courseError, setCourseError] = useState('')

  // Lesson state
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [lessonAccess, setLessonAccess] = useState('')
  const [lessonCompleted, setLessonCompleted] = useState(false)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [completing, setCompleting] = useState(false)

  // Community state
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  // ─── Load courses ──────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      try {
        const res = await fetch(`/api/courses?${params}`)
        if (res.ok) setCourses(await res.json())
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [category])

  // ─── Load community members ────────────────────────────────────
  useEffect(() => {
    if (tab !== 'community') return
    async function loadMembers() {
      setMembersLoading(true)
      try {
        const res = await fetch('/api/console/community')
        if (res.ok) {
          const data = await res.json()
          setMembers(data.members || [])
        }
      } catch { /* ignore */ }
      setMembersLoading(false)
    }
    loadMembers()
  }, [tab])

  // ─── Navigate to course detail ─────────────────────────────────
  const openCourse = useCallback(async (course: Course) => {
    setActiveCourse(course)
    setSubView('course')
    setCourseLoading(true)
    setCourseError('')
    try {
      const res = await fetch(`/api/courses/${course.slug}`)
      if (res.ok) {
        const data = await res.json()
        setLessons(data.lessons || [])
        setEnrollment(data.enrollment)
        setProgress(data.progress || {})
      }
    } catch { setCourseError('Failed to load course') }
    setCourseLoading(false)
  }, [])

  // ─── Navigate to lesson ────────────────────────────────────────
  const openLesson = useCallback(async (course: Course, lesson: Lesson) => {
    setActiveLesson(lesson)
    setSubView('lesson')
    setLessonLoading(true)
    try {
      const res = await fetch(`/api/courses/${course.slug}/lessons/${lesson.slug}`)
      if (res.ok) {
        const data = await res.json()
        setActiveLesson(data.lesson)
        setLessonAccess(data.access || '')
        setLessonCompleted(data.completed || false)
      }
    } catch { /* ignore */ }
    setLessonLoading(false)
  }, [])

  // ─── Enroll ────────────────────────────────────────────────────
  const handleEnroll = useCallback(async () => {
    if (!activeCourse) return
    setEnrolling(true)
    setCourseError('')
    try {
      const res = await fetch(`/api/courses/${activeCourse.slug}/enroll`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setEnrollment(data)
        if (lessons.length > 0) {
          openLesson(activeCourse, lessons[0])
        }
      } else {
        setCourseError(data.error || 'Enrollment failed')
      }
    } catch { setCourseError('Network error') }
    setEnrolling(false)
  }, [activeCourse, lessons, openLesson])

  // ─── Mark lesson complete ──────────────────────────────────────
  const markComplete = useCallback(async () => {
    if (!activeCourse || !activeLesson) return
    setCompleting(true)
    try {
      const res = await fetch(`/api/courses/${activeCourse.slug}/lessons/${activeLesson.slug}/complete`, { method: 'POST' })
      if (res.ok) {
        setLessonCompleted(true)
        setProgress(prev => ({ ...prev, [activeLesson.id]: true }))
      }
    } catch { /* ignore */ }
    setCompleting(false)
  }, [activeCourse, activeLesson])

  // ─── Back navigation ──────────────────────────────────────────
  const goBack = useCallback(() => {
    if (subView === 'lesson') {
      setSubView('course')
      setActiveLesson(null)
    } else if (subView === 'course') {
      setSubView('catalog')
      setActiveCourse(null)
    }
  }, [subView])

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Tab bar + breadcrumb */}
      <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {subView !== 'catalog' && (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors mr-2"
            style={{ color: 'var(--accent)', background: 'rgba(126,217,87,0.08)' }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
        )}

        <button
          onClick={() => { setTab('courses'); setSubView('catalog'); setActiveCourse(null); setActiveLesson(null) }}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: tab === 'courses' ? 'var(--accent)' : 'var(--bg-card)',
            color: tab === 'courses' ? 'var(--bg-primary)' : 'var(--text-secondary)',
            border: `1px solid ${tab === 'courses' ? 'var(--accent)' : 'var(--border)'}`,
          }}
        >
          <GraduationCap size={14} />
          Courses
        </button>
        <button
          onClick={() => setTab('community')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: tab === 'community' ? 'var(--accent)' : 'var(--bg-card)',
            color: tab === 'community' ? 'var(--bg-primary)' : 'var(--text-secondary)',
            border: `1px solid ${tab === 'community' ? 'var(--accent)' : 'var(--border)'}`,
          }}
        >
          <Users size={14} />
          Community
        </button>

        {/* Breadcrumb */}
        {subView !== 'catalog' && tab === 'courses' && (
          <div className="flex items-center gap-1.5 text-[11px] ml-2" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span className="cursor-pointer hover:underline" onClick={() => { setSubView('catalog'); setActiveCourse(null) }}>Learn</span>
            {activeCourse && (
              <>
                <span>/</span>
                <span
                  className={subView === 'lesson' ? 'cursor-pointer hover:underline' : ''}
                  onClick={() => subView === 'lesson' && setSubView('course')}
                >
                  {activeCourse.title}
                </span>
              </>
            )}
            {activeLesson && subView === 'lesson' && (
              <>
                <span>/</span>
                <span>{activeLesson.title}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'community' ? (
          <CommunityTab members={members} loading={membersLoading} />
        ) : subView === 'catalog' ? (
          <CatalogPanel
            courses={courses}
            loading={loading}
            category={category}
            setCategory={setCategory}
            onSelect={openCourse}
          />
        ) : subView === 'course' && activeCourse ? (
          <CoursePanel
            course={activeCourse}
            lessons={lessons}
            enrollment={enrollment}
            progress={progress}
            loading={courseLoading}
            enrolling={enrolling}
            error={courseError}
            onEnroll={handleEnroll}
            onSelectLesson={(l) => openLesson(activeCourse, l)}
          />
        ) : subView === 'lesson' && activeLesson && activeCourse ? (
          <LessonPanel
            lesson={activeLesson}
            course={activeCourse}
            access={lessonAccess}
            completed={lessonCompleted}
            loading={lessonLoading}
            completing={completing}
            onMarkComplete={markComplete}
            onBack={goBack}
          />
        ) : null}
      </div>
    </div>
  )
}

// ─── Catalog Panel ──────────────────────────────────────────────

function CatalogPanel({
  courses,
  loading,
  category,
  setCategory,
  onSelect,
}: {
  courses: Course[]
  loading: boolean
  category: string
  setCategory: (c: string) => void
  onSelect: (c: Course) => void
}) {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Learn 0nMCP</h2>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          From first install to enterprise deployment. Free courses, hands-on tutorials, tier-gated masterclasses.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
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

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-semibold">No courses in this category yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {courses.map(course => {
            const tier = TIER_BADGE[course.tier_required] || TIER_BADGE.free
            return (
              <button
                key={course.id}
                onClick={() => onSelect(course)}
                className="text-left rounded-xl p-4 transition-all hover:scale-[1.01] border-none cursor-pointer"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
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
                <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{course.title}</h3>
                <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {course.description}
                </p>
                <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><BookOpen size={10} />{course.lesson_count} lessons</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{course.estimated_minutes} min</span>
                  <span className="flex items-center gap-1"><Users size={10} />{course.enrollment_count}</span>
                </div>
                {course.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {course.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Course Detail Panel ────────────────────────────────────────

function CoursePanel({
  course,
  lessons,
  enrollment,
  progress,
  loading,
  enrolling,
  error,
  onEnroll,
  onSelectLesson,
}: {
  course: Course
  lessons: Lesson[]
  enrollment: Enrollment | null
  progress: Record<string, boolean>
  loading: boolean
  enrolling: boolean
  error: string
  onEnroll: () => void
  onSelectLesson: (l: Lesson) => void
}) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Loading course...</p>
      </div>
    )
  }

  const tierColor = TIER_BADGE[course.tier_required]?.color || '#7ed957'
  const completedCount = Object.values(progress).filter(Boolean).length

  return (
    <div className="p-4 max-w-3xl">
      {/* Course header */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
          style={{ background: tierColor + '18', color: tierColor }}
        >
          {course.tier_required}
        </span>
        <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>
          {course.category.replace(/-/g, ' ')}
        </span>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-2">{course.title}</h2>
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{course.description}</p>

      <div className="flex gap-4 text-[11px] font-medium mb-6" style={{ color: 'var(--text-muted)' }}>
        <span>{course.lesson_count} lessons</span>
        <span>{course.estimated_minutes} min</span>
        <span>{course.enrollment_count} enrolled</span>
        <span>By {course.author_name || '0nORK Team'}</span>
      </div>

      {/* Enrollment / Progress */}
      {enrollment ? (
        <div
          className="rounded-xl p-4 mb-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold">Your Progress</span>
            <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
              {enrollment.progress_pct}% complete
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${enrollment.progress_pct}%`, background: 'var(--accent)' }}
            />
          </div>
          <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {completedCount} of {lessons.length} lessons completed
            {enrollment.completed_at && ' — Course complete!'}
          </p>
        </div>
      ) : (
        <div className="mb-6">
          {error && (
            <div className="text-xs font-semibold mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,61,61,0.1)', color: '#ff3d3d' }}>
              {error}
            </div>
          )}
          <button
            onClick={onEnroll}
            disabled={enrolling}
            className="px-5 py-2.5 rounded-xl font-bold text-xs transition-all"
            style={{
              background: enrolling ? 'var(--bg-card)' : 'var(--accent)',
              color: enrolling ? 'var(--text-muted)' : 'var(--bg-primary)',
              cursor: enrolling ? 'wait' : 'pointer',
              border: 'none',
            }}
          >
            {enrolling ? 'Enrolling...' : course.tier_required === 'free' ? 'Start Course — Free' : `Enroll (${course.tier_required} tier)`}
          </button>
        </div>
      )}

      {/* Lesson list */}
      <h3 className="text-sm font-bold mb-3">Lessons</h3>
      <div className="flex flex-col gap-1.5">
        {lessons.map((lesson, i) => {
          const completed = progress[lesson.id]
          const accessible = enrollment || lesson.is_free_preview

          return (
            <button
              key={lesson.id}
              onClick={() => accessible && onSelectLesson(lesson)}
              disabled={!accessible}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-left w-full border-none"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${completed ? 'rgba(126,217,87,0.2)' : 'var(--border)'}`,
                opacity: accessible ? 1 : 0.5,
                cursor: accessible ? 'pointer' : 'default',
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{
                  background: completed ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.05)',
                  color: completed ? '#7ed957' : 'var(--text-muted)',
                }}
              >
                {completed ? <CheckCircle size={12} /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{lesson.title}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {lesson.duration_minutes} min
                  {lesson.is_free_preview && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(126,217,87,0.1)', color: '#7ed957' }}>
                      Free Preview
                    </span>
                  )}
                </div>
              </div>
              {!accessible && <Lock size={12} style={{ color: 'var(--text-muted)' }} />}
              {accessible && !completed && <Play size={12} style={{ color: 'var(--accent)' }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Lesson Panel ───────────────────────────────────────────────

function LessonPanel({
  lesson,
  course,
  access,
  completed,
  loading,
  completing,
  onMarkComplete,
  onBack,
}: {
  lesson: Lesson
  course: Course
  access: string
  completed: boolean
  loading: boolean
  completing: boolean
  onMarkComplete: () => void
  onBack: () => void
}) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Loading lesson...</p>
      </div>
    )
  }

  if (access === 'login_required') {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <Lock size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-bold mb-2">{lesson.title}</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Log in to access this lesson.</p>
        <a
          href={`/login?redirect=/console`}
          className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs"
          style={{ background: 'var(--accent)', color: 'var(--bg-primary)', textDecoration: 'none' }}
        >
          Log In
        </a>
      </div>
    )
  }

  if (access === 'enroll_required') {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <BookOpen size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-bold mb-2">{lesson.title}</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          Enroll in &quot;{course.title}&quot; to access this lesson.
        </p>
        <button
          onClick={onBack}
          className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs border-none cursor-pointer"
          style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
        >
          View Course
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-3xl">
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
      <h2 className="text-xl font-bold tracking-tight mb-1">{lesson.title}</h2>
      <div className="flex items-center gap-3 text-[11px] mb-6" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><Clock size={10} />{lesson.duration_minutes} min</span>
        {lesson.is_free_preview && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(126,217,87,0.1)', color: '#7ed957' }}>
            Free Preview
          </span>
        )}
        {completed && (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(126,217,87,0.1)', color: '#7ed957' }}>
            <CheckCircle size={9} /> Completed
          </span>
        )}
      </div>

      {/* Content */}
      {lesson.content_markdown ? (
        <div
          className="mb-8"
          style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-primary)' }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(lesson.content_markdown) }}
        />
      ) : (
        <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
          <p className="text-xs">Content coming soon.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        {access === 'enrolled' && !completed && (
          <button
            onClick={onMarkComplete}
            disabled={completing}
            className="px-4 py-2 rounded-xl font-bold text-xs border-none cursor-pointer"
            style={{
              background: completing ? 'var(--bg-card)' : 'var(--accent)',
              color: completing ? 'var(--text-muted)' : 'var(--bg-primary)',
            }}
          >
            {completing ? 'Saving...' : 'Mark Complete'}
          </button>
        )}
        {completed && (
          <span className="text-xs font-bold" style={{ color: '#7ed957' }}>Lesson complete</span>
        )}
        <button
          onClick={onBack}
          className="px-3 py-2 rounded-xl text-xs font-semibold border-none cursor-pointer"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          Back to Course
        </button>
      </div>
    </div>
  )
}

// ─── Community Tab ──────────────────────────────────────────────

function CommunityTab({ members, loading }: { members: CommunityMember[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Loading community...</p>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="p-8 text-center">
        <Users size={32} className="mx-auto mb-3 opacity-40" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-bold mb-2">Community</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          CRM community members will appear here once connected via .0n
        </p>
        <div
          className="mt-4 inline-block text-[11px] font-mono px-3 py-2 rounded-lg"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          ~/.0n/connections/crm.0n
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-1">Community Members</h2>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {members.length} member{members.length !== 1 ? 's' : ''} from CRM community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {members.map(member => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}
            >
              {member.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {member.name}
              </div>
              <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                {member.email || 'No email'}
              </div>
            </div>
            {member.tags && member.tags.length > 0 && (
              <div className="flex gap-1 flex-shrink-0">
                {member.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(126,217,87,0.08)', color: 'var(--accent)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
