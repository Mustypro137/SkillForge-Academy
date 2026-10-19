// The roleplay engine: how a conversation moves, how it is scored, and a check of the scenario data.
// Pure functions: no DOM, no storage. The scenarios are data in content/roleplay/.
//
// A scenario is a set of steps. Each step has:
//   say      - what the other person says (list of messages)
//   options  - 3 replies to choose from: { id, text, rating: 'best'|'ok'|'weak', feedback, reaction?, next }
//   write    - OR a free reply: { prompt, targetWords, checks, model: { text, why }, next }
//   end      - OR the end of the conversation (true)
// "reaction" is what the other person says right after that reply. "next" is the next step id.

export const RATINGS = ['best', 'ok', 'weak'];
export const RATING_LABELS = { best: 'Best', ok: 'OK', weak: 'Weak' };
export const POINTS = { best: 2, ok: 1, weak: 0 };

export function stepKind(step) {
  if (step.end === true) return 'end';
  if (step.write) return 'write';
  return 'choice';
}

// A fresh run at the start of a scenario.
export function createRun(scenario) {
  return { stepId: scenario.start, picks: [], writes: [] };
}

export function currentStep(scenario, run) {
  return scenario.steps[run.stepId];
}

export function isFinished(scenario, run) {
  return stepKind(currentStep(scenario, run)) === 'end';
}

// Takes a reply. Returns { run, option } with the next step already set. Does not change the old run.
export function choose(scenario, run, optionId) {
  const step = currentStep(scenario, run);
  const option = stepKind(step) === 'choice' ? step.options.find((o) => o.id === optionId) : null;
  if (!option) throw new Error(`No option "${optionId}" in step "${run.stepId}"`);
  const next = { ...run, stepId: option.next, picks: [...run.picks, { stepId: step.id, optionId, rating: option.rating }] };
  return { run: next, option };
}

// Finishes a free reply step. selfRating is your own rating ('needs-work', 'good' or 'great').
export function submitWrite(scenario, run, selfRating) {
  const step = currentStep(scenario, run);
  if (stepKind(step) !== 'write') throw new Error(`Step "${run.stepId}" is not a writing step`);
  return { ...run, stepId: step.write.next, writes: [...run.writes, { stepId: step.id, rating: selfRating }] };
}

export function bestOption(step) {
  return step.options.find((o) => o.rating === 'best');
}

// A new order each time, so you cannot learn "always pick the second one". rng gives a number from 0 to 1.
export function shuffle(list, rng = Math.random) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// The result of a finished run.
//   percent: points of your choices (best 2, ok 1, weak 0) out of the best possible
//   toImprove: the replies that were not Best, with the better reply
export function summarize(scenario, run) {
  const counts = { best: 0, ok: 0, weak: 0 };
  const toImprove = [];
  for (const pick of run.picks) {
    counts[pick.rating] += 1;
    if (pick.rating === 'best') continue;
    const step = scenario.steps[pick.stepId];
    const chosen = step.options.find((o) => o.id === pick.optionId);
    toImprove.push({
      stepId: step.id,
      heard: step.say[step.say.length - 1],
      rating: pick.rating,
      chosen: chosen.text,
      why: chosen.feedback,
      better: bestOption(step).text,
    });
  }
  const choices = run.picks.length;
  const points = counts.best * POINTS.best + counts.ok * POINTS.ok;
  return {
    ...counts,
    choices,
    points,
    percent: choices > 0 ? Math.round((points / (choices * POINTS.best)) * 100) : 0,
    toImprove,
    writes: run.writes,
  };
}

// Walks every path of a scenario and lists the problems (an empty list means the scenario is sound).
// Also returns how many paths there are and the fewest and most replies on a path.
export function analyzeScenario(scenario) {
  const problems = [];
  const steps = scenario.steps ?? {};
  const reached = new Set();
  const lengths = [];
  const need = (ok, message) => { if (!ok) problems.push(message); };

  need(scenario.steps && steps[scenario.start], `start step "${scenario.start}" does not exist`);
  for (const [key, step] of Object.entries(steps)) need(step.id === key, `step "${key}" has id "${step.id}"`);

  function walk(stepId, path, choices) {
    const step = steps[stepId];
    if (!step) { problems.push(`a reply points to "${stepId}", which does not exist`); return; }
    if (path.includes(stepId)) { problems.push(`step "${stepId}" is part of a loop`); return; }
    reached.add(stepId);
    need(Array.isArray(step.say) && step.say.length > 0 && step.say.every((s) => typeof s === 'string' && s.length > 0), `step "${stepId}" has no message`);
    const kind = stepKind(step);
    const here = [...path, stepId];

    if (kind === 'end') {
      need(!step.options && !step.write, `end step "${stepId}" must not have options`);
      lengths.push(choices);
    } else if (kind === 'write') {
      const w = step.write;
      need(w.prompt && w.targetWords?.min > 0 && w.targetWords.max > w.targetWords.min, `writing step "${stepId}" needs a prompt and targetWords`);
      need(w.model?.text && w.model?.why, `writing step "${stepId}" needs a model reply with a reason`);
      walk(w.next, here, choices);
    } else {
      const options = step.options ?? [];
      need(options.length >= 2, `step "${stepId}" needs at least 2 options`);
      need(options.some((o) => o.rating === 'best'), `step "${stepId}" has no Best option`);
      need(new Set(options.map((o) => o.id)).size === options.length, `step "${stepId}" has duplicate option ids`);
      for (const o of options) {
        const where = `option ${stepId}/${o.id}`;
        need(o.text && o.text.length > 0, `${where} has no text`);
        need(RATINGS.includes(o.rating), `${where} has a wrong rating`);
        need(o.feedback && o.feedback.length > 0, `${where} has no feedback`);
        walk(o.next, here, choices + 1);
      }
    }
  }
  if (steps[scenario.start]) walk(scenario.start, [], 0);

  for (const id of Object.keys(steps)) need(reached.has(id), `step "${id}" can never be reached`);
  return {
    problems: [...new Set(problems)],
    paths: lengths.length,
    minChoices: lengths.length ? Math.min(...lengths) : 0,
    maxChoices: lengths.length ? Math.max(...lengths) : 0,
  };
}
