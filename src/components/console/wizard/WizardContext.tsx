'use client'

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react'
import type { WizardTemplate } from '@/data/wizard-templates'
import type { WizardTrigger, TriggerDefinition } from '@/data/wizard-triggers'

/* ─── Step definitions ──────────────────────────── */

export type WizardStep =
  | 'landing'
  | 'trigger'
  | 'thinking'
  | 'actions'
  | 'notifications'
  | 'frequency'
  | 'building'
  | 'credentials'
  | 'completion'

/** Ordered step keys used by the progress bar and navigation logic. */
export const WIZARD_STEPS: WizardStep[] = [
  'landing',
  'trigger',
  'actions',
  'notifications',
  'frequency',
  'building',
  'credentials',
  'completion',
]

/* ─── Chat message type ─────────────────────────── */

export interface WizardChatMessage {
  role: 'user' | 'assistant'
  text: string
  suggestions?: string[]
  timestamp?: string
}

/* ─── Build step type ───────────────────────────── */

export interface BuildStep {
  label: string
  status: 'pending' | 'building' | 'done'
}

/* ─── State ─────────────────────────────────────── */

export interface WizardState {
  step: WizardStep
  template: WizardTemplate | null
  trigger: WizardTrigger | null
  selectedServices: string[]
  description: string
  notifications: string[]
  frequency: string | null
  customCron: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generatedWorkflow: Record<string, any> | null
  credentialQueue: string[]
  buildSteps: BuildStep[]
  aiMessages: WizardChatMessage[]

  /* Backward-compat fields used by existing step components */
  previousStep: WizardStep | null
  actions: string[]
  actionDescription: string
  currentCredIndex: number
  isThinking: boolean
  thinkingNextStep: WizardStep | null
  buildProgress: { label: string; status: 'pending' | 'building' | 'complete' }[]
  error: string | null
}

/* ─── Actions ───────────────────────────────────── */

export type WizardAction =
  | { type: 'SET_TEMPLATE'; template: WizardTemplate }
  | { type: 'SET_TRIGGER'; trigger: WizardTrigger }
  | { type: 'SET_SERVICES'; services: string[] }
  | { type: 'SET_DESCRIPTION'; description: string }
  | { type: 'TOGGLE_NOTIFICATION'; channel: string }
  | { type: 'SET_FREQUENCY'; frequency: string | { type: string; cron?: string } }
  | { type: 'SET_CUSTOM_CRON'; cron: string }
  | { type: 'SET_BUILD_STEPS'; steps: BuildStep[] }
  | { type: 'UPDATE_BUILD_STEP'; index: number; status: BuildStep['status'] }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: 'SET_GENERATED_WORKFLOW'; workflow: Record<string, any>; credentialQueue?: string[] }
  | { type: 'SET_CREDENTIAL_QUEUE'; queue: string[] }
  | { type: 'ADD_AI_MESSAGE'; message: WizardChatMessage }
  | { type: 'SET_AI_MESSAGES'; messages: WizardChatMessage[] }
  | { type: 'GO_TO_STEP'; step: WizardStep }
  | { type: 'GO_BACK' }
  | { type: 'RESET' }
  /* Backward-compat actions used by existing step components */
  | { type: 'SELECT_TEMPLATE'; template: WizardTemplate }
  | { type: 'START_FROM_SCRATCH' }
  | { type: 'SELECT_TRIGGER'; trigger: TriggerDefinition }
  | { type: 'SET_ACTIONS'; actions: string[] }
  | { type: 'SET_ACTION_DESCRIPTION'; description: string }
  | { type: 'SET_NOTIFICATIONS'; notifications: string[] }
  | { type: 'START_THINKING'; nextStep: WizardStep }
  | { type: 'FINISH_THINKING' }
  | { type: 'UPDATE_BUILD_PROGRESS'; stepIndex: number; status: 'pending' | 'building' | 'complete' }
  | { type: 'CREDENTIAL_COMPLETE' }
  | { type: 'SET_ERROR'; error: string }

