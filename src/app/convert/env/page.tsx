import type { Metadata } from 'next'
import { STATS_DISPLAY } from '@/data/stats'
import EnvConverterClient from './EnvConverterClient'

export const metadata: Metadata = {
  title: 'Convert .env to .0n — Free Encrypted Config Migration | 0nMCP',
  description:
    'Migrate your .env files to encrypted .0n format. AES-256-GCM encryption, automatic service detection, cross-platform AI config. Your keys never leave your browser.',
  keywords: [
    '.env security',
    'API key encryption',
    'config file migration',
    'env to encrypted',
    'secure environment variables',
    '.env converter',
    'encrypt API keys',
    'config encryption tool',
    '.0n format',
    'MCP config',
  ],
  openGraph: {
    title: 'Convert .env to .0n — Free Encrypted Config Migration',
    description:
      'Stop storing API keys in plaintext. Convert your .env files to the encrypted .0n standard with AES-256-GCM protection.',
    url: 'https://www.0nmcp.com/convert/env',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert .env to .0n — Free Encrypted Config Migration',
    description:
      'Stop storing API keys in plaintext. Convert your .env files to the encrypted .0n standard with AES-256-GCM protection.',
  },
  alternates: { canonical: 'https://www.0nmcp.com/convert/env' },
}

export default function EnvConverterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: '.env to .0n Converter by 0nMCP',
            description:
              'Free tool to convert plaintext .env files to encrypted .0n connection files with AES-256-GCM protection and automatic service detection.',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            url: 'https://www.0nmcp.com/convert/env',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            featureList: [
              'AES-256-GCM encryption',
              'Argon2id key derivation',
              'Automatic service detection',
              'Client-side processing',
              `${STATS_DISPLAY.services} service support`,
              'Cross-platform AI config export',
            ],
            author: {
              '@type': 'Organization',
              name: 'RocketOpp LLC',
              url: 'https://rocketopp.com',
            },
          }),
        }}
      />

      <EnvConverterClient />
    </>
  )
}
