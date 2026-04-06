const CACHE_NAME = "mi-cache-" + new Date().getTime(); // nombre dinámico
const urlsToCache = [
  "/",              // tu página principal
  "/index.html",    // archivo HTML
  "/styles.css",    // estilos
  "/app.js",        // lógica
  "/icon.png"       // icono de la PWA
];

// Instalar y guardar archivos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // activa la nueva versión inmediatamente
});

// Activar y limpiar cachés viejas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // toma control de todas las pestañas
});

// Estrategia de carga
self.addEventListener("fetch", event => {
  if (event.request.destination === "image") {
    // Para imágenes: red primero
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    // Para HTML, CSS, JS: caché primero pero actualiza en segundo plano
    event.respondWith(
      caches.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
        return response || fetchPromise;
      })
    );
  }
});


 //agregado sw.js al final
  navigator.serviceWorker.addEventListener("controllerchange", () => {
  window.location.reload();
});
