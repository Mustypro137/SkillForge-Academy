import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createRun, currentStep, isFinished, choose, submitWrite, bestOption, shuffle, summarize, analyzeScenario, stepKind,
} from '../js/logic/roleplay.js';

// A small scenario: choice -> (weak goes to a clarifying step) -> write -> choice -> end
const scenario = {
  id: 'rp-test', start: 's1',
  steps: {
    s1: { id: 's1', say: ['Hello'], options: [
      { id: 'a', text: 'Best reply', rating: 'best', feedback: 'good', next: 's2' },
      { id: 'b', text: 'Weak reply', rating: 'weak', feedback: 'rude', next: 'w1' },
    ] },
    w1: { id: 'w1', say: ['Hmm?'], options: [
      { id: 'a', text: 'Fix it', rating: 'best', feedback: 'good', next: 's2' },
      { id: 'b', text: 'Ok-ish', rating: 'ok', feedback: 'vague', next: 's2' },
    ] },
    s2: { id: 's2', say: ['Write to me'], write: { prompt: 'Write', targetWords: { min: 1, max: 10 }, model: { text: 'Hi', why: 'short' }, next: 's3' } },
    s3: { id: 's3', say: ['Last question'], options: [
      { id: 'a', text: 'Yes', rating: 'best', feedback: 'good', next: 'end' },
      { id: 'b', text: 'Maybe', rating: 'ok', feedback: 'vague', next: 'end' },
    ] },
    end: { id: 'end', end: true, say: ['Bye'] },
  },
};

test('stepKind tells choice, write and end apart', () => {
  assert.deepEqual(['s1', 's2', 'end'].map((id) => stepKind(scenario.steps[id])), ['choice', 'write', 'end']);
});

test('a run starts at the first step with nothing picked', () => {
  const run = createRun(scenario);
  assert.equal(currentStep(scenario, run).id, 's1');
  assert.deepEqual([run.picks, run.writes], [[], []]);
  assert.equal(isFinished(scenario, run), false);
});

test('choose moves to the next step, records the pick, and does not change the old run', () => {
  const run = createRun(scenario);
  const { run: next, option } = choose(scenario, run, 'b');
  assert.equal(option.text, 'Weak reply');
  assert.equal(next.stepId, 'w1');
  assert.deepEqual(next.picks, [{ stepId: 's1', optionId: 'b', rating: 'weak' }]);
  assert.equal(run.stepId, 's1');
  assert.deepEqual(run.picks, []);
});

test('choose rejects an unknown option and a step that is not a choice', () => {
  assert.throws(() => choose(scenario, createRun(scenario), 'zzz'));
  assert.throws(() => choose(scenario, { stepId: 's2', picks: [], writes: [] }, 'a'));
});

test('submitWrite records your self-rating and moves on; it only works on a writing step', () => {
  const run = submitWrite(scenario, { stepId: 's2', picks: [], writes: [] }, 'good');
  assert.equal(run.stepId, 's3');
  assert.deepEqual(run.writes, [{ stepId: 's2', rating: 'good' }]);
  assert.throws(() => submitWrite(scenario, createRun(scenario), 'good'));
});

test('a whole run reaches the end, and the summary counts the replies', () => {
  let run = createRun(scenario);
  run = choose(scenario, run, 'b').run;      // weak
  run = choose(scenario, run, 'b').run;      // ok
  run = submitWrite(scenario, run, 'great');
  run = choose(scenario, run, 'a').run;      // best
  assert.equal(isFinished(scenario, run), true);
  const s = summarize(scenario, run);
  assert.deepEqual([s.best, s.ok, s.weak, s.choices], [1, 1, 1, 3]);
  assert.equal(s.points, 3);
  assert.equal(s.percent, 50);                // 3 of 6 points
  assert.deepEqual(s.writes, [{ stepId: 's2', rating: 'great' }]);
});

test('toImprove lists the replies that were not Best, with what was heard and the better reply', () => {
  let run = createRun(scenario);
  run = choose(scenario, run, 'b').run;
  const [item] = summarize(scenario, run).toImprove;
  assert.equal(item.heard, 'Hello');
  assert.equal(item.chosen, 'Weak reply');
  assert.equal(item.why, 'rude');
  assert.equal(item.better, 'Best reply');
  assert.equal(item.rating, 'weak');
});

test('all Best replies give 100%, all weak or ok replies give less, and no replies give 0', () => {
  let run = createRun(scenario);
  run = choose(scenario, run, 'a').run;
  run = submitWrite(scenario, run, 'good');
  run = choose(scenario, run, 'a').run;
  assert.equal(summarize(scenario, run).percent, 100);
  assert.equal(summarize(scenario, createRun(scenario)).percent, 0);
});

test('bestOption finds the Best reply', () => {
  assert.equal(bestOption(scenario.steps.w1).id, 'a');
});

test('shuffle keeps all items, does not change the original, and follows the random numbers', () => {
  const list = [1, 2, 3, 4, 5];
  const result = shuffle(list, () => 0);
  assert.deepEqual([...result].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(list, [1, 2, 3, 4, 5]);
  assert.notDeepEqual(result, list);
  let n = 0;
  assert.deepEqual(shuffle(list, () => (n += 0.19) % 1).length, 5);
});

test('analyzeScenario accepts a sound scenario and counts the paths', () => {
  const result = analyzeScenario(scenario);
  assert.deepEqual(result.problems, []);
  assert.equal(result.paths, 6);              // (a | b -> a | b) = 3 ways to the writing step, x 2 final choices
  assert.equal(result.minChoices, 2);
  assert.equal(result.maxChoices, 3);
});

test('analyzeScenario finds broken scenarios', () => {
  const copy = () => JSON.parse(JSON.stringify(scenario));
  const problemsOf = (change) => { const s = copy(); change(s); return analyzeScenario(s).problems.join(' | '); };

  assert.match(problemsOf((s) => { s.steps.s1.options[0].next = 'nowhere'; }), /nowhere/);
  assert.match(problemsOf((s) => { s.steps.s1.options[1].rating = 'great'; }), /wrong rating/);
  assert.match(problemsOf((s) => { delete s.steps.s1.options[0].feedback; }), /no feedback/);
  assert.match(problemsOf((s) => { s.steps.s1.options.forEach((o) => { if (o.rating === 'best') o.rating = 'ok'; }); }), /no Best option/);
  assert.match(problemsOf((s) => { s.steps.s3.options[0].next = 's1'; }), /loop/);
  assert.match(problemsOf((s) => { s.steps.extra = { id: 'extra', say: ['x'], end: true }; }), /can never be reached/);
  assert.match(problemsOf((s) => { s.steps.s1.options.length = 1; }), /at least 2 options/);
  assert.match(problemsOf((s) => { s.steps.s2.write.model = {}; }), /model reply/);
  assert.match(problemsOf((s) => { s.steps.s1.say = []; }), /no message/);
  assert.match(problemsOf((s) => { s.start = 'zzz'; }), /start step/);
});
