'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
interface Section {
  id: string
  label: string
  icon: React.ReactNode
}

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */
const CONFIG_JSON = `{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`

const CLAUDE_CODE_SETTINGS = `{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`

const VSCODE_MCP_JSON = `{
  "servers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`

const CLAUDE_MD_TEMPLATE = `# Project Configuration

## MCP Servers
This project uses 0nMCP for AI-powered API orchestration.

### Available Tools
- 1,589 tools across 102 services
- CRM, Stripe, SendGrid, Slack, Discord, GitHub, Shopify, and 95 more
- No API key required for local use

### Usage
Ask Claude to use 0nMCP tools directly:
- "List all contacts in my CRM"
- "Send a Slack message to #general"
- "Create a Stripe checkout session"
- "Generate a workflow to onboard new customers"`

const SECTIONS: Section[] = [
  { id: 'desktop-mac', label: 'Claude Desktop (macOS)', icon: <MacIcon /> },
  { id: 'desktop-windows', label: 'Claude Desktop (Windows)', icon: <WindowsIcon /> },
  { id: 'claude-code', label: 'Claude Code (CLI)', icon: <TerminalIcon /> },
  { id: 'claude-projects', label: 'Claude Code Projects', icon: <FolderIcon /> },
  { id: 'claude-api', label: 'Claude API (Developers)', icon: <CodeIcon /> },
  { id: 'vscode', label: 'VS Code (Copilot MCP)', icon: <VSCodeIcon /> },
  { id: 'faq', label: 'FAQ', icon: <QuestionIcon /> },
]

/* ──────────────────────────────────────────────
   Icons (inline SVG)
   ────────────────────────────────────────────── */
function MacIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
      <path d="M15.5 8.5c.828 0 1.5.895 1.5 2s-.672 2-1.5 2h-1c-.828 0-1.5-.895-1.5-2v-4c0-1.105.672-2 1.5-2s1.5.895 1.5 2" />
      <path d="M8.5 8.5c-.828 0-1.5.895-1.5 2s.672 2 1.5 2h1c.828 0 1.5-.895 1.5-2v-4c0-1.105-.672-2-1.5-2S7 5.395 7 6.5" />
      <path d="M9 15.5c0 1.38 1.343 2.5 3 2.5s3-1.12 3-2.5" />
    </svg>
  )
}

function WindowsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 12V6.5l8-1.1V12H3zm0 .5h8v6.6l-8-1.1V12.5zM11.5 5.3l9.5-1.3v8h-9.5V5.3zm0 7.2h9.5v8L11.5 19.2v-6.7z" />
    </svg>
  )
}

function TerminalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function VSCodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.583 2.267l-9.27 8.45L3.76 7.1 2 8.004v7.992l1.76.904 4.553-3.617 9.27 8.45L22 19.62V4.38l-4.417-2.113zM17.5 17.283l-6.457-5.283L17.5 6.717v10.566z" />
    </svg>
  )
}

function QuestionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

/* ──────────────────────────────────────────────
   Copy Button
   ────────────────────────────────────────────── */
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="copy-btn"
      aria-label={label || 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <CheckIcon /> <span>Copied</span>
        </>
      ) : (
        <>
          <CopyIcon /> <span>Copy</span>
        </>
      )}
    </button>
  )
}

/* ──────────────────────────────────────────────
   Code Block
   ────────────────────────────────────────────── */
