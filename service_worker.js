const CACHE_NAME = 'salap-factory-v2'; // <-- Changed to v2 to force the update
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Install Event - caches the files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting(); 
});

// Fetch Event - serves the files offline
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Activate Event - cleans up old caches (like v1)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});