import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nextStep, lessonOverview, practiceSummary, skillStats, weakAreas, hasEnoughSkillData, backupStatus,
} from '../js/logic/dashboard.js';

const now = new Date(2026, 9, 19, 12, 0); // 19 Oct 2026, local time
const daysAgo = (n, hour = 12) => new Date(2026, 9, 19 - n, hour).toISOString();

const lessons = [
  { id: 'l2', order: 2, title: 'Two', exercises: [{ id: 'a' }, { id: 'b' }] },
  { id: 'l1', order: 1, title: 'One', exercises: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] },
];
const emptyData = () => ({ progress: {}, attempts: [], mistakes: {} });
const entry = (status, answered = {}, lastScore = null) => ({ status, answered, lastScore, bestScore: lastScore });

// ----- next step -----

test('a new user is told to start the first lesson (by order)', () => {
  const step = nextStep(emptyData(), lessons, now);
  assert.equal(step.kind, 'start');
  assert.equal(step.lessonId, 'l1');
  assert.match(step.title, /first lesson/);
});

test('due mistakes come first, even when a lesson is in progress', () => {
  const data = emptyData();
  data.progress.l1 = entry('in-progress', { a: 'correct' });
  data.mistakes['l1/a'] = { lessonId: 'l1', exerciseId: 'a', status: 'active', dueDate: '2026-10-19' };
  const step = nextStep(data, lessons, now);
  assert.equal(step.kind, 'review');
  assert.equal(step.target, 'mistakes');
  assert.equal(step.title, 'Review 1 mistake');
});

test('mistakes that are not due yet do not count; plural is correct', () => {
  const data = emptyData();
  data.mistakes.x = { lessonId: 'l1', exerciseId: 'a', status: 'active', dueDate: '2026-10-25' };
  assert.notEqual(nextStep(data, lessons, now).kind, 'review');
  data.mistakes.y = { lessonId: 'l1', exerciseId: 'b', status: 'active', dueDate: '2026-10-01' };
  data.mistakes.z = { lessonId: 'l1', exerciseId: 'c', status: 'active', dueDate: '2026-10-02' };
  assert.equal(nextStep(data, lessons, now).title, 'Review 2 mistakes');
});

test('a lesson in progress is continued', () => {
  const data = emptyData();
  data.progress.l1 = entry('in-progress', { a: 'correct', b: 'incorrect' });
  const step = nextStep(data, lessons, now);
  assert.equal(step.kind, 'continue');
  assert.equal(step.lessonId, 'l1');
  assert.match(step.text, /2 of 4/);
});

test('when the first lesson is finished, the next not-started lesson is suggested', () => {
  const data = emptyData();
  data.progress.l1 = entry('mastered', { a: 'correct', b: 'correct', c: 'correct', d: 'correct' }, 1);
  const step = nextStep(data, lessons, now);
  assert.equal(step.kind, 'start');
  assert.equal(step.lessonId, 'l2');
  assert.doesNotMatch(step.title, /first lesson/);
});

test('a finished lesson under 80% is suggested for improvement', () => {
  const data = emptyData();
  data.progress.l1 = entry('mastered', { a: 'correct', b: 'correct', c: 'correct', d: 'correct' }, 1);
  data.progress.l2 = entry('completed', { a: 'correct', b: 'incorrect' }, 0.5);
  const step = nextStep(data, lessons, now);
  assert.equal(step.kind, 'improve');
  assert.equal(step.lessonId, 'l2');
  assert.match(step.text, /50%/);
});

test('everything mastered gives the "done" message; no lessons also does not crash', () => {
  const data = emptyData();
  data.progress.l1 = entry('mastered', { a: 'correct', b: 'correct', c: 'correct', d: 'correct' }, 1);
  data.progress.l2 = entry('mastered', { a: 'correct', b: 'correct' }, 1);
  assert.equal(nextStep(data, lessons, now).kind, 'done');
  assert.equal(nextStep(emptyData(), [], now).kind, 'done');
});

// ----- lessons -----

test('lessonOverview counts started, completed and mastered', () => {
  const data = emptyData();
  data.progress.l1 = entry('mastered', { a: 'correct', b: 'correct', c: 'correct', d: 'correct' }, 1);
  data.progress.l2 = entry('in-progress', { a: 'correct' });
  assert.deepEqual(lessonOverview(data, lessons), { total: 2, started: 2, completed: 1, mastered: 1 });
  assert.deepEqual(lessonOverview(emptyData(), lessons), { total: 2, started: 0, completed: 0, mastered: 0 });
});

// ----- practice in the last 7 days -----

test('practiceSummary counts only the last 7 days', () => {
  const attempts = [
    { at: daysAgo(0), firstTry: true },
    { at: daysAgo(0, 9), firstTry: false },
    { at: daysAgo(3), firstTry: true },
    { at: daysAgo(8), firstTry: true },   // too old
    { at: 'not a date', firstTry: true }, // damaged
  ];
  const s = practiceSummary(attempts, now);
  assert.equal(s.answers, 3);
  assert.equal(s.firstTry, 2);
  assert.equal(Math.round(s.accuracy * 100), 67);
  assert.equal(s.daysPracticed, 2);
  assert.equal(s.lastPractice, new Date(daysAgo(0)).toISOString());
});

