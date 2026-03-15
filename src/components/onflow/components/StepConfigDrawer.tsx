'use client'

import { useState } from 'react'
import type { OnFlowStep } from '../types'
import { useOnFlowDispatch } from '../OnFlowContext'
import { getServiceById } from '@/lib/sxo-helpers'

interface StepConfigDrawerProps {
  step: OnFlowStep
}

export default function StepConfigDrawer({ step }: StepConfigDrawerProps) {
  const dispatch = useOnFlowDispatch()
  const service = getServiceById(step.serviceId)
  const tools = service?.tools ?? []

  const [newInputKey, setNewInputKey] = useState('')
  const [newInputVal, setNewInputVal] = useState('')
  const [newOutputKey, setNewOutputKey] = useState('')
  const [newOutputVal, setNewOutputVal] = useState('')

  function updateStep(data: Partial<OnFlowStep>) {
    dispatch({ type: 'UPDATE_STEP', stepId: step.id, data })
  }

  function addInput() {
    if (!newInputKey.trim()) return
    updateStep({ inputs: { ...step.inputs, [newInputKey]: newInputVal } })
    setNewInputKey('')
    setNewInputVal('')
  }

  function removeInput(key: string) {
    const next = { ...step.inputs }
    delete next[key]
    updateStep({ inputs: next })
  }

  function addOutput() {
    if (!newOutputKey.trim()) return
    updateStep({ outputs: { ...step.outputs, [newOutputKey]: newOutputVal } })
    setNewOutputKey('')
    setNewOutputVal('')
  }

  function removeOutput(key: string) {
    const next = { ...step.outputs }
    delete next[key]
    updateStep({ outputs: next })
  }

  return (
    <div className="onflow-config-drawer">
      {/* Tool select */}
      <div className="onflow-config-field">
        <label className="onflow-config-label">Tool</label>
        <select
          className="onflow-config-select"
          value={step.toolId}
          onChange={(e) => {
            const t = tools.find((t: { id: string; name: string }) => t.id === e.target.value)
            updateStep({ toolId: e.target.value, toolName: t?.name ?? e.target.value })
          }}
        >
          <option value="">Select tool...</option>
          {tools.map((t: { id: string; name: string }) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Inputs */}
      <div className="onflow-config-field">
        <label className="onflow-config-label">Inputs</label>
        {Object.entries(step.inputs).map(([k, v]) => (
          <div key={k} className="onflow-config-kv">
            <input className="onflow-config-input" value={k} readOnly />
            <input
              className="onflow-config-input"
              value={v}
              onChange={(e) => updateStep({ inputs: { ...step.inputs, [k]: e.target.value } })}
            />
            <button className="onflow-config-remove" onClick={() => removeInput(k)}>x</button>
          </div>
        ))}
        <div className="onflow-config-kv">
          <input className="onflow-config-input" placeholder="key" value={newInputKey} onChange={(e) => setNewInputKey(e.target.value)} />
          <input className="onflow-config-input" placeholder="value" value={newInputVal} onChange={(e) => setNewInputVal(e.target.value)} />
          <button className="onflow-config-add" onClick={addInput}>+</button>
        </div>
      </div>

      {/* Outputs */}
      <div className="onflow-config-field">
        <label className="onflow-config-label">Outputs</label>
        {Object.entries(step.outputs).map(([k, v]) => (
          <div key={k} className="onflow-config-kv">
            <input className="onflow-config-input" value={k} readOnly />
            <input
              className="onflow-config-input"
              value={v}
              onChange={(e) => updateStep({ outputs: { ...step.outputs, [k]: e.target.value } })}
            />
            <button className="onflow-config-remove" onClick={() => removeOutput(k)}>x</button>
          </div>
        ))}
        <div className="onflow-config-kv">
          <input className="onflow-config-input" placeholder="key" value={newOutputKey} onChange={(e) => setNewOutputKey(e.target.value)} />
          <input className="onflow-config-input" placeholder="alias" value={newOutputVal} onChange={(e) => setNewOutputVal(e.target.value)} />
          <button className="onflow-config-add" onClick={addOutput}>+</button>
        </div>
      </div>

      {/* Condition */}
      <div className="onflow-config-field">
        <label className="onflow-config-label">Condition</label>
        <input
          className="onflow-config-input onflow-config-input--full"
          value={step.condition}
          onChange={(e) => updateStep({ condition: e.target.value })}
          placeholder="{{step.prev.status}} == 'success'"
        />
      </div>

      {/* On Fail / Timeout row */}
      <div className="onflow-config-row">
        <div className="onflow-config-field onflow-config-field--half">
          <label className="onflow-config-label">On Fail</label>
          <select
            className="onflow-config-select"
            value={step.onFail}
            onChange={(e) => updateStep({ onFail: e.target.value as OnFlowStep['onFail'] })}
          >
            <option value="halt">Halt</option>
            <option value="skip">Skip</option>
            <option value="retry:1">Retry 1x</option>
            <option value="retry:2">Retry 2x</option>
            <option value="retry:3">Retry 3x</option>
          </select>
        </div>
        <div className="onflow-config-field onflow-config-field--half">
          <label className="onflow-config-label">Timeout (ms)</label>
          <input
            className="onflow-config-input"
            type="number"
            value={step.timeout || ''}
            onChange={(e) => updateStep({ timeout: parseInt(e.target.value) || 0 })}
            placeholder="30000"
          />
        </div>
      </div>

      {/* Remove step */}
      <button
        className="onflow-config-remove-step"
        onClick={() => dispatch({ type: 'REMOVE_STEP', stepId: step.id })}
      >
        Remove Step
      </button>
    </div>
  )
}
