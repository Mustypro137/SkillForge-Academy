import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTarget } from '../js/logic/typing-target.js';

const texts = [
  { id: '1', category: 'a', text: 'one two three' },
  { id: '2', category: 'a', text: 'four five six' },
  { id: '3', category: 'b', text: 'only in b' },
];
const fixedRandom = () => 0;

test('untimed (minChars 0) gives exactly one text from the category', () => {
  const t = buildTarget(texts, { category: 'a', random: fixedRandom });
  assert.ok(['one two three', 'four five six'].includes(t));
});

test('long minChars joins several texts with a space', () => {
  const t = buildTarget(texts, { category: 'a', minChars: 25, random: fixedRandom });
  assert.ok(t.length >= 25);
  assert.ok(!t.includes('only in b'));
  assert.ok(!t.includes('  '));
});

test('works when minChars is larger than all texts together', () => {
  const t = buildTarget(texts, { category: 'b', minChars: 100, random: fixedRandom });
  assert.ok(t.length >= 100);
});

test('unknown category throws a clear error', () => {
  assert.throws(() => buildTarget(texts, { category: 'zzz' }), /No typing texts/);
});
