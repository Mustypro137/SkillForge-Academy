import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalize, expandAlternatives, levenshtein, checkAnswer, solutionText,
} from '../js/logic/answer-check.js';

const fill = (extra = {}) => ({
  type: 'fill-blank', acceptedAnswers: ['wants'],
  commonMistakes: [{ answer: 'want', feedback: 'Add -s.' }], ...extra,
});
const sentence = (extra = {}) => ({
  type: 'correct-sentence', acceptedAnswers: ['He does not like long emails.'], ...extra,
});
const choice = (extra = {}) => ({
  type: 'multiple-choice', choices: ['a', 'an', 'the'], correct: 1,
  commonMistakes: [{ answer: 'a', feedback: 'Use an before a vowel sound.' }], ...extra,
});

// ----- empty and invalid input -----

test('empty or spaces-only text is "empty", not wrong', () => {
  for (const response of ['', '   ', '\n', undefined, null, 42]) {
    assert.equal(checkAnswer(fill(), response).result, 'empty');
  }
});

test('multiple choice with no valid choice is "empty"', () => {
  for (const response of [null, undefined, -1, 3, 1.5, '1']) {
    assert.equal(checkAnswer(choice(), response).result, 'empty');
  }
});

test('reorder with no words is "empty"', () => {
  const ex = { type: 'reorder', acceptedAnswers: ['I work.'] };
  const r = checkAnswer(ex, '');
  assert.equal(r.result, 'empty');
  assert.match(r.feedback, /words/);
});

// ----- correct and incorrect -----

test('exact answer is correct', () => {
  assert.equal(checkAnswer(fill(), 'wants').result, 'correct');
});

test('wrong answer is incorrect', () => {
  assert.equal(checkAnswer(fill(), 'banana').result, 'incorrect');
});

test('a second accepted answer works', () => {
  const ex = fill({ acceptedAnswers: ['wants', 'needs'] });
  assert.equal(checkAnswer(ex, 'needs').result, 'correct');
});

test('known common mistake gives its own feedback', () => {
  const r = checkAnswer(fill(), 'want');
  assert.equal(r.result, 'incorrect');
  assert.equal(r.feedback, 'Add -s.');
});

test('a common mistake is never called "close", even if one letter is missing', () => {
  assert.equal(checkAnswer(fill(), 'want').result, 'incorrect');
});

// ----- alternative answers that mean the same -----

test('capital letters and final full stop are ignored, with a tip', () => {
  const r = checkAnswer(sentence(), 'he does not like long emails');
  assert.equal(r.result, 'correct');
  assert.match(r.tip, /capital letter/);
});

test('missing final full stop gives a tip but is correct', () => {
  const r = checkAnswer(sentence(), 'He does not like long emails');
  assert.equal(r.result, 'correct');
  assert.match(r.tip, /end a sentence/);
});

test('no tip when the answer is perfect', () => {
  assert.equal(checkAnswer(sentence(), 'He does not like long emails.').tip, null);
});

test('short and long forms are both accepted, in both directions', () => {
  assert.equal(checkAnswer(sentence(), "He doesn't like long emails.").result, 'correct');
  const ex = sentence({ acceptedAnswers: ["I don't know."] });
  assert.equal(checkAnswer(ex, 'I do not know.').result, 'correct');
});

test('curly apostrophes are accepted', () => {
  assert.equal(checkAnswer(sentence(), 'He doesn’t like long emails.').result, 'correct');
});

test('extra spaces inside the answer are accepted', () => {
  assert.equal(checkAnswer(sentence(), '  He   does not  like long emails.  ').result, 'correct');
});

test('commas are ignored unless punctuation matters', () => {
  const ex = { type: 'correct-sentence', acceptedAnswers: ['Hello, Anna.'] };
  assert.equal(checkAnswer(ex, 'Hello Anna').result, 'correct');
});

test('{a|b} alternatives all work, including an empty option', () => {
  const ex = { type: 'correct-sentence', acceptedAnswers: ['I {have sent|sent} the file {yesterday|}.'] };
  for (const text of ['I have sent the file yesterday.', 'I sent the file yesterday', 'I sent the file.', 'I have sent the file']) {
    assert.equal(checkAnswer(ex, text).result, 'correct', text);
  }
  assert.equal(checkAnswer(ex, 'I send the file').result, 'incorrect');
});

// ----- exercises where capitals and punctuation matter -----

