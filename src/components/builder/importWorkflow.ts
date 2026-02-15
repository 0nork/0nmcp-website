import type { Edge } from '@xyflow/react'
import type { StepNode, StepNodeData, WorkflowSettings, DotOnWorkflow } from './types'
import { getServiceById, getAllServices } from '@/lib/sxo-helpers'

interface ImportResult {
  nodes: StepNode[]
  edges: Edge[]
  settings: WorkflowSettings
  stepCounter: number
}

export function importWorkflow(workflow: DotOnWorkflow): ImportResult {
  const allServices = getAllServices()
  const steps = workflow.steps ?? []

  // Build adjacency map for topological ordering
  const depthMap = new Map<string, number>()

  function getDepth(stepId: string): number {
    if (depthMap.has(stepId)) return depthMap.get(stepId)!
    const step = steps.find((s) => s.id === stepId)
    if (!step || !step.depends_on || step.depends_on.length === 0) {
      depthMap.set(stepId, 0)
      return 0
    }
    const maxParent = Math.max(...step.depends_on.map((d) => getDepth(d)))
    const depth = maxParent + 1
    depthMap.set(stepId, depth)
    return depth
  }

  steps.forEach((s) => getDepth(s.id))

  // Group by depth for side-by-side positioning
  const byDepth = new Map<number, typeof steps>()
  steps.forEach((s) => {
    const d = depthMap.get(s.id) ?? 0
    if (!byDepth.has(d)) byDepth.set(d, [])
    byDepth.get(d)!.push(s)
  })

  const nodes: StepNode[] = []
  const edges: Edge[] = []

  const Y_GAP = 160
  const X_GAP = 260
  const BASE_X = 200

  steps.forEach((step) => {
    const depth = depthMap.get(step.id) ?? 0
    const group = byDepth.get(depth)!
    const indexInGroup = group.indexOf(step)
    const groupWidth = group.length * X_GAP
    const startX = BASE_X - groupWidth / 2 + X_GAP / 2

    // Try to find service by mcp_server field
    const service =
      getServiceById(step.mcp_server) ??
      allServices.find(
        (s) => s.name.toLowerCase() === step.name?.toLowerCase()
      )

    const tool = service?.tools?.find((t) => t.id === step.tool)

    const data: StepNodeData = {
      stepId: step.id,
      serviceId: service?.id ?? step.mcp_server ?? '',
      serviceName: service?.name ?? step.name ?? step.mcp_server ?? 'Unknown',
      serviceIcon: service?.icon ?? '?',
      serviceLogo: service?.logo ?? '',
      toolId: step.tool ?? '',
      toolName: tool?.name ?? step.tool ?? '',
      inputs: step.inputs ?? {},
      outputs: step.outputs ?? {},
      condition: step.condition ?? '',
      onFail: (step.on_fail as StepNodeData['onFail']) ?? 'halt',
      timeout: step.timeout ?? 0,
      parallelGroup: step.parallel_group ?? '',
    }

    nodes.push({
      id: step.id,
      type: 'stepNode',
      position: { x: startX + indexInGroup * X_GAP, y: depth * Y_GAP + 60 },
      data,
    })

    // Create edges from depends_on
    if (step.depends_on) {
      step.depends_on.forEach((dep) => {
        edges.push({
          id: `e-${dep}-${step.id}`,
          source: dep,
          target: step.id,
          animated: true,
          style: { stroke: 'var(--accent-dim)' },
        })
      })
    }
  })

  // Extract workflow-level settings
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

  // Compute next step counter
  const maxNum = steps.reduce((max, s) => {
    const match = s.id.match(/(\d+)$/)
    return match ? Math.max(max, parseInt(match[1])) : max
  }, 0)

  return {
    nodes,
    edges,
    settings,
    stepCounter: maxNum + 1,
  }
}
