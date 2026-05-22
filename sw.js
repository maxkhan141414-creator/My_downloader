const CACHE_NAME = 'my-downloader-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// ✅ INSTALL - सभी फाइलें cache करें
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ✅ ACTIVATE - पुराना cache हटाएं
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ✅ FETCH - GitHub Pages 404 fix: Navigate requests के लिए index.html serve करें
self.addEventListener('fetch', event => {
  // API calls को cache मत करो (RapidAPI requests)
  if (event.request.url.includes('rapidapi.com') ||
      event.request.url.includes('api.')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Navigation requests (page refresh, direct URL) → index.html serve करें
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('./index.html')
      )
    );
    return;
  }

  // बाकी सब: Cache first, फिर Network
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then(networkResponse => {
        // Valid response को cache में save करें
        if (networkResponse && networkResponse.status === 200 &&
            networkResponse.type !== 'opaque') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
