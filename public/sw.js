/* Gig-Smart service worker — v3.
 * - Network-first HTML with a 4s timeout race: a slow network can never hang
 *   the shell — users get the cached app instantly and it refreshes in place.
 * - Cache-first for hashed bundles (/bundles/*, /assets/*): they are
 *   content-hashed, so cache hits are safe and repeat visits load instantly.
 * - /app serves the same shell; offline deep links fall back to cached shell.
 * - Answers the page's version ping so the app can self-update on new deploys.
 * - Never caches API traffic (Supabase etc.), so wallet data is always live.
 */
const CACHE = 'gigsmart-shell-v3';
const VERSION = 'v3';
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

// The page pings this on load; if the answer's version differs from the page's
// build stamp, the page knows a new deploy exists and reloads once.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.source?.postMessage({ type: 'VERSION', version: VERSION });
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never cache Supabase, BrightPay, or any cross-origin traffic.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/@') || url.pathname.startsWith('/node_modules')) return; // dev server modules
  if (event.request.method !== 'GET') return;

  // Navigation/HTML: race the network (4s cap) against the cached shell so a
  // slow/edge-case network shows the app instantly instead of a blank hang.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      new Promise((resolve) => {
        let settled = false;
        const fromCache = caches.match('/index.html').then((hit) => {
          if (!settled) { settled = true; resolve(hit || fetch(event.request)); }
        });
        const fromNetwork = fetch(event.request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put('/index.html', copy));
            if (!settled) { settled = true; resolve(res); }
          })
          .catch(() => {
            if (!settled) { settled = true; resolve(caches.match('/index.html')); }
          });
        const timer = setTimeout(() => {
          if (!settled) { settled = true; resolve(fromCache); }
        }, 4000);
        // Keep promises alive until one wins.
        Promise.allSettled([fromCache, fromNetwork]).then(() => clearTimeout(timer));
      })
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
