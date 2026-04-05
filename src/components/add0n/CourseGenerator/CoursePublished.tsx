'use client'

/**
 * CoursePublished — Success state with CRM link
 */

interface PublishResult {
  productId: string
  chaptersCreated: number
  lessonsCreated: number
  totalModules: number
  totalLessons: number
  errors?: string[]
  courseUrl: string
}

interface Props {
  result: PublishResult
  courseTitle: string
  onReset: () => void
}

export default function CoursePublished({ result, courseTitle, onReset }: Props) {
  const hasErrors = result.errors && result.errors.length > 0
  const allLessonsCreated = result.lessonsCreated === result.totalLessons

  return (
    <div style={{
      marginTop: 32, padding: '48px 32px', borderRadius: 16,
      background: 'rgba(110, 224, 90, 0.03)',
      border: '1px solid rgba(110, 224, 90, 0.15)',
      textAlign: 'center',
    }}>
      {/* Success icon */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        margin: '0 auto 20px',
        background: 'rgba(110, 224, 90, 0.1)',
        border: '2px solid rgba(110, 224, 90, 0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 style={{
        fontSize: 24, fontWeight: 800, color: 'var(--text-primary)',
        letterSpacing: '-0.03em', margin: '0 0 4px',
      }}>
        Course Deployed!
      </h2>
      <p style={{ fontSize: 14, color: '#7A8290', margin: '0 0 28px' }}>
        &ldquo;{courseTitle}&rdquo; is live in your CRM.
      </p>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12, maxWidth: 400, margin: '0 auto 24px',
      }}>
        <StatCard label="Chapters" value={result.chaptersCreated} total={result.totalModules} />
        <StatCard label="Lessons" value={result.lessonsCreated} total={result.totalLessons} />
        <StatCard label="Product ID" value={result.productId.slice(0, 8) + '...'} />
      </div>

      {/* Status badge */}
      <div style={{
        display: 'inline-block', padding: '8px 16px', borderRadius: 8,
        background: allLessonsCreated
          ? 'rgba(110, 224, 90, 0.08)'
          : 'rgba(251, 191, 36, 0.08)',
        border: `1px solid ${allLessonsCreated ? 'rgba(110, 224, 90, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`,
        fontSize: 13, fontWeight: 600,
        color: allLessonsCreated ? '#6EE05A' : '#fbbf24',
        marginBottom: 20,
      }}>
        {allLessonsCreated
          ? 'All lessons deployed successfully'
          : `${result.lessonsCreated} of ${result.totalLessons} lessons deployed`
        }
      </div>

      {/* CRM link */}
      <p style={{ fontSize: 13, color: '#7A8290', margin: '0 0 8px' }}>
        Go to your CRM Dashboard &rarr; Memberships &rarr; Courses to review and publish to students.
      </p>

      {/* Errors */}
      {hasErrors && (
        <div style={{
          marginTop: 20, padding: '14px 16px', borderRadius: 10,
          background: 'rgba(248, 113, 113, 0.06)',
          border: '1px solid rgba(248, 113, 113, 0.15)',
          textAlign: 'left', maxWidth: 480, margin: '20px auto 0',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 6 }}>
            Some items had errors:
          </div>
          {result.errors!.map((e, i) => (
            <div key={i} style={{ fontSize: 11, color: '#f87171', marginTop: 4, opacity: 0.8 }}>
              {e}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
        <button onClick={onReset} style={{
          padding: '12px 28px', borderRadius: 10,
          background: 'var(--bg-primary)', border: '1px solid #1a1f2e',
          color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'border-color 0.2s',
        }}>
          Generate Another Course
        </button>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Stat Card ────────────────────────────────────────────────────────
function StatCard({ label, value, total }: { label: string; value: string | number; total?: number }) {
  return (
    <div style={{
      padding: '14px 12px', borderRadius: 10,
      background: 'var(--bg-primary)', border: '1px solid #1a1f2e',
    }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
        {total !== undefined && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>/{total}</span>
        )}
      </div>
      <div style={{ fontSize: 11, color: '#7A8290', marginTop: 2 }}>{label}</div>
    </div>
  )
}
