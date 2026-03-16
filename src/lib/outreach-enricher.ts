/**
 * Outreach Enricher — AI-Powered Lead Enrichment & Email Sequence Engine
 *
 * Ported from standalone Flask app to 0n Console module.
 * Uses Anthropic SDK with web search for live enrichment.
 */

import Anthropic from '@anthropic-ai/sdk'
import { callAI } from './ai-provider'

// ── Types ──

export type FieldKey = 'location_hook' | 'competitors' | 'bad_review' | 'recent_news' | 'pain_point' | 'lead_type'

export interface FieldConfig {
  label: string
  example: string
  prompt: string
}

export interface CustomField {
  name: string
  prompt: string
}

export interface TemplateStyle {
  label: string
  example: string
  instruction: string
}

export interface PersonalizationWeave {
  tag: string
  label: string
  example: string
  instruction: string
}

export interface LeadRow {
  [key: string]: string
}

export interface EnrichResult {
  row: LeadRow
  qualified: boolean
  qualifierResult: string
}

export interface SequenceConfig {
  service: string
  caseStudies: string
  guarantees: string
  ctas: string
  templates: string[]
  personalizations: string[]
}

// ── Field Prompts ──

export const FIELD_PROMPTS: Record<FieldKey, FieldConfig> = {
  location_hook: {
    label: 'Location Hook',
    example: "Saw you're one of the top [industry] companies in [City].",
    prompt: `Find the city or region that {company} serves or is based in. Check their website ({url}), Google search results, or any available signal (area code, address, LinkedIn). Then write ONE short casual sentence in this format: 'Saw you're one of the top [industry] companies in [City/Region].' Rules: 1. Return ONLY that one sentence. No explanation, no sources, no asterisks, no markdown. 2. If you can find ANY geographic signal (city, metro area, region, state), use it. 3. If truly no location can be determined, return exactly: Saw you're one of the top {industry} companies in the area. 4. Never ask a question. Never explain your reasoning. Output the sentence and nothing else.`,
  },
  competitors: {
    label: 'Competitors',
    example: 'Competitor A and Competitor B',
    prompt: `Name 2 well-known competitors for {company} in the {industry} space. Return ONLY: Name and Name. No explanation. No bullet points. No sentences. Just the two names separated by 'and'.`,
  },
  bad_review: {
    label: 'Bad Review',
    example: "Saw a 2-star review from Sarah saying you wouldn't refund her after the job ran three weeks late.",
    prompt: `You MUST actively search the web to find a real negative review for {company} ({url}). Work through these searches one by one until you find a negative review: 1. Search for '{company} reviews' and look for 1-3 star Google Maps reviews 2. Search for '{company} Yelp reviews' 3. Search for '{company} BBB complaints' 4. Search for '{company} Trustpilot' 5. Search for '{company} complaints' Find a specific reviewer first name and their complaint. Return ONLY this exact format — one sentence, nothing else: Saw a [X]-star review from [First name only] saying you [short casual phrase describing what the company did wrong, written as if speaking directly to them]. Critical: use 'you' not 'they' or the company name — this sentence will be sent directly to the prospect. Only return exactly the word 'skip' if after genuinely searching ALL of the above you find zero negative reviews anywhere. No markdown. No explanation. No sources list. One sentence only.`,
  },
  recent_news: {
    label: 'Recent News',
    example: 'Just saw they expanded to three new locations last month.',
    prompt: `You MUST actively search the web to find a recent update or news item about {company} ({url}). Work through these searches: 1. Search for '{company} news 2025' 2. Search for '{company} news 2024' 3. Search for '{company} new location expansion announcement' 4. Search for '{company} award recognition' 5. Search for '{company} hiring growth' 6. Visit their website and check for a news, blog, press, or updates page 7. Search for '{company} LinkedIn' You are looking for: new locations, new hires, funding, product launches, awards, partnerships, expansions, rebrands — anything notable. When you find something, return ONLY one short casual sentence (e.g. 'Just saw they opened a second location in Phoenix.'). Only return exactly the word 'skip' if after genuinely searching ALL of the above you find absolutely nothing recent. No markdown. No explanation. No sources list. One sentence only.`,
  },
  pain_point: {
    label: 'Pain Point',
    example: 'Scaling a team that size without the right systems in place is brutal.',
    prompt: `Based on {company}'s industry ({industry}) and size ({employees} employees), what is the single most common operational pain point companies like this face? Return ONLY one short casual sentence — written like you're saying it to a friend, not like a consultant. No explanation. No options. No markdown. One sentence only.`,
  },
  lead_type: {
    label: 'Lead Type',
    example: 'commercial roofing estimates',
    prompt: `Based on what {company} sells or does (industry: {industry}, website: {url}), what is the specific type of lead or client they want more of? Return ONLY a short lowercase noun phrase (e.g. 'booked demos', 'veneers appointments', 'commercial roofing estimates'). No explanation. No sentence. No punctuation at the end. The phrase only.`,
  },
}

