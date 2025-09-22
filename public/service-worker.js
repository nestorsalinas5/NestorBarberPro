// El nombre del caché. Es buena práctica incluir una versión para facilitar las actualizaciones.
const CACHE_NAME = 'nestorbarberpro-v5';

// App Shell: Archivos básicos y estáticos necesarios para que la aplicación se ejecute.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json',
  // Se eliminó el favicon SVG data:URI porque no puede ser cacheado directamente.
  // El navegador lo renderizará desde el archivo index.html que sí está en caché.
];

/**
 * Evento 'install': se dispara cuando el Service Worker se instala por primera vez.
 * Aquí guardamos en caché los recursos básicos de la aplicación (el "app shell").
 */
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Guardando en caché el App Shell');
        return cache.addAll(APP_SHELL_URLS);
      })
  );
});

/**
 * Evento 'activate': se dispara cuando un nuevo Service Worker se activa.
 * Es el momento ideal para limpiar los cachés antiguos y liberar espacio.
 */
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si el nombre del caché no está en nuestra lista blanca (es de una versión anterior), lo eliminamos.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Le dice al Service Worker que tome control de la página inmediatamente.
  return self.clients.claim();
});

/**
 * Evento 'fetch': se dispara cada vez que la aplicación solicita un recurso.
 * Implementa una estrategia "Cache-First": primero busca en el caché, y si no lo encuentra, va a la red.
 */
self.addEventListener('fetch', event => {
  // Ignoramos las peticiones que no son GET (como POST a Supabase).
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si encontramos una respuesta en el caché, la devolvemos inmediatamente.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no está en caché, la pedimos a la red.
        return fetch(event.request).then(networkResponse => {
          // Opcional pero recomendado: guardar la nueva respuesta en caché para la próxima vez.
          // Solo si la respuesta es válida.
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
             caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
             });
          }
          return networkResponse;
        });
      })
  );
});
