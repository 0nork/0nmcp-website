'use client'

import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './builder.css'

import { BuilderProvider } from './BuilderContext'
import ServicePalette from './ServicePalette'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import ConfigPanel from './ConfigPanel'
import WorkflowSettingsModal from './WorkflowSettingsModal'
import AIChat from './AIChat'

export default function BuilderApp() {
  const [aiChatOpen, setAiChatOpen] = useState(false)

  return (
    <BuilderProvider>
      <ReactFlowProvider>
        <div className="builder-layout">
          <ServicePalette />
          <div className="builder-canvas-area">
            <Toolbar
              aiChatOpen={aiChatOpen}
              onToggleAIChat={() => setAiChatOpen(!aiChatOpen)}
            />
            <Canvas />
          </div>
          <ConfigPanel />
          {aiChatOpen && (
            <AIChat open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
          )}
        </div>
        <WorkflowSettingsModal />
      </ReactFlowProvider>
    </BuilderProvider>
  )
}
