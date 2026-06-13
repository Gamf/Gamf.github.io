// sw.js — minimal service worker so the hub is installable and works offline.
// Strategy: cache the app shell on install; serve cache-first, fall back to
// network. Bump CACHE_VERSION whenever the hub files change.

const CACHE_VERSION = 'gamf-hub-v2';
const SHELL = [
  './',
  'index.html',
  'stats.html',
  'gamf.css',
  'gamf-icons.js',
  'gamf-stats.js',
  'app.js',
  'genres.json',
  'manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).catch(() => cached)
    )
  );
});