// ── Template Styles ──

export const TEMPLATE_STYLES: Record<string, TemplateStyle> = {
  loom: {
    label: 'Loom video pitch',
    example: 'e.g. "I recorded a quick video for {{company_name}}... mind if I share it?"',
    instruction: `LOOM VIDEO PITCH: At least one Email 1 variant must be a Loom-style video pitch. You've recorded a short personalized video for {{first_name}} / {{company_name}} covering a relevant insight, result, or walkthrough tied to your case study or offer. Lead with what the video reveals or shows. Close with 'Mind if I share it with you here?' — never hard-sell. Just offer the video casually, like you genuinely made it for them.`,
  },
  two_things: {
    label: '"2 things" pitch',
    example: 'e.g. "2 things quick, I know you\'re busy: 1. [insight] 2. [CTA]"',
    instruction: `"2 THINGS" FORMAT: At least one Email 1 variant must use this exact format. Subject line: '2 things // checking in'. Open with: '2 things quick, I know you're busy:' Point 1: A specific observation, insight, or pain point about their situation. Point 2: Your offer + CTA to share an asset (video, guide, catalog). Close with one casual line: 'Mind if I share [it / the video] here?'`,
  },
  lead_magnet: {
    label: 'Lead magnet offer',
    example: 'e.g. "I put together a free guide for you on [X]... mind if I share it?"',
    instruction: `LEAD MAGNET FORMAT: At least one Email 1 variant must offer a free resource — a guide, checklist, PDF, template, or report you've put together for them. One sentence on what it covers and why it's relevant to their situation. Ask if you can share it. Do NOT directly pitch your service in this variant — let the free resource do the work. The ask is 'mind if I share it?' not 'want to hop on a call?'`,
  },
  one_sentence: {
    label: 'One-sentence pitch',
    example: 'e.g. "Are you looking for X? We do Y for companies like yours. Worth a look?"',
    instruction: `ONE-SENTENCE PITCH: At least one Email 1 variant must be ultra-short. The entire body of the email is: Hey {{first_name}}, + ONE single sentence that delivers the full value prop or creates sharp curiosity + one-line CTA. No bullet points, no pleasantries beyond the opener, no explanation, no context-setting. Think: a text message from someone who respects their time. Under 3 lines total.`,
  },
}

// ── Personalization Weave ──

