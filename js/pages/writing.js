// Writing page: task list -> one task (write, check, compare, rate) -> history.
// The checks are in js/logic/writing-check.js. Content is in content/writing/.
// The app cannot grade your writing. It checks what a computer can check, then you compare and rate yourself.

import { el } from '../ui/dom.js';
import { button, setPage } from '../ui/page.js';
import { checkResults } from '../ui/check-list.js';
import { writingTasks } from '../../content/writing/index.js';
import { checkWriting, countWords } from '../logic/writing-check.js';
import {
  RATINGS, RATING_LABELS, MAX_TEXT, MAX_NOTE, historyFor, taskStatus, latestRating,
} from '../logic/writing-progress.js';
import { getData, getSaveError, saveWritingDraft, recordWriting } from '../state.js';
import { takeIntent } from '../intent.js';

const STATUS_LABELS = { 'not-started': 'Not started', draft: 'Draft saved', done: 'Done' };
const DRAFT_DELAY_MS = 500;

// ---------- Keeping the draft ----------

// Saves the text a moment after you stop typing. flush() saves at once (when you leave the page).
let activeSaver = null;

function makeDraftSaver(taskId, textarea) {
  let timer = null;
  const saver = {
    schedule() {
      clearTimeout(timer);
      timer = setTimeout(() => saver.flush(), DRAFT_DELAY_MS);
    },
    flush() {
      if (timer === null) return;
      clearTimeout(timer);
      timer = null;
      saveWritingDraft(taskId, textarea.value);
    },
  };
  return saver;
}

function leaveCurrentTask() {
  activeSaver?.flush();
  activeSaver = null;
}

// The route can change, or the page can close, while a draft is waiting to be saved.
window.addEventListener('hashchange', () => activeSaver?.flush());
window.addEventListener('pagehide', () => activeSaver?.flush());

// ---------- Copy ----------

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const box = el('textarea', { 'aria-hidden': 'true', tabindex: '-1' });
    box.value = text;
    box.style.position = 'fixed';
    box.style.opacity = '0';
    document.body.append(box);
    box.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    box.remove();
    return copied;
  }
}

// ---------- Entry point ----------

export function render(container) {
  leaveCurrentTask();
  const intent = takeIntent();
  const task = intent?.taskId ? writingTasks.find((t) => t.id === intent.taskId) : null;
  if (task) showTask(container, task);
  else showList(container);
}

// ---------- Task list ----------

function taskCard(container, task) {
  const writing = getData().writing;
  const status = taskStatus(writing, task.id);
  const details = [task.area, `${task.targetWords.min} to ${task.targetWords.max} words`, STATUS_LABELS[status]];
  const rating = latestRating(writing, task.id);
  if (rating) details.push(`Your rating: ${RATING_LABELS[rating]}`);
  const open = button(status === 'not-started' ? 'Open task' : 'Open again', () => showTask(container, task));
  open.setAttribute('aria-label', `${status === 'not-started' ? 'Open task' : 'Open again'}: ${task.title}`);
  return el('li', { class: 'card' }, el('h2', {}, task.title), el('p', { class: 'meta' }, details.join(' · ')), open);
}

function showList(container) {
  leaveCurrentTask();
  setPage(container,
    el('h1', { tabindex: '-1' }, 'Writing practice'),
    el('p', {}, 'Write a short work message from a real situation. The app checks length, greeting, closing and a few other things. Then you compare your text with a model answer and rate it yourself.'),
    el('p', { class: 'note' }, 'The app cannot understand your writing, so it does not give a grade. A check that says "Look at this" is advice, not a mistake.'),
    el('ul', { class: 'lesson-list' }, ...writingTasks.map((task) => taskCard(container, task))));
}

// ---------- One task ----------

function historyItem(entry) {
  const when = new Date(entry.at).toLocaleString();
  const parts = [when, `${entry.wordCount} words`, `checks ${entry.checksPassed} of ${entry.checksTotal}`];
  if (entry.rating) parts.push(`rated ${RATING_LABELS[entry.rating]}`);
  const children = [el('summary', {}, parts.join(' · ')), el('pre', { class: 'saved-text' }, entry.text)];
  if (entry.note) children.push(el('p', {}, el('strong', {}, 'Your note: '), entry.note));
  return el('li', {}, el('details', {}, ...children));
}

