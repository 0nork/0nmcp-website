import { MetadataRoute } from 'next'

/**
 * Advanced robots policy.
 *
 * - General crawlers: allow everything except API endpoints, OAuth flows,
 *   admin surfaces, dashboards (gated), onboarding, and webhook paths
 * - AI / GEO crawlers explicitly allowed across the major families
 *   (OpenAI, Anthropic, Google AI, Perplexity, Bing, Apple, Bytedance,
 *   Common Crawl, Mistral, You.com, Cohere, Meta) for AEO discoverability
 * - SEO scraper denylist (Ahrefs, Semrush, etc.) — competitive intel
 *   bots are blocked from harvesting our public surfaces
 */
export default function robots(): MetadataRoute.Robots {
  const PRIVATE_DISALLOW = [
    '/api/',
    '/_next/',
    '/admin/',
    '/oauth/',
    '/0nboarding/',
    '/dashboard/',
    '/console/',
    '/login/',
    '/auth/',
    '/account/',
    '/install/success',
  ]

  return {
    rules: [
      // ── Default: everything except private surfaces ────────────────
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_DISALLOW,
      },

      // ── AI / GEO crawlers — fully allowed for AEO discoverability ──
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Anthropic-AI', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'GoogleOther', allow: '/' },
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'YouBot', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'DuckDuckBot', allow: '/' },
      { userAgent: 'YandexBot', allow: '/' },
      { userAgent: 'Bytespider', allow: '/' },
      { userAgent: 'Diffbot', allow: '/' },
      { userAgent: 'FacebookBot', allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
      { userAgent: 'Mistralai-User', allow: '/' },

      // ── SEO scraper / competitive intel denylist ───────────────────
      { userAgent: 'AhrefsBot', disallow: '/' },
      { userAgent: 'SemrushBot', disallow: '/' },
      { userAgent: 'DotBot', disallow: '/' },
      { userAgent: 'MJ12bot', disallow: '/' },
      { userAgent: 'PetalBot', disallow: '/' },
      { userAgent: 'ZoominfoBot', disallow: '/' },
    ],
    sitemap: ['https://www.0nmcp.com/sitemap.xml'],
    host: 'https://www.0nmcp.com',
  }
}
