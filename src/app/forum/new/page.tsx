'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Group {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string
}

export default function NewThreadPage() {
  return (
    <Suspense fallback={<div className="pt-28 pb-24 px-4 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>}>
      <NewThreadForm />
    </Suspense>
  )
}

function NewThreadForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedGroup = searchParams.get('group') || ''

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [groupSlug, setGroupSlug] = useState(preselectedGroup)
  const [groups, setGroups] = useState<Group[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/community/groups')
      .then(r => r.json())
      .then(d => setGroups(d.groups || []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) { setError('Title and body are required'); return }
    if (!groupSlug) { setError('Please select a group'); return }

    setSubmitting(true)
    setError('')
    const res = await fetch('/api/community/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, group_slug: groupSlug }),
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
    <div className="pt-28 pb-24 px-4 md:px-8 max-w-2xl mx-auto">
      <div className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
        <Link href="/forum" className="hover:underline">Forum</Link>
        <span className="mx-2">/</span>
        <span>New Thread</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">Create a Post</h1>

      {error && (
        <div className="text-xs font-semibold mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,61,61,0.1)', color: '#ff3d3d' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Group selector */}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>Group</label>
          <div className="flex flex-wrap gap-2">
            {groups.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGroupSlug(g.slug)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: groupSlug === g.slug ? g.color + '20' : 'var(--bg-card)',
                  border: `1px solid ${groupSlug === g.slug ? g.color + '50' : 'var(--border)'}`,
                  color: groupSlug === g.slug ? g.color : 'var(--text-secondary)',
                }}
              >
                <span>{g.icon || '💬'}</span>
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="An interesting title"
            maxLength={200}
            className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>Body</label>
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
            {submitting ? 'Posting...' : 'Post'}
          </button>
          <Link
            href="/forum"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold no-underline"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
