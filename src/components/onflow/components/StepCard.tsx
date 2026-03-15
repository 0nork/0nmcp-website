'use client'

import { useState } from 'react'
import type { OnFlowStep, DataVariable } from '../types'
import DataChip from './DataChip'
import StepConfigDrawer from './StepConfigDrawer'
import { useOnFlowDispatch } from '../OnFlowContext'

interface StepCardProps {
  step: OnFlowStep
  index: number
  selected: boolean
  variables: DataVariable[]
  testResult?: 'success' | 'error' | 'pending'
}

export default function StepCard({ step, index, selected, variables, testResult }: StepCardProps) {
  const dispatch = useOnFlowDispatch()
  const [expanded, setExpanded] = useState(false)

  function handleClick() {
    dispatch({ type: 'SELECT_STEP', stepId: selected ? null : step.id })
    setExpanded(!selected)
  }

  const typeBadgeClass = step.type === 'trigger' ? 'onflow-badge--trigger' :
    step.type === 'delay' ? 'onflow-badge--delay' :
    step.type === 'condition' ? 'onflow-badge--condition' :
    'onflow-badge--action'

  const statusDot = step.status === 'success' ? 'onflow-dot--success' :
    step.status === 'error' ? 'onflow-dot--error' :
    step.status === 'running' ? 'onflow-dot--running' : ''

  return (
    <div
      className={`onflow-step-card ${selected ? 'onflow-step-card--selected' : ''}`}
      style={{ '--step-color': step.color } as React.CSSProperties}
    >
      <button className="onflow-step-card__header" onClick={handleClick}>
        <div className="onflow-step-card__icon">
          {step.serviceLogo ? (
            <img src={step.serviceLogo} alt="" width={28} height={28} />
          ) : (
            <span className="onflow-step-card__index">{index + 1}</span>
          )}
        </div>
        <div className="onflow-step-card__info">
          <div className="onflow-step-card__name-row">
            <span className="onflow-step-card__name">{step.toolName || step.serviceName}</span>
            <span className={`onflow-badge ${typeBadgeClass}`}>{step.type}</span>
            {statusDot && <span className={`onflow-dot ${statusDot}`} />}
          </div>
          <span className="onflow-step-card__desc">{step.description || `${step.serviceName} → ${step.toolId}`}</span>
        </div>
        <svg className={`onflow-step-card__chevron ${expanded ? 'onflow-step-card__chevron--open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {variables.length > 0 && (
        <div className="onflow-step-card__chips">
          <span className="onflow-step-card__chips-label">Data:</span>
          {variables.map((v) => (
            <DataChip key={v.key} variableKey={v.key} label={v.label} sourceStepId={v.sourceStepId} />
          ))}
        </div>
      )}

      {testResult && (
        <div className={`onflow-step-card__result onflow-step-card__result--${testResult}`}>
          {testResult === 'success' ? 'Passed' : testResult === 'error' ? 'Failed' : 'Pending...'}
        </div>
      )}

      {selected && expanded && (
        <StepConfigDrawer step={step} />
      )}
    </div>
  )
}
