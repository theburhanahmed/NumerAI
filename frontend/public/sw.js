/**
 * Service Worker for PWA
 * 
 * Handles caching, offline support, and background sync.
 */

const CACHE_NAME = 'numerai-v1'
const RUNTIME_CACHE = 'numerai-runtime-v1'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/daily-reading',
  '/birth-chart',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache the response
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Offline fallback
          if (event.request.destination === 'document') {
            return caches.match('/offline.html') || new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' },
            })
          }
        })
    })
  )
})

// Background sync for API calls
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-api-calls') {
    event.waitUntil(syncApiCalls())
  }
})

async function syncApiCalls() {
  // Get pending API calls from IndexedDB
  // Process and send them
  // This would need IndexedDB integration
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const title = data.title || 'NumerAI'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url || '/',
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  )
})

