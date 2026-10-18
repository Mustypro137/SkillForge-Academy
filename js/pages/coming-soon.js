// Used for pages that are planned but not built yet, and for unknown addresses.

import { renderPlaceholder } from './placeholder.js';

export function renderComingSoon(container, route) {
  renderPlaceholder(container, {
    title: route.label,
    text: 'This page is coming soon.',
    note: `It is planned for ${route.note}, after the first version (MVP) is finished.`,
  });
}

export function renderNotFound(container) {
  renderPlaceholder(container, {
    title: 'Page not found',
    text: 'This address does not match any page.',
    note: 'Use the menu to go to a page, or open the Dashboard.',
  });
}
