const CACHE_NAME = 'billetear-v2';
const SHELL_FILES = [
  '/dolares.html',
  '/cripto.html',
  '/mercados.html',
  '/indicadores.html',
  '/noticias.html',
  '/manifest.json'
];

// Install: cache shell files (skip index.html — it's just a redirect)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean ALL old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first, fallback to cache
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip API calls and redirects
  if (url.hostname !== location.hostname) return;
  if (e.request.mode === 'navigate' && url.pathname === '/') return;
  if (url.pathname === '/index.html') return;

  e.respondWith(
    fetch(e.request).then(response => {
      if (response.ok && response.type !== 'opaqueredirect') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      }
      return response;
    }).catch(() => caches.match(e.request))
  );
});
