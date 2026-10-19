// Progress reports check: the empty state, the numbers, the calendar and the three charts.
// Optional browser check. Needs Microsoft Edge and a local server on port 8771:
//   python -m http.server 8771      (in the project folder)
//   node tools/reports-check.mjs
// Not part of 'npm test'. Re-run it after changes to the reports page or its logic.

import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = 'http://localhost:8771/index.html';
const PORT = 9339;
const profile = mkdtempSync(join(tmpdir(), 'edge-reports-'));
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
const text = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent ?? ''`);
const count = (selector) => evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length`);
const card = (title) => evaluate(`[...document.querySelectorAll('.stat')].find((c) => c.querySelector('h2')?.textContent === ${JSON.stringify(title)})?.textContent.replace(/\\s+/g, ' ').trim() ?? ''`);

async function go(url, width = 1366) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await sleep(300);
  for (let i = 0; i < 60; i++) {
    if (await evaluate(`!!document.querySelector('main h1')`)) break;
    await sleep(150);
  }
  await sleep(150);
}

const pad = (n) => String(n).padStart(2, '0');
const dateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const daysAgo = (days, hour = 10) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days, hour, 0).toISOString();
};

try {
  await send('Page.enable');
  await send('Runtime.enable');

  // ----- 1. No data: friendly empty text instead of broken charts -----
  await go(BASE + '?rep0#/');
  await evaluate(`localStorage.clear()`);
  await go(BASE + '?rep1#/reports');
  check('the page opens', (await text('main h1')) === 'Progress reports');
  check('no data: the friendly note is shown', /No practice data yet/.test(await text('main')));
  check('no data: no empty charts are drawn', (await count('.report-chart')) === 0);
  check('no data: the answers card says 0', /^Answers \(all time\)0/.test(await card('Answers (all time)')), await card('Answers (all time)'));
  check('no data: the calendar still has 5 complete weeks', (await count('.practice-calendar tbody tr')) === 5 && (await count('.practice-calendar tbody td')) === 35);
  check('no data: no NaN anywhere on the page', !/NaN|undefined|Infinity/.test(await text('main')));

  // ----- 2. Seed realistic data: 10 answers, 2 writings, 2 roleplays, 3 mistakes -----
  const data = {
    app: 'skillforge', schemaVersion: 3, createdAt: daysAgo(40), lastBackupAt: null,
    settings: { theme: 'system', fontSize: 18, showComingSoon: true },
    progress: {},
    attempts: [
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-01', at: daysAgo(0, 9), firstTry: true, review: false },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-01', at: daysAgo(0, 9), firstTry: true, review: true },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-06', at: daysAgo(0, 10), firstTry: false, review: false },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-01', at: daysAgo(0, 11), firstTry: true, review: false },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-06', at: daysAgo(1, 9), firstTry: true, review: false },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-01', at: daysAgo(1, 10), firstTry: false, review: false },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-06', at: daysAgo(3, 9), firstTry: false, review: true },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-01', at: daysAgo(3, 10), firstTry: false, review: false },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-01', at: daysAgo(10, 9), firstTry: true, review: false },
      { lessonId: 'grammar-present-simple', exerciseId: 'ps-06', at: daysAgo(10, 10), firstTry: false, review: false },
    ],
    mistakes: {
      'grammar-present-simple/ps-02': {
        lessonId: 'grammar-present-simple', exerciseId: 'ps-02', lastWrongAnswer: 'go', timesWrong: 1, box: 2,
        dueDate: dateString(new Date()), status: 'active', note: '', createdAt: daysAgo(3), lastWrongAt: daysAgo(3), lastReviewedAt: null,
      },
      'grammar-present-simple/ps-03': {
        lessonId: 'grammar-present-simple', exerciseId: 'ps-03', lastWrongAnswer: 'go', timesWrong: 1, box: 2,
        dueDate: dateString(new Date(Date.now() + 2 * 86400000)), status: 'active', note: '', createdAt: daysAgo(1), lastWrongAt: daysAgo(1), lastReviewedAt: null,
      },
      'grammar-present-simple/ps-04': {
        lessonId: 'grammar-present-simple', exerciseId: 'ps-04', lastWrongAnswer: 'go', timesWrong: 2, box: 5,
        dueDate: null, status: 'mastered', note: '', createdAt: daysAgo(20), lastWrongAt: daysAgo(20), lastReviewedAt: daysAgo(2),
      },
    },
    writing: {
      drafts: {},
      history: [
        { id: 'w1', taskId: 'wr-01', text: 'A short update.', wordCount: 3, checksPassed: 5, checksTotal: 8, checklistDone: 2, checklistTotal: 3, rating: 'good', note: '', at: daysAgo(1, 12) },
        { id: 'w2', taskId: 'wr-02', text: 'Another short update.', wordCount: 4, checksPassed: 6, checksTotal: 8, checklistDone: 3, checklistTotal: 3, rating: 'great', note: '', at: daysAgo(0, 12) },
      ],
    },
    roleplay: {
      results: {},
      log: [
        { scenarioId: 'rp-01', at: daysAgo(1, 13), percent: 100 },
        { scenarioId: 'rp-02', at: daysAgo(17, 13), percent: 60 },
      ],
    },
  };
  await evaluate(`localStorage.setItem('skillforge-data', ${JSON.stringify(JSON.stringify(data))})`);
  await go(BASE + '?rep2#/reports');

  // ----- 3. The stat cards match the saved data -----
  const answersCard = await card('Answers (all time)');
  check('answers: the all-time total is 10', /Answers \(all time\)10/.test(answersCard), answersCard);
  check('answers: first-try accuracy is 50%', /50% right on the first try/.test(answersCard), answersCard);
  check('answers: practice days count answers, writings and conversations', /5 days of practice/.test(answersCard), answersCard);
  const mistakesCard = await card('Mistakes');
  check('mistakes: 1 mastered, 2 active, 1 due today', /1 mastered/.test(mistakesCard) && /2 still active/.test(mistakesCard) && /1 due today/.test(mistakesCard), mistakesCard);
  const writingCard = await card('Writing and roleplay');
  check('writing and roleplay: 2 writings and 2 conversations', /2 writings/.test(writingCard) && /2 conversations finished/.test(writingCard), writingCard);
  check('lessons: the card is filled in', /0 of \d+ done/.test(await card('Lessons')), await card('Lessons'));

  // ----- 4. The practice calendar marks the right days -----
  check('calendar: 5 weeks and 35 day cells', (await count('.practice-calendar tbody tr')) === 5 && (await count('.practice-calendar tbody td')) === 35);
  check('calendar: today is filled', (await evaluate(`(() => { const cells = [...document.querySelectorAll('.calendar-day')]; const today = new Date(); const key = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'); return cells.some((c) => c.getAttribute('aria-label')?.startsWith(key + ':') && c.classList.contains('active')); })()`)) === true);
  const todayLabel = await evaluate(`(() => { const today = new Date(); const key = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'); return [...document.querySelectorAll('.calendar-day')].find((c) => c.getAttribute('aria-label')?.startsWith(key + ':'))?.getAttribute('aria-label') ?? ''; })()`);
  check('calendar: today shows 4 answers, 1 writing and 0 conversations', /4 answers, 1 writing, 0 conversations/.test(todayLabel), todayLabel);
  check('calendar: future days are marked', (await count('.calendar-day.future')) > 0);

  // ----- 5. The three charts have bars, values and screen-reader text -----
  const chartCount = await count('.report-chart');
  check('three charts are drawn', chartCount === 3, String(chartCount));
  check('every chart has a title and a description', (await evaluate(`[...document.querySelectorAll('.report-chart')].every((s) => s.getAttribute('role') === 'img' && s.querySelector('title')?.textContent && s.querySelector('desc')?.textContent)`)) === true);
  const activityTitles = await evaluate(`[...document.querySelectorAll('[aria-labelledby="activity-chart-title activity-chart-desc"] rect title')].map((t) => t.textContent)`);
  check('the 14-day chart has one bar per day', activityTitles.length === 14, String(activityTitles.length));
  check('the 14-day chart counts today: 4 answers, 1 writing, 0 conversations', activityTitles.some((t) => /4 answers, 1 writing, 0 conversations/.test(t)), activityTitles.at(-1));
  const accuracyTitles = await evaluate(`[...document.querySelectorAll('[aria-labelledby="accuracy-chart-title accuracy-chart-desc"] rect title')].map((t) => t.textContent)`);
  check('the weekly accuracy chart has 8 weeks', accuracyTitles.length === 8, String(accuracyTitles.length));
  check('the newest week is 8 answers with 4 right (50%)', accuracyTitles.some((t) => /4 of 8 right on the first try \(50%\)/.test(t)), accuracyTitles.at(-1));
  const reviewTitles = await evaluate(`[...document.querySelectorAll('[aria-labelledby="review-chart-title review-chart-desc"] rect title')].map((t) => t.textContent)`);
  check('the review chart counts 1 of 2 review answers right this week', reviewTitles.some((t) => /1 right out of 2 review answers/.test(t)), reviewTitles.at(-1));

  // ----- 6. Accuracy by skill, lowest first -----
  const skills = await evaluate(`[...document.querySelectorAll('.skill-report > li')].map((li) => li.textContent.replace(/\\s+/g, ' ').trim())`);
  check('three skills are listed', skills.length === 3, skills.join(' | '));
  check('skills are lowest accuracy first', /Questions \(do, does\).*25%/i.test(skills[0]) && /Present simple.*50%/.test(skills[1]) && /Verb endings.*67%/.test(skills[2]), skills.join(' | '));
  check('each skill bar has a text label for screen readers', (await evaluate(`[...document.querySelectorAll('.skill-bar')].every((b) => /% right on the first try/.test(b.getAttribute('aria-label') ?? '')) `)) === true);
  check('the page has no NaN or broken text', !/NaN|undefined|Infinity/.test(await text('main')));

  // ----- 7. Phone width: no sideways scrolling outside the calendar wrapper -----
  await go(BASE + '?rep3#/reports', 360);
  check('phone: the page does not scroll sideways', (await evaluate(`document.documentElement.scrollWidth <= window.innerWidth + 1`)) === true, `scrollWidth ${await evaluate('document.documentElement.scrollWidth')} / ${await evaluate('window.innerWidth')}`);
  check('phone: the charts fit the screen', (await evaluate(`[...document.querySelectorAll('.report-chart')].every((s) => s.getBoundingClientRect().width <= window.innerWidth)`)) === true);
  check('phone: the numbers and charts are still there', /50% right on the first try/.test(await card('Answers (all time)')) && (await count('.report-chart')) === 3);

  check('no uncaught errors', errors.length === 0, errors.join(' | ').slice(0, 200));
} catch (error) {
  results.push('ERROR ' + error.stack);
}
console.log(results.join('\n'));
ws.close();
edge.kill();
process.exit(0);
