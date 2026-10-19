// Rules for saved writing: history entries, task status, and the numbers for the dashboard.
// Pure functions: they only read and return data.

export const RATINGS = ['needs-work', 'good', 'great'];
export const RATING_LABELS = { 'needs-work': 'Needs work', good: 'Good', great: 'Great' };
export const MAX_TEXT = 3000;       // characters in a draft or a saved text
export const MAX_NOTE = 300;
export const MAX_HISTORY = 200;     // saved attempts, oldest dropped first

export const emptyWriting = () => ({ drafts: {}, history: [] });

// One saved attempt. "result" is the output of checkWriting(); "checklist" is a list of true/false.
export function makeEntry({ taskId, text, result, checklist, rating, note }, now = new Date()) {
  return {
    id: `w_${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    taskId,
    text: String(text).slice(0, MAX_TEXT),
    wordCount: result.wordCount,
    checksPassed: result.passed,
    checksTotal: result.total,
    checklistDone: checklist.filter(Boolean).length,
    checklistTotal: checklist.length,
    rating: RATINGS.includes(rating) ? rating : null,
    note: String(note ?? '').slice(0, MAX_NOTE),
    at: now.toISOString(),
  };
}

// Saved attempts for one task, newest first.
export function historyFor(history, taskId) {
  return (history ?? []).filter((e) => e?.taskId === taskId).reverse();
}

// 'not-started' | 'draft' (text written, nothing saved) | 'done' (at least one saved attempt)
export function taskStatus(writing, taskId) {
  if (historyFor(writing?.history, taskId).length > 0) return 'done';
  const draft = writing?.drafts?.[taskId]?.text;
  return typeof draft === 'string' && draft.trim().length > 0 ? 'draft' : 'not-started';
}

// The rating of the newest saved attempt, or null.
export function latestRating(writing, taskId) {
  return historyFor(writing?.history, taskId)[0]?.rating ?? null;
}

// Numbers for the dashboard card.
//   done: tasks with at least one saved attempt;  great: tasks whose newest attempt is rated Great
export function writingSummary(writing, tasks) {
  return {
    total: tasks.length,
    done: tasks.filter((t) => taskStatus(writing, t.id) === 'done').length,
    great: tasks.filter((t) => latestRating(writing, t.id) === 'great').length,
  };
}
