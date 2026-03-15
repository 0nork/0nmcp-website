'use client'

import { OnFlowProvider } from './OnFlowContext'
import OnFlowToolbar from './components/OnFlowToolbar'
import TriggerColumn from './columns/TriggerColumn'
import WorkflowColumn from './columns/WorkflowColumn'
import ActionColumn from './columns/ActionColumn'
import './onflow.css'

export default function OnFlowApp() {
  return (
    <OnFlowProvider>
      <div className="onflow-layout">
        <OnFlowToolbar />
        <div className="onflow-columns">
          <TriggerColumn />
          <WorkflowColumn />
          <ActionColumn />
        </div>
      </div>
    </OnFlowProvider>
  )
}
