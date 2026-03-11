import { NextResponse } from 'next/server'
import { STATS_DISPLAY } from '@/data/stats'

export const dynamic = 'force-dynamic'

/**
 * GET /api/skill/install — Returns a shell installer script
 *
 * Usage: curl -sL https://www.0nmcp.com/api/skill/install | sh
 *
 * Creates:
 *   ~/.claude/skills/0nmcp/SKILL.md     — The Claude Code skill
 *   ~/.claude/skills/0nmcp/dashboard.html — Interactive local dashboard
 *   ~/.claude/skills/0nmcp/.claude.json  — Project config with MCP settings
 */
export async function GET() {
  const script = getInstallerScript()

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function getInstallerScript(): string {
  return `#!/bin/sh
# ═══════════════════════════════════════════════════════════
#  0nMCP Skill Installer
#  Usage: curl -sL https://www.0nmcp.com/api/skill/install | sh
# ═══════════════════════════════════════════════════════════

set -e

SKILL_DIR="\$HOME/.claude/skills/0nmcp"
BASE_URL="https://www.0nmcp.com"
GREEN="\\033[0;32m"
CYAN="\\033[0;36m"
ORANGE="\\033[0;33m"
DIM="\\033[2m"
BOLD="\\033[1m"
RESET="\\033[0m"

echo ""
echo "\${BOLD}\${ORANGE}═══════════════════════════════════════\${RESET}"
echo "\${BOLD}\${ORANGE}  0nMCP Skill Installer\${RESET}"
echo "\${DIM}  ${STATS_DISPLAY.tools} tools. ${STATS_DISPLAY.services} services. Your AI hub.\${RESET}"
echo "\${BOLD}\${ORANGE}═══════════════════════════════════════\${RESET}"
echo ""

# Check for Claude Code
if ! command -v claude >/dev/null 2>&1; then
  echo "\${DIM}  Note: Claude Code CLI not detected.\${RESET}"
  echo "\${DIM}  Install it at: https://claude.ai/claude-code\${RESET}"
  echo ""
fi

# Create directory
echo "\${CYAN}[1/4]\${RESET} Creating skill directory..."
mkdir -p "\$SKILL_DIR"

# Download SKILL.md
echo "\${CYAN}[2/4]\${RESET} Downloading SKILL.md..."
if command -v curl >/dev/null 2>&1; then
  curl -sL "\$BASE_URL/api/skill/download" -o "\$SKILL_DIR/SKILL.md"
elif command -v wget >/dev/null 2>&1; then
  wget -qO "\$SKILL_DIR/SKILL.md" "\$BASE_URL/api/skill/download"
else
  echo "  Error: curl or wget required"
  exit 1
fi

# Download dashboard
echo "\${CYAN}[3/4]\${RESET} Downloading interactive dashboard..."
if command -v curl >/dev/null 2>&1; then
  curl -sL "\$BASE_URL/api/skill/dashboard" -o "\$SKILL_DIR/dashboard.html"
elif command -v wget >/dev/null 2>&1; then
  wget -qO "\$SKILL_DIR/dashboard.html" "\$BASE_URL/api/skill/dashboard"
fi

# Download config
echo "\${CYAN}[4/4]\${RESET} Downloading project config..."
if command -v curl >/dev/null 2>&1; then
  curl -sL "\$BASE_URL/api/skill/config" -o "\$SKILL_DIR/.claude.json"
elif command -v wget >/dev/null 2>&1; then
  wget -qO "\$SKILL_DIR/.claude.json" "\$BASE_URL/api/skill/config"
fi

echo ""
echo "\${GREEN}\${BOLD}  ✓ 0nMCP installed successfully!\${RESET}"
echo ""
echo "  \${BOLD}Files created:\${RESET}"
echo "    \${DIM}\$SKILL_DIR/SKILL.md\${RESET}        — Skill"
echo "    \${DIM}\$SKILL_DIR/dashboard.html\${RESET}   — Dashboard"
echo "    \${DIM}\$SKILL_DIR/.claude.json\${RESET}     — Config"
echo ""
echo "  \${BOLD}Next steps:\${RESET}"
echo "    1. Open Claude Code and type: \${ORANGE}/0nmcp login\${RESET}"
echo "    2. Or open the dashboard:     \${CYAN}open \$SKILL_DIR/dashboard.html\${RESET}"
echo ""
echo "  \${BOLD}Don't have an account?\${RESET}"
echo "    Sign up free: \${CYAN}https://www.0nmcp.com/signup\${RESET}"
echo ""
echo "\${BOLD}\${ORANGE}═══════════════════════════════════════\${RESET}"
echo ""

# Auto-open dashboard on macOS
if [ "$(uname)" = "Darwin" ]; then
  read -p "  Open dashboard now? [Y/n] " answer
  case "\$answer" in
    [Nn]*) ;;
    *) open "\$SKILL_DIR/dashboard.html" ;;
  esac
fi
`
}
