'use client'

import { useMemo } from 'react'
import { SVC, SERVICE_KEYS } from '@/lib/console/services'
import type { Suggestion } from './OnCallSuggestions'

// Priority order for vault suggestions
const PRIORITY_SERVICES = [
  'anthropic', 'openai', 'gemini', 'stripe', 'supabase', 'github', 'slack', 'crm',
]

// Route-to-suggestion mapping
const ROUTE_SUGGESTIONS: Record<string, Suggestion[]> = {
  '/integrations': [
    { id: 'rt-integrations', text: 'Connect a service to unlock its tools', category: 'vault', action: 'navigate', payload: '/console?tab=vault' },
  ],
  '/turn-it-on': [
    { id: 'rt-turnon', text: 'Import your existing credentials with Turn it 0n', category: 'engine', action: 'chat', payload: 'How do I import my credentials?' },
  ],
  '/store': [
    { id: 'rt-store', text: 'Browse ready-made automations', category: 'store', action: 'navigate', payload: '/console?tab=store' },
  ],
  '/builder': [
    { id: 'rt-builder', text: 'Need help building a workflow?', category: 'workflow', action: 'chat', payload: 'Help me build a workflow' },
  ],
  '/console': [
    { id: 'rt-console', text: 'Type / for the full command palette', category: 'general', action: 'chat', payload: '/help' },
  ],
  '/learn': [
    { id: 'rt-learn', text: 'Ask me about any 0nMCP concept', category: 'general', action: 'chat', payload: 'What should I learn first?' },
  ],
}

interface SuggestionInput {
  pathname: string
  connectedServices: string[]
  dismissedIds: string[]
  messageCount: number
  onboardingStep?: string
}

export function useOnCallSuggestions({
  pathname,
  connectedServices,
  dismissedIds,
  messageCount,
  onboardingStep,
}: SuggestionInput): Suggestion[] {
  return useMemo(() => {
    const suggestions: Suggestion[] = []
    const dismissed = new Set(dismissedIds)

    // 1. Route-based suggestions
    for (const [route, items] of Object.entries(ROUTE_SUGGESTIONS)) {
      if (pathname.startsWith(route)) {
        items.forEach(s => {
          if (!dismissed.has(s.id)) suggestions.push(s)
        })
      }
    }

    // Dynamic route: /integrations/[slug]
    const intMatch = pathname.match(/^\/integrations\/([^/]+)$/)
    if (intMatch) {
      const slug = intMatch[1]
      const svcKey = SERVICE_KEYS.find(k => k === slug || SVC[k].l.toLowerCase().replace(/\s+/g, '-') === slug)
      if (svcKey && !connectedServices.includes(svcKey)) {
        const s: Suggestion = {
          id: `rt-int-${svcKey}`,
          text: `Connect ${SVC[svcKey].l} to start using it`,
          category: 'vault',
          action: 'vault_prompt',
          payload: svcKey,
        }
        if (!dismissed.has(s.id)) suggestions.push(s)
      }
    }

    // Dynamic route: /turn-it-on/[slug]
    const tiMatch = pathname.match(/^\/turn-it-on\/([^/]+)$/)
    if (tiMatch) {
      const slug = tiMatch[1]
      const svcKey = SERVICE_KEYS.find(k => k === slug || SVC[k].l.toLowerCase().replace(/\s+/g, '-') === slug)
      if (svcKey && !connectedServices.includes(svcKey)) {
        const s: Suggestion = {
          id: `rt-ti-${svcKey}`,
          text: `Ready to connect ${SVC[svcKey].l}?`,
          category: 'vault',
          action: 'vault_prompt',
          payload: svcKey,
        }
        if (!dismissed.has(s.id)) suggestions.push(s)
      }
    }

    // 2. Missing vault key — suggest highest-priority unconnected service
    if (suggestions.length < 3) {
      for (const svcKey of PRIORITY_SERVICES) {
        if (suggestions.length >= 3) break
        if (connectedServices.includes(svcKey)) continue
        const svc = SVC[svcKey]
        if (!svc) continue
        const id = `vault-${svcKey}`
        if (dismissed.has(id)) continue
        suggestions.push({
          id,
          text: `Connect ${svc.l} — unlocks ${svc.cap.slice(0, 3).join(', ')}`,
          category: 'vault',
          action: 'vault_prompt',
          payload: svcKey,
        })
      }
    }

    // 3. After 3 chat exchanges without AI key — gentle nudge
    if (
      messageCount >= 6 &&
      !connectedServices.includes('anthropic') &&
      !connectedServices.includes('openai') &&
      !connectedServices.includes('gemini') &&
      !dismissed.has('nudge-ai')
    ) {
      suggestions.unshift({
        id: 'nudge-ai',
        text: 'Add an AI key for smarter responses (Claude, GPT, or Gemini)',
        category: 'vault',
        action: 'vault_prompt',
        payload: 'anthropic',
      })
    }

    // 4. Onboarding suggestion
    if (onboardingStep && onboardingStep !== 'complete' && !dismissed.has('onboard')) {
      suggestions.push({
        id: 'onboard',
        text: 'Continue your 0n setup — pick up where you left off',
        category: 'general',
        action: 'navigate',
        payload: '/0nboarding',
      })
    }

    // Limit to 3 and filter dismissed
    return suggestions.filter(s => !dismissed.has(s.id)).slice(0, 3)
  }, [pathname, connectedServices, dismissedIds, messageCount, onboardingStep])
}
