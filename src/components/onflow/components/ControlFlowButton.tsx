'use client'

interface ControlFlowButtonProps {
  label: string
  icon: 'delay' | 'condition'
  onClick: () => void
}

export default function ControlFlowButton({ label, icon, onClick }: ControlFlowButtonProps) {
  return (
    <button className="onflow-control-btn" onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {icon === 'delay' ? (
          <>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </>
        ) : (
          <>
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </>
        )}
      </svg>
      {label}
    </button>
  )
}
