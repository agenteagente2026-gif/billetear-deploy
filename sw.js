const CACHE_NAME = 'billetear-v1';
const SHELL_FILES = [
  '/',
  '/index.html',
  '/dolares.html',
  '/cripto.html',
  '/mercados.html',
  '/indicadores.html',
  '/noticias.html',
  '/manifest.json'
];

// Install: cache shell files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for API calls, cache-first for shell
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API calls: network only (always fresh data)
  if (url.hostname !== location.hostname) {
    return;
  }

  // HTML/assets: stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
