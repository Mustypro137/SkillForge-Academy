// Offline and install check: manifest, service worker, cache and a real offline reload.
// Optional browser check. Needs Microsoft Edge and a local server on port 8771:
//   python -m http.server 8771      (in the project folder)
//   node tools/pwa-check.mjs
// Not part of 'npm test'. Re-run it after changes to the service worker, manifest or icons.

import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = 'http://localhost:8771/index.html';
const PORT = 9340;
const CACHE_NAME = 'skillforge-v1';
const profile = mkdtempSync(join(tmpdir(), 'edge-pwa-'));
const edge = spawn(EDGE, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--headless=new', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' - ' + detail : ''}`); };

async function connect() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* not ready yet */ }
    await sleep(250);
  }
  throw new Error('Edge did not start');
}

const ws = new WebSocket(await connect());
await new Promise((r) => { ws.onopen = r; });
let nextId = 0;
const waiting = new Map();
const errors = [];
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && waiting.has(msg.id)) { waiting.get(msg.id)(msg); waiting.delete(msg.id); }
  if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
};
const send = (method, params = {}) => new Promise((resolve) => {
  const id = ++nextId; waiting.set(id, resolve); ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return response.result?.result?.value;
};
const text = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent ?? ''`);
const card = (title) => evaluate(`[...document.querySelectorAll('.stat')].find((c) => c.querySelector('h2')?.textContent === ${JSON.stringify(title)})?.textContent.replace(/\\s+/g, ' ').trim() ?? ''`);

async function waitForHeading(expected, limit = 80) {
  for (let i = 0; i < limit; i++) {
    if ((await text('main h1')) === expected) return true;
    await sleep(150);
  }
  return false;
}

async function go(url, width = 1366) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await sleep(300);
  for (let i = 0; i < 80; i++) {
    if (await evaluate(`!!document.querySelector('main h1')`)) break;
    await sleep(150);
  }
  await sleep(150);
}

const online = () => send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
const offline = () => send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0, connectionType: 'none' });

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  // ----- 1. One normal online load registers and fills the cache -----
  await go(BASE + '?pwa1#/');
  check('the app opens online', (await waitForHeading('Dashboard')), await text('main h1'));

  const manifest = (await send('Page.getAppManifest')).result;
  check('the manifest is linked and parsed', Boolean(manifest?.url) && !(manifest?.errors ?? []).length, JSON.stringify(manifest?.errors ?? []));
  check('the manifest has the app name and start URL', /SkillForge Academy/.test(manifest?.data ?? '') && /index\.html/.test(manifest?.data ?? ''));
  check('the page has a theme color and touch icon', (await evaluate(`document.querySelector('meta[name="theme-color"]')?.content === '#2b5fd9' && !!document.querySelector('link[rel="apple-touch-icon"]')`)) === true);

  const sw = await evaluate(`(async () => {
    if (!('serviceWorker' in navigator)) return { supported: false };
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 30000)),
    ]);
    for (let i = 0; i < 40; i++) {
      if (registration?.active?.state === 'activated' && navigator.serviceWorker.controller) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    return {
      supported: true,
      active: registration?.active?.state ?? 'none',
      script: registration?.active?.scriptURL ?? '',
      scope: registration?.scope ?? '',
      controller: Boolean(navigator.serviceWorker.controller),
    };
  })()`);
  check('the service worker is supported', sw?.supported === true);
  check('the service worker is activated', sw?.active === 'activated', sw?.active);
  check('it runs service-worker.js at the site root', /\/service-worker\.js$/.test(sw?.script ?? '') && sw?.scope === 'http://localhost:8771/', `${sw?.script} (${sw?.scope})`);
  check('the first page is controlled after activation', sw?.controller === true);

  const cache = await evaluate(`(async () => {
    if (!(await caches.has(${JSON.stringify(CACHE_NAME)}))) return { ok: false, keys: [] };
    const keys = await (await caches.open(${JSON.stringify(CACHE_NAME)})).keys();
    return { ok: true, count: keys.length, urls: keys.map((r) => r.url) };
  })()`);
  check(`the ${CACHE_NAME} cache exists`, cache?.ok === true);
  check('the cache holds the whole app (at least 90 files)', cache?.count >= 90, String(cache?.count));
  for (const file of ['index.html', 'css/base.css', 'js/pages/reports.js', 'js/pages/grammar.js', 'content/reading/job-post.js', 'icons/icon-192.png']) {
    check(`the cache holds ${file}`, cache?.urls?.some((url) => url.endsWith('/' + file)) === true);
  }

  // ----- 2. Save some progress, then reload once online so the worker controls the page -----
  await evaluate(`localStorage.setItem('skillforge-data', JSON.stringify({
    app: 'skillforge', schemaVersion: 3, createdAt: new Date().toISOString(), lastBackupAt: null,
    settings: { theme: 'system', fontSize: 18, showComingSoon: true },
    progress: {}, attempts: [
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-01', at: new Date().toISOString(), firstTry: true, review: false },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-02', at: new Date().toISOString(), firstTry: false, review: false },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-03', at: new Date().toISOString(), firstTry: true, review: false }
    ],
    mistakes: {}, writing: { drafts: {}, history: [] }, roleplay: { results: {}, log: [] }
  }))`);
  await send('Page.reload');
  check('the online reload works', await waitForHeading('Dashboard'), await text('main h1'));
  check('the saved progress is read (3 answers in the last 7 days)', /3 answers/.test(await card('Last 7 days')), await card('Last 7 days'));

  // ----- 3. Go offline: a full reload must still open the app from the cache -----
  await offline();
  await send('Page.reload');
  check('offline: the app shell opens after a reload', await waitForHeading('Dashboard'), await text('main h1'));
  check('offline: the saved progress is still there', /3 answers/.test(await card('Last 7 days')), await card('Last 7 days'));

  await evaluate(`location.hash = '#/grammar'`);
  check('offline: the Grammar page opens', await waitForHeading('Grammar practice'), await text('main h1'));
  const opened = await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Open lesson/.test(x.textContent)); if (!b) return false; b.click(); return true; })()`);
  check('offline: a lesson opens', opened === true);
  await sleep(300);
  const started = await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((x) => /Start exercises/.test(x.textContent)); if (!b) return false; b.click(); return true; })()`);
  check('offline: the exercises start', started === true);
  await sleep(400);
  check('offline: the first exercise is usable', (await evaluate(`!!document.querySelector('.answer-input, .choices input, .reorder-item')`)) === true);

  await evaluate(`location.hash = '#/reports'`);
  check('offline: the Progress reports page opens', await waitForHeading('Progress reports'), await text('main h1'));
  check('offline: the reports page draws its numbers', /3 answers|3\s*$/m.test(await card('Answers (all time)')) || /Answers \(all time\)3/.test(await card('Answers (all time)')), await card('Answers (all time)'));

  // ----- 4. Back online: normal use continues -----
  await online();
  await go(BASE + '?pwa2#/settings');
  check('online again: Settings opens', await waitForHeading('Settings and backup'), await text('main h1'));
  check('no uncaught errors', errors.length === 0, errors.join(' | ').slice(0, 200));
} catch (error) {
  results.push('ERROR ' + error.stack);
}
console.log(results.join('\n'));
ws.close();
edge.kill();
process.exit(0);
