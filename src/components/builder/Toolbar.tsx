'use client'

import { useRef, useState, useEffect } from 'react'
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
}

export default function Toolbar({ aiChatOpen, onToggleAIChat }: ToolbarProps) {
  const { nodes, edges, settings } = useBuilder()
  const dispatch = useBuilderDispatch()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const [pendingAction, setPendingAction] = useState<'export' | 'import' | 'ai' | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id } : null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function requireAuth(action: 'export' | 'import' | 'ai', message: string) {
    if (user) return true
    setLoginMessage(message)
    setPendingAction(action)
    setLoginOpen(true)
    return false
  }

  function handleLoginSuccess() {
    const supabase = createSupabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id })
    })
    // Execute the pending action
    if (pendingAction === 'export') doExport()
    else if (pendingAction === 'import') fileRef.current?.click()
    else if (pendingAction === 'ai') onToggleAIChat()
    setPendingAction(null)
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
          alert(
            'IMPORT BLOCKED\n\n' +
            errors.join('\n\n') +
            '\n\nOnly .0n files created by an authorized 0nMCP system are accepted.'
          )
          return
        }

        if (warnings.length > 0) {
          const proceed = confirm(
            'Security warnings:\n\n' +
            warnings.join('\n') +
            '\n\nContinue importing?'
          )
          if (!proceed) return
        }

        // Strip _0n_meta before importing to canvas
        const { _0n_meta, ...workflow } = raw
        void _0n_meta
        const result = importWorkflow(workflow as DotOnWorkflow)
        dispatch({ type: 'IMPORT_WORKFLOW', ...result })
      } catch {
        alert('Invalid file. Could not parse as a .0n workflow.')
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
            onClick={handleAIToggle}
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

      <LoginModal
        open={loginOpen}
        onClose={() => { setLoginOpen(false); setPendingAction(null) }}
        onSuccess={handleLoginSuccess}
        message={loginMessage}
      />
    </>
  )
}
