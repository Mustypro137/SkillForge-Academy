import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MASTERED_SCORE, emptyEntry, scoreFromAnswered, startRun, applyOutcome, unansweredIds, lessonSummary,
} from '../js/logic/progress.js';

const ids = ['e1', 'e2', 'e3', 'e4', 'e5'];

function answerAll(outcomes, entry) {
  let current = entry;
  ids.forEach((id, i) => { current = applyOutcome(current, id, outcomes[i], ids); });
  return current;
}

test('a lesson with no entry is not started', () => {
  const s = lessonSummary(undefined, ids);
  assert.deepEqual([s.status, s.answeredCount, s.total], ['not-started', 0, 5]);
});

test('first answer makes the lesson in-progress and remembers the exercise', () => {
  const entry = applyOutcome(undefined, 'e1', 'correct', ids);
  assert.equal(entry.status, 'in-progress');
  assert.equal(entry.lastExerciseId, 'e1');
  assert.equal(lessonSummary(entry, ids).answeredCount, 1);
  assert.deepEqual(unansweredIds(entry, ids), ['e2', 'e3', 'e4', 'e5']);
});

test('applyOutcome does not change the entry it receives', () => {
  const before = applyOutcome(undefined, 'e1', 'correct', ids);
  const copy = JSON.parse(JSON.stringify(before));
  applyOutcome(before, 'e2', 'incorrect', ids);
  assert.deepEqual(before, copy);
});

test('score counts only first-try correct answers', () => {
  const answered = { e1: 'correct', e2: 'correct-with-help', e3: 'incorrect', e4: 'correct' };
  assert.equal(scoreFromAnswered(answered, ids), 2 / 5);
  assert.equal(scoreFromAnswered({}, []), 0);
});

test('all answered with 80% or more is mastered', () => {
  const entry = answerAll(['correct', 'correct', 'correct', 'correct', 'incorrect']);
  assert.equal(MASTERED_SCORE, 0.8);
  assert.equal(entry.status, 'mastered');
  assert.equal(entry.lastScore, 0.8);
  assert.ok(entry.completedAt);
});

test('all answered below 80% is completed', () => {
  const entry = answerAll(['correct', 'correct', 'correct', 'incorrect', 'incorrect']);
  assert.equal(entry.status, 'completed');
  assert.equal(entry.lastScore, 0.6);
});

test('help does not count as first-try correct', () => {
  const entry = answerAll(Array(5).fill('correct-with-help'));
  assert.equal(entry.lastScore, 0);
  assert.equal(entry.status, 'completed');
});

test('start again keeps the best score and clears the answers', () => {
  const done = answerAll(['correct', 'correct', 'correct', 'correct', 'correct']);
  const again = startRun(done);
  assert.equal(again.status, 'in-progress');
  assert.deepEqual(again.answered, {});
  assert.equal(again.bestScore, 1);
  const worse = answerAll(['incorrect', 'incorrect', 'incorrect', 'incorrect', 'incorrect'], again);
  assert.equal(worse.lastScore, 0);
  assert.equal(worse.bestScore, 1);
});

test('a finished lesson becomes in-progress when new exercises are added', () => {
  const done = answerAll(Array(5).fill('correct'));
  assert.equal(lessonSummary(done, ids).status, 'mastered');
  assert.equal(lessonSummary(done, [...ids, 'e6']).status, 'in-progress');
});

test('damaged entries do not crash', () => {
  const broken = { status: 'in-progress', answered: 'oops' };
  assert.equal(lessonSummary(broken, ids).answeredCount, 0);
  assert.deepEqual(unansweredIds(broken, ids), ids);
  assert.equal(applyOutcome(broken, 'e1', 'correct', ids).answered.e1, 'correct');
  assert.deepEqual(emptyEntry().answered, {});
});
