'use client'

import type { AISuggestion } from '../types'
import { SERVICE_LOGOS } from '@/components/builder/ServicePalette'

interface AISuggestionCardProps {
  suggestion: AISuggestion
  onAdd: () => void
}

export default function AISuggestionCard({ suggestion, onAdd }: AISuggestionCardProps) {
  const logo = SERVICE_LOGOS[suggestion.serviceId] ?? ''
  const matchColor = suggestion.matchPercent >= 90 ? '#22c55e' :
    suggestion.matchPercent >= 70 ? '#eab308' : '#6b7280'

  return (
    <div className="onflow-suggestion">
      <div className="onflow-suggestion__header">
        {logo && (
          <img src={logo} alt="" width={20} height={20} className="onflow-suggestion__logo" />
        )}
        <span className="onflow-suggestion__title">{suggestion.title}</span>
        <span className="onflow-suggestion__match" style={{ color: matchColor }}>
          {suggestion.matchPercent}%
        </span>
      </div>
      <p className="onflow-suggestion__desc">{suggestion.description}</p>
      <button className="onflow-suggestion__add" onClick={onAdd} title="Add to workflow">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Step
      </button>
    </div>
  )
}
