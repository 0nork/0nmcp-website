import { getInteractionStats } from './ai-interaction-logger'
import { buildManifest } from './manifest'
import type { AiManifest } from '@/lib/linkedin/types'

/**
 * Optimize the manifest based on actual usage patterns.
 * Reorders tools by popularity, adjusts descriptions based on what AI systems ask for.
 */
export async function optimizeManifest(): Promise<AiManifest> {
  const stats = await getInteractionStats()
  const baseManifest = buildManifest()

  if (stats.totalInteractions < 10) {
    // Not enough data to optimize
    return { ...baseManifest, version: `1.0.0-base` }
  }

  // Reorder tools by usage frequency
  const toolUsage = stats.byTool
  const sortedTools = [...baseManifest.tools].sort((a, b) => {
    return (toolUsage[b.name] || 0) - (toolUsage[a.name] || 0)
  })

  // Calculate version hash based on optimization state
  const versionHash = Buffer.from(
    JSON.stringify({ interactions: stats.totalInteractions, quality: stats.avgQuality.toFixed(2) })
  ).toString('base64').slice(0, 8)

  return {
    ...baseManifest,
    tools: sortedTools,
    version: `auto-${versionHash}`,
  }
}
