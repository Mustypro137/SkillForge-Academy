// Typing practice page: setup screen -> test screen -> results screen.
// The calculations are in js/logic/typing-stats.js. This file only builds the
// screens and connects keyboard events to those functions.

import { el } from '../ui/dom.js';
import { categories, typingTexts } from '../../content/typing-texts.js';
import { buildTarget } from '../logic/typing-target.js';
import { computeStats, trackInput, topMissedKeys } from '../logic/typing-stats.js';

const CHARS_PER_SECOND = 12; // timed texts are long enough for about 144 WPM

// Remembered while you stay on the page.
const choice = { mode: 'timed', seconds: 60, category: 'sentences' };

export function render(container) {
  showSetup(container);
}

// ---------- Setup screen ----------

function option(value, label, selected) {
  return el('option', { value, selected }, label);
}

function field(id, labelText, select) {
  return el('div', { class: 'field' }, el('label', { for: id }, labelText), select);
}

function showSetup(container) {
  const mode = el('select', { id: 'ty-mode' },
    option('timed', 'Timed', choice.mode === 'timed'),
    option('untimed', 'Untimed (one text, no time limit)', choice.mode === 'untimed'));

  const seconds = el('select', { id: 'ty-seconds', disabled: choice.mode === 'untimed' },
    ...[30, 60, 120].map((s) => option(String(s), `${s} seconds`, choice.seconds === s)));

  const category = el('select', { id: 'ty-category' },
    ...categories.map((c) => option(c.id, c.label, choice.category === c.id)));

  mode.addEventListener('change', () => { seconds.disabled = mode.value === 'untimed'; });

  const form = el('form', {},
    field('ty-mode', 'Mode', mode),
    field('ty-seconds', 'Time', seconds),
    field('ty-category', 'Text type', category),
    el('div', { class: 'button-row' }, el('button', { class: 'button', type: 'submit' }, 'Start')));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    choice.mode = mode.value;
    choice.seconds = Number(seconds.value);
    choice.category = category.value;
    startTest(container, makeTarget());
  });

  const heading = el('h1', { tabindex: '-1' }, 'Typing practice');
  container.replaceChildren(
    heading,
    el('p', {}, 'Type the text exactly as you see it. The timer starts when you press your first key. Use Backspace to fix mistakes.'),
    form);
  heading.focus();
}

function makeTarget() {
  const minChars = choice.mode === 'timed' ? choice.seconds * CHARS_PER_SECOND : 0;
  return buildTarget(typingTexts, { category: choice.category, minChars });
}

// ---------- Test screen ----------

