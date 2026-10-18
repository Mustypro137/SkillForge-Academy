import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  INTERVAL_DAYS, MAX_BOX, mistakeKey, addDays, recordMistake, applyReview,
  isDue, listMistakes, describeDue,
} from '../js/logic/review-schedule.js';

const day = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min); // local time
const info = { lessonId: 'l1', exerciseId: 'e1', answer: 'want' };

function inBox(box) {
  return { ...recordMistake(undefined, info, day(2026, 10, 1)), box };
}

test('the intervals are 1, 2, 4, 8 and 16 days', () => {
  assert.deepEqual(INTERVAL_DAYS, [1, 2, 4, 8, 16]);
  assert.equal(MAX_BOX, 5);
  assert.equal(mistakeKey('l1', 'e1'), 'l1/e1');
});

test('a new mistake goes to box 1 and is due tomorrow', () => {
  const m = recordMistake(undefined, info, day(2026, 10, 19));
  assert.equal(m.box, 1);
  assert.equal(m.dueDate, '2026-10-20');
  assert.equal(m.timesWrong, 1);
  assert.equal(m.status, 'active');
  assert.equal(m.lastWrongAnswer, 'want');
  assert.equal(m.note, '');
});

test('a repeated mistake restarts at box 1, counts again and keeps the note', () => {
  const first = { ...recordMistake(undefined, info, day(2026, 10, 1)), box: 4, note: 'remember -s' };
  const again = recordMistake(first, { ...info, answer: 'wantt' }, day(2026, 10, 5));
  assert.equal(again.box, 1);
  assert.equal(again.timesWrong, 2);
  assert.equal(again.note, 'remember -s');
  assert.equal(again.createdAt, first.createdAt);
  assert.equal(again.dueDate, '2026-10-06');
});

test('a mastered mistake that is wrong again becomes active again', () => {
  const mastered = { ...inBox(5), status: 'mastered', dueDate: null };
  assert.equal(recordMistake(mastered, info, day(2026, 10, 9)).status, 'active');
});

test('right on the first try moves up one box with the right date', () => {
  const today = day(2026, 10, 19);
  const expected = { 1: [2, '2026-10-21'], 2: [3, '2026-10-23'], 3: [4, '2026-10-27'], 4: [5, '2026-11-04'] };
  for (const [from, [box, due]] of Object.entries(expected)) {
    const next = applyReview(inBox(Number(from)), 'correct', 'x', today);
    assert.equal(next.box, box, `from box ${from}`);
    assert.equal(next.dueDate, due, `from box ${from}`);
    assert.equal(next.status, 'active');
  }
});

test('right in box 5 means mastered and not due any more', () => {
  const next = applyReview(inBox(5), 'correct', 'x', day(2026, 10, 19));
  assert.equal(next.status, 'mastered');
  assert.equal(next.dueDate, null);
  assert.equal(isDue(next, '2099-01-01'), false);
});

test('right with help stays in the same box', () => {
  const next = applyReview(inBox(3), 'correct-with-help', 'x', day(2026, 10, 19));
  assert.equal(next.box, 3);
  assert.equal(next.dueDate, '2026-10-23');
});

test('wrong in a review goes back to box 1 and counts', () => {
  const next = applyReview(inBox(4), 'incorrect', 'wantt', day(2026, 10, 19));
  assert.equal(next.box, 1);
  assert.equal(next.dueDate, '2026-10-20');
  assert.equal(next.timesWrong, 2);
  assert.equal(next.lastWrongAnswer, 'wantt');
});

test('reviews do not change the mistake they receive', () => {
  const before = inBox(2);
  const copy = JSON.parse(JSON.stringify(before));
  applyReview(before, 'correct', 'x', day(2026, 10, 19));
  assert.deepEqual(before, copy);
});

test('a damaged box number is treated safely', () => {
  assert.equal(applyReview({ ...inBox(1), box: 'abc' }, 'correct', 'x', day(2026, 10, 19)).box, 2);
  assert.equal(applyReview({ ...inBox(1), box: 99 }, 'correct', 'x', day(2026, 10, 19)).status, 'mastered');
});

// ----- dates -----

test('addDays crosses month, year and leap-day borders', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2027-02-28', 1), '2027-03-01');
  assert.equal(addDays('2026-03-28', 16), '2026-04-13');
});

test('near midnight the local day is used, not UTC', () => {
  const late = recordMistake(undefined, info, day(2026, 10, 19, 23, 59));
  assert.equal(late.dueDate, '2026-10-20');
  const early = recordMistake(undefined, info, day(2026, 10, 20, 0, 1));
  assert.equal(early.dueDate, '2026-10-21');
});

// ----- the lists -----

test('due includes today and overdue, excludes future and mastered', () => {
  const mistakes = {
    overdue: { lessonId: 'l', exerciseId: 'a', status: 'active', dueDate: '2026-10-10', box: 1 },
    today: { lessonId: 'l', exerciseId: 'b', status: 'active', dueDate: '2026-10-19', box: 2 },
    future: { lessonId: 'l', exerciseId: 'c', status: 'active', dueDate: '2026-10-25', box: 2 },
    done: { lessonId: 'l', exerciseId: 'd', status: 'mastered', dueDate: null, box: 5 },
  };
  const lists = listMistakes(mistakes, day(2026, 10, 19, 8));
  assert.deepEqual(lists.due.map((i) => i.key), ['overdue', 'today']);
  assert.deepEqual(lists.active.map((i) => i.key), ['overdue', 'today', 'future']);
  assert.deepEqual(lists.mastered.map((i) => i.key), ['done']);
  assert.equal(lists.nextDue, '2026-10-25');
});

test('with nothing due, nextDue is the earliest future date; with nothing at all it is null', () => {
  const only = { x: { lessonId: 'l', exerciseId: 'a', status: 'active', dueDate: '2026-10-22' } };
  assert.equal(listMistakes(only, day(2026, 10, 19)).nextDue, '2026-10-22');
  assert.deepEqual(listMistakes({}, day(2026, 10, 19)), { due: [], active: [], mastered: [], nextDue: null });
});

test('a mistake with a missing or damaged date counts as due', () => {
  const damaged = { x: { lessonId: 'l', exerciseId: 'a', status: 'active', dueDate: 'soon' }, y: { lessonId: 'l', exerciseId: 'b' } };
  assert.equal(listMistakes(damaged, day(2026, 10, 19)).due.length, 2);
});

test('entries without lesson and exercise ids are ignored', () => {
  assert.equal(listMistakes({ bad: { foo: 1 }, worse: 5 }, day(2026, 10, 19)).active.length, 0);
});

test('describeDue', () => {
  const now = day(2026, 10, 19);
  assert.equal(describeDue('2026-10-19', now), 'due now');
  assert.equal(describeDue('2026-10-01', now), 'due now');
  assert.equal(describeDue('2026-10-20', now), 'tomorrow');
  assert.equal(describeDue('2026-10-25', now), 'on 2026-10-25');
  assert.equal(describeDue(null, now), 'due now');
});
