import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activityByDay, calendarWeeks, weeklyStats, overallStats } from '../js/logic/reports.js';

const now = new Date(2026, 9, 19, 12, 0); // Monday, October 19, 2026
const at = (day, hour = 10) => new Date(2026, 9, day, hour, 0).toISOString();

const data = {
  attempts: [
    { at: at(19, 9), firstTry: true, review: false },
    { at: at(19, 11), firstTry: false, review: true },
    { at: at(18), firstTry: true, review: false },
    { at: new Date(2026, 8, 30, 10).toISOString(), firstTry: true, review: false },
    { at: 'not a date', firstTry: true },
  ],
  writing: { history: [{ at: at(19, 12) }, { at: 'bad' }] },
  roleplay: { log: [{ at: at(17) }, { at: at(1) }] },
};

test('activityByDay counts answers, saved writings and roleplays on local days', () => {
  const days = activityByDay(data, 14, now);
  assert.equal(days.length, 14);
  assert.equal(days[0].date, '2026-10-06');
  assert.deepEqual(
    { answers: days[13].answers, correct: days[13].correct, writings: days[13].writings, total: days[13].total },
    { answers: 2, correct: 1, writings: 1, total: 3 });
  assert.deepEqual(
    { answers: days[12].answers, correct: days[12].correct, total: days[12].total },
    { answers: 1, correct: 1, total: 1 });
  assert.equal(days[11].roleplays, 1);
  assert.equal(days.reduce((sum, day) => sum + day.total, 0), 5); // the September and bad entries are outside
});

test('calendarWeeks starts on a Monday, has complete rows, and marks future days', () => {
  const rows = calendarWeeks(data, 5, now);
  assert.equal(rows.length, 5);
  assert.equal(rows[0].days.length, 7);
  assert.equal(rows[0].days[0].date, '2026-09-21');
  assert.equal(rows[4].days[0].date, '2026-10-19');
  assert.equal(rows[4].days[0].dayOfMonth, 19);
  assert.equal(rows[4].days[0].total, 3);
  assert.equal(rows[4].days[0].future, false);
  assert.equal(rows[4].days[1].future, true);
});

test('weeklyStats groups the last 8 weeks and handles weeks with no answers', () => {
  const buckets = weeklyStats(data.attempts, 8, now);
  assert.equal(buckets.length, 8);
  assert.equal(buckets[0].start, '2026-08-25');
  assert.equal(buckets[0].accuracy, null);
  const last = buckets[7];
  assert.deepEqual(
    { answers: last.answers, correct: last.correct, accuracy: last.accuracy, reviewTotal: last.reviewTotal, reviewCorrect: last.reviewCorrect },
    { answers: 3, correct: 2, accuracy: 2 / 3, reviewTotal: 1, reviewCorrect: 0 });
  assert.equal(buckets.reduce((sum, b) => sum + b.answers, 0), 4); // the September answer is inside the range
});

test('weeklyStats with no answers gives empty weeks, not NaN', () => {
  const buckets = weeklyStats([], 4, now);
  assert.equal(buckets.length, 4);
  for (const bucket of buckets) {
    assert.equal(bucket.accuracy, null);
    assert.equal(bucket.answers, 0);
  }
});

test('overallStats counts all practice and different practice days', () => {
  const totals = overallStats(data, now);
  assert.deepEqual(
    { answers: totals.answers, correct: totals.correct, accuracy: totals.accuracy },
    { answers: 4, correct: 3, accuracy: 0.75 });
  assert.equal(totals.writings, 1);
  assert.equal(totals.roleplays, 2);
  assert.equal(totals.practiceDays, 5);
  assert.equal(totals.lastPractice, at(19, 12));
});

test('overallStats with no data is safe', () => {
  const totals = overallStats({}, now);
  assert.equal(totals.answers, 0);
  assert.equal(totals.accuracy, null);
  assert.equal(totals.practiceDays, 0);
  assert.equal(totals.lastPractice, null);
});
