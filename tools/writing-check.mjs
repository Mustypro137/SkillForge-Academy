// Writing page check: real key presses and typing in Edge.
// Optional browser check. Needs Microsoft Edge and a local server on port 8771:
//   python -m http.server 8771      (in the project folder)
//   node tools/writing-check.mjs
// Not part of 'npm test'. Re-run it after changes to the writing page.

import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writingTasks } from '../content/writing/index.js';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = 'http://localhost:8771/index.html';
const PORT = 9335;
const profile = mkdtempSync(join(tmpdir(), 'edge-writing-'));
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
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.result.value;

const KEYS = {
  Tab: { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 },
  Enter: { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
};
async function press(name, modifiers = 0) {
  const k = KEYS[name];
  await send('Input.dispatchKeyEvent', { type: k.text ? 'keyDown' : 'rawKeyDown', modifiers, ...k });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers, key: k.key, code: k.code, windowsVirtualKeyCode: k.windowsVirtualKeyCode });
  await sleep(60);
}
const active = () => evaluate(`(() => { const a = document.activeElement; return a.tagName + ':' + (a.textContent || a.id || '').trim().replace(/\\s+/g, ' ').slice(0, 45); })()`);
const h1 = () => evaluate(`document.querySelector('h1')?.textContent`);
const text = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent ?? ''`);
const saved = () => evaluate(`JSON.parse(localStorage.getItem('skillforge-data') ?? 'null')`);
async function go(url, width = 1366) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await sleep(700);
}
async function tabTo(predicate, limit = 40) {
  for (let i = 0; i < limit; i++) { if (predicate(await active())) return true; await press('Tab'); }
  return false;
}
async function typeIntoFocused(value) {
  await evaluate('document.activeElement.select && document.activeElement.select()');
  await send('Input.insertText', { text: value });
  await sleep(50);
}

const task = writingTasks[0];
const model = task.modelAnswers[0].text;

try {
  await send('Page.enable'); await send('Runtime.enable');
  await go(BASE + '#/');
  await evaluate('localStorage.clear()');

  // 1. Old (version 1) data still loads, and the Writing page opens
  await evaluate(`localStorage.setItem('skillforge-data', JSON.stringify({ app: 'skillforge', schemaVersion: 1, createdAt: new Date().toISOString(), lastBackupAt: null, settings: { theme: 'system', fontSize: 18, showComingSoon: true }, progress: {}, attempts: [{ lessonId: 'grammar-articles', exerciseId: 'ar-01', result: 'correct', firstTry: true, at: new Date().toISOString() }], mistakes: {} }))`);
  await go(BASE + '?v1#/writing');
  check('version 1 data: the Writing page opens', (await h1()) === 'Writing practice', await h1());
  check('the task list shows all tasks as not started', (await evaluate(`document.querySelectorAll('.lesson-list .card').length`)) === writingTasks.length && /Not started/.test(await text('.lesson-list .card .meta')));
  await evaluate('localStorage.clear()');

  // 2. Open the first task with the keyboard
  await go(BASE + '?w1#/writing');
  check('Tab reaches "Open task"', await tabTo((a) => /^BUTTON:Open task/.test(a)));
  await press('Enter'); await sleep(150);
  check('the task page opens with the title', (await h1()) === task.title, await h1());
  check('the situation and the task are shown', /Maria/.test(await text('main')) && /Your task/.test(await text('main')));

  // 3. Empty text: a helpful message, no checks
  check('Tab reaches the writing box', await tabTo((a) => /^TEXTAREA:/.test(a)));
  await press('Tab');
  check('Tab goes on to "Check my text"', /Check my text/.test(await active()), await active());
  await press('Enter');
  check('checking an empty box asks you to write first', /Write something first/.test(await text('.status')), await text('.status'));

  // 4. Write a weak text and check it
  await evaluate(`document.getElementById('writing-text').focus()`);
  await typeIntoFocused('hey send me the file NOW!!');
  check('the word count updates while typing', /^6 words\. Aim for 35 to 80/.test(await text('#writing-count')), await text('#writing-count'));
  await press('Tab'); await press('Enter'); await sleep(100);
  check('focus moves to the results heading', /^H2:Automatic checks/.test(await active()), await active());
  check('weak text: some checks say "Look at this"', (await evaluate(`document.querySelectorAll('.check-look').length`)) >= 3, String(await evaluate(`document.querySelectorAll('.check-look').length`)));
  check('the model answer and the checklist appear after the check', /Model answer/.test(await text('.writing-after')) && (await evaluate(`document.querySelectorAll('.writing-after input[type=checkbox]').length`)) === task.checklist.length);

  // 5. Edit the text: a note says the results are old
  await evaluate(`document.getElementById('writing-text').focus()`);
  await typeIntoFocused(model);
  check('after editing, a note says to check again', (await evaluate(`!document.querySelector('.note[hidden]') || ![...document.querySelectorAll('.note')].find((n) => /changed/.test(n.textContent))?.hidden`)) === true);
  await press('Tab'); await press('Enter'); await sleep(100);
  const lead = await text('.writing-results .score');
  check('the model answer text passes every check', /^(\d+) of \1 checks are OK/.test(lead), lead);

  // 6. Saving needs a rating
  const saveButton = `[...document.querySelectorAll('button')].find((b) => /Save to my history/.test(b.textContent))`;
  await evaluate(`${saveButton}.click()`); await sleep(80);
  check('saving without a rating asks you to choose one', /Choose how you rate/.test(await text('.writing-after .status')), await text('.writing-after .status'));
  await evaluate(`document.getElementById('checklist-0').click(); document.getElementById('checklist-1').click(); document.getElementById('rating-good').click(); document.getElementById('writing-note').value = 'Shorter next time'`);
  await evaluate(`${saveButton}.click()`); await sleep(120);
  check('saving shows a confirmation and the history', /Saved\./.test(await text('.writing-after .status')) && /Your saved attempts/.test(await text('main')), await text('.writing-after .status'));
  const afterSave = await saved();
  const entry = afterSave?.writing?.history?.[0];
  check('the saved data has the attempt with rating, checklist and note', entry?.taskId === 'wr-01' && entry.rating === 'good' && entry.checklistDone === 2 && entry.note === 'Shorter next time' && entry.text === model, JSON.stringify(entry)?.slice(0, 120));

  // 7. Copy button gives a clear answer (clipboard may be blocked in a headless browser)
  await evaluate(`[...document.querySelectorAll('button')].find((b) => /Copy my text/.test(b.textContent)).click()`); await sleep(300);
  check('the copy button says what happened', /Copied|Could not copy/.test(await evaluate(`[...document.querySelectorAll('.status')].map((s) => s.textContent).join(' ')`)));

  // 8. A draft survives a refresh, and survives leaving the page very quickly
  await go(BASE + '?w2#/writing');
  await evaluate(`[...document.querySelectorAll('.lesson-list .card button')][1].click()`); await sleep(150);
  await evaluate(`document.getElementById('writing-text').focus()`);
  await typeIntoFocused('Hello Tom, I wrote this draft.');
  await sleep(900);                                   // the draft is saved after a short pause
  await go(BASE + '?w3#/writing');
  await evaluate(`[...document.querySelectorAll('.lesson-list .card button')][1].click()`); await sleep(150);
  check('a draft is still there after a refresh', (await evaluate(`document.getElementById('writing-text').value`)) === 'Hello Tom, I wrote this draft.');
  await evaluate(`document.getElementById('writing-text').focus()`);
  await typeIntoFocused('Quick change, then leave at once.');
  await evaluate(`location.hash = '#/'`); await sleep(300);   // leave within the 500 ms delay
  check('a draft is saved even when you leave at once', (await saved()).writing.drafts['wr-02']?.text === 'Quick change, then leave at once.');

  // 9. Dashboard and list reflect the work
  check('the dashboard has a Writing card with 1 of 8 done', /1 of 8 done/.test(await text('.stat-grid')) && /Writing/.test(await text('.stat-grid')), (await text('.stat-grid')).replace(/\s+/g, ' ').slice(0, 160));
  check('the dashboard counts the writing in the last 7 days', /1 writing saved/.test(await text('.stat-grid')));
  await go(BASE + '?w4#/writing');
  const cards = await evaluate(`[...document.querySelectorAll('.lesson-list .card .meta')].slice(0, 2).map((m) => m.textContent)`);
  check('the list shows Done + rating, and Draft saved', /Done/.test(cards[0]) && /Your rating: Good/.test(cards[0]) && /Draft saved/.test(cards[1]), cards.join(' || '));

  // 10. Phone width
  await go(BASE + '?w5#/writing', 360);
  await evaluate(`document.querySelector('.lesson-list .card button').click()`); await sleep(150);
  check('phone: no sideways scrolling on a task page', (await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1`)) === true);

  check('no uncaught errors', errors.length === 0, errors.join(' | ').slice(0, 200));
} catch (error) {
  results.push('ERROR ' + error.stack);
}
console.log(results.join('\n'));
ws.close();
edge.kill();
process.exit(0);
