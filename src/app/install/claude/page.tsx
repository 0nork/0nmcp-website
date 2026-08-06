import type { Metadata } from 'next'
import ClaudeInstallClient from './ClaudeInstallClient'

export const metadata: Metadata = {
  title: 'Install 0nMCP on Claude — Complete Guide | 0nMCP',
  description:
    'Step-by-step guide to install 0nMCP on Claude Desktop (macOS & Windows), Claude Code CLI, Claude API, and VS Code Copilot. 1,598+ tools, 106 services, no API key required.',
  keywords: [
    'install 0nMCP Claude',
    'Claude Desktop MCP',
    'Claude Code MCP server',
    'Claude API tools',
    'MCP server setup',
    '0nMCP installation',
    'Model Context Protocol',
    'Claude MCP config',
    'VS Code MCP',
    'Copilot MCP',
  ],
  openGraph: {
    title: 'Install 0nMCP on Claude — Complete Guide',
    description:
      '1,598+ tools across 106 services. Install 0nMCP on Claude Desktop, Claude Code, the Claude API, or VS Code. No API key required.',
    url: 'https://0nmcp.com/install/claude',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Install 0nMCP on Claude — Complete Guide',
    description:
      '1,598+ tools across 106 services. Install on Claude Desktop, Claude Code, the Claude API, or VS Code.',
  },
  alternates: {
    canonical: 'https://0nmcp.com/install/claude',
  },
}

function HowToJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Install 0nMCP on Claude',
    description:
      'Complete guide to installing 0nMCP — a universal AI API orchestrator with 1,598+ tools — on Claude Desktop, Claude Code, the Claude API, and VS Code.',
    totalTime: 'PT5M',
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Node.js 18+',
      },
      {
        '@type': 'HowToSupply',
        name: 'Claude Desktop, Claude Code, or VS Code',
      },
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'npm (Node Package Manager)',
      },
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Open Claude Desktop Settings',
        text: 'Launch Claude Desktop and open Settings > Developer > Edit Config.',
        position: 1,
      },
      {
        '@type': 'HowToStep',
        name: 'Add 0nMCP configuration',
        text: 'Paste the 0nMCP JSON config into claude_desktop_config.json: {"mcpServers":{"0nMCP":{"command":"npx","args":["-y","0nmcp"]}}}',
        position: 2,
      },
      {
        '@type': 'HowToStep',
        name: 'Restart Claude Desktop',
        text: 'Quit and reopen Claude Desktop. The MCP server initializes automatically.',
        position: 3,
      },
      {
        '@type': 'HowToStep',
        name: 'Verify installation',
        text: 'Type "list my tools" in a new Claude conversation to confirm 0nMCP is connected.',
        position: 4,
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

function BreadcrumbJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '0nMCP',
        item: 'https://0nmcp.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Install',
        item: 'https://0nmcp.com/install',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Claude',
        item: 'https://0nmcp.com/install/claude',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

function FAQJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need an API key to use 0nMCP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. 0nMCP itself requires no API key. It runs locally on your machine and provides tool definitions to Claude. You only need API keys for the individual services you want to connect.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is 0nMCP free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. 0nMCP is source-available under BSL-1.1 and free for local use. The npm package 0nmcp is free to install and run.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does 0nMCP work with Claude?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '0nMCP implements the Model Context Protocol (MCP), an open standard that lets AI assistants like Claude use external tools. When you add 0nMCP to your config, Claude can call any of the 1,598+ tools to interact with external services.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which Node.js version do I need?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Node.js 18 or higher. We recommend the latest LTS release.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data secure with 0nMCP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. 0nMCP runs 100% locally on your machine. No data is sent to 0nMCP servers. API calls go directly from your machine to service providers. Credentials can be encrypted with AES-256-GCM via the 0nVault system.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I update 0nMCP?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Since the config uses npx -y 0nmcp, it automatically pulls the latest version each time it starts. No manual updates needed.',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default function ClaudeInstallPage() {
  return (
    <>
      <HowToJsonLd />
      <BreadcrumbJsonLd />
      <FAQJsonLd />
      <ClaudeInstallClient />
    </>
  )
}
