// Mistake notebook: the list of your mistakes, and a review session.
// The scheduling rules are in js/logic/review-schedule.js.

import { el } from '../ui/dom.js';
import { button, setPage } from '../ui/page.js';
import { renderExercise } from './exercise-view.js';
import { findExercise } from '../../content/index.js';
import { solutionText } from '../logic/answer-check.js';
import { listMistakes, describeDue, MAX_BOX } from '../logic/review-schedule.js';
import { getData, getSaveError, recordExerciseResult, setMistakeNote, deleteMistake } from '../state.js';

const TABS = [
  { id: 'due', label: 'Due today' },
  { id: 'active', label: 'All mistakes' },
  { id: 'mastered', label: 'Mastered' },
];

let currentTab = 'due'; // remembered while you stay on the site

export function render(container) {
  showNotebook(container);
}

// ---------- The notebook ----------

function showNotebook(container, message = '') {
  const lists = listMistakes(getData().mistakes);
  const heading = el('h1', { tabindex: '-1' }, 'Mistake notebook');

  const tabs = el('div', { class: 'tabs', role: 'group', 'aria-label': 'Show' },
    ...TABS.map((tab) => {
      const b = el('button', {
        type: 'button', class: 'tab-button', 'aria-pressed': String(tab.id === currentTab),
      }, `${tab.label} (${lists[tab.id].length})`);
      b.addEventListener('click', () => { currentTab = tab.id; showNotebook(container); });
      return b;
    }));

  const shown = lists[currentTab];
  const nodes = [
    el('p', {}, 'When you give a wrong answer in a lesson, it is saved here. You see it again after 1, 2, 4, 8 and 16 days. After that, it is mastered.'),
    tabs,
  ];
  if (message) nodes.push(el('p', { class: 'status', role: 'status' }, message));

  if (currentTab === 'due') nodes.push(...dueIntro(container, lists));
  else if (shown.length === 0) {
    nodes.push(el('p', { class: 'note' }, currentTab === 'active'
      ? 'You have no mistakes to learn from right now.'
      : 'Nothing is mastered yet. A mistake is mastered after you get it right 5 times in a row in reviews.'));
  }
  if (shown.length > 0) {
    nodes.push(el('ul', { class: 'mistake-list' }, ...shown.map((item) => mistakeCard(container, item))));
  }
  setPage(container, heading, ...nodes);
}

function dueIntro(container, lists) {
  if (lists.due.length > 0) {
    return [
      el('p', {}, `${lists.due.length} ${lists.due.length === 1 ? 'mistake is' : 'mistakes are'} ready for review. Try each one before you look at the answer.`),
      el('div', { class: 'button-row' }, button(`Start review (${lists.due.length})`, () => startReview(container, lists.due.map((i) => i.key)))),
    ];
  }
  if (lists.nextDue) {
    return [el('p', { class: 'note' }, `Nothing to review today. Your next review is ${describeDue(lists.nextDue)}.`)];
  }
  return [el('p', { class: 'note' }, 'Nothing to review. When you give a wrong answer in a lesson, it appears here.')];
}

let cardCounter = 0;

