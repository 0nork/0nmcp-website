'use client'

import { useOnFlow, useOnFlowDispatch } from '../OnFlowContext'
import { TRIGGER_DEFINITIONS } from '../data/trigger-definitions'
import TriggerCard from '../components/TriggerCard'
import ControlFlowButton from '../components/ControlFlowButton'
import { SERVICE_LOGOS } from '@/components/builder/ServicePalette'
import type { OnFlowStep } from '../types'

export default function TriggerColumn() {
  const state = useOnFlow()
  const dispatch = useOnFlowDispatch()

  const hasTrigger = state.steps.some((s) => s.type === 'trigger')

  function handleTriggerClick(triggerId: string) {
    const def = TRIGGER_DEFINITIONS.find((t) => t.id === triggerId)
    if (!def) return

    // If already has a trigger, replace it
    if (hasTrigger) {
      const existingTrigger = state.steps.find((s) => s.type === 'trigger')
      if (existingTrigger) {
        dispatch({ type: 'REMOVE_STEP', stepId: existingTrigger.id })
      }
    }

    const step: OnFlowStep = {
      id: `step_${String(state.stepCounter).padStart(3, '0')}`,
      type: 'trigger',
      serviceId: def.serviceId,
      serviceName: def.label,
      serviceLogo: SERVICE_LOGOS[def.serviceId] ?? '',
      toolId: def.defaultTool,
      toolName: def.label,
      description: def.description,
      inputs: {},
      outputs: {},
      condition: '',
      onFail: 'halt',
      timeout: 0,
      parallelGroup: '',
      status: 'idle',
      color: def.color,
    }

    // Insert trigger at position 0
    dispatch({ type: 'ADD_STEP', step })
  }

  function addControlFlow(type: 'delay' | 'condition') {
    const step: OnFlowStep = {
      id: `step_${String(state.stepCounter).padStart(3, '0')}`,
      type,
      serviceId: 'logic',
      serviceName: type === 'delay' ? 'Delay' : 'Condition',
      serviceLogo: '',
      toolId: type === 'delay' ? 'delay_wait' : 'condition_check',
      toolName: type === 'delay' ? 'Wait' : 'If/Else',
      description: type === 'delay' ? 'Pause workflow execution' : 'Branch based on condition',
      inputs: type === 'delay' ? { duration: '5000' } : { condition: '' },
      outputs: {},
      condition: '',
      onFail: 'halt',
      timeout: 0,
      parallelGroup: '',
      status: 'idle',
      color: '#a855f7',
    }
    dispatch({ type: 'ADD_STEP', step })
  }

  const selectedTriggerId = state.steps.find((s) => s.type === 'trigger')?.toolId

  return (
    <div className="onflow-column onflow-column--triggers">
      <div className="onflow-column__header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <span>Triggers</span>
      </div>

      <div className="onflow-column__list">
        {TRIGGER_DEFINITIONS.map((t) => (
          <TriggerCard
            key={t.id}
            trigger={t}
            selected={selectedTriggerId === t.defaultTool}
            dimmed={hasTrigger && selectedTriggerId !== t.defaultTool}
            onClick={() => handleTriggerClick(t.id)}
          />
        ))}
      </div>

      {state.mode === 'building' && (
        <div className="onflow-column__section">
          <div className="onflow-column__subheader">Control Flow</div>
          <ControlFlowButton label="Add Delay" icon="delay" onClick={() => addControlFlow('delay')} />
          <ControlFlowButton label="Add Condition" icon="condition" onClick={() => addControlFlow('condition')} />
        </div>
      )}
    </div>
  )
}
