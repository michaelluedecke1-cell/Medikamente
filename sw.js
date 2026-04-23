const CACHE_NAME = 'mediplan-pro-v3';

// Liste der Dateien, die für den Offline-Betrieb gespeichert werden.
// WICHTIG: Die Pfade müssen exakt mit deiner GitHub-URL übereinstimmen.
const ASSETS_TO_CACHE = [
    '/Medikamente/',
    '/Medikamente/index.html',
    '/Medikamente/manifest.json',
    // Externe Bibliotheken für den PDF-Export (werden ebenfalls gecacht)
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js'
];

// 1. Installation: Dateien in den Cache laden
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching Assets...');
                // Wir nutzen .addAll, um alle wichtigen Dateien zu sichern
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. Aktivierung: Alte Cache-Versionen löschen
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Lösche alten Cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. Fetch-Strategie: "Cache First, falling back to Network"
// Das sorgt dafür, dass die App blitzschnell lädt und offline funktioniert.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Wenn die Datei im Cache ist, gib sie zurück
                if (response) {
                    return response;
                }
                // Ansonsten lade sie aus dem Internet
                return fetch(event.request);
            })
    );
});
