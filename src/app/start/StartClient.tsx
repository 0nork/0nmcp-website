'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { STATS_DISPLAY, STATS } from '@/data/stats'

/* ═══════════════════════════════════════════════════════════════════
   0n STYLE GUIDE — FLAGSHIP PAGE
   This is the design standard for ALL 0nmcp.com frontend pages.

   Design System:
   - Light/Dark mode with CSS custom properties
   - Theme toggle (persisted to localStorage)
   - SXO conversion-optimized layout
   - Responsive: mobile-first, 3 breakpoints
   - Animation: subtle, GPU-accelerated, respects prefers-reduced-motion

   Tokens (see themes below):
   --0n-bg, --0n-bg-elevated, --0n-bg-card, --0n-bg-code
   --0n-text, --0n-text-secondary, --0n-text-muted
   --0n-accent (#6EE05A), --0n-accent-dim, --0n-accent-glow
   --0n-border, --0n-border-hover
   --0n-shadow-sm, --0n-shadow-md, --0n-shadow-lg
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Platform Data ─── */
type PlatformStatus = 'ready' | 'coming-soon'

interface PlatformCard {
  id: string
  name: string
  description: string
  category: string
  status: PlatformStatus
  color: string
  icon: string
  method?: 'config' | 'command' | 'link' | 'plugin'
  config?: string
  command?: string
  link?: string
  linkLabel?: string
}

const PLATFORMS: PlatformCard[] = [
  { id: 'claude-desktop', name: 'Claude Desktop', description: 'Add 0nMCP as an MCP server in Claude Desktop settings', category: 'AI Platforms', status: 'ready', color: '#a78bfa', icon: 'C', method: 'config', config: JSON.stringify({ mcpServers: { '0nMCP': { command: 'npx', args: ['-y', '0nmcp@latest'] } } }, null, 2) },
  { id: 'claude-code', name: 'Claude Code', description: 'Install the 0nMCP skill in your terminal', category: 'AI Platforms', status: 'ready', color: '#ff6b35', icon: '>_', method: 'command', command: 'claude mcp add 0nmcp -- npx -y 0nmcp@latest' },
  { id: 'chatgpt', name: 'ChatGPT / 0nGPT', description: 'Use 0nMCP inside ChatGPT with our custom GPT', category: 'AI Platforms', status: 'ready', color: '#10a37f', icon: 'G', method: 'link', link: '/downloads/ongpt', linkLabel: 'Open 0nGPT' },
  { id: 'gemini', name: 'Gemini', description: 'Google Gemini MCP integration', category: 'AI Platforms', status: 'coming-soon', color: '#4285F4', icon: 'Ge' },
  { id: 'grok', name: 'Grok', description: 'xAI Grok MCP integration', category: 'AI Platforms', status: 'coming-soon', color: '#1DA1F2', icon: 'Gk' },
  { id: 'cursor', name: 'Cursor', description: 'Add to your Cursor MCP configuration', category: 'Developer Tools', status: 'ready', color: '#00d4ff', icon: 'Cu', method: 'config', config: JSON.stringify({ mcpServers: { '0nMCP': { command: 'npx', args: ['-y', '0nmcp@latest'] } } }, null, 2) },
  { id: 'vscode', name: 'VS Code', description: 'Add to VS Code MCP settings (Copilot agent mode)', category: 'Developer Tools', status: 'ready', color: '#007ACC', icon: 'VS', method: 'config', config: JSON.stringify({ 'mcp.servers': { '0nMCP': { command: 'npx', args: ['-y', '0nmcp@latest'] } } }, null, 2) },
  { id: 'windsurf', name: 'Windsurf', description: 'Add to your Windsurf MCP configuration', category: 'Developer Tools', status: 'ready', color: '#06b6d4', icon: 'Ws', method: 'config', config: JSON.stringify({ mcpServers: { '0nMCP': { command: 'npx', args: ['-y', '0nmcp@latest'] } } }, null, 2) },
  { id: 'npm', name: 'npm CLI', description: 'Install globally and run from any terminal', category: 'Developer Tools', status: 'ready', color: '#CB3837', icon: 'npm', method: 'command', command: 'npm install -g 0nmcp' },
  { id: 'wordpress', name: 'WordPress / OnPress', description: 'Install the OnPress plugin for WordPress integration', category: 'Platforms', status: 'ready', color: '#21759b', icon: 'WP', method: 'link', link: 'https://wpsxo.com/onpress', linkLabel: 'Get OnPress Plugin' },
  { id: 'wpengine', name: 'WP Engine', description: 'Auto-deploy via GitHub Actions to WP Engine', category: 'Platforms', status: 'ready', color: '#0ecad4', icon: 'WE', method: 'link', link: 'https://github.com/0nork/wpengine-deploy', linkLabel: 'View GitHub Action' },
  { id: 'slack', name: 'Slack', description: 'Slack bot integration with 0nMCP', category: 'Platforms', status: 'coming-soon', color: '#4A154B', icon: 'Sl' },
  { id: 'discord', name: 'Discord', description: 'Discord bot integration with 0nMCP', category: 'Platforms', status: 'coming-soon', color: '#5865F2', icon: 'Dc' },
  { id: 'crm-marketplace', name: 'CRM Marketplace', description: 'Install directly from the CRM marketplace', category: 'Platforms', status: 'coming-soon', color: '#6EE05A', icon: '0n' },
  { id: 'chrome', name: 'Chrome Extension', description: 'Run 0nMCP tools from any browser tab', category: 'Browser', status: 'ready', color: '#4285F4', icon: 'Ch', method: 'link', link: 'https://github.com/0nork/0nmcp-chrome', linkLabel: 'View on GitHub' },
  { id: 'figma', name: 'Figma', description: 'Design-to-code with OnPress', category: 'Design', status: 'coming-soon', color: '#F24E1E', icon: 'Fi' },
]

