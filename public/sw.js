// J.A.R.B.E.E.R. OS — Service Worker
// Caché agresivo de assets estáticos para permitir el arranque de la app
// en modo Búnker/local sin conexión externa. Las llamadas a la API
// (/api/v1/*) NUNCA se cachean: deben ir siempre a red para reflejar el
// estado real de la planta.

const CACHE_NAME = 'jarbeer-os-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/avatar.png',
  '/jarbeer-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nunca cachear llamadas a la API local (deben reflejar el estado real).
  if (url.pathname.startsWith('/api/')) return;

  // Solo cacheamos peticiones GET del propio origen.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
