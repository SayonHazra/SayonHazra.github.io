const CACHE_NAME = 'metrifab-cache-v7.1';

// List of all essential files and external links to save for offline use
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  
  // External Libraries (Crucial for offline styling & PDF)
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  
  // App Images
  './icon-plate.jpg', './plate-ref.jpg', './circle-ref.jpg',
  './icon-hollow.jpg', './shell-ref.jpg', './sq_tube-ref.jpg', './rect_tube-ref.jpg',
  './icon-solid.jpg', './sq_bar-ref.jpg', './rect_bar-ref.jpg', './rnd_bar-ref.jpg',
  './icon-cone.jpg', './frustum-ref.jpg', './roof_cone-ref.jpg',
  './icon-pyramid.jpg', './trunc_pyr-ref.jpg', './full_pyr-ref.jpg',
  './icon-sq2rnd.jpg', './sq2rnd-ref.jpg', './rect2rnd-ref.jpg',
  './icon-miter.jpg', './miter-ref.jpg',
  './icon-dishend.jpg', './dishend-ref.jpg',
  './icon-ring.jpg', './ring-ref.jpg',
  './icon-ismb.jpg', './ismb-ref.jpg',
  './icon-ismc.jpg', './ismc-ref.jpg',
  './icon-isa.jpg', './isa-ref.jpg'
];

// 1. Install Event - Downloads everything immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache, downloading assets...');
        // We use a map to cache items individually so if one missing image fails, 
        // it doesn't stop the whole app from caching.
        return Promise.allSettled(
            urlsToCache.map(url => {
                return cache.add(url).catch(err => console.log(`Failed to cache ${url}:`, err));
            })
        );
      })
  );
});

// 2. Activate Event - Deletes old caches to free up phone storage
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Fetch Event - "Cache First, falling back to Network" Strategy
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return the cached version if we have it
        if (response) {
          return response;
        }
        
        // Otherwise, fetch from the internet and cache it for next time
        return fetch(event.request).then(networkResponse => {
          // Check if valid response
          if(!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
            return networkResponse;
          }
          
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return networkResponse;
        }).catch(() => {
            // Fallback for navigation requests if totally offline
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        });
      })
  );
});