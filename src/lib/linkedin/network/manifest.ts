import type { AiManifest } from '@/lib/linkedin/types'

/**
 * Build the AI manifest for the LinkedIn tools.
 * Served at /.well-known/0n-manifest.json
 */
export function buildManifest(version?: string): AiManifest {
  return {
    schema_version: '1.0',
    name: '0nMCP LinkedIn Onboarding',
    description: 'AI-powered LinkedIn profile analysis, content generation, and automated posting system. Classifies professional archetypes, generates authentic LinkedIn posts, and self-optimizes through Thompson Sampling.',
    tools: [
      {
        name: 'onboard_with_linkedin',
        description: 'Connect a LinkedIn profile, classify into professional archetype, and get a personalized follow-up question. Returns archetype analysis and execution receipt.',
        input_schema: {
          type: 'object',
          properties: {
            linkedin_code: { type: 'string', description: 'LinkedIn OAuth authorization code' },
            linkedin_access_token: { type: 'string', description: 'Pre-existing LinkedIn access token (alternative to code)' },
          },
          required: [],
        },
        output_schema: {
          type: 'object',
          properties: {
            member_id: { type: 'string' },
            archetype: { type: 'object' },
            follow_up_question: { type: 'string' },
            receipt: { type: 'object' },
          },
        },
      },
      {
        name: 'get_post_preview',
        description: 'Generate a LinkedIn post preview based on member archetype and optional topic.',
        input_schema: {
          type: 'object',
          properties: {
            member_id: { type: 'string', description: 'Member ID from onboarding' },
            topic: { type: 'string', description: 'Optional topic for the post' },
          },
          required: ['member_id'],
        },
        output_schema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            valid: { type: 'boolean' },
            receipt: { type: 'object' },
          },
        },
      },
      {
        name: 'publish_linkedin_post',
        description: 'Publish a post to the member\'s LinkedIn profile.',
        input_schema: {
          type: 'object',
          properties: {
            member_id: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['member_id', 'content'],
        },
        output_schema: {
          type: 'object',
          properties: {
            post_url: { type: 'string' },
            receipt: { type: 'object' },
          },
        },
      },
      {
        name: 'enable_automated_posting',
        description: 'Enable or disable automated LinkedIn posting for a member.',
        input_schema: {
          type: 'object',
          properties: {
            member_id: { type: 'string' },
            frequency: { type: 'string', enum: ['daily', 'weekly', 'biweekly'] },
            enabled: { type: 'boolean' },
          },
          required: ['member_id', 'enabled'],
        },
        output_schema: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            frequency: { type: 'string' },
            receipt: { type: 'object' },
          },
        },
      },
      {
        name: 'generate_linkedin_post',
        description: 'Generate a new LinkedIn post without publishing. Uses PACG archetype matching.',
        input_schema: {
          type: 'object',
          properties: {
            member_id: { type: 'string' },
            topic: { type: 'string' },
            context: { type: 'string' },
          },
          required: ['member_id'],
        },
        output_schema: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            valid: { type: 'boolean' },
            tone_match_score: { type: 'number' },
            receipt: { type: 'object' },
          },
        },
      },
      {
        name: 'get_execution_receipt',
        description: 'Retrieve execution receipts for a member\'s tool calls.',
        input_schema: {
          type: 'object',
          properties: {
            member_id: { type: 'string' },
            limit: { type: 'number' },
          },
          required: ['member_id'],
        },
        output_schema: {
          type: 'object',
          properties: {
            receipts: { type: 'array' },
          },
        },
      },
    ],
    interaction_endpoint: '/api/linkedin/interact',
    capabilities: [
      'profile-analysis',
      'content-generation',
      'automated-posting',
      'self-optimization',
      'cross-user-learning',
    ],
    rate_limits: { requests_per_minute: 30 },
    version: version || 'auto-optimized',
  }
}
