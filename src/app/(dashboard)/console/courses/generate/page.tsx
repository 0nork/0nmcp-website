'use client'

import { useState, useCallback } from 'react'

/* ─── Types ─── */
interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

interface Lesson {
  title: string
  content: string
  duration_minutes: number
  quiz?: QuizQuestion[]
}

interface Module {
  title: string
  description: string
  lessons: Lesson[]
}

interface Course {
  title: string
  description: string
  modules: Module[]
}

/* ─── Step indicator ─── */
function StepIndicator({ current }: { current: number }) {
  const steps = ['Configure', 'Preview', 'Deploy']
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32,
    }}>
      {steps.map((label, i) => {
        const isActive = i === current
        const isComplete = i < current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: isActive ? '#7ed957' : isComplete ? 'rgba(126,217,87,0.2)' : 'var(--jp-bg-card, #141418)',
                color: isActive ? '#0a0a0a' : isComplete ? '#7ed957' : 'var(--jp-text-muted, #666)',
                border: isActive ? 'none' : `1px solid ${isComplete ? 'rgba(126,217,87,0.3)' : 'var(--jp-border, #232328)'}`,
                transition: 'all 0.3s',
              }}>
                {isComplete ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : i + 1}
              </div>
              <span style={{
                fontSize: 13, fontWeight: isActive ? 700 : 500,
                color: isActive ? '#e8eaed' : isComplete ? '#7ed957' : 'var(--jp-text-muted, #666)',
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 1, marginLeft: 12, marginRight: 12,
                background: isComplete ? 'rgba(126,217,87,0.3)' : 'var(--jp-border, #232328)',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Main Page ─── */
export default function CourseGeneratorPage() {
  // Step 1 state
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
  const [lessonCount, setLessonCount] = useState(5)
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [style, setStyle] = useState<'practical' | 'theoretical' | 'workshop'>('practical')

  // Step 2 state
  const [course, setCourse] = useState<Course | null>(null)
  const [source, setSource] = useState<string>('')
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]))

  // Step 3 state
  const [locationId, setLocationId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')
  const [deployResult, setDeployResult] = useState<{ courseId?: string; lessonsCreated?: number; errors?: string[] } | null>(null)

  // Shared
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          audience: audience.trim() || 'general learners',
          lesson_count: lessonCount,
          difficulty,
          style,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }
      const data = await res.json()
      setCourse(data.course)
      setSource(data.source)
      setStep(1)
      setExpandedModules(new Set([0]))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate course')
    } finally {
      setLoading(false)
    }
  }, [topic, audience, lessonCount, difficulty, style])

  const handleDeploy = useCallback(async () => {
    if (!course || !locationId.trim() || !accessToken.trim()) return
    setDeployStatus('deploying')
    setDeployResult(null)
    try {
      const res = await fetch('/api/courses/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: locationId.trim(),
          course,
          access_token: accessToken.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deploy failed')
      setDeployResult(data)
      setDeployStatus('success')
    } catch (err) {
      setDeployStatus('error')
      setDeployResult({ errors: [err instanceof Error ? err.message : 'Deploy failed'] })
    }
  }, [course, locationId, accessToken])

  const toggleModule = (i: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const updateCourseField = (field: 'title' | 'description', value: string) => {
    if (!course) return
    setCourse({ ...course, [field]: value })
  }

  const totalLessons = course?.modules.reduce((sum, m) => sum + m.lessons.length, 0) ?? 0
  const totalDuration = course?.modules.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + l.duration_minutes, 0), 0) ?? 0

  return (
    <div style={{ padding: '24px 28px 96px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e8eaed', letterSpacing: '-0.02em', margin: 0 }}>
            AI Course Generator
          </h1>
        </div>
        <span style={{
          marginLeft: 'auto',
          padding: '4px 10px', borderRadius: 6,
          background: 'rgba(126,217,87,0.1)', color: '#7ed957',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
        }}>
          AI
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#7a8290', margin: '4px 0 28px 48px' }}>
        Generate complete courses with modules, lessons, and quizzes. Deploy straight to your CRM.
      </p>

      <StepIndicator current={step} />

      {/* ─── STEP 1: Configure ─── */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Topic */}
          <div>
            <label style={labelStyle}>What do you want to teach?</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Email Marketing for Small Businesses"
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          {/* Audience */}
          <div>
            <label style={labelStyle}>Who is this for?</label>
            <input
              type="text"
              value={audience}
              onChange={e => setAudience(e.target.value)}
              placeholder="e.g. Small business owners new to digital marketing"
              style={inputStyle}
            />
          </div>

          {/* Lesson Count */}
          <div>
            <label style={labelStyle}>Number of Lessons: <strong style={{ color: '#7ed957' }}>{lessonCount}</strong></label>
            <input
              type="range"
              min={3}
              max={10}
              value={lessonCount}
              onChange={e => setLessonCount(Number(e.target.value))}
              style={{
                width: '100%', accentColor: '#7ed957',
                height: 6, borderRadius: 3,
                background: 'var(--jp-bg-card, #141418)',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555', marginTop: 4 }}>
              <span>3</span><span>10</span>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label style={labelStyle}>Difficulty</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['beginner', 'intermediate', 'advanced'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  style={{
                    ...chipStyle,
                    background: difficulty === d ? 'rgba(126,217,87,0.15)' : 'var(--jp-bg-card, #141418)',
                    borderColor: difficulty === d ? 'rgba(126,217,87,0.4)' : 'var(--jp-border, #232328)',
                    color: difficulty === d ? '#7ed957' : '#999',
                  }}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label style={labelStyle}>Teaching Style</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['practical', 'theoretical', 'workshop'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  style={{
                    ...chipStyle,
                    background: style === s ? 'rgba(126,217,87,0.15)' : 'var(--jp-bg-card, #141418)',
                    borderColor: style === s ? 'rgba(126,217,87,0.4)' : 'var(--jp-border, #232328)',
                    color: style === s ? '#7ed957' : '#999',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            style={{
              width: '100%', padding: '14px 24px', borderRadius: 12,
              border: 'none', cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer',
              background: loading || !topic.trim()
                ? 'rgba(126,217,87,0.15)'
                : 'linear-gradient(135deg, #7ed957, #5cb83a)',
              color: loading || !topic.trim() ? '#5cb83a' : '#0a0a0a',
              fontSize: 15, fontWeight: 800,
              fontFamily: 'inherit', letterSpacing: '-0.01em',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <Spinner /> Generating Course...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate Course
              </>
            )}
          </button>
        </div>
      )}

      {/* ─── STEP 2: Preview ─── */}
      {step === 1 && course && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Source badge */}
          {source === 'template' && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
              fontSize: 12, color: '#fbbf24',
            }}>
              Generated from template. Add an ANTHROPIC_API_KEY for AI-written content.
            </div>
          )}

          {/* Course header card */}
          <div style={{
            padding: 20, borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(126,217,87,0.06), rgba(0,212,255,0.03))',
            border: '1px solid rgba(126,217,87,0.15)',
          }}>
            <input
              type="text"
              value={course.title}
              onChange={e => updateCourseField('title', e.target.value)}
              style={{
                ...inputStyle, fontSize: 18, fontWeight: 800, color: '#e8eaed',
                background: 'transparent', border: '1px solid transparent',
                padding: '4px 8px', marginBottom: 8,
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(126,217,87,0.3)' }}
              onBlur={e => { e.target.style.borderColor = 'transparent' }}
            />
            <textarea
              value={course.description}
              onChange={e => updateCourseField('description', e.target.value)}
              rows={2}
              style={{
                ...inputStyle, fontSize: 13, color: '#9aa0a8',
                background: 'transparent', border: '1px solid transparent',
                padding: '4px 8px', resize: 'vertical',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(126,217,87,0.3)' }}
              onBlur={e => { e.target.style.borderColor = 'transparent' }}
            />
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: '#7a8290' }}>
              <span>{course.modules.length} modules</span>
              <span>{totalLessons} lessons</span>
              <span>{totalDuration} min total</span>
            </div>
          </div>

          {/* Modules accordion */}
          {course.modules.map((mod, mi) => (
            <div key={mi} style={{
              borderRadius: 12, overflow: 'hidden',
              border: '1px solid var(--jp-border, #232328)',
              background: 'var(--jp-bg-card, #141418)',
            }}>
              <button
                onClick={() => toggleModule(mi)}
                style={{
                  width: '100%', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#7a8290" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{
                    transform: expandedModules.has(mi) ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s', flexShrink: 0,
                  }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e8eaed' }}>{mod.title}</div>
                  <div style={{ fontSize: 12, color: '#7a8290', marginTop: 2 }}>
                    {mod.lessons.length} lessons &middot; {mod.description}
                  </div>
                </div>
              </button>

              {expandedModules.has(mi) && (
                <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mod.lessons.map((lesson, li) => (
                    <div key={li} style={{
                      padding: '12px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--jp-border, #232328)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 6,
                          background: 'rgba(126,217,87,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#7ed957', flexShrink: 0,
                        }}>
                          {li + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e8eaed' }}>{lesson.title}</div>
                          <div style={{ fontSize: 12, color: '#7a8290', marginTop: 2 }}>
                            {lesson.content.slice(0, 200).replace(/[#*]/g, '')}...
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>
                          {lesson.duration_minutes} min
                        </span>
                      </div>
                      {lesson.quiz && lesson.quiz.length > 0 && (
                        <div style={{
                          marginTop: 8, padding: '6px 10px', borderRadius: 6,
                          background: 'rgba(167,139,250,0.06)',
                          border: '1px solid rgba(167,139,250,0.12)',
                          fontSize: 11, color: '#a78bfa',
                        }}>
                          {lesson.quiz.length} quiz question{lesson.quiz.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setStep(0); setCourse(null); setError('') }}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: 10,
                background: 'var(--jp-bg-card, #141418)',
                border: '1px solid var(--jp-border, #232328)',
                color: '#999', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Regenerate
            </button>
            <button
              onClick={() => setStep(2)}
              style={{
                flex: 2, padding: '12px 20px', borderRadius: 10,
                background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
                border: 'none',
                color: '#0a0a0a', fontSize: 14, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
              Deploy to CRM
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Deploy ─── */}
      {step === 2 && course && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Course summary */}
          <div style={{
            padding: 16, borderRadius: 12,
            background: 'var(--jp-bg-card, #141418)',
            border: '1px solid var(--jp-border, #232328)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e8eaed' }}>{course.title}</div>
            <div style={{ fontSize: 12, color: '#7a8290', marginTop: 4 }}>
              {course.modules.length} modules &middot; {totalLessons} lessons &middot; {totalDuration} min
            </div>
          </div>

          {deployStatus === 'idle' && (
            <>
              {/* Location ID */}
              <div>
                <label style={labelStyle}>CRM Location ID</label>
                <input
                  type="text"
                  value={locationId}
                  onChange={e => setLocationId(e.target.value)}
                  placeholder="e.g. abc123def456"
                  style={inputStyle}
                />
                <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
                  Found in your CRM Settings &rarr; Business Info &rarr; Location ID
                </div>
              </div>

              {/* Access Token */}
              <div>
                <label style={labelStyle}>CRM Access Token</label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  placeholder="Bearer token from OAuth or CRM settings"
                  style={inputStyle}
                />
                <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
                  OAuth token with courses scope. Never shared or stored.
                </div>
              </div>

              {/* Deploy button */}
              <button
                onClick={handleDeploy}
                disabled={!locationId.trim() || !accessToken.trim()}
                style={{
                  width: '100%', padding: '14px 24px', borderRadius: 12,
                  border: 'none',
                  cursor: !locationId.trim() || !accessToken.trim() ? 'not-allowed' : 'pointer',
                  background: !locationId.trim() || !accessToken.trim()
                    ? 'rgba(126,217,87,0.15)'
                    : 'linear-gradient(135deg, #7ed957, #5cb83a)',
                  color: !locationId.trim() || !accessToken.trim() ? '#5cb83a' : '#0a0a0a',
                  fontSize: 15, fontWeight: 800,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                Deploy Course to CRM
              </button>

              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: 'none', border: '1px solid var(--jp-border, #232328)',
                  color: '#999', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Back to Preview
              </button>
            </>
          )}

          {deployStatus === 'deploying' && (
            <div style={{
              padding: 32, borderRadius: 14, textAlign: 'center',
              background: 'var(--jp-bg-card, #141418)',
              border: '1px solid var(--jp-border, #232328)',
            }}>
              <Spinner size={32} />
              <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600, color: '#e8eaed' }}>
                Deploying course...
              </div>
              <div style={{ fontSize: 12, color: '#7a8290', marginTop: 4 }}>
                Creating course and adding {totalLessons} lessons to your CRM
              </div>
            </div>
          )}

          {deployStatus === 'success' && deployResult && (
            <div style={{
              padding: 28, borderRadius: 14, textAlign: 'center',
              background: 'rgba(126,217,87,0.06)',
              border: '1px solid rgba(126,217,87,0.2)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px',
                background: 'rgba(126,217,87,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#e8eaed', marginBottom: 4 }}>
                Course Deployed!
              </div>
              <div style={{ fontSize: 13, color: '#7a8290', marginBottom: 16 }}>
                {deployResult.lessonsCreated} of {totalLessons} lessons created successfully.
              </div>
              <div style={{
                padding: '8px 14px', borderRadius: 8,
                background: 'rgba(126,217,87,0.08)',
                fontSize: 12, color: '#7ed957', display: 'inline-block',
              }}>
                Course ID: {deployResult.courseId}
              </div>
              <div style={{ marginTop: 16, fontSize: 12, color: '#7a8290' }}>
                Go to your CRM &rarr; Memberships &rarr; Courses to see and publish it.
              </div>
              {deployResult.errors && deployResult.errors.length > 0 && (
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  textAlign: 'left',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 4 }}>
                    Some lessons had errors:
                  </div>
                  {deployResult.errors.map((e, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#f87171', marginTop: 2 }}>{e}</div>
                  ))}
                </div>
              )}
              <button
                onClick={() => {
                  setStep(0)
                  setCourse(null)
                  setTopic('')
                  setAudience('')
                  setLessonCount(5)
                  setDeployStatus('idle')
                  setDeployResult(null)
                  setLocationId('')
                  setAccessToken('')
                }}
                style={{
                  marginTop: 20, padding: '10px 24px', borderRadius: 10,
                  background: 'var(--jp-bg-card, #141418)',
                  border: '1px solid var(--jp-border, #232328)',
                  color: '#e8eaed', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Generate Another Course
              </button>
            </div>
          )}

          {deployStatus === 'error' && deployResult && (
            <div style={{
              padding: 24, borderRadius: 14,
              background: 'rgba(248,113,113,0.06)',
              border: '1px solid rgba(248,113,113,0.2)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>
                Deploy Failed
              </div>
              {deployResult.errors?.map((e, i) => (
                <div key={i} style={{ fontSize: 13, color: '#f87171', marginTop: 4 }}>{e}</div>
              ))}
              <button
                onClick={() => setDeployStatus('idle')}
                style={{
                  marginTop: 16, padding: '10px 20px', borderRadius: 10,
                  background: 'var(--jp-bg-card, #141418)',
                  border: '1px solid var(--jp-border, #232328)',
                  color: '#e8eaed', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Spinner ─── */
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid rgba(126,217,87,0.2)',
      borderTopColor: '#7ed957',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

/* ─── Shared styles ─── */
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#9aa0a8', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  borderRadius: 10, border: '1px solid var(--jp-border, #232328)',
  background: 'var(--jp-bg-card, #141418)',
  color: '#e8eaed', fontSize: 14,
  fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 0.2s',
}

const chipStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8,
  border: '1px solid', cursor: 'pointer',
  fontSize: 13, fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.2s',
}
