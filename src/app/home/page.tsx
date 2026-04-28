import type { Metadata } from 'next'
import { STATS_DISPLAY } from '@/data/stats'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: '0nMCP — Connect Your AI to Everything',
  description:
    '1,589 tools across 102 services. The universal MCP server that connects AI to everything. One install. Every AI platform. 5 patents pending. MIT licensed.',
  keywords: [
    '0nMCP',
    'MCP server',
    'AI orchestrator',
    'API integration',
    'workflow automation',
    'Model Context Protocol',
    'AI tools',
    'Stripe MCP',
    'CRM automation',
    'universal MCP',
  ],
  openGraph: {
    title: '0nMCP — Connect Your AI to Everything',
    description:
      '1,589 tools. 102 services. One command. Works with Claude, Gemini, Grok, Cursor, and every MCP-compatible AI.',
    url: 'https://www.0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — Connect Your AI to Everything',
    description:
      '1,589 tools. 102 services. One command. Works with Claude, Gemini, Grok, Cursor, and every MCP-compatible AI.',
  },
  alternates: { canonical: 'https://www.0nmcp.com' },
}

export default function HomePage() {
  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'RocketOpp, LLC',
        url: 'https://www.0nmcp.com',
        logo: 'https://www.0nmcp.com/brand/0nmcp-logo.png',
        sameAs: [
          'https://0ncore.com',
          'https://x.com/0nmcp',
          'https://linkedin.com/company/rocketopp',
        ],
      },
      {
        '@type': 'WebSite',
        name: '0nMCP',
        url: 'https://www.0nmcp.com',
        description:
          'The universal AI API orchestrator. 1,589 tools across 102 services.',
      },
      {
        '@type': 'SoftwareApplication',
        name: '0nMCP',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Universal AI API Orchestrator connecting 1,589 tools across 102 services with 5 patents pending.',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is 0nMCP?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '0nMCP is the Universal AI API Orchestrator -- the most comprehensive MCP Server connecting 1,589 tools and 102 services with zero configuration.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I install 0nMCP?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Run npx 0nmcp@latest in your terminal. Zero config. Works with npm, pnpm, yarn, and bun.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is 0nMCP free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The core 0nMCP server is MIT licensed and free forever. Managed platform plans start at $80/mo.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is 0nMCP secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '0nVault uses AES-256-GCM encryption with Argon2id key derivation, hardware fingerprint binding, and 7-layer security. 5 US patents filed.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which AI platforms does 0nMCP support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Claude Desktop, Gemini CLI, Cursor, Windsurf, VS Code (Continue + Cline), GPT, and any MCP-compatible client.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is 0nMCP different from Zapier?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Zapier connects apps to apps with triggers. 0nMCP connects apps to AI -- your AI can directly call any API. Describe what you want in natural language.',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />
      <HomeClient />
    </>
  )
}
