import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeEntry, historyFor, taskStatus, latestRating, writingSummary, emptyWriting, MAX_TEXT, MAX_NOTE,
} from '../js/logic/writing-progress.js';

const result = { wordCount: 40, passed: 4, total: 6 };
const entry = (taskId, rating, at) => makeEntry({ taskId, text: 't', result, checklist: [true], rating, note: '' }, new Date(at));
const tasks = [{ id: 'wr-01' }, { id: 'wr-02' }, { id: 'wr-03' }];

test('makeEntry cuts long text and notes, and ignores an unknown rating', () => {
  const e = makeEntry({ taskId: 'wr-01', text: 'x'.repeat(MAX_TEXT + 10), result, checklist: [], rating: 'amazing', note: 'n'.repeat(MAX_NOTE + 10) });
  assert.equal(e.text.length, MAX_TEXT);
  assert.equal(e.note.length, MAX_NOTE);
  assert.equal(e.rating, null);
});

test('entry ids are different', () => {
  const now = new Date('2026-10-19T10:00:00Z');
  assert.notEqual(entry('a', 'good', now).id, entry('a', 'good', now).id);
});

test('historyFor returns the newest first, for one task only', () => {
  const history = [entry('wr-01', 'good', '2026-10-01T10:00:00Z'), entry('wr-02', 'good', '2026-10-02T10:00:00Z'), entry('wr-01', 'great', '2026-10-03T10:00:00Z')];
  assert.deepEqual(historyFor(history, 'wr-01').map((e) => e.rating), ['great', 'good']);
  assert.deepEqual(historyFor(undefined, 'wr-01'), []);
});

test('taskStatus: not started, draft, done', () => {
  const writing = emptyWriting();
  assert.equal(taskStatus(writing, 'wr-01'), 'not-started');
  writing.drafts['wr-01'] = { text: '  ' };
  assert.equal(taskStatus(writing, 'wr-01'), 'not-started');
  writing.drafts['wr-01'] = { text: 'Hi' };
  assert.equal(taskStatus(writing, 'wr-01'), 'draft');
  writing.history.push(entry('wr-01', 'good', '2026-10-01T10:00:00Z'));
  assert.equal(taskStatus(writing, 'wr-01'), 'done');
  assert.equal(taskStatus(undefined, 'wr-01'), 'not-started');
});

test('latestRating uses the newest saved attempt', () => {
  const writing = emptyWriting();
  assert.equal(latestRating(writing, 'wr-01'), null);
  writing.history.push(entry('wr-01', 'great', '2026-10-01T10:00:00Z'), entry('wr-01', 'needs-work', '2026-10-02T10:00:00Z'));
  assert.equal(latestRating(writing, 'wr-01'), 'needs-work');
});

test('writingSummary counts done tasks and tasks whose newest rating is Great', () => {
  const writing = emptyWriting();
  writing.history.push(entry('wr-01', 'needs-work', '2026-10-01T10:00:00Z'), entry('wr-01', 'great', '2026-10-02T10:00:00Z'), entry('wr-02', 'good', '2026-10-02T10:00:00Z'));
  writing.drafts['wr-03'] = { text: 'draft only' };
  assert.deepEqual(writingSummary(writing, tasks), { total: 3, done: 2, great: 1 });
});
