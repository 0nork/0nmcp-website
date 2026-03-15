'use client'

import { useState, useRef } from 'react'
import { useOnFlow, useOnFlowDispatch } from '../OnFlowContext'
import { exportFromOnFlow } from '../hooks/useOnFlowExport'
import { importToOnFlow } from '../hooks/useOnFlowImport'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import type { DotOnWorkflow } from '../types'

export default function OnFlowToolbar() {
  const state = useOnFlow()
  const dispatch = useOnFlowDispatch()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)

  function handleExport() {
    const workflow = exportFromOnFlow(state.steps, state.settings)
    const json = JSON.stringify(workflow, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.settings.name || 'workflow'}.0n`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const workflow = JSON.parse(ev.target?.result as string) as DotOnWorkflow
        const result = importToOnFlow(workflow)
        dispatch({
          type: 'IMPORT_WORKFLOW',
          steps: result.steps,
          settings: result.settings,
          stepCounter: result.stepCounter,
        })
      } catch {
        alert('Invalid .0n file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createSupabaseBrowser()
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const workflow = exportFromOnFlow(state.steps, state.settings)
      await supabase.from('workflow_files').upsert({
        user_id: user.id,
        name: state.settings.name,
        workflow_json: workflow,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,name' })
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="onflow-toolbar">
      <div className="onflow-toolbar__brand">
        <span className="onflow-toolbar__logo">0n</span>
        <span className="onflow-toolbar__name">Flow</span>
      </div>

      <input
        className="onflow-toolbar__workflow-name"
        value={state.settings.name}
        onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', settings: { name: e.target.value } })}
        placeholder="workflow-name"
      />

      <div className="onflow-toolbar__actions">
        <button
          className="onflow-toolbar__btn"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={!state.canUndo}
          title="Undo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        </button>
        <button
          className="onflow-toolbar__btn"
          onClick={() => dispatch({ type: 'REDO' })}
          disabled={!state.canRedo}
          title="Redo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>

        <div className="onflow-toolbar__divider" />

        <button className="onflow-toolbar__btn" onClick={() => fileRef.current?.click()} title="Import .0n">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Import
        </button>
        <input ref={fileRef} type="file" accept=".0n,.json" style={{ display: 'none' }} onChange={handleImport} />

        <button className="onflow-toolbar__btn" onClick={handleExport} disabled={state.steps.length === 0} title="Export .0n">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Export
        </button>

        <button className="onflow-toolbar__btn onflow-toolbar__btn--save" onClick={handleSave} disabled={saving || state.steps.length === 0} title="Save to cloud">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {saving ? 'Saving...' : 'Save'}
        </button>

        <div className="onflow-toolbar__divider" />

        <a href="/builder?mode=classic" className="onflow-toolbar__btn onflow-toolbar__btn--link" title="Switch to classic builder">
          Classic Builder
        </a>
      </div>
    </div>
  )
}
