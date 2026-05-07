import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUser() {
  const supabase = await createSupabaseServer()
  if (!supabase) return null
  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  return user
}

// Template-based sequence generation (no API cost)
function generateTemplateSequence(
  icp: string,
  callToAction: string,
  tone: string,
  steps: number
): Array<{ step_number: number; delay_days: number; subject_a: string; subject_b: string; body: string; personalization_tokens: string[] }> {
  const delays = [0, 3, 7, 14, 21, 28, 35].slice(0, steps)
  const toneMap: Record<string, { opener: string; style: string }> = {
    direct: { opener: 'Quick question', style: 'concise and to the point' },
    consultative: { opener: 'Thought you might find this relevant', style: 'helpful and advisory' },
    casual: { opener: 'Hey {{first_name}}', style: 'friendly and conversational' },
  }
  const t = toneMap[tone] || toneMap.direct

  return delays.map((delay, i) => ({
    step_number: i + 1,
    delay_days: delay,
    subject_a: i === 0
      ? `${t.opener} about {{company}}`
      : i === steps - 1
        ? `Last note, {{first_name}}`
        : `Re: ${t.opener} about {{company}}`,
    subject_b: i === 0
      ? `{{first_name}}, quick thought for {{company}}`
      : i === steps - 1
        ? `Closing the loop, {{first_name}}`
        : `Following up — {{company}}`,
    body: i === 0
      ? `Hi {{first_name}},\n\n{first_line}\n\nI noticed {{company}} fits the profile of teams we work with — ${icp}.\n\nWe help companies like yours ${callToAction}.\n\nWould it make sense to connect for 15 minutes this week?\n\nBest,\n{{sender_name}}`
      : i === steps - 1
        ? `Hi {{first_name}},\n\nI've reached out a few times and understand you may be busy. I'll keep this brief — if ${callToAction} isn't a priority right now, no worries at all.\n\nIf it is, I'd love to help. Just reply and we can find a time.\n\nBest,\n{{sender_name}}`
        : `Hi {{first_name}},\n\nJust following up on my previous note. I know things get buried.\n\nWould love to share how we've helped teams like {{company}} ${callToAction}.\n\nOpen to a quick chat?\n\nBest,\n{{sender_name}}`,
    personalization_tokens: ['{first_line}', '{{first_name}}', '{{company}}', '{{sender_name}}'],
  }))
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = getAdmin()
    const { data, error } = await admin
      .from('onmail_sequences')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ sequences: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      name,
      icp_description,
      call_to_action = 'book a meeting',
      tone = 'direct',
      steps: stepCount = 5,
      generate = false,
    } = body

    const admin = getAdmin()

    let generatedSteps: ReturnType<typeof generateTemplateSequence> = []

    if (generate) {
      // Try Anthropic first if key is available, fall back to template
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const { default: Anthropic } = await import('@anthropic-ai/sdk')
          const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

          const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
              role: 'user',
              content: `Generate a ${stepCount}-step cold email sequence for this ICP: "${icp_description}".
Call to action: "${call_to_action}".
Tone: ${tone}.

Return a JSON array where each element has:
- step_number (1-indexed)
- delay_days (0 for first, then 3, 7, 14, 21, etc.)
- subject_a (primary subject line)
- subject_b (A/B variant subject line)
- body (email body with {{first_name}}, {{company}}, {first_line}, {{sender_name}} tokens)
- personalization_tokens (array of tokens used)

Return ONLY the JSON array, no explanation.`
            }],
          })

          const text = message.content[0].type === 'text' ? message.content[0].text : ''
          const jsonMatch = text.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            generatedSteps = JSON.parse(jsonMatch[0])
          } else {
            generatedSteps = generateTemplateSequence(icp_description, call_to_action, tone, stepCount)
          }
        } catch {
          generatedSteps = generateTemplateSequence(icp_description, call_to_action, tone, stepCount)
        }
      } else {
        generatedSteps = generateTemplateSequence(icp_description, call_to_action, tone, stepCount)
      }
    }

    const { data, error } = await admin
      .from('onmail_sequences')
      .insert({
        user_id: user.id,
        name: name || `Sequence — ${icp_description?.slice(0, 40) || 'Untitled'}`,
        icp_description,
        steps: generate ? generatedSteps : body.steps || [],
        status: 'draft',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ sequence: data, steps: generatedSteps })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
