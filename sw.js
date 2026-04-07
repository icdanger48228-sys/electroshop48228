// Nombre de caché dinámico: cambia en cada despliegue
const CACHE_NAME = "electroshop-cache-" + new Date().getTime();

const urlsToCache = [
  "/electroshop48228/",
  "/electroshop48228/index.html",
  "/electroshop48228/offline.html",
  "/electroshop48228/afiliados.html",
  "/electroshop48228/planes.html"

];

// Instalar y cachear lo básico
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // activa la nueva versión inmediatamente
});

// Activar y limpiar cachés viejas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // toma control de todas las pestañas
});

// Estrategias de caché
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          const responseClone = networkResponse.clone(); // 👈 clonar aquí
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return networkResponse; // devolver el original
        })
        .catch(() => {
          return caches.match(request).then(response => {
            return response || caches.match("/electroshop48228/offline.html");
          });
        })
    );
    return;
  }

  if (request.destination === "style" ||
      request.destination === "image" ||
      request.destination === "script") {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) return response;
        return fetch(request).then(networkResponse => {
          const responseClone = networkResponse.clone(); // 👈 clonar aquí
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});








