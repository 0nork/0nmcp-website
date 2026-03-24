'use client'

import { useState, useCallback } from 'react'
import CourseIntakeWizard, { type CourseIntakeData } from './CourseIntakeWizard'
import CourseGenerating from './CourseGenerating'
import CourseReview from './CourseReview'
import CoursePublished from './CoursePublished'

/**
 * AI Course Generator — Root Orchestrator
 *
 * State machine: intake -> generating -> review -> publishing -> published
 */

export interface CourseStructure {
  title: string
  subtitle?: string
  description: string
  modules: CourseModule[]
}

export interface CourseModule {
  title: string
  description: string
  lessons: CourseLesson[]
}

export interface CourseLesson {
  title: string
  content: string
  duration_minutes: number
  quiz?: QuizQuestion[]
  assignment?: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

type Phase = 'intake' | 'generating' | 'review' | 'publishing' | 'published' | 'error'

interface PublishResult {
  productId: string
  chaptersCreated: number
  lessonsCreated: number
  totalModules: number
  totalLessons: number
  errors?: string[]
  courseUrl: string
}

export default function CourseGenerator({
  ssoToken,
  locationId: propLocationId,
}: {
  ssoToken?: string
  locationId?: string
}) {
  const [phase, setPhase] = useState<Phase>('intake')
  const [structure, setStructure] = useState<CourseStructure | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [source, setSource] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null)
  const [generationStep, setGenerationStep] = useState(0)
  const [locationId] = useState(propLocationId || '')

  // ── Generate ──
  const handleGenerate = useCallback(async (intake: CourseIntakeData) => {
    setPhase('generating')
    setError('')
    setGenerationStep(0)

    const steps = [
      () => setGenerationStep(1), // Analyzing topic
      () => setGenerationStep(2), // Building structure
      () => setGenerationStep(3), // Writing content
      () => setGenerationStep(4), // Adding quizzes
    ]

    // Simulate step progress
    const timers = steps.map((fn, i) => setTimeout(fn, (i + 1) * 1500))

    try {
      const res = await fetch('/api/marketplace/courses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: locationId || 'dashboard',
          ...intake,
        }),
      })

      timers.forEach(clearTimeout)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Generation failed (${res.status})`)
      }

      const data = await res.json()
      setStructure(data.structure)
      setDraftId(data.draftId)
      setSource(data.source)
      setGenerationStep(5)

      // Brief pause on completion step before showing review
      setTimeout(() => setPhase('review'), 600)
    } catch (err) {
      timers.forEach(clearTimeout)
      setError(err instanceof Error ? err.message : 'Failed to generate course')
      setPhase('error')
    }
  }, [locationId])

  // ── Publish ──
  const handlePublish = useCallback(async (accessToken?: string) => {
    if (!draftId) return
    setPhase('publishing')
    setError('')

    try {
      const res = await fetch('/api/marketplace/courses/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          locationId: locationId || 'dashboard',
          accessToken,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || `Publish failed (${res.status})`)
      }

      const result = await res.json()
      setPublishResult(result)
      setPhase('published')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish course')
      setPhase('error')
    }
  }, [draftId, locationId])

  // ── Save edits ──
  const handleSaveEdits = useCallback(async (updated: CourseStructure) => {
    setStructure(updated)
    if (!draftId) return

    await fetch('/api/marketplace/courses/drafts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: draftId, generated_structure: updated }),
    })
  }, [draftId])

  // ── Reset ──
  const handleReset = useCallback(() => {
    setPhase('intake')
    setStructure(null)
    setDraftId(null)
    setSource('')
    setError('')
    setPublishResult(null)
    setGenerationStep(0)
  }, [])

  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '32px 24px 96px',
      fontFamily: "'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: 'linear-gradient(135deg, #6EE05A, #4CAF50)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(110, 224, 90, 0.2)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#080B0F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#E8EAED', letterSpacing: '-0.03em', margin: 0 }}>
            AI Course Generator
          </h1>
          <p style={{ fontSize: 13, color: '#7A8290', margin: '2px 0 0' }}>
            Generate complete courses with AI. Deploy to your CRM in one click.
          </p>
        </div>
        <span style={{
          marginLeft: 'auto',
          padding: '5px 12px', borderRadius: 8,
          background: 'rgba(110, 224, 90, 0.1)',
          border: '1px solid rgba(110, 224, 90, 0.2)',
          color: '#6EE05A',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        }}>
          ADD-0N
        </span>
      </div>

      {/* Phase indicator */}
      {phase !== 'intake' && phase !== 'error' && (
        <PhaseIndicator current={phase} />
      )}

      {/* Content */}
      {phase === 'intake' && (
        <CourseIntakeWizard onGenerate={handleGenerate} />
      )}

      {phase === 'generating' && (
        <CourseGenerating step={generationStep} />
      )}

      {phase === 'review' && structure && (
        <CourseReview
          structure={structure}
          source={source}
          onSave={handleSaveEdits}
          onPublish={handlePublish}
          onRegenerate={handleReset}
        />
      )}

      {phase === 'publishing' && (
        <CourseGenerating step={-1} publishing />
      )}

      {phase === 'published' && publishResult && (
        <CoursePublished
          result={publishResult}
          courseTitle={structure?.title || 'Your Course'}
          onReset={handleReset}
        />
      )}

      {phase === 'error' && (
        <div style={{
          marginTop: 32, padding: 24, borderRadius: 14,
          background: 'rgba(248, 113, 113, 0.06)',
          border: '1px solid rgba(248, 113, 113, 0.2)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 14, color: '#f87171', opacity: 0.8, marginBottom: 20 }}>
            {error}
          </div>
          <button onClick={handleReset} style={resetBtnStyle}>
            Start Over
          </button>
        </div>
      )}
    </div>
  )
}

// ── Phase Indicator ──────────────────────────────────────────────────
function PhaseIndicator({ current }: { current: Phase }) {
  const phases = [
    { key: 'intake', label: 'Configure' },
    { key: 'generating', label: 'Generate' },
    { key: 'review', label: 'Review' },
    { key: 'publishing', label: 'Publish' },
    { key: 'published', label: 'Done' },
  ]

  const currentIdx = phases.findIndex(p => p.key === current)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '28px 0 32px' }}>
      {phases.map((p, i) => {
        const isActive = i === currentIdx
        const isComplete = i < currentIdx
        return (
          <div key={p.key} style={{ display: 'flex', alignItems: 'center', flex: i < phases.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: isActive ? '#6EE05A' : isComplete ? 'rgba(110, 224, 90, 0.15)' : '#0E1117',
                color: isActive ? '#080B0F' : isComplete ? '#6EE05A' : '#555',
                border: isActive ? 'none' : `1px solid ${isComplete ? 'rgba(110, 224, 90, 0.3)' : '#1a1f2e'}`,
                transition: 'all 0.3s',
              }}>
                {isComplete ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : i + 1}
              </div>
              <span style={{
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                color: isActive ? '#E8EAED' : isComplete ? '#6EE05A' : '#555',
              }}>
                {p.label}
              </span>
            </div>
            {i < phases.length - 1 && (
              <div style={{
                flex: 1, height: 1, marginLeft: 12, marginRight: 12,
                background: isComplete ? 'rgba(110, 224, 90, 0.3)' : '#1a1f2e',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const resetBtnStyle: React.CSSProperties = {
  padding: '10px 24px', borderRadius: 10,
  background: '#0E1117', border: '1px solid #1a1f2e',
  color: '#E8EAED', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}
