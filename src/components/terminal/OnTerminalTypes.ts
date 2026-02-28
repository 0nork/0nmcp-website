export interface OnTerminalConfig {
  containerId?: string
  workDir?: string
  packages?: string[]
  files?: Record<string, string>
  enablePython?: boolean
  enableNode?: boolean
  enablePreview?: boolean
  height?: string | number
  width?: string | number
  readOnly?: boolean
  welcomeMessage?: string
  session?: {
    userId: string
    email: string
    plan: 'free' | 'pro' | 'team' | 'enterprise'
  }
  onReady?: () => void
  onCommand?: (cmd: string, runtime: 'node' | 'python' | 'shell') => void
  onOutput?: (output: string) => void
  onError?: (error: Error) => void
}

export interface TerminalCommand {
  name: string
  description: string
  usage: string
  handler: (args: string[], ctx: TerminalContext) => Promise<string>
}

export interface TerminalContext {
  cwd: string
  env: Record<string, string>
  fs: any
  write: (text: string) => void
  writeLine: (text: string) => void
  writeError: (text: string) => void
  setPrompt: (prompt: string) => void
}

export interface TerminalEvent {
  type: 'execute' | 'output' | 'ready' | 'error' | 'resize' | 'session'
  payload: any
  timestamp: number
  source: 'terminal' | 'chat' | 'system'
}

export type RuntimeType = 'node' | 'python' | 'shell' | 'auto'
