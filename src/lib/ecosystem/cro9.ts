import type { EcosystemApp } from './types';

/**
 * CRO9 — conversion optimisation and AI-visibility analytics.
 *
 * SEARCH POSITION: "conversion rate optimization software" is a crowded head term
 * owned by Hotjar, VWO and Optimizely. The winnable angle is the one nobody else
 * reports: whether AI engines can see the site at all, and how much of its traffic
 * comes from them. That is a real measurement CRO9 makes and competitors do not.
 */
export const cro9: EcosystemApp = {
  slug: 'cro9',
  name: 'CRO9',
  category: 'Conversion optimisation & AI-visibility analytics',
  domain: 'https://www.cro9.com',
  appUrl: 'https://www.cro9.com/dashboard',

  metaTitle: 'CRO9 — Conversion Optimisation That Also Measures AI Search',
  metaDescription:
    'CRO9 tracks 147 behavioural signals from one line of code, shows where visitors struggle, and segments AI referral traffic that other analytics hide. Free scan.',
  primaryKeyword: 'conversion rate optimization software',
  secondaryKeywords: [
    'AI referral traffic analytics',
    'behavioural analytics',
    'rage click detection',
    'heatmaps and session replay',
    'CRO9',
    'AI search visibility tracking',
  ],
  ogImage: '/ecosystem/cro9/opengraph-image.png',

  h1: 'CRO9: conversion optimisation that also measures AI search',
  deck:
    'One line of code captures 147 behavioural signals, tells you the five highest-impact fixes, and separates AI referral traffic that every other analytics tool buries inside "referral".',
  chips: ['Free 33-point scan', 'One line of code', 'No cookies', 'Built on 0nMCP'],

  whatItIs: [
    'CRO9 is conversion rate optimisation software that measures what visitors actually do on your site — where they hesitate, rage-click, abandon a form or stop scrolling — and returns a short, ranked list of the changes most likely to increase conversions.',
    'Traditional analytics answers how many. CRO9 answers why. A page with a 2% conversion rate and one with 4% look identical in a traffic report; the difference is entirely in what the other 96% did before leaving, and that is the part CRO9 records.',
    'It also does something no mainstream analytics tool does: it segments AI referral traffic. Visits from ChatGPT, Claude, Perplexity, Gemini and Copilot are broken out by engine instead of being lumped into "referral", where at roughly one percent of traffic they are statistically invisible — despite converting several times better than organic.',
  ],

  whyMcp: [
    'Measurement is only half of a conversion product. The other half is acting on it — updating a page, tagging a contact, notifying someone — and that requires reaching the rest of your stack.',
    'CRO9 sits on 0nMCP, so a finding can become an action against the tools you already use, with credentials you connected once. Analytics that ends at a chart leaves the hardest part, deciding what to do, to you.',
  ],

  capabilities: [
    { icon: 'Activity', title: '147 behavioural signals', body: 'Rage clicks, dead clicks, scroll depth, form hesitation and exit points — from one script under 15KB.' },
    { icon: 'Bot', title: 'AI traffic, broken out', body: 'ChatGPT, Claude, Perplexity, Gemini and Copilot reported separately instead of hidden inside "referral".' },
    { icon: 'MousePointer', title: 'Heatmaps & session replay', body: 'See the aggregate pattern and the individual session that explains it.' },
    { icon: 'Brain', title: 'The Top 5 actions', body: 'A ranked list of what to change, in plain English, from your own data rather than best practice.' },
    { icon: 'Shield', title: 'Privacy-first', body: 'No cookies and no personal identifiers, so it is GDPR-ready by design and largely unaffected by ad blockers.' },
    { icon: 'Gauge', title: 'Free 33-point scan', body: 'Check any site for conversion and AI-readiness problems before installing anything.' },
  ],

  howItWorks: [
    { title: 'Scan first', body: 'Run the free 33-point audit on any URL. No account, no card.' },
    { title: 'Paste one line', body: 'A single script tag, under 15KB, loaded asynchronously. No tag manager project required.' },
    { title: 'Watch real behaviour', body: 'Friction, drop-off and intent are captured per visitor and per session.' },
    { title: 'Fix the ranked list', body: 'Five actions, ordered by likely impact. Fix one and the next takes its place.' },
  ],

  comparison: {
    againstLabel: 'traditional analytics',
    rows: [
      { dimension: 'Question answered', ours: 'Why did they leave?', theirs: 'How many came?' },
      { dimension: 'AI referral traffic', ours: 'Segmented by engine', theirs: 'Buried inside "referral"' },
      { dimension: 'Output', ours: 'A ranked list of actions', theirs: 'Charts to interpret' },
      { dimension: 'Cookies', ours: 'None', theirs: 'Required' },
      { dimension: 'Ad blocker impact', ours: 'Largely unaffected', theirs: 'Substantial data loss' },
    ],
  },

  offers: [
    { name: 'Free', price: 0, currency: 'USD', billingPeriod: null, description: 'Scan any site and track one of your own.', includes: ['33-point scan', 'One site', 'Behavioural tracking'] },
    { name: 'Ignite', price: 39, currency: 'USD', billingPeriod: 'MONTH', description: 'For a site you actually run on.', includes: ['Higher limits', 'Heatmaps & replay', 'AI traffic segmentation'], featured: true },
    { name: 'Amplify', price: 99, currency: 'USD', billingPeriod: 'MONTH', description: 'Multiple sites and deeper history.', includes: ['3 sites', 'Full analytics', 'Priority support'] },
  ],

  audiences: [
    { who: 'Anyone spending on ads', why: 'A visitor you paid for who leaves because of a broken form is the most expensive kind of loss there is.' },
    { who: 'Agencies reporting to clients', why: '"Here is what your visitors did and here is what to change" beats a traffic chart every month.' },
    { who: 'Anyone betting on AI search', why: 'You cannot tell whether AI is sending you traffic if your analytics never separates it out.' },
  ],

  security: [
    'No cookies and no personal identifiers collected for analytics.',
    'GDPR-ready by design rather than by disclaimer, because behaviour is measured and identity is not.',
    'Credentials for connected services live in the 0nVault, encrypted at rest.',
  ],

  faqs: [
    { question: 'What is CRO9?', answer: 'CRO9 is conversion rate optimisation software that measures how real visitors behave on your site — rage clicks, form hesitation, exit points — and returns the five highest-impact changes to make, ranked by likely effect on conversions.' },
    { question: 'How is it different from Google Analytics?', answer: 'Google Analytics tells you how many people came and from where. CRO9 tells you what they did once they arrived and why they left, then what to change. They answer different questions, and CRO9 can connect to GA4 directly.' },
    { question: 'Does it track AI search traffic?', answer: 'Yes, and this is the part other tools miss. Visits from ChatGPT, Claude, Perplexity, Gemini and Copilot are segmented by engine. At roughly 1% of traffic they are invisible inside a blended "referral" bucket, despite converting several times better than organic.' },
    { question: 'Will it slow my site down?', answer: 'The script is under 15KB and loads asynchronously, so it does not block rendering.' },
    { question: 'Do I need a cookie banner for it?', answer: 'Not for CRO9 analytics — it sets no cookies and collects no personal identifiers. Other tools on your site may still require one, and local rules vary; this is not legal advice.' },
    { question: 'What is the free scan?', answer: 'A 33-point audit of any public URL covering crawlability, AI access, structure, schema, real-user speed and conversion readiness. No account and no card required.' },
  ],

  crossLinks: [
    { label: '0nMCP — the orchestrator underneath', href: '/', note: 'One connection, 111 services.', external: false },
    { label: 'web0n — build the site it measures', href: '/ecosystem/web0n', note: 'AI-built sites, edited by asking.', external: false },
    { label: '0nTask — turn findings into work', href: '/ecosystem/0ntask', note: 'The shared list for humans and agents.', external: false },
    { label: 'cro9.com — run the free scan', href: 'https://www.cro9.com/scan', note: '33 checks, no account.', external: true },
  ],

  integrations: ['Google Analytics 4', 'Google Search Console', 'CRM', 'Slack', 'Stripe', 'WordPress', 'Shopify', 'Webflow'],

  finalCta: {
    heading: 'Scan your site free, then fix what it finds.',
    body: '33 checks in seconds. No account, no card, and you keep the findings either way.',
    button: 'Run the free scan',
  },

  lastUpdated: '2026-07-30',
};
