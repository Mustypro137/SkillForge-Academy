// Keeps your data in memory while the app runs, and saves it after every change.
// Pages read with getData() and change data with updateData(). They never touch
// storage directly.

import { loadData, saveData, createDefaultData, MAX_ATTEMPTS } from './storage.js';
import { applyOutcome, startRun } from './logic/progress.js';

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
//   - updates the lesson progress too, unless this was extra practice
export function recordExerciseResult(info, now = new Date()) {
  const { lessonId, exerciseId, exerciseIds, outcome, answer, tries, hintsUsed, practice = false } = info;
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
      at: now.toISOString(),
    });
    if (d.attempts.length > MAX_ATTEMPTS) d.attempts = d.attempts.slice(-MAX_ATTEMPTS);
    if (!practice) d.progress[lessonId] = applyOutcome(d.progress[lessonId], exerciseId, outcome, exerciseIds, now);
  });
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
