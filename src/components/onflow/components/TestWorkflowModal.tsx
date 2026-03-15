'use client'

import { useState } from 'react'
import { useOnFlow, useOnFlowDispatch } from '../OnFlowContext'
import { exportFromOnFlow } from '../hooks/useOnFlowExport'

interface TestWorkflowModalProps {
  open: boolean
  onClose: () => void
}

export default function TestWorkflowModal({ open, onClose }: TestWorkflowModalProps) {
  const state = useOnFlow()
  const dispatch = useOnFlowDispatch()
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [result, setResult] = useState('')

  if (!open) return null

  async function runTest() {
    setStatus('running')
    dispatch({ type: 'SET_TEST_RUNNING', running: true })

    // Mark all steps as pending
    state.steps.forEach((step) => {
      dispatch({ type: 'SET_TEST_STATUS', stepId: step.id, status: 'pending' })
    })

    try {
      const workflow = exportFromOnFlow(state.steps, state.settings)

      const res = await fetch('/api/console/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow }),
      })

      const data = await res.json()

      if (data.status === 'completed') {
        setStatus('done')
        setResult(typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2))
        // Mark all steps success
        state.steps.forEach((step) => {
          dispatch({ type: 'SET_TEST_STATUS', stepId: step.id, status: 'success' })
        })
      } else {
        setStatus('error')
        setResult(data.error_message || data.message || 'Execution failed')
        // Mark first step as error
        if (state.steps.length > 0) {
          dispatch({ type: 'SET_TEST_STATUS', stepId: state.steps[0].id, status: 'error' })
        }
      }
    } catch (err) {
      setStatus('error')
      setResult((err as Error).message)
    } finally {
      dispatch({ type: 'SET_TEST_RUNNING', running: false })
    }
  }

  return (
    <div className="onflow-modal-overlay" onClick={onClose}>
      <div className="onflow-modal" onClick={(e) => e.stopPropagation()}>
        <div className="onflow-modal__header">
          <h3>Test Workflow</h3>
          <button className="onflow-modal__close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="onflow-modal__body">
          <p className="onflow-modal__info">
            {state.steps.length} step{state.steps.length !== 1 ? 's' : ''} will execute sequentially.
          </p>

          <div className="onflow-modal__steps">
            {state.steps.map((step, i) => (
              <div key={step.id} className={`onflow-modal__step onflow-modal__step--${state.testResults[step.id] || 'idle'}`}>
                <span className="onflow-modal__step-num">{i + 1}</span>
                <span className="onflow-modal__step-name">{step.serviceName} → {step.toolId}</span>
                <span className={`onflow-dot onflow-dot--${state.testResults[step.id] || 'idle'}`} />
              </div>
            ))}
          </div>

          {result && (
            <pre className="onflow-modal__result">{result}</pre>
          )}
        </div>

        <div className="onflow-modal__footer">
          <button className="onflow-toolbar__btn" onClick={onClose}>Cancel</button>
          <button
            className="onflow-toolbar__btn onflow-toolbar__btn--accent"
            onClick={runTest}
            disabled={status === 'running'}
          >
            {status === 'running' ? 'Running...' : 'Run Test'}
          </button>
        </div>
      </div>
    </div>
  )
}
