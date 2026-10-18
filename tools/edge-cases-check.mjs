// Edge cases: blocked storage, full storage, app code not running, no uncaught errors.
// Optional browser check. Needs Microsoft Edge and a local server on port 8771:
//   python -m http.server 8771      (in the project folder)
//   node tools/edge-cases-check.mjs
// Not part of 'npm test'. Re-run it after bigger changes to the pages.

import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9334;
const profile = mkdtempSync(join(tmpdir(), 'edge-cases-'));
const edge = spawn(EDGE, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--headless=new', '--disable-gpu', '--allow-file-access-from-files=false', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' - ' + detail : ''}`);

async function connect() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* not ready */ }
    await sleep(250);
  }
  throw new Error('Edge did not start');
}
const ws = new WebSocket(await connect());
await new Promise((r) => { ws.onopen = r; });
let nextId = 0; const waiting = new Map(); const errors = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
};
const send = (method, params = {}) => new Promise((resolve) => { const id = ++nextId; waiting.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.result.value;
const go = async (url) => { await send('Page.navigate', { url }); await sleep(900); };
const click = (re) => evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((x) => ${re}.test(x.textContent) && !x.hidden); if (!b) return false; b.click(); return true; })()`);

try {
  await send('Page.enable'); await send('Runtime.enable');
  const BASE = 'http://localhost:8771/index.html';

  // 1. Browser blocks localStorage completely (like some private modes)
  const blocker = `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });`;
  const { result } = await send('Page.addScriptToEvaluateOnNewDocument', { source: blocker });
  await go(BASE + '?blocked#/');
  check('blocked storage: the app still starts', (await evaluate(`document.querySelector('h1')?.textContent`)) === 'Dashboard');
  check('blocked storage: a warning banner is shown', (await evaluate(`!document.getElementById('banner').hidden`)) === true, await evaluate(`document.getElementById('banner').textContent.slice(0, 70)`));
  await go(BASE + '?blocked#/grammar');
  await click('/Open lesson/'); await sleep(100); await click('/Start exercises/'); await sleep(100);
  await evaluate(`document.querySelectorAll('input[type=radio]')[1].click()`);
  await click('/^Check$/'); await sleep(100);
  check('blocked storage: a lesson can still be used', /Correct/.test(await evaluate(`document.querySelector('.feedback').textContent`)));
  await go(BASE + '?blocked#/settings');
  check('blocked storage: Settings opens', (await evaluate(`document.querySelector('h1')?.textContent`)) === 'Settings and backup');
  await click('/Export backup/'); await sleep(200);
  check('blocked storage: no uncaught errors', errors.length === 0, errors.join(' | ').slice(0, 200));
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: result.identifier });

  // 2. Storage full: every write fails with QuotaExceededError
  const filler = `(() => { const real = Storage.prototype.setItem; Storage.prototype.setItem = function () { const e = new DOMException('full', 'QuotaExceededError'); throw e; }; })();`;
  await go(BASE + '?full#/');
  const { result: r2 } = await send('Page.addScriptToEvaluateOnNewDocument', { source: filler });
  await go(BASE + '?full2#/settings');
  await evaluate(`(() => { const s = document.getElementById('set-theme'); s.value = 'dark'; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await sleep(100);
  const status = await evaluate(`document.querySelector('.status').textContent`);
  check('full storage: Settings says the storage is full', /full/i.test(status), status);
  check('full storage: the change still applies on screen', (await evaluate('document.documentElement.dataset.theme')) === 'dark');
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: r2.identifier });

  // 3. The app code does not run (what happens when index.html is opened by double-click)
  await send('Emulation.setScriptExecutionDisabled', { value: true });
  await go(BASE + '?nojs#/');
  const text = await evaluate(`document.getElementById('main').textContent.trim()`);
  check('code not running: a helpful message is shown instead of a blank page', /python -m http.server/.test(text), text.slice(0, 70));
  await send('Emulation.setScriptExecutionDisabled', { value: false });

  // 4. No uncaught JavaScript errors on the normal pages
  errors.length = 0;
  for (const p of ['#/', '#/grammar', '#/mistakes', '#/settings', '#/writing', '#/nonsense']) { await go(BASE + '?e' + Math.random() + p); }
  check('no uncaught errors on normal pages', errors.length === 0, errors.join(' | ').slice(0, 200));
} catch (error) {
  results.push('ERROR ' + error.stack);
}
console.log(results.join('\n'));
ws.close(); edge.kill(); process.exit(0);
