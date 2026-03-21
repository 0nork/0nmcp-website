# 0nMCP PWA & Offline Support

Documentation for the Progressive Web App and offline capabilities.

## Architecture

The PWA is served at `/app` and can be installed on any device (iOS, Android, desktop).

### Service Worker (`public/sw.js`)

**Cache strategy by resource type:**

| Resource | Strategy | Cache |
|----------|----------|-------|
| `/_next/static/*` | Cache-first | `0nmcp-static-v2` |
| `/app/*` pages | Network-first, cache fallback | `0nmcp-dynamic-v2` |
| `/icons/*`, `/images/*` | Cache-first | `0nmcp-static-v2` |
| API routes (`POST`) | Network-only (not cached) | — |

**Pre-cached on install:**
- `/app` (main shell)
- `/app/offline` (offline fallback page)

**Cache versioning:** Bump `CACHE_VERSION` in `sw.js` to invalidate all caches.

### Offline Fallback

When the user is offline and requests a page not in cache, they see `/app/offline` which:
- Shows a wifi-off icon and "You're offline" message
- Auto-redirects when connection is restored (`online` event)
- Has a manual "Retry connection" button
- Reminds users that add0ns and settings are available locally

### Offline Detection

Both `PWAShell` and `Terminal` track `navigator.onLine` and listen for `online`/`offline` events:

- **PWAShell**: Shows an amber "Offline" banner at the top when disconnected
- **Terminal**: Disables input and shows "Offline" on the send button; placeholder changes to "Offline — connect to send tasks"

### What Works Offline

| Feature | Offline? | Notes |
|---------|----------|-------|
| Add0ns (view, import) | Yes | Stored in IndexedDB |
| Connection Settings | Yes | Stored in localStorage |
| Terminal (AI chat) | No | Requires network for AI API |
| Code (WebContainer) | No | Requires network to boot |
| Builder | No | Requires network |
| Previously visited pages | Yes | Served from dynamic cache |

### IndexedDB Storage

Add0ns are stored client-side in IndexedDB (`0nmcp-addons` database, v1):
- `id`: Generated timestamp + random
- `name`, `description`: From .0n metadata
- `content`: Raw JSON string
- `stepCount`: Number of workflow steps
- `createdAt`, `updatedAt`: Timestamps

### localStorage Keys

| Key | Purpose |
|-----|---------|
| `0nmcp-connection` | AI execution mode config |
| `0nmcp-install-dismissed` | PWA install banner dismiss timestamp |

## Installation

### iOS (Safari)
1. Navigate to `https://0nmcp.com/app`
2. Tap Share icon
3. Tap "Add to Home Screen"
4. App launches as standalone with status bar

### Android (Chrome)
1. Navigate to `https://0nmcp.com/app`
2. Tap the install banner or browser menu → "Add to Home Screen"

### Desktop (Chrome/Edge)
1. Navigate to `https://0nmcp.com/app`
2. Click install icon in address bar

## Manifest

Defined in `src/app/manifest.ts`:
- `start_url: /app`
- `display: standalone`
- `theme_color: #7ed957`
- `background_color: #0a0a0f`
- Icons: 192px, 512px (regular + maskable)

## Tablet Features

On screens >= 768px, the PWA shows an additional "Builder" tab with a visual workflow editor (canvas-based, xFlow).
