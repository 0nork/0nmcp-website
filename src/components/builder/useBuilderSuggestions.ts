'use client'

import { useMemo } from 'react'
import type { StepNode } from './types'
import type { Edge } from '@xyflow/react'

export interface BuilderSuggestion {
  id: string
  text: string
  description: string
  action: 'add_service' | 'ai_prompt' | 'import' | 'template' | 'export' | 'toggle_view'
  payload?: string
  color: string
  icon: string // emoji
}

interface SuggestionInput {
  nodes: StepNode[]
  edges: Edge[]
  viewMode: 'canvas' | 'simple'
}

const SERVICE_SUGGESTIONS: Record<string, { text: string; description: string; color: string }> = {
  crm: { text: 'Add CRM step', description: 'Create or update contacts, trigger workflows', color: '#6EE05A' },
  stripe: { text: 'Add Stripe step', description: 'Process payments, create invoices', color: '#635bff' },
  slack: { text: 'Add Slack notification', description: 'Send messages to channels or users', color: '#e01e5a' },
  sendgrid: { text: 'Add email step', description: 'Send transactional or marketing emails', color: '#00b2e3' },
  supabase: { text: 'Add database step', description: 'Query, insert, or update records', color: '#3ecf8e' },
  openai: { text: 'Add AI processing', description: 'Generate text, analyze data, classify inputs', color: '#10a37f' },
  github: { text: 'Add GitHub step', description: 'Create issues, update repos, manage PRs', color: '#8b5cf6' },
  google_sheets: { text: 'Add Sheets step', description: 'Read/write spreadsheet data', color: '#34a853' },
}

export function useBuilderSuggestions({ nodes, edges, viewMode }: SuggestionInput): BuilderSuggestion[] {
  return useMemo(() => {
    const suggestions: BuilderSuggestion[] = []
    const usedServices = new Set(nodes.map(n => n.data.serviceId))
    const stepCount = nodes.length

    // === EMPTY CANVAS ===
    if (stepCount === 0) {
      suggestions.push({
        id: 'ai-describe',
        text: 'Describe what you want to build',
        description: 'Tell the AI what your workflow should do and it will generate the steps',
        action: 'ai_prompt',
        payload: '',
        color: '#6EE05A',
        icon: '✦',
      })
      suggestions.push({
        id: 'import-template',
        text: 'Import a .0n workflow',
        description: 'Load an existing workflow file from your computer',
        action: 'import',
        color: '#00d4ff',
        icon: '↑',
      })
      suggestions.push({
        id: 'template-lead-capture',
        text: 'Start with Lead Capture',
        description: 'CRM form → email notification → Slack alert',
        action: 'ai_prompt',
        payload: 'Build a lead capture workflow: when a form is submitted in CRM, send a confirmation email via SendGrid, then notify the team on Slack',
        color: '#a78bfa',
        icon: '⚡',
      })
      return suggestions
    }

    // === 1-2 STEPS — suggest connecting services ===
    if (stepCount <= 2) {
      // Suggest complementary services based on what's already there
      if (usedServices.has('crm') && !usedServices.has('sendgrid')) {
        suggestions.push({
          id: 'add-sendgrid',
          text: 'Send confirmation email',
          description: 'Email the lead after CRM capture',
          action: 'add_service',
          payload: 'sendgrid',
          color: '#00b2e3',
          icon: '✉',
        })
      }
      if (usedServices.has('crm') && !usedServices.has('slack')) {
        suggestions.push({
          id: 'add-slack',
          text: 'Notify team on Slack',
          description: 'Alert your team when a new lead comes in',
          action: 'add_service',
          payload: 'slack',
          color: '#e01e5a',
          icon: '💬',
        })
      }
      if (usedServices.has('stripe') && !usedServices.has('sendgrid')) {
        suggestions.push({
          id: 'add-receipt',
          text: 'Send payment receipt',
          description: 'Email a receipt after Stripe payment',
          action: 'add_service',
          payload: 'sendgrid',
          color: '#00b2e3',
          icon: '✉',
        })
      }

      // Suggest unused priority services
      for (const [svcId, svc] of Object.entries(SERVICE_SUGGESTIONS)) {
        if (suggestions.length >= 3) break
        if (usedServices.has(svcId)) continue
        suggestions.push({
          id: `add-${svcId}`,
          text: svc.text,
          description: svc.description,
          action: 'add_service',
          payload: svcId,
          color: svc.color,
          icon: '＋',
        })
      }
    }

    // === 3+ STEPS — suggest improvements ===
    if (stepCount >= 3) {
      // Check if workflow has no error handling
      const hasOnFail = nodes.some(n => n.data.onFail && n.data.onFail !== 'halt')
      if (!hasOnFail) {
        suggestions.push({
          id: 'add-error-handling',
          text: 'Add error handling',
          description: 'Set fallback actions if a step fails',
          action: 'ai_prompt',
          payload: 'Add error handling to my workflow — set onFail to "continue" for non-critical steps and add a Slack notification on failure',
          color: '#ff6b9d',
          icon: '🛡',
        })
      }

      // Suggest export if 3+ steps
      suggestions.push({
        id: 'export-workflow',
        text: 'Export as .0n file',
        description: `Save your ${stepCount}-step workflow as a signed .0n file`,
        action: 'export',
        color: '#6EE05A',
        icon: '↓',
      })

      // Check for disconnected nodes
      const connectedIds = new Set<string>()
      edges.forEach(e => { connectedIds.add(e.source); connectedIds.add(e.target) })
      const disconnected = nodes.filter(n => !connectedIds.has(n.id))
      if (disconnected.length > 0 && nodes.length > 1) {
        suggestions.push({
          id: 'connect-steps',
          text: 'Connect disconnected steps',
          description: `${disconnected.length} step${disconnected.length > 1 ? 's are' : ' is'} not connected to the flow`,
          action: 'ai_prompt',
          payload: 'Connect all disconnected steps in my workflow into a logical sequence',
          color: '#ffc832',
          icon: '🔗',
        })
      }
    }

    // Always offer AI help
    if (!suggestions.some(s => s.action === 'ai_prompt')) {
      suggestions.push({
        id: 'ai-improve',
        text: 'Ask AI to improve this workflow',
        description: 'Get suggestions for optimization, error handling, or new steps',
        action: 'ai_prompt',
        payload: `Analyze my ${stepCount}-step workflow and suggest improvements`,
        color: '#6EE05A',
        icon: '✦',
      })
    }

    return suggestions.slice(0, 3)
  }, [nodes, edges, viewMode])
}
