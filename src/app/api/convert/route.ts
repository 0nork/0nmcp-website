import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

type Platform = 'openai' | 'gemini' | 'openclaw' | 'claude-code' | 'unknown'

/* ── Platform Detection ── */
function detectPlatform(content: string): { platform: Platform; parsed: Record<string, unknown> | null } {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>
    const keys = Object.keys(parsed)
    const flat = JSON.stringify(parsed).toLowerCase()

    if (keys.includes('gizmo') || keys.includes('actions') || (keys.includes('model') && keys.includes('instructions') && flat.includes('gpt'))) {
      return { platform: 'openai', parsed }
    }
    if (keys.includes('generationConfig') || keys.includes('safetySettings') || keys.includes('systemInstruction') || flat.includes('gemini')) {
      return { platform: 'gemini', parsed }
    }
    if (keys.includes('claw') || keys.includes('clawConfig') || keys.includes('manifest')) {
      return { platform: 'openclaw', parsed }
    }
    if (keys.includes('mcpServers') || keys.includes('claudeDesktop')) {
      return { platform: 'claude-code', parsed }
    }
    return { platform: 'unknown', parsed }
  } catch {
    if (content.includes('# CLAUDE') || content.includes('CLAUDE.md')) {
      return { platform: 'claude-code', parsed: null }
    }
    return { platform: 'unknown', parsed: null }
  }
}

/* ── Converters (proprietary — server-only) ── */

function convertOpenAI(parsed: Record<string, unknown>): { workflow: Record<string, unknown>; format: string; stats: { tools: number; prompts: number; settings: number } } {
  const instructions = (parsed.instructions as string) || (parsed.system as string) || ''
  const model = (parsed.model as string) || 'gpt-4'
  const tools = Array.isArray(parsed.tools) ? parsed.tools : []
  const actions = Array.isArray(parsed.actions) ? parsed.actions : []
  const gizmoDisplay = (parsed.gizmo as Record<string, unknown>)?.display as Record<string, unknown> | undefined
  const name = (parsed.name as string) || (gizmoDisplay?.name as string) || 'Imported GPT'

  const steps: Record<string, unknown>[] = []

  if (instructions) {
    steps.push({ id: 'system-prompt', action: 'set', target: 'system.prompt', value: instructions })
  }

  tools.forEach((tool: Record<string, unknown>, i: number) => {
    steps.push({ id: `tool-${i}`, action: 'lookup', service: 'openai', capability: tool.type || 'function', config: tool })
  })

  actions.forEach((action: Record<string, unknown>, i: number) => {
    steps.push({ id: `action-${i}`, action: 'transform', source: 'openai.action', target: '0n.step', config: action })
  })

  return {
    workflow: {
      name,
      version: '1.0.0',
      format: '.0n',
      source: { platform: 'openai', model },
      steps,
      metadata: { converted: new Date().toISOString(), converter: 'brain-transplant-v2' },
    },
    format: parsed.gizmo ? 'Custom GPT Export' : 'Assistant Config',
    stats: { tools: tools.length, prompts: instructions ? 1 : 0, settings: actions.length },
  }
}

function convertGemini(parsed: Record<string, unknown>): { workflow: Record<string, unknown>; format: string; stats: { tools: number; prompts: number; settings: number } } {
  const systemInstruction = (parsed.systemInstruction as string) || ''
  const genConfig = (parsed.generationConfig as Record<string, unknown>) || {}
  const safety = Array.isArray(parsed.safetySettings) ? parsed.safetySettings : []
  const tools = Array.isArray(parsed.tools) ? parsed.tools : []
  const name = (parsed.displayName as string) || (parsed.name as string) || 'Imported Gem'

  const steps: Record<string, unknown>[] = []

  if (systemInstruction) {
    steps.push({ id: 'system-prompt', action: 'set', target: 'system.prompt', value: systemInstruction })
  }

  if (Object.keys(genConfig).length) {
    steps.push({ id: 'generation-config', action: 'set', target: 'system.config', value: genConfig })
  }

  safety.forEach((s: Record<string, unknown>, i: number) => {
    steps.push({ id: `safety-${i}`, action: 'set', target: `system.safety.${i}`, value: s })
  })

  tools.forEach((tool: Record<string, unknown>, i: number) => {
    steps.push({ id: `tool-${i}`, action: 'transform', source: 'gemini.tool', target: '0n.step', config: tool })
  })

  return {
    workflow: {
      name,
      version: '1.0.0',
      format: '.0n',
      source: { platform: 'gemini', model: (genConfig.model as string) || 'gemini-pro' },
      steps,
      metadata: { converted: new Date().toISOString(), converter: 'brain-transplant-v2' },
    },
    format: parsed.adk ? 'ADK Agent Config' : 'Gem Config',
    stats: { tools: tools.length, prompts: systemInstruction ? 1 : 0, settings: safety.length + Object.keys(genConfig).length },
  }
}

