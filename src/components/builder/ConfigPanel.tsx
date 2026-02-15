'use client'

import { useMemo, useCallback } from 'react'
import { useBuilder, useBuilderDispatch } from './BuilderContext'
import { getServiceById } from '@/lib/sxo-helpers'
import type { StepNodeData } from './types'

function KeyValueEditor({
  label,
  entries,
  onChange,
}: {
  label: string
  entries: Record<string, string>
  onChange: (entries: Record<string, string>) => void
}) {
  const pairs = Object.entries(entries)

  function updateKey(oldKey: string, newKey: string) {
    const updated: Record<string, string> = {}
    for (const [k, v] of Object.entries(entries)) {
      updated[k === oldKey ? newKey : k] = v
    }
    onChange(updated)
  }

  function updateValue(key: string, value: string) {
    onChange({ ...entries, [key]: value })
  }

  function removeEntry(key: string) {
    const { [key]: _, ...rest } = entries
    onChange(rest)
  }

  function addEntry() {
    const key = `key_${pairs.length + 1}`
    onChange({ ...entries, [key]: '' })
  }

  return (
    <div className="builder-field">
      <label className="builder-field-label">{label}</label>
      {pairs.map(([k, v]) => (
        <div key={k} className="builder-kv-row">
          <input
            className="builder-kv-key"
            placeholder="key"
            value={k}
            onChange={(e) => updateKey(k, e.target.value)}
          />
          <input
            className="builder-kv-value"
            placeholder="value"
            value={v}
            onChange={(e) => updateValue(k, e.target.value)}
          />
          <button className="builder-kv-remove" onClick={() => removeEntry(k)}>
            &times;
          </button>
        </div>
      ))}
      <button className="builder-kv-add" onClick={addEntry}>
        + Add Entry
      </button>
    </div>
  )
}

export default function ConfigPanel() {
  const { nodes, selectedNodeId } = useBuilder()
  const dispatch = useBuilderDispatch()

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  )

  const service = useMemo(
    () => (selectedNode ? getServiceById(selectedNode.data.serviceId) : undefined),
    [selectedNode]
  )

  const tools = useMemo(() => service?.tools ?? [], [service])

  const update = useCallback(
    (data: Partial<StepNodeData>) => {
      if (selectedNodeId) {
        dispatch({ type: 'UPDATE_NODE_DATA', nodeId: selectedNodeId, data })
      }
    },
    [selectedNodeId, dispatch]
  )

  if (!selectedNode) return null

  const d = selectedNode.data

  return (
    <div className="builder-config">
      <div className="builder-config-header">
        <span className="builder-config-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {d.serviceLogo ? (
            <img src={d.serviceLogo} alt={d.serviceName} width={16} height={16} />
          ) : (
            d.serviceIcon
          )}
          Configure Step
        </span>
        <button
          className="builder-config-close"
          onClick={() => dispatch({ type: 'SELECT_NODE', nodeId: null })}
        >
          &times;
        </button>
      </div>

      <div className="builder-config-body">
        <div className="builder-field">
          <label className="builder-field-label">Step ID</label>
          <input
            className="builder-field-input readonly"
            value={d.stepId}
            readOnly
          />
        </div>

        <div className="builder-field">
          <label className="builder-field-label">Service</label>
          <input
            className="builder-field-input readonly"
            value={d.serviceName}
            readOnly
          />
        </div>

        <div className="builder-field">
          <label className="builder-field-label">Tool</label>
          <select
            className="builder-field-input"
            value={d.toolId}
            onChange={(e) => {
              const tool = tools.find((t) => t.id === e.target.value)
              update({
                toolId: e.target.value,
                toolName: tool?.name ?? e.target.value,
              })
            }}
          >
            <option value="">Select a tool...</option>
            {tools.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <KeyValueEditor
          label="Inputs"
          entries={d.inputs}
          onChange={(inputs) => update({ inputs })}
        />

        <KeyValueEditor
          label="Outputs"
          entries={d.outputs}
          onChange={(outputs) => update({ outputs })}
        />

        <div className="builder-field">
          <label className="builder-field-label">Condition</label>
          <input
            className="builder-field-input"
            placeholder="e.g. {{step.prev.status}} == 'success'"
            value={d.condition}
            onChange={(e) => update({ condition: e.target.value })}
          />
        </div>

        <div className="builder-field">
          <label className="builder-field-label">On Fail</label>
          <select
            className="builder-field-input"
            value={d.onFail}
            onChange={(e) =>
              update({ onFail: e.target.value as StepNodeData['onFail'] })
            }
          >
            <option value="halt">Halt</option>
            <option value="skip">Skip</option>
            <option value="retry:1">Retry 1x</option>
            <option value="retry:2">Retry 2x</option>
            <option value="retry:3">Retry 3x</option>
          </select>
        </div>

        <div className="builder-field">
          <label className="builder-field-label">Timeout (ms)</label>
          <input
            className="builder-field-input"
            type="number"
            placeholder="30000"
            value={d.timeout || ''}
            onChange={(e) =>
              update({ timeout: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="builder-field">
          <label className="builder-field-label">Parallel Group</label>
          <input
            className="builder-field-input"
            placeholder="e.g. group_a"
            value={d.parallelGroup}
            onChange={(e) => update({ parallelGroup: e.target.value })}
          />
        </div>
      </div>

      <div className="builder-config-delete">
        <button
          className="builder-config-delete-btn"
          onClick={() => dispatch({ type: 'DELETE_NODE', nodeId: selectedNode.id })}
        >
          Delete Step
        </button>
      </div>
    </div>
  )
}
