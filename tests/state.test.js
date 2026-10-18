import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initState, getData, getWarning, getSaveError, updateData, replaceData, resetData, subscribe,
} from '../js/state.js';
import { STORAGE_KEY, createDefaultData } from '../js/storage.js';

function fakeStorage() {
  const items = new Map();
  return {
    items,
    getItem: (k) => (items.has(k) ? items.get(k) : null),
    setItem: (k, v) => { items.set(k, String(v)); },
  };
}

test('updateData changes memory, saves, and tells listeners', () => {
  const store = fakeStorage();
  initState(store);
  let calls = 0;
  const stop = subscribe(() => { calls++; });

  updateData((d) => { d.settings.theme = 'dark'; });

  assert.equal(getData().settings.theme, 'dark');
  assert.equal(JSON.parse(store.getItem(STORAGE_KEY)).settings.theme, 'dark');
  assert.equal(calls, 1);

  stop();
  updateData((d) => { d.settings.theme = 'light'; });
  assert.equal(calls, 1);
});

test('data survives a restart (new initState with the same storage)', () => {
  const store = fakeStorage();
  initState(store);
  updateData((d) => { d.progress['l1'] = { status: 'completed' }; });
  initState(store);
  assert.deepEqual(getData().progress, { l1: { status: 'completed' } });
});

test('replaceData and resetData save the new data', () => {
  const store = fakeStorage();
  initState(store);
  const other = createDefaultData();
  other.mistakes['a/b'] = { timesWrong: 3 };
  replaceData(other);
  assert.deepEqual(JSON.parse(store.getItem(STORAGE_KEY)).mistakes, { 'a/b': { timesWrong: 3 } });
  resetData();
  assert.deepEqual(getData().mistakes, {});
  assert.deepEqual(JSON.parse(store.getItem(STORAGE_KEY)).mistakes, {});
});

test('a failing save is reported by getSaveError and the app keeps working', () => {
  const store = fakeStorage();
  initState(store);
  store.setItem = () => { throw new Error('nope'); };
  updateData((d) => { d.settings.fontSize = 20; });
  assert.equal(getData().settings.fontSize, 20);
  assert.ok(getSaveError());
});

test('corrupt saved data gives a warning', () => {
  const store = fakeStorage();
  store.setItem(STORAGE_KEY, '{abc');
  initState(store);
  assert.equal(getWarning(), 'corrupt');
});

// ----- recording exercise results -----

import { recordExerciseResult, startLessonRun } from '../js/state.js';

const ids = ['e1', 'e2'];
const info = (extra = {}) => ({
  lessonId: 'l1', exerciseId: 'e1', exerciseIds: ids, outcome: 'correct',
  answer: 'wants', tries: 0, hintsUsed: 0, ...extra,
});

test('recordExerciseResult adds an attempt and updates progress', () => {
  initState(fakeStorage());
  recordExerciseResult(info());
  const d = getData();
  assert.equal(d.attempts.length, 1);
  assert.equal(d.attempts[0].exerciseId, 'e1');
  assert.equal(d.attempts[0].firstTry, true);
  assert.equal(d.progress.l1.answered.e1, 'correct');
  assert.equal(d.progress.l1.status, 'in-progress');
});

test('finishing the last exercise completes the lesson', () => {
  initState(fakeStorage());
  recordExerciseResult(info());
  recordExerciseResult(info({ exerciseId: 'e2', outcome: 'incorrect', tries: 2 }));
  assert.equal(getData().progress.l1.status, 'completed');
  assert.equal(getData().progress.l1.lastScore, 0.5);
  assert.equal(getData().attempts[1].firstTry, false);
});

test('practice results are saved as attempts but do not change progress', () => {
  initState(fakeStorage());
  recordExerciseResult(info({ practice: true }));
  assert.equal(getData().attempts.length, 1);
  assert.equal(getData().attempts[0].practice, true);
  assert.deepEqual(getData().progress, {});
});

test('attempts stay capped at the maximum', () => {
  initState(fakeStorage());
  updateData((d) => { d.attempts = Array.from({ length: 3000 }, (_, i) => ({ n: i })); });
  recordExerciseResult(info());
  assert.equal(getData().attempts.length, 3000);
  assert.equal(getData().attempts[0].n, 1);
});

test('startLessonRun clears answers and keeps the best score', () => {
  initState(fakeStorage());
  recordExerciseResult(info());
  recordExerciseResult(info({ exerciseId: 'e2' }));
  startLessonRun('l1');
  assert.deepEqual(getData().progress.l1.answered, {});
  assert.equal(getData().progress.l1.bestScore, 1);
});
