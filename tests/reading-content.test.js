import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readingLessons, readingTopics } from '../content/reading/index.js';
import { allLessons } from '../content/index.js';
import { findTask } from '../content/writing/index.js';
import { skillTagLabels } from '../content/skill-tags.js';
import { checkWriting } from '../js/logic/writing-check.js';

test('every reading topic points to a real lesson and matching task, with a unique id', () => {
  assert.equal(new Set(readingTopics.map((t) => t.id)).size, readingTopics.length);
  for (const topic of readingTopics) {
    assert.ok(topic.title && topic.summary, topic.id);
    assert.ok(topic.level === 2 || topic.level === 3, topic.id);
    const lesson = readingLessons.find((l) => l.id === topic.lessonId);
    assert.ok(lesson, `${topic.id}: lesson ${topic.lessonId}`);
    const task = findTask(topic.taskId);
    assert.ok(task, `${topic.id}: task ${topic.taskId}`);
    assert.equal(task.area, 'Reading', topic.id);
  }
});

test('reading lessons are in the shared lesson list with module "reading" and orders 44-48', () => {
  assert.deepEqual(readingLessons.map((l) => l.order), [44, 45, 46, 47, 48]);
  for (const lesson of readingLessons) {
    assert.equal(lesson.module, 'reading', lesson.id);
    assert.equal(allLessons.find((l) => l.id === lesson.id), lesson, lesson.id);
  }
});

test('every reading lesson has a long text, 10+ exercises, and at least one of each main question type', () => {
  for (const lesson of readingLessons) {
    assert.ok(lesson.passage?.title, lesson.id);
    assert.ok(lesson.passage.paragraphs.length >= 3, `${lesson.id} needs at least 3 paragraphs`);
    const words = lesson.passage.paragraphs.join(' ').split(/\s+/).length;
    assert.ok(words >= 80, `${lesson.id} text is too short (${words} words)`);
    assert.ok(lesson.exercises.length >= 10, lesson.id);

    const types = new Set(lesson.exercises.map((e) => e.type));
    assert.ok(types.has('multiple-choice'), `${lesson.id} needs a multiple-choice question`);
    assert.ok(types.has('fill-blank'), `${lesson.id} needs a fill-blank question`);
    assert.ok(types.has('reorder'), `${lesson.id} needs a reorder question`);

    const last = lesson.exercises[lesson.exercises.length - 1];
    assert.ok(last.skillTags.includes('clarifying-questions'), `${lesson.id}: last question should be about clarifying`);
  }
});

test('every reading skill tag has a readable name', () => {
  for (const lesson of readingLessons) {
    for (const exercise of lesson.exercises) {
      for (const tag of exercise.skillTags) {
        assert.ok(skillTagLabels[tag], `${exercise.id}: tag "${tag}" has no name`);
      }
    }
  }
  for (const tag of ['clarifying-questions', 'reading-main-idea', 'reading-details', 'reading-inference']) {
    assert.ok(skillTagLabels[tag], tag);
  }
});

test('every reading writing task has a model answer that passes its own checks', () => {
  for (const topic of readingTopics) {
    const task = findTask(topic.taskId);
    assert.ok(task.modelAnswers.length >= 1, task.id);
    assert.ok(task.targetWords.min >= 8 && task.targetWords.max <= 40, task.id);
    for (const model of task.modelAnswers) {
      const result = checkWriting(task, model.text);
      const failed = result.results.filter((r) => !r.ok).map((r) => `${r.id}: ${r.message}`);
      assert.deepEqual(failed, [], `${task.id} model answer fails its own checks`);
    }
  }
});
