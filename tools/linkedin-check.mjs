// LinkedIn academy check: real key presses and typing in Edge. Does a whole topic:
// lesson and quiz -> writing task -> roleplay, and checks the hub, the mistake notebook, the dashboard and the backup.
// Optional browser check. Needs Microsoft Edge and a local server on port 8771:
//   python -m http.server 8771      (in the project folder)
//   node tools/linkedin-check.mjs
// Not part of 'npm test'. Re-run it after changes to the academy pages.

import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { linkedinLessons, linkedinTopics } from '../content/linkedin/index.js';
import { findTask } from '../content/writing/index.js';
import { findScenario } from '../content/roleplay/index.js';
import { solutionText } from '../js/logic/answer-check.js';
import { bestOption } from '../js/logic/roleplay.js';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = 'http://localhost:8771/index.html';
const PORT = 9337;
const profile = mkdtempSync(join(tmpdir(), 'edge-linkedin-'));
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
const active = () => evaluate(`(() => { const a = document.activeElement; return a.tagName + ':' + (a.getAttribute('aria-label') || a.textContent || a.id || '').trim().replace(/\\s+/g, ' ').slice(0, 70); })()`);
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
async function tabTo(predicate, limit = 60) {
  for (let i = 0; i < limit; i++) { if (predicate(await active())) return true; await press('Tab'); }
  return false;
}
async function typeIntoFocused(value) {
  await evaluate('document.activeElement.select && document.activeElement.select()');
  await send('Input.insertText', { text: value });
  await sleep(50);
}
const clickButton = (re) => evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((x) => ${re}.test(x.textContent) && !x.hidden); if (!b) return false; b.click(); return true; })()`);
const clickByLabel = (re) => evaluate(`(() => { const b = [...document.querySelectorAll('button')].find((x) => ${re}.test(x.getAttribute('aria-label') ?? '')); if (!b) return false; b.click(); return true; })()`);

// Answers one exercise of the lesson on screen. wrong: give a wrong answer (twice, to see the solution).
async function answer(exercise, wrong = false) {
  if (exercise.type === 'multiple-choice') {
    const index = wrong ? exercise.choices.findIndex((_, i) => i !== exercise.correct) : exercise.correct;
    await evaluate(`document.querySelectorAll('input[type=radio]')[${index}].click()`);
    await clickButton(/^Check$/); await sleep(60);
    if (wrong) {
      const second = exercise.choices.findIndex((_, i) => i !== exercise.correct && i !== index);
      await evaluate(`document.querySelectorAll('input[type=radio]')[${second}].click()`);
      await clickButton(/^Check$/); await sleep(60);
    }
  } else if (exercise.type === 'reorder') {
    const words = wrong ? [...exercise.words] : solutionText(exercise).split(' ');
    for (const w of words) await evaluate(`(() => { const b = [...document.querySelectorAll('.word-button')].find((x) => !x.disabled && x.textContent === ${JSON.stringify(w)}); b?.click(); })()`);
    await clickButton(/^Check$/); await sleep(60);
    if (wrong) { await clickButton(/Clear|Reset|Start again/); await clickButton(/^Check$/); await sleep(60); }
  } else {
    const tries = wrong ? ['zzz', 'qqq'] : [solutionText(exercise)];
    for (const t of tries) {
      await evaluate(`document.querySelector('.answer-input').focus()`);
      await typeIntoFocused(t);
      await clickButton(/^Check$/); await sleep(60);
    }
  }
  await clickButton(/Next question|See results/); await sleep(60);
}

try {
  await send('Page.enable'); await send('Runtime.enable');
  await go(BASE + '#/');
  await evaluate('localStorage.clear()');
  const topic = linkedinTopics[0];
  const lesson = linkedinLessons[0];

  // 1. The hub, with the keyboard
  await go(BASE + '?li1#/linkedin');
  check('the LinkedIn page opens', (await text('h1')) === 'LinkedIn academy', await text('h1'));
  check('5 topics are listed, each with 3 steps', (await count('.lesson-list > .card')) === 5 && (await count('.step-row')) === 15);
  check('the first topic says "0 of 3 steps done"', /0 of 3 steps done/.test(await text('.lesson-list > .card')));
  check('the next step of the first topic is the lesson', /Next step/.test(await text('.step-row')) && (await count('.step-row .step-status')) === 15);
  check('Tab reaches the lesson button of the first topic', await tabTo((a) => /^BUTTON:Open the lesson and quiz: Headline and About/.test(a)), await active());
  await press('Enter'); await sleep(200);
  check('Enter opens the lesson page', (await text('h1')) === lesson.title, await text('h1'));
  check('the lesson shows the explanation and 10 exercises', (await count('.lesson-text p')) === lesson.explanation.length && /10 exercises/.test(await text('.meta')));

  // 2. The quiz: all correct answers, then the results
  await clickButton(/Start exercises/); await sleep(150);
  for (const exercise of lesson.exercises) await answer(exercise);
  check('the results show 10 of 10 right on the first try', /^10 of 10 right on the first try/.test(await text('.score')), await text('.score'));
  check('the lesson is Mastered', /mastered this lesson/.test(await text('main')));
  check('the "All topics" button goes back to the hub', await clickButton(/All topics/));
  await sleep(150);
  check('the hub shows the lesson as Mastered and the writing task as the next step', /Mastered/.test(await text('.lesson-list > .card')) && /Not started · Next step/.test((await evaluate(`[...document.querySelectorAll('.lesson-list > .card:first-child .step-row')].map((r) => r.textContent).join(' | ')`))), (await evaluate(`[...document.querySelectorAll('.lesson-list > .card:first-child .step-row')].map((r) => r.textContent).join(' | ')`)).slice(0, 200));
  check('the first topic says "1 of 3 steps done"', /1 of 3 steps done/.test(await text('.lesson-list > .card')));

  // 3. A wrong answer in another LinkedIn lesson goes to the mistake notebook
  const lesson2 = linkedinLessons[1];
  await clickByLabel(/Open the lesson and quiz: Connection requests/); await sleep(150);
  await clickButton(/Start exercises/); await sleep(150);
  await answer(lesson2.exercises[0], true);
  const data = await saved();
  const key = `${lesson2.id}/${lesson2.exercises[0].id}`;
  check('a wrong LinkedIn answer is saved in the mistake notebook', !!data.mistakes[key], Object.keys(data.mistakes).join(','));
  await go(BASE + '?li2#/mistakes');
  check('the notebook counts it (new mistakes are due tomorrow, so it is under All mistakes)', /All mistakes \(1\)/.test(await text('.tabs')), (await text('.tabs')).replace(/\s+/g, ' '));
  await clickButton(/All mistakes/); await sleep(100);
  check('the notebook card shows the LinkedIn lesson', /connection/i.test(await text('.mistake-list')), (await text('.mistake-list')).replace(/\s+/g, ' ').slice(0, 120));

  // 4. The writing task opens from the hub
  await go(BASE + '?li3#/linkedin');
  await clickByLabel(/Open the writing task: Headline and About/); await sleep(250);
  const task = findTask(topic.taskId);
  check('"Write" opens the right writing task', (await text('h1')) === task.title, await text('h1'));
  await evaluate(`document.getElementById('writing-text').focus()`);
  await typeIntoFocused(task.modelAnswers[0].text);
  await clickButton(/Check my text/); await sleep(100);
  check('the model About text passes every automatic check', /^(\d+) of \1 checks are OK/.test(await text('.writing-results .score')), await text('.writing-results .score'));
  await evaluate(`document.getElementById('rating-good').click()`);
  await clickButton(/Save to my history/); await sleep(100);
  await go(BASE + '?li4#/linkedin');
  check('the hub shows the writing step as Done and the roleplay as next', /2 of 3 steps done/.test(await text('.lesson-list > .card')) && /Next step/.test(await evaluate(`[...document.querySelectorAll('.lesson-list > .card:first-child .step-row')][2].textContent`)));

  // 5. The roleplay opens from the hub, and a whole conversation is played
  await clickByLabel(/Open the roleplay: Headline and About/); await sleep(250);
  const scenario = findScenario(topic.scenarioId);
  check('"Talk" opens the right roleplay', (await text('h1')) === scenario.title, await text('h1'));
  await clickButton(/Start the conversation/); await sleep(150);
  let step = scenario.steps[scenario.start];
  for (let guard = 0; guard < 20 && !step.end; guard++) {
    if (step.write) {
      await evaluate(`document.getElementById('rp-text').focus()`);
      await typeIntoFocused(step.write.model.text);
      await clickButton(/Check my reply/); await sleep(80);
      await evaluate(`document.querySelector('.writing-after input[type=radio]').click()`);
      await clickButton(/Send my reply/); await sleep(80);
      step = scenario.steps[step.write.next];
    } else {
      const option = bestOption(step);
      await evaluate(`[...document.querySelectorAll('.reply-option')].find((x) => x.textContent === ${JSON.stringify(option.text)}).click()`); await sleep(60);
      await clickButton(/^Continue$/); await sleep(60);
      step = scenario.steps[option.next];
    }
  }
  check('the conversation ends with 100%', /^100% of the points/.test(await text('.turn .score')), await text('.turn .score'));
  await go(BASE + '?li5#/linkedin');
  check('the first topic now says all 3 steps are done', /All 3 steps done/.test(await text('.lesson-list > .card')), (await text('.lesson-list > .card')).replace(/\s+/g, ' ').slice(0, 120));

  // 6. The dashboard and the backup
  await go(BASE + '?li6#/');
  const grid = (await text('.stat-grid')).replace(/\s+/g, ' ');
  check('the dashboard has a LinkedIn card: 1 of 5 topics done, 2 started', /LinkedIn academy1 of 5 topics done2 started/.test(grid), grid.slice(0, 260));
  check('the Lessons card still counts only the grammar lessons', /Lessons0 of 3 done/.test(grid));
  const roundTrip = await evaluate(`(async () => { const mod = await import('/js/storage.js'); const out = mod.exportData(JSON.parse(localStorage.getItem('skillforge-data'))); const back = mod.parseImport(out.json); return back.ok ? [back.summary.lessons, back.summary.writings, back.summary.roleplays] : null; })()`);
  check('an exported backup keeps the LinkedIn lesson, writing and roleplay', JSON.stringify(roundTrip) === '[2,1,1]', JSON.stringify(roundTrip));

  // 7. The connection note has a character limit
  await go(BASE + '?li7#/writing');
  await clickByLabel(/Open task: Write a connection note/); await sleep(200);
  await evaluate(`document.getElementById('writing-text').focus()`);
  await typeIntoFocused(`Hi Maria,\n${'I read your post about hiring junior developers. '.repeat(6)}\nThanks,\nSam`);
  await clickButton(/Check my text/); await sleep(100);
  const chars = await evaluate(`[...document.querySelectorAll('.check-item')].find((i) => /characters or fewer/.test(i.textContent))?.textContent ?? ''`);
  check('a connection note over 200 characters gets a "Look at this" with the number to remove', /Look at this/.test(chars) && /Remove \d+ characters/.test(chars), chars.slice(0, 120));

  // 8. Phone width
  await go(BASE + '?li8#/linkedin', 360);
  check('phone: no sideways scrolling on the LinkedIn page', (await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1`)) === true);
  check('phone: every step button is at least 44 px high', (await evaluate(`[...document.querySelectorAll('.step-row .button')].every((b) => b.getBoundingClientRect().height >= 43.5)`)) === true);

  check('no uncaught errors', errors.length === 0, errors.join(' | ').slice(0, 200));
} catch (error) {
  results.push('ERROR ' + error.stack);
}
console.log(results.join('\n'));
ws.close();
edge.kill();
process.exit(0);
