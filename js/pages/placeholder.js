// Shared placeholder screen used by every page until it is built.
// Each page file calls this with its own title and text.

import { el } from '../ui/dom.js';

export function renderPlaceholder(container, { title, text, note }) {
  const heading = el('h1', { tabindex: '-1' }, title); // main.js moves focus here
  container.replaceChildren(
    heading,
    el('p', {}, text),
    el('p', { class: 'note' }, note),
  );
}
