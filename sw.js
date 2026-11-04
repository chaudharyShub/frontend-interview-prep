// Service worker: makes the app installable and lets it work offline.
//
// Network first: online visitors always get the latest files (the browser's normal HTTP
// cache still applies). Every successful response is also saved here, so when the network
// is down the last saved copy is used instead.
//
// Bump VERSION when the PRECACHE list changes; old caches are deleted on activate.

const VERSION = 'fip-v2';

const PRECACHE = [
  '/',
  '/app',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/assets/favicon.svg',
  '/assets/favicon-192.png',
  '/assets/css/styles.css',
  '/assets/css/landing.css',
  '/assets/js/theme.js',
  '/assets/js/pwa.js',
  '/assets/js/landing.js',
  '/assets/js/tracks/javascript.js',
  '/assets/js/tracks/typescript.js',
  '/assets/js/tracks/react.js',
  '/assets/js/tracks/nextjs.js',
  '/assets/js/tracks/html-css.js',
  '/assets/js/tracks/system-design.js',
  '/assets/js/app.js',
  '/assets/js/challenges.js',
  '/assets/js/editor.js',
  '/assets/js/runner.js',
  '/assets/vendor/sucrase-3.35.1.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Only same-origin GETs. Calls to the public test APIs from the React preview pass straight through.
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // Leave Vercel's analytics files alone (never cache them).
  if (url.pathname.startsWith('/_vercel/')) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === 'basic' && !res.redirected) {
          const copy = res.clone();
          event.waitUntil(caches.open(VERSION).then((cache) => cache.put(req, copy)));
        }
        return res;
      })
      .catch(() => offlineCopy(req, url))
  );
});

async function offlineCopy(req, url) {
  const hit = await caches.match(req, { ignoreSearch: req.mode === 'navigate' });
  if (hit) return hit;
  if (req.mode === 'navigate') {
    // Track pages (/app/react, /app/starred …) are all the same app page.
    const page = url.pathname === '/app' || url.pathname.startsWith('/app/') ? '/app' : '/';
    const fallback = await caches.match(page);
    if (fallback) return fallback;
  }
  return Response.error();
}
