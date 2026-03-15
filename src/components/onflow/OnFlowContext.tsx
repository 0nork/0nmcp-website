'use client'

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode, type Dispatch } from 'react'
import type { OnFlowState, OnFlowAction, WorkflowSettings, OnFlowStep } from './types'

const STORAGE_KEY = '0nflow-autosave'
const IMPORT_KEY = '0nmcp-builder-import'
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

const initialState: OnFlowState = {
  steps: [],
  settings: defaultSettings,
  selectedStepId: null,
  stepCounter: 1,
  mode: 'empty',
  testRunning: false,
  testResults: {},
}

function onflowReducer(state: OnFlowState, action: OnFlowAction): OnFlowState {
  switch (action.type) {
    case 'ADD_STEP':
      return {
        ...state,
        steps: [...state.steps, action.step],
        stepCounter: state.stepCounter + 1,
        mode: 'building',
      }
    case 'REMOVE_STEP': {
      const newSteps = state.steps.filter((s) => s.id !== action.stepId)
      return {
        ...state,
        steps: newSteps,
        selectedStepId: state.selectedStepId === action.stepId ? null : state.selectedStepId,
        mode: newSteps.length === 0 ? 'empty' : 'building',
      }
    }
    case 'MOVE_STEP': {
      const idx = state.steps.findIndex((s) => s.id === action.stepId)
      if (idx < 0) return state
      const newIdx = action.direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= state.steps.length) return state
      const arr = [...state.steps]
      ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
      return { ...state, steps: arr }
    }
    case 'UPDATE_STEP':
      return {
        ...state,
        steps: state.steps.map((s) =>
          s.id === action.stepId ? { ...s, ...action.data } : s
        ),
      }
    case 'SELECT_STEP':
      return { ...state, selectedStepId: action.stepId }
    case 'SET_MODE':
      return { ...state, mode: action.mode }
    case 'IMPORT_WORKFLOW':
      return {
        ...state,
        steps: action.steps,
        settings: action.settings,
        stepCounter: action.stepCounter,
        selectedStepId: null,
        mode: action.steps.length > 0 ? 'building' : 'empty',
        testResults: {},
      }
    case 'CLEAR_ALL':
      return {
        ...state,
        steps: [],
        selectedStepId: null,
        stepCounter: 1,
        mode: 'empty',
        testRunning: false,
        testResults: {},
      }
    case 'SET_TEST_STATUS':
      return {
        ...state,
        testResults: { ...state.testResults, [action.stepId]: action.status },
      }
    case 'SET_TEST_RUNNING':
      return { ...state, testRunning: action.running }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }
    default:
      return state
  }
}

/* ── History wrapper for undo/redo ── */

interface HistoryState {
  current: OnFlowState
  past: OnFlowState[]
  future: OnFlowState[]
}

type HistoryAction =
  | OnFlowAction
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'HYDRATE'; state: OnFlowState }

const UNDOABLE: OnFlowAction['type'][] = [
  'ADD_STEP', 'REMOVE_STEP', 'MOVE_STEP', 'UPDATE_STEP',
  'CLEAR_ALL', 'IMPORT_WORKFLOW', 'UPDATE_SETTINGS',
]

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
      const flowAction = action as OnFlowAction
      const newState = onflowReducer(state.current, flowAction)
      if (newState === state.current) return state
      if (UNDOABLE.includes(flowAction.type)) {
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

interface OnFlowContextValue extends OnFlowState {
  canUndo: boolean
  canRedo: boolean
}

const OnFlowCtx = createContext<OnFlowContextValue>({
  ...initialState,
  canUndo: false,
  canRedo: false,
})
const OnFlowDispatchCtx = createContext<Dispatch<HistoryAction>>(() => {})

export function OnFlowProvider({ children }: { children: ReactNode }) {
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
        const parsed = JSON.parse(saved) as OnFlowState
        if (parsed.steps && Array.isArray(parsed.steps)) {
          dispatch({ type: 'HYDRATE', state: parsed })
        }
      }
    } catch {
      // ignore
    }
    hydrated.current = true
  }, [])

  // Check for store import via localStorage bridge
  useEffect(() => {
    try {
      const raw = localStorage.getItem(IMPORT_KEY)
      if (raw) {
        localStorage.removeItem(IMPORT_KEY)
        const workflowData = JSON.parse(raw)
        import('../onflow/hooks/useOnFlowImport').then(({ importToOnFlow }) => {
          const result = importToOnFlow(workflowData)
          dispatch({
            type: 'IMPORT_WORKFLOW',
            steps: result.steps,
            settings: result.settings,
            stepCounter: result.stepCounter,
          })
        })
      }
    } catch {
      // ignore
    }
  }, [])

  // Autosave
  useEffect(() => {
    if (!hydrated.current) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.current))
      } catch {
        // storage full
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [history.current])

  const contextValue: OnFlowContextValue = {
    ...history.current,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }

  return (
    <OnFlowCtx.Provider value={contextValue}>
      <OnFlowDispatchCtx.Provider value={dispatch}>
        {children}
      </OnFlowDispatchCtx.Provider>
    </OnFlowCtx.Provider>
  )
}

export function useOnFlow() {
  return useContext(OnFlowCtx)
}

export function useOnFlowDispatch() {
  return useContext(OnFlowDispatchCtx)
}