function CodeBlock({ code, language, filename }: { code: string; language?: string; filename?: string }) {
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{filename || language || 'json'}</span>
        <CopyButton text={code} />
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Step Component
   ────────────────────────────────────────────── */
function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="step">
      <div className="step-number">{number}</div>
      <div className="step-content">
        <h4 className="step-title">{title}</h4>
        <div className="step-body">{children}</div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   FAQ Item
   ────────────────────────────────────────────── */
function FAQItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{question}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className="faq-answer">{children}</div>}
    </div>
  )
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
export default function ClaudeInstallClient() {
  const [activeSection, setActiveSection] = useState('desktop-mac')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="claude-install-page">
      <style>{pageStyles}</style>

      {/* ── HERO ── */}
      <section className="ci-hero">
        <div className="ci-hero-inner">
          <div className="ci-hero-logos">
            <div className="ci-logo-box">
              <Image
                src="/brand/icon-green.png"
                alt="0nMCP"
                width={72}
                height={72}
                priority
              />
              <span className="ci-logo-label">0nMCP</span>
            </div>
            <div className="ci-arrow"><ArrowIcon /></div>
            <div className="ci-logo-box">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <rect width="72" height="72" rx="16" fill="#D4A574" />
                <text x="36" y="46" textAnchor="middle" fontSize="32" fontWeight="700" fill="#462A13">C</text>
              </svg>
              <span className="ci-logo-label">Claude</span>
            </div>
          </div>

          <h1 className="ci-hero-title">
            Install <span className="ci-highlight">0nMCP</span> on Claude
          </h1>
          <p className="ci-hero-subtitle">
            Complete guide to connecting 1,589 tools across 102 services to Claude Desktop, Claude Code, the Claude API, and VS Code.
          </p>
          <p className="ci-hero-note">
            No API key required. 0nMCP provides the tools — Claude provides the intelligence.
          </p>

          <div className="ci-hero-stats">
            <div className="ci-stat">
              <span className="ci-stat-value">1,589</span>
              <span className="ci-stat-label">Tools</span>
            </div>
            <div className="ci-stat">
              <span className="ci-stat-value">102</span>
              <span className="ci-stat-label">Services</span>
            </div>
            <div className="ci-stat">
              <span className="ci-stat-value">22</span>
              <span className="ci-stat-label">Categories</span>
            </div>
            <div className="ci-stat">
              <span className="ci-stat-value">$0</span>
              <span className="ci-stat-label">Local Use</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── LAYOUT: TOC + CONTENT ── */}
      <div className="ci-layout">
        {/* Table of Contents */}
        <aside className="ci-toc">
          <nav className="ci-toc-nav">
            <span className="ci-toc-title">Installation Methods</span>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`ci-toc-link ${activeSection === s.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <span className="ci-toc-icon">{s.icon}</span>
                <span>{s.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ci-content">

          {/* ── 1. Claude Desktop macOS ── */}
          <section id="desktop-mac" className="ci-section">
            <div className="ci-section-header">
              <div className="ci-section-icon"><MacIcon /></div>
              <div>
                <h2>Claude Desktop (macOS)</h2>
                <p className="ci-section-desc">The fastest way to get started. Add 0nMCP to Claude Desktop with a single config paste.</p>
              </div>
            </div>

            <div className="ci-steps">
              <Step number={1} title="Open Claude Desktop">
                <p>Launch Claude Desktop on your Mac. If you don&apos;t have it yet, download it from <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer">claude.ai/download</a>.</p>
              </Step>

              <Step number={2} title="Open Settings">
                <p>Click the <strong>Claude</strong> menu in the top menu bar, then select <strong>Settings</strong> (or press <kbd>Cmd</kbd> + <kbd>,</kbd>).</p>
              </Step>

              <Step number={3} title="Navigate to Developer settings">
                <p>In the Settings window, click <strong>Developer</strong> in the left sidebar, then click <strong>Edit Config</strong>.</p>
              </Step>

              <Step number={4} title="Paste the 0nMCP configuration">
                <p>This opens your config file. Replace its contents with (or merge into existing config):</p>
                <CodeBlock code={CONFIG_JSON} filename="claude_desktop_config.json" />
                <p className="ci-file-path">
                  File location: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>
                </p>
              </Step>

              <Step number={5} title="Restart Claude Desktop">
                <p>Quit Claude Desktop completely (<kbd>Cmd</kbd> + <kbd>Q</kbd>) and reopen it. The MCP server will initialize on first use.</p>
              </Step>
            </div>

            <div className="ci-verify">
              <h3>Verify it works</h3>
              <p>After restarting, type this into a new Claude conversation:</p>
              <CodeBlock code="list my tools" language="text" />
              <p>Claude should respond with a list of 0nMCP tools it can access. You&apos;ll see tools for CRM, Stripe, Slack, GitHub, and dozens more services.</p>
            </div>
          </section>

          {/* ── 2. Claude Desktop Windows ── */}
          <section id="desktop-windows" className="ci-section">
            <div className="ci-section-header">
              <div className="ci-section-icon"><WindowsIcon /></div>
              <div>
                <h2>Claude Desktop (Windows)</h2>
                <p className="ci-section-desc">Same one-config setup, with Windows-specific file paths.</p>
              </div>
            </div>

            <div className="ci-steps">
              <Step number={1} title="Open Claude Desktop">
                <p>Launch Claude Desktop on Windows. Download from <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer">claude.ai/download</a> if needed.</p>
              </Step>

              <Step number={2} title="Open Settings">
                <p>Click the hamburger menu (three lines) in the top-left corner, then select <strong>Settings</strong>. Or use the keyboard shortcut <kbd>Ctrl</kbd> + <kbd>,</kbd>.</p>
              </Step>

              <Step number={3} title="Navigate to Developer settings">
                <p>Click <strong>Developer</strong> in the sidebar, then click <strong>Edit Config</strong>.</p>
              </Step>

              <Step number={4} title="Paste the 0nMCP configuration">
                <p>The config file opens in your default text editor. Paste this JSON:</p>
                <CodeBlock code={CONFIG_JSON} filename="claude_desktop_config.json" />
                <p className="ci-file-path">
                  File location: <code>%APPDATA%\Claude\claude_desktop_config.json</code>
                </p>
                <p className="ci-hint">Tip: Press <kbd>Win</kbd> + <kbd>R</kbd>, type <code>%APPDATA%\Claude</code>, and press Enter to navigate there directly.</p>
              </Step>

              <Step number={5} title="Restart Claude Desktop">
                <p>Close Claude Desktop completely and reopen it. The MCP server will download and start automatically on first use.</p>
              </Step>
            </div>

            <div className="ci-verify">
              <h3>Verify it works</h3>
              <p>Type <code>list my tools</code> in a new conversation. Claude will show all available 0nMCP tools.</p>
            </div>
          </section>

          {/* ── 3. Claude Code CLI ── */}
          <section id="claude-code" className="ci-section">
            <div className="ci-section-header">
              <div className="ci-section-icon"><TerminalIcon /></div>
              <div>
                <h2>Claude Code (CLI)</h2>
                <p className="ci-section-desc">Add 0nMCP to Claude&apos;s command-line coding assistant with one command.</p>
              </div>
            </div>

            <div className="ci-steps">
              <Step number={1} title="Install Claude Code (if needed)">
                <p>Install Claude Code globally via npm:</p>
                <CodeBlock code="npm install -g @anthropic-ai/claude-code" language="bash" />
              </Step>

              <Step number={2} title="Add 0nMCP via CLI (recommended)">
                <p>The fastest way — run this single command:</p>
                <CodeBlock code="claude mcp add 0nMCP npx -y 0nmcp" language="bash" />
                <p>This registers 0nMCP as an MCP server that Claude Code can use in all conversations.</p>
              </Step>

              <Step number={3} title="Or add to settings.json manually">
                <p>Alternatively, add to your <code>.claude/settings.json</code> or project-level <code>CLAUDE.md</code>:</p>
                <CodeBlock code={CLAUDE_CODE_SETTINGS} filename=".claude/settings.json" />
              </Step>
            </div>

            <div className="ci-verify">
              <h3>Verify it works</h3>
              <p>Open a terminal in any project and run:</p>
              <CodeBlock code="claude" language="bash" />
              <p>Then ask Claude to list available MCP tools. You should see 0nMCP tools in the output.</p>
            </div>
          </section>

          {/* ── 4. Claude Code Projects ── */}
          <section id="claude-projects" className="ci-section">
            <div className="ci-section-header">
              <div className="ci-section-icon"><FolderIcon /></div>
              <div>
                <h2>Claude Code Projects</h2>
                <p className="ci-section-desc">Pre-configure 0nMCP for an entire project so every conversation has tool access.</p>
              </div>
            </div>

            <div className="ci-steps">
              <Step number={1} title="Create a CLAUDE.md in your project root">
                <p>Add a <code>CLAUDE.md</code> file to your project root. This gives Claude context about your project and available tools:</p>
                <CodeBlock code={CLAUDE_MD_TEMPLATE} filename="CLAUDE.md" />
              </Step>

              <Step number={2} title="Add MCP config to project settings">
                <p>Create <code>.claude/settings.json</code> in your project root:</p>
                <CodeBlock code={CLAUDE_CODE_SETTINGS} filename=".claude/settings.json" />
              </Step>

              <Step number={3} title="Start using 0nMCP tools">
                <p>Open your terminal in the project directory and start Claude Code:</p>
                <CodeBlock code="claude" language="bash" />
                <p>Claude now has full access to 0nMCP tools. Try these commands in your conversation:</p>
                <CodeBlock code={`"List all my Stripe products"
