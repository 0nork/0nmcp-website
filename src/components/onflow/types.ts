import type { WorkflowSettings, DotOnWorkflow, DotOnStep } from '../builder/types'

export type { WorkflowSettings, DotOnWorkflow, DotOnStep }

export interface OnFlowStep {
  id: string
  type: 'trigger' | 'action' | 'delay' | 'condition'
  serviceId: string
  serviceName: string
  serviceLogo: string
  toolId: string
  toolName: string
  description: string
  inputs: Record<string, string>
  outputs: Record<string, string>
  condition: string
  onFail: 'halt' | 'skip' | 'retry:1' | 'retry:2' | 'retry:3'
  timeout: number
  parallelGroup: string
  status: 'idle' | 'success' | 'error' | 'running'
  color: string
}

export interface DataVariable {
  key: string
  label: string
  sourceStepId: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
}

export interface AISuggestion {
  id: string
  title: string
  description: string
  serviceId: string
  toolId: string
  matchPercent: number
  dataVariables: string[]
}

export interface OnFlowState {
  steps: OnFlowStep[]
  settings: WorkflowSettings
  selectedStepId: string | null
  stepCounter: number
  mode: 'empty' | 'building'
  testRunning: boolean
  testResults: Record<string, 'success' | 'error' | 'pending'>
}

export type OnFlowAction =
  | { type: 'ADD_STEP'; step: OnFlowStep }
  | { type: 'REMOVE_STEP'; stepId: string }
  | { type: 'MOVE_STEP'; stepId: string; direction: 'up' | 'down' }
  | { type: 'REORDER_STEPS'; fromIndex: number; toIndex: number }
  | { type: 'UPDATE_STEP'; stepId: string; data: Partial<OnFlowStep> }
  | { type: 'SELECT_STEP'; stepId: string | null }
  | { type: 'SET_MODE'; mode: 'empty' | 'building' }
  | { type: 'IMPORT_WORKFLOW'; steps: OnFlowStep[]; settings: WorkflowSettings; stepCounter: number }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_TEST_STATUS'; stepId: string; status: 'success' | 'error' | 'pending' }
  | { type: 'SET_TEST_RUNNING'; running: boolean }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<WorkflowSettings> }

export interface TriggerDefinition {
  id: string
  label: string
  description: string
  color: string
  icon: string
  logo?: string
  serviceId: string
  defaultTool: string
  outputVariables: { key: string; label: string; type: DataVariable['type'] }[]
}

export interface ActionDefinition {
  id: string
  label: string
  description: string
  color: string
  icon: string
  serviceId: string
  defaultTool: string
  inputFields: { key: string; label: string; placeholder: string }[]
}

export interface ServiceActionEntry {
  id: string
  name: string
  serviceId: string
  serviceName: string
  logo: string
  color: string
}

export interface ServiceActionGroup {
  category: string
  services: {
    id: string
    name: string
    logo: string
    color: string
    tools: { id: string; name: string }[]
  }[]
}
