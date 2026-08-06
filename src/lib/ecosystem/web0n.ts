import type { EcosystemApp } from './types';

/**
 * web0n — the AI website builder.
 *
 * SEARCH POSITION: 0nMCP owns "orchestration", 0nTask owns "the shared list",
 * web0n owns "a website you change by asking". The primary keyword is deliberately
 * NOT "AI website builder" alone — that term is saturated by Wix, Framer and a
 * dozen VC-funded tools. The winnable, and honest, position is the ongoing
 * relationship: the site is edited in plain English after it launches, which
 * almost none of them do.
 */
export const web0n: EcosystemApp = {
  slug: 'web0n',
  name: 'web0n',
  category: 'AI website builder & site management',
  domain: 'https://web0n.com',
  appUrl: 'https://web0n.com/dashboard',

  metaTitle: 'web0n — The AI Website Builder You Edit by Asking',
  metaDescription:
    'web0n builds your website, then lets you change it in plain English — "make the headline shorter", "add a booking page". Built on 0nMCP. Start free.',
  primaryKeyword: 'AI website builder',
  secondaryKeywords: [
    'edit website with AI',
    'AI website management',
    'plain English website editor',
    'AI site builder for small business',
    'web0n',
    'website builder with AI editing',
  ],
  ogImage: '/ecosystem/web0n/opengraph-image.png',

  h1: 'web0n: the AI website builder you edit by asking',
  deck:
    'It builds the site, then you change it by describing what you want. No page builder to learn, no developer to email, no change-request queue.',
  chips: ['Free to start', 'No page builder to learn', 'Your own domain', 'Built on 0nMCP'],

  whatItIs: [
    'web0n is an AI website builder that generates a complete site for your business and then lets you change it in plain English — "shorten the headline", "add a page about our new service", "swap the phone number everywhere it appears". You do not open an editor and hunt for the right box.',
    'Most website tools solve the first day and abandon the rest. They get you launched, then hand you a drag-and-drop editor you use twice and forget. The site ages in place because changing it is annoying enough to keep postponing. web0n treats a website as something that stays current, and the way you keep it current is by asking.',
    'Because it is built on 0nMCP, the site is not an island either. It can send a form submission into your CRM, add a booking to your calendar, or post an update to social — using connections you made once, not per-site plugins you configure over and over.',
  ],

  whyMcp: [
    'A website builder that cannot reach anything else produces a brochure. Every form needs somewhere to send leads, every booking needs a calendar, every product needs a payment processor — and in most builders that is a plugin marketplace, each with its own account and its own bill.',
    'web0n inherits 0nMCP instead. Connect a service once in your vault and every site you build can use it. That is why "add a contact form that goes to my CRM" is a sentence here rather than an afternoon.',
  ],

  capabilities: [
    { icon: 'Wand2', title: 'Change it by asking', body: 'Describe the change in plain English and it is made. No editor to learn, no ticket to raise.' },
    { icon: 'Sparkles', title: 'Built from a description', body: 'Tell it what your business does and it produces a complete site — structure, copy and layout.' },
    { icon: 'Globe', title: 'Your own domain', body: 'Publish on your domain so the traffic and the brand equity stay yours.' },
    { icon: 'Search', title: 'AI-search ready by default', body: 'Schema, an llms.txt written for AI crawlers, and server-rendered content — so engines can actually read and quote it.' },
    { icon: 'Link2', title: 'Connected to your stack', body: 'Forms into your CRM, bookings onto your calendar, payments through Stripe — using connections you already made.' },
    { icon: 'Gauge', title: 'Fast because it is lean', body: 'Pages are built small. A slow site loses the visitor before the copy gets a chance.' },
  ],

  howItWorks: [
    { title: 'Describe the business', body: 'What you do, who you serve, what you want people to do when they arrive.' },
    { title: 'It builds the site', body: 'A complete site — pages, structure and copy — in a few minutes, not a few weeks.' },
    { title: 'Change anything by asking', body: '"Make the hero shorter." "Add a page for the new service." It is done and live.' },
    { title: 'It keeps working', body: 'Forms reach your CRM, bookings reach your calendar, and the site stays readable to search and AI engines.' },
  ],

  comparison: {
    againstLabel: 'traditional website builders',
    rows: [
      { dimension: 'Making a change', ours: 'Describe it in plain English', theirs: 'Open an editor and find the right box' },
      { dimension: 'After launch', ours: 'Kept current by asking', theirs: 'Ages in place until a redesign' },
      { dimension: 'Connecting other tools', ours: 'Connect once, every site can use it', theirs: 'A plugin per tool, per site' },
      { dimension: 'AI search readiness', ours: 'Schema and llms.txt by default', theirs: 'An add-on, if offered at all' },
      { dimension: 'Who does the work', ours: 'You describe, it builds', theirs: 'You build' },
    ],
  },

  offers: [
    { name: 'Free', price: 0, currency: 'USD', billingPeriod: null, description: 'Build a site and see it live.', includes: ['One site', 'AI editing', 'web0n subdomain'] },
    { name: 'Pro', price: 29, currency: 'USD', billingPeriod: 'MONTH', description: 'Your own domain and the connected stack.', includes: ['Custom domain', 'Connected apps via 0nVault', 'Unlimited AI edits', 'Priority support'], featured: true },
  ],

  audiences: [
    { who: 'Small businesses without a web person', why: 'Changing the phone number should not require finding a freelancer. Here it is one sentence.' },
    { who: 'Agencies building for clients', why: 'Ship a site quickly, then hand the client an editor they can actually use — because it is just asking.' },
    { who: 'Anyone whose site is three years stale', why: 'The reason it is stale is that editing is annoying. Remove that and it stops going stale.' },
  ],

  security: [
    'Credentials live in the 0nVault, encrypted at rest, under your account — never copied into the site itself.',
    'Sites are served over HTTPS with security headers set by default.',
    'You own the domain and can take the content with you.',
  ],

  faqs: [
    { question: 'What is web0n?', answer: 'web0n is an AI website builder that creates a complete website for your business and then lets you change it in plain English — you describe the change and it is made, rather than opening a page builder.' },
    { question: 'How is it different from Wix or Squarespace?', answer: 'Those are editors: they hand you the tools and you do the building, both at launch and every time you want a change. web0n does the building. You describe what you want in plain English and it makes the change for you.' },
    { question: 'Can I use my own domain?', answer: 'Yes. Sites publish on your own domain on the paid plan, so the traffic and brand equity stay yours.' },
    { question: 'Will AI search engines be able to read my site?', answer: 'Yes — that is built in rather than an add-on. Sites ship with structured data, an llms.txt written for AI crawlers, server-rendered content, and a robots.txt that allowlists them instead of blocking them by accident.' },
    { question: 'Can the site connect to my CRM?', answer: 'Yes. Because web0n is built on 0nMCP, a service you connect once in your vault is available to every site you build — so a contact form reaching your CRM is a request, not an integration project.' },
    { question: 'Do I need to know anything technical?', answer: 'No. If you can describe what you want, you can run the site.' },
  ],

  crossLinks: [
    { label: '0nMCP — the orchestrator underneath', href: '/', note: 'One connection, 106 services.', external: false },
    { label: 'CRO9 — see what visitors actually do', href: '/ecosystem/cro9', note: 'Behavioural analytics for the site you just built.', external: false },
    { label: '0nTask — the shared task list', href: '/ecosystem/0ntask', note: 'Turn site enquiries into tracked work.', external: false },
    { label: 'web0n.com', href: 'https://web0n.com', note: 'Build a site now.', external: true },
  ],

  integrations: ['CRM', 'Stripe', 'Google Calendar', 'Gmail', 'Slack', 'Canva', 'Google Analytics 4', 'Search Console'],

  finalCta: {
    heading: 'Describe your business. Get a website.',
    body: 'Free to start, and you change anything afterwards just by asking.',
    button: 'Build my site',
  },

  lastUpdated: '2026-07-30',
};
