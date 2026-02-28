import Anthropic from '@anthropic-ai/sdk'
import type { Archetype, LinkedInProfile } from '@/lib/linkedin/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

/**
 * Classify a LinkedIn profile into a professional archetype.
 * Uses Claude to analyze headline, industry, and profile data.
 */
export async function classifyProfile(profile: LinkedInProfile & { headline?: string; industry?: string }): Promise<Archetype> {
  const prompt = `Analyze this LinkedIn profile and classify the person into a professional archetype.

Profile:
- Name: ${profile.localizedFirstName} ${profile.localizedLastName}
- Headline: ${profile.headline || 'Not provided'}
- Industry: ${profile.industry || 'Not provided'}

Return a JSON object with exactly these fields:
{
  "tier": one of "executive", "manager", "individual", "student"
  "domain": one of "tech", "finance", "marketing", "sales", "operations", "hr", "legal", "healthcare", "education", "other"
  "style": one of "thought-leader", "storyteller", "data-driven", "motivational", "educational", "casual"
  "postingBehavior": one of "daily", "weekly", "occasional", "lurker"
  "vocabularyLevel": one of "expert", "professional", "conversational"
}

Rules:
- Base "tier" on seniority signals (C-suite/VP = executive, Director/Manager = manager, etc.)
- Base "domain" on industry and headline keywords
- Base "style" on how they present themselves
- Default "postingBehavior" to "occasional" unless signals suggest otherwise
- Default "vocabularyLevel" to "professional" unless signals suggest otherwise
- ONLY return the JSON object, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const parsed = JSON.parse(jsonMatch[0]) as Archetype

    // Validate fields
    const validTiers = ['executive', 'manager', 'individual', 'student']
    const validDomains = ['tech', 'finance', 'marketing', 'sales', 'operations', 'hr', 'legal', 'healthcare', 'education', 'other']
    const validStyles = ['thought-leader', 'storyteller', 'data-driven', 'motivational', 'educational', 'casual']
    const validBehaviors = ['daily', 'weekly', 'occasional', 'lurker']
    const validVocab = ['expert', 'professional', 'conversational']

    return {
      tier: validTiers.includes(parsed.tier) ? parsed.tier : 'individual',
      domain: validDomains.includes(parsed.domain) ? parsed.domain : 'other',
      style: validStyles.includes(parsed.style) ? parsed.style : 'casual',
      postingBehavior: validBehaviors.includes(parsed.postingBehavior) ? parsed.postingBehavior : 'occasional',
      vocabularyLevel: validVocab.includes(parsed.vocabularyLevel) ? parsed.vocabularyLevel : 'professional',
    }
  } catch {
    // Fallback archetype
    return {
      tier: 'individual',
      domain: 'other',
      style: 'casual',
      postingBehavior: 'occasional',
      vocabularyLevel: 'professional',
    }
  }
}
