/**
 * Dynamic Fields Endpoint
 * POST /api/marketplace/actions/fields
 *
 * Called by the CRM workflow builder to populate dynamic dropdown options.
 * When a user selects a service, this returns the available tools for that service.
 *
 * Request format:
 * { "data": { "service": "stripe" }, "meta": { "key": "execute_tool" } }
 *
 * Response format:
 * { "fields": [{ "key": "tool", "name": "Tool", "type": "select", "options": [...] }] }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServiceOptions, getToolOptions, SERVICE_CATALOG } from '@/lib/marketplace'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data = {}, meta = {} } = body
    const actionKey = meta.key || 'execute_tool'

    if (actionKey === 'execute_tool') {
      return NextResponse.json(getExecuteToolFields(data))
    } else if (actionKey === 'run_workflow') {
      return NextResponse.json(getWorkflowFields())
    } else if (actionKey === 'ai_generate') {
      return NextResponse.json(getAIFields())
    }

    return NextResponse.json({ fields: [] })
  } catch (error) {
    console.error('Dynamic fields error:', error)
    return NextResponse.json({ fields: [] })
  }
}

function getExecuteToolFields(data: Record<string, unknown>) {
  const selectedService = data.service as string | undefined

  // Base field: service selector (always shown)
  const fields: Record<string, unknown>[] = [
    {
      key: 'service',
      name: 'Service',
      type: 'select',
      required: true,
      description: 'Select the service to use',
      altersDynamicFields: true,
      options: getServiceOptions(),
    },
  ]

  // If service is selected, show tool dropdown
  if (selectedService) {
    const toolOptions = getToolOptions(selectedService)
    fields.push({
      key: 'tool',
      name: 'Tool',
      type: 'select',
      required: true,
      description: `Select the ${selectedService} tool to execute`,
      options: toolOptions,
    })

    // Add common input fields based on service type
    const service = SERVICE_CATALOG.find((s) => s.key === selectedService)
    if (service) {
      fields.push(
        {
          key: 'input_1',
          name: 'Primary Input',
          type: 'string',
          required: false,
          description: 'Primary input value (e.g., email, name, message). Supports {{contact.email}} variables.',
        },
        {
          key: 'input_2',
          name: 'Secondary Input',
          type: 'string',
          required: false,
          description: 'Secondary input value. Supports {{contact.name}} variables.',
        },
        {
          key: 'input_3',
          name: 'Additional Input',
          type: 'textarea',
          required: false,
          description: 'Additional data (JSON or text). Supports workflow variables.',
        }
      )
    }
  }

  return { fields }
}

function getWorkflowFields() {
  return {
    fields: [
      {
        key: 'workflow_name',
        name: 'Workflow Name',
        type: 'string',
        required: true,
        description: 'The name of the .0n workflow file to execute',
      },
      {
        key: 'input_data',
        name: 'Workflow Inputs',
        type: 'textarea',
        required: false,
        description: 'JSON object of input variables for the workflow. Supports {{contact.*}} variables.',
      },
    ],
  }
}

function getAIFields() {
  return {
    fields: [
      {
        key: 'prompt',
        name: 'Prompt',
        type: 'textarea',
        required: true,
        description: 'The AI prompt. Use {{contact.name}}, {{contact.email}} etc. for personalization.',
      },
      {
        key: 'content_type',
        name: 'Content Type',
        type: 'select',
        required: false,
        options: [
          { value: 'email', label: 'Email' },
          { value: 'sms', label: 'SMS Message' },
          { value: 'social_post', label: 'Social Media Post' },
          { value: 'blog', label: 'Blog Post' },
          { value: 'proposal', label: 'Proposal/Quote' },
          { value: 'custom', label: 'Custom Content' },
        ],
      },
      {
        key: 'model',
        name: 'AI Model',
        type: 'select',
        required: false,
        options: [
          { value: 'anthropic', label: 'Claude (Anthropic)' },
          { value: 'openai', label: 'GPT (OpenAI)' },
        ],
      },
      {
        key: 'max_tokens',
        name: 'Max Length',
        type: 'select',
        required: false,
        options: [
          { value: '256', label: 'Short (SMS/subject)' },
          { value: '512', label: 'Medium (email)' },
          { value: '1024', label: 'Long (blog section)' },
          { value: '4096', label: 'Extra Long (full article)' },
        ],
      },
    ],
  }
}
