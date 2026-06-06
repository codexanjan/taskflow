const CACHE_NAME = 'taskflow-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (e) => {
  console.log('Service Worker: Activated');
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Cache-first with network fallback for static assets)
self.addEventListener('fetch', (e) => {
  // Never intercept API backend requests
  if (e.request.url.includes('/api/')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(e.request)
        .then((networkResponse) => {
          // Cache dynamic static files on the fly
          if (
            e.request.method === 'GET' &&
            networkResponse.status === 200 &&
            (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com'))
          ) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, cacheCopy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and navigating pages, load index.html
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
