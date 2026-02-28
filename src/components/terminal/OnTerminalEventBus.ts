import type { TerminalEvent } from './OnTerminalTypes'

type EventCallback = (event: TerminalEvent) => void

class OnTerminalEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map()
  private history: TerminalEvent[] = []
  private maxHistory = 1000

  on(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)
    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  emit(type: TerminalEvent['type'], payload: any, source: TerminalEvent['source'] = 'terminal') {
    const event: TerminalEvent = { type, payload, timestamp: Date.now(), source }
    this.history.push(event)
    if (this.history.length > this.maxHistory) this.history.shift()
    this.listeners.get(type)?.forEach(cb => cb(event))
    this.listeners.get('*')?.forEach(cb => cb(event))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`on-terminal:${type}`, { detail: event }))
    }
  }

  executeFromChat(command: string) {
    this.emit('execute', { command, fromChat: true }, 'chat')
  }

  getHistory(): TerminalEvent[] {
    return [...this.history]
  }

  destroy() {
    this.listeners.clear()
    this.history = []
  }
}

export const terminalBus = new OnTerminalEventBus()
export default OnTerminalEventBus
