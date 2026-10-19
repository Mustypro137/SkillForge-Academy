// Freelance academy check: real key presses and typing in Edge. Does a whole topic (lesson and quiz -> writing task -> roleplay),
// and checks the stage groups, reused items, the mistake notebook, the dashboard and the backup.
// Optional browser check. Needs Microsoft Edge and a local server on port 8771:
//   python -m http.server 8771      (in the project folder)
//   node tools/freelance-check.mjs
// Not part of 'npm test'. Re-run it after changes to the academy pages.

import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { freelanceLessons, freelanceTopics } from '../content/freelance/index.js';
import { findTask } from '../content/writing/index.js';
import { findScenario } from '../content/roleplay/index.js';
import { solutionText } from '../js/logic/answer-check.js';
import { bestOption } from '../js/logic/roleplay.js';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = 'http://localhost:8771/index.html';
const PORT = 9338;
const profile = mkdtempSync(join(tmpdir(), 'edge-freelance-'));
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
  const topic = freelanceTopics[0];
  const lesson = freelanceLessons[0];

  // 1. The hub, grouped in stages
  await go(BASE + '?fr1#/freelance');
  check('the Freelance page opens', (await text('h1')) === 'Freelance academy', await text('h1'));
  check('the topics are grouped under stage headings', JSON.stringify(await evaluate(`[...document.querySelectorAll('h2.stage-heading')].map((h) => h.textContent)`)) === JSON.stringify(['Start the job', 'Do the job', 'Finish the job']));
  check('the topic titles are level-3 headings under the stages', (await count('main h3')) === freelanceTopics.length);
  check('all topics and 3 steps each are listed', (await count('.lesson-list > .card')) === freelanceTopics.length && (await count('.step-row')) === freelanceTopics.length * 3);
  check('Tab reaches the lesson button of the first topic', await tabTo((a) => /^BUTTON:Open the lesson and quiz: Understand the brief/.test(a)), await active());
  await press('Enter'); await sleep(200);
  check('Enter opens the lesson page', (await text('h1')) === lesson.title, await text('h1'));

  // 2. The quiz
  await clickButton(/Start exercises/); await sleep(150);
  for (const exercise of lesson.exercises) await answer(exercise);
  check('the quiz gives 10 of 10 right on the first try', /^10 of 10 right on the first try/.test(await text('.score')), await text('.score'));
  await clickButton(/All topics/); await sleep(150);
  check('the topic shows 1 of 3 steps done, and Write is the next step', /1 of 3 steps done/.test(await text('.lesson-list > .card')) && /Not started · Next step/.test(await evaluate(`[...document.querySelectorAll('.lesson-list > .card:first-child .step-row')][1].textContent`)));

  // 3. A wrong answer goes to the mistake notebook
  const lesson2 = freelanceLessons[1];
  await clickByLabel(/Open the lesson and quiz: Pricing and quotes/); await sleep(150);
  await clickButton(/Start exercises/); await sleep(150);
  await answer(lesson2.exercises[0], true);
  const data = await saved();
  check('a wrong Freelance answer is saved in the mistake notebook', !!data.mistakes[`${lesson2.id}/${lesson2.exercises[0].id}`], Object.keys(data.mistakes).join(','));

  // 4. The writing task and the roleplay of the first topic
  await go(BASE + '?fr2#/freelance');
  await clickByLabel(/Open the writing task: Understand the brief/); await sleep(250);
  const task = findTask(topic.taskId);
  check('"Write" opens the right writing task', (await text('h1')) === task.title, await text('h1'));
  await evaluate(`document.getElementById('writing-text').focus()`);
  await typeIntoFocused(task.modelAnswers[0].text);
  await clickButton(/Check my text/); await sleep(100);
  check('the model questions email passes every automatic check', /^(\d+) of \1 checks are OK/.test(await text('.writing-results .score')), await text('.writing-results .score'));
  await evaluate(`document.getElementById('rating-good').click()`);
  await clickButton(/Save to my history/); await sleep(100);
  await go(BASE + '?fr3#/freelance');
  await clickByLabel(/Open the roleplay: Understand the brief/); await sleep(250);
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
  await go(BASE + '?fr4#/freelance');
  check('the first topic now says all 3 steps are done', /All 3 steps done/.test(await text('.lesson-list > .card')));

  // 5. Reused items open the existing writing task and roleplay
  const deadlines = freelanceTopics.find((t) => t.id === 'fr-deadlines');
  await clickByLabel(/Open the writing task: Deadlines and delays/); await sleep(250);
  check('the Deadlines topic opens the existing task wr-03', (await text('h1')) === findTask(deadlines.taskId).title && deadlines.taskId === 'wr-03', await text('h1'));
  await go(BASE + '?fr5#/freelance');
  await clickByLabel(/Open the roleplay: Pricing and quotes/); await sleep(250);
  check('the Pricing topic opens the existing roleplay rp-05', (await text('h1')) === findScenario('rp-05').title, await text('h1'));

  // 6. Dashboard and backup
  await go(BASE + '?fr6#/');
  const grid = (await text('.stat-grid')).replace(/\s+/g, ' ');
  check('the dashboard has a Freelance card: 1 of 5 topics done, 2 started', /Freelance academy1 of 5 topics done2 started/.test(grid), grid.slice(0, 300));
  check('the LinkedIn card is unchanged (0 of 5)', /LinkedIn academy0 of 5 topics done/.test(grid));
  const roundTrip = await evaluate(`(async () => { const mod = await import('/js/storage.js'); const out = mod.exportData(JSON.parse(localStorage.getItem('skillforge-data'))); const back = mod.parseImport(out.json); return back.ok ? [back.summary.lessons, back.summary.writings, back.summary.roleplays] : null; })()`);
  check('an exported backup keeps the Freelance lessons, writing and roleplay', JSON.stringify(roundTrip) === '[2,1,1]', JSON.stringify(roundTrip));

  // 7. The LinkedIn page still has no stage headings
  await go(BASE + '?fr7#/linkedin');
  check('the LinkedIn page (no stages) is unchanged: topic titles are level-2 headings', (await count('h2.stage-heading')) === 0 && (await count('.lesson-list > .card h2')) === 5);

  // 8. Phone width
  await go(BASE + '?fr8#/freelance', 360);
  check('phone: no sideways scrolling on the Freelance page', (await evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1`)) === true);
  check('phone: every step button is at least 44 px high', (await evaluate(`[...document.querySelectorAll('.step-row .button')].every((b) => b.getBoundingClientRect().height >= 43.5)`)) === true);

  check('no uncaught errors', errors.length === 0, errors.join(' | ').slice(0, 200));
} catch (error) {
  results.push('ERROR ' + error.stack);
}
console.log(results.join('\n'));
ws.close();
edge.kill();
process.exit(0);
