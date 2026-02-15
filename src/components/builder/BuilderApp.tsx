'use client'

import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './builder.css'

import { BuilderProvider } from './BuilderContext'
import ServicePalette from './ServicePalette'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import ConfigPanel from './ConfigPanel'
import WorkflowSettingsModal from './WorkflowSettingsModal'

export default function BuilderApp() {
  return (
    <BuilderProvider>
      <ReactFlowProvider>
        <div className="builder-layout">
          <ServicePalette />
          <div className="builder-canvas-area">
            <Toolbar />
            <Canvas />
          </div>
          <ConfigPanel />
        </div>
        <WorkflowSettingsModal />
      </ReactFlowProvider>
    </BuilderProvider>
  )
}
