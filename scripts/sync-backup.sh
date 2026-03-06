#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# 0n Ecosystem — Local Backup & Sync Script
# Run: bash scripts/sync-backup.sh
# Schedule: crontab -e → 0 */12 * * * /path/to/sync-backup.sh
# ═══════════════════════════════════════════════════════════════

set -e

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="$HOME/.0n/backups"
GITHUB_DIR="$HOME/Github"
LOG_FILE="$BACKUP_DIR/sync-$TIMESTAMP.log"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
DIM='\033[0;90m'
NC='\033[0m'

echo -e "${GREEN}━━━ 0n Ecosystem Sync ━━━${NC}"
echo -e "${DIM}$TIMESTAMP${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# ─── Step 1: Git status check on all repos ───────────────
REPOS=(
  "0nmcp-website"
  "0nMCP"
  "0n-spec"
  "0nork"
  "0n-marketplace"
  "onork-app"
  "0n-command"
  "0ntask"
)

echo -e "${CYAN}[1/5] Checking git status across all repos...${NC}"

for repo in "${REPOS[@]}"; do
  REPO_PATH="$GITHUB_DIR/$repo"
  if [ -d "$REPO_PATH/.git" ]; then
    cd "$REPO_PATH"
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    AHEAD=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "?")
    BEHIND=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "?")

    if [ "$DIRTY" = "0" ]; then
      STATUS="clean"
    else
      STATUS="${DIRTY} changes"
    fi

    printf "  %-20s %-8s %-15s ↑%s ↓%s\n" "$repo" "$BRANCH" "$STATUS" "$AHEAD" "$BEHIND"
  else
    printf "  %-20s ${DIM}not found${NC}\n" "$repo"
  fi
done

echo ""

# ─── Step 2: Pull latest from all repos ──────────────────
echo -e "${CYAN}[2/5] Pulling latest from origin/main...${NC}"

for repo in "${REPOS[@]}"; do
  REPO_PATH="$GITHUB_DIR/$repo"
  if [ -d "$REPO_PATH/.git" ]; then
    cd "$REPO_PATH"
    DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
    if [ "$DIRTY" = "0" ]; then
      git pull origin main --quiet 2>/dev/null && echo "  ✓ $repo" || echo "  ✗ $repo (pull failed)"
    else
      echo "  ⊘ $repo (dirty — skipping pull)"
    fi
  fi
done

echo ""

# ─── Step 3: Backup .0n directory ────────────────────────
echo -e "${CYAN}[3/5] Backing up ~/.0n/ configuration...${NC}"

ON_DIR="$HOME/.0n"
if [ -d "$ON_DIR" ]; then
  BACKUP_ARCHIVE="$BACKUP_DIR/0n-config-$TIMESTAMP.tar.gz"
  tar -czf "$BACKUP_ARCHIVE" -C "$HOME" .0n/ 2>/dev/null
  SIZE=$(du -sh "$BACKUP_ARCHIVE" 2>/dev/null | cut -f1)
  echo "  ✓ ~/.0n/ → $BACKUP_ARCHIVE ($SIZE)"
else
  echo "  ⊘ ~/.0n/ not found — skipping"
fi

echo ""

# ─── Step 4: Backup Claude settings ─────────────────────
echo -e "${CYAN}[4/5] Backing up Claude Code settings...${NC}"

CLAUDE_DIR="$HOME/.claude"
if [ -d "$CLAUDE_DIR" ]; then
  CLAUDE_ARCHIVE="$BACKUP_DIR/claude-config-$TIMESTAMP.tar.gz"
  # Exclude large files and node_modules
  tar -czf "$CLAUDE_ARCHIVE" \
    --exclude='*/node_modules' \
    --exclude='*.jsonl' \
    --exclude='*/worktrees' \
    -C "$HOME" .claude/ 2>/dev/null
  SIZE=$(du -sh "$CLAUDE_ARCHIVE" 2>/dev/null | cut -f1)
  echo "  ✓ ~/.claude/ → $CLAUDE_ARCHIVE ($SIZE)"
else
  echo "  ⊘ ~/.claude/ not found — skipping"
fi

echo ""

# ─── Step 5: Cleanup old backups (keep last 10) ─────────
echo -e "${CYAN}[5/5] Cleaning up old backups...${NC}"

BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l | tr -d ' ')
if [ "$BACKUP_COUNT" -gt 20 ]; then
  ls -1t "$BACKUP_DIR"/*.tar.gz | tail -n +21 | xargs rm -f
  echo "  ✓ Removed $(($BACKUP_COUNT - 20)) old backups"
else
  echo "  ✓ $BACKUP_COUNT backups stored (max 20)"
fi

echo ""

# ─── Summary ─────────────────────────────────────────────
echo -e "${GREEN}━━━ Sync Complete ━━━${NC}"
echo -e "${DIM}Backups stored in: $BACKUP_DIR${NC}"
echo -e "${DIM}Log: $LOG_FILE${NC}"

# Write log
{
  echo "0n Ecosystem Sync — $TIMESTAMP"
  echo "Repos checked: ${#REPOS[@]}"
  echo "Backup dir: $BACKUP_DIR"
  ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -5
} > "$LOG_FILE" 2>/dev/null

echo ""
echo -e "${DIM}To schedule automatic sync every 12 hours:${NC}"
echo -e "${DIM}  crontab -e${NC}"
echo -e "${DIM}  0 */12 * * * $0${NC}"
