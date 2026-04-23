const CACHE_NAME = 'mediplan-pro-v1';

// Diese Dateien laden wir beim ersten Start in den Cache
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    // Externe Bibliotheken auch cachen, damit PDF-Export offline geht!
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js'
];

// 1. Installation: Cachen der Assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache geöffnet und Assets geladen');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    self.skipWaiting();
});

// 2. Aktivierung: Alte Caches aufräumen (hilft bei Updates)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Alter Cache gelöscht:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. Fetch: Offline-First Strategie
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Wenn im Cache gefunden, gib es zurück, ansonsten lade es aus dem Netz
                return cachedResponse || fetch(event.request);
            })
            .catch(() => {
                // Optionaler Fallback, falls weder Cache noch Netz verfügbar sind
                console.log('Kein Netz und nicht im Cache:', event.request.url);
            })
    );
});