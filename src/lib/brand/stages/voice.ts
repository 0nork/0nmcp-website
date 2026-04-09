import Anthropic from '@anthropic-ai/sdk'
import { extractJSON } from '../utils/jsonExtract'
import type { BrandInput, ExtractedBrand, GeneratedAssets, BrandVoice } from '@/types/brand'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514'

export async function stageBrandVoice(
  input: BrandInput & ExtractedBrand & GeneratedAssets
): Promise<BrandInput & ExtractedBrand & GeneratedAssets & { brandVoice: BrandVoice }> {

  const res = await client.messages.create({
    model,
    max_tokens: 1200,
    messages: [{ role: 'user', content: voicePrompt(input) }],
  })

  const raw = res.content.filter(b => b.type === 'text').map(b => (b as Anthropic.TextBlock).text).join('')
  const brandVoice = extractJSON<BrandVoice>(raw)

  return { ...input, brandVoice }
}

function voicePrompt(input: BrandInput & ExtractedBrand) {
  const colors = [input.primary_color, input.secondary_color, input.accent_color].filter(Boolean).join(', ')

  return `Generate a complete brand voice profile for ${input.business_name ?? 'this business'}.

Industry: ${input.industry ?? 'local business'}
Description: ${input.description ?? input.business_description ?? 'professional service business'}
Style: ${input.style_description ?? 'modern professional'}
Color palette: ${colors}

Return ONLY valid JSON. No markdown. No explanation. Exactly this structure:

{
  "tone": "one word",
  "personality_traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "dos": [
    "Do use direct, confident language",
    "Do lead with customer outcomes",
    "Do use specific numbers and facts",
    "Do speak to pain points directly",
    "Do end CTAs with urgency"
  ],
  "donts": [
    "Don't use jargon the customer doesn't use",
    "Don't make claims without proof",
    "Don't use passive voice",
    "Don't bury the CTA",
    "Don't sound generic"
  ],
  "power_keywords": ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8"],
  "prohibited_words": ["word1", "word2", "word3"],
  "tagline_options": ["Option 1", "Option 2", "Option 3"],
  "sample_headline": "Example headline",
  "sample_body": "Example 2-sentence body copy",
  "sample_cta": "Example CTA button text"
}`
}
