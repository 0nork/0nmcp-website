// Phase 3: Workflow Migration — "Unravel"
// Client-side platform detection heuristics + migration API client

export type WorkflowPlatform =
  | 'zapier'
  | 'make'
  | 'n8n'
  | 'power_automate'
  | 'oracle'
  | 'ifttt'
  | 'pipedream'
  | 'unknown'

export interface DetectionResult {
  platform: WorkflowPlatform
  confidence: number
  hints: string[]
}

export interface MigrationResult {
  platform: WorkflowPlatform
  confidence: number
  stepsFound: number
  servicesDetected: string[]
  workflow: Record<string, unknown>
  credentialQueue: string[]
}

export const PLATFORM_INFO: Record<
  WorkflowPlatform,
  { name: string; icon: string; color: string; description: string }
> = {
  zapier: {
    name: 'Zapier',
    icon: 'Z',
    color: '#ff4a00',
    description: 'Import Zaps and multi-step workflows from Zapier.',
  },
  make: {
    name: 'Make',
    icon: 'M',
    color: '#6d00cc',
    description: 'Convert Make (Integromat) scenarios into .0n workflows.',
  },
  n8n: {
    name: 'n8n',
    icon: 'N',
    color: '#ea4b71',
    description: 'Migrate n8n workflow JSON including node connections.',
  },
  power_automate: {
    name: 'Power Automate',
    icon: 'P',
    color: '#0066ff',
    description: 'Convert Microsoft Power Automate flows to .0n format.',
  },
  oracle: {
    name: 'Oracle OIC',
    icon: 'O',
    color: '#f80000',
    description: 'Import Oracle Integration Cloud integrations.',
  },
  ifttt: {
    name: 'IFTTT',
    icon: 'I',
    color: '#33ccff',
    description: 'Convert IFTTT applets into powerful .0n workflows.',
  },
  pipedream: {
    name: 'Pipedream',
    icon: 'D',
    color: '#36d174',
    description: 'Migrate Pipedream workflows with event-driven steps.',
  },
  unknown: {
    name: 'Unknown',
    icon: '?',
    color: '#888888',
    description: 'Platform could not be detected. AI will attempt best-effort migration.',
  },
}

