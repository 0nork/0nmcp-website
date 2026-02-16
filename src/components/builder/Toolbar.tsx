'use client'

import { useRef } from 'react'
import { useBuilder, useBuilderDispatch } from './BuilderContext'
import { exportWorkflow } from './exportWorkflow'
import { importWorkflow } from './importWorkflow'
import type { DotOnWorkflow } from './types'

interface ToolbarProps {
  aiChatOpen: boolean
  onToggleAIChat: () => void
}

export default function Toolbar({ aiChatOpen, onToggleAIChat }: ToolbarProps) {
  const { nodes, edges, settings } = useBuilder()
  const dispatch = useBuilderDispatch()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const workflow = exportWorkflow(nodes, edges, settings)
    const json = JSON.stringify(workflow, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${settings.name || 'workflow'}.0n`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    fileRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const workflow = JSON.parse(reader.result as string) as DotOnWorkflow
        const result = importWorkflow(workflow)
        dispatch({ type: 'IMPORT_WORKFLOW', ...result })
      } catch {
        alert('Invalid .0n file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleClear() {
    if (nodes.length === 0) return
    if (!confirm('Clear all steps from the canvas?')) return
    dispatch({ type: 'CLEAR_CANVAS' })
  }

  return (
    <div className="builder-toolbar">
      <div className="builder-toolbar-group">
        <button className="builder-toolbar-btn" onClick={handleImport}>
          Import .0n
        </button>
        <button className="builder-toolbar-btn accent" onClick={handleExport}>
          Export .0n
        </button>
        <button className="builder-toolbar-btn danger" onClick={handleClear}>
          Clear
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".0n,.json"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="builder-toolbar-group">
        <span className="builder-step-count">
          {nodes.length} step{nodes.length !== 1 ? 's' : ''}
        </span>
        <button
          className={`builder-toolbar-btn ai ${aiChatOpen ? 'active' : ''}`}
          onClick={onToggleAIChat}
        >
          AI Builder
        </button>
        <button
          className="builder-toolbar-btn"
          onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
        >
          Settings
        </button>
      </div>
    </div>
  )
}
