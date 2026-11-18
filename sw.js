// Self-destructing & Cache-purging Service Worker for Hava Durumu Bridge
// Purges all legacy caches (v1 through v6) and unregisters itself immediately.
// ZERO fetch listeners! Normal browser networking handles all traffic cleanly without "Load failed" errors.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});
