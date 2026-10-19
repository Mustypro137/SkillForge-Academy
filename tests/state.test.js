import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  initState, getData, getWarning, getSaveError, updateData, replaceData, resetData, subscribe,
  saveWritingDraft, recordWriting, recordRoleplay,
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

// ----- mistake notebook -----

import { setMistakeNote, deleteMistake } from '../js/state.js';

test('a wrong answer in a lesson goes to the notebook (box 1, due tomorrow)', () => {
  initState(fakeStorage());
  recordExerciseResult(info({ outcome: 'incorrect', answer: 'want', tries: 2 }), new Date(2026, 9, 19, 12));
  const m = getData().mistakes['l1/e1'];
  assert.equal(m.box, 1);
  assert.equal(m.dueDate, '2026-10-20');
  assert.equal(m.lastWrongAnswer, 'want');
  assert.equal(m.timesWrong, 1);
});

test('right answers and right-with-help do not go to the notebook', () => {
  initState(fakeStorage());
  recordExerciseResult(info({ outcome: 'correct' }));
  recordExerciseResult(info({ exerciseId: 'e2', outcome: 'correct-with-help' }));
  assert.deepEqual(getData().mistakes, {});
});

test('a wrong answer in extra practice also goes to the notebook', () => {
  initState(fakeStorage());
  recordExerciseResult(info({ outcome: 'incorrect', practice: true }));
  assert.ok(getData().mistakes['l1/e1']);
  assert.deepEqual(getData().progress, {});
});

test('the same exercise wrong twice is one mistake that counts twice', () => {
  initState(fakeStorage());
  recordExerciseResult(info({ outcome: 'incorrect' }));
  recordExerciseResult(info({ outcome: 'incorrect' }));
  assert.equal(Object.keys(getData().mistakes).length, 1);
  assert.equal(getData().mistakes['l1/e1'].timesWrong, 2);
});

test('a review updates the mistake, adds an attempt and does not change lesson progress', () => {
  initState(fakeStorage());
  recordExerciseResult(info({ outcome: 'incorrect' }), new Date(2026, 9, 1, 12));
  const progressBefore = JSON.stringify(getData().progress);
  recordExerciseResult(info({ outcome: 'correct', review: true }), new Date(2026, 9, 2, 12));
  const m = getData().mistakes['l1/e1'];
  assert.equal(m.box, 2);
  assert.equal(m.dueDate, '2026-10-04');
  const last = getData().attempts.at(-1);
  assert.equal(last.review, true);
  assert.equal(last.practice, true);
  assert.equal(JSON.stringify(getData().progress), progressBefore);
});

test('reviewing a mistake that was deleted does nothing', () => {
  initState(fakeStorage());
  recordExerciseResult(info({ outcome: 'correct', review: true }));
  assert.deepEqual(getData().mistakes, {});
});

test('notes are saved (500 characters at most) and mistakes can be deleted', () => {
  initState(fakeStorage());
  recordExerciseResult(info({ outcome: 'incorrect' }));
  setMistakeNote('l1/e1', 'x'.repeat(600));
  assert.equal(getData().mistakes['l1/e1'].note.length, 500);
  setMistakeNote('missing', 'hello'); // no crash
  deleteMistake('l1/e1');
  assert.deepEqual(getData().mistakes, {});
});

test('a writing draft is saved, survives a restart, and is removed when the text is empty', () => {
  const store = fakeStorage();
  initState(store);
  saveWritingDraft('wr-01', 'Hi Sam,', new Date('2026-10-19T10:00:00Z'));
  initState(store);
  assert.equal(getData().writing.drafts['wr-01'].text, 'Hi Sam,');
  saveWritingDraft('wr-01', '   ');
  assert.deepEqual(getData().writing.drafts, {});
});

test('recordWriting adds a history entry with the result, checklist, rating and note', () => {
  const store = fakeStorage();
  initState(store);
  const result = { wordCount: 42, passed: 5, total: 6 };
  recordWriting({ taskId: 'wr-01', text: 'My text', result, checklist: [true, false, true], rating: 'good', note: 'Next time: shorter' },
    new Date('2026-10-19T10:00:00Z'));
  const entry = getData().writing.history[0];
  assert.equal(entry.taskId, 'wr-01');
  assert.equal(entry.wordCount, 42);
  assert.deepEqual([entry.checksPassed, entry.checksTotal], [5, 6]);
  assert.deepEqual([entry.checklistDone, entry.checklistTotal], [2, 3]);
  assert.equal(entry.rating, 'good');
  assert.equal(entry.at, '2026-10-19T10:00:00.000Z');
  assert.equal(JSON.parse(store.getItem(STORAGE_KEY)).writing.history.length, 1);
});

test('recordRoleplay saves the result, keeps the best percent, and survives a restart', () => {
  const store = fakeStorage();
  initState(store);
  recordRoleplay('rp-01', { percent: 90, best: 4, ok: 1, weak: 0 }, new Date('2026-10-19T10:00:00Z'));
  recordRoleplay('rp-01', { percent: 40, best: 1, ok: 2, weak: 2 }, new Date('2026-10-20T10:00:00Z'));
  initState(store);
  const result = getData().roleplay.results['rp-01'];
  assert.deepEqual([result.runs, result.bestPercent, result.lastPercent], [2, 90, 40]);
  assert.equal(getData().roleplay.log.length, 2);
});
