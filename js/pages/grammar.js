// Grammar page: lesson list -> lesson -> exercises -> results.
// The rules (scoring, status) are in js/logic/progress.js. Content is in content/grammar/.

import { el } from '../ui/dom.js';
import { grammarLessons } from '../../content/grammar/index.js';
import { renderExercise } from './exercise-view.js';
import { lessonSummary, unansweredIds } from '../logic/progress.js';
import { solutionText } from '../logic/answer-check.js';
import { getData, recordExerciseResult, startLessonRun } from '../state.js';

const STATUS_LABELS = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
  mastered: 'Mastered',
};

export function render(container) {
  showList(container);
}

const exerciseIds = (lesson) => lesson.exercises.map((e) => e.id);
const percent = (fraction) => `${Math.round(fraction * 100)}%`;

function button(text, onClick, secondary = false) {
  const b = el('button', { class: secondary ? 'button button-secondary' : 'button', type: 'button' }, text);
  b.addEventListener('click', onClick);
  return b;
}

// Replaces the page content and moves the focus to the heading.
function setPage(container, heading, ...nodes) {
  container.replaceChildren(heading, ...nodes);
  window.scrollTo(0, 0);
  heading.focus();
}

// ---------- Lesson list ----------

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
  const open = button('Open lesson', () => showLesson(container, lesson));
  open.setAttribute('aria-label', `Open lesson: ${lesson.title}`);
  return el('li', { class: 'card' }, el('h2', {}, lesson.title), ...lines, open);
}

function showList(container) {
  setPage(container,
    el('h1', { tabindex: '-1' }, 'Grammar practice'),
    el('p', {}, 'Read a short lesson, then do the exercises. Try each answer first. Hints and explanations are there to help you. Your progress is saved on this device.'),
    el('ul', { class: 'lesson-list' }, ...grammarLessons.map((lesson) => lessonCard(container, lesson))));
}

// ---------- One lesson ----------

function showLesson(container, lesson) {
  const ids = exerciseIds(lesson);
  const entry = getData().progress[lesson.id];
  const summary = lessonSummary(entry, ids);
  const unanswered = unansweredIds(entry, ids);

  const startAgain = () => { startLessonRun(lesson.id); runExercises(container, lesson, ids, false); };
  const buttons = [];
  if ((summary.status === 'completed' || summary.status === 'mastered') && unanswered.length === 0) {
    buttons.push(button('Start again', startAgain));
  } else if (summary.answeredCount > 0) {
    buttons.push(
      button(`Continue (${summary.answeredCount} of ${summary.total} answered)`, () => runExercises(container, lesson, unanswered, false)),
      button('Start again', startAgain, true));
  } else {
    buttons.push(button('Start exercises', () => runExercises(container, lesson, ids, false)));
  }
  buttons.push(button('All lessons', () => showList(container), true));

  const status = [`Status: ${STATUS_LABELS[summary.status]}.`];
  if (summary.lastScore !== null) status.push(`Last score: ${percent(summary.lastScore)}. Best score: ${percent(summary.bestScore)}.`);

  setPage(container,
    el('h1', { tabindex: '-1' }, lesson.title),
    el('p', { class: 'meta' }, `Level ${lesson.level} · ${summary.total} exercises · ${status.join(' ')}`),
    el('div', { class: 'lesson-text' }, ...lesson.explanation.map((text) => el('p', {}, text))),
    el('h2', {}, 'Examples'),
    el('ul', { class: 'examples' },
      ...lesson.examples.map((example) => el('li', {}, el('strong', {}, example.text), el('br'), example.note))),
    el('div', { class: 'button-row' }, ...buttons));
}

// ---------- Doing the exercises ----------

// runIds: which exercises to do now. practice: extra practice that does not change the lesson score.
function runExercises(container, lesson, runIds, practice) {
  const allIds = exerciseIds(lesson);
  const outcomes = {};
  let index = 0;

  const box = el('div');
  const heading = el('h1', { tabindex: '-1' }, lesson.title);
  const leave = button('Leave the lesson', () => showLesson(container, lesson), true);
  const intro = [];
  if (practice) intro.push(el('p', { class: 'note' }, 'Extra practice: these answers do not change your lesson score.'));

  function showCurrent() {
    if (index >= runIds.length) {
      showResults(container, lesson, runIds, outcomes, practice);
      return;
    }
    const exercise = lesson.exercises.find((e) => e.id === runIds[index]);
    renderExercise(box, {
      exercise,
      position: index + 1,
      total: runIds.length,
      nextLabel: index === runIds.length - 1 ? 'See results' : 'Next question',
      onFinish(result) {
        outcomes[exercise.id] = result.outcome;
        recordExerciseResult({ lessonId: lesson.id, exerciseId: exercise.id, exerciseIds: allIds, practice, ...result });
      },
      onNext() {
        index += 1;
        window.scrollTo(0, 0);
        showCurrent();
      },
    });
  }

  container.replaceChildren(heading, ...intro, box, el('div', { class: 'button-row' }, leave));
  window.scrollTo(0, 0);
  showCurrent();
}

// ---------- Results ----------

function showResults(container, lesson, runIds, runOutcomes, practice) {
  const ids = exerciseIds(lesson);
  const entry = getData().progress[lesson.id];

  // A normal run shows the whole lesson. Extra practice shows only this run.
  const answered = practice ? runOutcomes : (entry?.answered ?? {});
  const shownIds = practice ? runIds : ids;
  const correct = shownIds.filter((id) => answered[id] === 'correct').length;
  const missed = lesson.exercises.filter((e) => shownIds.includes(e.id) && answered[e.id] !== 'correct');

  const summary = lessonSummary(entry, ids);
  let message = '';
  if (practice) message = 'Extra practice is finished. Your lesson score did not change.';
  else if (summary.status === 'mastered') message = 'Great work! You mastered this lesson (80% or more right on the first try).';
  else if (summary.status === 'completed') message = 'Lesson completed. A score of 80% or more means "mastered". Practice the ones you missed, then start the lesson again.';

  const nodes = [
    el('p', { class: 'score' }, `${correct} of ${shownIds.length} right on the first try (${percent(shownIds.length ? correct / shownIds.length : 0)}).`),
    el('p', {}, message),
  ];

  if (missed.length > 0) {
    nodes.push(
      el('h2', {}, 'To review'),
      el('ul', { class: 'missed-list' }, ...missed.map((e) => el('li', {},
        el('span', {}, e.given ? `${e.prompt} ${e.given}` : e.prompt), el('br'),
        el('strong', {}, 'Answer: '), solutionText(e)))));
  }

  const buttons = [];
  if (missed.length > 0) {
    buttons.push(button('Practice the ones I missed', () => runExercises(container, lesson, missed.map((e) => e.id), true)));
  }
  buttons.push(button('Back to the lesson', () => showLesson(container, lesson), missed.length > 0));
  const nextLesson = grammarLessons[grammarLessons.indexOf(lesson) + 1];
  if (nextLesson) buttons.push(button(`Next lesson: ${nextLesson.title}`, () => showLesson(container, nextLesson), true));
  buttons.push(button('All lessons', () => showList(container), true));

  setPage(container,
    el('h1', { tabindex: '-1' }, practice ? 'Practice finished' : 'Lesson finished'),
    ...nodes,
    el('div', { class: 'button-row' }, ...buttons));
}
