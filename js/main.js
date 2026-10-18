// Starts the app: builds the menu, then shows the right page for the URL.

import { routes } from './routes.js';
import { startRouter } from './router.js';
import { el } from './ui/dom.js';
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

function linkFor(route) {
  const href = route.path ? `#/${route.path}` : '#/';
  const link = el('a', { class: 'nav-link', href, 'data-route': route.id }, el('span', {}, route.label));
  if (!route.ready) link.append(el('span', { class: 'badge' }, 'Soon'));
  return el('li', {}, link);
}

function buildMenu() {
  let list = null;
  let lastGroup = null;
  for (const route of routes) {
    if (route.group !== lastGroup || list === null) {
      if (route.group) nav.append(el('p', { class: 'nav-group' }, route.group));
      list = el('ul', { class: 'nav-list' });
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

function showPage(route) {
  if (route === null) renderNotFound(main);
  else if (route.ready && pageRenderers[route.id]) pageRenderers[route.id](main);
  else renderComingSoon(main, route);

  markCurrentLink(route);
  document.title = `${route ? route.label : 'Page not found'} - SkillForge Academy`;
  setMenuOpen(false);
  window.scrollTo(0, 0);
  main.querySelector('h1')?.focus(); // so screen readers announce the new page
}

buildMenu();
menuButton.addEventListener('click', () => setMenuOpen(!nav.classList.contains('is-open')));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenuOpen(false);
    menuButton.focus();
  }
});
startRouter(showPage);
