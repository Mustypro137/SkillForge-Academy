import { test } from 'node:test';
import assert from 'node:assert/strict';
import { typingTexts, categories } from '../content/typing-texts.js';

test('ids are unique', () => {
  const ids = typingTexts.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every text uses a known category', () => {
  const known = new Set(categories.map((c) => c.id));
  for (const t of typingTexts) assert.ok(known.has(t.category), t.id);
});

test('every category has at least 4 texts', () => {
  for (const c of categories) {
    assert.ok(typingTexts.filter((t) => t.category === c.id).length >= 4, c.id);
  }
});

test('texts use only plain keyboard characters and clean spacing', () => {
  for (const t of typingTexts) {
    assert.match(t.text, /^[\x20-\x7E]+$/, `${t.id} has a special character`);
    assert.equal(t.text, t.text.trim(), `${t.id} has spaces at the start or end`);
    assert.ok(!t.text.includes('  '), `${t.id} has a double space`);
  }
});
