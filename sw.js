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
// Al tocar un aviso del Calendario: abre (o enfoca) la página en el día de esa actividad
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/?vista=calendario';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    const w = ws.find(c => new URL(c.url).origin === self.location.origin);
    if (w) { w.focus(); return w.navigate ? w.navigate(url) : null; }
    return self.clients.openWindow(url);
  }));
});
