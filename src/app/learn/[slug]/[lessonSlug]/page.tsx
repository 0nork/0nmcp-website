'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function PublicLessonPage() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug: string }>()

  return (
    <div className="pt-40 pb-24 px-8 text-center max-w-md mx-auto">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth={2}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-3">Lesson Content Locked</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Sign in or create an account to access lesson content, track your progress, and complete courses.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href={`/login?redirect=/console/learn/${slug}/${lessonSlug}`}
          className="inline-block px-6 py-3 rounded-xl font-bold text-sm transition-all"
          style={{ background: 'var(--accent)', color: 'var(--bg-primary)', textDecoration: 'none' }}
        >
          Sign In
        </Link>
        <Link
          href={`/signup?redirect=/console/learn/${slug}/${lessonSlug}`}
          className="inline-block px-6 py-3 rounded-xl font-bold text-sm transition-all"
          style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', textDecoration: 'none' }}
        >
          Create Account
        </Link>
      </div>
      <div className="mt-8">
        <Link
          href={`/learn/${slug}`}
          className="text-xs font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          View course overview
        </Link>
      </div>
    </div>
  )
}
