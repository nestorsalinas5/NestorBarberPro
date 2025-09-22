// El nombre del caché. Es buena práctica incluir una versión.
const CACHE_NAME = 'nestorbarberpro-v3';

// App Shell: Archivos básicos necesarios para que la aplicación se ejecute.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json',
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23121212'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' font-size='60' font-family='Playfair Display, serif' fill='%23D4AF37'%3EN%3C/text%3E%3C/svg%3E",
];

// Evento 'install': se guarda en caché el app shell.
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching App Shell');
        return cache.addAll(APP_SHELL_URLS);
      })
  );
});

// Evento 'activate': se limpian los cachés antiguos.
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento 'fetch': sirve desde el caché primero (estrategia Cache-First).
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request)
        .then(response => {
          // Si tenemos una respuesta en caché, la devolvemos.
          if (response) {
            return response;
          }

          // Si no, la pedimos a la red.
          return fetch(event.request).then(networkResponse => {
            // Y guardamos la nueva respuesta en caché para uso futuro.
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
    })
  );
});
