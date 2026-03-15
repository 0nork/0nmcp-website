import { useMemo } from 'react'
import type { OnFlowStep, AISuggestion } from '../types'
import { SERVICE_LOGOS } from '@/components/builder/ServicePalette'
import { getServiceById } from '@/lib/sxo-helpers'

// Natural complement map: which services naturally pair together
const COMPLEMENTS: Record<string, string[]> = {
  crm: ['sendgrid', 'slack', 'twilio', 'gmail', 'google_sheets'],
  stripe: ['sendgrid', 'slack', 'supabase', 'crm', 'gmail'],
  github: ['slack', 'discord', 'linear', 'jira'],
  shopify: ['sendgrid', 'stripe', 'slack', 'crm'],
  sendgrid: ['crm', 'slack', 'supabase'],
  gmail: ['crm', 'slack', 'google_sheets'],
  slack: ['crm', 'github', 'linear', 'gmail'],
  twilio: ['crm', 'sendgrid', 'slack'],
  supabase: ['sendgrid', 'slack', 'stripe'],
  instagram: ['slack', 'crm', 'google_sheets'],
  twitter: ['slack', 'crm', 'discord'],
  linkedin: ['crm', 'slack', 'gmail'],
  whatsapp: ['crm', 'slack', 'twilio'],
  discord: ['github', 'slack', 'linear'],
  anthropic: ['gmail', 'slack', 'crm'],
  openai: ['gmail', 'slack', 'crm'],
}

export function useAISuggestions(steps: OnFlowStep[]): AISuggestion[] {
  return useMemo(() => {
    if (steps.length === 0) return []

    const lastStep = steps[steps.length - 1]
    const usedServices = new Set(steps.map((s) => s.serviceId))

    // Get complement services that have real logos
    const complements = COMPLEMENTS[lastStep.serviceId] ?? []
    const candidates: { serviceId: string; toolId: string; toolName: string; serviceName: string; score: number }[] = []

    for (const sid of complements) {
      if (usedServices.has(sid)) continue
      if (!SERVICE_LOGOS[sid]) continue

      const svc = getServiceById(sid)
      if (!svc?.tools?.length) continue

      // Pick the first tool as the suggestion
      const tool = svc.tools[0] as { id: string; name: string }
      candidates.push({
        serviceId: sid,
        toolId: tool.id,
        toolName: tool.name,
        serviceName: svc.name,
        score: 85,
      })
    }

    // Sort by score, take top 3
    candidates.sort((a, b) => b.score - a.score)

    return candidates.slice(0, 3).map((item, i) => ({
      id: `suggestion_${i}`,
      title: `${item.toolName} via ${item.serviceName}`,
      description: `Use ${item.serviceName} to ${item.toolName.toLowerCase()}`,
      serviceId: item.serviceId,
      toolId: item.toolId,
      matchPercent: Math.min(item.score, 100),
      dataVariables: [],
    }))
  }, [steps])
}