function startTest(container, target) {
  const limitMs = choice.mode === 'timed' ? choice.seconds * 1000 : null;

  const chars = [...target].map((ch) => el('span', { class: 'ty-char' }, ch));
  const targetBox = el('div', { class: 'ty-target', id: 'ty-target' }, ...chars);

  const input = el('textarea', {
    id: 'ty-input', class: 'ty-input', rows: '3', maxlength: String(target.length),
    autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false',
    'aria-describedby': 'ty-target ty-hint',
  });
  const hint = el('p', { id: 'ty-hint' }, 'Start typing to begin. The timer starts with your first key.');
  const live = el('p', { class: 'ty-live' });

  const cancel = el('button', { class: 'button button-secondary', type: 'button' }, 'Cancel');
  cancel.addEventListener('click', () => { stopTimer(); showSetup(container); });

  container.replaceChildren(
    el('h1', {}, choice.mode === 'timed' ? `Typing test: ${choice.seconds} seconds` : 'Typing test: untimed'),
    targetBox,
    live,
    el('div', { class: 'field' }, el('label', { for: 'ty-input' }, 'Type the text here'), input),
    hint,
    el('div', { class: 'button-row' }, cancel));

  // Test state
  let typed = '';
  let keystrokes = 0;
  let errorKeystrokes = 0;
  const missedCounts = {};
  let startTime = null;
  let timerId = null;
  let finished = false;

  const elapsed = () => (startTime === null ? 0 : performance.now() - startTime);

  function stopTimer() {
    if (timerId !== null) clearInterval(timerId);
    timerId = null;
    finished = true;
  }

  function currentStats(elapsedMs) {
    return computeStats({ target, typed, keystrokes, errorKeystrokes, elapsedMs });
  }

  function paint() {
    chars.forEach((span, i) => {
      let state = '';
      if (i < typed.length) state = typed[i] === target[i] ? 'is-correct' : 'is-wrong';
      else if (i === typed.length) state = 'is-current';
      span.className = state ? `ty-char ${state}` : 'ty-char';
    });
    chars[typed.length]?.scrollIntoView({ block: 'nearest' });
  }

  function paintLive() {
    const ms = elapsed();
    const stats = currentStats(ms);
    const parts = [];
    if (limitMs !== null) parts.push(`Time left: ${Math.max(0, Math.ceil((limitMs - ms) / 1000))} s`);
    else parts.push(`Time: ${Math.floor(ms / 1000)} s`);
    parts.push(`WPM: ${ms < 1000 ? 0 : stats.netWpm}`, `Accuracy: ${stats.accuracy || (keystrokes ? 0 : 100)}%`);
    live.replaceChildren(...parts.map((text) => el('span', {}, text)));
  }

  function tick() {
    if (!input.isConnected) { stopTimer(); return; } // you left the page
    if (limitMs !== null && elapsed() >= limitMs) finish(limitMs);
    else paintLive();
  }

  function finish(elapsedMs) {
    if (finished) return;
    const ms = elapsedMs ?? elapsed();
    stopTimer();
    input.disabled = true;
    showResults(container, {
      target, typed, ms,
      stats: currentStats(ms),
      missed: topMissedKeys(missedCounts),
    });
  }

  // Block paste, drop and autocorrect so only real typing counts.
  input.addEventListener('beforeinput', (event) => {
    if (/^insertFromPaste|^insertFromDrop|^insertFromYank|^insertReplacementText/.test(event.inputType)) {
      event.preventDefault();
    }
  });
  input.addEventListener('paste', (event) => event.preventDefault());
  input.addEventListener('drop', (event) => event.preventDefault());
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') event.preventDefault(); // texts have no line breaks
  });

  // Keep the cursor at the end so you cannot edit the middle of the text.
  const caretToEnd = () => input.setSelectionRange(input.value.length, input.value.length);
  input.addEventListener('click', caretToEnd);
  input.addEventListener('keyup', caretToEnd);

  input.addEventListener('input', () => {
    if (finished) return;
    const tracked = trackInput(typed, input.value, target);
    keystrokes += tracked.keystrokes;
    errorKeystrokes += tracked.errors;
    for (const key of tracked.missed) missedCounts[key] = (missedCounts[key] ?? 0) + 1;
    typed = input.value;

    if (startTime === null && typed.length > 0) {
      startTime = performance.now();
      timerId = setInterval(tick, 100);
    }
    paint();
    paintLive();
    if (typed.length >= target.length) finish();
  });

  paint();
  paintLive();
  input.focus();
}

// ---------- Results screen ----------

function stat(label, value) {
  return el('div', { class: 'ty-result' }, el('dt', {}, label), el('dd', {}, value));
}

function keyName(key) {
  return key === ' ' ? 'space' : `"${key}"`;
}

function showResults(container, { target, typed, ms, stats, missed }) {
  const heading = el('h1', { tabindex: '-1' },
    `Result: ${stats.netWpm} WPM, ${stats.accuracy}% accuracy`);

  const seconds = Math.round(ms / 100) / 10;
  const tooShort = ms < 5000 || typed.length < 10;

  const again = el('button', { class: 'button', type: 'button' }, 'Try again (same text)');
  const another = el('button', { class: 'button button-secondary', type: 'button' }, 'New text');
  const change = el('button', { class: 'button button-secondary', type: 'button' }, 'Change settings');
  again.addEventListener('click', () => startTest(container, target));
  another.addEventListener('click', () => startTest(container, makeTarget()));
  change.addEventListener('click', () => showSetup(container));

  const children = [
    heading,
    el('dl', { class: 'ty-results' },
      stat('Speed (net WPM)', String(stats.netWpm)),
      stat('Speed before errors (WPM)', String(stats.grossWpm)),
      stat('Accuracy', `${stats.accuracy}%`),
      stat('Errors left in text', String(stats.uncorrectedErrors)),
      stat('Time', `${seconds} s`),
      stat('Characters typed', String(typed.length))),
  ];

  if (tooShort) {
    children.push(el('p', { class: 'note' }, 'This test was very short, so the result may not be reliable.'));
  }
  if (missed.length > 0) {
    children.push(
      el('h2', {}, 'Keys you missed most'),
      el('ul', { class: 'ty-missed' },
        ...missed.map((m) => el('li', {}, `${keyName(m.key)}: ${m.count} ${m.count === 1 ? 'time' : 'times'}`))));
  }
  children.push(
    el('p', {}, 'Results are not saved yet. Saving comes in Milestone 3.'),
    el('div', { class: 'button-row' }, again, another, change));

  container.replaceChildren(...children);
  heading.focus();
}
