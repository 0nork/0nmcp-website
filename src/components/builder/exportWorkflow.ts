import type { Edge } from '@xyflow/react'
import type { StepNode, WorkflowSettings, DotOnWorkflow, DotOnStep } from './types'

export function exportWorkflow(
  nodes: StepNode[],
  edges: Edge[],
  settings: WorkflowSettings
): DotOnWorkflow {
  // Sort nodes by Y position (top-to-bottom = execution order)
  const sorted = [...nodes].sort(
    (a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0)
  )

  const steps: DotOnStep[] = sorted.map((node) => {
    const d = node.data

    // Find all edges pointing TO this node to derive depends_on
    const incomingEdges = edges.filter((e) => e.target === node.id)
    const dependsOn = incomingEdges.map((e) => {
      const sourceNode = nodes.find((n) => n.id === e.source)
      return sourceNode?.data.stepId ?? e.source
    })

    const step: DotOnStep = {
      id: d.stepId,
      name: d.serviceName,
      mcp_server: d.serviceId,
      tool: d.toolId,
    }

    if (Object.keys(d.inputs).length > 0) step.inputs = { ...d.inputs }
    if (Object.keys(d.outputs).length > 0) step.outputs = { ...d.outputs }
    if (dependsOn.length > 0) step.depends_on = dependsOn
    if (d.condition) step.condition = d.condition
    if (d.onFail && d.onFail !== 'halt') step.on_fail = d.onFail
    if (d.timeout) step.timeout = d.timeout
    if (d.parallelGroup) step.parallel_group = d.parallelGroup

    return step
  })

  const workflow: DotOnWorkflow = {
    name: settings.name,
    version: '0.2',
    description: settings.description,
    author: settings.author,
    steps,
  }

  // Only include env entries that are template references (never actual values)
  if (Object.keys(settings.env).length > 0) {
    const safeEnv: Record<string, string> = {}
    for (const [key, value] of Object.entries(settings.env)) {
      // Force all env values to be template references
      if (/^\{\{.*\}\}$/.test(value)) {
        safeEnv[key] = value
      } else {
        // Replace hardcoded values with template reference
        safeEnv[key] = `{{env.${key}}}`
      }
    }
    if (Object.keys(safeEnv).length > 0) workflow.env = safeEnv
  }

  if (Object.keys(settings.variables).length > 0)
    workflow.variables = { ...settings.variables }
  if (settings.onComplete !== 'log') workflow.on_complete = settings.onComplete

  const hasMeta =
    settings.metadata.pipeline ||
    settings.metadata.environment ||
    settings.metadata.tags.length > 0
  if (hasMeta) {
    workflow.metadata = {}
    if (settings.metadata.pipeline) workflow.metadata.pipeline = settings.metadata.pipeline
    if (settings.metadata.environment)
      workflow.metadata.environment = settings.metadata.environment
    if (settings.metadata.tags.length > 0)
      workflow.metadata.tags = [...settings.metadata.tags]
  }

  return workflow
}
