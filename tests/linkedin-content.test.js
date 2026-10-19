import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkedinLessons, linkedinTopics } from '../content/linkedin/index.js';
import { allLessons, findExercise } from '../content/index.js';
import { findTask } from '../content/writing/index.js';
import { findScenario } from '../content/roleplay/index.js';
import { checkWriting } from '../js/logic/writing-check.js';

test('there are 5 LinkedIn topics, and each one points to a real lesson, writing task and roleplay', () => {
  assert.equal(linkedinTopics.length, 5);
  assert.equal(new Set(linkedinTopics.map((t) => t.id)).size, 5);
  for (const topic of linkedinTopics) {
    assert.ok(topic.title && topic.summary, topic.id);
    assert.ok(linkedinLessons.some((l) => l.id === topic.lessonId), `${topic.id}: lesson ${topic.lessonId}`);
    assert.ok(findTask(topic.taskId), `${topic.id}: task ${topic.taskId}`);
    assert.ok(findScenario(topic.scenarioId), `${topic.id}: scenario ${topic.scenarioId}`);
  }
});

test('every LinkedIn lesson has the module "linkedin", 10 exercises, and a unique id and order across all lessons', () => {
  assert.equal(linkedinLessons.length, 5);
  for (const lesson of linkedinLessons) {
    assert.equal(lesson.module, 'linkedin', lesson.id);
    assert.equal(lesson.exercises.length, 10, lesson.id);
  }
  assert.equal(new Set(allLessons.map((l) => l.id)).size, allLessons.length);
  assert.equal(new Set(allLessons.map((l) => l.order)).size, allLessons.length);
  assert.equal(new Set(allLessons.flatMap((l) => l.exercises.map((e) => e.id))).size, allLessons.reduce((n, l) => n + l.exercises.length, 0));
});

test('LinkedIn exercises can be found by lesson and exercise id (the mistake notebook needs this)', () => {
  const found = findExercise('linkedin-recruiters', 'lr-03');
  assert.equal(found.lesson.id, 'linkedin-recruiters');
  assert.equal(found.exercise.id, 'lr-03');
});

test('the LinkedIn writing tasks are in the LinkedIn area and the connection note has a character limit', () => {
  for (const topic of linkedinTopics) assert.equal(findTask(topic.taskId).area, 'LinkedIn');
  const note = findTask('wr-10');
  assert.equal(note.checks.maxChars, 200);
  const model = note.modelAnswers[0].text;
  assert.ok(model.length <= 200, `the model note has ${model.length} characters`);
  assert.equal(checkWriting(note, `${model} ${'x'.repeat(100)}`).results.find((r) => r.id === 'chars').ok, false);
});

test('empty words like "passionate" are flagged in the About task', () => {
  const task = findTask('wr-09');
  const result = checkWriting(task, `${task.modelAnswers[0].text} I am passionate and hard-working.`);
  const avoid = result.results.find((r) => r.id.startsWith('avoid-'));
  assert.equal(avoid.ok, false);
  assert.match(avoid.message, /passionate/);
});
