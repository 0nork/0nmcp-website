'use client'

import type { TriggerDefinition } from '../types'

interface TriggerCardProps {
  trigger: TriggerDefinition
  selected: boolean
  dimmed: boolean
  onClick: () => void
}

export default function TriggerCard({ trigger, selected, dimmed, onClick }: TriggerCardProps) {
  return (
    <button
      className={`onflow-trigger-card ${selected ? 'onflow-trigger-card--selected' : ''} ${dimmed ? 'onflow-trigger-card--dimmed' : ''}`}
      onClick={onClick}
      style={{ '--card-color': trigger.color } as React.CSSProperties}
    >
      <div className="onflow-trigger-card__icon">
        <img src={trigger.icon} alt="" width={20} height={20} />
      </div>
      <div className="onflow-trigger-card__text">
        <span className="onflow-trigger-card__title">{trigger.label}</span>
        <span className="onflow-trigger-card__desc">{trigger.description}</span>
      </div>
    </button>
  )
}