export const PERSONALIZATION_WEAVE: Record<string, PersonalizationWeave> = {
  location_hook: {
    tag: '{{location_hook}}',
    label: 'Location Hook',
    example: "Saw you're one of the top [industry] companies in [City].",
    instruction: `{{location_hook}} is a sentence like 'Saw you're one of the top [industry] companies in [City].' Place it as the very first line of at least one Email 1 variant, right after 'Hey {{first_name}},' — then write the next sentence to flow directly from it into your pitch.`,
  },
  pain_point: {
    tag: '{{pain_point}}',
    label: 'Pain Point',
    example: 'Scaling a team that size without the right systems is brutal.',
    instruction: `{{pain_point}} is a short sentence naming their #1 operational pain. Use it in one variant as the hook — then pivot directly to your solution in the next sentence.`,
  },
  bad_review: {
    tag: '{{bad_review}}',
    label: 'Bad Review',
    example: 'Saw a 2-star review on Yelp from Sarah saying the delivery arrived late.',
    instruction: `{{bad_review}} is a specific negative review found online. Use it as a pain-point hook in one variant — acknowledge it and pivot to how your service fixes the exact issue.`,
  },
  recent_news: {
    tag: '{{recent_news}}',
    label: 'Recent News',
    example: 'Just saw they expanded to three new locations last month.',
    instruction: `{{recent_news}} is a casual news hook. Use it as the very first line of one variant — then connect it to your pitch in the next sentence.`,
  },
  lead_type: {
    tag: '{{lead_type}}',
    label: 'Lead Type',
    example: 'commercial roofing estimates',
    instruction: `{{lead_type}} is the specific type of lead/client they want. Weave it into at least one email to make the pitch ultra-specific: '...helping [industry] teams get more {{lead_type}}'.`,
  },
  competitors: {
    tag: '{{competitors}}',
    label: 'Competitors',
    example: 'ServiceMaster and Terminix',
    instruction: `{{competitors}} is two well-known industry competitors. Use for competitive urgency or positioning in one variant — only include if it adds genuine pressure.`,
  },
}

// ── Reply Templates ──

export const REPLY_TEMPLATES = {
  pricing_inquiry: {
    label: 'Pricing Inquiry',
    template: `Pricing fully depends on what brand you'd like (Nike, Travis Mathew, North Face, YETI) - and how much quantity you're looking for. We can map out pricing on a quick call and mock up some samples, how's {day1} or {day2} at 2 PM EST work?`,
  },
  video_request: {
    label: 'Video Request Follow-up',
    template: `Hey {firstName}, Here's a quick video going over our catalog and a few custom hats we've made recently: [Loom link] How does {day1} or {day2} work for a quick call to mock up some samples and go over pricing? Feel free to send over a few times or grab time on my calendar here: [Cal link]`,
  },
}

// ── Core Functions ──

/**
 * Run a prompt through AI with automatic provider fallback.
 * Uses ai-provider.ts for multi-provider support (10 providers).
 * Falls back to Anthropic SDK only when web search tool is required.
 */
async function runClaude(prompt: string, useWebSearch = false): Promise<string> {
  // Web search requires Anthropic SDK (provider-specific tool)
  if (useWebSearch && process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }
      const response = await client.messages.create(params)
      const textBlocks = response.content.filter(
        (block: { type: string }) => block.type === 'text'
      )
      const text = textBlocks
        .map((block: { type: string; text?: string }) => block.text || '')
        .join('')
        .trim()
      if (text) return text
    } catch {
      // Fall through to multi-provider
    }
  }

  // Standard call — use ai-provider with automatic fallback
  const result = await callAI({
    system: 'You are an expert lead research and enrichment AI. Be concise and factual.',
    user: prompt,
    maxTokens: 1024,
  })

  if (!result) {
    throw new Error('All AI providers failed for enrichment. Configure at least one API key.')
  }

  return result.text
}

/**
 * Qualify a lead for buying intent.
 * Returns 'Qualified' or 'Skip - No Intent'
 */
export async function qualifyLead(
  company: string,
  url: string
): Promise<string> {
  const prompt =
    `You are screening leads for an outreach campaign. ` +
    `Only companies that show positive buying intent should receive emails. ` +
    `Location does not disqualify a lead.\n\n` +
    `Company: ${company}\nWebsite: ${url}\n\n` +
    `Intent Signals: Search for ANY of these positive signals: ` +
    `hiring for relevant roles, recent growth or expansion, new location opening, funding received, ` +
    `awards won, or job postings that suggest they need outside services.\n\n` +
    `Return ONLY one of these exact responses — nothing else:\n` +
    `Qualified\n` +
    `Skip - No Intent\n\n` +
    `No explanation. No markdown. One of those two responses only.`

  const result = await runClaude(prompt, true)
  // Normalize result
  if (result.toLowerCase().includes('qualified') && !result.toLowerCase().includes('skip')) {
    return 'Qualified'
  }
  return 'Skip - No Intent'
}

