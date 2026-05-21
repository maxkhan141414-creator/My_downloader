// ऐप का नाम और वर्शन सेट करें
const CACHE_NAME = 'my-downloader-v1';

// उन फाइलों की लिस्ट जिन्हें ऑफलाइन होने पर भी ब्राउज़र याद रखेगा
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// सर्विस वर्कर को इंस्टॉल करना
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// जब यूजर ऐप खोले, तो कैश (cache) से डेटा लोड करना
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// पुराने वर्शन को हटाकर नया वर्शन एक्टिवेट करना
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
});