export function detectWorkflowPlatform(content: string, filename: string): DetectionResult {
  const lower = content.toLowerCase()
  const ext = filename.toLowerCase().split('.').pop() ?? ''
  const hints: string[] = []
  const scores: Record<WorkflowPlatform, number> = {
    zapier: 0,
    make: 0,
    n8n: 0,
    power_automate: 0,
    oracle: 0,
    ifttt: 0,
    pipedream: 0,
    unknown: 0,
  }

  // --- Zapier ---
  if (lower.includes('zap_id') || lower.includes('zap_history_id')) {
    scores.zapier += 35
    hints.push('Found zap_id field')
  }
  if (/steps\[\d*\]\.action_id/i.test(content) || lower.includes('"action_id"')) {
    scores.zapier += 25
    hints.push('Found steps[].action_id pattern')
  }
  if (lower.includes('zapier')) {
    scores.zapier += 20
    hints.push('Contains "zapier" reference')
  }
  if (ext === 'zap') {
    scores.zapier += 20
    hints.push('.zap file extension')
  }

  // --- Make ---
  if (lower.includes('"scenarios"')) {
    scores.make += 30
    hints.push('Found "scenarios" key')
  }
  if (lower.includes('"modules"')) {
    scores.make += 25
    hints.push('Found "modules" key')
  }
  if (lower.includes('make.com') || lower.includes('integromat')) {
    scores.make += 25
    hints.push('Contains Make/Integromat reference')
  }
  if (lower.includes('"blueprint"')) {
    scores.make += 20
    hints.push('Found "blueprint" key (Make)')
  }

  // --- n8n ---
  if (lower.includes('"nodes"') && lower.includes('"connections"')) {
    scores.n8n += 35
    hints.push('Found "nodes" + "connections" structure')
  }
  if (lower.includes('n8n-nodes-base')) {
    scores.n8n += 35
    hints.push('Found n8n-nodes-base node type')
  }
  if (lower.includes('"n8n"') || lower.includes('n8n.io')) {
    scores.n8n += 15
    hints.push('Contains "n8n" reference')
  }
  if (lower.includes('"typversion"') || lower.includes('"versionid"')) {
    scores.n8n += 15
    hints.push('Found n8n version metadata')
  }

  // --- Power Automate ---
  if (lower.includes('definition') && lower.includes('"triggers"') && lower.includes('"actions"')) {
    scores.power_automate += 35
    hints.push('Found definition.triggers + definition.actions')
  }
  if (lower.includes('microsoft.com/flow') || lower.includes('flow.microsoft.com')) {
    scores.power_automate += 30
    hints.push('Contains Microsoft Flow URL')
  }
  if (/"\$schema".*flow/i.test(content)) {
    scores.power_automate += 25
    hints.push('Found $schema with flow reference')
  }
  if (lower.includes('"apiconnection"') || lower.includes('"openapioperation"')) {
    scores.power_automate += 10
    hints.push('Found Power Automate connector type')
  }

  // --- Oracle OIC ---
  if (lower.includes('"integrationid"') || lower.includes('integrationid')) {
    scores.oracle += 35
    hints.push('Found integrationId field')
  }
  if (lower.includes('oracle') || lower.includes('oic')) {
    scores.oracle += 25
    hints.push('Contains Oracle/OIC reference')
  }
  if (lower.includes('"orchestration"') && lower.includes('"connections"')) {
    scores.oracle += 20
    hints.push('Found orchestration + connections pattern')
  }
  if (lower.includes('integration.cloud.oracle.com')) {
    scores.oracle += 20
    hints.push('Contains Oracle Integration Cloud URL')
  }

  // --- IFTTT ---
  // Check for IFTTT pattern: triggers + actions but NOT Power Automate definition wrapper
  const hasIftttPattern =
    lower.includes('"triggers"') &&
    lower.includes('"actions"') &&
    !lower.includes('"definition"')
  if (hasIftttPattern) {
    scores.ifttt += 25
    hints.push('Found triggers + actions (without definition wrapper)')
  }
  if (lower.includes('ifttt')) {
    scores.ifttt += 35
    hints.push('Contains "ifttt" reference')
  }
  if (lower.includes('"applet"')) {
    scores.ifttt += 20
    hints.push('Found "applet" key')
  }
  if (lower.includes('maker.ifttt.com')) {
    scores.ifttt += 20
    hints.push('Contains IFTTT Maker URL')
  }

  // --- Pipedream ---
  if (lower.includes('"steps"') && lower.includes('"trigger"') && lower.includes('pipedream')) {
    scores.pipedream += 40
    hints.push('Found steps + trigger + pipedream reference')
  } else if (lower.includes('pipedream')) {
    scores.pipedream += 30
    hints.push('Contains "pipedream" reference')
  }
  if (lower.includes('$event') || lower.includes('$.event')) {
    scores.pipedream += 20
    hints.push('Found $event variable (Pipedream)')
  }
  if (lower.includes('"component"') && lower.includes('"props"')) {
    scores.pipedream += 15
    hints.push('Found component + props structure (Pipedream)')
  }
  if (lower.includes('pipedream.net')) {
    scores.pipedream += 15
    hints.push('Contains Pipedream URL')
  }

  // Find the platform with highest score
  let bestPlatform: WorkflowPlatform = 'unknown'
  let bestScore = 0

  for (const [platform, score] of Object.entries(scores)) {
    if (platform === 'unknown') continue
    if (score > bestScore) {
      bestScore = score
      bestPlatform = platform as WorkflowPlatform
    }
  }

  // Cap confidence at 100
  const confidence = Math.min(bestScore, 100)

  // Filter hints to only those relevant to the detected platform
  const relevantHints = hints.filter((h) => {
    const hLower = h.toLowerCase()
    const info = PLATFORM_INFO[bestPlatform]
    return (
      hLower.includes(info.name.toLowerCase()) ||
      hLower.includes(bestPlatform.replace('_', ' ')) ||
      confidence > 0
    )
  })

  return {
    platform: confidence >= 10 ? bestPlatform : 'unknown',
    confidence: confidence >= 10 ? confidence : 0,
    hints: relevantHints.length > 0 ? relevantHints : hints,
  }
}

export async function migrateWorkflow(
  content: string,
  filename: string
): Promise<MigrationResult> {
  const response = await fetch('/api/console/migrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, filename }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Migration failed' }))
    throw new Error(err.error ?? 'Migration failed')
  }

  return response.json()
}