function convertOpenClaw(parsed: Record<string, unknown>): { workflow: Record<string, unknown>; format: string; stats: { tools: number; prompts: number; settings: number } } {
  const manifest = (parsed.manifest as Record<string, unknown>) || parsed
  const clawConfig = (parsed.clawConfig as Record<string, unknown>) || {}
  const servers = (parsed.mcpServers as Record<string, unknown>) || {}
  const tools = Array.isArray(manifest.tools) ? manifest.tools : []
  const name = (manifest.name as string) || 'Imported Claw'

  const steps: Record<string, unknown>[] = []

  Object.entries(servers).forEach(([key, config]) => {
    steps.push({ id: `mcp-${key}`, action: 'lookup', service: key, capability: 'mcp-server', config })
  })

  tools.forEach((tool: Record<string, unknown>, i: number) => {
    steps.push({ id: `tool-${i}`, action: 'transform', source: 'openclaw.tool', target: '0n.step', config: tool })
  })

  return {
    workflow: {
      name,
      version: '1.0.0',
      format: '.0n',
      source: { platform: 'openclaw' },
      steps,
      metadata: { converted: new Date().toISOString(), converter: 'brain-transplant-v2', clawConfig },
    },
    format: parsed.claw ? 'Claw Config' : 'OpenClaw Manifest',
    stats: { tools: tools.length, prompts: 0, settings: Object.keys(servers).length },
  }
}

function convertClaudeCode(parsed: Record<string, unknown> | null, raw: string): { workflow: Record<string, unknown>; format: string; stats: { tools: number; prompts: number; settings: number } } {
  const steps: Record<string, unknown>[] = []
  let name = 'Imported Claude Config'
  let format = 'Claude Config'
  let toolCount = 0
  let settingCount = 0

  if (parsed && parsed.mcpServers) {
    format = 'claude_desktop_config.json'
    const servers = parsed.mcpServers as Record<string, Record<string, unknown>>
    Object.entries(servers).forEach(([key, config]) => {
      steps.push({ id: `mcp-${key}`, action: 'lookup', service: key, capability: 'mcp-server', config })
      toolCount++
    })
    settingCount = Object.keys(parsed).length
  } else {
    format = 'CLAUDE.md'
    name = 'Imported CLAUDE.md'
    steps.push({ id: 'claude-md', action: 'set', target: 'system.prompt', value: raw })
  }

  return {
    workflow: {
      name,
      version: '1.0.0',
      format: '.0n',
      source: { platform: 'claude-code' },
      steps,
      metadata: { converted: new Date().toISOString(), converter: 'brain-transplant-v2' },
    },
    format,
    stats: { tools: toolCount, prompts: parsed ? 0 : 1, settings: settingCount },
  }
}

/* ── POST /api/convert ── */
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: { content: string; filename: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { content, filename } = body
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Missing content field' }, { status: 400 })
  }

  const { platform, parsed } = detectPlatform(content)

  let result: { workflow: Record<string, unknown>; format: string; stats: { tools: number; prompts: number; settings: number } }

  switch (platform) {
    case 'openai':
      result = convertOpenAI(parsed!)
      break
    case 'gemini':
      result = convertGemini(parsed!)
      break
    case 'openclaw':
      result = convertOpenClaw(parsed!)
      break
    case 'claude-code':
      result = convertClaudeCode(parsed, content)
      break
    default:
      return NextResponse.json({ error: 'Unable to detect platform. Supported: OpenAI, Gemini, OpenClaw, Claude Code' }, { status: 422 })
  }

  // Save to Supabase
  const { error: dbError } = await supabase.from('user_workflows').insert({
    user_id: user.id,
    name: (result.workflow.name as string) || filename || 'Untitled',
    source_platform: platform,
    source_format: result.format,
    workflow: result.workflow,
    stats: result.stats,
  })

  if (dbError) {
    console.error('Failed to save workflow:', dbError)
    // Still return the result even if save fails
  }

  return NextResponse.json({
    workflow: result.workflow,
    platform,
    format: result.format,
    stats: result.stats,
  })
}
