import { terminalBus } from './OnTerminalEventBus'

export function initTerminalAnalytics() {
  terminalBus.on('ready', (event) => {
    trackEvent('terminal_boot', {
      node_ready: event.payload.node,
      python_ready: event.payload.python,
    })
  })

  terminalBus.on('execute', (event) => {
    const firstWord = event.payload.command.split(/\s/)[0]
    trackEvent('terminal_command', {
      command: firstWord,
      runtime: event.payload.runtime,
      source: event.source,
      from_chat: event.payload.fromChat || false,
    })
  })

  terminalBus.on('error', (event) => {
    trackEvent('terminal_error', {
      error: event.payload.error?.substring(0, 100),
    })
  })
}

function trackEvent(name: string, params: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      event_category: 'terminal',
      ...params,
    })
  }
}
