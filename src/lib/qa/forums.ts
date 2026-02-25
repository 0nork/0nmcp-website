// =============================================================================
// QA Distribution Engine — Forum Discovery & Monitoring
// =============================================================================
// Identifies and monitors relevant forums for Q&A engagement
// =============================================================================

import Anthropic from '@anthropic-ai/sdk'
import { ForumInfo } from './types'

// ---------------------------------------------------------------------------
// Known Forums Database
// ---------------------------------------------------------------------------

export const KNOWN_FORUMS: ForumInfo[] = [
  {
    id: 'warrior_forum',
    name: 'Warrior Forum',
    url: 'https://www.warriorforum.com',
    domainAuthority: 72,
    monthlyTraffic: 2000000,
    niche: ['internet marketing', 'affiliate marketing', 'copywriting', 'seo'],
    relevanceScore: 6,
    audienceMatch: ['marketers', 'affiliates', 'entrepreneurs'],
    platform: 'vbulletin',
    hasApi: false,
    requiresRegistration: true,
    linkPolicy: 'signature_only',
    selfPromoRules: 'WSO section for paid offers. Helpful posts in main forums can include signature links.',
    postRequirements: '10 posts minimum before signature links active',
    postsPerDay: 500,
    activeUsers: 50000,
    bestSections: [
      { name: 'Main Discussion Forum', url: 'https://www.warriorforum.com/main-internet-marketing-discussion-forum/', description: 'General marketing discussions' },
      { name: 'Growth Hacking', url: 'https://www.warriorforum.com/growth-hacking/', description: 'Growth strategies' },
    ],
  },
  {
    id: 'growthhackers',
    name: 'GrowthHackers Community',
    url: 'https://growthhackers.com/posts',
    domainAuthority: 68,
    monthlyTraffic: 500000,
    niche: ['growth marketing', 'product growth', 'startups', 'automation'],
    relevanceScore: 9,
    audienceMatch: ['growth marketers', 'product managers', 'startup founders'],
    platform: 'custom',
    hasApi: false,
    requiresRegistration: true,
    linkPolicy: 'allowed',
    selfPromoRules: 'Original content with insights encouraged. Link to your own content if relevant and valuable.',
    bestSections: [
      { name: 'Questions', url: 'https://growthhackers.com/questions', description: 'Ask and answer growth questions' },
      { name: 'Posts', url: 'https://growthhackers.com/posts', description: 'Share growth content' },
    ],
  },
  {
    id: 'indiehackers',
    name: 'Indie Hackers',
    url: 'https://www.indiehackers.com',
    domainAuthority: 78,
    monthlyTraffic: 1000000,
    niche: ['startups', 'saas', 'entrepreneurship', 'bootstrapping', 'developer tools'],
    relevanceScore: 10,
    audienceMatch: ['indie founders', 'solopreneurs', 'bootstrappers', 'developers'],
    platform: 'custom',
    hasApi: false,
    requiresRegistration: true,
    linkPolicy: 'allowed',
    selfPromoRules: 'Share your journey authentically. Product mentions okay if contextual. Community values transparency.',
    bestSections: [
      { name: 'Products', url: 'https://www.indiehackers.com/products', description: 'Share your product' },
      { name: 'Posts', url: 'https://www.indiehackers.com/posts', description: 'Discussions and insights' },
      { name: 'Groups', url: 'https://www.indiehackers.com/groups', description: 'Topic-specific groups' },
    ],
  },
  {
    id: 'moz_community',
    name: 'Moz Community',
    url: 'https://moz.com/community',
    domainAuthority: 91,
    monthlyTraffic: 5000000,
    niche: ['seo', 'digital marketing', 'local seo'],
    relevanceScore: 7,
    audienceMatch: ['seo professionals', 'digital marketers', 'agencies'],
    platform: 'custom',
    hasApi: false,
    requiresRegistration: true,
    linkPolicy: 'allowed',
    selfPromoRules: 'Helpful answers encouraged. Avoid overt self-promotion. Expert contributions valued.',
    bestSections: [
      { name: 'Q&A Forum', url: 'https://moz.com/community/q', description: 'Ask and answer SEO questions' },
    ],
  },
  {
    id: 'dev_community',
    name: 'DEV Community',
    url: 'https://dev.to',
    domainAuthority: 85,
    monthlyTraffic: 15000000,
    niche: ['software development', 'ai', 'developer tools', 'open source'],
    relevanceScore: 10,
    audienceMatch: ['developers', 'tech writers', 'AI enthusiasts', 'open source contributors'],
    platform: 'custom',
    hasApi: true,
    requiresRegistration: true,
    linkPolicy: 'allowed',
    selfPromoRules: 'Technical content welcome. Cross-posting allowed with canonical. Community values authentic sharing.',
    bestSections: [
      { name: 'AI/ML', url: 'https://dev.to/t/ai', description: 'AI and machine learning content' },
      { name: 'Open Source', url: 'https://dev.to/t/opensource', description: 'Open source projects and contributions' },
      { name: 'Tools', url: 'https://dev.to/t/tooling', description: 'Developer tools and utilities' },
    ],
  },
  {
    id: 'sitepoint',
    name: 'SitePoint Forums',
    url: 'https://www.sitepoint.com/community/',
    domainAuthority: 84,
    monthlyTraffic: 3000000,
    niche: ['web development', 'design', 'javascript', 'node'],
    relevanceScore: 7,
    audienceMatch: ['developers', 'designers', 'tech leads'],
    platform: 'discourse',
    hasApi: true,
    requiresRegistration: true,
    linkPolicy: 'allowed',
    selfPromoRules: 'Helpful answers encouraged. Relevant links okay in context.',
    bestSections: [
      { name: 'JavaScript', url: 'https://www.sitepoint.com/community/c/javascript/', description: 'JavaScript discussions' },
      { name: 'Node.js', url: 'https://www.sitepoint.com/community/c/node-js/', description: 'Node.js discussions' },
    ],
  },
  {
    id: 'hashnode',
    name: 'Hashnode',
    url: 'https://hashnode.com',
    domainAuthority: 82,
    monthlyTraffic: 10000000,
    niche: ['software development', 'developer tools', 'ai', 'tech blogging'],
    relevanceScore: 8,
    audienceMatch: ['developers', 'tech bloggers', 'AI practitioners'],
    platform: 'custom',
    hasApi: true,
    requiresRegistration: true,
    linkPolicy: 'allowed',
    selfPromoRules: 'Developer blog platform. Custom domain support. Technical content encouraged.',
    bestSections: [
      { name: 'AI', url: 'https://hashnode.com/n/artificial-intelligence', description: 'AI-related articles' },
      { name: 'DevOps', url: 'https://hashnode.com/n/devops', description: 'DevOps and automation' },
    ],
  },
  {
    id: 'hackernews',
    name: 'Hacker News',
    url: 'https://news.ycombinator.com',
    domainAuthority: 92,
    niche: ['tech', 'startups', 'programming', 'ai'],
    relevanceScore: 10,
    audienceMatch: ['developers', 'tech founders', 'engineers', 'VCs'],
    platform: 'custom',
    hasApi: true,
    requiresRegistration: true,
    linkPolicy: 'allowed',
    selfPromoRules: 'Show HN for launches. Comments must add value. No marketing speak.',
    bestSections: [
      { name: 'Show HN', url: 'https://news.ycombinator.com/show', description: 'Product launches' },
      { name: 'Ask HN', url: 'https://news.ycombinator.com/ask', description: 'Questions to community' },
    ],
  },
  {
    id: 'producthunt',
    name: 'Product Hunt',
    url: 'https://www.producthunt.com',
    domainAuthority: 90,
    monthlyTraffic: 12000000,
    niche: ['products', 'saas', 'developer tools', 'ai tools'],
    relevanceScore: 10,
    audienceMatch: ['early adopters', 'product managers', 'makers', 'founders'],
    platform: 'custom',
    hasApi: true,
    requiresRegistration: true,
    linkPolicy: 'allowed',
    selfPromoRules: 'Launch products. Comment helpfully on others. Build maker profile.',
    bestSections: [
      { name: 'AI Tools', url: 'https://www.producthunt.com/topics/artificial-intelligence', description: 'AI product launches' },
      { name: 'Developer Tools', url: 'https://www.producthunt.com/topics/developer-tools', description: 'Dev tool launches' },
    ],
  },
  {
    id: 'lobsters',
    name: 'Lobsters',
    url: 'https://lobste.rs',
    domainAuthority: 65,
    niche: ['programming', 'tech', 'open source'],
    relevanceScore: 7,
    audienceMatch: ['developers', 'engineers', 'open source enthusiasts'],
    platform: 'custom',
    hasApi: true,
    requiresRegistration: true,
    linkPolicy: 'allowed',
    selfPromoRules: 'Invite-only. Technical content only. No marketing.',
    postRequirements: 'Requires invitation from existing member',
    bestSections: [
      { name: 'AI', url: 'https://lobste.rs/t/ai', description: 'AI discussions' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Forum Finder (AI-powered discovery)
// ---------------------------------------------------------------------------

export class ForumFinder {
  private client: Anthropic

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    })
  }

  async discoverForums(
    niche: string,
    keywords: string[],
    existingForums: string[] = []
  ): Promise<{
    discoveredForums: Partial<ForumInfo>[]
    searchQueries: string[]
    recommendations: string
  }> {
    const prompt = `Find relevant online forums and communities for this niche.

NICHE: ${niche}
KEYWORDS: ${keywords.join(', ')}
ALREADY KNOWN: ${existingForums.join(', ')}

Your task:
1. Suggest forums/communities NOT in the "already known" list
2. Focus on active communities with engaged members
3. Include a mix of:
   - Traditional forums (vBulletin, XenForo, phpBB)
   - Modern communities (Discourse, Circle, Slack groups)
   - Niche-specific platforms
   - Discord servers (if business-appropriate)

For each forum, provide:
- Name
- URL (if you know it, otherwise leave blank)
- Estimated relevance (1-10)
- Why it's relevant
- Approximate activity level
- Link policy (if known)

Also provide Google search queries to find more relevant forums.

Return JSON:
{
  "discoveredForums": [
    {
      "name": "Forum Name",
      "url": "https://...",
      "niche": ["keyword1", "keyword2"],
      "relevanceScore": 8,
      "audienceMatch": ["audience1", "audience2"],
      "reasonRelevant": "Why this forum is good for the niche",
      "estimatedActivity": "high/medium/low",
      "linkPolicy": "allowed/signature_only/none/unknown"
    }
  ],
  "searchQueries": [
    "MCP server forum discussion",
    "site:forum.* AI orchestration",
    ...
  ],
  "recommendations": "Overall strategy recommendations for forum marketing in this niche"
}`

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return JSON.parse(jsonMatch![0])
  }

  async analyzeForumForEngagement(forumUrl: string): Promise<{
    platform: string
    registrationRequired: boolean
    linkPolicy: string
    bestSections: string[]
    engagementTips: string[]
    risks: string[]
  }> {
    const prompt = `Analyze this forum for marketing engagement potential.

FORUM URL: ${forumUrl}

Based on your knowledge of this forum (if known) or forums of this type, provide:
1. What platform it runs on
2. Registration requirements
3. Link/self-promotion policies
4. Best sections for helpful engagement
5. Tips for building reputation
6. Risks to avoid

Return JSON:
{
  "platform": "vbulletin/xenforo/discourse/phpbb/custom/unknown",
  "registrationRequired": true,
  "linkPolicy": "description of link policy",
  "bestSections": ["section1", "section2"],
  "engagementTips": ["tip1", "tip2"],
  "risks": ["risk1", "risk2"]
}`

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return JSON.parse(jsonMatch![0])
  }
}

// ---------------------------------------------------------------------------
// Forum Content Generator
// ---------------------------------------------------------------------------

export class ForumContentGenerator {
  private client: Anthropic

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    })
  }

  async generateForumPost(
    forum: ForumInfo,
    topic: string,
    businessContext: {
      name: string
      url: string
      description: string
    },
    options: {
      includeBacklink: boolean
      postType: 'question' | 'answer' | 'discussion' | 'resource'
    }
  ): Promise<{
    title: string
    body: string
    suggestedSection: string
    signature?: string
  }> {
    const backlinkInstruction = options.includeBacklink
      ? forum.linkPolicy === 'signature_only'
        ? `Include a professional signature with a link to ${businessContext.url}. Do NOT include links in the main post body.`
        : forum.linkPolicy === 'allowed'
          ? `You may include ONE natural link to ${businessContext.url} if genuinely helpful.`
          : `Do NOT include any links. This forum has a strict no-link policy.`
      : 'Do NOT include any links to the business website.'

    const prompt = `Write a forum post for ${forum.name}.

TOPIC: ${topic}
POST TYPE: ${options.postType}

FORUM CONTEXT:
- Platform: ${forum.platform}
- Audience: ${forum.audienceMatch.join(', ')}
- Self-promo rules: ${forum.selfPromoRules}
- Link policy: ${forum.linkPolicy}

BUSINESS (for context, not promotion):
- Name: ${businessContext.name}
- What they do: ${businessContext.description}

${backlinkInstruction}

Write as an experienced community member, not a marketer.
${options.postType === 'question' ? 'Ask a genuine question that could spark discussion.' : ''}
${options.postType === 'answer' ? 'Provide a helpful, detailed answer.' : ''}
${options.postType === 'discussion' ? 'Start a thoughtful discussion others will want to join.' : ''}
${options.postType === 'resource' ? 'Share a valuable resource or insight.' : ''}

Return JSON:
{
  "title": "Post title (engaging but not clickbaity)",
  "body": "Post content in ${forum.platform === 'discourse' ? 'markdown' : forum.platform === 'vbulletin' || forum.platform === 'xenforo' || forum.platform === 'phpbb' ? 'bbcode' : 'markdown'} format",
  "suggestedSection": "Best section for this post",
  ${forum.linkPolicy === 'signature_only' ? '"signature": "Professional signature with link"' : '"signature": null'}
}`

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return JSON.parse(jsonMatch![0])
  }
}