/* ─── Initial state ─────────────────────────────── */

const initialState: WizardState = {
  step: 'landing',
  template: null,
  trigger: null,
  selectedServices: [],
  description: '',
  notifications: [],
  frequency: null,
  customCron: '',
  generatedWorkflow: null,
  credentialQueue: [],
  buildSteps: [],
  aiMessages: [],

  previousStep: null,
  actions: [],
  actionDescription: '',
  currentCredIndex: 0,
  isThinking: false,
  thinkingNextStep: null,
  buildProgress: [],
  error: null,
}

/* ─── Step navigation helpers ───────────────────── */

function previousStepOf(current: WizardStep): WizardStep | null {
  const idx = WIZARD_STEPS.indexOf(current)
  return idx > 0 ? WIZARD_STEPS[idx - 1] : null
}

/* ─── Reducer ───────────────────────────────────── */

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    /* ── New spec actions ──────────────────────── */

    case 'SET_TEMPLATE':
      return {
        ...state,
        template: action.template,
        selectedServices: action.template.services,
        actions: action.template.services,
        previousStep: state.step,
        step: 'trigger',
        error: null,
      }

    case 'SET_TRIGGER':
      return {
        ...state,
        trigger: action.trigger as WizardTrigger,
        previousStep: state.step,
        error: null,
      }

    case 'SET_SERVICES':
      return {
        ...state,
        selectedServices: action.services,
        actions: action.services,
        error: null,
      }

    case 'SET_DESCRIPTION':
      return {
        ...state,
        description: action.description,
        actionDescription: action.description,
        error: null,
      }

    case 'TOGGLE_NOTIFICATION': {
      const channel = action.channel
      const current = state.notifications
      const updated = current.includes(channel)
        ? current.filter((c) => c !== channel)
        : [...current, channel]
      return {
        ...state,
        notifications: updated,
        error: null,
      }
    }

    case 'SET_FREQUENCY': {
      /* Accept both string ("daily") and object ({ type: "cron", cron: "..." }) */
      const freq = typeof action.frequency === 'string'
        ? action.frequency
        : action.frequency.type
      const cron = typeof action.frequency === 'object' ? action.frequency.cron : undefined
      return {
        ...state,
        frequency: freq,
        customCron: cron || state.customCron,
        error: null,
      }
    }

    case 'SET_CUSTOM_CRON':
      return {
        ...state,
        customCron: action.cron,
        error: null,
      }

    case 'SET_BUILD_STEPS':
      return {
        ...state,
        buildSteps: action.steps,
        buildProgress: action.steps.map((s) => ({
          label: s.label,
          status: s.status === 'done' ? 'complete' : s.status,
        })),
      }

    case 'UPDATE_BUILD_STEP':
      return {
        ...state,
        buildSteps: state.buildSteps.map((s, i) =>
          i === action.index ? { ...s, status: action.status } : s
        ),
        buildProgress: state.buildSteps.map((s, i) => {
          const st = i === action.index ? action.status : s.status
          return { label: s.label, status: st === 'done' ? 'complete' : st }
        }),
      }

    case 'SET_GENERATED_WORKFLOW': {
      const creds = action.credentialQueue || state.credentialQueue
      return {
        ...state,
        generatedWorkflow: action.workflow,
        credentialQueue: creds,
        currentCredIndex: 0,
        previousStep: state.step,
        step: creds.length > 0 ? 'credentials' : 'completion',
        buildSteps: state.buildSteps.map((s) => ({ ...s, status: 'done' as const })),
        buildProgress: state.buildProgress.map((p) => ({
          ...p,
          status: 'complete' as const,
        })),
        error: null,
      }
    }

    case 'SET_CREDENTIAL_QUEUE':
      return {
        ...state,
        credentialQueue: action.queue,
      }

    case 'ADD_AI_MESSAGE':
      return {
        ...state,
        aiMessages: [...state.aiMessages, action.message],
      }

    case 'SET_AI_MESSAGES':
      return {
        ...state,
        aiMessages: action.messages,
      }

    case 'GO_TO_STEP':
      return {
        ...state,
        previousStep: state.step,
        step: action.step,
        isThinking: false,
        thinkingNextStep: null,
        error: null,
      }

    case 'GO_BACK': {
      const prev = state.previousStep || previousStepOf(state.step)
      if (!prev) return state
      return {
        ...state,
        step: prev,
        previousStep: null,
        isThinking: false,
        thinkingNextStep: null,
        error: null,
      }
    }

    case 'RESET':
      return { ...initialState }

    /* ── Backward-compat actions ───────────────── */

    case 'SELECT_TEMPLATE':
      return {
        ...state,
        template: action.template,
        selectedServices: action.template.services || [],
        actions: (action.template as any).defaultActions || action.template.services || [],
        notifications: (action.template as any).defaultNotifications || [],
        previousStep: state.step,
        step: 'trigger',
        error: null,
      }

    case 'START_FROM_SCRATCH':
      return {
        ...state,
        template: null,
        previousStep: state.step,
        step: 'trigger',
        error: null,
      }

    case 'SELECT_TRIGGER':
      return {
        ...state,
        trigger: action.trigger as WizardTrigger,
        previousStep: state.step,
        error: null,
      }

    case 'SET_ACTIONS':
      return {
        ...state,
        actions: action.actions,
        selectedServices: action.actions,
        error: null,
      }

    case 'SET_ACTION_DESCRIPTION':
      return {
        ...state,
        actionDescription: action.description,
        description: action.description,
        error: null,
      }

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.notifications,
        error: null,
      }

    case 'START_THINKING':
      return {
        ...state,
        previousStep: state.step,
        step: action.nextStep,
        isThinking: true,
        thinkingNextStep: action.nextStep,
        error: null,
      }

    case 'FINISH_THINKING':
      return {
        ...state,
        step: state.thinkingNextStep || 'actions',
        isThinking: false,
        thinkingNextStep: null,
      }

    case 'UPDATE_BUILD_PROGRESS':
      return {
        ...state,
        buildProgress: state.buildProgress.map((p, i) =>
          i === action.stepIndex ? { ...p, status: action.status } : p
        ),
        buildSteps: state.buildSteps.map((s, i) =>
          i === action.stepIndex
            ? { ...s, status: action.status === 'complete' ? 'done' : action.status }
            : s
        ),
      }

    case 'CREDENTIAL_COMPLETE': {
      const nextIdx = state.currentCredIndex + 1
      const allDone = nextIdx >= state.credentialQueue.length
      return {
        ...state,
        currentCredIndex: nextIdx,
        step: allDone ? 'completion' : 'credentials',
      }
    }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
      }

    default:
      return state
  }
}

/* ─── Context ───────────────────────────────────── */

const WizardStateContext = createContext<WizardState | null>(null)
const WizardDispatchContext = createContext<Dispatch<WizardAction> | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  return (
    <WizardStateContext.Provider value={state}>
      <WizardDispatchContext.Provider value={dispatch}>
        {children}
      </WizardDispatchContext.Provider>
    </WizardStateContext.Provider>
  )
}

/** Read wizard state. Must be called within a WizardProvider. */
export function useWizard(): WizardState {
  const ctx = useContext(WizardStateContext)
  if (!ctx) throw new Error('useWizard must be used within a WizardProvider')
  return ctx
}

/** Dispatch wizard actions. Must be called within a WizardProvider. */
export function useWizardDispatch(): Dispatch<WizardAction> {
  const ctx = useContext(WizardDispatchContext)
  if (!ctx) throw new Error('useWizardDispatch must be used within a WizardProvider')
  return ctx
}
