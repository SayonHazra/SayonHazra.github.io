const CACHE_NAME = 'salap-factory-v1';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Install Event - caches the files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Fetch Event - serves the files offline
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});