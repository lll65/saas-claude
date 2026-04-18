const CACHE = 'pixglow-v1';
const PRECACHE = ['/', '/src/main.jsx'];

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Ne pas mettre en cache les appels API
  if (url.pathname.startsWith('/enhance') || url.pathname.startsWith('/generate') || url.pathname.startsWith('/image/')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
