#!/usr/bin/env bash
set -euo pipefail
API="${ONCORE_DISPATCH_API:-https://www.0ncore.com/api/dispatch}"
SLUG="0nmcp.com"
CACHE_DIR=".dispatch-cache"
mkdir -p "$CACHE_DIR"
echo "Fetching dispatch state from $API ..."
curl -fsSL "$API/version" -o "$CACHE_DIR/version.json"
SHA=$(grep -o '"sha":"[^"]*"' "$CACHE_DIR/version.json" | head -1 | cut -d'"' -f4)
echo "  version: $SHA"
curl -fsSL "$API/rules" -o "$CACHE_DIR/rules.json"
curl -fsSL "$API/ecosystem" -o "$CACHE_DIR/ecosystem.json"
curl -fsSL "$API/products/$SLUG" -o "$CACHE_DIR/product.json" 2>/dev/null || echo "  (no product status for $SLUG)"
curl -fsSL "$API/.0n/bundle" -o "$CACHE_DIR/dispatch.0n" 2>/dev/null || echo "  (.0n bundle unavailable)"
echo "Done. Cache at $CACHE_DIR/"
