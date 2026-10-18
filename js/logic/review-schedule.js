// When to review mistakes. Pure functions: they return NEW objects and never save anything.
//
// Method: 5 boxes (the Leitner system). A mistake starts in box 1.
//   Box:                 1   2   3   4   5
//   Review again after:  1   2   4   8   16 days
// In a review:
//   right on the first try  -> up one box (right in box 5 = "mastered")
//   right, but needed help  -> stays in the same box
//   wrong                   -> back to box 1
// A wrong answer in a lesson also puts the mistake in box 1, due tomorrow.
//
// Dates are local dates written "YYYY-MM-DD" (so "today" changes at your midnight).

import { localDateString } from '../storage.js';

export const INTERVAL_DAYS = [1, 2, 4, 8, 16]; // index 0 = box 1
export const MAX_BOX = INTERVAL_DAYS.length;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function mistakeKey(lessonId, exerciseId) {
  return `${lessonId}/${exerciseId}`;
}

// "2026-12-31" + 1 -> "2027-01-01"
export function addDays(dateString, days) {
  const [year, month, day] = dateString.split('-').map(Number);
  return localDateString(new Date(year, month - 1, day + days));
}

function clampBox(value) {
  const box = Math.floor(Number(value));
  if (!Number.isFinite(box) || box < 1) return 1;
  return Math.min(box, MAX_BOX);
}

// A wrong answer in a lesson. "existing" is the saved mistake for this exercise, if any.
export function recordMistake(existing, { lessonId, exerciseId, answer }, now = new Date()) {
  const today = localDateString(now);
  return {
    lessonId,
    exerciseId,
    lastWrongAnswer: String(answer ?? ''),
    timesWrong: (Number(existing?.timesWrong) || 0) + 1,
    box: 1,
    dueDate: addDays(today, INTERVAL_DAYS[0]),
    status: 'active',
    note: typeof existing?.note === 'string' ? existing.note : '',
    createdAt: existing?.createdAt ?? now.toISOString(),
    lastWrongAt: now.toISOString(),
    lastReviewedAt: existing?.lastReviewedAt ?? null,
  };
}

// The result of reviewing a mistake. outcome: 'correct', 'correct-with-help' or 'incorrect'.
export function applyReview(mistake, outcome, answer, now = new Date()) {
  const today = localDateString(now);
  const reviewedAt = now.toISOString();
  const box = clampBox(mistake.box);

  if (outcome === 'correct') {
    if (box >= MAX_BOX) {
      return { ...mistake, box: MAX_BOX, status: 'mastered', dueDate: null, lastReviewedAt: reviewedAt };
    }
    return {
      ...mistake, box: box + 1, status: 'active',
      dueDate: addDays(today, INTERVAL_DAYS[box]), lastReviewedAt: reviewedAt,
    };
  }
  if (outcome === 'correct-with-help') {
    return {
      ...mistake, box, status: 'active',
      dueDate: addDays(today, INTERVAL_DAYS[box - 1]), lastReviewedAt: reviewedAt,
    };
  }
  return {
    ...mistake, box: 1, status: 'active', dueDate: addDays(today, INTERVAL_DAYS[0]),
    timesWrong: (Number(mistake.timesWrong) || 0) + 1,
    lastWrongAnswer: String(answer ?? ''), lastWrongAt: reviewedAt, lastReviewedAt: reviewedAt,
  };
}

export function isMastered(mistake) {
  return mistake.status === 'mastered';
}

// Due today or overdue. A missing or damaged date counts as due, so the mistake is not lost.
export function isDue(mistake, today) {
  if (isMastered(mistake)) return false;
  return !DATE_PATTERN.test(String(mistake.dueDate)) || mistake.dueDate <= today;
}

// Sorts saved mistakes into the notebook lists. Each item is { key, mistake }.
//   due:      to review today (oldest first)
//   active:   all mistakes still being learned
//   mastered: finished
//   nextDue:  the next review date when nothing is due today (or null)
export function listMistakes(mistakes, now = new Date()) {
  const today = localDateString(now);
  const items = Object.entries(mistakes ?? {})
    .filter(([, m]) => typeof m?.lessonId === 'string' && typeof m?.exerciseId === 'string')
    .map(([key, mistake]) => ({ key, mistake }));

  const byDate = (a, b) => String(a.mistake.dueDate).localeCompare(String(b.mistake.dueDate)) || a.key.localeCompare(b.key);
  const active = items.filter((i) => !isMastered(i.mistake)).sort(byDate);
  const due = active.filter((i) => isDue(i.mistake, today));
  const mastered = items.filter((i) => isMastered(i.mistake)).sort((a, b) => a.key.localeCompare(b.key));
  const upcoming = active.filter((i) => !isDue(i.mistake, today));

  return { due, active, mastered, nextDue: upcoming.length > 0 ? upcoming[0].mistake.dueDate : null };
}

// "due now", "tomorrow" or "on 2026-10-25"
export function describeDue(dueDate, now = new Date()) {
  const today = localDateString(now);
  if (!DATE_PATTERN.test(String(dueDate)) || dueDate <= today) return 'due now';
  if (dueDate === addDays(today, 1)) return 'tomorrow';
  return `on ${dueDate}`;
}
