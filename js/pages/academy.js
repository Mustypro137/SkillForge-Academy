// An academy page: a list of topics. Each topic has a lesson with a quiz, a writing task and a roleplay.
// LinkedIn uses it now. Freelance and Technical English can use it later with their own content.
// The lesson and the quiz are the shared lesson player. Writing and roleplay open their own pages.

import { el } from '../ui/dom.js';
import { button, setPage } from '../ui/page.js';
import { getData } from '../state.js';
import { setIntent, takeIntent } from '../intent.js';
import { topicProgress } from '../logic/academy.js';
import { showLesson, STATUS_LABELS } from './lesson-player.js';

const WRITE_LABELS = { 'not-started': 'Not started', draft: 'Draft saved', done: 'Done' };
const TALK_LABELS = { 'not-started': 'Not started', done: 'Done' };

// config: { title, intro, topics, lessons }
export function renderAcademy(container, config) {
  const lessonConfig = {
    lessons: config.lessons,
    showList: (c) => showTopics(c, config, lessonConfig),
    listLabel: 'All topics',
    nextLabel: 'Next topic',
  };
  // The dashboard can ask for a specific lesson.
  const intent = takeIntent();
  const lesson = intent?.lessonId ? config.lessons.find((l) => l.id === intent.lessonId) : null;
  if (lesson) showLesson(container, lesson, lessonConfig);
  else showTopics(container, config, lessonConfig);
}

function goTo(path, intent) {
  setIntent(intent);
  window.location.hash = `#/${path}`;
}

function stepRow({ name, status, isNext, openLabel, ariaLabel, onOpen }) {
  const open = button(openLabel, onOpen, !isNext);
  open.setAttribute('aria-label', ariaLabel);
  return el('li', { class: 'step-row' },
    el('span', { class: 'step-name' }, name),
    el('span', { class: 'step-status' }, isNext ? `${status} · Next step` : status),
    open);
}

function topicCard(container, config, lessonConfig, topic, headingTag) {
  const progress = topicProgress(getData(), topic, config.lessons);
  const lesson = config.lessons.find((l) => l.id === topic.lessonId);
  const steps = [
    stepRow({
      name: 'Lesson and quiz', status: STATUS_LABELS[progress.lesson], isNext: progress.next === 'lesson',
      openLabel: 'Open', ariaLabel: `Open the lesson and quiz: ${topic.title}`,
      onOpen: () => showLesson(container, lesson, lessonConfig),
    }),
    stepRow({
      name: 'Write', status: WRITE_LABELS[progress.write], isNext: progress.next === 'write',
      openLabel: 'Open', ariaLabel: `Open the writing task: ${topic.title}`,
      onOpen: () => goTo('writing', { taskId: topic.taskId }),
    }),
    stepRow({
      name: 'Talk', status: TALK_LABELS[progress.talk], isNext: progress.next === 'talk',
      openLabel: 'Open', ariaLabel: `Open the roleplay: ${topic.title}`,
      onOpen: () => goTo('roleplay', { scenarioId: topic.scenarioId }),
    }),
  ];
  return el('li', { class: 'card' },
    el(headingTag, {}, topic.title),
    el('p', {}, topic.summary),
    el('p', { class: 'meta' }, progress.next === null ? 'All 3 steps done' : `${progress.done} of 3 steps done`),
    el('ul', { class: 'step-list' }, ...steps));
}

// Topics with a "stage" are shown under a heading for each stage, in the order they appear.
// Topics without a stage are shown in one list.
function topicLists(container, config, lessonConfig) {
  const stages = [...new Set(config.topics.map((topic) => topic.stage).filter(Boolean))];
  if (stages.length === 0) {
    return [el('ul', { class: 'lesson-list' }, ...config.topics.map((topic) => topicCard(container, config, lessonConfig, topic, 'h2')))];
  }
  return stages.flatMap((stage) => [
    el('h2', { class: 'stage-heading' }, stage),
    el('ul', { class: 'lesson-list' }, ...config.topics
      .filter((topic) => topic.stage === stage)
      .map((topic) => topicCard(container, config, lessonConfig, topic, 'h3'))),
  ]);
}

function showTopics(container, config, lessonConfig) {
  setPage(container,
    el('h1', { tabindex: '-1' }, config.title),
    el('p', {}, config.intro),
    el('p', { class: 'note' }, 'Each topic has three steps: a lesson with a quiz, a writing task, and a roleplay conversation. Wrong quiz answers go to your mistake notebook.'),
    ...topicLists(container, config, lessonConfig));
}
