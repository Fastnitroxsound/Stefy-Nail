// STEFY NAIL - Service Worker - Versión 6 Optimizada
const CACHE_NAME = 'stefy-nail-v3';

const urlsToCache = [
  './',
  './index.html',
  './reserva.html',
  './style.css',
  './script.js',
  './manifest.json',
  './logo.png',
  './header.png'
];

// 1. Instalar - Guarda la versión nueva
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 2. Activar - Borra TODAS las versiones viejas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. OPTIMIZADO: Estrategia inteligente
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.includes('trabajo')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});