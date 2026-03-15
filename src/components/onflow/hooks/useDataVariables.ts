import { useMemo } from 'react'
import type { OnFlowStep, DataVariable } from '../types'
import { TRIGGER_DEFINITIONS } from '../data/trigger-definitions'

/**
 * Compute available data variables at a given step position.
 * Variables come from all preceding steps' outputs + trigger output definitions.
 */
export function useDataVariables(steps: OnFlowStep[], stepIndex: number): DataVariable[] {
  return useMemo(() => {
    const vars: DataVariable[] = []
    for (let i = 0; i < stepIndex && i < steps.length; i++) {
      const step = steps[i]

      // If it's a trigger, add its defined output variables
      if (step.type === 'trigger') {
        const triggerDef = TRIGGER_DEFINITIONS.find((t) => t.id === step.toolId || t.defaultTool === step.toolId)
        if (triggerDef) {
          triggerDef.outputVariables.forEach((ov) => {
            vars.push({
              key: ov.key,
              label: ov.label,
              sourceStepId: step.id,
              type: ov.type,
            })
          })
        }
      }

      // Add explicit step outputs
      if (step.outputs && Object.keys(step.outputs).length > 0) {
        Object.entries(step.outputs).forEach(([key, value]) => {
          vars.push({
            key: `step.${step.id}.output.${key}`,
            label: value || key,
            sourceStepId: step.id,
            type: 'string',
          })
        })
      }

      // For actions, add common output fields based on service
      if (step.type === 'action' && Object.keys(step.outputs).length === 0) {
        vars.push({
          key: `step.${step.id}.output.result`,
          label: `${step.serviceName} result`,
          sourceStepId: step.id,
          type: 'object',
        })
        vars.push({
          key: `step.${step.id}.output.status`,
          label: `${step.serviceName} status`,
          sourceStepId: step.id,
          type: 'string',
        })
      }
    }

    return vars
  }, [steps, stepIndex])
}
