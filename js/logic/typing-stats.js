// Typing calculations. Pure functions: no DOM, no storage, easy to test.
//
// Words: one "word" = 5 characters (spaces and punctuation count).
//   grossWpm          = (typed.length / 5) / minutes
//   uncorrectedErrors = positions where typed[i] differs from target[i]
//                       (extra characters beyond the target count as errors)
//   netWpm            = max(0, grossWpm - uncorrectedErrors / minutes)
//   accuracy (%)      = (keystrokes - errorKeystrokes) / keystrokes * 100
// A keystroke is a character added. Backspace is not a keystroke.
// An error keystroke stays an error even if you fix it later.

// Compares the old and new text of the typing box.
// Returns how many characters were added, how many were wrong, and which
// target characters were missed. Deleting (or editing in the middle) adds nothing.
export function trackInput(prevTyped, nextTyped, target) {
  const none = { keystrokes: 0, errors: 0, missed: [] };
  if (nextTyped.length <= prevTyped.length || !nextTyped.startsWith(prevTyped)) return none;

  const missed = [];
  for (let i = prevTyped.length; i < nextTyped.length; i++) {
    if (nextTyped[i] !== target[i]) missed.push(target[i] ?? nextTyped[i]);
  }
  return {
    keystrokes: nextTyped.length - prevTyped.length,
    errors: missed.length,
    missed,
  };
}

export function countUncorrectedErrors(target, typed) {
  let errors = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== target[i]) errors++;
  }
  return errors;
}

// Returns rounded results: WPM as whole numbers, accuracy with 1 decimal.
export function computeStats({ target, typed, keystrokes, errorKeystrokes, elapsedMs }) {
  const uncorrectedErrors = countUncorrectedErrors(target, typed);
  const safeErrors = Math.min(Math.max(errorKeystrokes, 0), keystrokes);

  const accuracy = keystrokes > 0
    ? ((keystrokes - safeErrors) / keystrokes) * 100
    : 0;

  const validTime = Number.isFinite(elapsedMs) && elapsedMs > 0;
  const minutes = validTime ? elapsedMs / 60000 : 0;
  const grossWpm = minutes > 0 ? typed.length / 5 / minutes : 0;
  const netWpm = minutes > 0 ? Math.max(0, grossWpm - uncorrectedErrors / minutes) : 0;

  return {
    grossWpm: Math.round(grossWpm),
    netWpm: Math.round(netWpm),
    accuracy: Math.round(accuracy * 10) / 10,
    uncorrectedErrors,
    keystrokes,
    errorKeystrokes: safeErrors,
  };
}

// counts is an object like { e: 2, ",": 3 }. Returns the most missed keys first.
export function topMissedKeys(counts, limit = 5) {
  return Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);
}
