const CACHE_NAME = "electroshop-cache-v3";
const urlsToCache = [
  "/electroshop48228/",
  "/electroshop48228/index.html",
  "/electroshop48228/offline.html",
  "/electroshop48228/afiliados.html",
  "/electroshop48228/planes.html",
  "/electroshop48228/style.css"
];

//agregado
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/electroshop48228/sw.js")
    .then(registration => {
      console.log("Service Worker registrado con éxito:", registration);
    })
    .catch(error => {
      console.log("Error al registrar el Service Worker:", error);
    });
}


// Instalar y cachear lo básico
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activar y limpiar cachés viejos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Estrategias de caché
self.addEventListener("fetch", event => {
  const request = event.request;

  // Estrategia "cache first" para recursos estáticos (CSS, imágenes, JS)
  if (request.destination === "style" ||
      request.destination === "image" ||
      request.destination === "script") {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // Estrategia "network first" para páginas HTML
  if (request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then(response => {
            return response || caches.match("/electroshop48228/offline.html");
          });
        })
    );
    return;
  }

  // Fallback general
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );

  //agregado
  navigator.serviceWorker.addEventListener("controllerchange", () => {
  window.location.reload();
});