"Check my CRM contacts"
"Send a test message to Slack #general"
"Create a workflow to sync CRM contacts to Mailchimp"`} language="text" />
              </Step>
            </div>

            <div className="ci-verify">
              <h3>Verify it works</h3>
              <p>Ask Claude: <code>What MCP tools do you have access to?</code> — it should list 0nMCP and describe the available tool categories.</p>
            </div>
          </section>

          {/* ── 5. Claude API ── */}
          <section id="claude-api" className="ci-section">
            <div className="ci-section-header">
              <div className="ci-section-icon"><CodeIcon /></div>
              <div>
                <h2>Claude API (Developers)</h2>
                <p className="ci-section-desc">Run 0nMCP as an HTTP server and integrate with the Claude API via tool_use.</p>
              </div>
            </div>

            <div className="ci-steps">
              <Step number={1} title="Start 0nMCP as an HTTP server">
                <p>Run the 0nMCP server on a port of your choice:</p>
                <CodeBlock code="npx 0nmcp serve --port 3100" language="bash" />
                <p>This starts an Express server that exposes all 1,589 tools via REST endpoints.</p>
              </Step>

              <Step number={2} title="List available tools">
                <p>Query the tool catalog from your application:</p>
                <CodeBlock code={`curl http://localhost:3100/api/tools | jq '.tools | length'
