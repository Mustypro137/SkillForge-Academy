// Registers the service worker that makes the app work offline.
// The worker is optional: if the browser has no service worker, or registration fails,
// the app keeps working normally. Nothing here touches your saved data.
//
// "nav" is an optional navigator-like object, so the function is easy to test.

export function registerServiceWorker(nav = globalThis.navigator) {
  if (!nav?.serviceWorker?.register) return Promise.resolve(null);
  try {
    return Promise.resolve(nav.serviceWorker.register('./service-worker.js')).catch(() => null);
  } catch {
    return Promise.resolve(null);
  }
}
