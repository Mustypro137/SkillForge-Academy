// Small helpers shared by pages that have several screens.

import { el } from './dom.js';

export function button(text, onClick, secondary = false) {
  const b = el('button', { class: secondary ? 'button button-secondary' : 'button', type: 'button' }, text);
  b.addEventListener('click', onClick);
  return b;
}

// Replaces the page content and moves the focus to the heading.
export function setPage(container, heading, ...nodes) {
  container.replaceChildren(heading, ...nodes);
  window.scrollTo(0, 0);
  heading.focus();
}
