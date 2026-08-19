const CACHE = 'macau-trip-v2';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k!==CACHE).map(k => caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const req = e.request;
  const isHTML = req.mode === 'navigate' || /\/(index\.html)?(\?.*)?$/.test(new URL(req.url).pathname);
  if (isHTML) {
    // 網路優先：頁面永遠拿最新版，離線才回退到快取
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // 靜態資源（圖示、manifest）：快取優先
  e.respondWith(
    caches.match(req, {ignoreSearch:true}).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    }))
  );
});
