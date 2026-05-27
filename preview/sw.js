/* Ikos Porto Petro Travel Companion · service worker
   Strategy:
   - Network-first for HTML  (so users never get stuck on a stale shell)
   - Cache-first for static images/icons (fast + offline-ready)
   - Never cache weather API responses (must be fresh)                     */
const VERSION = 'ikos-pp-companion-v1';
const STATIC = [
  './',
  './index.html',
  './manifest.json',
  '../icon-192.png',
  '../icon-512.png',
  '../resort-hero.jpg',
  '../overview.jpg',
  '../aerial.jpg',
  '../pool.jpg',
  '../pool-bar.jpg',
  '../beach.jpg',
  '../beachclub.jpg',
  '../beachclub-aerial.jpg',
  '../suite.jpg',
  '../villa.jpg',
  '../seasons.jpg',
  '../anaya.jpg',
  '../mini.jpg',
  '../sup.jpg',
  '../formentor.jpg',
  '../village.jpg',
  '../winetasting.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(STATIC).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Never cache live weather APIs — always go to network
  if (url.host.includes('open-meteo.com') || url.host.includes('api.met.no')) return;

  const isHTML = event.request.mode === 'navigate' ||
                 event.request.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // Network-first for HTML → users see updates immediately
    event.respondWith(
      fetch(event.request).then(resp => {
        const clone = resp.clone();
        caches.open(VERSION).then(c => c.put(event.request, clone));
        return resp;
      }).catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
      if (resp.ok && (url.pathname.match(/\.(jpg|jpeg|png|webp|svg|css|js|woff2?)$/i))) {
        const clone = resp.clone();
        caches.open(VERSION).then(c => c.put(event.request, clone));
      }
      return resp;
    }))
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
