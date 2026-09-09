// Only a generic, non-personal offline message is cached. Never cache the app,
// authenticated HTML, API responses, authentication routes, or study records.
const OFFLINE_CACHE = 'adim-adim-offline-v1';
self.addEventListener('install', (event) =>
  event.waitUntil(
    (async () => {
      const response = await fetch('/offline.html', { cache: 'reload' });
      if (
        response.ok &&
        !response.redirected &&
        response.headers.get('Content-Type')?.includes('text/html')
      ) {
        const html = await response.clone().text();
        if (
          html.length < 12000 &&
          html.includes('data-offline-screen="adim-adim-public-message-v1"')
        ) {
          const cache = await caches.open(OFFLINE_CACHE);
          await cache.put('/offline.html', response);
        }
      }
    })(),
  ),
);
self.addEventListener('activate', (event) =>
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith('adim-adim-offline-') && key !== OFFLINE_CACHE)
          await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener('message', (event) => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate')
    return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      return (
        (await cache.match('/offline.html')) ||
        new Response(
          'Bağlantı yok. Adım Adım kayıtlarına ulaşmak için internete bağlan.',
          {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          },
        )
      );
    }),
  );
});
