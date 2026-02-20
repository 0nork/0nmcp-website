'use client'

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode, type Dispatch } from 'react'
import type { BuilderState, BuilderAction, WorkflowSettings, StepNode } from './types'
import type { Edge } from '@xyflow/react'

const STORAGE_KEY = '0nmcp-builder-autosave'
const MAX_HISTORY = 40

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

/* ── History wrapper for undo/redo ── */

interface HistoryState {
  current: BuilderState
  past: BuilderState[]
  future: BuilderState[]
}

type HistoryAction =
  | BuilderAction
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'HYDRATE'; state: BuilderState }

function isUndoable(action: BuilderAction): boolean {
  // Only track state-mutating actions in history
  const tracked: BuilderAction['type'][] = [
    'ADD_NODE', 'DELETE_NODE', 'SET_NODES', 'SET_EDGES',
    'UPDATE_NODE_DATA', 'CLEAR_CANVAS', 'IMPORT_WORKFLOW', 'UPDATE_SETTINGS',
  ]
  return tracked.includes(action.type)
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

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        current: previous,
        future: [state.current, ...state.future],
      }
    }
    case 'REDO': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        past: [...state.past, state.current],
        current: next,
        future: state.future.slice(1),
      }
    }
    case 'HYDRATE':
      return { past: [], current: action.state, future: [] }
    default: {
      const builderAction = action as BuilderAction
      const newState = builderReducer(state.current, builderAction)
      if (newState === state.current) return state

      if (isUndoable(builderAction)) {
        return {
          past: [...state.past.slice(-MAX_HISTORY), state.current],
          current: newState,
          future: [],
        }
      }
      return { ...state, current: newState }
    }
  }
}

/* ── Context ── */

interface BuilderContextValue extends BuilderState {
  canUndo: boolean
  canRedo: boolean
}

const BuilderContext = createContext<BuilderContextValue>({
  ...initialState,
  canUndo: false,
  canRedo: false,
})
const BuilderDispatchContext = createContext<Dispatch<HistoryAction>>(() => {})

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    current: initialState,
    future: [],
  })

  const hydrated = useRef(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as BuilderState
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          dispatch({ type: 'HYDRATE', state: parsed })
        }
      }
    } catch {
      // ignore corrupt storage
    }
    hydrated.current = true
  }, [])

  // Autosave to localStorage on changes (debounced)
  useEffect(() => {
    if (!hydrated.current) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.current))
      } catch {
        // storage full — silently ignore
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [history.current])

  const contextValue: BuilderContextValue = {
    ...history.current,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }

  return (
    <BuilderContext.Provider value={contextValue}>
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
