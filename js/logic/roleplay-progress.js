// Saved roleplay results and the numbers for the dashboard. Pure functions.
//
// Saved shape: { results: { [scenarioId]: { runs, bestPercent, lastPercent, lastCounts, lastAt } },
//                log: [{ scenarioId, at, percent }] }   (log: newest last, at most MAX_LOG)
// A conversation that you leave in the middle is not saved.

export const MAX_LOG = 200;
export const STRONG_PERCENT = 80;

export const emptyRoleplay = () => ({ results: {}, log: [] });

// Adds one finished conversation. summary is the result of summarize() in roleplay.js.
export function applyRun(roleplay, scenarioId, summary, now = new Date()) {
  const old = roleplay.results[scenarioId];
  const at = now.toISOString();
  const results = {
    ...roleplay.results,
    [scenarioId]: {
      runs: (old?.runs ?? 0) + 1,
      bestPercent: Math.max(old?.bestPercent ?? 0, summary.percent),
      lastPercent: summary.percent,
      lastCounts: { best: summary.best, ok: summary.ok, weak: summary.weak },
      lastAt: at,
    },
  };
  const log = [...roleplay.log, { scenarioId, at, percent: summary.percent }].slice(-MAX_LOG);
  return { results, log };
}

// 'not-started' | 'done'
export function scenarioStatus(roleplay, scenarioId) {
  return (roleplay?.results?.[scenarioId]?.runs ?? 0) > 0 ? 'done' : 'not-started';
}

export function bestPercent(roleplay, scenarioId) {
  return roleplay?.results?.[scenarioId]?.bestPercent ?? null;
}

// done: scenarios played at least once;  strong: scenarios whose best result is 80% or more
export function roleplaySummary(roleplay, scenarios) {
  return {
    total: scenarios.length,
    done: scenarios.filter((s) => scenarioStatus(roleplay, s.id) === 'done').length,
    strong: scenarios.filter((s) => (bestPercent(roleplay, s.id) ?? -1) >= STRONG_PERCENT).length,
  };
}
