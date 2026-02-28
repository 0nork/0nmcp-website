'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
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

const OnTerminal = dynamic(
  () => import('@/components/terminal/OnTerminal'),
  { ssr: false }
)

export default function BuilderApp() {
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [terminalOpen, setTerminalOpen] = useState(false)

  return (
    <BuilderProvider>
      <ReactFlowProvider>
        <div className="builder-layout" style={{ position: 'relative' }}>
          <ServicePalette />
          <div className="builder-canvas-area" style={{ display: 'flex', flexDirection: 'column' }}>
            <Toolbar
              aiChatOpen={aiChatOpen}
              onToggleAIChat={() => setAiChatOpen(!aiChatOpen)}
              terminalOpen={terminalOpen}
              onToggleTerminal={() => setTerminalOpen(!terminalOpen)}
            />
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
              <Canvas />
            </div>
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
