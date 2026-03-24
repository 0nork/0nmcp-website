'use client'

/**
 * CourseGenerating — Loading animation with step progress
 *
 * Shows animated progress through generation steps:
 * 1. Analyzing topic
 * 2. Building module structure
 * 3. Writing lesson content
 * 4. Adding quizzes & assignments
 * 5. Finalizing course
 *
 * Also handles "publishing" state with different steps.
 */

const GENERATION_STEPS = [
  { label: 'Analyzing topic & audience', icon: 'search' },
  { label: 'Building module structure', icon: 'grid' },
  { label: 'Writing lesson content', icon: 'edit' },
  { label: 'Adding quizzes & assessments', icon: 'check' },
  { label: 'Finalizing course', icon: 'done' },
]

const PUBLISH_STEPS = [
  { label: 'Creating CRM product', icon: 'upload' },
  { label: 'Building chapters', icon: 'grid' },
  { label: 'Deploying lessons', icon: 'edit' },
  { label: 'Verifying deployment', icon: 'done' },
]

export default function CourseGenerating({
  step,
  publishing = false,
}: {
  step: number
  publishing?: boolean
}) {
  const steps = publishing ? PUBLISH_STEPS : GENERATION_STEPS
  const title = publishing ? 'Publishing to CRM...' : 'Generating Your Course...'
  const subtitle = publishing
    ? 'Deploying modules and lessons to your CRM dashboard'
    : 'AI is crafting your complete course structure'

  return (
    <div style={{
      marginTop: 32, padding: '48px 32px', borderRadius: 16,
      background: 'linear-gradient(135deg, rgba(110, 224, 90, 0.03), rgba(0, 212, 255, 0.02))',
      border: '1px solid rgba(110, 224, 90, 0.1)',
      textAlign: 'center',
    }}>
      {/* Animated spinner */}
      <div style={{
        width: 64, height: 64, margin: '0 auto 24px',
        position: 'relative',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '3px solid rgba(110, 224, 90, 0.1)',
          borderTopColor: '#6EE05A',
          animation: 'spin 1s linear infinite',
          position: 'absolute', top: 0, left: 0,
        }} />
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '2px solid rgba(110, 224, 90, 0.05)',
          borderBottomColor: 'rgba(110, 224, 90, 0.4)',
          animation: 'spin 1.5s linear infinite reverse',
          position: 'absolute', top: 8, left: 8,
        }} />
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'rgba(110, 224, 90, 0.15)',
          position: 'absolute', top: 20, left: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#6EE05A',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>

      <h2 style={{
        fontSize: 20, fontWeight: 800, color: '#E8EAED',
        letterSpacing: '-0.02em', margin: '0 0 4px',
      }}>
        {title}
      </h2>
      <p style={{ fontSize: 13, color: '#7A8290', margin: '0 0 32px' }}>
        {subtitle}
      </p>

      {/* Step list */}
      <div style={{ textAlign: 'left', maxWidth: 320, margin: '0 auto' }}>
        {steps.map((s, i) => {
          const isActive = publishing ? true : i + 1 === step
          const isComplete = publishing ? false : i + 1 < step
          const isPending = publishing ? false : i + 1 > step

          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                opacity: isPending ? 0.3 : 1,
                transition: 'opacity 0.5s ease',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isComplete
                  ? 'rgba(110, 224, 90, 0.15)'
                  : isActive
                    ? 'rgba(110, 224, 90, 0.1)'
                    : '#0E1117',
                border: `1px solid ${isComplete ? 'rgba(110, 224, 90, 0.3)' : isActive ? 'rgba(110, 224, 90, 0.2)' : '#1a1f2e'}`,
              }}>
                {isComplete ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isActive ? (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#6EE05A',
                    animation: 'pulse 1s ease-in-out infinite',
                  }} />
                ) : (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#333' }} />
                )}
              </div>
              <span style={{
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isComplete ? '#6EE05A' : isActive ? '#E8EAED' : '#555',
              }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}