/**
 * Enrich a single field for a lead.
 */
export async function enrichField(
  fieldKey: FieldKey,
  company: string,
  url: string,
  industry: string,
  employees: string
): Promise<string> {
  const cfg = FIELD_PROMPTS[fieldKey]
  if (!cfg) return ''

  const prompt =
    `You are enriching a cold outreach CSV. ` +
    `Write like a human — short, casual, conversational. ` +
    `No corporate language. One sentence or short fragment only.\n\n` +
    cfg.prompt
      .replace(/{company}/g, company)
      .replace(/{url}/g, url)
      .replace(/{industry}/g, industry)
      .replace(/{employees}/g, employees)

  // Use web search for fields that need live data
  const needsWeb = ['bad_review', 'recent_news', 'location_hook', 'lead_type'].includes(fieldKey)
  return runClaude(prompt, needsWeb)
}

/**
 * Enrich a custom field for a lead.
 */
export async function enrichCustomField(
  fieldPrompt: string,
  company: string,
  url: string,
  industry: string
): Promise<string> {
  const prompt =
    `You are enriching a cold outreach CSV. ` +
    `Write like a human — short, casual, conversational. ` +
    `No corporate language. One sentence or short fragment only.\n\n` +
    `Company: ${company}\nWebsite: ${url}\nIndustry: ${industry}\n\n` +
    fieldPrompt

  return runClaude(prompt, true)
}

/**
 * Enrich a full lead row — qualify first, then enrich selected fields.
 */
export async function enrichRow(
  row: LeadRow,
  fields: FieldKey[],
  customFields: CustomField[]
): Promise<EnrichResult> {
  const company = row['Company Name'] || row['company_name'] || 'Unknown'
  const url = row['Company URL'] || row['company_domain'] || ''
  const industry = row['Industry'] || row['company_micro_industry'] || ''
  const employees = row['Employees Range'] || ''

  // Step 1: Qualify
  const qualifierResult = await qualifyLead(company, url)
  const enriched: LeadRow = { ...row, 'FL Qualified': qualifierResult }

  if (qualifierResult !== 'Qualified') {
    return { row: enriched, qualified: false, qualifierResult }
  }

  // Step 2: Enrich fields (sequentially to avoid rate limits)
  for (const fieldKey of fields) {
    try {
      const value = await enrichField(fieldKey, company, url, industry, employees)
      enriched[FIELD_PROMPTS[fieldKey].label] = value
    } catch {
      enriched[FIELD_PROMPTS[fieldKey].label] = 'Error: enrichment failed'
    }
  }

  // Step 3: Custom fields
  for (const cf of customFields) {
    if (cf.name && cf.prompt) {
      try {
        const value = await enrichCustomField(cf.prompt, company, url, industry)
        enriched[cf.name] = value
      } catch {
        enriched[cf.name] = 'Error: enrichment failed'
      }
    }
  }

  return { row: enriched, qualified: true, qualifierResult }
}

/**
 * Generate a cold email sequence.
 */
