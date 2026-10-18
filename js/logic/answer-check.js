// Checks answers to exercises. Pure functions: no DOM, no storage, easy to test.
//
// checkAnswer(exercise, response) returns { result, feedback, tip }
//   result:   'empty' | 'correct' | 'close' | 'incorrect'
//   feedback: a message to show (or null)
//   tip:      a small friendly tip when the answer was accepted but not perfect (or null)
//
// Text answers are compared after normalize(), so these differences are ignored
// (unless an exercise says otherwise with exercise.options):
//   - extra spaces, curly quotes, capital letters (caseSensitive: false)
//   - commas, ; : ! ? and the final full stop (punctuationMatters: false)
//   - short forms: "don't" and "do not" are the same
// Accepted answers can use {a|b} for alternatives: "I {have sent|sent} it".

const CONTRACTIONS = {
  "don't": 'do not', "doesn't": 'does not', "didn't": 'did not',
  "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not',
  "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not',
  "won't": 'will not', "wouldn't": 'would not', "can't": 'cannot',
  "couldn't": 'could not', "shouldn't": 'should not', "mustn't": 'must not',
  "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are',
  "he's": 'he is', "she's": 'she is', "it's": 'it is', "that's": 'that is',
  "there's": 'there is', "what's": 'what is', "here's": 'here is',
  "i've": 'i have', "you've": 'you have', "we've": 'we have', "they've": 'they have',
  "i'll": 'i will', "you'll": 'you will', "he'll": 'he will', "she'll": 'she will',
  "it'll": 'it will', "we'll": 'we will', "they'll": 'they will',
  "let's": 'let us',
};

function expandContraction(word) {
  const expanded = CONTRACTIONS[word.toLowerCase()];
  if (!expanded) return word;
  const startsWithCapital = word[0] !== word[0].toLowerCase();
  return startsWithCapital ? expanded[0].toUpperCase() + expanded.slice(1) : expanded;
}

// Makes two texts easy to compare.
export function normalize(text, { caseSensitive = false, punctuationMatters = false } = {}) {
  let t = String(text ?? '')
    .replace(/[‘’]/g, "'")   // curly apostrophes -> straight
    .replace(/[“”]/g, '"')   // curly quotes -> straight
    .replace(/[A-Za-z]+'[A-Za-z]+/g, expandContraction)
    .replace(/\bcan not\b/gi, 'cannot');

  if (!punctuationMatters) t = t.replace(/[,;:!?"]/g, '');
  t = t.replace(/\s+/g, ' ').trim();
  if (!punctuationMatters) t = t.replace(/\.+$/, '').trim();
  return caseSensitive ? t : t.toLowerCase();
}

// "I {have sent|sent} it {yesterday|}" -> all full sentences.
export function expandAlternatives(pattern) {
  const match = pattern.match(/\{([^{}]*)\}/);
  if (!match) return [pattern.replace(/\s+/g, ' ').trim()];

  const before = pattern.slice(0, match.index);
  const after = pattern.slice(match.index + match[0].length);
  const results = new Set();
  for (const option of match[1].split('|')) {
    for (const full of expandAlternatives(before + option + after)) results.add(full);
  }
  return [...results];
}

// Number of single-letter changes needed to turn a into b.
export function levenshtein(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[b.length];
}

function optionsFor(exercise) {
  return { caseSensitive: false, punctuationMatters: false, ...exercise.options };
}

function expandedAnswers(list) {
  return list.flatMap(expandAlternatives);
}

// The answer to show when the learner asks for the solution.
export function solutionText(exercise) {
  if (exercise.type === 'multiple-choice') return exercise.choices[exercise.correct];
  return expandAlternatives(exercise.acceptedAnswers[0])[0];
}

function tipFor(rawResponse, matchedAnswer, options) {
  if (options.caseSensitive || options.punctuationMatters) return null;
  const typed = rawResponse.trim();
  if (/^[a-z]/.test(typed) && /^[A-Z]/.test(matchedAnswer)) {
    return 'Tip: start a sentence with a capital letter.';
  }
  if (matchedAnswer.includes(' ') && /[.!?]$/.test(matchedAnswer) && !/[.!?]$/.test(typed)) {
    return 'Tip: end a sentence with a full stop (.), a question mark (?) or an exclamation mark (!).';
  }
  return null;
}

// A small spelling mistake in a one-word answer, such as "recieve".
// Only for single words of 5+ letters, so grammar mistakes in sentences
// (for example "She work") are never called spelling mistakes.
function isClose(answer, acceptedNormalized) {
  if (answer.includes(' ')) return false;
  return acceptedNormalized.some((target) => {
    if (target.includes(' ') || target.length < 5) return false;
    const allowed = target.length <= 10 ? 1 : 2;
    return levenshtein(answer, target) <= allowed;
  });
}

function checkChoice(exercise, response) {
  const valid = Number.isInteger(response) && response >= 0 && response < exercise.choices.length;
  if (!valid) return { result: 'empty', feedback: 'Please choose an answer first.', tip: null };
  if (response === exercise.correct) return { result: 'correct', feedback: null, tip: null };

  const chosen = exercise.choices[response];
  const known = (exercise.commonMistakes ?? []).find((m) => m.answer === chosen);
  return { result: 'incorrect', feedback: known ? known.feedback : null, tip: null };
}

function checkText(exercise, response) {
  const raw = typeof response === 'string' ? response : '';
  if (raw.trim() === '') {
    const message = exercise.type === 'reorder'
      ? 'Please put the words in order first.'
      : 'Please type an answer first.';
    return { result: 'empty', feedback: message, tip: null };
  }

  const options = optionsFor(exercise);
  const answer = normalize(raw, options);
  const accepted = expandedAnswers(exercise.acceptedAnswers);
  const acceptedNormalized = accepted.map((a) => normalize(a, options));

  const hit = acceptedNormalized.indexOf(answer);
  if (hit !== -1) return { result: 'correct', feedback: null, tip: tipFor(raw, accepted[hit], options) };

  for (const mistake of exercise.commonMistakes ?? []) {
    const matches = expandAlternatives(mistake.answer).some((a) => normalize(a, options) === answer);
    if (matches) return { result: 'incorrect', feedback: mistake.feedback, tip: null };
  }

  if (isClose(answer, acceptedNormalized)) {
    return { result: 'close', feedback: 'Almost! Check your spelling.', tip: null };
  }
  return { result: 'incorrect', feedback: null, tip: null };
}

// response: a choice number (multiple-choice), or text (all other types).
// For reorder, the text is the chosen words joined with spaces.
export function checkAnswer(exercise, response) {
  if (exercise.type === 'multiple-choice') return checkChoice(exercise, response);
  return checkText(exercise, response);
}
