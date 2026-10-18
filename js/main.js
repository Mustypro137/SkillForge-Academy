// Starts the app: builds the menu, then shows the right page for the URL.

import { routes } from './routes.js';
import { startRouter } from './router.js';
import { el } from './ui/dom.js';
import { applyAppearance } from './ui/theme.js';
import { initState, getData, getWarning, subscribe } from './state.js';
import { render as renderDashboard } from './pages/dashboard.js';
import { render as renderGrammar } from './pages/grammar.js';
import { render as renderMistakes } from './pages/mistakes.js';
import { render as renderSettings } from './pages/settings.js';
import { renderComingSoon, renderNotFound } from './pages/coming-soon.js';

// Pages that have their own file. Other routes use the "coming soon" page.
const pageRenderers = {
  dashboard: renderDashboard,
  grammar: renderGrammar,
  mistakes: renderMistakes,
  settings: renderSettings,
};

const main = document.getElementById('main');
const nav = document.getElementById('site-nav');
const menuButton = document.getElementById('menu-button');
const banner = document.getElementById('banner');
const skipLink = document.querySelector('.skip-link');
let firstRender = true;
let currentRoute = null;

function linkFor(route) {
  const href = route.path ? `#/${route.path}` : '#/';
  const link = el('a', { class: 'nav-link', href, 'data-route': route.id }, el('span', {}, route.label));
  if (!route.ready) link.append(el('span', { class: 'badge' }, 'Soon'));
  return el('li', {}, link);
}

function buildMenu() {
  nav.replaceChildren();
  const showSoon = getData().settings.showComingSoon;
  let list = null;
  let lastGroup = null;
  for (const route of routes) {
    if (!route.ready && !showSoon) continue;
    if (route.group !== lastGroup || list === null) {
      if (route.group) nav.append(el('p', { class: 'nav-group', 'aria-hidden': 'true' }, route.group));
      list = el('ul', { class: 'nav-list', 'aria-label': route.group || null });
      nav.append(list);
      lastGroup = route.group;
    }
    list.append(linkFor(route));
  }
}

function markCurrentLink(route) {
  for (const link of nav.querySelectorAll('.nav-link')) {
    if (route && link.dataset.route === route.id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

function setMenuOpen(open) {
  nav.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
}

const warningText = {
  corrupt: 'Your saved data could not be read, so the app started fresh. The old data was kept in this browser and is not deleted.',
  newer: 'Your saved data was made by a newer version of this app, so it was not loaded. It was kept and not deleted.',
  unavailable: 'This browser does not allow saving (private mode?). Your progress will not be kept after you close this page.',
};

function showWarning() {
  const text = warningText[getWarning()];
  banner.hidden = !text;
  banner.textContent = text ?? '';
}

function showPage(route) {
  currentRoute = route;
  if (route === null) renderNotFound(main);
  else if (route.ready && pageRenderers[route.id]) pageRenderers[route.id](main);
  else renderComingSoon(main, route);

  markCurrentLink(route);
  document.title = `${route ? route.label : 'Page not found'} - SkillForge Academy`;
  setMenuOpen(false);
  window.scrollTo(0, 0);
  if (firstRender) {
    // On the first load, let the keyboard start at the top (skip link, menu).
    firstRender = false;
    document.activeElement?.blur();
  } else {
    main.querySelector('h1')?.focus(); // so screen readers announce the new page
  }
}

function safeLocalStorage() {
  try { return window.localStorage; } catch { return null; } // blocked in some browsers
}

initState(safeLocalStorage() ?? { getItem() { throw new Error('no storage'); }, setItem() { throw new Error('no storage'); } });
applyAppearance(getData().settings);
showWarning();
subscribe((data) => {
  applyAppearance(data.settings);
  buildMenu();
  markCurrentLink(currentRoute);
});

// A normal link to #main would change the address and confuse the router.
skipLink.addEventListener('click', (event) => {
  event.preventDefault();
  main.focus();
});

buildMenu();
menuButton.addEventListener('click', () => setMenuOpen(!nav.classList.contains('is-open')));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenuOpen(false);
    menuButton.focus();
  }
});
startRouter(showPage);
