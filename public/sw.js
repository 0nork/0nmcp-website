const CACHE_NAME = '0nmcp-pwa-v1'
const APP_ROUTES = ['/app']

// Install: cache the offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/app']))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch: network-first for /app routes, cache fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only handle same-origin /app routes and static assets
  if (url.origin !== self.location.origin) return
  if (!APP_ROUTES.some((route) => url.pathname.startsWith(route)) &&
      !url.pathname.startsWith('/_next/static')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/app')))
  )
})
