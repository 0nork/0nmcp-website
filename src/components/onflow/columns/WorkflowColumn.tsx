'use client'

import { useState } from 'react'
import { useOnFlow, useOnFlowDispatch } from '../OnFlowContext'
import WhatIfPrompt from '../components/WhatIfPrompt'
import StepCard from '../components/StepCard'
import StepConnector from '../components/StepConnector'
import AISuggestionCard from '../components/AISuggestionCard'
import TestWorkflowModal from '../components/TestWorkflowModal'
import { useDataVariables } from '../hooks/useDataVariables'
import { useAISuggestions } from '../hooks/useAISuggestions'
import { SERVICE_LOGOS } from '@/components/builder/ServicePalette'
import type { OnFlowStep } from '../types'

function StepWithData({ step, index, selected, steps, testResult }: {
  step: OnFlowStep
  index: number
  selected: boolean
  steps: OnFlowStep[]
  testResult?: 'success' | 'error' | 'pending'
}) {
  const variables = useDataVariables(steps, index)
  return (
    <StepCard
      step={step}
      index={index}
      selected={selected}
      variables={variables}
      testResult={testResult}
    />
  )
}

export default function WorkflowColumn() {
  const state = useOnFlow()
  const dispatch = useOnFlowDispatch()
  const suggestions = useAISuggestions(state.steps)
  const [testOpen, setTestOpen] = useState(false)

  function addSuggestion(suggestion: { serviceId: string; title: string; description: string; toolId: string }) {
    const step: OnFlowStep = {
      id: `step_${String(state.stepCounter).padStart(3, '0')}`,
      type: 'action',
      serviceId: suggestion.serviceId,
      serviceName: suggestion.title,
      serviceLogo: SERVICE_LOGOS[suggestion.serviceId] ?? '',
      toolId: suggestion.toolId,
      toolName: suggestion.title,
      description: suggestion.description,
      inputs: {},
      outputs: {},
      condition: '',
      onFail: 'halt',
      timeout: 0,
      parallelGroup: '',
      status: 'idle',
      color: '#7ed957',
    }
    dispatch({ type: 'ADD_STEP', step })
  }

  if (state.mode === 'empty') {
    return (
      <div className="onflow-column onflow-column--workflow onflow-column--center">
        <WhatIfPrompt />
      </div>
    )
  }

  return (
    <div className="onflow-column onflow-column--workflow">
      <div className="onflow-workflow-header">
        <h3 className="onflow-workflow-title">Your Workflow</h3>
        <button
          className="onflow-test-btn"
          onClick={() => setTestOpen(true)}
          disabled={state.steps.length === 0 || state.testRunning}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Test Workflow
        </button>
      </div>

      <div className="onflow-workflow-steps">
        {state.steps.map((step, i) => (
          <div key={step.id}>
            {i > 0 && <StepConnector />}
            <StepWithData
              step={step}
              index={i}
              selected={state.selectedStepId === step.id}
              steps={state.steps}
              testResult={state.testResults[step.id]}
            />
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="onflow-suggestions-section">
          <div className="onflow-suggestions-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
            </svg>
            AI Suggested Next Steps
          </div>
          {suggestions.map((s) => (
            <AISuggestionCard key={s.id} suggestion={s} onAdd={() => addSuggestion(s)} />
          ))}
        </div>
      )}

      <TestWorkflowModal open={testOpen} onClose={() => setTestOpen(false)} />
    </div>
  )
}
