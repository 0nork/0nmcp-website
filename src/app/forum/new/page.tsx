'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CATEGORIES = ['general', 'help', 'showcase', 'feature-request', 'bug-report', 'tutorial']

export default function NewThreadPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) { setError('Title and body are required'); return }

    setSubmitting(true)
    setError('')
    const res = await fetch('/api/community/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, category }),
    })

    if (res.ok) {
      const thread = await res.json()
      router.push(`/forum/${thread.slug}`)
    } else if (res.status === 401) {
      router.push('/login?redirect=/forum/new')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create thread')
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-32 pb-24 px-8 max-w-2xl mx-auto">
      <div className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
        <Link href="/forum" className="hover:underline">Forum</Link>
        <span className="mx-2">/</span>
        <span>New Thread</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">Start a Discussion</h1>

      {error && (
        <div className="text-xs font-semibold mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,61,61,0.1)', color: '#ff3d3d' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={200}
            className="w-full px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Body (Markdown supported)</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={12}
            placeholder="Share your thoughts, code, or questions..."
            className="w-full px-3 py-2 rounded-xl text-sm"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl font-bold text-sm"
            style={{
              background: submitting ? 'var(--bg-card)' : 'var(--accent)',
              color: submitting ? 'var(--text-muted)' : 'var(--bg-primary)',
              cursor: submitting ? 'wait' : 'pointer',
            }}
          >
            {submitting ? 'Posting...' : 'Post Thread'}
          </button>
          <Link
            href="/forum"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
