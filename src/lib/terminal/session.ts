import { terminalBus } from '@/components/terminal/OnTerminalEventBus'

export interface TerminalSession {
  id: string
  userId: string
  startedAt: number
  commands: { input: string; runtime: string; timestamp: number }[]
}

let currentSession: TerminalSession | null = null

export function startSession(userId: string): TerminalSession {
  currentSession = {
    id: crypto.randomUUID(),
    userId,
    startedAt: Date.now(),
    commands: [],
  }

  terminalBus.on('execute', (event) => {
    if (currentSession) {
      currentSession.commands.push({
        input: event.payload.command,
        runtime: event.payload.runtime,
        timestamp: event.timestamp,
      })
    }
  })

  return currentSession
}

export function getSession(): TerminalSession | null {
  return currentSession
}

export function exportSession(): string {
  if (!currentSession) return '{}'
  return JSON.stringify(currentSession, null, 2)
}
