import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* ──────────────────────────────────────────── */
/*  Types                                      */
/* ──────────────────────────────────────────── */

interface WizardState {
  step: string
  template: { name: string; description: string } | null
  trigger: { label: string; description: string } | null
  selectedServices: string[]
  notifications: string[]
  frequency: { type: string; cron?: string } | null
}

interface ConversationEntry {
  role: 'user' | 'assistant'
  text: string
}

interface RequestBody {
  message: string
  wizardState: WizardState
  history: ConversationEntry[]
}

/* ──────────────────────────────────────────── */
/*  System Prompt Builder                      */
/* ──────────────────────────────────────────── */

function buildSystemPrompt(wizardState: WizardState): string {
  const lines = [
    'You are the 0n Console AI assistant, guiding users through creating a workflow automation.',
    '',
    `Current wizard step: ${wizardState.step}`,
    `Selected template: ${wizardState.template?.name || 'None'}`,
    `Selected trigger: ${wizardState.trigger?.label || 'None'}`,
    `Selected services: ${wizardState.selectedServices?.join(', ') || 'None'}`,
    '',
    'Based on the current step, provide helpful, concise guidance. Keep responses under 3 sentences.',
  ]

  switch (wizardState.step) {
    case 'landing':
      lines.push(
        'The user is on the LANDING step. Suggest popular templates like:',
        '  - Automated LinkedIn Posts (AI-generated content on a schedule)',
        '  - Lead Capture Pipeline (CRM + email + Slack alerts)',
        '  - Payment Notifications (Stripe + Slack + email)',
        '  - Auto Blogging (AI content + CMS publishing)',
        '  - Social Media Scheduler (multi-platform posting)',
        'Ask what kind of automation they want to build.',
      )
      break
    case 'trigger':
      lines.push(
        'The user is on the TRIGGER step. Explain trigger types relevant to their template.',
        'Available triggers: Webhook, Schedule (cron), Form Submission, New Contact (CRM), Payment Received (Stripe), Email Received (Gmail), Message Received (Slack), Manual Trigger, GitHub Event, Database Change (Supabase).',
        'Recommend the best trigger for their use case.',
      )
      break
    case 'actions':
      lines.push(
        'The user is on the ACTIONS step. Suggest complementary services that work well together.',
        'Popular combos: AI + Slack + Email, CRM + AI + Notifications, GitHub + Slack + Discord.',
        'Mention which services pair well with the ones already selected.',
      )
      break
    case 'notifications':
      lines.push(
        'The user is on the NOTIFICATIONS step. Recommend channels based on their workflow type.',
        'Options: Slack (team), Discord (community), Email (customers), SMS/Twilio (urgent), Webhook (custom).',
        'Most team workflows use Slack. Customer-facing ones use email.',
      )
      break
    case 'building':
      lines.push(
        'The workflow is being built. Reassure the user that the build is in progress.',
        'Let them know it usually takes just a few seconds and the AI is assembling their workflow.',
      )
      break
    case 'credentials':
      lines.push(
        'The user needs to enter API keys. Help them find their credentials.',
        'Common locations: Stripe Dashboard > Developers > API keys, Slack API > Your Apps > OAuth Tokens,',
        'SendGrid > Settings > API Keys, GitHub > Settings > Developer settings > Personal access tokens.',
        'Guide them to the right dashboard for the service they are connecting.',
      )
      break
    case 'completion':
      lines.push(
        'The workflow is done! Congratulate the user and suggest next steps:',
        '  - Download the .0n SWITCH file for local use',
        '  - Open in the Visual Builder for fine-tuning',
        '  - Save to Operations to run it immediately',
        '  - Create another workflow to extend this automation',
      )
      break
    default:
      lines.push('Help the user with their workflow automation needs.')
      break
  }

  lines.push(
    '',
    'Always end with 2-3 suggested follow-up messages the user could send.',
    'Format each suggestion on its own line starting with ">" (e.g., "> What services pair well with Slack?")',
    '',
    'Rules:',
    '1. Never say "GHL", "Go High Level", "High Level", or "HighLevel" -- always say "CRM".',
    '2. Refer to .0n files as "SWITCH files" and workflows as "RUNs" when using brand terminology.',
    '3. Be encouraging, concise, and helpful.',
  )

  return lines.join('\n')
}

/* ──────────────────────────────────────────── */
/*  Suggestion Parser                          */
/* ──────────────────────────────────────────── */

