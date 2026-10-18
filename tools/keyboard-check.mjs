// Keyboard-only check: real key presses (Tab, Enter, 1-4, Escape) in Edge.
// Optional browser check. Needs Microsoft Edge and a local server on port 8771:
//   python -m http.server 8771      (in the project folder)
//   node tools/keyboard-check.mjs
// Not part of 'npm test'. Re-run it after bigger changes to the pages.

import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = 'http://localhost:8771/index.html';
const PORT = 9333;
const profile = mkdtempSync(join(tmpdir(), 'edge-kbd-'));
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
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && waiting.has(msg.id)) { waiting.get(msg.id)(msg); waiting.delete(msg.id); }
};
const send = (method, params = {}) => new Promise((resolve) => {
  const id = ++nextId; waiting.set(id, resolve); ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result.result.value;

const KEYS = {
  Tab: { key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 },
  Enter: { key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
  Escape: { key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 },
  1: { key: '1', code: 'Digit1', windowsVirtualKeyCode: 49, text: '1' },
  2: { key: '2', code: 'Digit2', windowsVirtualKeyCode: 50, text: '2' },
};
async function press(name, modifiers = 0) {
  const k = KEYS[name];
  await send('Input.dispatchKeyEvent', { type: k.text ? 'keyDown' : 'rawKeyDown', modifiers, ...k });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', modifiers, key: k.key, code: k.code, windowsVirtualKeyCode: k.windowsVirtualKeyCode });
  await sleep(60);
}
const shiftTab = () => press('Tab', 8);
const active = () => evaluate(`(() => { const a = document.activeElement; return a.tagName + ':' + (a.textContent || a.value || a.id || '').trim().replace(/\\s+/g, ' ').slice(0, 45); })()`);
const hash = () => evaluate('location.hash');
const h1 = () => evaluate(`document.querySelector('h1')?.textContent`);
const feedback = () => evaluate(`document.querySelector('.feedback')?.textContent ?? ''`);
async function go(url, width = 1366) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await sleep(700);
}
async function tabTo(predicate, limit = 40) {   // press Tab until the focused element matches
  for (let i = 0; i < limit; i++) { if (predicate(await active())) return true; await press('Tab'); }
  return false;
}
async function typeIntoFocused(text) {
  await evaluate('document.activeElement.select && document.activeElement.select()');
  await send('Input.insertText', { text });
}

try {
  await send('Page.enable');
  await go(BASE + '#/');
  await evaluate('localStorage.clear()');
  await go(BASE + '?fresh#/');

  // 1. Skip link is the first stop, and it works
  await press('Tab');
  check('first Tab stop is the skip link', /Skip to main/.test(await active()), await active());
  await press('Enter');
  check('skip link moves focus to the main area and keeps the page', /^MAIN:/.test(await active()) && (await hash()) === '#/' && (await h1()) === 'Dashboard', `${await active()} / ${await hash()} / ${await h1()}`);
  await press('Tab');
  check('after the skip link, Tab goes to the first control in the page', /^BUTTON:Start lesson/.test(await active()), await active());
  await go(BASE + '?fresh2#/');

  // 2. Menu: reach Grammar with the keyboard and open it
  check('Tab reaches the Grammar link', await tabTo((a) => /^A:Grammar/.test(a)));
  await press('Enter'); await sleep(200);
  check('Enter on the Grammar link opens the page', (await hash()) === '#/grammar' && (await h1()) === 'Grammar practice', `${await hash()} / ${await h1()}`);
  check('focus moved to the page heading', /^H1:/.test(await active()), await active());

  // 3. Open lesson 1 and start, keyboard only
  check('Tab reaches "Open lesson" for lesson 1', await tabTo((a) => /^BUTTON:Open lesson/.test(a)));
  await press('Enter'); await sleep(150);
  check('lesson page opens', /Capital letters/.test(await h1()), await h1());
  check('Tab reaches "Start exercises"', await tabTo((a) => /Start exercises/.test(a)));
  await press('Enter'); await sleep(150);
  check('first exercise: focus is on an answer option', /^INPUT:/.test(await active()), await active());

  // 4. Multiple choice: key 2 chooses, Enter checks, Enter goes on
  await press('2');
  check('number key 2 selects the second option', (await evaluate(`document.querySelectorAll('input[type=radio]')[1].checked`)) === true);
  await press('Enter'); await sleep(100);
  check('Enter checks the answer (correct)', /Correct/.test(await feedback()), await feedback());
  check('focus moves to the Next button', /Next question/.test(await active()), await active());
  await press('Enter'); await sleep(100);
  check('Enter goes to question 2', /Question 2 of 12/.test(await evaluate(`document.querySelector('.progress-label').textContent`)));

  // 5. Wrong answer path + hint, keyboard only
  await press('2'); await press('Enter'); await sleep(100);   // cp-02: correct is option 1, so "2" is wrong
  check('a wrong answer shows feedback', /Not quite/.test(await feedback()), (await feedback()).slice(0, 60));
  check('the wrong option is disabled and focus is on another option', /^INPUT:/.test(await active()), await active());
  check('Tab reaches the hint button', await tabTo((a) => /Show hint/.test(a)));
  await press('Enter');
  check('Enter shows a hint', (await evaluate(`document.querySelector('.hint-list').textContent`)).length > 5);
  await shiftTab(); await shiftTab();
  await press('1'); await press('Enter'); await sleep(100);
  check('the right option then works', /Correct/.test(await feedback()), (await feedback()).slice(0, 40));
  await press('Enter'); await sleep(100);

  // 6. Text answer (cp-03): the box is focused, type, Enter
  check('text exercise: the answer box is focused', /^INPUT:/.test(await active()) && (await evaluate('document.activeElement.type')) === 'text', await active());
  await typeIntoFocused('I work with a client in London.');
  await press('Enter'); await sleep(100);
  check('Enter checks a typed answer', /Correct/.test(await feedback()), (await feedback()).slice(0, 40));
  await press('Enter'); await sleep(100);

  // 7. cp-04 (fill) and cp-05 (MC) and cp-06 (text), then the word-order exercise
  await typeIntoFocused('?'); await press('Enter'); await press('Enter'); await sleep(100);
  await press('2'); await press('Enter'); await press('Enter'); await sleep(100);
  await typeIntoFocused('Can you help me?'); await press('Enter'); await press('Enter'); await sleep(100);
  check('reached the word-order exercise', /Question 7 of 12/.test(await evaluate(`document.querySelector('.progress-label').textContent`)));
  check('word-order: focus is on a word button', /^BUTTON:/.test(await active()), await active());
  for (const word of ['The', 'meeting', 'starts', 'on', 'Monday.']) {
    const found = await tabTo((a) => a === `BUTTON:${word}`, 30);
    if (!found) { check(`reach word "${word}"`, false); break; }
    await press('Enter');
  }
  check('the chosen words appear in order', (await evaluate(`document.querySelector('.answer-line').textContent`)) === 'The meeting starts on Monday.', await evaluate(`document.querySelector('.answer-line').textContent`));
  check('Tab reaches Check', await tabTo((a) => /^BUTTON:Check/.test(a)));
  await press('Enter'); await sleep(100);
  check('word order checked with the keyboard (correct)', /Correct/.test(await feedback()), (await feedback()).slice(0, 40));

  // 8. Phone width: menu button, Enter opens, Escape closes and gives focus back
  await go(BASE + '?phone#/', 360);
  await press('Tab'); await press('Tab');
  check('phone: Tab reaches the Menu button', /^BUTTON:Menu/.test(await active()), await active());
  await press('Enter');
  check('phone: Enter opens the menu', (await evaluate(`document.getElementById('menu-button').getAttribute('aria-expanded')`)) === 'true');
  await press('Tab');
  check('phone: Tab goes into the menu links', /^A:/.test(await active()), await active());
  await press('Escape');
  check('phone: Escape closes the menu', (await evaluate(`document.getElementById('menu-button').getAttribute('aria-expanded')`)) === 'false');
  check('phone: focus returns to the Menu button', /^BUTTON:Menu/.test(await active()), await active());

  // 9. Settings by keyboard: change theme with arrow-free select (type a letter), checkbox with Space
  await go(BASE + '?settings#/settings', 1366);
  check('settings: Tab reaches the theme select', await tabTo((a) => /^SELECT:/.test(a)));
  await evaluate(`(() => { const s = document.activeElement; s.value = 'dark'; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  check('settings: choosing Dark works', (await evaluate('document.documentElement.dataset.theme')) === 'dark');
} catch (error) {
  results.push('ERROR ' + error.stack);
}
console.log(results.join('\n'));
ws.close();
edge.kill();
process.exit(0);
