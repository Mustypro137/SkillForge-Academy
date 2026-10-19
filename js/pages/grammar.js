// Grammar page: lesson list. One lesson, its exercises and the results are in lesson-player.js.
// The rules (scoring, status) are in js/logic/progress.js. Content is in content/grammar/.

import { el } from '../ui/dom.js';
import { button, setPage } from '../ui/page.js';
import { grammarLessons } from '../../content/grammar/index.js';
import { lessonSummary } from '../logic/progress.js';
import { getData } from '../state.js';
import { takeIntent } from '../intent.js';
import { showLesson, exerciseIds, percent, STATUS_LABELS } from './lesson-player.js';

const config = {
  lessons: grammarLessons,
  showList: (container) => showList(container),
  listLabel: 'All lessons',
  nextLabel: 'Next lesson',
};

export function render(container) {
  // The dashboard can ask for a specific lesson.
  const intent = takeIntent();
  const lesson = intent?.lessonId ? grammarLessons.find((l) => l.id === intent.lessonId) : null;
  if (lesson) showLesson(container, lesson, config);
  else showList(container);
}

function lessonCard(container, lesson) {
  const summary = lessonSummary(getData().progress[lesson.id], exerciseIds(lesson));
  const details = [`Level ${lesson.level}`, `${summary.total} exercises`, STATUS_LABELS[summary.status]];
  const lines = [el('p', { class: 'meta' }, details.join(' · '))];

  if (summary.status === 'in-progress' && summary.answeredCount > 0) {
    lines.push(el('p', {}, `${summary.answeredCount} of ${summary.total} answered.`));
  }
  if (summary.lastScore !== null) {
    lines.push(el('p', {}, `Last score: ${percent(summary.lastScore)}. Best score: ${percent(summary.bestScore)}.`));
  }
  const open = button('Open lesson', () => showLesson(container, lesson, config));
  open.setAttribute('aria-label', `Open lesson: ${lesson.title}`);
  return el('li', { class: 'card' }, el('h2', {}, lesson.title), ...lines, open);
}

function showList(container) {
  setPage(container,
    el('h1', { tabindex: '-1' }, 'Grammar practice'),
    el('p', {}, 'Read a short lesson, then do the exercises. Try each answer first. Hints and explanations are there to help you. Your progress is saved on this device.'),
    el('ul', { class: 'lesson-list' }, ...grammarLessons.map((lesson) => lessonCard(container, lesson))));
}
