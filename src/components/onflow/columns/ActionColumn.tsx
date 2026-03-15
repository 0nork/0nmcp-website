'use client'

import { useOnFlow, useOnFlowDispatch } from '../OnFlowContext'
import { ACTION_DEFINITIONS } from '../data/action-definitions'
import ActionCard from '../components/ActionCard'
import { SERVICE_LOGOS } from '@/components/builder/ServicePalette'
import type { OnFlowStep } from '../types'

export default function ActionColumn() {
  const state = useOnFlow()
  const dispatch = useOnFlowDispatch()

  function handleActionClick(actionId: string) {
    const def = ACTION_DEFINITIONS.find((a) => a.id === actionId)
    if (!def) return

    const step: OnFlowStep = {
      id: `step_${String(state.stepCounter).padStart(3, '0')}`,
      type: 'action',
      serviceId: def.serviceId,
      serviceName: def.label,
      serviceLogo: SERVICE_LOGOS[def.serviceId] ?? '',
      toolId: def.defaultTool,
      toolName: def.label,
      description: def.description,
      inputs: Object.fromEntries(def.inputFields.map((f) => [f.key, ''])),
      outputs: {},
      condition: '',
      onFail: 'halt',
      timeout: 0,
      parallelGroup: '',
      status: 'idle',
      color: def.color,
    }

    dispatch({ type: 'ADD_STEP', step })
  }

  return (
    <div className="onflow-column onflow-column--actions">
      <div className="onflow-column__header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2" /><path d="M12 21v2" />
          <path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" />
          <path d="M1 12h2" /><path d="M21 12h2" />
          <path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" />
        </svg>
        <span>Actions</span>
      </div>

      <div className="onflow-column__list">
        {ACTION_DEFINITIONS.map((a) => (
          <ActionCard
            key={a.id}
            action={a}
            onClick={() => handleActionClick(a.id)}
          />
        ))}
      </div>
    </div>
  )
}
