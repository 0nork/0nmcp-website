'use client'

import type { ActionDefinition } from '../types'

interface ActionCardProps {
  action: ActionDefinition
  onClick: () => void
}

export default function ActionCard({ action, onClick }: ActionCardProps) {
  return (
    <button
      className="onflow-action-card"
      onClick={onClick}
      style={{ '--card-color': action.color } as React.CSSProperties}
    >
      <div className="onflow-action-card__icon">
        <img src={action.icon} alt="" width={20} height={20} />
      </div>
      <div className="onflow-action-card__text">
        <span className="onflow-action-card__title">{action.label}</span>
        <span className="onflow-action-card__desc">{action.description}</span>
      </div>
    </button>
  )
}
