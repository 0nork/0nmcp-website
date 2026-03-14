'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './builder.css'

import { BuilderProvider, useBuilder, useBuilderDispatch } from './BuilderContext'
import ServicePalette from './ServicePalette'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import ConfigPanel from './ConfigPanel'
import WorkflowSettingsModal from './WorkflowSettingsModal'
import AIChat from './AIChat'
import SimpleBuilderView from './SimpleBuilderView'
import BuilderSuggestions from './BuilderSuggestions'
import BuilderPrompt from './BuilderPrompt'
import { useBuilderSuggestions, type BuilderSuggestion } from './useBuilderSuggestions'
import { getServiceById } from '@/lib/sxo-helpers'
import type { StepNodeData, StepNode } from './types'

const OnTerminal = dynamic(
  () => import('@/components/terminal/OnTerminal'),
  { ssr: false }
)

function BuilderInner() {
  const { nodes, edges } = useBuilder()
  const dispatch = useBuilderDispatch()
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'canvas' | 'simple'>('simple')
  const [aiLoading, setAiLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const suggestions = useBuilderSuggestions({ nodes, edges, viewMode })

  const handleSuggestion = useCallback((s: BuilderSuggestion) => {
    switch (s.action) {
      case 'ai_prompt':
        if (s.payload) {
          // Pre-fill the AI chat with the suggestion prompt
          setAiChatOpen(true)
          // Dispatch a prefill event the AIChat can pick up
          window.dispatchEvent(new CustomEvent('builder-ai-prefill', { detail: s.payload }))
        } else {
          setAiChatOpen(true)
        }
        break
      case 'import':
        fileRef.current?.click()
        break
      case 'export':
        // Trigger export via toolbar
        window.dispatchEvent(new CustomEvent('builder-export'))
        break
      case 'add_service':
        if (s.payload) {
          const svc = getServiceById(s.payload)
          const stepNum = String(nodes.length + 1).padStart(3, '0')
          const stepId = `step_${stepNum}`
          const data: StepNodeData = {
            stepId,
            serviceId: s.payload,
            serviceName: svc?.name || s.payload,
            serviceIcon: svc?.icon || '',
            serviceLogo: '',
            toolId: '',
            toolName: '',
            inputs: {},
            outputs: {},
            condition: '',
            onFail: 'halt',
            timeout: 0,
            parallelGroup: '',
          }
          const newNode: StepNode = {
            id: stepId,
            type: 'stepNode',
            position: { x: 250, y: nodes.length * 120 + 80 },
            data,
          }
          dispatch({ type: 'ADD_NODE', node: newNode })
          // Auto-select so config opens
          setTimeout(() => dispatch({ type: 'SELECT_NODE', nodeId: stepId }), 50)
        }
        break
      case 'toggle_view':
        setViewMode(v => v === 'canvas' ? 'simple' : 'canvas')
        break
    }
  }, [dispatch, nodes.length])

  const handlePromptSubmit = useCallback((prompt: string) => {
    setAiChatOpen(true)
    // Small delay so AIChat mounts first
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('builder-ai-prefill', { detail: prompt }))
    }, 100)
  }, [])

  return (
    <div className="builder-layout" style={{ position: 'relative' }}>
      {/* Service palette — only show in canvas mode */}
      {viewMode === 'canvas' && <ServicePalette />}

      <div className="builder-canvas-area" style={{ display: 'flex', flexDirection: 'column' }}>
        <Toolbar
          aiChatOpen={aiChatOpen}
          onToggleAIChat={() => setAiChatOpen(!aiChatOpen)}
          terminalOpen={terminalOpen}
          onToggleTerminal={() => setTerminalOpen(!terminalOpen)}
          viewMode={viewMode}
          onToggleView={() => setViewMode(viewMode === 'canvas' ? 'simple' : 'canvas')}
        />

        {/* AI Prompt bar — always visible */}
        <BuilderPrompt
          onSubmit={handlePromptSubmit}
          loading={aiLoading}
          stepCount={nodes.length}
        />

        {/* Contextual AI suggestions */}
        <BuilderSuggestions
          suggestions={suggestions}
          onSelect={handleSuggestion}
        />

        {/* Main content area */}
        {viewMode === 'canvas' ? (
          <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', height: '100%' }}>
            <Canvas />
          </div>
        ) : (
          <SimpleBuilderView />
        )}

        {/* Terminal panel */}
        {terminalOpen && (
          <div style={{
            height: 260,
            flexShrink: 0,
            borderTop: '1px solid rgba(0,255,102,0.15)',
          }}>
            <OnTerminal
              height={260}
              enableNode={true}
              enablePython={true}
              packages={['0nmcp']}
            />
          </div>
        )}
      </div>

      {/* Config panel — only in canvas mode */}
      {viewMode === 'canvas' && <ConfigPanel />}

      {/* AI Chat panel */}
      {aiChatOpen && (
        <AIChat open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
      )}

      {/* Hidden file input for import suggestion */}
      <input
        ref={fileRef}
        type="file"
        accept=".0n,.json"
        onChange={(e) => {
          // Re-dispatch to toolbar's handler
          const file = e.target.files?.[0]
          if (file) {
            window.dispatchEvent(new CustomEvent('builder-import-file', { detail: file }))
          }
          e.target.value = ''
        }}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default function BuilderApp() {
  return (
    <BuilderProvider>
      <ReactFlowProvider>
        <BuilderInner />
        <WorkflowSettingsModal />
      </ReactFlowProvider>
    </BuilderProvider>
  )
}
