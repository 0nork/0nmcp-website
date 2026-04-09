// K-Layer AI — detect workflow intent and route to generator

const WORKFLOW_PATTERNS = [
  /when (a |an )?(new |)?(contact|lead|customer|order|payment|appointment)/i,
  /if (a |an )?(contact|lead|someone|they)/i,
  /every time/i,
  /automatically (send|create|add|update|notify|email|text)/i,
  /create .* and (then |)(send|email|text|notify|add)/i,
  /whenever/i,
  /workflow/i,
  /automate/i,
  /set up .* (when|that|to)/i,
  /trigger/i,
  /sequence/i,
  /blast .* (to|all)/i,
]

export function requiresWorkflow(message: string): boolean {
  return WORKFLOW_PATTERNS.some(p => p.test(message))
}

export async function handleWorkflowIntent(
  message: string,
  subLocationId: string,
  baseUrl: string = ''
): Promise<string> {
  const res = await fetch(`${baseUrl}/api/workflows/generate-and-run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: message,
      sub_location_id: subLocationId,
      context: 'k_layer_chat',
    }),
  })

  const result = await res.json()

  if (!result.success) {
    return `I couldn't create that workflow: ${result.error}. Check that the required integrations are connected in Settings.`
  }

  if (result.reused_existing) {
    return `Found and re-ran your existing "${result.workflow_name}" workflow.`
  }

  return `Done. I created "${result.workflow_name}" with ${result.steps} steps.${
    result.executed ? ' It executed immediately.' : ' It will trigger automatically on the configured event.'
  } You can find it in your Workflow Library.`
}
