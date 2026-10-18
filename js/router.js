// Chooses which page to show, based on the URL hash (the part after "#").
// Example: "#/typing" -> the "typing" route.

import { routes } from './routes.js';

// Pure function: hash text in, route out. Easy to test.
// Returns the matching route, or null when no page matches.
export function findRoute(hash) {
  const path = String(hash ?? '')
    .replace(/^#\/?/, '')   // remove "#/" or "#"
    .replace(/\/+$/, '')    // remove trailing slashes
    .toLowerCase();
  return routes.find((route) => route.path === path) ?? null;
}

// Calls onChange(route) now and every time the hash changes.
// route is null for an unknown page ("Page not found").
export function startRouter(onChange) {
  const update = () => onChange(findRoute(window.location.hash));
  window.addEventListener('hashchange', update);
  update();
}
