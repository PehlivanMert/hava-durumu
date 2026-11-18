const CACHE_NAME = 'weather-pwa-bridge-v6';
const STATIC_ASSETS = [
  '/hava-durumu/',
  '/hava-durumu/index.html',
  '/hava-durumu/manifest.json',
  '/hava-durumu/icon-192.png',
  '/hava-durumu/icon-512.png',
  '/hava-durumu/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // CRITICAL: Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // CRITICAL: NEVER intercept cross-origin requests (ntfy, gist, api.github.com, trycloudflare tunnels)
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTML navigation requests: Network-first with cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = (await caches.match(event.request)) ||
                         (await caches.match('/hava-durumu/')) ||
                         (await caches.match('/hava-durumu/index.html'));
          if (cached) return cached;
          return new Response('Çevrimdışı', { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        })
    );
    return;
  }

  // Static assets (icons, manifest): Cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      });
    }).catch(() => new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))
  );
});
