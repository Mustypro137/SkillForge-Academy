import { test } from 'node:test';
import assert from 'node:assert/strict';
import { freelanceLessons, freelanceTopics } from '../content/freelance/index.js';
import { linkedinTopics } from '../content/linkedin/index.js';
import { allLessons } from '../content/index.js';
import { findTask } from '../content/writing/index.js';
import { findScenario } from '../content/roleplay/index.js';

test('every freelance topic points to a real lesson, writing task and roleplay, and has a stage', () => {
  assert.equal(new Set(freelanceTopics.map((t) => t.id)).size, freelanceTopics.length);
  for (const topic of freelanceTopics) {
    assert.ok(topic.title && topic.summary && topic.stage, topic.id);
    assert.ok(freelanceLessons.some((l) => l.id === topic.lessonId), `${topic.id}: lesson ${topic.lessonId}`);
    assert.ok(findTask(topic.taskId), `${topic.id}: task ${topic.taskId}`);
    assert.ok(findScenario(topic.scenarioId), `${topic.id}: scenario ${topic.scenarioId}`);
  }
});

test('every freelance lesson belongs to a topic, has the module "freelance", 10 exercises and a planned order (21-38)', () => {
  for (const lesson of freelanceLessons) {
    assert.equal(lesson.module, 'freelance', lesson.id);
    assert.equal(lesson.exercises.length, 10, lesson.id);
    assert.ok(lesson.order >= 21 && lesson.order <= 38, `${lesson.id}: order ${lesson.order}`);
    assert.equal(freelanceTopics.filter((t) => t.lessonId === lesson.id).length, 1, `${lesson.id} should be in exactly one topic`);
  }
  assert.equal(freelanceLessons.length, freelanceTopics.length);
});

test('topics are listed in the same order as their lessons, so "next step" follows the page', () => {
  const orders = freelanceTopics.map((t) => freelanceLessons.find((l) => l.id === t.lessonId).order);
  assert.deepEqual(orders, [...orders].sort((a, b) => a - b));
});

test('no lesson id or order is used twice across all modules', () => {
  assert.equal(new Set(allLessons.map((l) => l.id)).size, allLessons.length);
  assert.equal(new Set(allLessons.map((l) => l.order)).size, allLessons.length);
});

test('the freelance topics reuse existing writing tasks and roleplays on purpose, and nothing is shared with LinkedIn', () => {
  const reused = freelanceTopics.filter((t) => ['wr-03', 'wr-04'].includes(t.taskId) || ['rp-01', 'rp-05'].includes(t.scenarioId));
  assert.equal(reused.length, 3);   // deadlines (wr-03 + rp-01), changes (wr-04), pricing (rp-05)
  const linkedinItems = new Set(linkedinTopics.flatMap((t) => [t.taskId, t.scenarioId]));
  for (const topic of freelanceTopics) {
    assert.ok(!linkedinItems.has(topic.taskId) && !linkedinItems.has(topic.scenarioId), topic.id);
  }
});
