import type { EcosystemApp } from './types';

/**
 * social0n — social publishing driven by the orchestrator.
 *
 * SEARCH POSITION: "social media scheduler" is owned by Buffer and Hootsuite and
 * is not winnable. The honest, narrower position is AI-written posts that go out
 * through connections you already made — and the fact that the same vault runs
 * the rest of the stack.
 */
export const social0n: EcosystemApp = {
  slug: 'social0n',
  name: 'social0n',
  category: 'AI social publishing',
  domain: 'https://www.0nmcp.com/products/social0n',
  appUrl: 'https://www.0nmcp.com/console?view=social',

  metaTitle: 'social0n — AI Social Posting Built on 0nMCP',
  metaDescription:
    'social0n writes and publishes social posts through connections you already made. One vault, every channel. Built on 0nMCP.',
  primaryKeyword: 'AI social media posting',
  secondaryKeywords: [
    'AI social media content',
    'automated social posting',
    'social media automation for small business',
    'social0n',
    'post to multiple platforms with AI',
  ],
  ogImage: '/ecosystem/social0n/opengraph-image.png',

  h1: 'social0n: AI social posting that uses connections you already have',
  deck:
    'Write once, tailor per platform, publish everywhere — through the same vault that runs the rest of your stack. No separate scheduler to maintain.',
  chips: ['Built on 0nMCP', 'One vault, every channel', 'Per-platform tailoring'],

  whatItIs: [
    'social0n is AI social publishing: it writes posts for your business, tailors each one to the platform it is going to, and publishes them through the connections already stored in your 0nVault.',
    'The usual problem with social tools is that they are another silo. You connect the same accounts again, in another dashboard, with another bill — and the content has no idea what happened anywhere else in your business. social0n starts from the opposite assumption: the connections exist, the business context exists, and posting is just one more thing the orchestrator can do.',
    'That means a post can be the last step of something rather than an isolated task — publish the blog, then promote it; close the deal, then post the case study.',
  ],

  whyMcp: [
    'Every social tool spends most of its engineering on integrations: OAuth for each network, token refresh, per-platform quirks. 0nMCP already carries that, alongside 111 other services.',
    'So social0n is not a separate product with its own account model — it is a capability of a stack you already connected. That is also why a flow can end in a post without any glue code.',
  ],

  capabilities: [
    { icon: 'Sparkles', title: 'Written for the platform', body: 'The same idea, tailored — not one block of text pasted into five boxes.' },
    { icon: 'Link2', title: 'Uses your existing connections', body: 'Accounts you connected once in the vault. No second authorisation round.' },
    { icon: 'Workflow', title: 'A step in a bigger flow', body: 'Publish a post as the final action of an automation rather than as a standalone chore.' },
    { icon: 'Calendar', title: 'Scheduled or on demand', body: 'Run it on a cadence or fire it when something happens.' },
  ],

  howItWorks: [
    { title: 'Connect once', body: 'Your social accounts go into the 0nVault, encrypted, alongside everything else.' },
    { title: 'Describe the post', body: 'A topic, an audience, a tone — or point it at something you just published.' },
    { title: 'It tailors per channel', body: 'Each platform gets a version written for it rather than a copy-paste.' },
    { title: 'Publish or schedule', body: 'Send it now, or let it run as part of a flow.' },
  ],

  comparison: {
    againstLabel: 'standalone social schedulers',
    rows: [
      { dimension: 'Connections', ours: 'Shared vault, connect once', theirs: 'Its own accounts, connected again' },
      { dimension: 'Content', ours: 'Written per platform', theirs: 'One post, cross-posted' },
      { dimension: 'Part of automation', ours: 'A step in any flow', theirs: 'A separate tool to remember' },
      { dimension: 'Business context', ours: 'Sees the rest of your stack', theirs: 'Knows only the calendar of posts' },
    ],
  },

  offers: [
    { name: 'Included', price: 0, currency: 'USD', billingPeriod: null, description: 'Part of the 0nMCP console.', includes: ['AI-written posts', 'Per-platform tailoring', 'Uses your vault connections'] },
  ],

  audiences: [
    { who: 'Small businesses with no social manager', why: 'Posting consistently is the whole battle. Removing the writing step is what makes it survivable.' },
    { who: 'Agencies running several brands', why: 'One vault, many accounts, no per-client scheduler subscription.' },
    { who: 'Anyone already running flows', why: 'Publishing becomes the last step of something useful instead of a separate habit.' },
  ],

  security: [
    'Social tokens live in the 0nVault, encrypted at rest, under your account.',
    'Connect once and revoke centrally — no duplicate authorisations scattered across tools.',
  ],

  faqs: [
    { question: 'What is social0n?', answer: 'social0n is AI social publishing built on 0nMCP: it writes posts for your business, tailors each to its platform, and publishes them using the social accounts already connected in your 0nVault.' },
    { question: 'Do I need to connect my accounts again?', answer: 'No. That is the point of the shared vault — accounts you connected once for anything else in the 0n ecosystem are already available.' },
    { question: 'Does it just cross-post the same text?', answer: 'No. Each platform gets a version written for it, because what works on LinkedIn does not work on X and cross-posting is why so much automated social reads badly.' },
    { question: 'Can it post automatically after something happens?', answer: 'Yes. Publishing can be the final step of a flow — publish a blog post then promote it, for example — rather than a separate task you have to remember.' },
    { question: 'What does it cost?', answer: 'It is part of the 0nMCP console rather than a separate subscription.' },
  ],

  crossLinks: [
    { label: '0nMCP — the orchestrator underneath', href: '/', note: 'One connection, 111 services.', external: false },
    { label: '0nTask — the shared task list', href: '/ecosystem/0ntask', note: 'Where the work lives.', external: false },
    { label: 'web0n — the site you are promoting', href: '/ecosystem/web0n', note: 'AI-built, edited by asking.', external: false },
  ],

  integrations: ['LinkedIn', 'X', 'Facebook', 'Instagram', 'Google Business Profile', 'Reddit', 'Slack'],

  finalCta: {
    heading: 'Stop writing five versions of the same post.',
    body: 'Connect once, describe the idea, and let each platform get the version it deserves.',
    button: 'Open the console',
  },

  lastUpdated: '2026-07-30',
};