test('caseSensitive exercise rejects a lowercase start', () => {
  const ex = { type: 'correct-sentence', acceptedAnswers: ['I work in London.'],
    options: { caseSensitive: true, punctuationMatters: true } };
  assert.equal(checkAnswer(ex, 'I work in London.').result, 'correct');
  assert.equal(checkAnswer(ex, 'i work in London.').result, 'incorrect');
  assert.equal(checkAnswer(ex, 'I work in london.').result, 'incorrect');
});

test('punctuationMatters exercise rejects a missing question mark', () => {
  const ex = { type: 'correct-sentence', acceptedAnswers: ['Can you help me?'],
    options: { caseSensitive: true, punctuationMatters: true } };
  assert.equal(checkAnswer(ex, 'Can you help me?').result, 'correct');
  assert.equal(checkAnswer(ex, 'Can you help me').result, 'incorrect');
  assert.equal(checkAnswer(ex, 'Can you help me.').result, 'incorrect');
});

test('a single end mark can be the answer when punctuation matters', () => {
  const ex = { type: 'fill-blank', acceptedAnswers: ['?'], options: { punctuationMatters: true } };
  assert.equal(checkAnswer(ex, '?').result, 'correct');
  assert.equal(checkAnswer(ex, '.').result, 'incorrect');
});

// ----- spelling mistakes -----

test('one wrong letter in a one-word answer is "close"', () => {
  const ex = fill({ acceptedAnswers: ['receives'], commonMistakes: [] });
  assert.equal(checkAnswer(ex, 'recieves').result, 'incorrect'); // swapped letters = 2 changes
  assert.equal(checkAnswer(ex, 'receivs').result, 'close');
});

test('grammar mistakes in a sentence are never "close"', () => {
  assert.equal(checkAnswer(sentence(), 'He do not like long emails.').result, 'incorrect');
  assert.equal(checkAnswer(sentence({ acceptedAnswers: ['She works from home.'] }), 'She work from home.').result, 'incorrect');
});

test('very short answers are never "close"', () => {
  const ex = { type: 'fill-blank', acceptedAnswers: ['work'] };
  assert.equal(checkAnswer(ex, 'walk').result, 'incorrect');
});

// ----- multiple choice and reorder -----

test('multiple choice: right, wrong with feedback, wrong without feedback', () => {
  assert.equal(checkAnswer(choice(), 1).result, 'correct');
  const wrong = checkAnswer(choice(), 0);
  assert.equal(wrong.result, 'incorrect');
  assert.equal(wrong.feedback, 'Use an before a vowel sound.');
  assert.equal(checkAnswer(choice(), 2).feedback, null);
});

test('reorder: right order is correct, wrong order is incorrect', () => {
  const ex = { type: 'reorder', acceptedAnswers: ['She works from home on Fridays.'] };
  assert.equal(checkAnswer(ex, 'She works from home on Fridays.').result, 'correct');
  assert.equal(checkAnswer(ex, 'works She from home on Fridays.').result, 'incorrect');
});

// ----- helpers -----

test('normalize: spaces, quotes, short forms, case, final punctuation', () => {
  assert.equal(normalize('  Don’t   STOP!  '), 'do not stop');
  assert.equal(normalize("I'm here."), 'i am here');
  assert.equal(normalize('I can not go'), 'i cannot go');
  assert.equal(normalize("I'm here.", { caseSensitive: true, punctuationMatters: true }), 'I am here.');
  assert.equal(normalize(undefined), '');
});

test('normalize keeps the apostrophe of "client\'s"', () => {
  assert.equal(normalize("client's"), "client's");
});

test('expandAlternatives', () => {
  assert.deepEqual(expandAlternatives('plain text'), ['plain text']);
  assert.deepEqual(expandAlternatives('a {b|c}').sort(), ['a b', 'a c']);
  assert.deepEqual(expandAlternatives('x {y|} z').sort(), ['x y z', 'x z']);
  assert.equal(expandAlternatives('{a|b} {c|d}').length, 4);
});

test('levenshtein', () => {
  assert.equal(levenshtein('kitten', 'sitting'), 3);
  assert.equal(levenshtein('', 'abc'), 3);
  assert.equal(levenshtein('same', 'same'), 0);
});

test('solutionText', () => {
  assert.equal(solutionText(choice()), 'an');
  assert.equal(solutionText({ type: 'fill-blank', acceptedAnswers: ['I {have|had} it.'] }), 'I have it.');
});
