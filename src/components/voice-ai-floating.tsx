'use client'

import { usePathname } from 'next/navigation'
import { VoiceAIWidget } from './voice-ai-widget'

// Show Jaxx on public pages only — not inside the dashboard, console,
// auth flows, or web0n editor surfaces.
const EXCLUDED_PREFIXES = [
  '/dashboard',
  '/console',
  '/admin',
  '/auth',
  '/login',
  '/signup',
  '/0nboarding',
  '/web0n',
  '/canvas',
]

export function VoiceAIFloatingButton() {
  const pathname = usePathname()
  if (EXCLUDED_PREFIXES.some((p) => pathname?.startsWith(p))) return null
  return <VoiceAIWidget />
}
