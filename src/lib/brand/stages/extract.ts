import Anthropic from '@anthropic-ai/sdk'
import { extractJSON } from '../utils/jsonExtract'
import type { BrandInput, ExtractedBrand } from '@/types/brand'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514'

export async function stageExtract(input: BrandInput & Partial<ExtractedBrand>): Promise<BrandInput & ExtractedBrand> {
  let raw: string

  switch (input.mode) {
    case 'url': {
      const res = await client.messages.create({
        model,
        max_tokens: 1500,
        messages: [{ role: 'user', content: urlPrompt(input.source_url!) }],
      })
      raw = res.content.filter(b => b.type === 'text').map(b => (b as Anthropic.TextBlock).text).join('')
      break
    }
    case 'logo': {
      const res = await client.messages.create({
        model,
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'url', url: input.logo_url! } },
            { type: 'text', text: logoPrompt() },
          ],
        }],
      })
      raw = res.content.filter(b => b.type === 'text').map(b => (b as Anthropic.TextBlock).text).join('')
      break
    }
    case 'colors': {
      const res = await client.messages.create({
        model,
        max_tokens: 800,
        messages: [{ role: 'user', content: colorPrompt(input) }],
      })
      raw = res.content.filter(b => b.type === 'text').map(b => (b as Anthropic.TextBlock).text).join('')
      break
    }
    case 'random': {
      const res = await client.messages.create({
        model,
        max_tokens: 1000,
        messages: [{ role: 'user', content: randomPrompt(input) }],
      })
      raw = res.content.filter(b => b.type === 'text').map(b => (b as Anthropic.TextBlock).text).join('')
      break
    }
  }

  const extracted = extractJSON<ExtractedBrand>(raw)

  return {
    ...input,
    ...extracted,
    business_name: input.business_name ?? extracted.name,
    primary_color: input.primary_color ?? extracted.primary_color,
    secondary_color: input.secondary_color ?? extracted.secondary_color,
    accent_color: input.accent_color ?? extracted.accent_color,
  }
}

function urlPrompt(url: string) {
  return `Analyze the website at ${url} and extract ALL brand information.

Return ONLY valid JSON. No markdown. No explanation.

{
  "name": "",
  "tagline": "",
  "description": "",
  "founded": null,
  "phone": "",
  "primary_color": "#hex",
  "secondary_color": "#hex",
  "accent_color": "#hex",
  "background_color": "#hex",
  "text_color": "#hex",
  "display_font": "",
  "body_font": "",
  "logo_primary_url": "",
  "logo_icon_url": "",
  "industry": "",
  "brand_vibe": "",
  "services": [{ "name": "", "description": "", "price": "", "price_type": "flat" }]
}

Rules:
- All hex colors must include the # prefix
- logo_primary_url must be a full HTTPS URL to the actual logo image file
- If you cannot find a value, use "" (empty string), not null
- Return exactly this structure, no extra fields`
}

function logoPrompt() {
  return `Analyze this logo and extract the brand palette.

Return ONLY valid JSON:
{
  "primary_color": "#hex",
  "secondary_color": "#hex",
  "accent_color": "#hex",
  "background_color": "#hex",
  "text_color": "#hex",
  "style_description": "2-3 words describing the visual style"
}

Extract the exact hex codes you see in the logo. Use # prefix.`
}

function colorPrompt(input: BrandInput) {
  return `Generate a complete brand color system from these seed colors:
Primary: ${input.primary_color}
Secondary: ${input.secondary_color ?? 'generate a complementary color'}
Accent: ${input.accent_color ?? 'generate an accent that pops'}
Style direction: ${input.style_direction ?? 'modern professional'}

Return ONLY valid JSON:
{
  "primary_color": "#hex",
  "secondary_color": "#hex",
  "accent_color": "#hex",
  "background_color": "#hex",
  "text_color": "#hex",
  "style_description": "2-3 words"
}`
}

function randomPrompt(input: BrandInput) {
  return `Generate a complete original brand for a ${input.industry ?? 'local service'} business.
Vibe: ${input.vibe ?? 'modern professional'}
${input.business_name ? `Business name: ${input.business_name}` : 'Generate a business name'}

Return ONLY valid JSON:
{
  "name": "",
  "tagline": "",
  "description": "",
  "primary_color": "#hex",
  "secondary_color": "#hex",
  "accent_color": "#hex",
  "background_color": "#hex",
  "text_color": "#hex",
  "display_font": "",
  "body_font": "",
  "style_description": "2-3 words",
  "logo_concept": "describe the ideal logo in 1 sentence"
}`
}
