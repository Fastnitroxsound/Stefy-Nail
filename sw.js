// STEFY NAIL - Service Worker - Versión 8
// Cambiar este nombre borra la caché vieja en todos los celulares
const CACHE_NAME = 'stefy-nail-v8';

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

// 1. Instalar - Guarda los archivos (si alguno falta, no rompe la instalación)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(
        urlsToCache.map(url => cache.add(url).catch(() => null))
      ))
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

// 3. Estrategia
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // NO interceptar: reservas (POST), Apps Script, Mercado Pago, Analytics, etc.
  // Solo se manejan pedidos GET del propio sitio
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Fotos de trabajos: siempre directo de la red
  if (url.pathname.includes('trabajo')) {
    event.respondWith(fetch(req));
    return;
  }

  // Páginas, código y estilos: primero la red (así los cambios se ven al instante)
  // y si no hay internet, usa lo guardado
  const esCodigo =
    req.mode === 'navigate' ||
    req.destination === 'document' ||
    req.destination === 'script' ||
    req.destination === 'style' ||
    url.pathname.endsWith('.json');

  if (esCodigo) {
    event.respondWith(
      fetch(req).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Imágenes fijas (logo, header): rápido desde caché y se actualiza en segundo plano
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
