// This service worker is located in the project root and is incorrect.
// It is designed to unregister itself and then allow the correct service worker from /public to take over.
// For a permanent fix, this file should be DELETED from your project's root directory.

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Incorrect root service worker activating. Unregistering...');
  e.waitUntil(
    self.registration
      .unregister()
      .then(() => {
        return self.clients.matchAll();
      })
      .then((clients) => {
        console.log('[Service Worker] Unregistered successfully. Reloading clients...');
        clients.forEach((client) => client.navigate(client.url));
      })
  );
});
