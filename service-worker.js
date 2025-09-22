// El nombre del caché. Es buena práctica incluir una versión.
const CACHE_NAME = 'nestorbarberpro-v2';

// Lista de archivos y recursos básicos (el "app shell") que se guardarán en caché.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  // El favicon SVG definido en el HTML
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23121212'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' font-size='60' font-family='Playfair Display, serif' fill='%23D4AF37'%3EN%3C/text%3E%3C/svg%3E",
];

/**
 * Evento 'install': Se dispara cuando el Service Worker se instala.
 * Aquí guardamos en caché los recursos básicos de la aplicación.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto y guardando el app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

/**
 * Evento 'fetch': Se dispara cada vez que la aplicación solicita un recurso (imágenes, scripts, etc.).
 * Intentamos servir el recurso desde el caché primero para que la app funcione offline.
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en el caché, lo retornamos.
        if (response) {
          return response;
        }
        // Si no está en el caché, lo pedimos a la red.
        return fetch(event.request);
      })
  );
});

/**
 * Evento 'activate': Se dispara cuando un nuevo Service Worker se activa.
 * Aquí limpiamos los cachés viejos para liberar espacio.
 */
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si el nombre del caché no está en nuestra lista blanca, lo eliminamos.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
