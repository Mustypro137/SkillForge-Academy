// Dashboard: what to do next, and a short summary of your progress.
// All numbers come from js/logic/dashboard.js. This file only builds the screen.

import { el } from '../ui/dom.js';
import { button } from '../ui/page.js';
import { allLessons, findExercise } from '../../content/index.js';
import { grammarLessons } from '../../content/grammar/index.js';
import { linkedinLessons, linkedinTopics } from '../../content/linkedin/index.js';
import { freelanceLessons, freelanceTopics } from '../../content/freelance/index.js';
import { academySummary } from '../logic/academy.js';
import { writingTasks } from '../../content/writing/index.js';
import { writingSummary } from '../logic/writing-progress.js';
import { roleplayScenarios } from '../../content/roleplay/index.js';
import { roleplaySummary } from '../logic/roleplay-progress.js';
import { skillTagLabel } from '../../content/skill-tags.js';
import { getData } from '../state.js';
import { setIntent } from '../intent.js';
import { listMistakes, describeDue } from '../logic/review-schedule.js';
import {
  nextStep, lessonOverview, practiceSummary, skillStats, weakAreas, hasEnoughSkillData, backupStatus,
} from '../logic/dashboard.js';

const percent = (fraction) => `${Math.round(fraction * 100)}%`;

function card(title, big, lines, link) {
  const children = [el('h2', {}, title), el('p', { class: 'stat-number' }, big)];
  for (const line of lines) children.push(el('p', {}, line));
  if (link) children.push(el('a', { class: 'card-link', href: link.href }, link.text));
  return el('li', { class: 'card stat' }, ...children);
}

function goTo(step) {
  setIntent(step.lessonId ? { lessonId: step.lessonId } : null);
  window.location.hash = `#/${step.target}`; // mistakes, grammar or linkedin
}

function weakAreasCard(attempts) {
  const stats = skillStats(attempts, (lessonId, exerciseId) => findExercise(lessonId, exerciseId)?.exercise.skillTags);
  const weak = weakAreas(stats);

  let big;
  const lines = [];
  if (weak.length > 0) {
    big = `${weak.length} to practice`;
    lines.push('Skills where fewer than 80% of your answers were right on the first try:');
  } else if (hasEnoughSkillData(stats)) {
    big = 'None found';
    lines.push('Every skill with enough answers is at 80% or more. Keep going!');
  } else {
    big = 'Not enough data yet';
    lines.push('Answer at least 5 questions on a skill and it will be checked here.');
  }
  const item = el('li', { class: 'card stat wide' }, el('h2', {}, 'Weak areas'), el('p', { class: 'stat-number' }, big), ...lines.map((t) => el('p', {}, t)));
  if (weak.length > 0) {
    item.append(el('ul', { class: 'weak-list' }, ...weak.map((w) =>
      el('li', {}, el('strong', {}, skillTagLabel(w.tag)), `: ${percent(w.accuracy)} right first time (${w.correct} of ${w.attempts})`))));
    item.append(el('p', {}, 'Practice these in the lessons and in your mistake notebook.'));
  }
  return item;
}

function backupCard(data) {
  const status = backupStatus(data.lastBackupAt);
  const link = { href: '#/settings', text: 'Backup and settings' };
  if (status.never) {
    const hasWork = data.attempts.length > 0;
    return card('Backup', 'No backup yet',
      [hasWork
        ? 'Your progress is saved only in this browser. Please export a backup file.'
        : 'Your progress is saved only in this browser. Export a backup now and then.'], link);
  }
  const when = status.days === 0 ? 'today' : `${status.days} ${status.days === 1 ? 'day' : 'days'} ago`;
  const lines = status.days > 14 ? ['It is a good time to make a new backup.'] : ['Your progress is backed up.'];
  return card('Backup', `Last backup ${when}`, lines, link);
}

export function render(container) {
  const data = getData();
  const now = new Date();

  const step = nextStep(data, allLessons, now);
  const overview = lessonOverview(data, grammarLessons);
  const linkedin = academySummary(data, linkedinTopics, linkedinLessons);
  const freelance = academySummary(data, freelanceTopics, freelanceLessons);
  const mistakes = listMistakes(data.mistakes, now);
  const week = practiceSummary(data.attempts, now, data.writing, data.roleplay);
  const writing = writingSummary(data.writing, writingTasks);
  const roleplay = roleplaySummary(data.roleplay, roleplayScenarios);

  const heading = el('h1', { tabindex: '-1' }, 'Dashboard');
  const welcome = data.attempts.length === 0
    ? 'Welcome to SkillForge Academy. This is your private place to practice English for work. Your progress stays on this device.'
    : 'Welcome back. Here is where you are today.';

  const nextCard = el('section', { class: 'next-step', 'aria-labelledby': 'next-step-title' },
    el('p', { class: 'next-label' }, 'Your next step'),
    el('h2', { id: 'next-step-title' }, step.title),
    el('p', {}, step.text),
    el('div', { class: 'button-row' }, button(step.button, () => goTo(step))));

  const lastPractice = week.lastPractice
    ? `Last practice: ${new Date(week.lastPractice).toLocaleDateString()}.`
    : 'No practice yet.';
  const nextReview = mistakes.due.length === 0 && mistakes.nextDue
    ? `Next review ${describeDue(mistakes.nextDue, now)}.`
    : null;

  const cards = el('ul', { class: 'stat-grid' },
    card('Lessons', `${overview.completed} of ${overview.total} done`,
      [`${overview.mastered} mastered`, `${overview.started - overview.completed} in progress`],
      { href: '#/grammar', text: 'Open grammar' }),
    card('Mistakes', `${mistakes.due.length} due today`,
      [`${mistakes.active.length} to learn`, `${mistakes.mastered.length} mastered`, nextReview].filter(Boolean),
      { href: '#/mistakes', text: 'Open the notebook' }),
    card('Last 7 days', `${week.answers} ${week.answers === 1 ? 'answer' : 'answers'}`,
      [
        week.accuracy === null ? 'No answers this week yet.' : `${percent(week.accuracy)} right on the first try`,
        `${week.writings} ${week.writings === 1 ? 'writing' : 'writings'} saved`,
        `${week.roleplays} ${week.roleplays === 1 ? 'conversation' : 'conversations'} finished`,
        `Practiced on ${week.daysPracticed} of the last 7 days`,
        lastPractice,
      ]),
    card('Writing', `${writing.done} of ${writing.total} done`,
      [`${writing.great} rated Great`, 'Your own rating, because the app cannot grade writing.'],
      { href: '#/writing', text: 'Open writing' }),
    card('LinkedIn academy', `${linkedin.complete} of ${linkedin.total} topics done`,
      [`${linkedin.started} started`, 'Each topic: lesson and quiz, writing, roleplay.'],
      { href: '#/linkedin', text: 'Open LinkedIn academy' }),
    card('Freelance academy', `${freelance.complete} of ${freelance.total} topics done`,
      [`${freelance.started} started`, 'Each topic: lesson and quiz, writing, roleplay.'],
      { href: '#/freelance', text: 'Open Freelance academy' }),
    card('Roleplay', `${roleplay.done} of ${roleplay.total} done`,
      [`${roleplay.strong} with a best result of 80% or more`],
      { href: '#/roleplay', text: 'Open roleplay' }),
    backupCard(data),
    weakAreasCard(data.attempts));

  container.replaceChildren(heading, el('p', {}, welcome), nextCard, cards);
}
