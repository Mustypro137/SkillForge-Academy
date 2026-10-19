import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writingTasks, findTask } from '../content/writing/index.js';
import { skillTagLabels } from '../content/skill-tags.js';
import { checkWriting, countWords } from '../js/logic/writing-check.js';

test('task ids and orders are unique, and findTask works', () => {
  assert.equal(new Set(writingTasks.map((t) => t.id)).size, writingTasks.length);
  assert.equal(new Set(writingTasks.map((t) => t.order)).size, writingTasks.length);
  for (const task of writingTasks) assert.equal(findTask(task.id), task);
  assert.equal(findTask('nope'), null);
  assert.ok(writingTasks.length >= 8);
});

test('every task has all the fields the page needs', () => {
  for (const task of writingTasks) {
    const where = task.id;
    for (const field of ['title', 'area', 'situation', 'task']) assert.ok(task[field]?.length > 0, `${where} needs ${field}`);
    assert.ok(task.phrases.length >= 3, `${where} needs useful phrases`);
    assert.ok(task.checklist.length >= 3, `${where} needs a checklist`);
    assert.ok(task.modelAnswers.length >= 1, `${where} needs a model answer`);
    for (const model of task.modelAnswers) assert.ok(model.text.length > 0 && model.why.length > 0, where);
    assert.ok(task.targetWords.min > 0 && task.targetWords.max > task.targetWords.min, where);
    assert.ok(task.skillTags.length >= 1, where);
    for (const tag of task.skillTags) assert.ok(skillTagLabels[tag], `${where}: tag "${tag}" has no name`);
  }
});

test('"given" text (the bad message to rewrite) is not shorter than a sentence', () => {
  for (const task of writingTasks.filter((t) => t.given)) assert.ok(countWords(task.given) >= 5, task.id);
});

test('every model answer passes every automatic check of its own task', () => {
  for (const task of writingTasks) {
    for (const model of task.modelAnswers) {
      const result = checkWriting(task, model.text);
      const failed = result.results.filter((r) => !r.ok).map((r) => `${r.id}: ${r.message}`);
      assert.deepEqual(failed, [], `${task.id} model answer fails its own checks`);
    }
  }
});

test('a given (bad) message fails at least one check, so the check is useful', () => {
  for (const task of writingTasks.filter((t) => t.given)) {
    const result = checkWriting(task, task.given);
    assert.ok(result.passed < result.total, `${task.id}: the bad message passes everything`);
  }
});

test('the checks of each task are well formed', () => {
  for (const task of writingTasks) {
    for (const item of task.checks.required ?? []) {
      assert.ok(item.label && item.tip && item.any.length > 0, task.id);
      assert.deepEqual(item.any, item.any.map((a) => a.toLowerCase()), `${task.id}: keep required words in lower case`);
    }
    for (const item of task.checks.avoid ?? []) assert.ok(item.label && item.tip && item.words.length > 0, task.id);
  }
});

test('the content uses American spelling', () => {
  const britishWords = /\b(apologise|organise|colour|favour|behaviour|centre|programme|cheque|analyse|realise)\b/i;
  const text = JSON.stringify(writingTasks);
  assert.doesNotMatch(text, britishWords);
});