test('practiceSummary with no attempts has no accuracy and no date', () => {
  assert.deepEqual(practiceSummary([], now), { answers: 0, writings: 0, roleplays: 0, firstTry: 0, accuracy: null, daysPracticed: 0, lastPractice: null });
  assert.equal(practiceSummary(undefined, now).answers, 0);
});

test('last practice can be older than 7 days', () => {
  const s = practiceSummary([{ at: daysAgo(20), firstTry: true }], now);
  assert.equal(s.answers, 0);
  assert.ok(s.lastPractice);
});

// ----- skills -----

const tagsFor = (lessonId, exerciseId) => ({ 'l1/a': ['x', 'y'], 'l1/b': ['x'], 'l1/c': ['z'] })[`${lessonId}/${exerciseId}`];
const attempt = (exerciseId, firstTry) => ({ lessonId: 'l1', exerciseId, firstTry });

test('skillStats groups attempts by tag, lowest accuracy first, unknown exercises ignored', () => {
  const stats = skillStats([
    attempt('a', true), attempt('a', false), attempt('b', false), attempt('c', true), attempt('zzz', true),
  ], tagsFor);
  assert.deepEqual(stats.map((s) => [s.tag, s.attempts, s.correct]), [
    ['x', 3, 1], ['y', 2, 1], ['z', 1, 1],
  ]);
  assert.equal(stats[0].accuracy, 1 / 3);
});

test('weakAreas needs enough answers, is under 80%, and shows at most 3', () => {
  const stats = [
    { tag: 'a', attempts: 10, correct: 2, accuracy: 0.2 },
    { tag: 'b', attempts: 4, correct: 0, accuracy: 0 },       // too few answers
    { tag: 'c', attempts: 5, correct: 4, accuracy: 0.8 },     // exactly 80% is not weak
    { tag: 'd', attempts: 6, correct: 3, accuracy: 0.5 },
    { tag: 'e', attempts: 8, correct: 4, accuracy: 0.5 },
    { tag: 'f', attempts: 9, correct: 6, accuracy: 6 / 9 },
  ];
  assert.deepEqual(weakAreas(stats).map((s) => s.tag), ['a', 'd', 'e']);
  assert.deepEqual(weakAreas(stats, { limit: 5 }).map((s) => s.tag), ['a', 'd', 'e', 'f']);
  assert.deepEqual(weakAreas([]), []);
});

test('hasEnoughSkillData', () => {
  assert.equal(hasEnoughSkillData([{ attempts: 4 }]), false);
  assert.equal(hasEnoughSkillData([{ attempts: 4 }, { attempts: 5 }]), true);
  assert.equal(hasEnoughSkillData([]), false);
});

// ----- backup -----

test('backupStatus', () => {
  assert.deepEqual(backupStatus(null, now), { never: true, days: null });
  assert.deepEqual(backupStatus('rubbish', now), { never: true, days: null });
  assert.deepEqual(backupStatus(daysAgo(0), now), { never: false, days: 0 });
  assert.deepEqual(backupStatus(daysAgo(10), now), { never: false, days: 10 });
  assert.equal(backupStatus(new Date(2027, 0, 1).toISOString(), now).days, 0); // date in the future
});

test('saved writing counts as a practice day and as last practice, but not as an answer', () => {
  const writing = { drafts: {}, history: [{ taskId: 'wr-01', at: daysAgo(1) }, { taskId: 'wr-02', at: daysAgo(20) }] };
  const s = practiceSummary([], now, writing);
  assert.equal(s.answers, 0);
  assert.equal(s.accuracy, null);
  assert.equal(s.writings, 1);
  assert.equal(s.daysPracticed, 1);
  assert.equal(new Date(s.lastPractice).getTime(), new Date(daysAgo(1)).getTime());
});

test('a day with both answers and writing counts once', () => {
  const at = daysAgo(2);
  const s = practiceSummary([{ at, firstTry: true }], now, { history: [{ at }] });
  assert.equal(s.daysPracticed, 1);
});

test('finished roleplay conversations count as practice days and as last practice, but not as answers', () => {
  const roleplay = { results: {}, log: [{ scenarioId: 'rp-01', at: daysAgo(1), percent: 80 }, { scenarioId: 'rp-02', at: daysAgo(20), percent: 50 }] };
  const s = practiceSummary([], now, null, roleplay);
  assert.equal(s.answers, 0);
  assert.equal(s.roleplays, 1);
  assert.equal(s.writings, 0);
  assert.equal(s.daysPracticed, 1);
  assert.equal(new Date(s.lastPractice).getTime(), new Date(daysAgo(1)).getTime());
});

test('answers, writing and roleplay on the same day count as one practice day', () => {
  const at = daysAgo(3);
  const s = practiceSummary([{ at, firstTry: true }], now, { history: [{ at }] }, { log: [{ at }] });
  assert.equal(s.daysPracticed, 1);
  assert.equal(s.writings, 1);
  assert.equal(s.roleplays, 1);
});
