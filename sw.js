const CACHE_NAME = 'weather-pwa-bridge-v1';
const STATIC_ASSETS = [
  '/hava-durumu/',
  '/hava-durumu/manifest.json',
  '/hava-durumu/icon-192.png',
  '/hava-durumu/icon-512.png',
  '/hava-durumu/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let network handle API and tunnel traffic
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
