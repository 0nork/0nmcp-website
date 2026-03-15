import { useMemo } from 'react'
import type { OnFlowStep, AISuggestion } from '../types'
import { getAllCapabilities, getActionServiceId } from '@/lib/sxo-helpers'

// Natural complement map: which services naturally pair together
const COMPLEMENTS: Record<string, string[]> = {
  crm: ['sendgrid', 'slack', 'twilio', 'gmail', 'google_sheets'],
  stripe: ['sendgrid', 'slack', 'supabase', 'crm'],
  github: ['slack', 'discord', 'linear', 'jira'],
  shopify: ['sendgrid', 'stripe', 'slack', 'crm'],
  sendgrid: ['crm', 'slack', 'supabase'],
  gmail: ['crm', 'slack', 'google_sheets'],
  slack: ['crm', 'github', 'linear'],
  twilio: ['crm', 'sendgrid', 'slack'],
  supabase: ['sendgrid', 'slack', 'stripe'],
}

export function useAISuggestions(steps: OnFlowStep[]): AISuggestion[] {
  return useMemo(() => {
    if (steps.length === 0) return []

    const lastStep = steps[steps.length - 1]
    const usedServices = new Set(steps.map((s) => s.serviceId))
    const caps = getAllCapabilities()

    // Filter capabilities where trigger matches last step's service
    const candidates = caps.filter((c) => {
      const actionService = getActionServiceId(c)
      if (!actionService) return false
      // Must match trigger service
      if (c.trigger_service !== lastStep.serviceId) return false
      // Exclude already-used action services
      if (usedServices.has(actionService)) return false
      return true
    })

    // Score each candidate
    const scored = candidates.map((c) => {
      const actionService = getActionServiceId(c)!
      let score = 70 // base

      // Complement bonus
      const complements = COMPLEMENTS[lastStep.serviceId] ?? []
      if (complements.includes(actionService)) score += 15

      // SXO queries overlap bonus (up to 15)
      if ('sxo_queries' in c && Array.isArray(c.sxo_queries)) {
        const queries = c.sxo_queries as string[]
        const stepWords = [lastStep.serviceName, lastStep.toolName, lastStep.description]
          .join(' ').toLowerCase().split(/\s+/)
        const overlap = queries.filter((q) =>
          stepWords.some((w) => q.toLowerCase().includes(w))
        ).length
        score += Math.min(overlap * 5, 15)
      }

      return { cap: c, actionService, score }
    })

    // Sort by score, take top 3
    scored.sort((a, b) => b.score - a.score)

    return scored.slice(0, 3).map((item, i) => ({
      id: `suggestion_${i}`,
      title: item.cap.name,
      description: item.cap.description,
      serviceId: item.actionService,
      toolId: typeof item.cap.dot_0n_config === 'string'
        ? (() => { try { return JSON.parse(item.cap.dot_0n_config).action ?? '' } catch { return '' } })()
        : '',
      matchPercent: Math.min(item.score, 100),
      dataVariables: [],
    }))
  }, [steps])
}
