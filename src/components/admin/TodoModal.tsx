'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface Todo {
  id: string
  title: string
  urgency: number
  due_date: string | null
  file_name: string | null
  completed: boolean
  crm_task_id: string | null
  created_at: string
}

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  read: boolean
  created_at: string
}

const C = {
  bg: '#0d0d14',
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  accent: '#6EE05A',
  orange: '#ff6b35',
  red: '#ef4444',
  cyan: '#00d4ff',
  text: '#e8eaed',
  textSec: '#7A8290',
  textMuted: '#5f6672',
}

function urgencyColor(v: number): string {
  if (v < 0.33) return C.cyan
  if (v < 0.66) return '#fbbf24'
  return C.red
}

function urgencyLabel(v: number): string {
  if (v < 0.2) return 'Cool'
  if (v < 0.4) return 'Low'
  if (v < 0.6) return 'Medium'
  if (v < 0.8) return 'Warm'
  return 'HOT'
}

export default function TodoModal({ onClose }: { onClose: () => void }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [title, setTitle] = useState('')
  const [urgency, setUrgency] = useState(0.3)
  const [dragFile, setDragFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState<'today' | 'tomorrow' | 'pick' | null>(null)
  const [customDate, setCustomDate] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/admin/todos')
      .then(r => r.json())
      .then(d => {
        setTodos(d.todos || [])
        setNotifications(d.notifications || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Urgency slider
  const handleSliderMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setUrgency(pct)
    setShowDatePicker(pct >= 0.5 ? 'today' : null)
  }, [])

  const [isSliding, setIsSliding] = useState(false)

  const getDueDate = (): string | null => {
    if (showDatePicker === 'today') {
      const d = new Date(); d.setHours(23, 59, 59, 0)
      return d.toISOString()
    }
    if (showDatePicker === 'tomorrow') {
      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(23, 59, 59, 0)
      return d.toISOString()
    }
    if (showDatePicker === 'pick' && customDate) {
      return new Date(customDate + 'T23:59:59').toISOString()
    }
    return null
  }

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          urgency,
          dueDate: getDueDate(),
          fileName: dragFile?.name || null,
        }),
      })
      const data = await res.json()
      if (data.todo) {
        setTodos(prev => [data.todo, ...prev])
        setTitle('')
        setUrgency(0.3)
        setDragFile(null)
        setShowDatePicker(null)
        setCustomDate('')
      }
    } catch {}
    setSubmitting(false)
  }

  const toggleComplete = async (todo: Todo) => {
    const res = await fetch('/api/admin/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: todo.id, completed: !todo.completed }),
    })
    const data = await res.json()
    if (data.todo) {
      setTodos(prev => prev.map(t => t.id === todo.id ? data.todo : t))
    }
  }

  const deleteTodo = async (id: string) => {
    await fetch(`/api/admin/todos?id=${id}`, { method: 'DELETE' })
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  const markAllRead = async () => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readAll: true }),
    })
    setNotifications([])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setDragFile(file)
  }

  const activeTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 520, maxHeight: '85vh', borderRadius: 16,
        background: C.bg, border: `1px solid ${C.border}`,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: C.text }}>To-Do List</h2>
            <span style={{ fontSize: 11, color: C.textMuted }}>{activeTodos.length} active &middot; {completedTodos.length} done</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {notifications.length > 0 && (
              <button onClick={markAllRead} style={{
                padding: '4px 10px', borderRadius: 6, border: `1px solid rgba(255,107,53,0.3)`,
                background: 'rgba(255,107,53,0.1)', color: C.orange, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {notifications.length} alert{notifications.length > 1 ? 's' : ''} — clear
              </button>
            )}
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`,
              background: 'transparent', color: C.textMuted, cursor: 'pointer',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>×</button>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div style={{ padding: '0.5rem 1.5rem', background: 'rgba(255,107,53,0.05)' }}>
            {notifications.slice(0, 3).map(n => (
              <div key={n.id} style={{ fontSize: 11, color: C.orange, padding: '4px 0', display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange, flexShrink: 0 }} />
                {n.title}
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${C.border}` }}>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? C.accent : C.border}`,
              borderRadius: 10, padding: dragFile ? '0.5rem 0.75rem' : '0.75rem',
              textAlign: 'center', cursor: 'pointer', marginBottom: '0.75rem',
              background: dragging ? 'rgba(126,217,87,0.05)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <input ref={fileRef} type="file" style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) setDragFile(e.target.files[0]) }} />
            {dragFile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ color: C.accent }}>📎</span>
                <span style={{ color: C.text, flex: 1, textAlign: 'left' }}>{dragFile.name}</span>
                <button onClick={e => { e.stopPropagation(); setDragFile(null) }} style={{
                  background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 14,
                }}>×</button>
              </div>
            ) : (
              <span style={{ fontSize: 11, color: C.textMuted }}>Drop a file here or click to attach</span>
            )}
          </div>

          {/* Text input */}
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && title.trim()) handleSubmit() }}
            placeholder="What needs to get done?"
            style={{
              width: '100%', padding: '0.6rem 0.75rem', borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.card, color: C.text,
              fontSize: 13, fontFamily: 'inherit', outline: 'none',
              marginBottom: '0.75rem',
            }}
          />

          {/* Urgency Slider */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Urgency</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: urgencyColor(urgency) }}>{urgencyLabel(urgency)}</span>
            </div>
            <div
              ref={sliderRef}
              onMouseDown={() => setIsSliding(true)}
              onMouseMove={e => { if (isSliding) handleSliderMove(e) }}
              onMouseUp={() => setIsSliding(false)}
              onMouseLeave={() => setIsSliding(false)}
              onClick={handleSliderMove}
              style={{
                height: 8, borderRadius: 4, cursor: 'pointer',
                background: `linear-gradient(to right, ${C.cyan}, #fbbf24 50%, ${C.red})`,
                position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute', top: -4, left: `${urgency * 100}%`, transform: 'translateX(-50%)',
                width: 16, height: 16, borderRadius: '50%',
                background: urgencyColor(urgency),
                border: '2px solid #fff', boxShadow: `0 0 8px ${urgencyColor(urgency)}60`,
                transition: isSliding ? 'none' : 'left 0.1s',
              }} />
            </div>
          </div>

          {/* Date buttons — appear when urgency >= 50% */}
          {urgency >= 0.5 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: '0.5rem' }}>
              {(['today', 'tomorrow', 'pick'] as const).map(opt => (
                <button key={opt} onClick={() => setShowDatePicker(opt)} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  border: `1px solid ${showDatePicker === opt ? urgencyColor(urgency) : C.border}`,
                  background: showDatePicker === opt ? `${urgencyColor(urgency)}15` : 'transparent',
                  color: showDatePicker === opt ? urgencyColor(urgency) : C.textSec,
                  cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
                }}>
                  {opt === 'pick' ? 'Select Date' : opt}
                </button>
              ))}
              {showDatePicker === 'pick' && (
                <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
                  style={{
                    padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border}`,
                    background: C.card, color: C.text, fontSize: 11, fontFamily: 'inherit',
                    outline: 'none',
                  }} />
              )}
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting || !title.trim()} style={{
            width: '100%', padding: '0.6rem', borderRadius: 8, border: 'none',
            background: title.trim() ? `linear-gradient(135deg, ${C.accent}, #4CAF3D)` : C.card,
            color: title.trim() ? '#000' : C.textMuted,
            fontSize: 13, fontWeight: 700, cursor: title.trim() ? 'pointer' : 'default',
            fontFamily: 'inherit',
          }}>
            {submitting ? 'Adding...' : 'Add to List'}
          </button>
        </div>

        {/* Todo List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: C.textMuted, fontSize: 12, padding: '2rem' }}>Loading...</div>
          ) : activeTodos.length === 0 && completedTodos.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.textMuted, fontSize: 12, padding: '2rem' }}>No tasks yet. Add one above.</div>
          ) : (
            <>
              {activeTodos.map(todo => (
                <div key={todo.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0', borderBottom: `1px solid ${C.border}`,
                }}>
                  <button onClick={() => toggleComplete(todo)} style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${urgencyColor(todo.urgency)}`,
                    background: 'transparent', cursor: 'pointer',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{todo.title}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, display: 'flex', gap: 8 }}>
                      <span style={{ color: urgencyColor(todo.urgency) }}>{urgencyLabel(todo.urgency)}</span>
                      {todo.due_date && <span>Due {new Date(todo.due_date).toLocaleDateString()}</span>}
                      {todo.file_name && <span>📎 {todo.file_name}</span>}
                      {todo.crm_task_id && <span style={{ color: C.accent }}>CRM synced</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteTodo(todo.id)} style={{
                    background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 14,
                    padding: '2px 6px',
                  }}>×</button>
                </div>
              ))}
              {completedTodos.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Completed ({completedTodos.length})
                  </span>
                  {completedTodos.slice(0, 5).map(todo => (
                    <div key={todo.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.375rem 0', opacity: 0.5,
                    }}>
                      <button onClick={() => toggleComplete(todo)} style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        border: `2px solid ${C.accent}`, background: `${C.accent}30`, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: C.accent,
                      }}>✓</button>
                      <span style={{ fontSize: 12, color: C.textMuted, textDecoration: 'line-through' }}>{todo.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
