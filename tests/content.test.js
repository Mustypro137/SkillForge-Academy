import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allLessons as grammarLessons } from '../content/index.js';
import { checkAnswer, expandAlternatives, solutionText } from '../js/logic/answer-check.js';

const TYPES = ['multiple-choice', 'fill-blank', 'correct-sentence', 'reorder'];
const allExercises = grammarLessons.flatMap((lesson) => lesson.exercises.map((exercise) => ({ lesson, exercise })));

const words = (text) => text.split(' ').sort();

test('lesson ids and orders are unique, and every lesson has text and at least 10 exercises', () => {
  assert.equal(new Set(grammarLessons.map((l) => l.id)).size, grammarLessons.length);
  assert.equal(new Set(grammarLessons.map((l) => l.order)).size, grammarLessons.length);
  for (const lesson of grammarLessons) {
    assert.ok(lesson.title.length > 0, lesson.id);
    assert.ok(lesson.explanation.length >= 3, `${lesson.id} needs an explanation`);
    assert.ok(lesson.examples.length >= 1, `${lesson.id} needs examples`);
    assert.ok(lesson.exercises.length >= 10, `${lesson.id} needs at least 10 exercises`);
    assert.equal(grammarLessons.find((l) => l.id === lesson.id), lesson);
  }
});

test('exercise ids are unique across all lessons', () => {
  const ids = allExercises.map(({ exercise }) => exercise.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('all four exercise types are used', () => {
  const used = new Set(allExercises.map(({ exercise }) => exercise.type));
  for (const type of TYPES) assert.ok(used.has(type), type);
});

test('every exercise has a prompt, a hint, an explanation and skill tags', () => {
  for (const { exercise } of allExercises) {
    const where = exercise.id;
    assert.ok(TYPES.includes(exercise.type), `${where} has an unknown type`);
    assert.ok(exercise.prompt.length > 0, where);
    assert.ok(exercise.hints.length >= 1, `${where} needs a hint`);
    assert.ok(exercise.explanation.length > 0, where);
    assert.ok(exercise.skillTags.length >= 1, where);
  }
});

test('multiple-choice exercises have valid choices and a valid correct index', () => {
  for (const { exercise } of allExercises.filter((x) => x.exercise.type === 'multiple-choice')) {
    const { id, choices, correct } = exercise;
    assert.ok(choices.length >= 2, id);
    assert.equal(new Set(choices).size, choices.length, `${id} has repeated choices`);
    assert.ok(Number.isInteger(correct) && correct >= 0 && correct < choices.length, id);
    for (const mistake of exercise.commonMistakes ?? []) {
      assert.ok(choices.includes(mistake.answer), `${id}: feedback is for a choice that does not exist`);
      assert.notEqual(mistake.answer, choices[correct], `${id}: the correct choice has a mistake message`);
    }
  }
});

test('every accepted answer is accepted by the checker', () => {
  for (const { exercise } of allExercises.filter((x) => x.exercise.type !== 'multiple-choice')) {
    assert.ok(exercise.acceptedAnswers.length >= 1, exercise.id);
    for (const pattern of exercise.acceptedAnswers) {
      const expanded = expandAlternatives(pattern);
      assert.ok(expanded.length <= 50, `${exercise.id} has too many alternatives`);
      for (const answer of expanded) {
        assert.equal(checkAnswer(exercise, answer).result, 'correct', `${exercise.id}: "${answer}"`);
      }
    }
  }
});

test('no common mistake is also a correct answer, and every mistake has feedback', () => {
  for (const { exercise } of allExercises.filter((x) => x.exercise.type !== 'multiple-choice')) {
    for (const mistake of exercise.commonMistakes ?? []) {
      assert.ok(mistake.feedback.length > 0, exercise.id);
      for (const answer of expandAlternatives(mistake.answer)) {
        assert.equal(checkAnswer(exercise, answer).result, 'incorrect', `${exercise.id}: "${answer}"`);
      }
    }
  }
});

test('correct-sentence exercises have a given sentence that is not already correct', () => {
  for (const { exercise } of allExercises.filter((x) => x.exercise.type === 'correct-sentence')) {
    assert.ok(exercise.given.length > 0, exercise.id);
    assert.notEqual(checkAnswer(exercise, exercise.given).result, 'correct', `${exercise.id}: the given sentence is already correct`);
  }
});

test('reorder exercises use exactly the words of every accepted answer', () => {
  for (const { exercise } of allExercises.filter((x) => x.exercise.type === 'reorder')) {
    assert.ok(exercise.words.length >= 3, exercise.id);
    for (const answer of exercise.acceptedAnswers.flatMap(expandAlternatives)) {
      assert.deepEqual(words(answer), [...exercise.words].sort(), `${exercise.id}: "${answer}"`);
    }
    // the words must not already be in the correct order
    assert.notEqual(exercise.words.join(' '), solutionText(exercise), `${exercise.id} words are not mixed up`);
  }
});

test('plain text only: no curly quotes or double spaces in prompts and answers', () => {
  const bad = /[‘’“”]|  /;
  for (const { exercise } of allExercises) {
    const texts = [exercise.prompt, exercise.explanation, ...(exercise.choices ?? []), ...(exercise.acceptedAnswers ?? [])];
    for (const text of texts) assert.ok(!bad.test(text), `${exercise.id}: "${text}"`);
  }
});

test('findExercise finds an exercise and its lesson, or returns null', async () => {
  const { findExercise } = await import('../content/index.js');
  const found = findExercise('grammar-present-simple', 'ps-03');
  assert.equal(found.lesson.id, 'grammar-present-simple');
  assert.equal(found.exercise.id, 'ps-03');
  assert.equal(findExercise('grammar-present-simple', 'nope'), null);
  assert.equal(findExercise('nope', 'ps-03'), null);
});

test('every skill tag used in the lessons has a readable name', async () => {
  const { skillTagLabels, skillTagLabel } = await import('../content/skill-tags.js');
  const used = new Set(allExercises.flatMap(({ exercise }) => exercise.skillTags));
  for (const tag of used) assert.ok(skillTagLabels[tag], `no name for the skill tag "${tag}"`);
  assert.equal(skillTagLabel('some-new-tag'), 'some new tag');
});