const CATEGORIES = ['AI Platforms', 'Developer Tools', 'Platforms', 'Browser', 'Design']

const TRUST_SIGNALS = [
  { value: STATS_DISPLAY.tools, label: 'Tools', icon: '///' },
  { value: STATS_DISPLAY.services, label: 'Services', icon: '::' },
  { value: STATS_DISPLAY.patents, label: 'Patents Filed', icon: '[]' },
  { value: 'MIT', label: 'Licensed', icon: '<>' },
  { value: '$0', label: 'Local Use', icon: '--' },
]

/* ─── Component ─── */
export function StartClient() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('0n-theme') as 'light' | 'dark' | null
    if (saved) setTheme(saved)
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark')
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('0n-theme', next)
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function toggleCard(id: string, status: PlatformStatus) {
    if (status === 'coming-soon') return
    setExpanded(prev => prev === id ? null : id)
  }

  const d = theme === 'dark'

  if (!mounted) return null

  return (
    <div className={`on-page ${theme}`}>
      <style>{`
        /* ═══════════════════════════════════════════════════════════
           0n DESIGN SYSTEM — CSS Custom Properties
           Light + Dark theme tokens
           ═══════════════════════════════════════════════════════════ */

        .on-page {
          --0n-accent: #6EE05A;
          --0n-accent-dim: #4CAF3D;
          --0n-accent-glow: rgba(110, 224, 90, 0.15);
          --0n-accent-text: #3d8a2e;
          --0n-font: 'Instrument Sans', system-ui, -apple-system, sans-serif;
          --0n-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
          --0n-radius: 16px;
          --0n-radius-sm: 10px;
          --0n-radius-xs: 6px;
          --0n-transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 100vh;
          font-family: var(--0n-font);
          transition: background var(--0n-transition), color var(--0n-transition);
        }

        /* ── LIGHT MODE ── */
        .on-page.light {
          --0n-bg: #f8f9fa;
          --0n-bg-elevated: #ffffff;
          --0n-bg-card: #ffffff;
          --0n-bg-code: #f1f3f5;
          --0n-bg-hero: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
          --0n-text: #111827;
          --0n-text-secondary: #4b5563;
          --0n-text-muted: #9ca3af;
          --0n-border: #e5e7eb;
          --0n-border-hover: #d1d5db;
          --0n-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
          --0n-shadow-md: 0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.08);
          --0n-shadow-lg: 0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
          --0n-shadow-accent: 0 4px 20px rgba(110, 224, 90, 0.25);
          --0n-accent-text: #2d6a22;
          --0n-badge-bg: rgba(110, 224, 90, 0.08);
          --0n-badge-border: rgba(110, 224, 90, 0.25);
          --0n-code-text: #374151;
          --0n-copy-bg: #ffffff;
          --0n-copy-border: #d1d5db;
          background: var(--0n-bg);
          color: var(--0n-text);
        }

        /* ── DARK MODE ── */
        .on-page.dark {
          --0n-bg: #0B0F19;
          --0n-bg-elevated: #111827;
          --0n-bg-card: #111827;
          --0n-bg-code: #0d1117;
          --0n-bg-hero: linear-gradient(180deg, #0f1420 0%, #0B0F19 100%);
          --0n-text: #E8EAED;
          --0n-text-secondary: #9CA3AF;
          --0n-text-muted: #4A5568;
          --0n-border: #1E293B;
          --0n-border-hover: #2D3748;
          --0n-shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
          --0n-shadow-md: 0 4px 16px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2);
          --0n-shadow-lg: 0 12px 40px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2);
          --0n-shadow-accent: 0 4px 24px rgba(110, 224, 90, 0.2);
          --0n-accent-text: #6EE05A;
          --0n-badge-bg: rgba(110, 224, 90, 0.08);
          --0n-badge-border: rgba(110, 224, 90, 0.2);
          --0n-code-text: #e8eaed;
          --0n-copy-bg: #1E293B;
          --0n-copy-border: #2D3748;
          background: var(--0n-bg);
          color: var(--0n-text);
        }

        /* ═══ HERO ═══ */
        .on-hero {
          background: var(--0n-bg-hero);
          text-align: center;
          padding: 6rem 1.5rem 3.5rem;
          position: relative;
          overflow: hidden;
        }
        .on-hero::before {
          content: '';
          position: absolute;
          top: -40%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          background: radial-gradient(ellipse at center, var(--0n-accent-glow) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          animation: on-glow-pulse 6s ease-in-out infinite;
        }
        @keyframes on-glow-pulse {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }
        .on-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 720px;
          margin: 0 auto;
        }

        /* ═══ BADGE ═══ */
        .on-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1.125rem;
          border-radius: 999px;
          background: var(--0n-badge-bg);
          border: 1px solid var(--0n-badge-border);
          color: var(--0n-accent-text);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }
        .on-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--0n-accent);
          animation: on-dot-pulse 2s ease-in-out infinite;
        }
        @keyframes on-dot-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(110,224,90,0.4); }
          50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(110,224,90,0); }
        }

        /* ═══ TYPOGRAPHY ═══ */
        .on-h1 {
          font-size: clamp(2.25rem, 6vw, 3.75rem);
          font-weight: 900;
          line-height: 1.08;
          margin: 0 0 1.25rem;
          color: var(--0n-text);
          letter-spacing: -0.03em;
        }
        .on-h1 .accent {
          color: var(--0n-accent);
        }
        .on-subtitle {
          font-size: clamp(1rem, 2vw, 1.1875rem);
          color: var(--0n-text-secondary);
          line-height: 1.65;
          margin: 0 auto 2.25rem;
          max-width: 520px;
        }
        .on-subtitle strong {
          color: var(--0n-text);
          font-weight: 600;
        }

        /* ═══ CTA BUTTON ═══ */
        .on-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2.25rem;
          border-radius: var(--0n-radius-sm);
          background: var(--0n-accent);
          color: #000;
          font-size: 1rem;
          font-weight: 700;
          font-family: var(--0n-font);
          text-decoration: none;
          border: none;
          cursor: pointer;
          box-shadow: var(--0n-shadow-accent);
          transition: all var(--0n-transition);
          position: relative;
          overflow: hidden;
        }
        .on-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(110,224,90,0.35);
        }
        .on-cta:active {
          transform: translateY(0);
        }
        .on-cta-secondary {
          background: var(--0n-bg-elevated);
          color: var(--0n-text);
          border: 1px solid var(--0n-border);
          box-shadow: var(--0n-shadow-sm);
        }
        .on-cta-secondary:hover {
          border-color: var(--0n-accent);
          box-shadow: var(--0n-shadow-md);
        }

        /* ═══ STATS ROW ═══ */
        .on-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }
        .on-stat {
          text-align: center;
          min-width: 80px;
        }
        .on-stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--0n-text);
          font-family: var(--0n-mono);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .on-stat-label {
          font-size: 0.6875rem;
          color: var(--0n-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        /* ═══ TRUST BAR ═══ */
        .on-trust-bar {
          display: flex;
          justify-content: center;
          gap: 0;
          padding: 1.25rem 1.5rem;
          background: var(--0n-bg-elevated);
          border-top: 1px solid var(--0n-border);
          border-bottom: 1px solid var(--0n-border);
          overflow-x: auto;
        }
        .on-trust-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0 1.75rem;
          border-right: 1px solid var(--0n-border);
          white-space: nowrap;
        }
        .on-trust-item:last-child { border-right: none; }
        .on-trust-icon {
          font-family: var(--0n-mono);
          font-size: 0.75rem;
          color: var(--0n-accent);
          font-weight: 700;
          opacity: 0.6;
        }
        .on-trust-value {
          font-size: 0.9375rem;
          font-weight: 800;
          color: var(--0n-text);
          font-family: var(--0n-mono);
        }
        .on-trust-label {
          font-size: 0.625rem;
          color: var(--0n-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        /* ═══ THEME TOGGLE ═══ */
        .on-theme-toggle {
          position: fixed;
          top: 5rem;
          right: 1.25rem;
          z-index: 100;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid var(--0n-border);
          background: var(--0n-bg-elevated);
          color: var(--0n-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.125rem;
          box-shadow: var(--0n-shadow-md);
          transition: all var(--0n-transition);
        }
        .on-theme-toggle:hover {
          border-color: var(--0n-accent);
          color: var(--0n-accent);
          transform: scale(1.05);
        }

        /* ═══ SECTION ═══ */
        .on-section {
          max-width: 1120px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
        }
        .on-section-label {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--0n-text-muted);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .on-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--0n-border);
        }

        /* ═══ PLATFORM GRID ═══ */
        .on-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 0.875rem;
        }

        /* ═══ PLATFORM CARD ═══ */
        .on-card {
          background: var(--0n-bg-card);
          border-radius: var(--0n-radius);
          padding: 1.25rem 1.375rem;
          border: 1px solid var(--0n-border);
          box-shadow: var(--0n-shadow-sm);
          transition: all var(--0n-transition);
          cursor: pointer;
          position: relative;
        }
        .on-card:hover:not(.disabled) {
          border-color: var(--0n-border-hover);
          box-shadow: var(--0n-shadow-md);
          transform: translateY(-1px);
        }
        .on-card.active {
          border-color: var(--0n-accent);
          box-shadow: var(--0n-shadow-md), 0 0 0 1px var(--0n-accent);
        }
        .on-card.disabled {
          opacity: 0.45;
          cursor: default;
        }
        .on-card-row {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }
        .on-card-icon {
          width: 42px;
          height: 42px;
          border-radius: var(--0n-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8125rem;
          font-weight: 800;
          font-family: var(--0n-mono);
          flex-shrink: 0;
          transition: transform var(--0n-transition);
        }
        .on-card:hover:not(.disabled) .on-card-icon {
          transform: scale(1.05);
        }
        .on-card-name {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--0n-text);
          margin: 0;
          line-height: 1.3;
        }
        .on-card-desc {
          font-size: 0.8125rem;
          color: var(--0n-text-secondary);
          margin: 0.2rem 0 0;
          line-height: 1.45;
        }
        .on-card-badge {
          font-size: 0.5625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--0n-text-muted);
          background: var(--0n-bg-code);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--0n-border);
        }
        .on-card-chevron {
          flex-shrink: 0;
          color: var(--0n-text-muted);
          transition: transform var(--0n-transition), color var(--0n-transition);
        }
        .on-card.active .on-card-chevron {
          transform: rotate(180deg);
          color: var(--0n-accent);
        }

        /* ═══ EXPANDED CONTENT ═══ */
        .on-expand {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: var(--0n-radius-sm);
          background: var(--0n-bg-code);
          border: 1px solid var(--0n-border);
          animation: on-slide-down 0.2s ease-out;
        }
        @keyframes on-slide-down {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .on-expand-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .on-expand-label {
          font-size: 0.625rem;
          font-weight: 700;
          color: var(--0n-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .on-code {
          font-family: var(--0n-mono);
          font-size: 0.75rem;
          line-height: 1.7;
          color: var(--0n-code-text);
          white-space: pre;
          overflow-x: auto;
          margin: 0;
        }
        .on-cmd {
          font-family: var(--0n-mono);
          font-size: 0.8125rem;
          color: var(--0n-text);
          background: var(--0n-bg-code);
          padding: 0.75rem 1rem;
          border-radius: var(--0n-radius-xs);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          border: 1px solid var(--0n-border);
        }
        .on-copy-btn {
          padding: 0.375rem 0.875rem;
          border-radius: var(--0n-radius-xs);
          border: 1px solid var(--0n-copy-border);
          background: var(--0n-copy-bg);
          color: var(--0n-text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--0n-font);
          cursor: pointer;
          flex-shrink: 0;
          transition: all var(--0n-transition);
        }
        .on-copy-btn:hover {
          border-color: var(--0n-accent);
          color: var(--0n-accent);
        }
        .on-copy-btn.copied {
          background: var(--0n-accent);
          color: #000;
          border-color: var(--0n-accent);
        }
        .on-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1.125rem;
          border-radius: var(--0n-radius-xs);
          font-size: 0.8125rem;
          font-weight: 600;
          text-decoration: none;
          transition: all var(--0n-transition);
        }
        .on-link-btn:hover {
          transform: translateX(2px);
        }

        /* ═══ WHY SECTION (Table Trap) ═══ */
        .on-why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .on-why-card {
          padding: 1.5rem;
          border-radius: var(--0n-radius);
          background: var(--0n-bg-card);
          border: 1px solid var(--0n-border);
          box-shadow: var(--0n-shadow-sm);
          transition: all var(--0n-transition);
        }
        .on-why-card:hover {
          box-shadow: var(--0n-shadow-md);
          transform: translateY(-2px);
        }
        .on-why-icon {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1;
        }
        .on-why-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--0n-text);
          margin: 0 0 0.375rem;
        }
        .on-why-desc {
          font-size: 0.8125rem;
          color: var(--0n-text-secondary);
          line-height: 1.55;
          margin: 0;
        }

        /* ═══ BOTTOM CTA ═══ */
        .on-bottom-cta {
          text-align: center;
          padding: 4.5rem 1.5rem 5.5rem;
          position: relative;
        }
        .on-bottom-cta::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 300px;
          background: linear-gradient(180deg, transparent, var(--0n-accent-glow));
          pointer-events: none;
        }
        .on-bottom-cta > * {
          position: relative;
          z-index: 1;
        }

        /* ═══ STICKY BAR ═══ */
        .on-sticky {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 90;
          padding: 0.75rem 1.5rem;
          background: var(--0n-bg-elevated);
          border-top: 1px solid var(--0n-border);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .on-sticky.visible {
          transform: translateY(0);
        }
        .on-sticky-text {
          font-size: 0.875rem;
          color: var(--0n-text-secondary);
          font-weight: 500;
        }
        .on-sticky-text strong {
          color: var(--0n-text);
          font-weight: 700;
        }
        .on-sticky-cta {
          padding: 0.5rem 1.5rem;
          border-radius: var(--0n-radius-xs);
          background: var(--0n-accent);
          color: #000;
          font-size: 0.875rem;
          font-weight: 700;
          font-family: var(--0n-font);
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all var(--0n-transition);
        }
        .on-sticky-cta:hover {
          box-shadow: var(--0n-shadow-accent);
        }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 768px) {
          .on-hero { padding: 4.5rem 1.25rem 2.5rem; }
          .on-grid { grid-template-columns: 1fr; }
          .on-why-grid { grid-template-columns: 1fr; }
          .on-stats { gap: 1.25rem; }
          .on-trust-bar { justify-content: flex-start; }
          .on-trust-item { padding: 0 1.25rem; }
          .on-sticky { gap: 0.75rem; }
          .on-sticky-text { font-size: 0.75rem; }
        }
        @media (max-width: 480px) {
          .on-h1 { font-size: 2rem; }
          .on-hero { padding: 3.5rem 1rem 2rem; }
          .on-section { padding: 2rem 1rem; }
          .on-cta-group { flex-direction: column; }
        }

        /* ═══ PREFERS REDUCED MOTION ═══ */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* ── Theme Toggle ── */}
      <button className="on-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {d ? '\u2600' : '\u263D'}
      </button>

      {/* ═══════════════════════════════════════════════════
          HERO — BLUF: Value prop in 2 seconds
          ═══════════════════════════════════════════════════ */}
      <section className="on-hero">
        <div className="on-hero-inner">
          <div className="on-badge">
            <span className="on-badge-dot" />
            TURN IT 0N
          </div>

          <h1 className="on-h1">
            Install <span className="accent">0n</span>.<br />
            Use it everywhere.
          </h1>

          <p className="on-subtitle">
            <strong>{STATS_DISPLAY.tools} tools</strong> across <strong>{STATS_DISPLAY.services} services</strong>.
            Encrypted vault. AI brain. {STATS_DISPLAY.patents} patents.{' '}
            One install. Every platform you use.
          </p>

          <div className="on-stats">
            {[
              { v: STATS_DISPLAY.tools, l: 'Tools' },
              { v: STATS_DISPLAY.services, l: 'Services' },
              { v: STATS_DISPLAY.capabilities, l: 'Capabilities' },
              { v: String(PLATFORMS.filter(p => p.status === 'ready').length), l: 'Platforms' },
            ].map(s => (
              <div className="on-stat" key={s.l}>
                <div className="on-stat-value">{s.v}</div>
                <div className="on-stat-label">{s.l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }} className="on-cta-group">
            <Link href="/subscribe" className="on-cta">
              Get Founders Access — $50/mo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <Link href="https://github.com/0nork/0nMCP" className="on-cta on-cta-secondary" target="_blank">
              Star on GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TRUST BAR — Social proof strip
          ═══════════════════════════════════════════════════ */}
      <div className="on-trust-bar">
        {TRUST_SIGNALS.map(t => (
          <div className="on-trust-item" key={t.label}>
            <span className="on-trust-icon">{t.icon}</span>
            <div>
              <div className="on-trust-value">{t.value}</div>
              <div className="on-trust-label">{t.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          PLATFORM CARDS — Interactive install grid
          ═══════════════════════════════════════════════════ */}
      <div className="on-section">
        {CATEGORIES.map(category => {
          const items = PLATFORMS.filter(p => p.category === category)
          if (items.length === 0) return null
          return (
            <div key={category} style={{ marginBottom: '0.5rem' }}>
              <div className="on-section-label">{category}</div>
              <div className="on-grid">
                {items.map(platform => {
                  const isExpanded = expanded === platform.id
                  const isComingSoon = platform.status === 'coming-soon'
                  return (
                    <div
                      key={platform.id}
                      className={`on-card ${isExpanded ? 'active' : ''} ${isComingSoon ? 'disabled' : ''}`}
                      onClick={() => toggleCard(platform.id, platform.status)}
                    >
                      <div className="on-card-row">
                        <div className="on-card-icon" style={{ background: `${platform.color}15`, color: platform.color }}>
                          {platform.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <p className="on-card-name">{platform.name}</p>
                            {isComingSoon && <span className="on-card-badge">Soon</span>}
                          </div>
                          <p className="on-card-desc">{platform.description}</p>
                        </div>
                        {!isComingSoon && (
                          <svg className="on-card-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      {isExpanded && !isComingSoon && (
                        <div className="on-expand" onClick={e => e.stopPropagation()}>
                          {platform.method === 'config' && platform.config && (
                            <>
                              <div className="on-expand-header">
                                <span className="on-expand-label">Configuration</span>
                                <button className={`on-copy-btn ${copiedId === platform.id ? 'copied' : ''}`} onClick={() => handleCopy(platform.config!, platform.id)}>
                                  {copiedId === platform.id ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <pre className="on-code">{platform.config}</pre>
                            </>
                          )}
                          {platform.method === 'command' && platform.command && (
                            <div className="on-cmd">
                              <code style={{ fontFamily: 'var(--0n-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                $ {platform.command}
                              </code>
                              <button className={`on-copy-btn ${copiedId === platform.id ? 'copied' : ''}`} onClick={() => handleCopy(platform.command!, platform.id)}>
                                {copiedId === platform.id ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          )}
                          {(platform.method === 'link' || platform.method === 'plugin') && platform.link && (
                            <a
                              href={platform.link}
                              target={platform.link.startsWith('http') ? '_blank' : undefined}
                              rel={platform.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="on-link-btn"
                              style={{ background: `${platform.color}12`, color: platform.color, border: `1px solid ${platform.color}25` }}
                            >
                              {platform.linkLabel || 'Open'}
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M5 3h8v8M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ═══════════════════════════════════════════════════
          WHY 0nMCP — Table Trap / Feature Grid
          ═══════════════════════════════════════════════════ */}
      <div className="on-section">
        <div className="on-section-label">Why 0nMCP</div>
        <div className="on-why-grid">
          {[
            { icon: '\u26A1', title: 'One Install, Every Platform', desc: `Works with Claude, GPT, Gemini, Cursor, VS Code, WordPress, Slack, and ${STATS.ai_platforms}+ AI platforms. No per-platform configuration.` },
            { icon: '\uD83D\uDD12', title: 'Vault-Encrypted Security', desc: 'AES-256-GCM + hardware fingerprint binding. Your credentials never leave your machine. 5 patents filed on the security architecture.' },
            { icon: '\uD83E\uDDE0', title: 'AI-Native Orchestration', desc: 'Describe outcomes, not steps. 0nMCP figures out which tools to use, which APIs to call, and how to chain them together.' },
            { icon: '\uD83D\uDCE6', title: 'Portable .0n Files', desc: 'SWITCH files replace brittle workflows. Share automations as portable .0n files that run anywhere 0nMCP is installed.' },
            { icon: '\uD83C\uDFE2', title: 'Business Deed Transfer', desc: 'Patent-pending technology. Package an entire business into an encrypted container and transfer it to a new owner in minutes.' },
            { icon: '\u2764\uFE0F', title: 'Free & Open Source', desc: `MIT licensed. ${STATS_DISPLAY.tools} tools. Unlimited local use. No vendor lock-in. Your data stays yours.` },
          ].map(w => (
            <div className="on-why-card" key={w.title}>
              <div className="on-why-icon">{w.icon}</div>
              <h3 className="on-why-title">{w.title}</h3>
              <p className="on-why-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          BOTTOM CTA — Final conversion
          ═══════════════════════════════════════════════════ */}
      <div className="on-bottom-cta">
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--0n-text)', margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>
          Ready to turn it <span style={{ color: 'var(--0n-accent)' }}>0n</span>?
        </h2>
        <p style={{ fontSize: '1.0625rem', color: 'var(--0n-text-secondary)', margin: '0 auto 2rem', maxWidth: '480px', lineHeight: 1.65 }}>
          {STATS_DISPLAY.tools} tools. {STATS_DISPLAY.services} services. {STATS_DISPLAY.patents} patents. MIT licensed.
          The universal AI orchestrator — install once, use everywhere.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/subscribe" className="on-cta">
            Get Started — $50/mo
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
          <Link href="https://www.npmjs.com/package/0nmcp" className="on-cta on-cta-secondary" target="_blank">
            npm install -g 0nmcp
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          STICKY BOTTOM BAR — Shows after scroll
          ═══════════════════════════════════════════════════ */}
      <StickyBar />
    </div>
  )
}

/* ─── Sticky CTA Bar ─── */
function StickyBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`on-sticky ${visible ? 'visible' : ''}`}>
      <span className="on-sticky-text">
        <strong>{STATS_DISPLAY.tools} tools</strong> across {STATS_DISPLAY.services} services
      </span>
      <Link href="/subscribe" className="on-sticky-cta">
        Get Founders Access
      </Link>
    </div>
  )
}
