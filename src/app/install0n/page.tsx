import type { Metadata } from 'next'
import { STATS_DISPLAY } from '@/data/stats'
import { Install0nClient } from './client'

const title = 'Install 0nMCP — Add 1,155 AI Tools to Claude in 60 Seconds'
const description = `Turn Claude into the ultimate AI command center. ${STATS_DISPLAY.tools}+ tools, ${STATS_DISPLAY.services} services, encrypted vault, workflow store, and self-training AI brain. Works on Desktop, Web, Mobile, and CLI. Free — no credit card.`

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    '0nMCP', 'install 0nMCP', 'Claude MCP', 'Claude tools', 'Claude plugins',
    'MCP server', 'Model Context Protocol', 'AI tools', 'Claude Desktop',
    'Claude Code', 'AI automation', 'Claude extensions', 'Claude integrations',
    'AI orchestration', 'workflow automation', 'API orchestrator', 'Claude skills',
    'Claude AI tools', 'install MCP', 'Claude Code skill', 'AI API',
  ],
  authors: [{ name: 'RocketOpp LLC', url: 'https://rocketopp.com' }],
  creator: '0nMCP',
  publisher: 'RocketOpp LLC',
  openGraph: {
    title: 'Install 0nMCP — 1,155 AI Tools Inside Claude in 60 Seconds',
    description: 'Transform Claude into your AI command center. Vault, Sparks, Store, Brain — all platforms. Free.',
    url: 'https://www.0nmcp.com/install0n',
    siteName: '0nMCP',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Install 0nMCP — 1,155 AI Tools Inside Claude',
    description: 'Claude + 0nMCP = the ultimate AI command center. 60-second install. Free.',
    creator: '@0nork',
    site: '@0nork',
  },
  alternates: {
    canonical: 'https://www.0nmcp.com/install0n',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  other: {
    'apple-mobile-web-app-title': 'Install 0nMCP',
  },
}

export default function Install0nPage() {
  // JSON-LD: SoftwareApplication + HowTo + FAQPage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: '0nMCP',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'macOS, Windows, iOS, Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description,
        url: 'https://www.0nmcp.com/install0n',
        author: {
          '@type': 'Organization',
          name: 'RocketOpp LLC',
          url: 'https://rocketopp.com',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '47',
          bestRating: '5',
        },
        featureList: `${STATS_DISPLAY.tools}+ tools, ${STATS_DISPLAY.services} services, encrypted vault, workflow store, AI brain, 4 platforms`,
      },
      {
        '@type': 'HowTo',
        name: 'How to Install 0nMCP in Claude',
        description: 'Add 0nMCP to any Claude app in 60 seconds',
        totalTime: 'PT1M',
        step: [
          { '@type': 'HowToStep', name: 'Choose your platform', text: 'Select Claude Desktop, Web, Mobile, or Code' },
          { '@type': 'HowToStep', name: 'Copy or install', text: 'Copy instructions or run the one-line installer' },
          { '@type': 'HowToStep', name: 'Login', text: 'Type /0nmcp login in Claude to connect your account' },
          { '@type': 'HowToStep', name: 'Start using', text: 'Access vault, sparks, store, and brain directly in Claude' },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is 0nMCP free?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes. 0nMCP is free to install and use. You get 50 free Sparks and 20 executions per month. No credit card required.' },
          },
          {
            '@type': 'Question',
            name: 'What Claude plans does 0nMCP work with?',
            acceptedAnswer: { '@type': 'Answer', text: '0nMCP works with Claude MAX, Pro, and Team plans on all platforms — Desktop, Web, Mobile, and Claude Code.' },
          },
          {
            '@type': 'Question',
            name: 'How many tools does 0nMCP provide?',
            acceptedAnswer: { '@type': 'Answer', text: `0nMCP provides ${STATS_DISPLAY.tools}+ tools across ${STATS_DISPLAY.services} services including CRM, Stripe, Slack, GitHub, Supabase, and many more.` },
          },
          {
            '@type': 'Question',
            name: 'How long does installation take?',
            acceptedAnswer: { '@type': 'Answer', text: 'About 60 seconds. Choose your platform, paste instructions or run one command, and you are connected.' },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
          { '@type': 'ListItem', position: 2, name: 'Install 0nMCP', item: 'https://www.0nmcp.com/install0n' },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Install0nClient />
    </>
  )
}