function parseSuggestions(rawText: string): { text: string; suggestions: string[] } {
  const lines = rawText.split('\n')
  const suggestions: string[] = []
  const textLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    // Match lines starting with "> " or "-> " or unicode arrow
    if (
      trimmed.startsWith('> ') ||
      trimmed.startsWith('-> ') ||
      trimmed.startsWith('\u2192 ')
    ) {
      const suggestion = trimmed
        .replace(/^(>|->|\u2192)\s*/, '')
        .replace(/^["']|["']$/g, '')
        .trim()
      if (suggestion.length > 0 && suggestion.length < 120) {
        suggestions.push(suggestion)
      }
    } else {
      textLines.push(line)
    }
  }

  return {
    text: textLines.join('\n').trim(),
    suggestions: suggestions.slice(0, 4),
  }
}

/* ──────────────────────────────────────────── */
/*  Fallback Messages                          */
/* ──────────────────────────────────────────── */

function getFallbackResponse(step: string): { text: string; suggestions: string[] } {
  switch (step) {
    case 'landing':
      return {
        text: 'I can help you pick the right template! What kind of automation are you looking to build?',
        suggestions: [
          'I want to automate social media posting',
          'I need lead capture and CRM automation',
          'Help me set up payment notifications',
        ],
      }
    case 'trigger':
      return {
        text: 'Each trigger defines when your workflow starts. Schedule triggers run on a timer, webhooks fire on HTTP events, and the rest respond to specific service events.',
        suggestions: [
          'Which trigger is best for content automation?',
          'What is a webhook trigger?',
          'I want it to run on a schedule',
        ],
      }
    case 'actions':
      return {
        text: 'Pick the services your workflow should connect. Popular combos include AI + messaging and CRM + email.',
        suggestions: [
          'What services work well together?',
          'I want to use AI in my workflow',
          'Show me the most popular combos',
        ],
      }
    case 'notifications':
      return {
        text: 'Most users go with Slack for team notifications and email for customer-facing alerts. You can pick multiple!',
        suggestions: [
          'I want Slack notifications',
          'What about SMS alerts?',
          'Skip notifications for now',
        ],
      }
    case 'building':
      return {
        text: 'Your workflow is being assembled right now. This usually takes just a few seconds!',
        suggestions: [],
      }
    case 'credentials':
      return {
        text: 'You will need API keys for each service. Check your service dashboards for the keys, or use your 0n Vault if you have already stored them.',
        suggestions: [
          'Where do I find my Stripe API key?',
          'How do I get a Slack token?',
          'I already have keys in my Vault',
        ],
      }
    case 'completion':
      return {
        text: 'Your workflow is ready! You can download the .0n SWITCH file, open it in the visual builder, or save it to your operations dashboard.',
        suggestions: [
          'What should I do next?',
          'How do I test this workflow?',
          'I want to create another one',
        ],
      }
    default:
      return {
        text: 'Tell me what you would like to automate, and I will help you build the perfect workflow.',
        suggestions: [
          'What can I automate?',
          'Show me popular templates',
        ],
      }
  }
}

/* ──────────────────────────────────────────── */
/*  POST Handler                               */
/* ──────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  // Validate request body (auth is optional for simplicity)
  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { message, wizardState, history } = body

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  if (!wizardState || !wizardState.step) {
    return NextResponse.json({ error: 'Wizard state is required' }, { status: 400 })
  }

  // Optional auth check -- don't require it
  const supabase = await createSupabaseServer()
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    // Log user if present but don't block
    if (user) {
      // Authenticated request -- could log analytics here
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Return local fallback when no API key configured
    const fallback = getFallbackResponse(wizardState.step)
    return NextResponse.json({
      text: fallback.text,
      suggestions: fallback.suggestions,
    })
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const systemPrompt = buildSystemPrompt(wizardState)

    // Map conversation history to Anthropic messages format
    const messages: Anthropic.MessageParam[] = []

    const conversationHistory = Array.isArray(history)
      ? history.slice(-16)
      : []

    for (const entry of conversationHistory) {
      if (entry.role === 'user' || entry.role === 'assistant') {
        messages.push({
          role: entry.role,
          content: String(entry.text).slice(0, 4000),
        })
      }
    }

    // Add the new user message
    messages.push({
      role: 'user',
      content: String(message).slice(0, 4000),
    })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    })

    const rawText =
      response.content[0]?.type === 'text'
        ? response.content[0].text
        : 'I am having trouble generating a response. Try again!'

    // Parse suggestions from the response
    const { text, suggestions } = parseSuggestions(rawText)

    return NextResponse.json({
      text: text || rawText,
      suggestions,
    })
  } catch (err) {
    console.error('[wizard/chat] Anthropic error:', err)

    // Return helpful fallback on error
    const fallback = getFallbackResponse(wizardState.step)
    return NextResponse.json({
      text: fallback.text,
      suggestions: fallback.suggestions,
    })
  }
}
