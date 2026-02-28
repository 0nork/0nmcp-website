export type ConnectionMode = 'server' | 'anthropic' | 'local'

export interface ConnectionConfig {
  mode: ConnectionMode
  anthropicApiKey?: string
  localServerUrl?: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = '0nmcp-connection'

export function getConnectionConfig(): ConnectionConfig {
  if (typeof window === 'undefined') return { mode: 'server' }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return { mode: 'server' }
  try {
    const parsed = JSON.parse(stored)
    // Migrate old configs that defaulted to 'anthropic' with no key
    if (parsed.mode === 'anthropic' && !parsed.anthropicApiKey) {
      return { ...parsed, mode: 'server' }
    }
    return parsed
  } catch {
    return { mode: 'server' }
  }
}

export function saveConnectionConfig(config: ConnectionConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

const SYSTEM_PROMPT = `You are 0nMCP, a universal AI API orchestrator with 819 tools across 48 services in 21 categories. You help users manage workflows, execute tasks, and connect services. You speak concisely and helpfully. When users describe tasks, suggest which 0nMCP tools and services could accomplish them.`

export async function executeTask(
  messages: Message[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const config = getConnectionConfig()

  if (config.mode === 'local') {
    return executeLocal(config, messages, onChunk, signal)
  }

  if (config.mode === 'anthropic' && config.anthropicApiKey) {
    return executeAnthropic(config, messages, onChunk, signal)
  }

  // Default: server-side proxy (no API key needed)
  return executeServer(messages, onChunk, signal)
}

async function executeServer(
  messages: Message[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
    throw new Error(err.error || `Server error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response stream')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') return

      try {
        const event = JSON.parse(data)
        if (event.type === 'content_block_delta' && event.delta?.text) {
          onChunk(event.delta.text)
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

async function executeAnthropic(
  config: ConnectionConfig,
  messages: Message[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  if (!config.anthropicApiKey) {
    throw new Error('Anthropic API key not configured. Go to Settings to add your key.')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      stream: true,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic API error: ${response.status} — ${error}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response stream')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') return

      try {
        const event = JSON.parse(data)
        if (event.type === 'content_block_delta' && event.delta?.text) {
          onChunk(event.delta.text)
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

async function executeLocal(
  config: ConnectionConfig,
  messages: Message[],
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const url = config.localServerUrl || 'http://localhost:3939'
  const lastMessage = messages[messages.length - 1]

  const response = await fetch(`${url}/api/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: lastMessage.content }),
    signal,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Local server error: ${response.status} — ${error}`)
  }

  const result = await response.json()
  onChunk(typeof result === 'string' ? result : JSON.stringify(result, null, 2))
}

export async function healthCheck(): Promise<{ ok: boolean; message: string }> {
  const config = getConnectionConfig()

  if (config.mode === 'server') {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'ping' }],
        }),
      })
      return response.ok
        ? { ok: true, message: 'Connected to 0nMCP server' }
        : { ok: false, message: `Server returned ${response.status}` }
    } catch (err) {
      return { ok: false, message: `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}` }
    }
  }

  if (config.mode === 'anthropic') {
    if (!config.anthropicApiKey) {
      return { ok: false, message: 'No API key configured' }
    }
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      })
      return response.ok
        ? { ok: true, message: 'Connected to Anthropic API' }
        : { ok: false, message: `API returned ${response.status}` }
    } catch (err) {
      return { ok: false, message: `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}` }
    }
  }

  // Local server health check
  const url = config.localServerUrl || 'http://localhost:3939'
  try {
    const response = await fetch(`${url}/health`)
    return response.ok
      ? { ok: true, message: `Connected to ${url}` }
      : { ok: false, message: `Server returned ${response.status}` }
  } catch (err) {
    return { ok: false, message: `Cannot reach ${url}: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}
