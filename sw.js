/* The IN — Service Worker
   Cacht NUR die App-Hülle (HTML/Icons), damit die App auch bei kurzem
   Netzausfall startet. Live-Daten (Supabase) werden NIE gecacht.
   HTML wird "network-first" geladen -> neue Versionen landen automatisch,
   ohne dass man die App manuell neu installieren muss. */
const CACHE = 'thein-v14';
const SHELL = ['thein.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Fremde Hosts (Supabase, CDNs, APIs) NICHT anfassen -> immer direkt aus dem Netz.
  if (url.origin !== self.location.origin) return;
  if (e.request.method !== 'GET') return;

  // App-Hülle: erst Netz (frisch), bei Ausfall aus dem Cache.
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('thein.html')))
  );
});
