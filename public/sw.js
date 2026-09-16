/* Gig-Smart service worker — minimal network-first shell.
 * Registers a fetch handler (required for Chrome installability) but never
 * caches API calls, so wallet balances and payments are always live.
 */
const CACHE = 'gigsmart-shell-v1';
const SHELL = ['/', '/index.html', '/manifest.json', '/assets/icon-192.png', '/assets/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never cache Supabase, BrightPay, or cross-origin traffic.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/node_modules')) return; // dev server modules
  if (event.request.method !== 'GET') return;

  // Network-first for navigation/HTML so users always get the freshest app.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for static assets.
  event.respondWith(
    caches.match(event.request).then((hit) => {
      if (hit) return hit;
      return fetch(event.request).then((res) => {
        if (res.ok && (url.pathname.startsWith('/assets/') || url.pathname === '/manifest.json')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
        }
        return res;
      });
    })
  );
});
