// Nombre del caché dinámico v3.0.0 (fuerza la sustitución limpia en el navegador)
const CACHE_NAME = 'supermart-v3-0-0';

// Archivos locales que se guardarán para funcionamiento 100% offline
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activación y borrado automático de versiones antiguas de caché (v2.9.1 o inferiores)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia Network-First con respaldo Offline
self.addEventListener('fetch', (event) => {
    // Excluir peticiones externas a CDNs de fuentes o Firebase
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la red responde bien, guardamos copia actualizada en caché
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red (offline en el súper), entregamos desde la caché
                return caches.match(event.request);
            })
    );
});
