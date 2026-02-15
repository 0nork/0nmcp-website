'use client'

import { useBuilder, useBuilderDispatch } from './BuilderContext'
import type { WorkflowSettings } from './types'

function toKebab(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function KVEditor({
  label,
  entries,
  onChange,
}: {
  label: string
  entries: Record<string, string>
  onChange: (entries: Record<string, string>) => void
}) {
  const pairs = Object.entries(entries)

  return (
    <div className="builder-field">
      <label className="builder-field-label">{label}</label>
      {pairs.map(([k, v]) => (
        <div key={k} className="builder-kv-row">
          <input
            className="builder-kv-key"
            placeholder="key"
            value={k}
            onChange={(e) => {
              const updated: Record<string, string> = {}
              for (const [ok, ov] of Object.entries(entries))
                updated[ok === k ? e.target.value : ok] = ov
              onChange(updated)
            }}
          />
          <input
            className="builder-kv-value"
            placeholder="value"
            value={v}
            onChange={(e) => onChange({ ...entries, [k]: e.target.value })}
          />
          <button
            className="builder-kv-remove"
            onClick={() => {
              const { [k]: _, ...rest } = entries
              onChange(rest)
            }}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        className="builder-kv-add"
        onClick={() => onChange({ ...entries, [`key_${pairs.length + 1}`]: '' })}
      >
        + Add
      </button>
    </div>
  )
}

export default function WorkflowSettingsModal() {
  const { settings, settingsOpen } = useBuilder()
  const dispatch = useBuilderDispatch()

  if (!settingsOpen) return null

  function update(partial: Partial<WorkflowSettings>) {
    dispatch({ type: 'UPDATE_SETTINGS', settings: partial })
  }

  return (
    <div
      className="builder-modal-overlay"
      onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
    >
      <div className="builder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="builder-modal-header">
          <span className="builder-modal-title">Workflow Settings</span>
          <button
            className="builder-config-close"
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          >
            &times;
          </button>
        </div>

        <div className="builder-modal-body">
          <div className="builder-field">
            <label className="builder-field-label">Workflow Name</label>
            <input
              className="builder-field-input"
              value={settings.name}
              onChange={(e) => update({ name: toKebab(e.target.value) })}
              placeholder="my-workflow"
            />
          </div>

          <div className="builder-field">
            <label className="builder-field-label">Description</label>
            <input
              className="builder-field-input"
              value={settings.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="What does this workflow do?"
            />
          </div>

          <div className="builder-field">
            <label className="builder-field-label">Author</label>
            <input
              className="builder-field-input"
              value={settings.author}
              onChange={(e) => update({ author: e.target.value })}
              placeholder="Your name or email"
            />
          </div>

          <KVEditor
            label="Environment Variables"
            entries={settings.env}
            onChange={(env) => update({ env })}
          />

          <KVEditor
            label="Variables"
            entries={settings.variables}
            onChange={(variables) => update({ variables })}
          />

          <div className="builder-field">
            <label className="builder-field-label">On Complete</label>
            <select
              className="builder-field-input"
              value={settings.onComplete}
              onChange={(e) =>
                update({
                  onComplete: e.target.value as WorkflowSettings['onComplete'],
                })
              }
            >
              <option value="log">Log</option>
              <option value="notify">Notify</option>
              <option value="webhook">Webhook</option>
            </select>
          </div>

          <div className="builder-field">
            <label className="builder-field-label">Pipeline</label>
            <input
              className="builder-field-input"
              value={settings.metadata.pipeline}
              onChange={(e) =>
                update({
                  metadata: { ...settings.metadata, pipeline: e.target.value },
                })
              }
              placeholder="e.g. production"
            />
          </div>

          <div className="builder-field">
            <label className="builder-field-label">Environment</label>
            <input
              className="builder-field-input"
              value={settings.metadata.environment}
              onChange={(e) =>
                update({
                  metadata: {
                    ...settings.metadata,
                    environment: e.target.value,
                  },
                })
              }
              placeholder="e.g. staging"
            />
          </div>

          <div className="builder-field">
            <label className="builder-field-label">Tags (comma-separated)</label>
            <input
              className="builder-field-input"
              value={settings.metadata.tags.join(', ')}
              onChange={(e) =>
                update({
                  metadata: {
                    ...settings.metadata,
                    tags: e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                  },
                })
              }
              placeholder="automation, leads, onboarding"
            />
          </div>
        </div>

        <div className="builder-modal-footer">
          <button
            className="builder-toolbar-btn"
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
