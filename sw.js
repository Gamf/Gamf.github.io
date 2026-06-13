// sw.js — installable + offline, but NETWORK-FIRST so a new deploy always shows
// immediately (cache is only an offline fallback). Cache-first previously pinned
// visitors to a stale shell — don't go back to that. Bump CACHE_VERSION on deploy.

const CACHE_VERSION = 'gamf-hub-v3';
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
    caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: try the network, update the cache, fall back to cache offline.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok && new URL(req.url).origin === self.location.origin) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req).then((c) => c || caches.match('index.html')))
  );
});
