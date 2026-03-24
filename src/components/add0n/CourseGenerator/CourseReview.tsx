'use client'

import { useState, useCallback } from 'react'
import type { CourseStructure, CourseModule, CourseLesson } from './index'

/**
 * CourseReview — Expandable module/lesson tree with inline editing
 */

interface Props {
  structure: CourseStructure
  source: string
  onSave: (updated: CourseStructure) => void
  onPublish: (accessToken?: string) => void
  onRegenerate: () => void
}

export default function CourseReview({ structure, source, onSave, onPublish, onRegenerate }: Props) {
  const [data, setData] = useState<CourseStructure>(structure)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]))
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [editingField, setEditingField] = useState<string | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [accessToken, setAccessToken] = useState('')
  const [coursePrice, setCoursePrice] = useState('0')
  const [pricingType, setPricingType] = useState<'free' | 'one_time' | 'recurring'>('free')

  const totalLessons = data.modules.reduce((s, m) => s + m.lessons.length, 0)
  const totalDuration = data.modules.reduce((s, m) => s + m.lessons.reduce((ls, l) => ls + l.duration_minutes, 0), 0)
  const totalQuizzes = data.modules.reduce((s, m) => s + m.lessons.reduce((ls, l) => ls + (l.quiz?.length || 0), 0), 0)

  const toggleModule = (i: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const toggleLesson = (key: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const updateField = useCallback((path: string, value: string) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as CourseStructure

      if (path === 'title') next.title = value
      else if (path === 'description') next.description = value
      else {
        // path format: "modules.0.title" or "modules.0.lessons.1.title" etc.
        const parts = path.split('.')
        if (parts[0] === 'modules' && parts.length >= 3) {
          const mi = parseInt(parts[1])
          if (parts[2] === 'title') next.modules[mi].title = value
          else if (parts[2] === 'description') next.modules[mi].description = value
          else if (parts[2] === 'lessons' && parts.length >= 5) {
            const li = parseInt(parts[3])
            if (parts[4] === 'title') next.modules[mi].lessons[li].title = value
            else if (parts[4] === 'content') next.modules[mi].lessons[li].content = value
          }
        }
      }

      return next
    })
    setEditingField(null)
  }, [])

  const handleSaveAndPublish = () => {
    onSave(data)
    setShowPublishModal(true)
  }

  const confirmPublish = () => {
    setShowPublishModal(false)
    onPublish(accessToken || undefined)
  }

  return (
    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Source badge */}
      {(source === 'template' || source === 'template-fallback') && (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(251, 191, 36, 0.06)',
          border: '1px solid rgba(251, 191, 36, 0.15)',
          fontSize: 12, color: '#fbbf24',
        }}>
          Generated from template. Add an ANTHROPIC_API_KEY for AI-written content.
        </div>
      )}

      {/* Course header */}
      <div style={{
        padding: 24, borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(110, 224, 90, 0.04), rgba(0, 212, 255, 0.02))',
        border: '1px solid rgba(110, 224, 90, 0.12)',
      }}>
        <EditableText
          value={data.title}
          path="title"
          editing={editingField}
          onStartEdit={setEditingField}
          onSave={updateField}
          style={{ fontSize: 20, fontWeight: 800, color: '#E8EAED', letterSpacing: '-0.02em' }}
        />
        <EditableText
          value={data.description}
          path="description"
          editing={editingField}
          onStartEdit={setEditingField}
          onSave={updateField}
          multiline
          style={{ fontSize: 13, color: '#9AA0A8', marginTop: 8 }}
        />

        <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 12, color: '#7A8290' }}>
          <Stat label="Modules" value={data.modules.length} />
          <Stat label="Lessons" value={totalLessons} />
          <Stat label="Duration" value={`${totalDuration} min`} />
          {totalQuizzes > 0 && <Stat label="Quiz Qs" value={totalQuizzes} />}
        </div>
      </div>

      {/* Module tree */}
      {data.modules.map((mod, mi) => (
        <ModuleCard
          key={mi}
          module={mod}
          index={mi}
          expanded={expandedModules.has(mi)}
          expandedLessons={expandedLessons}
          editingField={editingField}
          onToggle={() => toggleModule(mi)}
          onToggleLesson={toggleLesson}
          onStartEdit={setEditingField}
          onSave={updateField}
        />
      ))}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={onRegenerate} style={secondaryBtnStyle}>
          Regenerate
        </button>
        <button onClick={() => onSave(data)} style={{ ...secondaryBtnStyle, color: '#6EE05A', borderColor: 'rgba(110, 224, 90, 0.3)' }}>
          Save Draft
        </button>
        <button onClick={handleSaveAndPublish} style={primaryBtnStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
          Deploy to CRM
        </button>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{
            width: 480, padding: 28, borderRadius: 16,
            background: '#0E1117', border: '1px solid #1a1f2e',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#E8EAED', margin: '0 0 4px' }}>
              Deploy to CRM
            </h3>
            <p style={{ fontSize: 13, color: '#7A8290', margin: '0 0 20px' }}>
              Provide your CRM access token to deploy this course. If your location is connected via OAuth, leave this blank.
            </p>

            {/* Pricing */}
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9AA0A8', marginBottom: 6 }}>
              Course Pricing
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['free', 'one_time', 'recurring'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setPricingType(t); if (t === 'free') setCoursePrice('0') }}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    background: pricingType === t ? 'rgba(110,224,90,0.12)' : '#080B0F',
                    border: `1px solid ${pricingType === t ? 'rgba(110,224,90,0.4)' : '#1a1f2e'}`,
                    color: pricingType === t ? '#6EE05A' : '#7A8290',
                  }}
                >
                  {t === 'free' ? 'Free' : t === 'one_time' ? 'One-Time' : 'Monthly'}
                </button>
              ))}
            </div>

            {pricingType !== 'free' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9AA0A8', marginBottom: 6 }}>
                  Price (USD)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6EE05A', fontSize: 16, fontWeight: 700 }}>$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={coursePrice}
                    onChange={e => setCoursePrice(e.target.value)}
                    placeholder="29"
                    style={{
                      width: '100%', padding: '12px 14px 12px 30px', borderRadius: 10,
                      border: '1px solid #1a1f2e', background: '#080B0F',
                      color: '#E8EAED', fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <p style={{ fontSize: 11, color: '#555', margin: '6px 0 0' }}>
                  {pricingType === 'recurring' ? 'Charged monthly to enrolled students' : 'One-time payment for lifetime access'}
                </p>
              </div>
            )}

            <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(110,224,90,0.05)', border: '1px solid rgba(110,224,90,0.1)', marginBottom: 16, fontSize: 13, color: '#9AA0A8' }}>
              <strong style={{ color: '#6EE05A' }}>
                {pricingType === 'free' ? 'Free Course' : pricingType === 'one_time' ? `$${coursePrice || '0'} one-time` : `$${coursePrice || '0'}/month`}
              </strong>
              {' '}— {totalLessons} lessons across {data.modules.length} modules
            </div>

            {/* Access Token */}
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#9AA0A8', marginBottom: 6 }}>
              Access Token (optional)
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              placeholder="Bearer token — leave blank to use stored OAuth"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid #1a1f2e', background: '#080B0F',
                color: '#E8EAED', fontSize: 14, fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: 11, color: '#555', margin: '6px 0 0' }}>
              Leave blank to use stored OAuth. Or paste a CRM access token.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowPublishModal(false)} style={secondaryBtnStyle}>
                Cancel
              </button>
              <button onClick={confirmPublish} style={primaryBtnStyle}>
                Deploy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Module Card ──────────────────────────────────────────────────────
