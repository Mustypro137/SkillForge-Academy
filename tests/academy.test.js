import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topicProgress, academySummary } from '../js/logic/academy.js';
import { nextStep } from '../js/logic/dashboard.js';

const lessons = [
  { id: 'l1', module: 'grammar', order: 1, title: 'Grammar one', exercises: [{ id: 'a' }, { id: 'b' }] },
  { id: 'li1', module: 'linkedin', order: 11, title: 'LinkedIn one', exercises: [{ id: 'a' }, { id: 'b' }] },
  { id: 'li2', module: 'linkedin', order: 12, title: 'LinkedIn two', exercises: [{ id: 'a' }, { id: 'b' }] },
];
const topics = [
  { id: 't1', lessonId: 'li1', taskId: 'wr-09', scenarioId: 'rp-07' },
  { id: 't2', lessonId: 'li2', taskId: 'wr-10', scenarioId: 'rp-08' },
];
const emptyData = () => ({ progress: {}, attempts: [], mistakes: {}, writing: { drafts: {}, history: [] }, roleplay: { results: {}, log: [] } });
const now = new Date(2026, 9, 19, 12, 0);
const completed = { status: 'completed', answered: { a: 'correct', b: 'correct' }, lastScore: 1, bestScore: 1 };
const writingEntry = (taskId) => ({ taskId, text: 'x', at: '2026-10-19T10:00:00.000Z' });
const played = { runs: 1, bestPercent: 50, lastPercent: 50, lastCounts: { best: 1, ok: 1, weak: 1 }, lastAt: '2026-10-19T10:00:00.000Z' };

test('a new topic: nothing done, and the lesson is the next step', () => {
  const p = topicProgress(emptyData(), topics[0], lessons);
  assert.deepEqual([p.lesson, p.write, p.talk], ['not-started', 'not-started', 'not-started']);
  assert.equal(p.done, 0);
  assert.equal(p.next, 'lesson');
});

test('the next step moves on: lesson, then writing, then roleplay, then none', () => {
  const data = emptyData();
  data.progress.li1 = completed;
  assert.equal(topicProgress(data, topics[0], lessons).next, 'write');
  data.writing.history.push(writingEntry('wr-09'));
  assert.equal(topicProgress(data, topics[0], lessons).next, 'talk');
  data.roleplay.results['rp-07'] = played;
  const p = topicProgress(data, topics[0], lessons);
  assert.equal(p.next, null);
  assert.equal(p.done, 3);
});

test('a lesson in progress and a draft are not done', () => {
  const data = emptyData();
  data.progress.li1 = { status: 'in-progress', answered: { a: 'correct' } };
  data.writing.drafts['wr-09'] = { text: 'Hello' };
  const p = topicProgress(data, topics[0], lessons);
  assert.deepEqual([p.lesson, p.write], ['in-progress', 'draft']);
  assert.equal(p.done, 0);
  assert.equal(p.next, 'lesson');
});

test('steps can be done in any order: the first one not done is the next step', () => {
  const data = emptyData();
  data.roleplay.results['rp-07'] = played;
  const p = topicProgress(data, topics[0], lessons);
  assert.equal(p.done, 1);
  assert.equal(p.next, 'lesson');
});

test('a topic with a missing lesson or old data without writing and roleplay does not crash', () => {
  assert.equal(topicProgress({ progress: {} }, { lessonId: 'zzz', taskId: 'x', scenarioId: 'y' }, lessons).done, 0);
  assert.equal(topicProgress(emptyData(), { lessonId: 'zzz', taskId: 'x', scenarioId: 'y' }, lessons).next, 'lesson');
});

test('academySummary counts started and complete topics', () => {
  const data = emptyData();
  data.progress.li1 = completed;
  data.writing.history.push(writingEntry('wr-09'));
  data.roleplay.results['rp-07'] = played;
  data.progress.li2 = { status: 'in-progress', answered: { a: 'correct' } };
  assert.deepEqual(academySummary(data, topics, lessons), { total: 2, complete: 1, started: 2 });   // topic 2: a lesson in progress counts as started
  assert.deepEqual(academySummary(emptyData(), topics, lessons), { total: 2, complete: 0, started: 0 });
  const draftOnly = emptyData();
  draftOnly.writing.drafts['wr-10'] = { text: 'Hi' };
  assert.equal(academySummary(draftOnly, topics, lessons).started, 1);
});

test('the dashboard sends you to the LinkedIn page when the next lesson is a LinkedIn lesson', () => {
  const data = emptyData();
  data.progress.l1 = completed;
  data.progress.l1.status = 'mastered';
  const step = nextStep(data, lessons, now);
  assert.equal(step.kind, 'start');
  assert.equal(step.lessonId, 'li1');
  assert.equal(step.target, 'linkedin');
  data.progress.li1 = { status: 'in-progress', answered: { a: 'correct' } };
  assert.equal(nextStep(data, lessons, now).target, 'linkedin');
  assert.equal(nextStep(emptyData(), lessons, now).target, 'grammar');
});
