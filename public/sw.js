/* Gig-Smart service worker — v2.
 * - Network-first HTML (always fresh app shell).
 * - Cache-first for hashed bundles (/bundles/*, /assets/*): they are
 *   content-hashed, so cache hits are safe and repeat visits load instantly.
 * - /app serves the same shell; deep links fall back to the cached shell
 *   so the installed app opens even when the network is flaky.
 * - Never caches API traffic (Supabase etc.), so wallet data is always live.
 */
const CACHE = 'gigsmart-shell-v2';
const SHELL = ['/', '/app', '/index.html', '/manifest.json', '/assets/icon-192.png', '/assets/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
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
  // Never cache Supabase, BrightPay, or any cross-origin traffic.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/node_modules')) return; // dev server modules
  if (event.request.method !== 'GET') return;

  // Network-first for navigation/HTML so users always get the freshest app,
  // with a cached-shell fallback for offline/flaky starts.
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

  // Hashed bundles & static assets: cache-first (content-hashed = immutable).
  const cacheFirst = url.pathname.startsWith('/bundles/') || url.pathname.startsWith('/assets/');
  if (cacheFirst) {
    event.respondWith(
      caches.match(event.request).then((hit) => {
        if (hit) return hit;
        return fetch(event.request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // Everything else (manifest etc.): stale-while-revalidate.
  event.respondWith(
    caches.match(event.request).then((hit) => {
      const net = fetch(event.request).then((res) => {
        if (res.ok && (url.pathname === '/manifest.json')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copy));
        }
        return res;
      });
      return hit || net;
    })
  );
});
