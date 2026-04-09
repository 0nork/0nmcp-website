// Variable resolution engine for .0n workflow files
// Resolves {{variable}}, {{contact.field}}, {{trigger.field}}, {{step_N.key}}

export function resolveVariables(
  template: string,
  context: {
    variables?: Array<{ name: string; value: string; source: string }>
    triggerData?: Record<string, unknown>
    contactData?: Record<string, string>
    stepOutputs?: Record<string, Record<string, unknown>>
  }
): string {
  let resolved = template

  // Static variables
  for (const v of context.variables || []) {
    if (v.source === 'static') {
      resolved = resolved.replaceAll(`{{${v.name}}}`, v.value)
    }
  }

  // Trigger data
  if (context.triggerData) {
    resolved = resolved.replace(/\{\{trigger\.([^}]+)\}\}/g, (_, key) =>
      String(getNestedValue(context.triggerData!, key) ?? '')
    )
  }

  // Contact fields
  if (context.contactData) {
    resolved = resolved.replace(/\{\{contact\.([^}]+)\}\}/g, (_, key) =>
      context.contactData![key] ?? ''
    )
  }

  // Step outputs
  if (context.stepOutputs) {
    resolved = resolved.replace(/\{\{(step_\d+)\.([^}]+)\}\}/g, (_, stepId, key) =>
      String(context.stepOutputs![stepId]?.[key] ?? '')
    )
  }

  return resolved
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}