function showTask(container, task) {
  leaveCurrentTask();
  const writing = getData().writing;

  // --- The task card
  const card = [
    el('h1', { tabindex: '-1' }, task.title),
    el('p', { class: 'meta' }, `${task.area} · Level ${task.level} · ${task.targetWords.min} to ${task.targetWords.max} words`),
    el('h2', {}, 'The situation'),
    el('p', {}, task.situation),
  ];
  if (task.given) card.push(el('blockquote', { class: 'quote' }, task.given));
  card.push(
    el('h2', {}, 'Your task'),
    el('p', {}, task.task),
    el('h2', {}, 'Useful phrases'),
    el('ul', { class: 'phrase-list' }, ...task.phrases.map((phrase) => el('li', {}, phrase))));

  // --- The writing box
  const textarea = el('textarea', {
    id: 'writing-text', class: 'writing-input', rows: '10', maxlength: String(MAX_TEXT),
    'aria-describedby': 'writing-count', autocomplete: 'off',
  });
  textarea.value = writing.drafts[task.id]?.text ?? '';
  const count = el('p', { id: 'writing-count', class: 'meta' });
  const updateCount = () => {
    const n = countWords(textarea.value);
    count.textContent = `${n} ${n === 1 ? 'word' : 'words'}. Aim for ${task.targetWords.min} to ${task.targetWords.max}. Your text is saved on this device as you write.`;
  };
  updateCount();

  const saver = makeDraftSaver(task.id, textarea);
  activeSaver = saver;

  const status = el('p', { class: 'status', role: 'status' });
  const results = el('div', { class: 'writing-results' });
  const after = el('div', { class: 'writing-after' });
  const historyBox = el('div');
  let lastResult = null;
  let afterBuilt = false;

  const stale = el('p', { class: 'note', hidden: true }, 'Your text changed. Press "Check my text" again to see new results.');
  textarea.addEventListener('input', () => {
    updateCount();
    saver.schedule();
    if (lastResult) stale.hidden = false;
  });
  textarea.addEventListener('blur', () => saver.flush());

  const checkButton = button('Check my text', () => {
    saver.flush();
    const result = checkWriting(task, textarea.value);
    if (result.empty) {
      status.textContent = 'Write something first, then check it.';
      return;
    }
    lastResult = result;
    stale.hidden = true;
    status.textContent = '';
    results.replaceChildren(...checkResults(result));
    if (!afterBuilt) { buildAfter(); afterBuilt = true; }
    results.querySelector('h2').focus();
  });

  const copyStatus = el('span', { class: 'status', role: 'status' });
  const copyButton = button('Copy my text', async () => {
    if (textarea.value.trim() === '') { copyStatus.textContent = 'There is no text to copy yet.'; return; }
    const copied = await copyToClipboard(textarea.value);
    copyStatus.textContent = copied ? 'Copied. You can paste it anywhere.' : 'Could not copy. Select the text and copy it yourself.';
  }, true);

  // --- Checklist, model answer and rating (shown after the first check)
  function buildAfter() {
    const boxes = task.checklist.map((text, i) => {
      const id = `checklist-${i}`;
      return { id, input: el('input', { type: 'checkbox', id }), text };
    });
    const checklist = el('fieldset', { class: 'plain-fieldset' },
      el('legend', {}, 'Check your text yourself'),
      ...boxes.map(({ id, input, text }) => el('div', { class: 'field-check' }, input, el('label', { for: id }, text))));

    const models = el('div', { class: 'model' }, ...task.modelAnswers.map((model, i) => el('div', {},
      el('h3', {}, task.modelAnswers.length > 1 ? `Model answer ${i + 1}` : 'Model answer'),
      el('pre', { class: 'model-text' }, model.text),
      el('p', {}, el('strong', {}, 'Why it works: '), model.why))));
    const modelNote = el('p', { class: 'note' }, 'There is more than one good answer. Compare the ideas, not every word.');

    const ratingInputs = RATINGS.map((rating) => {
      const id = `rating-${rating}`;
      return { rating, id, input: el('input', { type: 'radio', name: 'rating', id, value: rating }) };
    });
    const ratingSet = el('fieldset', { class: 'plain-fieldset' },
      el('legend', {}, 'How do you rate your text?'),
      ...ratingInputs.map(({ rating, id, input }) => el('div', { class: 'field-check' }, input, el('label', { for: id }, RATING_LABELS[rating]))));

    const note = el('textarea', { id: 'writing-note', rows: '2', maxlength: String(MAX_NOTE) });
    const saveStatus = el('p', { class: 'status', role: 'status' });
    const save = button('Save to my history', () => {
      const chosen = ratingInputs.find(({ input }) => input.checked);
      if (!chosen) { saveStatus.textContent = 'Choose how you rate your text first.'; saveStatus.className = 'status status-error'; return; }
      saver.flush();
      const result = checkWriting(task, textarea.value);
      if (result.empty) { saveStatus.textContent = 'Write something first.'; saveStatus.className = 'status status-error'; return; }
      recordWriting({
        taskId: task.id, text: textarea.value, result,
        checklist: boxes.map(({ input }) => input.checked), rating: chosen.rating, note: note.value,
      });
      const error = getSaveError();
      saveStatus.className = error ? 'status status-error' : 'status';
      saveStatus.textContent = error ?? 'Saved. You can keep editing the text and try again.';
      showHistory();
    });

    after.replaceChildren(
      el('h2', {}, 'Compare and think'),
      checklist,
      el('h3', {}, 'Compare with the model'),
      models, modelNote,
      el('h2', {}, 'Save your result'),
      ratingSet,
      el('div', { class: 'field' }, el('label', { for: 'writing-note' }, 'A note for yourself (optional)'), note),
      el('div', { class: 'button-row' }, save),
      saveStatus);
  }

  // --- History
  function showHistory() {
    const entries = historyFor(getData().writing.history, task.id);
    if (entries.length === 0) { historyBox.replaceChildren(); return; }
    historyBox.replaceChildren(
      el('h2', {}, 'Your saved attempts'),
      el('ul', { class: 'history-list' }, ...entries.map(historyItem)));
  }
  showHistory();

  const back = button('All writing tasks', () => showList(container), true);
  setPage(container, ...card,
    el('div', { class: 'field' },
      el('label', { for: 'writing-text' }, 'Your text'),
      textarea, count),
    el('div', { class: 'button-row' }, checkButton, copyButton),
    status, copyStatus, stale, results, after, historyBox,
    el('div', { class: 'button-row' }, back));
}
