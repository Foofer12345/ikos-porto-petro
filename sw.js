const CACHE = 'ikos-porto-petro-v5';
const ASSETS = [
  '/ikos-porto-petro/',
  '/ikos-porto-petro/index.html',
  '/ikos-porto-petro/manifest.json',
  '/ikos-porto-petro/icon-192.png',
  '/ikos-porto-petro/icon-512.png',
  '/ikos-porto-petro/resort-hero.jpg',
  '/ikos-porto-petro/overview.jpg',
  '/ikos-porto-petro/aerial.jpg',
  '/ikos-porto-petro/pool.jpg',
  '/ikos-porto-petro/pool-bar.jpg',
  '/ikos-porto-petro/beachclub.jpg',
  '/ikos-porto-petro/beach.jpg',
  '/ikos-porto-petro/beachclub-aerial.jpg',
  '/ikos-porto-petro/suite.jpg',
  '/ikos-porto-petro/villa.jpg',
  '/ikos-porto-petro/seasons.jpg',
  '/ikos-porto-petro/anaya.jpg',
  '/ikos-porto-petro/mini.jpg',
  '/ikos-porto-petro/village.jpg',
  '/ikos-porto-petro/formentor.jpg',
  '/ikos-porto-petro/mixologist.jpg',
  '/ikos-porto-petro/sup.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  if (url.includes('open-meteo.com') || url.includes('api.met.no')) return;
  event.respondWith(
    fetch(event.request).then(resp => {
      if (resp.ok) {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(event.request, clone));
      }
      return resp;
    }).catch(() => caches.match(event.request))
  );
});
