'use client'

import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react'
import type { BuilderState, BuilderAction, WorkflowSettings, StepNode } from './types'
import type { Edge } from '@xyflow/react'

const defaultSettings: WorkflowSettings = {
  name: 'my-workflow',
  description: '',
  author: '',
  env: {},
  variables: {},
  onComplete: 'log',
  metadata: { pipeline: '', environment: '', tags: [] },
}

const initialState: BuilderState = {
  nodes: [],
  edges: [],
  settings: defaultSettings,
  selectedNodeId: null,
  stepCounter: 1,
  settingsOpen: false,
}

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, nodes: action.nodes }
    case 'SET_EDGES':
      return { ...state, edges: action.edges }
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, action.node],
        stepCounter: state.stepCounter + 1,
      }
    case 'SELECT_NODE':
      return { ...state, selectedNodeId: action.nodeId }
    case 'UPDATE_NODE_DATA':
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.nodeId
            ? { ...n, data: { ...n.data, ...action.data } }
            : n
        ) as StepNode[],
      }
    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter((n) => n.id !== action.nodeId),
        edges: state.edges.filter(
          (e) => e.source !== action.nodeId && e.target !== action.nodeId
        ),
        selectedNodeId:
          state.selectedNodeId === action.nodeId ? null : state.selectedNodeId,
      }
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      }
    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen }
    case 'CLEAR_CANVAS':
      return {
        ...state,
        nodes: [],
        edges: [],
        selectedNodeId: null,
        stepCounter: 1,
      }
    case 'IMPORT_WORKFLOW':
      return {
        ...state,
        nodes: action.nodes,
        edges: action.edges,
        settings: action.settings,
        stepCounter: action.stepCounter,
        selectedNodeId: null,
        settingsOpen: false,
      }
    default:
      return state
  }
}

const BuilderContext = createContext<BuilderState>(initialState)
const BuilderDispatchContext = createContext<Dispatch<BuilderAction>>(() => {})

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(builderReducer, initialState)
  return (
    <BuilderContext.Provider value={state}>
      <BuilderDispatchContext.Provider value={dispatch}>
        {children}
      </BuilderDispatchContext.Provider>
    </BuilderContext.Provider>
  )
}

export function useBuilder() {
  return useContext(BuilderContext)
}

export function useBuilderDispatch() {
  return useContext(BuilderDispatchContext)
}
