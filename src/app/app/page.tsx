import type { Metadata } from 'next'
import PWAShell from './components/PWAShell'
import './app.css'

export const metadata: Metadata = {
  title: '0nMCP App',
}

export default function AppPage() {
  return <PWAShell />
}
