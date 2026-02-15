import type { Node, Edge } from '@xyflow/react'

export interface StepNodeData {
  stepId: string
  serviceId: string
  serviceName: string
  serviceIcon: string
  serviceLogo: string
  toolId: string
  toolName: string
  inputs: Record<string, string>
  outputs: Record<string, string>
  condition: string
  onFail: 'halt' | 'skip' | 'retry:1' | 'retry:2' | 'retry:3'
  timeout: number
  parallelGroup: string
  [key: string]: unknown
}

export type StepNode = Node<StepNodeData, 'stepNode'>

export interface WorkflowSettings {
  name: string
  description: string
  author: string
  env: Record<string, string>
  variables: Record<string, string>
  onComplete: 'notify' | 'log' | 'webhook'
  metadata: {
    pipeline: string
    environment: string
    tags: string[]
  }
}

export interface DotOnStep {
  id: string
  name: string
  mcp_server: string
  tool: string
  inputs?: Record<string, string>
  outputs?: Record<string, string>
  depends_on?: string[]
  condition?: string
  on_fail?: string
  timeout?: number
  parallel_group?: string
}

export interface DotOnWorkflow {
  name: string
  version: string
  description: string
  author: string
  env?: Record<string, string>
  variables?: Record<string, string>
  on_complete?: string
  metadata?: {
    pipeline?: string
    environment?: string
    tags?: string[]
  }
  steps: DotOnStep[]
}

export interface BuilderState {
  nodes: StepNode[]
  edges: Edge[]
  settings: WorkflowSettings
  selectedNodeId: string | null
  stepCounter: number
  settingsOpen: boolean
}

export type BuilderAction =
  | { type: 'SET_NODES'; nodes: StepNode[] }
  | { type: 'SET_EDGES'; edges: Edge[] }
  | { type: 'ADD_NODE'; node: StepNode }
  | { type: 'SELECT_NODE'; nodeId: string | null }
  | { type: 'UPDATE_NODE_DATA'; nodeId: string; data: Partial<StepNodeData> }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<WorkflowSettings> }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'CLEAR_CANVAS' }
  | {
      type: 'IMPORT_WORKFLOW'
      nodes: StepNode[]
      edges: Edge[]
      settings: WorkflowSettings
      stepCounter: number
    }
