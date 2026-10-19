// Reading page: a list of work texts. Each text has a passage + quiz, then a clarifying-question task.
// The exercise screens are the shared lesson player. The writing task opens the writing page.
// Content is in content/reading/. The rules for scoring are in js/logic/progress.js.

import { el } from '../ui/dom.js';
import { button, setPage } from '../ui/page.js';
import { getData } from '../state.js';
import { setIntent, takeIntent } from '../intent.js';
import { readingLessons, readingTopics } from '../../content/reading/index.js';
import { lessonSummary } from '../logic/progress.js';
import { taskStatus } from '../logic/writing-progress.js';
import { showLesson, STATUS_LABELS } from './lesson-player.js';

const WRITE_LABELS = { 'not-started': 'Not started', draft: 'Draft saved', done: 'Done' };

const config = {
  lessons: readingLessons,
  showList: (container) => showList(container),
  listLabel: 'All texts',
  nextLabel: 'Next text',
};

export function render(container) {
  // The dashboard can ask for a specific reading lesson.
  const intent = takeIntent();
  const lesson = intent?.lessonId ? readingLessons.find((l) => l.id === intent.lessonId) : null;
  if (lesson) showLesson(container, lesson, config);
  else showList(container);
}

function goToWriting(taskId) {
  setIntent({ taskId });
  window.location.hash = '#/writing';
}

function topicCard(container, topic) {
  const lesson = readingLessons.find((l) => l.id === topic.lessonId);
  const data = getData();
  const summary = lessonSummary(data.progress?.[lesson.id], lesson.exercises.map((e) => e.id));
  const write = taskStatus(data.writing, topic.taskId);

  return el('li', { class: 'card' },
    el('h2', {}, topic.title),
    el('p', { class: 'meta' }, `Level ${topic.level} · ${lesson.exercises.length} questions`),
    el('p', {}, topic.summary),
    el('p', { class: 'meta' },
      `Quiz: ${STATUS_LABELS[summary.status]}. Clarifying question: ${WRITE_LABELS[write]}.`),
    el('div', { class: 'button-row' },
      button(summary.answeredCount > 0 && summary.answeredCount < summary.total
        ? `Continue (${summary.answeredCount} of ${summary.total} answered)`
        : 'Read and answer', () => showLesson(container, lesson, config)),
      button('Ask a clarifying question', () => goToWriting(topic.taskId), true)));
}

function showList(container) {
  setPage(container,
    el('h1', { tabindex: '-1' }, 'Reading comprehension'),
    el('p', {}, 'Read real work texts in English: a job post, a client brief, an API change notice, a status report, and meeting notes. Answer questions about the details, then write one useful clarifying question.'),
    el('ul', { class: 'lesson-list' }, ...readingTopics.map((topic) => topicCard(container, topic))));
}
