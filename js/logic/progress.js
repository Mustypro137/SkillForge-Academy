// Lesson progress rules. Pure functions: they take an entry and return a NEW entry.
//
// A progress entry (one per lesson) looks like:
//   { status, answered: { exerciseId: outcome }, lastScore, bestScore, lastExerciseId, completedAt }
// Outcomes: 'correct' (right on the first try, no hint), 'correct-with-help', 'incorrect'.
// Score = exercises answered 'correct' / exercises in the lesson (first try only).
// Status: not-started -> in-progress -> completed -> mastered (score of 80% or more).

export const MASTERED_SCORE = 0.8;

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function answeredOf(entry) {
  const answered = entry?.answered;
  return typeof answered === 'object' && answered !== null && !Array.isArray(answered) ? answered : {};
}

export function emptyEntry() {
  return {
    status: 'not-started',
    answered: {},
    lastScore: null,
    bestScore: null,
    lastExerciseId: null,
    completedAt: null,
  };
}

// Fraction (0 to 1) of the lesson's exercises answered right on the first try.
export function scoreFromAnswered(answered, exerciseIds) {
  if (exerciseIds.length === 0) return 0;
  const correct = exerciseIds.filter((id) => hasOwn(answered, id) && answered[id] === 'correct').length;
  return correct / exerciseIds.length;
}

// Begins a fresh run of the lesson. Best score is kept.
export function startRun(entry) {
  return { ...emptyEntry(), ...entry, status: 'in-progress', answered: {}, lastExerciseId: null };
}

// Saves the result of one exercise. Completes the lesson when all are answered.
export function applyOutcome(entry, exerciseId, outcome, exerciseIds, now = new Date()) {
  const base = { ...emptyEntry(), ...entry };
  const answered = { ...answeredOf(base), [exerciseId]: outcome };
  const next = { ...base, answered, lastExerciseId: exerciseId, status: 'in-progress' };

  if (exerciseIds.every((id) => hasOwn(answered, id))) {
    const score = scoreFromAnswered(answered, exerciseIds);
    next.lastScore = score;
    next.bestScore = Math.max(base.bestScore ?? 0, score);
    next.status = score >= MASTERED_SCORE ? 'mastered' : 'completed';
    next.completedAt = now.toISOString();
  }
  return next;
}

// Exercise ids not answered yet in the current run, in lesson order.
export function unansweredIds(entry, exerciseIds) {
  const answered = answeredOf(entry);
  return exerciseIds.filter((id) => !hasOwn(answered, id));
}

// What to show in the lesson list.
export function lessonSummary(entry, exerciseIds) {
  const answered = answeredOf(entry);
  const answeredCount = exerciseIds.filter((id) => hasOwn(answered, id)).length;
  const total = exerciseIds.length;

  let status = entry?.status ?? 'not-started';
  // New exercises were added to a finished lesson, so it is not finished any more.
  if ((status === 'completed' || status === 'mastered') && answeredCount < total) status = 'in-progress';

  return {
    status,
    answeredCount,
    total,
    lastScore: entry?.lastScore ?? null,
    bestScore: entry?.bestScore ?? null,
  };
}
