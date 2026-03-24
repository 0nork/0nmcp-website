'use client'

import { useState } from 'react'

/**
 * CourseIntakeWizard — 5-step progressive disclosure form
 *
 * Steps: Basics -> Audience -> Structure -> Tone -> Review
 */

export interface CourseIntakeData {
  course_title: string
  course_subtitle: string
  target_audience: string
  skill_level: string
  course_goal: string
  course_category: string
  module_count: number
  lessons_per_module: number
  include_quizzes: boolean
  include_assignments: boolean
  tone: string
  keywords: string[]
  additional_instructions: string
}

interface Props {
  onGenerate: (data: CourseIntakeData) => void
}

const CATEGORIES = [
  'Business', 'Marketing', 'Technology', 'Design', 'Finance',
  'Health', 'Personal Development', 'Sales', 'Operations', 'Other',
]

const TONES = [
  { key: 'professional', label: 'Professional', desc: 'Clear, authoritative' },
  { key: 'conversational', label: 'Conversational', desc: 'Friendly, approachable' },
  { key: 'academic', label: 'Academic', desc: 'Formal, research-backed' },
  { key: 'motivational', label: 'Motivational', desc: 'Energetic, inspiring' },
]

export default function CourseIntakeWizard({ onGenerate }: Props) {
  const [wizardStep, setWizardStep] = useState(0)
  const [data, setData] = useState<CourseIntakeData>({
    course_title: '',
    course_subtitle: '',
    target_audience: '',
    skill_level: 'beginner',
    course_goal: '',
    course_category: '',
    module_count: 3,
    lessons_per_module: 3,
    include_quizzes: true,
    include_assignments: false,
    tone: 'professional',
    keywords: [],
    additional_instructions: '',
  })
  const [keywordInput, setKeywordInput] = useState('')

  const update = (field: keyof CourseIntakeData, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const addKeyword = () => {
    const kw = keywordInput.trim()
    if (kw && !data.keywords.includes(kw)) {
      update('keywords', [...data.keywords, kw])
      setKeywordInput('')
    }
  }

  const removeKeyword = (kw: string) => {
    update('keywords', data.keywords.filter(k => k !== kw))
  }

  const canProceed = () => {
    if (wizardStep === 0) return data.course_title.trim().length > 0
    return true
  }

  const stepLabels = ['Basics', 'Audience', 'Structure', 'Tone', 'Review']

  return (
    <div style={{ marginTop: 28 }}>
      {/* Step tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {stepLabels.map((label, i) => (
          <button
            key={label}
            onClick={() => i <= wizardStep && setWizardStep(i)}
            style={{
              flex: 1, padding: '10px 8px', borderRadius: 8,
              border: 'none', cursor: i <= wizardStep ? 'pointer' : 'default',
              background: i === wizardStep ? 'rgba(110, 224, 90, 0.12)' : i < wizardStep ? 'rgba(110, 224, 90, 0.04)' : '#0E1117',
              color: i === wizardStep ? '#6EE05A' : i < wizardStep ? '#6EE05A' : '#555',
              fontSize: 12, fontWeight: i === wizardStep ? 700 : 500,
              fontFamily: 'inherit',
              borderBottom: i === wizardStep ? '2px solid #6EE05A' : '2px solid transparent',
              transition: 'all 0.2s',
              opacity: i <= wizardStep ? 1 : 0.5,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Step 0: Basics ── */}
      {wizardStep === 0 && (
        <div style={stepContainer}>
          <h2 style={stepTitle}>What are you teaching?</h2>
          <p style={stepDesc}>Give your course a name and optional subtitle.</p>

          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>Course Title *</label>
            <input
              type="text"
              value={data.course_title}
              onChange={e => update('course_title', e.target.value)}
              placeholder="e.g. Email Marketing Mastery for Small Businesses"
              style={inputStyle}
              autoFocus
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Subtitle</label>
            <input
              type="text"
              value={data.course_subtitle}
              onChange={e => update('course_subtitle', e.target.value)}
              placeholder="e.g. From zero to revenue in 30 days"
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => update('course_category', cat)}
                  style={{
                    ...chipStyle,
                    background: data.course_category === cat ? 'rgba(110, 224, 90, 0.12)' : '#0E1117',
                    borderColor: data.course_category === cat ? 'rgba(110, 224, 90, 0.4)' : '#1a1f2e',
                    color: data.course_category === cat ? '#6EE05A' : '#888',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Audience ── */}
      {wizardStep === 1 && (
        <div style={stepContainer}>
          <h2 style={stepTitle}>Who is this for?</h2>
          <p style={stepDesc}>Define your target audience and their current skill level.</p>

          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>Target Audience</label>
            <input
              type="text"
              value={data.target_audience}
              onChange={e => update('target_audience', e.target.value)}
              placeholder="e.g. Small business owners new to digital marketing"
              style={inputStyle}
              autoFocus
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Skill Level</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => update('skill_level', level)}
                  style={{
                    ...chipStyle, flex: 1,
                    background: data.skill_level === level ? 'rgba(110, 224, 90, 0.12)' : '#0E1117',
                    borderColor: data.skill_level === level ? 'rgba(110, 224, 90, 0.4)' : '#1a1f2e',
                    color: data.skill_level === level ? '#6EE05A' : '#888',
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Course Goal</label>
            <textarea
              value={data.course_goal}
              onChange={e => update('course_goal', e.target.value)}
              placeholder="What should students be able to do after completing this course?"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>
      )}

      {/* ── Step 2: Structure ── */}
      {wizardStep === 2 && (
        <div style={stepContainer}>
          <h2 style={stepTitle}>Course Structure</h2>
          <p style={stepDesc}>Choose how many modules and lessons to generate.</p>

          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>
              Number of Modules: <strong style={{ color: '#6EE05A' }}>{data.module_count}</strong>
            </label>
            <input
              type="range" min={2} max={8}
              value={data.module_count}
              onChange={e => update('module_count', Number(e.target.value))}
              style={rangeStyle}
            />
            <div style={rangeLabels}><span>2</span><span>8</span></div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>
              Lessons per Module: <strong style={{ color: '#6EE05A' }}>{data.lessons_per_module}</strong>
            </label>
            <input
              type="range" min={1} max={6}
              value={data.lessons_per_module}
              onChange={e => update('lessons_per_module', Number(e.target.value))}
              style={rangeStyle}
            />
            <div style={rangeLabels}><span>1</span><span>6</span></div>
          </div>

          <div style={{
            marginTop: 20, padding: 16, borderRadius: 10,
            background: 'rgba(110, 224, 90, 0.04)',
            border: '1px solid rgba(110, 224, 90, 0.1)',
            fontSize: 13, color: '#7A8290',
          }}>
            Total: <strong style={{ color: '#E8EAED' }}>{data.module_count * data.lessons_per_module}</strong> lessons across{' '}
            <strong style={{ color: '#E8EAED' }}>{data.module_count}</strong> modules
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#9AA0A8' }}>
              <input
                type="checkbox"
                checked={data.include_quizzes}
                onChange={e => update('include_quizzes', e.target.checked)}
                style={{ accentColor: '#6EE05A' }}
              />
              Include Quizzes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#9AA0A8' }}>
              <input
                type="checkbox"
                checked={data.include_assignments}
                onChange={e => update('include_assignments', e.target.checked)}
                style={{ accentColor: '#6EE05A' }}
              />
              Include Assignments
            </label>
          </div>
        </div>
      )}

      {/* ── Step 3: Tone ── */}
      {wizardStep === 3 && (
        <div style={stepContainer}>
          <h2 style={stepTitle}>Tone & Keywords</h2>
          <p style={stepDesc}>Set the voice and focus areas for your content.</p>

          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>Writing Tone</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TONES.map(t => (
                <button
                  key={t.key}
                  onClick={() => update('tone', t.key)}
                  style={{
                    padding: '12px 16px', borderRadius: 10, textAlign: 'left',
                    border: `1px solid ${data.tone === t.key ? 'rgba(110, 224, 90, 0.4)' : '#1a1f2e'}`,
                    background: data.tone === t.key ? 'rgba(110, 224, 90, 0.08)' : '#0E1117',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: data.tone === t.key ? '#6EE05A' : '#E8EAED' }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: 12, color: '#7A8290', marginTop: 2 }}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>Keywords / Focus Topics</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={keywordInput}
                onChange={e => setKeywordInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                placeholder="Add a keyword and press Enter"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={addKeyword} style={{
                padding: '0 16px', borderRadius: 10,
                background: '#6EE05A', border: 'none',
                color: '#080B0F', fontWeight: 700, fontSize: 18,
                cursor: 'pointer',
              }}>+</button>
            </div>
            {data.keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {data.keywords.map(kw => (
                  <span key={kw} style={{
                    padding: '4px 10px', borderRadius: 6,
                    background: 'rgba(110, 224, 90, 0.1)',
                    border: '1px solid rgba(110, 224, 90, 0.2)',
                    color: '#6EE05A', fontSize: 12, fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {kw}
                    <button onClick={() => removeKeyword(kw)} style={{
                      background: 'none', border: 'none', color: '#6EE05A',
                      cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1, opacity: 0.6,
                    }}>x</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Additional Instructions</label>
            <textarea
              value={data.additional_instructions}
              onChange={e => update('additional_instructions', e.target.value)}
              placeholder="Any special requirements, examples to include, topics to avoid..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>
      )}

      {/* ── Step 4: Review & Generate ── */}
      {wizardStep === 4 && (
        <div style={stepContainer}>
          <h2 style={stepTitle}>Review & Generate</h2>
          <p style={stepDesc}>Confirm your settings before generating the course.</p>

          <div style={{
            marginTop: 20, padding: 20, borderRadius: 14,
            background: '#0E1117', border: '1px solid #1a1f2e',
          }}>
            <SummaryRow label="Title" value={data.course_title} />
            {data.course_subtitle && <SummaryRow label="Subtitle" value={data.course_subtitle} />}
            {data.course_category && <SummaryRow label="Category" value={data.course_category} />}
            <SummaryRow label="Audience" value={data.target_audience || 'General learners'} />
            <SummaryRow label="Skill Level" value={data.skill_level.charAt(0).toUpperCase() + data.skill_level.slice(1)} />
            {data.course_goal && <SummaryRow label="Goal" value={data.course_goal} />}
            <SummaryRow label="Structure" value={`${data.module_count} modules x ${data.lessons_per_module} lessons = ${data.module_count * data.lessons_per_module} total`} />
            <SummaryRow label="Quizzes" value={data.include_quizzes ? 'Yes' : 'No'} />
            <SummaryRow label="Assignments" value={data.include_assignments ? 'Yes' : 'No'} />
            <SummaryRow label="Tone" value={data.tone.charAt(0).toUpperCase() + data.tone.slice(1)} />
            {data.keywords.length > 0 && <SummaryRow label="Keywords" value={data.keywords.join(', ')} />}
          </div>

          <button
            onClick={() => onGenerate(data)}
            style={{
              width: '100%', marginTop: 24, padding: '16px 24px', borderRadius: 12,
              border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #6EE05A, #4CAF50)',
              color: '#080B0F', fontSize: 16, fontWeight: 800,
              fontFamily: 'inherit', letterSpacing: '-0.01em',
              boxShadow: '0 0 30px rgba(110, 224, 90, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generate Course with AI
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      {wizardStep < 4 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {wizardStep > 0 && (
            <button
              onClick={() => setWizardStep(s => s - 1)}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: 10,
                background: '#0E1117', border: '1px solid #1a1f2e',
                color: '#9AA0A8', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={() => canProceed() && setWizardStep(s => s + 1)}
            disabled={!canProceed()}
            style={{
              flex: 2, padding: '12px 20px', borderRadius: 10,
              border: 'none',
              background: canProceed() ? 'rgba(110, 224, 90, 0.15)' : 'rgba(110, 224, 90, 0.05)',
              color: canProceed() ? '#6EE05A' : '#555',
              fontSize: 14, fontWeight: 700,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

// ── Summary Row ──────────────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1f2e' }}>
      <span style={{ fontSize: 13, color: '#7A8290' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#E8EAED', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

// ── Shared Styles ────────────────────────────────────────────────────
const stepContainer: React.CSSProperties = {
  animation: 'fadeIn 0.3s ease-out',
}

const stepTitle: React.CSSProperties = {
  fontSize: 20, fontWeight: 800, color: '#E8EAED',
  letterSpacing: '-0.02em', margin: 0,
}

const stepDesc: React.CSSProperties = {
  fontSize: 13, color: '#7A8290', margin: '4px 0 0',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#9AA0A8', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  borderRadius: 10, border: '1px solid #1a1f2e',
  background: '#0E1117', color: '#E8EAED', fontSize: 14,
  fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
}

const chipStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8,
  border: '1px solid', cursor: 'pointer',
  fontSize: 13, fontWeight: 600,
  fontFamily: 'inherit', transition: 'all 0.2s',
}

const rangeStyle: React.CSSProperties = {
  width: '100%', accentColor: '#6EE05A',
  height: 6, borderRadius: 3,
  background: '#0E1117',
}

const rangeLabels: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  fontSize: 11, color: '#555', marginTop: 4,
}
