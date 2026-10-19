// Roleplay page check: real key presses and typing in Edge, full conversations from start to summary.
// Optional browser check. Needs Microsoft Edge and a local server on port 8771:
//   python -m http.server 8771      (in the project folder)
//   node tools/roleplay-check.mjs
// Not part of 'npm test'. Re-run it after changes to the roleplay page.

import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { roleplayScenarios } from '../content/roleplay/index.js';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = 'http://localhost:8771/index.html';
const PORT = 9336;
const profile = mkdtempSync(join(tmpdir(), 'edge-roleplay-'));
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
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.result.value;

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
const active = () => evaluate(`(() => { const a = document.activeElement; return a.tagName + ':' + (a.textContent || a.id || '').trim().replace(/\\s+/g, ' ').slice(0, 60); })()`);
const text = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent ?? ''`);
const count = (selector) => evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length`);
const saved = () => evaluate(`JSON.parse(localStorage.getItem('skillforge-data') ?? 'null')`);
async function go(url, width = 1366) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await sleep(300);
  for (let i = 0; i < 40; i++) {                // wait until the app has drawn the page (slow first load)
    if (await evaluate(`!!document.querySelector('main h1, main p.note')`)) break;
    await sleep(150);
  }
  await sleep(200);
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
const clickButton = (re) => evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((x) => ${re}.test(x.textContent) && !x.hidden); if (!b) return false; b.click(); return true; })()`);
const clickReply = (replyText) => evaluate(`(() => { const b = [...document.querySelectorAll('.reply-option')].find((x) => x.textContent === ${JSON.stringify(replyText)}); if (!b) return false; b.click(); return true; })()`);

const scenario = roleplayScenarios[0];     // rp-01

// Plays the current scenario to the end. choose(step) returns the option to pick; badText is the free reply.
async function playThrough(pick, replyText) {
  let step = scenario.steps[scenario.start];
  for (let guard = 0; guard < 20; guard++) {
    if (step.end) break;
    if (step.write) {
      await evaluate(`document.getElementById('rp-text').focus()`);
      await typeIntoFocused(replyText);
      await clickButton(/Check my reply/); await sleep(80);
      await evaluate(`document.querySelector('.writing-after input[type=radio]').click()`);
      await clickButton(/Send my reply/); await sleep(80);
      step = scenario.steps[step.write.next];
    } else {
      const option = pick(step);
      const ok = await clickReply(option.text);
      if (!ok) throw new Error(`reply not found on screen: ${option.text.slice(0, 40)}`);
      await sleep(60);
      await clickButton(/^Continue$/); await sleep(60);
      step = scenario.steps[option.next];
    }
  }
}
const best = (step) => step.options.find((o) => o.rating === 'best');
const weakest = (step) => step.options.find((o) => o.rating === 'weak') ?? step.options[0];

try {
  await send('Page.enable'); await send('Runtime.enable');
  await go(BASE + '#/');
  await evaluate('localStorage.clear()');

  // 1. Version 2 data (before roleplay existed) still loads, and the page opens with all scenarios
  await evaluate(`localStorage.setItem('skillforge-data', JSON.stringify({ app: 'skillforge', schemaVersion: 2, createdAt: new Date().toISOString(), lastBackupAt: null, settings: { theme: 'system', fontSize: 18, showComingSoon: true }, progress: {}, attempts: [], mistakes: {}, writing: { drafts: {}, history: [] } }))`);
  await go(BASE + '?r1#/roleplay');
  check('version 2 data: the Roleplay page opens', /Roleplay/.test(await text('h1')), await text('h1'));
  check('the list shows all scenarios, not started', (await count('.lesson-list .card')) === roleplayScenarios.length && /Not started/.test(await text('.lesson-list .card .meta')));

  // 2. Open the first scenario and start, keyboard only
  check('Tab reaches "Open scenario"', await tabTo((a) => /^BUTTON:Open scenario/.test(a)));
  await press('Enter'); await sleep(150);
  check('the intro shows the title and the situation', (await text('h1')) === scenario.title && (await text('main')).includes('Ms. Rivera'), await text('h1'));
  check('Tab reaches "Start the conversation"', await tabTo((a) => /Start the conversation/.test(a)));
  await press('Enter'); await sleep(150);
  check('the other person\'s first message is in the chat', (await text('.chat')).includes(scenario.steps.s1.say[0]));
  check('three replies are offered, and focus is on the heading', (await count('.reply-option')) === 3 && /^H2:Choose your reply/.test(await active()), await active());

  // 3. Choose with the keyboard and read the feedback
  await press('Tab');
  check('Tab moves to the first reply', /^BUTTON:/.test(await active()));
  const chosenText = await evaluate('document.activeElement.textContent');
  await press('Enter'); await sleep(100);
  check('your reply appears in the chat on your side', (await evaluate(`[...document.querySelectorAll('.bubble-you p')].map((p) => p.textContent)`)).includes(chosenText));
  check('feedback shows all three replies, one of each rating', /Best/.test(await text('.reply-feedback')) && /OK/.test(await text('.reply-feedback')) && /Weak/.test(await text('.reply-feedback')) && (await count('.reply-feedback li')) === 3);
  check('exactly one reply is marked as yours', (await count('.reply-feedback .is-chosen')) === 1);
  check('the other person reacts', (await count('.bubble-them')) >= 2);
  check('focus is on the feedback heading', /^H2:Your reply was/.test(await active()), await active());

  // 4. The order of the replies changes between games
  const firstReplies = new Set();
  for (let i = 0; i < 8; i++) {
    await go(BASE + '?order' + i + '#/roleplay');
    await clickButton(/Open scenario|Play again/); await sleep(80);
    await clickButton(/Start the conversation/); await sleep(80);
    firstReplies.add(await evaluate(`document.querySelector('.reply-option').textContent`));
  }
  check('the replies are in a different order in different games', firstReplies.size >= 2, `${firstReplies.size} different first replies in 8 games`);

  // 5. Leaving in the middle does not save a result
  check('a conversation left in the middle is not saved', Object.keys((await saved()).roleplay?.results ?? {}).length === 0);

  // 6. A whole conversation with only Best replies
  await go(BASE + '?best#/roleplay');
  await clickButton(/Open scenario/); await sleep(80);
  await clickButton(/Start the conversation/); await sleep(80);
  const model = scenario.steps.s3.write.model.text;
  await playThrough(best, model);
  check('the summary appears', /Conversation finished/.test(await text('.turn h2')), await text('.turn h2'));
  check('only Best replies give 100%', /^100% of the points/.test(await text('.turn .score')) && /3 Best, 0 OK and 0 Weak/.test(await text('.turn')), (await text('.turn .score')));
  check('no "To improve" list when everything was Best', (await count('.improve-list')) === 0);
  check('the free reply rating is shown', /Your own rating of your free reply/.test(await text('.turn')));
  let data = await saved();
  check('the result is saved', data.roleplay.results['rp-01'].bestPercent === 100 && data.roleplay.results['rp-01'].runs === 1 && data.roleplay.log.length === 1);

  // 7. A whole conversation with weak replies and a bad free reply
  await clickButton(/Play again/); await sleep(100);
  await playThrough(weakest, 'HEY!! send it NOW');
  check('weak replies give a low result', /^(\d+)% of the points/.test(await text('.turn .score')) && Number((await text('.turn .score')).match(/^(\d+)%/)[1]) < 50, await text('.turn .score'));
  check('"To improve" lists what they said, what you said, why and the better reply', (await count('.improve-list li')) >= 3 && /They said/.test(await text('.improve-list')) && /Better:/.test(await text('.improve-list')));
  check('the best result before this game is shown', /Your best result before this game: 100%/.test(await text('.turn')));
  data = await saved();
  check('the best result stays 100% and the run count is 2', data.roleplay.results['rp-01'].bestPercent === 100 && data.roleplay.results['rp-01'].runs === 2 && data.roleplay.results['rp-01'].lastPercent < 50);

  // 8. Dashboard and list
  await go(BASE + '?dash#/');
  const grid = (await text('.stat-grid')).replace(/\s+/g, ' ');
  check(`the dashboard has a Roleplay card: 1 of ${roleplayScenarios.length} done, 1 strong`, new RegExp(`Roleplay1 of ${roleplayScenarios.length} done1 with a best result of 80% or more`).test(grid), grid.slice(0, 200));
  check('the dashboard counts 2 conversations in the last 7 days', /2 conversations finished/.test(grid));
  await go(BASE + '?list#/roleplay');
  check('the list shows Done and the best result', /Done · Best result: 100%/.test(await text('.lesson-list .card .meta')), await text('.lesson-list .card .meta'));

  // 9. Backup: export keeps the roleplay data
  const exported = await evaluate(`(async () => { const mod = await import('/js/storage.js'); const out = mod.exportData(JSON.parse(localStorage.getItem('skillforge-data'))); const back = mod.parseImport(out.json); return back.ok ? back.summary.roleplays : -1; })()`);
  check('an exported backup can be imported again, with the roleplay result', exported === 1, String(exported));

  // 10. Phone width
  await go(BASE + '?phone#/roleplay', 360);
  await clickButton(/Open scenario|Play again/); await sleep(80);
  await clickButton(/Start the conversation/); await sleep(80);
  await evaluate(`document.querySelector('.reply-option').click()`); await sleep(80);
  check('phone: no sideways scrolling in a conversation', (await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1`)) === true);

  check('no uncaught errors', errors.length === 0, errors.join(' | ').slice(0, 200));
} catch (error) {
  results.push('ERROR ' + error.stack);
}
console.log(results.join('\n'));
ws.close();
edge.kill();
process.exit(0);
