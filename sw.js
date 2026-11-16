const CACHE_NAME = 'weather-pwa-bridge-v2';
const STATIC_ASSETS = [
  '/hava-durumu/',
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
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // NEVER intercept cross-origin requests (e.g. ntfy.sh, github api, cloudflare tunnels)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network first with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
