/* COOP/COEP service worker — enables SharedArrayBuffer for expo-sqlite on web */
if (typeof window === 'undefined') {
  // Running as service worker: intercept every fetch and add isolation headers
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
  self.addEventListener('fetch', (event) => {
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          if (resp.status === 0) return resp;
          const headers = new Headers(resp.headers);
          headers.set('Cross-Origin-Opener-Policy', 'same-origin');
          headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
          // CORP must be set on every subresource or the COEP page rejects it.
          // Without this, the wa-sqlite .wasm fetch silently fails and
          // openDatabaseAsync hangs forever (no error, no progress).
          headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
          // resp.body is already decoded by fetch; if we keep the original
          // Content-Encoding/Length, downstream consumers may try to decode
          // again and end up with garbage (e.g. JSON.parse "Unterminated
          // string" errors on small responses).
          headers.delete('Content-Encoding');
          headers.delete('Content-Length');
          return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers });
        })
        .catch(() => fetch(event.request))
    );
  });
} else {
  // Running as page script: register the service worker, then reload once active
  if (!window.crossOriginIsolated && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/coi-serviceworker.js').then((reg) => {
      const sw = reg.installing || reg.waiting;
      if (sw) {
        sw.addEventListener('statechange', (e) => {
          if (e.target.state === 'activated') window.location.reload();
        });
      } else if (reg.active) {
        // SW was already registered but this load wasn't isolated yet
        window.location.reload();
      }
    });
  }
}
