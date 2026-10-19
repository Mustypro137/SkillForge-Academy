// Progress reports and offline install check (optional).
// Needs Microsoft Edge and a local server on port 8771:
//   python -m http.server 8771
//   node tools/reports-offline-check.mjs
// Not part of 'npm test'. Re-run it after changes to the reports page,
// the manifest or the service worker.

import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = 'http://localhost:8771/index.html';
const PORT = 9340;
const profile = mkdtempSync(join(tmpdir(), 'edge-reports-'));
const edge = spawn(EDGE, [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  '--headless=new',
  '--disable-gpu',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' - ' + detail : ''}`);
};

async function connect() {
  for (let i = 0; i < 40; i += 1) {
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
  if (msg.id && waiting.has(msg.id)) {
    waiting.get(msg.id)(msg);
    waiting.delete(msg.id);
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    const details = msg.params.exceptionDetails;
    errors.push(details.exception?.description ?? details.text);
  }
};
const send = (method, params = {}) => new Promise((resolve) => {
  const id = ++nextId;
  waiting.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const answer = await send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true,
  });
  return answer.result.result.value;
};

const text = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent ?? ''`);
const count = (selector) => evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length`);
const bodyText = () => evaluate('document.body.innerText');
const noNaN = (value) => !/NaN|undefined/.test(value);

async function go(url, width = 1366) {
  await send('Emulation.setDeviceMetricsOverride', {
    width, height: 900, deviceScaleFactor: 1, mobile: false,
  });
  await send('Page.navigate', { url });
  for (let i = 0; i < 80; i += 1) {
    if (await evaluate(`!!document.querySelector('main h1')`)) break;
    await sleep(150);
  }
  await sleep(200);
}

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  // 1. Empty state: friendly text, no empty charts, full calendar.
  await go(BASE + '?empty#/reports');
  const empty = await bodyText();
  check('empty: the page explains there is no data yet',
    empty.includes('No practice data yet')
    && empty.includes('Charts will appear after your first practice'));
  check('empty: no charts are drawn with zero-height bars',
    (await count('svg.report-chart')) === 0);
  check('empty: the calendar still has 5 weeks of days',
    (await count('.practice-calendar .calendar-day')) === 35);
  check('empty: no NaN or undefined on the page', noNaN(empty));

  // 2. Seed two answers, then open the page again.
  const now = new Date().toISOString();
  const seed = {
    app: 'skillforge',
    schemaVersion: 3,
    createdAt: now,
    lastBackupAt: null,
    settings: { theme: 'system', fontSize: 18, showComingSoon: false },
    progress: {},
    attempts: [
      { id: 'a1', lessonId: 'grammar-present-simple', exerciseId: 'ps-01', firstTry: true, at: now },
      { id: 'a2', lessonId: 'grammar-present-simple', exerciseId: 'ps-02', firstTry: false, review: true, at: now },
    ],
    mistakes: {},
    writing: { drafts: {}, history: [] },
    roleplay: { results: {}, log: [] },
  };
  await evaluate(`localStorage.setItem('skillforge-data', ${JSON.stringify(JSON.stringify(seed))});`);
  await go(BASE + '?filled#/reports');
  const filled = await bodyText();
  check('filled: the answer total and first-try accuracy are right',
    filled.includes('Answers (all time)') && filled.includes('2') && filled.includes('50% right on the first try'));
  check('filled: the summary counts the review answer',
    filled.includes('0 of 1 review answers were right on the first try'));
  check('filled: the three charts are drawn', (await count('svg.report-chart')) === 3);
  check('filled: at least one calendar day is marked',
    (await count('.practice-calendar .calendar-day.active')) >= 1);
  check('filled: the skill list shows the two answered skills',
    (await count('.skill-report li')) === 2);
  check('filled: charts have text for screen readers',
    (await count('svg.report-chart > title')) === 3 && (await count('svg.report-chart > desc')) === 3);
  check('filled: no NaN or undefined on the page', noNaN(filled));

  // 3. Service worker: registered, active and with the app cached.
  // The first install may race with the page, so a reload retries it.
  let swState = 'timeout';
  for (let attempt = 0; attempt < 3 && swState !== 'activated'; attempt += 1) {
    swState = await evaluate(`Promise.race([
      navigator.serviceWorker.ready.then((r) => (r.active ? r.active.state : 'no-active')),
      new Promise((resolve) => setTimeout(() => resolve('timeout'), 20000)),
    ])`);
    if (swState !== 'activated') await go(BASE + '?retry#/reports');
  }
  check('offline: the service worker is activated', swState === 'activated', String(swState));
  const cacheFiles = await evaluate(`caches.keys().then(async (keys) => {
    if (keys.length === 0) return -1;
    const cache = await caches.open(keys[0]);
    return (await cache.keys()).length;
  })`);
  check('offline: the app files are in the cache', cacheFiles > 50, `${cacheFiles} files`);

  // 4. Offline reload keeps the app working.
  await send('Network.emulateNetworkConditions', {
    offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0,
  });
  await send('Page.reload', { ignoreCache: true });
  for (let i = 0; i < 60; i += 1) {
    if ((await bodyText()).includes('Progress reports')) break;
    await sleep(200);
  }
  const offline = await bodyText();
  check('offline: the reports page opens with no network',
    offline.includes('Progress reports') && offline.includes('Practice calendar'));
  check('offline: the charts are still drawn', (await count('svg.report-chart')) === 3);
  await send('Network.emulateNetworkConditions', {
    offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1,
  });

  // 5. Phone width: no sideways scrolling on the charts.
  await go(BASE + '?phone#/reports', 360);
  check('phone: the page does not scroll sideways',
    (await evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1')) === true);
  check('phone: the charts are still there', (await count('svg.report-chart')) === 3);

  check('no uncaught errors', errors.length === 0, errors.join(' | ').slice(0, 200));
  const linked = await evaluate(`!!document.querySelector('link[rel=manifest]')`);
  const apple = await evaluate(`!!document.querySelector('link[rel="apple-touch-icon"]')`);
  check('the manifest and apple touch icon are linked', linked && apple);
} catch (error) {
  results.push('ERROR ' + error.stack);
}
console.log(results.join('\n'));
ws.close();
edge.kill();
process.exit(0);
