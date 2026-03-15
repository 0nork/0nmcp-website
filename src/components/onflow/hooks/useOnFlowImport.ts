import type { OnFlowStep, WorkflowSettings, DotOnWorkflow } from '../types'
import { getServiceById, getAllServices } from '@/lib/sxo-helpers'
import { SERVICE_LOGOS } from '@/components/builder/ServicePalette'

interface ImportResult {
  steps: OnFlowStep[]
  settings: WorkflowSettings
  stepCounter: number
}

/**
 * Convert DotOnWorkflow → OnFlowStep[] (topological sort → linear sequence).
 */
export function importToOnFlow(workflow: DotOnWorkflow): ImportResult {
  const allServices = getAllServices()
  const rawSteps = workflow.steps ?? []

  // Build depth map for topological ordering
  const depthMap = new Map<string, number>()

  function getDepth(stepId: string): number {
    if (depthMap.has(stepId)) return depthMap.get(stepId)!
    const step = rawSteps.find((s) => s.id === stepId)
    if (!step?.depends_on?.length) {
      depthMap.set(stepId, 0)
      return 0
    }
    const maxParent = Math.max(...step.depends_on.map((d) => getDepth(d)))
    const depth = maxParent + 1
    depthMap.set(stepId, depth)
    return depth
  }

  rawSteps.forEach((s) => getDepth(s.id))

  // Sort by depth (topological order)
  const sorted = [...rawSteps].sort(
    (a, b) => (depthMap.get(a.id) ?? 0) - (depthMap.get(b.id) ?? 0)
  )

  const steps: OnFlowStep[] = sorted.map((step, i) => {
    const service =
      getServiceById(step.mcp_server) ??
      allServices.find((s) => s.name.toLowerCase() === step.name?.toLowerCase())

    const tool = service?.tools?.find((t: { id: string }) => t.id === step.tool) as
      { id: string; name: string; description?: string } | undefined
    const logo = SERVICE_LOGOS[service?.id ?? step.mcp_server] ?? ''

    return {
      id: step.id,
      type: (i === 0 ? 'trigger' : 'action') as OnFlowStep['type'],
      serviceId: service?.id ?? step.mcp_server ?? '',
      serviceName: service?.name ?? step.name ?? step.mcp_server ?? 'Unknown',
      serviceLogo: logo,
      toolId: step.tool ?? '',
      toolName: tool?.name ?? step.tool ?? '',
      description: tool?.description ?? '',
      inputs: step.inputs ?? {},
      outputs: step.outputs ?? {},
      condition: step.condition ?? '',
      onFail: (step.on_fail as OnFlowStep['onFail']) ?? 'halt',
      timeout: step.timeout ?? 0,
      parallelGroup: step.parallel_group ?? '',
      status: 'idle' as const,
      color: service?.id === 'crm' ? '#ff6b35' : '#7ed957',
    }
  })

  const settings: WorkflowSettings = {
    name: workflow.name ?? 'imported-workflow',
    description: workflow.description ?? '',
    author: workflow.author ?? '',
    env: workflow.env ?? {},
    variables: workflow.variables ?? {},
    onComplete: (workflow.on_complete as WorkflowSettings['onComplete']) ?? 'log',
    metadata: {
      pipeline: workflow.metadata?.pipeline ?? '',
      environment: workflow.metadata?.environment ?? '',
      tags: workflow.metadata?.tags ?? [],
    },
  }

  const maxNum = rawSteps.reduce((max, s) => {
    const match = s.id.match(/(\d+)$/)
    return match ? Math.max(max, parseInt(match[1])) : max
  }, 0)

  return { steps, settings, stepCounter: maxNum + 1 }
}
