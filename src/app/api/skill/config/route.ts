import { NextResponse } from 'next/server'
import { STATS_DISPLAY } from '@/data/stats'

export const dynamic = 'force-dynamic'

/**
 * GET /api/skill/config — Returns a .claude.json project config
 *
 * Pre-configures Claude Code with:
 *   - Skill path registration
 *   - Project-level instructions
 *   - MCP server reference (if user has 0nMCP installed locally)
 */
export async function GET() {
  const config = getConfigContent()

  return new NextResponse(JSON.stringify(config, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename=".claude.json"',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function getConfigContent() {
  return {
    "$schema": "https://raw.githubusercontent.com/anthropics/claude-code/main/schema/claude.json",
    "projectName": "0nMCP Environment",
    "description": `Connected to the 0nMCP ecosystem — ${STATS_DISPLAY.tools} tools, ${STATS_DISPLAY.services} services, Vault, Runs, Council Brain`,
    "skills": [
      {
        "name": "0nmcp",
        "path": "~/.claude/skills/0nmcp/SKILL.md",
        "description": "Turn Claude into an 0nMCP Environment — Vault, Runs, Store, Brain"
      }
    ],
    "mcpServers": {
      "0nMCP-local": {
        "type": "stdio",
        "command": "npx",
        "args": ["0nmcp@latest"],
        "description": "Local 0nMCP server (if installed via npm). Remove this block if not using local mode."
      }
    },
    "instructions": [
      "This project is connected to the 0nMCP ecosystem.",
      "Use /0nmcp to interact with the platform — login, vault, runs, store, brain.",
      "API keys are stored encrypted in the Vault. Never write decrypted keys to disk.",
      "All API calls go through https://www.0nmcp.com/api/skill/*"
    ],
    "metadata": {
      "installer": "0nMCP Skill Installer",
      "version": "1.0.0",
      "homepage": "https://www.0nmcp.com",
      "docs": "https://www.0nmcp.com/learn",
      "support": "https://www.0nmcp.com/forum"
    }
  }
}