// ---------------------------------------------------------------------------
// Forum Engagement Planning
// ---------------------------------------------------------------------------

export interface ForumEngagementPlan {
  forum: ForumInfo
  frequency: 'daily' | 'weekly' | 'bi-weekly'
  postsPerPeriod: number
  contentMix: {
    questions: number
    answers: number
    discussions: number
    resources: number
  }
  targetSections: string[]
  backlinkStrategy: 'never' | 'signature' | 'occasional' | 'when_helpful'
}

export function createEngagementPlan(forum: ForumInfo): ForumEngagementPlan {
  let backlinkStrategy: ForumEngagementPlan['backlinkStrategy'] = 'never'
  if (forum.linkPolicy === 'allowed') backlinkStrategy = 'when_helpful'
  else if (forum.linkPolicy === 'signature_only') backlinkStrategy = 'signature'
  else if (forum.linkPolicy === 'trusted_members') backlinkStrategy = 'occasional'

  const contentMix =
    forum.relevanceScore >= 8
      ? { questions: 20, answers: 50, discussions: 20, resources: 10 }
      : { questions: 30, answers: 40, discussions: 20, resources: 10 }

  return {
    forum,
    frequency: forum.relevanceScore >= 8 ? 'daily' : 'weekly',
    postsPerPeriod: forum.relevanceScore >= 8 ? 2 : 1,
    contentMix,
    targetSections: forum.bestSections.map((s) => s.name),
    backlinkStrategy,
  }
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

export function getForumsByRelevance(minRelevance: number = 7): ForumInfo[] {
  return KNOWN_FORUMS.filter((f) => f.relevanceScore >= minRelevance).sort(
    (a, b) => b.relevanceScore - a.relevanceScore
  )
}

export function getForumsByNiche(niche: string): ForumInfo[] {
  return KNOWN_FORUMS.filter((f) =>
    f.niche.some((n) => n.toLowerCase().includes(niche.toLowerCase()))
  )
}

export function getForumsAllowingLinks(): ForumInfo[] {
  return KNOWN_FORUMS.filter(
    (f) => f.linkPolicy === 'allowed' || f.linkPolicy === 'signature_only'
  )
}

export default { KNOWN_FORUMS, ForumFinder, ForumContentGenerator }
