import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkWriting, countWords, splitSentences } from '../js/logic/writing-check.js';

const task = {
  targetWords: { min: 5, max: 30 },
  checks: {
    greeting: true, closing: true, request: true,
    required: [{ label: 'Says the day', tip: 'Say the day.', any: ['friday', 'by '] }],
    avoid: [{ label: 'Professional', tip: 'Avoid casual words.', words: ['hey', 'gonna'] }],
  },
};
const good = 'Hi Sam,\n\nCould you send the file by Friday?\n\nThanks,\nAnna';
const find = (result, id) => result.results.find((r) => r.id === id);

test('countWords counts words and ignores symbols alone', () => {
  assert.equal(countWords('  Hello   world  '), 2);
  assert.equal(countWords('one - two'), 2);
  assert.equal(countWords(''), 0);
  assert.equal(countWords(null), 0);
});

test('splitSentences splits at . ! ? and new lines', () => {
  assert.deepEqual(splitSentences('One. Two! Three?\nFour'), ['One.', 'Two!', 'Three?', 'Four']);
});

test('empty text gives an empty result and no checks', () => {
  const result = checkWriting(task, '   \n ');
  assert.equal(result.empty, true);
  assert.equal(result.total, 0);
});

test('a good text passes every check', () => {
  const result = checkWriting(task, good);
  assert.equal(result.empty, false);
  assert.deepEqual(result.results.filter((r) => !r.ok).map((r) => r.id), []);
  assert.equal(result.passed, result.total);
});

test('length: too short and too long are reported with the numbers', () => {
  assert.equal(find(checkWriting(task, 'Hi Sam,\nThanks,\nAnna'), 'length').ok, false);
  assert.match(find(checkWriting(task, 'Hi Sam,\nThanks,\nAnna'), 'length').message, /short/);
  const long = `Hi Sam,\n${'word '.repeat(40)}\nThanks,\nAnna`;
  assert.match(find(checkWriting(task, long), 'length').message, /long/);
});

test('greeting must be on the first line', () => {
  assert.equal(find(checkWriting(task, good), 'greeting').ok, true);
  assert.equal(find(checkWriting(task, 'Could you send the file by Friday?\nThanks,\nAnna'), 'greeting').ok, false);
  assert.equal(find(checkWriting(task, 'Good morning Sam,\nCould you help?\nThanks,\nAnna'), 'greeting').ok, true);
});

test('closing needs a closing word and a name (same line or next line)', () => {
  const ok = (text) => find(checkWriting(task, text), 'closing').ok;
  assert.equal(ok(good), true);
  assert.equal(ok('Hi Sam,\nCould you help?\nThanks, Anna'), true);
  assert.equal(ok('Hi Sam,\nCould you help?\nBest regards,\nAnna'), true);
  assert.equal(ok('Hi Sam,\nCould you help?\nThanks,'), false);            // no name
  assert.equal(ok('Hi Sam,\nCould you help?\nThank you for your help.'), false);
  assert.equal(ok('Hi Sam,\nCould you help me today?'), false);            // no closing
});

test('request: a question mark or a request phrase', () => {
  const ok = (text) => find(checkWriting(task, text), 'request').ok;
  assert.equal(ok('Hi Sam,\nCan I use the file?\nThanks,\nAnna'), true);
  assert.equal(ok('Hi Sam,\nPlease send the file today.\nThanks,\nAnna'), true);
  assert.equal(ok('Hi Sam,\nI sent you the file today.\nThanks,\nAnna'), false);
});

test('required words: whole words, ignoring capitals', () => {
  const ok = (text) => find(checkWriting(task, text), 'required-0').ok;
  assert.equal(ok(good), true);
  assert.equal(ok('Hi Sam,\nCould you send the file FRIDAY please?\nThanks,\nAnna'), true);
  assert.equal(ok('Hi Sam,\nCould you send the file soon, thanks?\nThanks,\nAnna'), false);
  assert.match(find(checkWriting(task, 'Hi Sam,\nCould you send the file soon?\nThanks,\nAnna'), 'required-0').message, /Say the day/);
});

test('avoid words are listed when found', () => {
  const result = checkWriting(task, 'Hey Sam,\nI am gonna send the file by Friday, ok?\nThanks,\nAnna');
  const item = find(result, 'avoid-0');
  assert.equal(item.ok, false);
  assert.match(item.message, /hey, gonna/);
});

test('shouting: ALL CAPS words and many exclamation marks are flagged, tech words are not', () => {
  const ok = (text) => find(checkWriting(task, `Hi Sam,\n${text}\nThanks,\nAnna`), 'tone').ok;
  assert.equal(ok('Send the file NOW by Friday.'), false);
  assert.equal(ok('Send the file by Friday!!'), false);
  assert.equal(ok('Send it! Send it! Send it by Friday!'), false);
  assert.equal(ok('Send the JSON file by Friday!'), true);
  assert.equal(ok('Send the PDF by Friday.'), true);
});

test('long sentences: more than 25 words is flagged, and the message quotes the start', () => {
  const longSentence = `${'word '.repeat(26).trim()}.`;
  const result = checkWriting({ ...task, targetWords: { min: 1, max: 100 } }, `Hi Sam,\n${longSentence}\nThanks,\nAnna`);
  const item = find(result, 'sentences');
  assert.equal(item.ok, false);
  assert.match(item.message, /word word word word word word \.\.\./);
  assert.equal(find(checkWriting(task, good), 'sentences').ok, true);
});

test('curly quotes and apostrophes do not break the checks', () => {
  const result = checkWriting(task, 'Hi Sam,\nI’d like the file by Friday.\nThanks,\nAnna');
  assert.equal(find(result, 'request').ok, true);
});

test('checks that a task does not ask for are not run', () => {
  const result = checkWriting({ targetWords: { min: 1, max: 50 } }, 'Just some words here.');
  assert.deepEqual(result.results.map((r) => r.id), ['length', 'tone', 'sentences']);
});

test('a character limit is checked when the task has one', () => {
  const limited = { targetWords: { min: 1, max: 100 }, checks: { maxChars: 40 } };
  const ok = find(checkWriting(limited, 'Hi Sam, thanks for connecting.'), 'chars');
  assert.equal(ok.ok, true);
  assert.match(ok.message, /30 characters/);
  const long = find(checkWriting(limited, 'Hi Sam, thanks a lot for connecting with me today.'), 'chars');
  assert.equal(long.ok, false);
  assert.match(long.message, /Remove 10 characters/);
  assert.equal(find(checkWriting(task, good), 'chars'), undefined);   // no limit, no check
  assert.equal(find(checkWriting(limited, '   \n  '), 'chars'), undefined);   // empty text: no checks at all
});

test('the result never says "wrong": messages are advice', () => {
  const result = checkWriting(task, 'HEY!!! gonna send it');
  for (const r of result.results) assert.doesNotMatch(r.message, /\bwrong\b|\bmistake\b/i);
});
