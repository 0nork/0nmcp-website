/**
 * Brain Transplant — Client-side helpers
 * Platform detection hints, migration guides, upload handler
 */

export type Platform = 'openai' | 'gemini' | 'openclaw' | 'claude-code' | 'unknown'

export interface ConvertResult {
  workflow: Record<string, unknown>
  platform: Platform
  format: string
  stats: {
    tools: number
    prompts: number
    settings: number
  }
}

export const PLATFORMS = {
  openai: {
    name: 'OpenAI',
    slug: 'openai',
    icon: 'O',
    color: '#10a37f',
    formats: ['GPT Config JSON', 'Assistant Export', 'Custom GPT Schema', 'Actions JSON'],
    extensions: ['.json'],
    detectKeys: ['model', 'instructions', 'tools', 'actions', 'gizmo'],
  },
  gemini: {
    name: 'Google Gemini',
    slug: 'gemini',
    icon: 'G',
    color: '#4285f4',
    formats: ['Gem Config', 'Google AI Studio Export', 'ADK Agent Config', 'Vertex AI Config'],
    extensions: ['.json', '.yaml'],
    detectKeys: ['gemini', 'generationConfig', 'safetySettings', 'systemInstruction', 'adk'],
  },
  openclaw: {
    name: 'OpenClaw',
    slug: 'openclaw',
    icon: 'C',
    color: '#ff6b35',
    formats: ['OpenClaw Manifest', 'Claw Config', 'MCP Bridge Export'],
    extensions: ['.json', '.claw'],
    detectKeys: ['claw', 'manifest', 'mcpServers', 'clawConfig'],
  },
  'claude-code': {
    name: 'Claude Code',
    slug: 'claude-code',
    icon: 'CC',
    color: '#d4a574',
    formats: ['CLAUDE.md', 'claude_desktop_config.json', 'MCP Server Config'],
    extensions: ['.json', '.md'],
    detectKeys: ['mcpServers', 'claudeDesktop', 'CLAUDE.md'],
  },
} as const

export function detectPlatform(content: string): Platform {
  try {
    const parsed = JSON.parse(content)
    const keys = Object.keys(parsed)
    const flat = JSON.stringify(parsed).toLowerCase()

    // OpenAI detection
    if (keys.includes('gizmo') || keys.includes('actions') || (keys.includes('model') && keys.includes('instructions') && flat.includes('gpt'))) {
      return 'openai'
    }

    // Gemini detection
    if (keys.includes('generationConfig') || keys.includes('safetySettings') || keys.includes('systemInstruction') || flat.includes('gemini')) {
      return 'gemini'
    }

    // OpenClaw detection
    if (keys.includes('claw') || keys.includes('clawConfig') || keys.includes('manifest')) {
      return 'openclaw'
    }

    // Claude Code detection
    if (keys.includes('mcpServers') || keys.includes('claudeDesktop')) {
      return 'claude-code'
    }

    return 'unknown'
  } catch {
    // Not JSON — could be CLAUDE.md
    if (content.includes('# CLAUDE') || content.includes('CLAUDE.md')) {
      return 'claude-code'
    }
    return 'unknown'
  }
}

export const MIGRATION_GUIDES: Record<Platform, string[]> = {
  openai: [
    'Go to ChatGPT → Explore GPTs → My GPTs',
    'Click the GPT you want to export → Edit',
    'Copy the Instructions, Knowledge files list, Actions schemas',
    'Or use the API: GET /v1/assistants/{id} with your API key',
    'Save the full JSON response as a .json file',
    'Upload it here — we handle the rest',
  ],
  gemini: [
    'Go to Google AI Studio → My Gems',
    'Open the Gem you want to export',
    'Click the JSON icon or copy the system instruction',
    'For ADK agents: export your agent.json config',
    'Save as .json and upload here',
    'We convert all settings, safety configs, and tools',
  ],
  openclaw: [
    'Open your OpenClaw dashboard',
    'Navigate to your agent or manifest',
    'Click Export → JSON format',
    'Download the .json or .claw file',
    'Upload here for instant conversion',
    'All MCP bridge configs transfer automatically',
  ],
  'claude-code': [
    'Find your claude_desktop_config.json (usually in ~/.config/claude/)',
    'Or locate your project CLAUDE.md file',
    'Copy the full config file',
    'Upload the JSON or markdown file',
    'MCP server configs convert to .0n service connections',
    'All tool configurations are preserved',
  ],
  unknown: [
    'Export your AI config as JSON',
    'Upload it and we will auto-detect the format',
  ],
}

export async function uploadForConversion(content: string, filename: string): Promise<ConvertResult> {
  const res = await fetch('/api/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, filename }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Conversion failed' }))
    throw new Error(err.error || 'Conversion failed')
  }

  return res.json()
}
