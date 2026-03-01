import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* ──────────────────────────────────────────── */
/*  Types                                      */
/* ──────────────────────────────────────────── */

interface ConversationEntry {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  message: string
  history: ConversationEntry[]
  /** When true, AI should generate the final .0n workflow JSON */
  generateWorkflow?: boolean
}

/* ──────────────────────────────────────────── */
/*  System Prompt                              */
/* ──────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are the 0n Create Agent — an expert AI that guides users through building the perfect .0n workflow file, one question at a time.

## Your Personality
- Conversational, encouraging, and concise
- Ask ONE question at a time — never multiple
- After each answer, briefly confirm what you heard, then ask the next question
- Use bullet options when possible so users can pick quickly

## The .0n Workflow Format
A .0n file is a JSON workflow definition with this structure:
\`\`\`json
{
  "$0n": {
    "version": "1.0.0",
    "type": "workflow",
    "created": "ISO-date",
    "name": "Workflow Name",
    "description": "What it does"
  },
  "trigger": {
    "type": "webhook|schedule|event|manual",
    "config": { ... }
  },
  "inputs": {
    "input_key": {
      "type": "string|number|boolean|select|textarea",
      "description": "What this input is for",
      "required": true,
      "placeholder": "example"
    }
  },
  "launch_codes": {
    "SERVICE_API_KEY": {
      "label": "Display Name",
      "description": "What key is needed",
      "type": "string",
      "required": true,
      "help_url": "https://where-to-get-it.com"
    }
  },
  "steps": [
    {
      "id": "step_id",
      "service": "service_name",
      "action": "what_this_step_does",
      "params": { ... },
      "description": "Human-readable explanation"
    }
  ]
}
\`\`\`

## Available Services (48)
crm, stripe, sendgrid, slack, discord, twilio, github, shopify, openai, anthropic, gmail, google_sheets, google_drive, airtable, notion, mongodb, supabase, zendesk, jira, hubspot, mailchimp, google_calendar, calendly, zoom, linear, microsoft, quickbooks, asana, intercom, dropbox, whatsapp, instagram, x_twitter, tiktok, google_ads, facebook_ads, plaid, square, linkedin, pipedrive, azure, aws_s3, vercel, cloudflare, twitch, reddit, pinterest, youtube

## Conversation Flow
1. **Greeting**: "What would you like to automate?" — offer 4-5 popular ideas as bullet options
2. **Services**: Based on their answer, suggest which services to use — ask if they agree
3. **Trigger**: Ask how the workflow should start (webhook, schedule, event, manual)
4. **Steps**: Walk through the key steps 1-by-1, confirming each
5. **Inputs**: Ask if users need to provide any custom inputs when running it
6. **Summary**: Show a clean summary of the workflow, ask for confirmation
7. **Generate**: When they confirm, output ONLY the JSON inside a \`\`\`json fence, nothing else

## When generating the final workflow:
- Output ONLY the JSON inside \`\`\`json ... \`\`\` code fences
- No additional text before or after the JSON
- Use real service IDs from the 26-service catalog
- Include proper launch_codes for every service that needs API keys
- Create meaningful step IDs (snake_case)
- Reference previous step outputs with {{step_id.output}}
- Set the created date to now

## Rules
1. NEVER say "GHL", "Go High Level", "High Level", or "HighLevel" — always say "CRM"
2. Refer to .0n files as "SWITCH files" and workflows as "RUNs" when using brand terminology
3. Keep responses under 4 sentences + options unless summarizing
4. Be encouraging: "Nice choice!" not "Input accepted."
5. When offering options, format as a numbered list or bullet points
6. After step 6 (summary), ask: "Ready to generate your SWITCH file?"
7. If the user says "generate", "build it", "create it", "yes", "let's go" — output the JSON immediately`

/* ──────────────────────────────────────────── */
/*  POST Handler                               */
/* ──────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { message, history } = body
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      text: "I'm not available right now — the AI service isn't configured. Ask your admin to set the ANTHROPIC_API_KEY.",
      workflow: null,
    })
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    // Build messages from history
    const messages: Anthropic.MessageParam[] = []
    const conversationHistory = Array.isArray(history) ? history.slice(-20) : []

    for (const entry of conversationHistory) {
      if (entry.role === 'user' || entry.role === 'assistant') {
        messages.push({
          role: entry.role,
          content: String(entry.content).slice(0, 6000),
        })
      }
    }

    messages.push({ role: 'user', content: String(message).slice(0, 6000) })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages,
    })

    const rawText =
      response.content[0]?.type === 'text'
        ? response.content[0].text
        : 'Unable to generate a response. Try again!'

    // Check if the response contains a .0n workflow JSON
    let workflow: Record<string, unknown> | null = null
    const jsonMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim())
        // Verify it looks like a .0n workflow
        if (parsed.$0n || parsed['0n'] || parsed.steps) {
          workflow = parsed
        }
      } catch {
        // Not valid JSON, that's fine
      }
    }

    // If workflow was generated, save it to workflow_files
    let savedWorkflowId: string | null = null
    if (workflow) {
      const header = (workflow.$0n || workflow['0n']) as Record<string, string> | undefined
      const name = header?.name || (workflow as { name?: string }).name || 'Untitled Workflow'

      const { data: wf } = await supabase
        .from('workflow_files')
        .insert({
          owner_id: user.id,
          file_key: `create_${Date.now()}`,
          name,
          description: header?.description || (workflow as { description?: string }).description || '',
          version: header?.version || '1.0.0',
          step_count: Array.isArray(workflow.steps) ? workflow.steps.length : 0,
          services_used: Array.isArray(workflow.steps)
            ? [...new Set((workflow.steps as Array<{ service?: string }>).map(s => s.service).filter(Boolean))]
            : [],
          tags: [],
          status: 'active',
          workflow_data: workflow,
        })
        .select('id')
        .single()

      if (wf) savedWorkflowId = wf.id
    }

    // Clean text (remove the JSON block for display)
    const displayText = workflow
      ? rawText.replace(/```(?:json)?\s*\n?[\s\S]*?\n?```/g, '').trim() || 'Your SWITCH file has been generated and saved!'
      : rawText

    return NextResponse.json({
      text: displayText,
      workflow,
      savedWorkflowId,
    })
  } catch (err) {
    console.error('[console/create] Anthropic error:', err)
    return NextResponse.json({
      text: 'Something went wrong generating your workflow. Please try again.',
      workflow: null,
    })
  }
}
