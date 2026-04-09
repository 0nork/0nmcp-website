// CRM Workflow Executor — triggers a created workflow

export async function executeWorkflow(params: {
  crmWorkflowId: string
  subLocationId: string
  workflowFile: Record<string, unknown>
  executionId?: string
}): Promise<Record<string, unknown>> {
  const res = await fetch(
    `${process.env.CRM_BASE_URL}/locations/${params.subLocationId}/workflows/${params.crmWorkflowId}/execute`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRM_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': process.env.CRM_API_VERSION || '2021-07-28',
      },
      body: JSON.stringify({ trigger_data: {} }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Workflow execution failed: ${res.status} ${err}`)
  }

  return res.json()
}
