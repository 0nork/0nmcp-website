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

export default function LessonPage() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug: string }>()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<CourseRef | null>(null)
  const [access, setAccess] = useState('')
  const [completed, setCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/courses/${slug}/lessons/${lessonSlug}`)
      const data = await res.json()
      setLesson(data.lesson)
      setCourse(data.course)
      setAccess(data.access || '')
      setCompleted(data.completed || false)
      setLoading(false)
    }
    load()
  }, [slug, lessonSlug])

  async function markComplete() {
    setCompleting(true)
    const res = await fetch(`/api/courses/${slug}/lessons/${lessonSlug}/complete`, { method: 'POST' })
    if (res.ok) setCompleted(true)
    setCompleting(false)
  }

  if (loading) {
    return (
      <div className="pt-40 pb-16 px-8 text-center">
        <div className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>0n</div>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Loading lesson...</p>
      </div>
    )
  }

  if (!lesson || !course) {
    return (
      <div className="pt-40 pb-16 px-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Lesson Not Found</h1>
        <Link href="/learn" className="text-sm" style={{ color: 'var(--accent)' }}>Back to courses</Link>
      </div>
    )
  }

  // Access gating
  if (access === 'login_required') {
    return (
      <div className="pt-40 pb-16 px-8 text-center max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-3">{lesson.title}</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Log in to access this lesson.
        </p>
        <Link
          href={`/login?redirect=/learn/${slug}/${lessonSlug}`}
          className="inline-block px-6 py-3 rounded-xl font-bold text-sm"
          style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
        >
          Log In
        </Link>
      </div>
    )
  }

  if (access === 'enroll_required') {
    return (
      <div className="pt-40 pb-16 px-8 text-center max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-3">{lesson.title}</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Enroll in &quot;{course.title}&quot; to access this lesson.
        </p>
        <Link
          href={`/learn/${slug}`}
          className="inline-block px-6 py-3 rounded-xl font-bold text-sm"
          style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}
        >
          View Course
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 px-8 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
        <Link href="/learn" className="hover:underline">Learn</Link>
        <span className="mx-2">/</span>
        <Link href={`/learn/${slug}`} className="hover:underline">{course.title}</Link>
        <span className="mx-2">/</span>
        <span>{lesson.title}</span>
      </div>

      {/* Video */}
      {lesson.video_url && (
        <div className="mb-8 rounded-2xl overflow-hidden" style={{ background: '#000', aspectRatio: '16/9' }}>
          <iframe
            src={lesson.video_url}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Lesson title */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">{lesson.title}</h1>
      <div className="flex items-center gap-4 text-xs mb-8" style={{ color: 'var(--text-muted)' }}>
        <span>{lesson.duration_minutes} min</span>
        {lesson.is_free_preview && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
            Free Preview
          </span>
        )}
        {completed && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>
            Completed
          </span>
        )}
      </div>

      {/* Content */}
      {lesson.content_markdown ? (
        <div
          className="prose prose-invert max-w-none mb-12"
          style={{ fontSize: '0.9375rem', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(lesson.content_markdown) }}
        />
      ) : (
        <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
          <p className="text-sm">Content coming soon.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        {access === 'enrolled' && !completed && (
          <button
            onClick={markComplete}
            disabled={completing}
            className="px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{
              background: completing ? 'var(--bg-card)' : 'var(--accent)',
              color: completing ? 'var(--text-muted)' : 'var(--bg-primary)',
            }}
          >
            {completing ? 'Saving...' : 'Mark Complete'}
          </button>
        )}
        {completed && (
          <span className="text-sm font-bold" style={{ color: '#00ff88' }}>Lesson complete</span>
        )}
        <Link
          href={`/learn/${slug}`}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          Back to Course
        </Link>
      </div>
    </div>
  )
}

/**
 * Simple markdown → HTML (handles headers, code blocks, bold, links, lists)
 */
function markdownToHtml(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Tables (basic)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(Boolean).map(c => c.trim())
      if (cells.every(c => /^-+$/.test(c))) return ''
      return '<tr>' + cells.map(c => `<td style="padding:4px 12px;border:1px solid var(--border)">${c}</td>`).join('') + '</tr>'
    })
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')

  // Wrap loose <li> in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
  html = html.replace(/<\/ul>\s*<ul>/g, '')

  // Wrap <tr> in <table>
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table style="border-collapse:collapse;margin:1em 0">$1</table>')
  html = html.replace(/<\/table>\s*<table[^>]*>/g, '')

  return `<p>${html}</p>`
}
