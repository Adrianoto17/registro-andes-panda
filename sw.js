// Andes Panda · service worker mínimo: permite instalar la app y abrirla sin conexión (muestra la última versión).
// Siempre intenta primero la red, así cada publicación nueva en Vercel se ve al instante.
const CACHE = 'andes-panda-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.mode !== 'navigate' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put('/', copia)); }
      return res;
    }).catch(() => caches.match('/').then(m => m || Response.error()))
  );
});