# Returns: 1589`} language="bash" />
              </Step>

              <Step number={3} title="Execute a tool">
                <p>Call any tool via the REST API:</p>
                <CodeBlock code={`curl -X POST http://localhost:3100/api/execute \\
  -H "Content-Type: application/json" \\
  -d '{
    "tool": "stripe_list_products",
    "arguments": { "limit": 10 }
  }'`} language="bash" />
              </Step>

              <Step number={4} title="Integrate with Claude API tool_use">
                <p>When building with the Claude API, you can pass 0nMCP tools as tool definitions. Fetch the tool list from the <code>/api/tools</code> endpoint and include them in your <code>tools</code> parameter:</p>
                <CodeBlock code={`import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

// Fetch 0nMCP tool definitions
const res = await fetch("http://localhost:3100/api/tools");
const { tools } = await res.json();

// Pass to Claude as available tools
const message = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 4096,
  tools: tools,
  messages: [
    { role: "user", content: "List my Stripe products" }
  ],
});

// When Claude returns tool_use, execute via 0nMCP
for (const block of message.content) {
  if (block.type === "tool_use") {
    const result = await fetch("http://localhost:3100/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: block.name,
        arguments: block.input,
      }),
    });
    console.log(await result.json());
  }
}`} language="typescript" filename="example.ts" />
              </Step>
            </div>

            <div className="ci-verify">
              <h3>Verify it works</h3>
              <p>Visit <code>http://localhost:3100/api/health</code> in your browser. You should see a JSON response with server status, tool count, and uptime.</p>
            </div>
          </section>

          {/* ── 6. VS Code ── */}
          <section id="vscode" className="ci-section">
            <div className="ci-section-header">
              <div className="ci-section-icon"><VSCodeIcon /></div>
              <div>
                <h2>VS Code (Copilot MCP)</h2>
                <p className="ci-section-desc">Use 0nMCP tools directly in GitHub Copilot Chat via the MCP extension.</p>
              </div>
            </div>

            <div className="ci-steps">
              <Step number={1} title="Create .vscode/mcp.json">
                <p>In your project root, create a <code>.vscode/mcp.json</code> file:</p>
                <CodeBlock code={VSCODE_MCP_JSON} filename=".vscode/mcp.json" />
              </Step>

              <Step number={2} title="Enable MCP in Copilot settings">
                <p>Open VS Code Settings (<kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + <kbd>,</kbd>), search for <strong>MCP</strong>, and ensure <strong>GitHub Copilot: MCP Enabled</strong> is checked.</p>
              </Step>

              <Step number={3} title="Use in Copilot Chat">
                <p>Open Copilot Chat (<kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>) and reference 0nMCP tools by typing <code>@0nMCP</code> followed by your request:</p>
                <CodeBlock code={`@0nMCP list all my Stripe products
@0nMCP check CRM contacts updated today
@0nMCP send a Slack notification to #deployments`} language="text" />
              </Step>
            </div>

            <div className="ci-verify">
              <h3>Verify it works</h3>
              <p>In Copilot Chat, type <code>@0nMCP what tools are available?</code> — Copilot should list the 0nMCP tool categories and confirm the connection.</p>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section id="faq" className="ci-section">
            <div className="ci-section-header">
              <div className="ci-section-icon"><QuestionIcon /></div>
              <div>
                <h2>Frequently Asked Questions</h2>
                <p className="ci-section-desc">Common questions about installing and using 0nMCP with Claude.</p>
              </div>
            </div>

            <div className="ci-faq-list">
              <FAQItem question="Do I need an API key to use 0nMCP?">
                <p>No. 0nMCP itself requires no API key. It runs locally on your machine and provides the tool definitions to Claude. You only need API keys for the individual services you want to connect (e.g., Stripe, Slack, SendGrid). Store those in your <code>~/.0n/connections/</code> directory.</p>
              </FAQItem>

              <FAQItem question="Is 0nMCP free?">
                <p>Yes. 0nMCP is open source (MIT license) and free for local use. The npm package <code>0nmcp</code> is free to install and run. Premium features like hosted execution and the marketplace are available at <a href="https://0nmcp.com/pricing">0nmcp.com/pricing</a>.</p>
              </FAQItem>

              <FAQItem question="How does 0nMCP work with Claude?">
                <p>0nMCP implements the <strong>Model Context Protocol (MCP)</strong> — an open standard that lets AI assistants like Claude use external tools. When you add 0nMCP to your config, Claude can call any of the 1,589 tools to interact with external services on your behalf.</p>
              </FAQItem>

              <FAQItem question="What if I already have other MCP servers configured?">
                <p>No problem. Just add the <code>&quot;0nMCP&quot;</code> entry to your existing <code>mcpServers</code> object alongside your other servers:</p>
                <CodeBlock code={`{
  "mcpServers": {
    "existing-server": { "command": "...", "args": ["..."] },
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`} language="json" />
              </FAQItem>

              <FAQItem question="Which Node.js version do I need?">
                <p>Node.js 18 or higher. Check your version with <code>node --version</code>. We recommend the latest LTS release.</p>
              </FAQItem>

              <FAQItem question="Can I use 0nMCP with other AI assistants?">
                <p>Yes. 0nMCP supports any MCP-compatible client including Claude Desktop, Claude Code, Cursor, Windsurf, Cline, Continue, VS Code Copilot, and more. Visit <a href="/install">0nmcp.com/install</a> for the full list.</p>
              </FAQItem>

              <FAQItem question="How do I add my service credentials?">
                <p>Use the 0nMCP Engine to import credentials from your <code>.env</code>, CSV, or JSON files. Run <code>npx 0nmcp engine import</code> to auto-detect and map your API keys to the correct services. Credentials are stored locally in <code>~/.0n/connections/</code>.</p>
              </FAQItem>

              <FAQItem question="Is my data secure?">
                <p>Yes. 0nMCP runs 100% locally on your machine. No data is sent to 0nMCP servers. API calls go directly from your machine to the service providers (Stripe, Slack, etc.). Credentials can be encrypted with AES-256-GCM via the 0nVault system.</p>
              </FAQItem>

              <FAQItem question="What services does 0nMCP support?">
                <p>0nMCP supports 102 services including: CRM, Stripe, SendGrid, Resend, Slack, Discord, Twilio, GitHub, Shopify, OpenAI, Anthropic, Gmail, Google Sheets, Google Drive, Google Calendar, Google Ads, Airtable, Notion, MongoDB, Supabase, Zendesk, Jira, HubSpot, Mailchimp, Calendly, Zoom, Linear, and many more. See the <a href="/integrations">full list</a>.</p>
              </FAQItem>

              <FAQItem question="How do I update 0nMCP?">
                <p>Since the config uses <code>npx -y 0nmcp</code>, it automatically pulls the latest version each time it starts. No manual updates needed. To pin a specific version, use <code>&quot;args&quot;: [&quot;-y&quot;, &quot;0nmcp@2.9.1&quot;]</code>.</p>
              </FAQItem>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="ci-cta-section">
            <div className="ci-cta-inner">
              <h2>Ready to connect everything?</h2>
              <p>1,589 tools. 102 services. One config line. Zero API keys.</p>
              <div className="ci-cta-buttons">
                <a href="https://0ncore.com" target="_blank" rel="noopener noreferrer" className="ci-cta-btn ci-cta-primary">Try 0nCore Free</a>
                <a href="/install" className="ci-cta-btn ci-cta-secondary">All Platforms</a>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Styles
   ────────────────────────────────────────────── */