export async function generateSequence(config: SequenceConfig): Promise<string> {
  // Build personalization section
  let persSection = ''
  if (config.personalizations.length > 0) {
    const validPers = config.personalizations.filter(p => p in PERSONALIZATION_WEAVE)
    if (validPers.length > 0) {
      const lines = [
        'PERSONALIZATION MERGE TAGS — embed these exact placeholder tags into the copy where they fit naturally. ' +
        'Write the sentences AROUND each tag so the copy reads seamlessly when the real value is swapped in. ' +
        'Output the tags LITERALLY (e.g. {{location_hook}}) — never substitute example values.\n',
      ]
      for (const p of validPers) {
        lines.push(`• ${PERSONALIZATION_WEAVE[p].instruction}`)
      }
      lines.push('\nUse each tag AT MOST ONCE across the full sequence.')
      persSection = '\n' + lines.join('\n') + '\n'
    }
  }

  // Build template section
  let templateSection = ''
  if (config.templates.length > 0) {
    const valid = config.templates.filter(t => t in TEMPLATE_STYLES)
    if (valid.length > 0) {
      const lines = [
        'SELECTED EMAIL TEMPLATES — you MUST incorporate each of these formats into one of your 1A–1D variants. ' +
        'Assign one template per variant. If fewer than 4 templates are selected, fill remaining variants with the default opener angles.\n',
      ]
      for (const t of valid) {
        lines.push(`• ${TEMPLATE_STYLES[t].instruction}`)
      }
      templateSection = '\n' + lines.join('\n') + '\n'
    }
  }

  const prompt =
    'You are an expert cold email copywriter. Write a 3-step cold email sequence in plain text only.\n\n' +
    'STRICT FORMAT — output exactly this structure, nothing else:\n\n' +
    'EMAIL 1\n\n' +
    '1A\nSubject: [subject]\nHey {{first_name}},\n[body]\n\n' +
    '1B\nSubject: [subject]\nHey {{first_name}},\n[body]\n\n' +
    '1C\nSubject: [subject]\nHey {{first_name}},\n[body]\n\n' +
    '1D\nSubject: [subject]\nHey {{first_name}},\n[body]\n\n' +
    'EMAIL 2\n\n' +
    '2A\n[body]\n\n' +
    '2B\n[body]\n\n' +
    'EMAIL 3\n\n' +
    '3A\n[body]\n\n' +
    '3B\n[body]\n\n' +
    '---\n\n' +
    'SUBJECT LINE RULES:\n' +
    '- Email 1 variants (1A, 1B, 1C, 1D) each get ONE subject line. Only ever use these three, one per variant:\n' +
    '  1. quick question\n' +
    '  2. 2 things // checking in\n' +
    '  3. {{company_name}} x [Brand/Service] - intro\n' +
    '- Email 2 and Email 3 variants NEVER have a subject line. No exceptions.\n\n' +
    'WRITING RULES:\n' +
    '- 3-5 sentences max per email. Shorter is always better.\n' +
    '- Sound like a real person texting a business contact, not a marketer writing ad copy.\n' +
    '- Lead with the direct pitch upfront. Never bury the value.\n' +
    '- CTAs must offer a specific asset: a video, catalog, portfolio, or sample. Never ask for a sales call as the primary CTA.\n' +
    '- Use specific industry terminology to sound like an insider.\n' +
    '- Use the case studies EXACTLY as provided, never fabricate, exaggerate, or invent numbers or client names.\n' +
    '- Include the guarantee exactly as provided.\n' +
    '- NEVER use em dashes (—) or double dashes (--) anywhere in any email.\n\n' +
    'DEFAULT OPENER ANGLES:\n' +
    "- 1A: Direct question opener (e.g. 'Are you looking for X right now?')\n" +
    '- 1B: Lead with the case study result upfront\n' +
    "- 1C: '2 things // checking in' with two numbered points\n" +
    "- 1D: 'I'll cut the fluff:' OR pain-point opener ('Most [prospects] struggle with X.')\n" +
    persSection +
    templateSection +
    '\nEMAIL 2 RULES: Even shorter than Email 1. Restate core value + one proof point + CTA to share an asset.\n' +
    'EMAIL 3 RULES: Shortest emails. 3A references a specific asset (video/catalog) and asks to share it. ' +
    '3B asks who the right person is to connect with about this.\n\n' +
    `CAMPAIGN DETAILS:\n` +
    `Service being sold: ${config.service}\n` +
    `Case studies (use ONLY these, verbatim — never invent new ones): ${config.caseStudies}\n` +
    `Guarantees: ${config.guarantees}\n` +
    `CTAs to test: ${config.ctas}\n\n` +
    'Output the full sequence in plain text only. No commentary, no explanations, no preamble.'

  return runClaude(prompt, false)
}
