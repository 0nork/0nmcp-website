import type { OnFlowStep, WorkflowSettings, DotOnWorkflow, DotOnStep } from '../types'

/**
 * Convert OnFlowStep[] → DotOnWorkflow (.0n format)
 * Steps become a linear chain with depends_on linking to previous step.
 */
export function exportFromOnFlow(
  steps: OnFlowStep[],
  settings: WorkflowSettings
): DotOnWorkflow {
  const dotSteps: DotOnStep[] = steps.map((step, i) => {
    const s: DotOnStep = {
      id: step.id,
      name: step.serviceName,
      mcp_server: step.serviceId,
      tool: step.toolId,
    }

    if (Object.keys(step.inputs).length > 0) s.inputs = { ...step.inputs }
    if (Object.keys(step.outputs).length > 0) s.outputs = { ...step.outputs }
    if (i > 0) s.depends_on = [steps[i - 1].id]
    if (step.condition) s.condition = step.condition
    if (step.onFail && step.onFail !== 'halt') s.on_fail = step.onFail
    if (step.timeout) s.timeout = step.timeout
    if (step.parallelGroup) s.parallel_group = step.parallelGroup

    return s
  })

  const workflow: DotOnWorkflow = {
    name: settings.name,
    version: '0.2',
    description: settings.description,
    author: settings.author,
    steps: dotSteps,
  }

  // Safe env (template refs only)
  if (Object.keys(settings.env).length > 0) {
    const safeEnv: Record<string, string> = {}
    for (const [key, value] of Object.entries(settings.env)) {
      safeEnv[key] = /^\{\{.*\}\}$/.test(value) ? value : `{{env.${key}}}`
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
    if (settings.metadata.environment) workflow.metadata.environment = settings.metadata.environment
    if (settings.metadata.tags.length > 0) workflow.metadata.tags = [...settings.metadata.tags]
  }

  return workflow
}
