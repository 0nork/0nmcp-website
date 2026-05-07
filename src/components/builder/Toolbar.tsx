'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useBuilder, useBuilderDispatch } from './BuilderContext'
import { exportWorkflow } from './exportWorkflow'
import { importWorkflow } from './importWorkflow'
import { secureExport, secureImport } from '@/lib/dot-on-security'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import LoginModal from '@/components/LoginModal'
import type { DotOnWorkflow } from './types'

interface ToolbarProps {
  aiChatOpen: boolean
  onToggleAIChat: () => void
  terminalOpen?: boolean
  onToggleTerminal?: () => void
  viewMode?: 'canvas' | 'simple'
  onToggleView?: () => void
  onOpenWizard?: () => void
  onTogglePalette?: () => void
}

export default function Toolbar({ aiChatOpen, onToggleAIChat, terminalOpen, onToggleTerminal, viewMode, onToggleView, onOpenWizard, onTogglePalette }: ToolbarProps) {
  const { nodes, edges, settings, canUndo, canRedo, selectedNodeId } = useBuilder()
  const dispatch = useBuilderDispatch()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const [pendingAction, setPendingAction] = useState<'export' | 'import' | 'ai' | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [importBanner, setImportBanner] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? { id: data.session.user.id } : null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Keyboard shortcuts for undo/redo/delete
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      if (canUndo) dispatch({ type: 'UNDO' })
    }
    if (mod && e.key === 'z' && e.shiftKey) {
      e.preventDefault()
      if (canRedo) dispatch({ type: 'REDO' })
    }
    if (mod && e.key === 'y') {
      e.preventDefault()
      if (canRedo) dispatch({ type: 'REDO' })
    }
    // Delete selected node with Delete or Backspace (when not in an input)
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault()
        dispatch({ type: 'DELETE_NODE', nodeId: selectedNodeId })
      }
    }
  }, [canUndo, canRedo, dispatch, selectedNodeId])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  function requireAuth(action: 'export' | 'import' | 'ai', message: string) {
    if (user) return true
    setLoginMessage(message)
    setPendingAction(action)
    setLoginOpen(true)
    return false
  }

  function handleLoginSuccess() {
    const supabase = createSupabaseBrowser()
    supabase?.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id })
    })
    // Execute the pending action
    if (pendingAction === 'export') doExport()
    else if (pendingAction === 'import') fileRef.current?.click()
    else if (pendingAction === 'ai') onToggleAIChat()
    setPendingAction(null)
  }

  async function handleSaveToCloud() {
    if (!requireAuth('export', 'Sign in to save workflows to the cloud.')) return
    if (nodes.length === 0) return
    setSaving(true)
    setSaveStatus('idle')
    try {
      const supabase = createSupabaseBrowser()
      if (!supabase || !user) throw new Error('Not authenticated')
      const workflow = exportWorkflow(nodes, edges, settings)
      const name = settings.name || 'Untitled Workflow'
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      await supabase.from('workflow_files').upsert({
        owner_id: user.id,
        file_key: slug,
        name,
        description: settings.description || '',
        version: '1.0.0',
        step_count: nodes.length,
        services_used: [...new Set(nodes.map(n => n.data.serviceId))],
        tags: settings.metadata?.tags || [],
        status: 'draft',
        workflow_data: workflow,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'file_key' })

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setSaving(false)
    }
  }

  async function doExport() {
    const workflow = exportWorkflow(nodes, edges, settings)
    const { file, warnings } = await secureExport(
      workflow as unknown as Record<string, unknown>
    )

    if (warnings.length > 0) {
      alert('Security warnings:\n\n' + warnings.join('\n\n'))
    }

    const json = JSON.stringify(file, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${settings.name || 'workflow'}.0n`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExport() {
    if (!requireAuth('export', 'Sign in to export signed .0n files. Your identity is embedded in the file signature.')) return
    doExport()
  }

  function handleImport() {
    if (!requireAuth('import', 'Sign in to import .0n files. Only authorized users can load workflow files.')) return
    fileRef.current?.click()
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const raw = JSON.parse(reader.result as string)

        // Security validation
        const { valid, errors, warnings } = await secureImport(raw)

        if (!valid) {
          setImportBanner({ message: errors.join(' '), type: 'warning' })
          setTimeout(() => setImportBanner(null), 8000)
          return
        }

        // Show warnings as a non-blocking info banner (not a blocking confirm)
        if (warnings.length > 0) {
          setImportBanner({ message: warnings[0].replace(/\. For best.*/, ''), type: 'info' })
          setTimeout(() => setImportBanner(null), 5000)
        }

        // Strip _0n_meta before importing to canvas
        const { _0n_meta, ...workflow } = raw
        void _0n_meta
        const result = importWorkflow(workflow as DotOnWorkflow)
        dispatch({ type: 'IMPORT_WORKFLOW', ...result })

        // Auto-select first node so config panel opens immediately
        if (result.nodes.length > 0) {
          setTimeout(() => {
            dispatch({ type: 'SELECT_NODE', nodeId: result.nodes[0].id })
          }, 100)
        }

        // Switch to simple view after import if available
        if (onToggleView && viewMode === 'canvas') {
          setTimeout(() => onToggleView(), 200)
        }

        // Show success banner
        const stepCount = result.nodes.length
        const name = workflow.name || file.name.replace(/\.0n$/, '')
        setImportBanner({
          message: `Imported "${name}" — ${stepCount} step${stepCount !== 1 ? 's' : ''} loaded`,
          type: 'success',
        })
        setTimeout(() => setImportBanner(null), 4000)
      } catch {
        setImportBanner({ message: 'Invalid file. Could not parse as a .0n workflow.', type: 'warning' })
        setTimeout(() => setImportBanner(null), 5000)
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

  function handleAIToggle() {
    if (!aiChatOpen && !user) {
      requireAuth('ai', 'Sign in to use the AI Builder. It uses your Anthropic API key from your credential vault.')
      return
    }
    onToggleAIChat()
  }

  return (
    <>
      <div className="builder-toolbar">
        <div className="builder-toolbar-group">
          {/* Palette toggle (useful on all sizes) */}
          {onTogglePalette && (
            <button
              className="builder-toolbar-btn"
              onClick={onTogglePalette}
              title="Toggle service palette"
            >
              +
            </button>
          )}
          <button
            className="builder-toolbar-btn"
            onClick={() => dispatch({ type: 'UNDO' })}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            Undo
          </button>
          <button
            className="builder-toolbar-btn"
            onClick={() => dispatch({ type: 'REDO' })}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            Redo
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
          <button className="builder-toolbar-btn" onClick={handleImport}>
            Import .0n
          </button>
          <button className="builder-toolbar-btn accent" onClick={handleExport}>
            Export .0n
          </button>
          <button
            className={`builder-toolbar-btn ${saveStatus === 'saved' ? 'saved' : saveStatus === 'error' ? 'danger' : ''}`}
            onClick={handleSaveToCloud}
            disabled={saving || nodes.length === 0}
          >
            {saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save'}
          </button>
          <button
            className="builder-toolbar-btn danger"
            onClick={() => {
              if (selectedNodeId) dispatch({ type: 'DELETE_NODE', nodeId: selectedNodeId })
            }}
            disabled={!selectedNodeId}
            title="Delete selected step (Del)"
          >
            Delete
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
          {onToggleView && (
            <button
              className={`builder-toolbar-btn ${viewMode === 'simple' ? 'active' : ''}`}
              onClick={onToggleView}
              title={viewMode === 'simple' ? 'Switch to Canvas view' : 'Switch to Simple view'}
              style={viewMode === 'simple' ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
            >
              {viewMode === 'simple' ? 'Canvas' : 'Simple'}
            </button>
          )}
          {onOpenWizard && (
            <button
              className="builder-toolbar-btn ai"
              onClick={onOpenWizard}
              title="Open AI Flow Wizard"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              AI Wizard
            </button>
          )}
          <button
            className={`builder-toolbar-btn ${aiChatOpen ? 'active' : ''}`}
            onClick={handleAIToggle}
            style={aiChatOpen ? { borderColor: 'rgba(126,217,87,0.4)', color: '#6EE05A' } : {}}
          >
            AI Chat
          </button>
          {onToggleTerminal && (
            <button
              className={`builder-toolbar-btn ${terminalOpen ? 'active' : ''}`}
              onClick={onToggleTerminal}
              title="Toggle terminal panel"
              style={terminalOpen ? { borderColor: 'rgba(0,255,102,0.3)', color: '#00ff66' } : {}}
            >
              Terminal
            </button>
          )}
          <button
            className="builder-toolbar-btn"
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Import notification banner */}
      {importBanner && (
        <div
          className="builder-import-banner"
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid var(--border)',
            animation: 'modalSlideIn 0.2s ease-out',
            backgroundColor: importBanner.type === 'success'
              ? 'rgba(110, 224, 90, 0.1)'
              : importBanner.type === 'warning'
              ? 'rgba(255, 68, 68, 0.1)'
              : 'rgba(0, 212, 255, 0.1)',
            color: importBanner.type === 'success'
              ? '#6EE05A'
              : importBanner.type === 'warning'
              ? '#ff4444'
              : '#00d4ff',
          }}
        >
          <span>{importBanner.type === 'success' ? '\u2713' : importBanner.type === 'warning' ? '\u26A0' : '\u24D8'}</span>
          <span style={{ flex: 1 }}>{importBanner.message}</span>
          <button
            onClick={() => setImportBanner(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 14 }}
          >
            &times;
          </button>
        </div>
      )}

      <LoginModal
        open={loginOpen}
        onClose={() => { setLoginOpen(false); setPendingAction(null) }}
        onSuccess={handleLoginSuccess}
        message={loginMessage}
      />
    </>
  )
}
