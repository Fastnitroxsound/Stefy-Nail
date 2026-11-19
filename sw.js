const CACHE = 'stefy-nail-v7';
const FILES = ['./','./index.html','./manifest.json','./logo.png','./trabajo1.jpeg','./trabajo2.jpeg','./trabajo3.jpeg','./trabajo4.jpeg','./trabajo5.jpeg','./trabajo6.jpeg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null)))); self.clients.claim(); });
self.addEventListener('fetch', e => { e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); });