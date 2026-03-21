const CACHE_VERSION = 'v2'
const STATIC_CACHE = `0nmcp-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `0nmcp-dynamic-${CACHE_VERSION}`
const OFFLINE_URL = '/app/offline'

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/app',
  '/app/offline',
]

// Install: cache the app shell and offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch: strategy depends on resource type
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return

  // Skip non-GET requests (POST to /api/chat, etc.)
  if (event.request.method !== 'GET') return

  // Static assets (_next/static) — cache-first
  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // App routes (/app/*) — network-first with offline fallback
  if (url.pathname.startsWith('/app')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone))
          }
          return response
        })
        .catch(() =>
          caches.match(event.request).then((cached) => {
            if (cached) return cached
            // Fall back to offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL).then((offline) => offline || caches.match('/app'))
            }
            return caches.match('/app')
          })
        )
    )
    return
  }

  // Icons and images in /icons/ or /images/ — cache-first
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/images/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone))
          }
          return response
        }).catch(() => new Response('', { status: 404 }))
      })
    )
    return
  }
})

// Listen for skip-waiting message from client
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})
