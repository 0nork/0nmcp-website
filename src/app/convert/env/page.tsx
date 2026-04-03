import type { Metadata } from 'next'
import EnvConverterClient from './EnvConverterClient'

export const metadata: Metadata = {
  title: 'Convert .env to .0n — Free Encrypted Config Migration | 0nMCP',
  description: 'Paste your .env file and get military-grade encrypted .0n files. Auto-detects 20+ services. Your keys never leave your browser.',
  keywords: ['.env security', 'API key encryption', 'config migration', '.0n standard', 'secret management', '0nMCP'],
  openGraph: {
    title: 'Convert .env to .0n — Stop Storing API Keys in Plain Text',
    description: 'Free tool: paste your .env, get encrypted .0n files with 7-layer security.',
    url: 'https://0nmcp.com/convert/env',
    siteName: '0nMCP',
    type: 'website',
  },
  alternates: { canonical: 'https://0nmcp.com/convert/env' },
}

export default function ConvertEnvPage() {
  return <EnvConverterClient />
}
