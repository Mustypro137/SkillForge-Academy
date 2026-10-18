import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeStats, trackInput, countUncorrectedErrors, topMissedKeys,
} from '../js/logic/typing-stats.js';

const target250 = 'a'.repeat(250);
const typedWith5Wrong = 'a'.repeat(245) + 'b'.repeat(5);

test('worked example: 250 chars, 1 minute, 5 wrong, 260 keystrokes, 13 errors', () => {
  const r = computeStats({
    target: target250, typed: typedWith5Wrong,
    keystrokes: 260, errorKeystrokes: 13, elapsedMs: 60000,
  });
  assert.equal(r.grossWpm, 50);
  assert.equal(r.netWpm, 45);
  assert.equal(r.accuracy, 95);
  assert.equal(r.uncorrectedErrors, 5);
});

test('perfect typing: accuracy 100 and net WPM equals gross WPM', () => {
  const r = computeStats({
    target: target250, typed: target250,
    keystrokes: 250, errorKeystrokes: 0, elapsedMs: 60000,
  });
  assert.equal(r.accuracy, 100);
  assert.equal(r.netWpm, r.grossWpm);
  assert.equal(r.grossWpm, 50);
});

test('zero keystrokes gives 0 everywhere, no NaN', () => {
  const r = computeStats({ target: 'abc', typed: '', keystrokes: 0, errorKeystrokes: 0, elapsedMs: 5000 });
  assert.deepEqual([r.grossWpm, r.netWpm, r.accuracy], [0, 0, 0]);
});

test('zero, negative or invalid time gives 0 WPM, never Infinity or NaN', () => {
  for (const elapsedMs of [0, -100, NaN, undefined]) {
    const r = computeStats({ target: 'abc', typed: 'abc', keystrokes: 3, errorKeystrokes: 0, elapsedMs });
    assert.equal(r.grossWpm, 0);
    assert.equal(r.netWpm, 0);
    assert.ok(Number.isFinite(r.accuracy));
  }
});

test('net WPM is never below 0', () => {
  const r = computeStats({
    target: 'a'.repeat(50), typed: 'b'.repeat(50),
    keystrokes: 50, errorKeystrokes: 50, elapsedMs: 60000,
  });
  assert.equal(r.netWpm, 0);
  assert.equal(r.accuracy, 0);
});

test('corrected errors lower accuracy but not net WPM', () => {
  const r = computeStats({
    target: target250, typed: target250,
    keystrokes: 270, errorKeystrokes: 20, elapsedMs: 60000,
  });
  assert.equal(r.uncorrectedErrors, 0);
  assert.equal(r.netWpm, 50);
  assert.equal(r.accuracy, 92.6);
});

test('extra characters beyond the target count as errors', () => {
  assert.equal(countUncorrectedErrors('abc', 'abcde'), 2);
});

test('accuracy is rounded to 1 decimal, WPM to whole numbers', () => {
  const r = computeStats({
    target: 'a'.repeat(33), typed: 'a'.repeat(33),
    keystrokes: 33, errorKeystrokes: 1, elapsedMs: 7000,
  });
  assert.equal(r.accuracy, 97);
  assert.equal(r.grossWpm, 57);
});

test('errorKeystrokes larger than keystrokes is limited', () => {
  const r = computeStats({ target: 'ab', typed: 'ab', keystrokes: 2, errorKeystrokes: 9, elapsedMs: 1000 });
  assert.equal(r.accuracy, 0);
});

test('trackInput: correct and wrong characters are counted', () => {
  const r = trackInput('he', 'hex', 'hello');
  assert.equal(r.keystrokes, 1);
  assert.equal(r.errors, 1);
  assert.deepEqual(r.missed, ['l']);
  assert.deepEqual(trackInput('he', 'hel', 'hello'), { keystrokes: 1, errors: 0, missed: [] });
});

test('trackInput: Backspace is not a keystroke', () => {
  assert.deepEqual(trackInput('hex', 'he', 'hello'), { keystrokes: 0, errors: 0, missed: [] });
});

test('trackInput: an edit in the middle is ignored', () => {
  assert.deepEqual(trackInput('hello', 'hxllo!', 'hello world'), { keystrokes: 0, errors: 0, missed: [] });
});

test('topMissedKeys sorts by count and respects the limit', () => {
  const top = topMissedKeys({ e: 2, ',': 3, a: 1, b: 1 }, 3);
  assert.deepEqual(top, [{ key: ',', count: 3 }, { key: 'e', count: 2 }, { key: 'a', count: 1 }]);
  assert.deepEqual(topMissedKeys({}), []);
});
