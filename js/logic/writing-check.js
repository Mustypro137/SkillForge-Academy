// Automatic checks for a writing task. Pure functions: no DOM, no storage.
//
// The app cannot understand your writing. It only checks things a computer can
// check reliably: length, greeting, closing, a request, shouting, long sentences,
// and the words listed in the task. A check that is not OK is a "look at this",
// never a "mistake", because good writing can break these rules.
//
// A task describes its checks like this:
//   targetWords: { min, max }                       always checked
//   checks: {
//     greeting: true, closing: true, request: true,
//     required: [{ label, tip, any: ['friday', 'by '] }],   at least one word or phrase
//     avoid:    [{ label, tip, words: ['hey', 'gonna'] }],  none of these words
//   }

export const MAX_SENTENCE_WORDS = 25;
// Common short words in capitals that are not shouting.
const SHOUT_ALLOWED = new Set(['HTML', 'JSON', 'HTTP', 'HTTPS', 'API', 'PDF', 'URL', 'CSS', 'SQL', 'XML', 'CEO', 'USA', 'FAQ', 'SEO', 'CRM', 'CMS', 'PHP', 'GPS']);

const GREETING = /^\s*(hi|hello|dear|hey|good (morning|afternoon|evening))\b/i;
const CLOSING_LINE = /^\s*(thanks|thank you|many thanks|best regards|kind regards|warm regards|regards|best wishes|best|sincerely|cheers)\b(.*)$/i;
const REQUEST = /\?|\b(could you|can you|would you|will you|please|i would like|i'd like|i need|let me know|i would appreciate|i'd appreciate)\b/i;

const straight = (text) => text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function splitWords(text) {
  return String(text ?? '').split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));
}

export function countWords(text) {
  return splitWords(text).length;
}

// Sentences end at . ! ? or at a new line.
export function splitSentences(text) {
  return String(text ?? '').split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
}

// Does the text contain this word or phrase? (ignores capitals; whole words)
function containsPhrase(text, phrase) {
  const start = /^\w/.test(phrase) ? '\\b' : '';
  const end = /\w$/.test(phrase) ? '\\b' : '';
  return new RegExp(`${start}${escapeRegex(phrase)}${end}`, 'i').test(text);
}

const nonEmptyLines = (text) => text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

function check(id, label, ok, message) {
  return { id, label, ok, message };
}

function lengthCheck(count, { min, max }) {
  const label = `Length: ${min} to ${max} words`;
  if (count < min) return check('length', label, false, `Your text has ${count} words. It is a little short. Aim for ${min} to ${max}.`);
  if (count > max) return check('length', label, false, `Your text has ${count} words. It is a little long. Aim for ${min} to ${max}, and cut what the reader does not need.`);
  return check('length', label, true, `Your text has ${count} words.`);
}

function greetingCheck(lines) {
  const ok = lines.length > 0 && GREETING.test(lines[0]);
  return check('greeting', 'Starts with a greeting', ok,
    ok ? 'You start with a greeting.' : 'Start with a greeting on the first line, for example "Hi Sam,".');
}

// A closing line (like "Thanks,") followed by your name, on the same line or the next line.
function closingCheck(lines) {
  let ok = false;
  for (let i = lines.length - 1; i >= 0 && !ok; i -= 1) {
    const match = CLOSING_LINE.exec(lines[i]);
    if (!match) continue;
    const sameLineName = /,\s*\p{L}/u.test(match[2]); // "Thanks, Sam"
    ok = sameLineName || i < lines.length - 1;       // or a name on a later line
    break; // only the last closing line counts
  }
  return check('closing', 'Ends with a closing and your name', ok,
    ok ? 'You end with a closing and a name.' : 'End with a closing and your name, for example "Thanks," and then your name on the next line.');
}

function requestCheck(text) {
  const ok = REQUEST.test(text);
  return check('request', 'Has a clear request or question', ok,
    ok ? 'There is a request or a question.' : 'Make your request clear, for example "Could you ... ?" or "Please ...".');
}

function shoutingCheck(text) {
  const loud = (text.match(/\b[A-Z]{3,}\b/g) ?? []).filter((word) => !SHOUT_ALLOWED.has(word));
  const exclamations = (text.match(/!/g) ?? []).length;
  const ok = loud.length === 0 && exclamations <= 2 && !/!!/.test(text);
  let message = 'The tone looks calm: no ALL CAPS words and not many exclamation marks.';
  if (loud.length > 0) message = `Words in ALL CAPS can sound angry: ${[...new Set(loud)].join(', ')}. Use normal letters.`;
  else if (!ok) message = 'Many exclamation marks can sound angry or too excited. Use at most one or two.';
  return check('tone', 'No shouting (ALL CAPS, many !)', ok, message);
}

function longSentenceCheck(text) {
  const long = splitSentences(text).filter((s) => countWords(s) > MAX_SENTENCE_WORDS);
  const ok = long.length === 0;
  const message = ok
    ? `Every sentence has ${MAX_SENTENCE_WORDS} words or fewer.`
    : `${long.length === 1 ? 'One sentence is' : `${long.length} sentences are`} longer than ${MAX_SENTENCE_WORDS} words. Try to split ${long.length === 1 ? 'it' : 'them'}. It starts with: "${long[0].split(/\s+/).slice(0, 6).join(' ')} ..."`;
  return check('sentences', `Short sentences (${MAX_SENTENCE_WORDS} words or fewer)`, ok, message);
}

function requiredCheck(item, index, text) {
  const ok = item.any.some((phrase) => containsPhrase(text, phrase));
  return check(`required-${index}`, item.label, ok, ok ? `${item.label}: yes.` : item.tip);
}

function avoidCheck(item, index, text) {
  const found = item.words.filter((word) => containsPhrase(text, word));
  const ok = found.length === 0;
  return check(`avoid-${index}`, item.label, ok, ok ? `${item.label}: yes.` : `${item.tip} Found: ${found.join(', ')}.`);
}

// Runs all checks for a task on a text.
// Returns { empty, wordCount, results: [{ id, label, ok, message }], passed, total }
export function checkWriting(task, rawText) {
  const text = straight(String(rawText ?? ''));
  const wordCount = countWords(text);
  if (wordCount === 0) return { empty: true, wordCount: 0, results: [], passed: 0, total: 0 };

  const lines = nonEmptyLines(text);
  const options = task.checks ?? {};
  const results = [lengthCheck(wordCount, task.targetWords)];
  if (options.greeting) results.push(greetingCheck(lines));
  if (options.closing) results.push(closingCheck(lines));
  if (options.request) results.push(requestCheck(text));
  (options.required ?? []).forEach((item, i) => results.push(requiredCheck(item, i, text)));
  (options.avoid ?? []).forEach((item, i) => results.push(avoidCheck(item, i, text)));
  results.push(shoutingCheck(text), longSentenceCheck(text));

  return { empty: false, wordCount, results, passed: results.filter((r) => r.ok).length, total: results.length };
}
