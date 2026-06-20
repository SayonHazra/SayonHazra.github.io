const CACHE_NAME = 'salap-factory-dynamic-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// Network First, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If the internet fetch is successful, update the cache with the new version
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If there is no internet (fetch fails), load the file from the offline cache
        return caches.match(event.request);
      })
  );
});