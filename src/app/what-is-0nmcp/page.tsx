import type { Metadata } from 'next'
import WhatIsClient from './WhatIsClient'
import { STATS_DISPLAY } from '@/data/stats'

export const metadata: Metadata = {
  title: 'What Is 0nMCP? The AI Tool That Does Your Business Work For You',
  description:
    '0nMCP gives your AI 1,640+ tools to take real action — send emails, charge payments, update your CRM. 0nCore is the engine. Learn how it works.',
  alternates: { canonical: 'https://www.0nmcp.com/what-is-0nmcp' },
  openGraph: {
    type: 'article',
    title: 'What Is 0nMCP? The AI Tool That Does Your Business Work For You',
    description:
      '0nMCP gives your AI assistant 1,640+ tools to get real work done — email, CRM, Stripe, Supabase, and more. 0nCore is the engine.',
    url: 'https://www.0nmcp.com/what-is-0nmcp',
    siteName: '0nMCP by RocketOpp',
    publishedTime: '2026-04-27T00:00:00Z',
    modifiedTime: '2026-04-28T00:00:00Z',
    authors: ['Mike Mento'],
    tags: ['AI automation', '0nMCP', '0nCore', 'business AI', 'workflow automation'],
    images: [
      {
        url: 'https://www.0nmcp.com/og/what-is-0nmcp.png',
        width: 1200,
        height: 630,
        alt: '0nMCP — 1,640+ AI tools, one engine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@0nMCP',
    creator: '@rocketopp',
    title: 'What Is 0nMCP? The AI Tool That Does Your Business Work For You',
    description:
      '1,640+ tools. 111 services. One AI engine. 0nMCP makes your AI actually do things — not just talk about them.',
    images: ['https://www.0nmcp.com/og/what-is-0nmcp.png'],
  },
}

export default function WhatIsPage() {
  // JSON-LD payload — Article + FAQPage + SoftwareApplication
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
          { '@type': 'ListItem', position: 2, name: 'Learn', item: 'https://www.0nmcp.com/learn' },
          { '@type': 'ListItem', position: 3, name: 'What Is 0nMCP?', item: 'https://www.0nmcp.com/what-is-0nmcp' },
        ],
      },
      {
        '@type': 'Article',
        headline: 'What Is 0nMCP? The AI Tool That Does Your Business Work For You',
        description:
          '0nMCP gives your AI assistant 1,640+ tools to get real work done — email, CRM, payments, databases, and more. 0nCore is the engine.',
        author: { '@type': 'Person', name: 'Mike Mento', url: 'https://www.0nmcp.com/about' },
        datePublished: '2026-04-27',
        dateModified: '2026-04-28',
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.0nmcp.com/what-is-0nmcp' },
        image: 'https://www.0nmcp.com/og/what-is-0nmcp.png',
        articleSection: 'AI Tools',
        keywords: '0nMCP, 0nCore, AI automation, workflow automation, business AI, MCP server',
      },
      {
        '@type': 'SoftwareApplication',
        name: '0nMCP',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        url: 'https://www.0nmcp.com',
        description:
          '0nMCP is an AI orchestration engine with 1,640+ tools across 111 services. It lets any AI assistant take real actions — send emails, manage contacts, charge payments, query databases, and more.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: 'Free to start. Pay per execution on the marketplace.',
        },
        softwareVersion: STATS_DISPLAY.version,
        downloadUrl: 'https://www.npmjs.com/package/0nmcp',
        featureList: [
          '1,640+ tools across 111 services',
          'CRM, Stripe, email, calendar, and database integrations',
          'AI-driven workflow orchestration',
          'AES-256 encrypted vault system',
          'Works with Claude, ChatGPT, Cursor, and more',
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is 0nMCP in simple terms?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '0nMCP is a tool that gives your AI assistant the ability to take real actions. Instead of just talking, your AI can send emails, update customer records, charge payments, and more — using tools your business already has. Think of it as giving your AI a pair of hands.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is 0nCore?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '0nCore is the engine that powers 0nMCP. It handles the smart routing of requests, keeps your credentials safe with bank-grade encryption, and figures out the fastest way to complete tasks — whether that\u2019s one step at a time or many steps at once.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do I need to know how to code?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. You can sign up at 0nmcp.com and start connecting tools from a regular web dashboard — no code, no terminal, no setup headaches.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which AI platforms work with 0nMCP?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '0nMCP works with Claude (Anthropic), ChatGPT (OpenAI), Cursor, Windsurf, Gemini, Continue, and Cline. It uses the Model Context Protocol (MCP).',
            },
          },
          {
            '@type': 'Question',
            name: 'Is 0nMCP free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, 0nMCP is free to install and use. On the marketplace, some pre-built workflow templates cost a small fee per run — usually $0.10 per execution.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is 0nMCP different from Zapier or Make?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Zapier and Make are great for simple "if this, then that" automations you set up in advance. 0nMCP is AI-driven — you describe what you want in plain English and the AI figures out the steps. There\u2019s no flowchart to build.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is my data safe with 0nMCP?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '0nMCP uses AES-256-GCM encryption for credentials. The 0nVault system (patent pending US #63/990,046) ties encrypted credentials to your specific device, so even if a file leaks, it can\u2019t be used.',
            },
          },
          {
            '@type': 'Question',
            name: 'What does "0n" mean?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '"0n" is short for "always on." Your business automation runs all the time — not just when you remember to check a tool. It also references "Turn it 0n" — connecting a new service.',
            },
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <WhatIsClient />
    </>
  )
}
