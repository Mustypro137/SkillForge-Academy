// The numbers and advice shown on the dashboard. Pure functions: they only read data.
// "lessons" is the list of lessons from the content files (each has id, order, title, exercises).

import { lessonSummary } from './progress.js';
import { listMistakes } from './review-schedule.js';
import { localDateString } from '../storage.js';

const DAY_MS = 24 * 60 * 60 * 1000;
export const WEAK_BELOW = 0.8;     // a skill under 80% is a weak area
export const MIN_SKILL_ATTEMPTS = 5; // too few answers say nothing about a skill

const exerciseIds = (lesson) => lesson.exercises.map((e) => e.id);
const summaryOf = (data, lesson) => lessonSummary(data.progress?.[lesson.id], exerciseIds(lesson));
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const percent = (fraction) => `${Math.round(fraction * 100)}%`;

// What to do next. Rules, in this order:
//   1. mistakes are due for review
//   2. a lesson is in progress
//   3. a lesson has not been started
//   4. a lesson is finished but not mastered yet
//   5. everything is mastered
// Returns { kind, title, text, button, target: 'mistakes' | 'grammar', lessonId? }
export function nextStep(data, lessons, now = new Date()) {
  const due = listMistakes(data.mistakes, now).due.length;
  if (due > 0) {
    return {
      kind: 'review', target: 'mistakes', button: 'Go to the notebook',
      title: `Review ${plural(due, 'mistake', 'mistakes')}`,
      text: 'These mistakes are ready for review today. A short review helps you remember them.',
    };
  }

  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const withSummary = sorted.map((lesson) => ({ lesson, summary: summaryOf(data, lesson) }));

  const inProgress = withSummary.find(({ summary }) => summary.status === 'in-progress' && summary.answeredCount > 0);
  if (inProgress) {
    const { lesson, summary } = inProgress;
    return {
      kind: 'continue', target: 'grammar', lessonId: lesson.id, button: 'Continue',
      title: `Continue: ${lesson.title}`,
      text: `You answered ${summary.answeredCount} of ${summary.total} questions.`,
    };
  }

  const fresh = withSummary.find(({ summary }) => summary.status === 'not-started' || summary.status === 'in-progress');
  if (fresh) {
    const isFirst = Object.keys(data.progress ?? {}).length === 0;
    return {
      kind: 'start', target: 'grammar', lessonId: fresh.lesson.id, button: 'Start lesson',
      title: `${isFirst ? 'Start your first lesson' : 'Start'}: ${fresh.lesson.title}`,
      text: `${plural(fresh.summary.total, 'exercise', 'exercises')}. Take your time and read each hint.`,
    };
  }

  const improve = withSummary.find(({ summary }) => summary.status === 'completed');
  if (improve) {
    const { lesson, summary } = improve;
    return {
      kind: 'improve', target: 'grammar', lessonId: lesson.id, button: 'Open lesson',
      title: `Improve: ${lesson.title}`,
      text: `Your last score was ${percent(summary.lastScore ?? 0)}. Reach 80% to master this lesson.`,
    };
  }

  return {
    kind: 'done', target: 'grammar', button: 'Open grammar',
    title: 'All lessons mastered',
    text: 'Great work! You can practice any lesson again, or wait for new lessons.',
  };
}

// How many lessons are started, completed and mastered.
export function lessonOverview(data, lessons) {
  const statuses = lessons.map((lesson) => summaryOf(data, lesson).status);
  return {
    total: lessons.length,
    started: statuses.filter((s) => s !== 'not-started').length,
    completed: statuses.filter((s) => s === 'completed' || s === 'mastered').length,
    mastered: statuses.filter((s) => s === 'mastered').length,
  };
}

// Practice in the last 7 days. "writing" and "roleplay" are the saved writing and roleplay data.
// Saved writings and finished conversations count as practice days, but not as answers (they have no right or wrong).
export function practiceSummary(attempts, now = new Date(), writing = null, roleplay = null) {
  const since = now.getTime() - 7 * DAY_MS;
  const recent = (attempts ?? []).filter((a) => {
    const time = Date.parse(a?.at);
    return Number.isFinite(time) && time >= since && time <= now.getTime();
  });
  const firstTry = recent.filter((a) => a.firstTry === true).length;
  const timesOf = (list) => (list ?? []).map((e) => Date.parse(e?.at)).filter(Number.isFinite);
  const inWeek = (times) => times.filter((time) => time >= since && time <= now.getTime());
  const writingTimes = timesOf(writing?.history);
  const roleplayTimes = timesOf(roleplay?.log);
  const recentWriting = inWeek(writingTimes);
  const recentRoleplay = inWeek(roleplayTimes);
  const days = new Set([...recent.map((a) => a.at), ...recentWriting, ...recentRoleplay].map((at) => localDateString(new Date(at))));

  const times = [...timesOf(attempts), ...writingTimes, ...roleplayTimes];
  return {
    answers: recent.length,
    writings: recentWriting.length,
    roleplays: recentRoleplay.length,
    firstTry,
    accuracy: recent.length > 0 ? firstTry / recent.length : null,
    daysPracticed: days.size,
    lastPractice: times.length > 0 ? new Date(Math.max(...times)).toISOString() : null,
  };
}

// First-try accuracy for each skill tag.
// tagsFor(lessonId, exerciseId) returns the skill tags of that exercise (or []).
// Returns [{ tag, attempts, correct, accuracy }], lowest accuracy first.
export function skillStats(attempts, tagsFor) {
  const totals = new Map();
  for (const attempt of attempts ?? []) {
    for (const tag of tagsFor(attempt?.lessonId, attempt?.exerciseId) ?? []) {
      const entry = totals.get(tag) ?? { tag, attempts: 0, correct: 0 };
      entry.attempts += 1;
      if (attempt.firstTry === true) entry.correct += 1;
      totals.set(tag, entry);
    }
  }
  return [...totals.values()]
    .map((e) => ({ ...e, accuracy: e.correct / e.attempts }))
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts || a.tag.localeCompare(b.tag));
}

// The skills to work on: enough answers, and under 80% right on the first try.
export function weakAreas(stats, { minAttempts = MIN_SKILL_ATTEMPTS, below = WEAK_BELOW, limit = 3 } = {}) {
  return stats.filter((s) => s.attempts >= minAttempts && s.accuracy < below).slice(0, limit);
}

// True when at least one skill has enough answers to be judged.
export function hasEnoughSkillData(stats, minAttempts = MIN_SKILL_ATTEMPTS) {
  return stats.some((s) => s.attempts >= minAttempts);
}

// { never: true } or { never: false, days } (days since the last backup)
export function backupStatus(lastBackupAt, now = new Date()) {
  const time = Date.parse(lastBackupAt);
  if (!Number.isFinite(time)) return { never: true, days: null };
  return { never: false, days: Math.max(0, Math.floor((now.getTime() - time) / DAY_MS)) };
}
