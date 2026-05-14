import './polyfills';

// expo-sqlite on web requires SharedArrayBuffer, which is only available when
// the page is cross-origin isolated (COOP/COEP headers set). Expo's dev server
// doesn't set those headers, and the +html.tsx template only applies during
// static rendering, not SPA dev. So in the browser we register the COI service
// worker from JS, then reload — the SW intercepts the reloaded document and
// injects the headers. We defer loading the app entry until after the reload
// so the app never tries to open SQLite before isolation is in place.

const win: any = typeof window !== 'undefined' ? window : null;
const nav: any = typeof navigator !== 'undefined' ? navigator : null;
const needsCoiBootstrap =
  win && nav && 'serviceWorker' in nav && !win.crossOriginIsolated;

if (needsCoiBootstrap) {
  nav.serviceWorker
    .register('/coi-serviceworker.js')
    .then((reg: any) => {
      const sw = reg.installing || reg.waiting || reg.active;
      if (!sw) return;
      if (sw.state === 'activated') {
        win.location.reload();
      } else {
        sw.addEventListener('statechange', (e: any) => {
          if (e.target.state === 'activated') win.location.reload();
        });
      }
    })
    .catch((err: unknown) => {
      console.warn('COI service worker registration failed:', err);
    });
} else {
  require('expo-router/entry');
}
