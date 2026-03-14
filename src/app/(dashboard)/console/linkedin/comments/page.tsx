'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

type Intent = 'challenge' | 'question' | 'praise' | 'spam' | 'neutral' | 'troll'
type Priority = 'high' | 'normal' | 'low' | 'skip'

interface QueueItem {
  draft_id: string
  draft_text: string
  draft_version: number
  confidence_score: number
  comment_text: string
  commenter_name: string
  commenter_headline: string | null
  intent: Intent
  priority: Priority
  comment_posted_at: string
}

const INTENT_COLOR: Record<Intent, string> = {
  challenge: '#ef4444', question: '#f59e0b', praise: '#22c55e',
  spam: '#6b7280', neutral: '#6b7280', troll: '#dc2626',
}
const INTENT_LABEL: Record<Intent, string> = {
  challenge: 'Challenge', question: 'Question', praise: 'Praise',
  spam: 'Spam', neutral: 'Neutral', troll: 'Troll',
}
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, normal: 1, low: 2, skip: 3 }

export default function CommentQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const supabase = createSupabaseBrowser()

  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data } = await supabase
      .from('comment_reply_drafts')
      .select('id,draft_text,draft_version,confidence_score,post_comments(id,comment_text,commenter_name,commenter_headline,intent,priority,comment_posted_at)')
      .eq('status', 'pending')
      .neq('draft_text', '[generating...]')
      .order('created_at', { ascending: false })
      .limit(50)

    const mapped: QueueItem[] = ((data || []) as Record<string, unknown>[]).map(d => {
      const c = d.post_comments as Record<string, unknown>
      return {
        draft_id: d.id as string,
        draft_text: d.draft_text as string,
        draft_version: d.draft_version as number,
        confidence_score: d.confidence_score as number,
        comment_text: c?.comment_text as string,
        commenter_name: c?.commenter_name as string,
        commenter_headline: c?.commenter_headline as string | null,
        intent: (c?.intent as Intent) || 'neutral',
        priority: (c?.priority as Priority) || 'normal',
        comment_posted_at: c?.comment_posted_at as string,
      }
    }).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

    setItems(mapped)
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function act(draftId: string, action: 'approve' | 'reject' | 'edit_and_post' | 'regenerate', editedText?: string) {
    setBusy(draftId)
    const res = await fetch('/api/linkedin/comments/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, draft_id: draftId, edited_text: editedText }),
    })
    if (res.ok) {
      if (action === 'regenerate') {
        setItems(prev => prev.map(i => i.draft_id === draftId ? { ...i, draft_text: 'Regenerating\u2026' } : i))
        setTimeout(load, 5000)
      } else {
        setItems(prev => prev.filter(i => i.draft_id !== draftId))
      }
      if (editingId === draftId) setEditingId(null)
    }
    setBusy(null)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>Comment Reply Queue</h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
          {loading ? 'Loading\u2026' : `${items.length} pending`}
        </p>
      </div>

      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>All caught up</div>
          <div style={{ fontWeight: 600 }}>No pending replies</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>New comments appear here automatically each hour.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map(it => (
          <div key={it.draft_id} style={{
            background: 'var(--bg-card)', borderRadius: '0.875rem', padding: '1.25rem',
            border: `1px solid ${it.priority === 'high' ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
            borderLeft: `3px solid ${INTENT_COLOR[it.intent]}`,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{it.commenter_name}</span>
                {it.commenter_headline && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{it.commenter_headline}</span>}
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '999px', fontFamily: 'var(--font-mono)', color: INTENT_COLOR[it.intent], background: `${INTENT_COLOR[it.intent]}18` }}>
                {INTENT_LABEL[it.intent]}
              </span>
            </div>

            {/* Comment */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.875rem', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
              &ldquo;{it.comment_text}&rdquo;
            </div>

            {/* Draft */}
            <div style={{ marginBottom: '0.875rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                Draft &middot; {Math.round(it.confidence_score * 100)}% confidence
              </div>
              {editingId === it.draft_id ? (
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  style={{ width: '100%', minHeight: 90, padding: '0.75rem', background: '#080810', border: '1px solid #6EE05A', borderRadius: '0.5rem', color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical' as const, fontFamily: 'inherit', boxSizing: 'border-box' as const }}
                />
              ) : (
                <div
                  onClick={() => { setEditingId(it.draft_id); setEditText(it.draft_text) }}
                  style={{ padding: '0.75rem', background: 'rgba(110,224,90,0.05)', border: '1px solid rgba(110,224,90,0.15)', borderRadius: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6, cursor: 'text' }}
                >
                  {it.draft_text}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const }}>
              {editingId === it.draft_id ? (
                <>
                  <Btn onClick={() => act(it.draft_id, 'edit_and_post', editText)} loading={busy === it.draft_id} primary>Post Edited</Btn>
                  <Btn onClick={() => setEditingId(null)}>Cancel</Btn>
                </>
              ) : (
                <>
                  <Btn onClick={() => act(it.draft_id, 'approve')} loading={busy === it.draft_id} primary>Post Reply</Btn>
                  <Btn onClick={() => { setEditingId(it.draft_id); setEditText(it.draft_text) }}>Edit</Btn>
                  <Btn onClick={() => act(it.draft_id, 'regenerate')} loading={busy === it.draft_id}>Redo</Btn>
                  <Btn onClick={() => act(it.draft_id, 'reject')} danger>Skip</Btn>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Btn({ children, onClick, loading, primary, danger }: {
  children: React.ReactNode
  onClick: () => void
  loading?: boolean
  primary?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={!!loading}
      style={{
        padding: '0.45rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700,
        fontFamily: 'var(--font-display)', cursor: loading ? 'wait' : 'pointer',
        border: primary ? 'none' : danger ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border)',
        background: primary ? '#6EE05A' : 'transparent',
        color: primary ? '#000' : danger ? '#ef4444' : 'var(--text-secondary)',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? '\u2026' : children}
    </button>
  )
}
