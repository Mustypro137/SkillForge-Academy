// Keeps your data in memory while the app runs, and saves it after every change.
// Pages read with getData() and change data with updateData(). They never touch
// storage directly.

import { loadData, saveData, createDefaultData, MAX_ATTEMPTS } from './storage.js';
import { applyOutcome, startRun } from './logic/progress.js';
import { mistakeKey, recordMistake, applyReview } from './logic/review-schedule.js';

let storage = null;
let data = null;
let warning = null;
let saveError = null;
const listeners = new Set();

function notify() {
  for (const listener of listeners) listener(data);
}

// Call once when the app starts. "store" is window.localStorage (or a fake in tests).
export function initState(store, now = new Date()) {
  storage = store;
  ({ data, warning } = loadData(storage, now));
  saveError = null;
}

export function getData() { return data; }
export function getWarning() { return warning; }
export function getSaveError() { return saveError; }

// Runs change(data), then saves. Example: updateData((d) => { d.settings.theme = 'dark'; })
export function updateData(change) {
  change(data);
  persist();
}

// Replaces everything (used by import and reset).
export function replaceData(newData) {
  data = newData;
  warning = null;
  persist();
}

export function resetData(now = new Date()) {
  replaceData(createDefaultData(now));
}

// Saves the result of one finished exercise.
//   - always adds an attempt (the history, newest last, capped)
//   - lesson: updates the lesson progress; a wrong answer ('incorrect') goes to the mistake notebook
//   - practice: extra practice, the lesson progress is not changed (wrong answers still go to the notebook)
//   - review: a mistake from the notebook is reviewed; its box and date are updated
export function recordExerciseResult(info, now = new Date()) {
  const { lessonId, exerciseId, exerciseIds, outcome, answer, tries, hintsUsed, review = false } = info;
  const practice = info.practice === true || review;
  const key = mistakeKey(lessonId, exerciseId);
  updateData((d) => {
    d.attempts.push({
      id: `a_${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      lessonId,
      exerciseId,
      answer,
      result: outcome,
      firstTry: outcome === 'correct',
      tries,
      hintsUsed,
      practice,
      review,
      at: now.toISOString(),
    });
    if (d.attempts.length > MAX_ATTEMPTS) d.attempts = d.attempts.slice(-MAX_ATTEMPTS);

    if (review) {
      if (d.mistakes[key]) d.mistakes[key] = applyReview(d.mistakes[key], outcome, answer, now);
      return;
    }
    if (!practice) d.progress[lessonId] = applyOutcome(d.progress[lessonId], exerciseId, outcome, exerciseIds, now);
    if (outcome === 'incorrect') d.mistakes[key] = recordMistake(d.mistakes[key], { lessonId, exerciseId, answer }, now);
  });
}

// Saves your own note on a mistake (at most 500 characters).
export function setMistakeNote(key, note) {
  updateData((d) => { if (d.mistakes[key]) d.mistakes[key].note = String(note).slice(0, 500); });
}

export function deleteMistake(key) {
  updateData((d) => { delete d.mistakes[key]; });
}

// Begins a fresh run of a lesson (keeps the best score).
export function startLessonRun(lessonId) {
  updateData((d) => { d.progress[lessonId] = startRun(d.progress[lessonId]); });
}

function persist() {
  const result = saveData(storage, data);
  saveError = result.ok ? null : result.error;
  notify();
}

// Calls listener(data) after every change. Returns a function that stops listening.
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