function ModuleCard({
  module: mod,
  index: mi,
  expanded,
  expandedLessons,
  editingField,
  onToggle,
  onToggleLesson,
  onStartEdit,
  onSave,
}: {
  module: CourseModule
  index: number
  expanded: boolean
  expandedLessons: Set<string>
  editingField: string | null
  onToggle: () => void
  onToggleLesson: (key: string) => void
  onStartEdit: (field: string) => void
  onSave: (path: string, value: string) => void
}) {
  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid #1a1f2e',
      background: '#0E1117',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', textAlign: 'left',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'rgba(110, 224, 90, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#6EE05A', flexShrink: 0,
        }}>
          {mi + 1}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#E8EAED' }}>{mod.title}</div>
          <div style={{ fontSize: 12, color: '#7A8290', marginTop: 2 }}>
            {mod.lessons.length} lessons &middot; {mod.lessons.reduce((s, l) => s + l.duration_minutes, 0)} min
          </div>
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="#7A8290" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            transform: expanded ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s', flexShrink: 0,
          }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Module description editable */}
          <div style={{ padding: '4px 8px' }}>
            <EditableText
              value={mod.description}
              path={`modules.${mi}.description`}
              editing={editingField}
              onStartEdit={onStartEdit}
              onSave={onSave}
              style={{ fontSize: 12, color: '#7A8290', fontStyle: 'italic' }}
            />
          </div>

          {mod.lessons.map((lesson, li) => {
            const lessonKey = `${mi}-${li}`
            const lessonExpanded = expandedLessons.has(lessonKey)

            return (
              <div key={li} style={{
                borderRadius: 8,
                border: '1px solid #1a1f2e',
                background: 'rgba(255, 255, 255, 0.01)',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => onToggleLesson(lessonKey)}
                  style={{
                    width: '100%', padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: 'rgba(110, 224, 90, 0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#6EE05A', flexShrink: 0,
                  }}>
                    {li + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E8EAED' }}>{lesson.title}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>
                    {lesson.duration_minutes} min
                  </span>
                  {lesson.quiz && lesson.quiz.length > 0 && (
                    <span style={{
                      padding: '2px 6px', borderRadius: 4,
                      background: 'rgba(167, 139, 250, 0.08)',
                      fontSize: 10, color: '#a78bfa', whiteSpace: 'nowrap',
                    }}>
                      {lesson.quiz.length} Q
                    </span>
                  )}
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{
                      transform: lessonExpanded ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.2s', flexShrink: 0,
                    }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                {lessonExpanded && (
                  <div style={{ padding: '0 14px 14px' }}>
                    <EditableText
                      value={lesson.title}
                      path={`modules.${mi}.lessons.${li}.title`}
                      editing={editingField}
                      onStartEdit={onStartEdit}
                      onSave={onSave}
                      style={{ fontSize: 14, fontWeight: 600, color: '#E8EAED', marginBottom: 8 }}
                    />
                    <EditableText
                      value={lesson.content}
                      path={`modules.${mi}.lessons.${li}.content`}
                      editing={editingField}
                      onStartEdit={onStartEdit}
                      onSave={onSave}
                      multiline
                      style={{
                        fontSize: 12, color: '#9AA0A8', lineHeight: 1.6,
                        whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto',
                      }}
                    />

                    {lesson.quiz && lesson.quiz.length > 0 && (
                      <div style={{
                        marginTop: 12, padding: '10px 12px', borderRadius: 8,
                        background: 'rgba(167, 139, 250, 0.04)',
                        border: '1px solid rgba(167, 139, 250, 0.1)',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>
                          QUIZ ({lesson.quiz.length} questions)
                        </div>
                        {lesson.quiz.map((q, qi) => (
                          <div key={qi} style={{ marginBottom: qi < lesson.quiz!.length - 1 ? 8 : 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#E8EAED', marginBottom: 4 }}>
                              {qi + 1}. {q.question}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {q.options.map((opt, oi) => (
                                <span key={oi} style={{
                                  padding: '2px 8px', borderRadius: 4, fontSize: 11,
                                  background: oi === q.correct ? 'rgba(110, 224, 90, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                  color: oi === q.correct ? '#6EE05A' : '#7A8290',
                                  border: `1px solid ${oi === q.correct ? 'rgba(110, 224, 90, 0.2)' : '#1a1f2e'}`,
                                }}>
                                  {String.fromCharCode(65 + oi)}. {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {lesson.assignment && (
                      <div style={{
                        marginTop: 8, padding: '10px 12px', borderRadius: 8,
                        background: 'rgba(0, 212, 255, 0.04)',
                        border: '1px solid rgba(0, 212, 255, 0.1)',
                        fontSize: 12, color: '#00d4ff',
                      }}>
                        <strong>Assignment:</strong> {lesson.assignment}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Editable Text ────────────────────────────────────────────────────
function EditableText({
  value,
  path,
  editing,
  onStartEdit,
  onSave,
  multiline = false,
  style: customStyle = {},
}: {
  value: string
  path: string
  editing: string | null
  onStartEdit: (field: string) => void
  onSave: (path: string, value: string) => void
  multiline?: boolean
  style?: React.CSSProperties
}) {
  const isEditing = editing === path
  const [localValue, setLocalValue] = useState(value)

  if (isEditing) {
    const inputStyle: React.CSSProperties = {
      width: '100%', padding: '8px 10px', borderRadius: 8,
      border: '1px solid rgba(110, 224, 90, 0.3)',
      background: '#080B0F', color: '#E8EAED',
      fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
      outline: 'none', boxSizing: 'border-box' as const,
    }

    if (multiline) {
      return (
        <div>
          <textarea
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
            rows={8}
            style={{ ...inputStyle, resize: 'vertical' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button
              onClick={() => onSave(path, localValue)}
              style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#6EE05A', color: '#080B0F', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Save
            </button>
            <button
              onClick={() => { setLocalValue(value); onStartEdit('') }}
              style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #1a1f2e', background: 'none', color: '#7A8290', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )
    }

    return (
      <input
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={() => onSave(path, localValue)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSave(path, localValue)
          if (e.key === 'Escape') { setLocalValue(value); onStartEdit('') }
        }}
        style={inputStyle}
        autoFocus
      />
    )
  }

  return (
    <div
      onClick={() => { setLocalValue(value); onStartEdit(path) }}
      style={{
        ...customStyle,
        cursor: 'pointer',
        borderRadius: 4,
        padding: '2px 4px',
        margin: '-2px -4px',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(110, 224, 90, 0.04)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      title="Click to edit"
    >
      {multiline ? value.slice(0, 500) + (value.length > 500 ? '...' : '') : value}
    </div>
  )
}

// ── Stat Badge ───────────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontWeight: 700, color: '#E8EAED' }}>{value}</span>
      <span>{label}</span>
    </div>
  )
}

// ── Button Styles ────────────────────────────────────────────────────
const secondaryBtnStyle: React.CSSProperties = {
  flex: 1, padding: '12px 20px', borderRadius: 10,
  background: '#0E1117', border: '1px solid #1a1f2e',
  color: '#9AA0A8', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}

const primaryBtnStyle: React.CSSProperties = {
  flex: 2, padding: '12px 20px', borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(135deg, #6EE05A, #4CAF50)',
  color: '#080B0F', fontSize: 14, fontWeight: 800,
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  boxShadow: '0 0 20px rgba(110, 224, 90, 0.1)',
  transition: 'all 0.2s',
}