const pageStyles = `
/* ── Page Container ── */
.claude-install-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
}

/* ── Hero ── */
.ci-hero {
  position: relative;
  padding: 80px 24px 60px;
  text-align: center;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border-bottom: 1px solid var(--border);
}

.ci-hero-inner {
  max-width: 800px;
  margin: 0 auto;
}

.ci-hero-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 32px;
}

.ci-logo-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.ci-logo-box img,
.ci-logo-box svg {
  border-radius: var(--radius-card);
}

.ci-logo-label {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

.ci-arrow {
  display: flex;
  align-items: center;
  opacity: 0.6;
}

.ci-hero-title {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 16px;
  letter-spacing: -0.02em;
}

.ci-highlight {
  color: var(--accent);
}

.ci-hero-subtitle {
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 12px;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.ci-hero-note {
  font-size: 14px;
  color: var(--accent);
  font-weight: 600;
  margin: 0 0 32px;
  font-family: var(--font-mono);
  letter-spacing: 0.01em;
}

.ci-hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}

.ci-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ci-stat-value {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
}

.ci-stat-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

/* ── Layout ── */
.ci-layout {
  display: flex;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  gap: 48px;
}

/* ── Table of Contents ── */
.ci-toc {
  position: sticky;
  top: 80px;
  align-self: flex-start;
  width: 260px;
  flex-shrink: 0;
  padding: 32px 0;
  height: fit-content;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.ci-toc-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ci-toc-title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  padding: 0 12px 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}

.ci-toc-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-button);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-standard);
  border-left: 2px solid transparent;
}

.ci-toc-link:hover {
  color: var(--text-primary);
  background: var(--accent-glow);
}

.ci-toc-link.active {
  color: var(--accent);
  background: var(--accent-glow);
  border-left-color: var(--accent);
  font-weight: 600;
}

.ci-toc-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.7;
}

.ci-toc-link.active .ci-toc-icon {
  opacity: 1;
  color: var(--accent);
}

/* ── Content ── */
.ci-content {
  flex: 1;
  min-width: 0;
  padding: 32px 0 80px;
}

/* ── Sections ── */
.ci-section {
  padding: 48px 0;
  border-bottom: 1px solid var(--border);
}

.ci-section:last-of-type {
  border-bottom: none;
}

.ci-section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
}

.ci-section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-card);
  background: var(--accent-glow);
  color: var(--accent);
  flex-shrink: 0;
}

.ci-section-header h2 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}

.ci-section-desc {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* ── Steps ── */
.ci-steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.step {
  display: flex;
  gap: 16px;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #000;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 8px;
}

.step-body {
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-secondary);
}

.step-body p {
  margin: 0 0 12px;
}

.step-body p:last-child {
  margin-bottom: 0;
}

.step-body a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.step-body a:hover {
  color: var(--text-primary);
}

.step-body strong {
  color: var(--text-primary);
  font-weight: 600;
}

.step-body kbd {
  display: inline-block;
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 4px;
  box-shadow: 0 1px 0 var(--border);
}

.step-body code {
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--accent);
}

.ci-file-path {
  font-size: 13px;
  color: var(--text-muted);
}

.ci-file-path code {
  color: var(--text-secondary);
}

.ci-hint {
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
}

/* ── Code Blocks ── */
.code-block {
  border-radius: var(--radius-card);
  border: 1px solid var(--border);
  overflow: hidden;
  margin: 12px 0;
  background: #0d1117;
}

.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--border);
}

.code-block-lang {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.code-block code {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: #e6edf3;
  background: none;
  padding: 0;
  border-radius: 0;
}

/* ── Copy Button ── */
.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-button);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-standard);
}

.copy-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.copy-btn span {
  line-height: 1;
}

/* ── Verify Box ── */
.ci-verify {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 24px;
  margin-top: 24px;
}

.ci-verify h3 {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: 8px;
}

.ci-verify h3::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
}

.ci-verify p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 12px;
}

.ci-verify p:last-child {
  margin-bottom: 0;
}

.ci-verify code {
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--accent);
}

/* ── FAQ ── */
.ci-faq-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.faq-item {
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: none;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  gap: 16px;
  transition: background var(--duration-fast) var(--ease-standard);
}

.faq-question:hover {
  background: var(--bg-tertiary);
}

.faq-answer {
  padding: 16px 20px 20px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
}

.faq-answer p {
  margin: 0 0 12px;
}

.faq-answer p:last-child {
  margin-bottom: 0;
}

.faq-answer a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.faq-answer code {
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--accent);
}

/* ── CTA ── */
.ci-cta-section {
  padding: 64px 0;
}

.ci-cta-inner {
  text-align: center;
  padding: 48px 32px;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius-modal);
}

.ci-cta-inner h2 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}

.ci-cta-inner p {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 28px;
}

.ci-cta-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ci-cta-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  border-radius: var(--radius-button);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-standard);
}

.ci-cta-primary {
  background: var(--accent);
  color: #000;
}

.ci-cta-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.ci-cta-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.ci-cta-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* ── Mobile Responsive ── */
@media (max-width: 900px) {
  .ci-layout {
    flex-direction: column;
    gap: 0;
  }

  .ci-toc {
    position: relative;
    top: 0;
    width: 100%;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    overflow-y: hidden;
    max-height: none;
  }

  .ci-toc-nav {
    flex-direction: row;
    gap: 8px;
    padding: 0 8px;
    min-width: max-content;
  }

  .ci-toc-title {
    display: none;
  }

  .ci-toc-link {
    white-space: nowrap;
    padding: 8px 14px;
    border-radius: 20px;
    border-left: none;
    font-size: 13px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .ci-toc-link.active {
    border-color: var(--accent);
    border-left: none;
  }

  .ci-toc-icon {
    display: none;
  }

  .ci-hero-title {
    font-size: 32px;
  }

  .ci-hero-subtitle {
    font-size: 16px;
  }

  .ci-hero-stats {
    gap: 24px;
  }

  .ci-stat-value {
    font-size: 22px;
  }

  .ci-section-header {
    flex-direction: column;
    gap: 12px;
  }

  .ci-section-header h2 {
    font-size: 22px;
  }

  .step {
    flex-direction: column;
    gap: 8px;
  }

  .step-number {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }

  .ci-hero-logos {
    gap: 20px;
  }

  .ci-logo-box img,
  .ci-logo-box svg {
    width: 56px;
    height: 56px;
  }

  .ci-cta-inner {
    padding: 32px 20px;
  }

  .ci-cta-inner h2 {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .ci-hero {
    padding: 60px 16px 40px;
  }

  .ci-hero-title {
    font-size: 26px;
  }

  .ci-hero-stats {
    gap: 16px;
  }

  .ci-stat-value {
    font-size: 20px;
  }

  .ci-layout {
    padding: 0 16px;
  }

  .ci-section {
    padding: 32px 0;
  }

  .code-block pre {
    padding: 12px;
  }

  .code-block code {
    font-size: 12px;
  }
}
`