function mistakeCard(container, { key, mistake }) {
  const found = findExercise(mistake.lessonId, mistake.exerciseId);
  const id = `note-${cardCounter += 1}`;
  const box = Math.min(Math.max(Math.floor(Number(mistake.box)) || 1, 1), MAX_BOX);
  const times = Number(mistake.timesWrong) || 1;

  const meta = [`Wrong ${times} ${times === 1 ? 'time' : 'times'}`];
  if (mistake.status === 'mastered') meta.push('Mastered');
  else meta.push(`Box ${box} of ${MAX_BOX}`, `Review ${describeDue(mistake.dueDate)}`);

  const parts = [];
  if (found) {
    const { lesson, exercise } = found;
    parts.push(
      el('h2', {}, lesson.title),
      el('p', { class: 'prompt' }, exercise.given ? `${exercise.prompt} ${exercise.given}` : exercise.prompt),
      el('p', {}, el('strong', {}, 'Your wrong answer: '), mistake.lastWrongAnswer || '(none)'),
      el('p', { class: 'meta' }, meta.join(' · ')),
      el('details', {},
        el('summary', {}, 'Show answer and explanation'),
        el('p', {}, el('strong', {}, 'Correct answer: '), solutionText(exercise)),
        el('p', {}, el('strong', {}, 'Why: '), exercise.explanation)));
  } else {
    parts.push(
      el('h2', {}, 'Exercise not available'),
      el('p', {}, 'This exercise is not in the lessons any more. You can delete it.'),
      el('p', { class: 'meta' }, meta.join(' · ')));
  }

  // My note
  const note = el('textarea', { id, rows: '2', maxlength: '500' });
  note.value = typeof mistake.note === 'string' ? mistake.note : '';
  const noteStatus = el('span', { class: 'status', role: 'status' });
  const saveNote = button('Save note', () => {
    setMistakeNote(key, note.value);
    noteStatus.textContent = getSaveError() ?? 'Saved.';
  }, true);

  // Delete, with a question first
  const deleteArea = el('div', { class: 'button-row' });
  const showDeleteButton = () => {
    const ask = button('Delete', () => {
      const yes = button('Yes, delete this mistake', () => { deleteMistake(key); showNotebook(container, 'Mistake deleted.'); });
      const no = button('Cancel', showDeleteButton, true);
      deleteArea.replaceChildren(el('span', {}, 'Delete this mistake?'), yes, no);
      no.focus();
    }, true);
    deleteArea.replaceChildren(ask);
  };
  showDeleteButton();

  return el('li', { class: 'card' },
    ...parts,
    el('div', { class: 'field' }, el('label', { for: id }, 'My note'), note),
    el('div', { class: 'button-row' }, saveNote, noteStatus),
    deleteArea);
}

// ---------- Review session ----------

function startReview(container, keys) {
  // Exercises that are not in the lessons any more are skipped.
  const queue = keys
    .map((key) => ({ key, found: findExercise(getData().mistakes[key]?.lessonId, getData().mistakes[key]?.exerciseId) }))
    .filter((item) => item.found);
  if (queue.length === 0) {
    showNotebook(container, 'These mistakes cannot be reviewed because their exercises are not available.');
    return;
  }

  const outcomes = [];
  let index = 0;
  const box = el('div');
  const heading = el('h1', { tabindex: '-1' }, 'Review your mistakes');
  const stop = button('Stop review', () => showNotebook(container, 'Review stopped. Your answers so far are saved.'), true);

  function showCurrent() {
    if (index >= queue.length) {
      showSummary(container, outcomes);
      return;
    }
    const { lesson, exercise } = queue[index].found;
    renderExercise(box, {
      exercise,
      position: index + 1,
      total: queue.length,
      nextLabel: index === queue.length - 1 ? 'See results' : 'Next question',
      onFinish(result) {
        outcomes.push(result.outcome);
        recordExerciseResult({ lessonId: lesson.id, exerciseId: exercise.id, exerciseIds: [], review: true, ...result });
      },
      onNext() {
        index += 1;
        window.scrollTo(0, 0);
        showCurrent();
      },
    });
  }

  container.replaceChildren(heading, box, el('div', { class: 'button-row' }, stop));
  window.scrollTo(0, 0);
  showCurrent();
}

function showSummary(container, outcomes) {
  const count = (outcome) => outcomes.filter((o) => o === outcome).length;
  const right = count('correct');
  setPage(container,
    el('h1', { tabindex: '-1' }, 'Review finished'),
    el('p', { class: 'score' }, `${right} of ${outcomes.length} right on the first try.`),
    el('ul', {},
      el('li', {}, `${right} moved up a box (or are mastered).`),
      el('li', {}, `${count('correct-with-help')} needed help, so they stay in the same box.`),
      el('li', {}, `${count('incorrect')} were wrong and go back to box 1.`)),
    el('div', { class: 'button-row' },
      button('Back to the notebook', () => showNotebook(container)),
      button('Practice grammar', () => { window.location.hash = '#/grammar'; }, true)));
}
