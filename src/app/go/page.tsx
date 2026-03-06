import type { Metadata } from 'next'
import GoClient from './GoClient'

export const metadata: Metadata = {
  title: '0nMCP — The AI Operating System for Business | 883 Tools, 48 Services, One Command',
  description:
    'Stop switching between 15 apps. 0nMCP connects your CRM, email, payments, social media, and 44 other services into one AI-powered platform. Describe what you want. AI does it. Patent pending encryption. Free to start.',
  keywords: [
    '0nMCP', 'AI orchestration', 'business automation', 'MCP server', 'API orchestration',
    'workflow automation', 'CRM integration', 'Stripe automation', 'AI tools', 'no-code automation',
    'SaaS automation', 'multi-service orchestration', 'AI command center', 'business tools',
  ],
  openGraph: {
    title: '0nMCP — Describe It. AI Does It.',
    description:
      '883 tools across 48 services. One natural language command triggers Stripe, SendGrid, and CRM simultaneously. Patent-pending encryption. Free to start.',
    url: 'https://0nmcp.com/go',
    siteName: '0nMCP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — The AI Operating System for Business',
    description: '883 tools. 48 services. One command. Describe what you want — AI does it.',
  },
  alternates: { canonical: 'https://0nmcp.com/go' },
}

export default function GoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                name: '0nMCP',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                url: 'https://0nmcp.com',
                description: 'Universal AI API Orchestrator — 883 tools across 48 services in one command.',
                offers: [
                  { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
                  { '@type': 'Offer', price: '19', priceCurrency: 'USD', name: 'Creator', billingIncrement: 'P1M' },
                  { '@type': 'Offer', price: '49', priceCurrency: 'USD', name: 'Operator', billingIncrement: 'P1M' },
                ],
                featureList: '883 tools, 48 services, AES-256-GCM encryption, patent-pending vault, AI chat, visual builder, multi-persona reasoning',
                author: { '@type': 'Organization', name: 'RocketOpp LLC', url: 'https://rocketopp.com' },
              },
              {
                '@type': 'FAQPage',
                mainEntity: [
                  { '@type': 'Question', name: 'What is 0nMCP?', acceptedAnswer: { '@type': 'Answer', text: '0nMCP is a Universal AI API Orchestrator that connects 48 services (883 tools) into one platform. You describe what you want done in plain English, and AI executes it across all your connected services simultaneously.' } },
                  { '@type': 'Question', name: 'Do I need to know how to code?', acceptedAnswer: { '@type': 'Answer', text: 'No. Type what you want in plain English. The AI figures out the rest. Or use the drag-and-drop visual builder to create workflows without writing a single line of code.' } },
                  { '@type': 'Question', name: 'Is my data safe?', acceptedAnswer: { '@type': 'Answer', text: 'Your API keys are encrypted with AES-256-GCM before they ever leave your browser. The encryption system has a pending U.S. patent (Application #63/990,046). We literally cannot read your credentials.' } },
                  { '@type': 'Question', name: 'What services does 0nMCP connect to?', acceptedAnswer: { '@type': 'Answer', text: '48 services including Stripe, Gmail, Slack, HubSpot, Shopify, Google Sheets, Discord, Twilio, Notion, Airtable, OpenAI, Anthropic, Supabase, and many more.' } },
                  { '@type': 'Question', name: 'How does the AI Training system work?', acceptedAnswer: { '@type': 'Answer', text: 'The Council Arena uses 7 AI personas that independently reason on any question, then synthesize into a unified verdict. Each persona has a unique reasoning framework — from empirical analysis to ethical evaluation. The system learns from your interactions to improve over time.' } },
                  { '@type': 'Question', name: 'What is a SWITCH file?', acceptedAnswer: { '@type': 'Answer', text: 'SWITCH files (.0n) are portable workflow definitions that capture your automations in a universal format. They can be shared, version-controlled, and run across any 0nMCP-compatible platform. Think of them as recipes for automation.' } },
                ],
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: '0nMCP', item: 'https://0nmcp.com' },
                  { '@type': 'ListItem', position: 2, name: 'Get Started', item: 'https://0nmcp.com/go' },
                ],
              },
            ],
          }),
        }}
      />
      <GoClient />
    </>
  )
}
